export const syncDAFACData = async (setNotification) => {
    const disasterData = JSON.parse(localStorage.getItem("disasterData"));
    const residentData = JSON.parse(localStorage.getItem("AffectedForms")) || [];

    if (!disasterData || residentData.length === 0) return;

    try {
        const { disasterCode } = disasterData;

        const groupedByBarangay = residentData.reduce((acc, resident) => {
            const barangay = resident.barangay || "Unknown Barangay";
            if (!acc[barangay]) acc[barangay] = [];
            acc[barangay].push(resident);
            return acc;
        }, {});

        const checkResponse = await fetch(`http://localhost:3003/get-disaster/${disasterCode}`);
        const existingDisaster = await checkResponse.json();

        if (!checkResponse.ok) throw new Error("Failed to fetch disaster data");

        const updatedBarangays = existingDisaster.barangays.map(existingBarangay => {
            const updatedFamilies = [...existingBarangay.affectedFamilies];
            const offlineFamilies = groupedByBarangay[existingBarangay.name] || [];

            offlineFamilies.forEach(offlineFamily => {
                const index = updatedFamilies.findIndex(existingFamily =>
                    existingFamily.firstName === offlineFamily.firstName &&
                    existingFamily.lastName === offlineFamily.lastName &&
                    existingFamily.bdate === offlineFamily.bdate &&
                    existingFamily.barangay === offlineFamily.barangay
                );

                // Create a version without disasterCode
                const { disasterCode, ...cleanedFamily } = offlineFamily;

                if (index !== -1) {
                    const existing = updatedFamilies[index];
                    const isEdited = Object.keys(cleanedFamily).some(
                        key => cleanedFamily[key] !== existing[key]
                    );

                    if (isEdited) {
                        updatedFamilies[index] = { ...existing, ...cleanedFamily };
                    }
                } else {
                    updatedFamilies.push(cleanedFamily);
                }
            });

            return {
                ...existingBarangay,
                affectedFamilies: updatedFamilies
            };
        });

        const updateResponse = await fetch(`http://localhost:3003/update-disaster/${disasterCode}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ barangays: updatedBarangays }),
        });

        const result = await updateResponse.json();

        if (!updateResponse.ok) {
            console.error("Backend error:", result);
            throw new Error(result.message || "Failed to update disaster data");
        }

        localStorage.removeItem("AffectedForms");
        localStorage.removeItem("disasterData");

        if (setNotification) {
            setNotification({ type: "success", title: "Synced", message: "Offline data synced successfully." });
        }

    } catch (error) {
        console.error("Sync failed:", error);
        if (setNotification) {
            setNotification({ type: "error", title: "Sync Failed", message: error.message });
        }
    }
};
