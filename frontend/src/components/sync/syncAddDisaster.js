export const syncDisasterData = async (setNotification) => {
    const disasterData = JSON.parse(localStorage.getItem("offlineDisasterData")) || [];

    if (disasterData.length === 0) return;

    try {
        const { disasterCode, disasterType, disasterStatus, disasterDateTime, barangays } = disasterData[0];

        const checkResponse = await fetch(`${process.env.REACT_APP_API_URL}/get-disaster/${disasterCode}`);
        const existingDisaster = await checkResponse.json();
    
        if (checkResponse.ok && existingDisaster) {
            // Disaster exists, update affected families
            const updatedBarangays = [...existingDisaster.barangays];

            barangays.forEach(newBarangay => {
                const existingBarangay = updatedBarangays.find(b => b.name === newBarangay.name);
            
                if (existingBarangay) {
                    const newFamilies = newBarangay.affectedFamilies.filter(newFamily => 
                        !existingBarangay.affectedFamilies.some(existingFamily => existingFamily.id === newFamily.id)
                    );
                    existingBarangay.affectedFamilies.push(...newFamilies);
                } else {
                    updatedBarangays.push(newBarangay);
                }
            });
            
                console.log("hehe")
            const updateResponse = await fetch(`${process.env.REACT_APP_API_URL}/update-disaster/${disasterCode}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ barangays: updatedBarangays })
            });

            if (!updateResponse.ok) throw new Error("Failed to update disaster data.");

            setNotification({ type: "success", title: "Success", message: "Disaster data updated successfully!" });

        } else {

            console.log("haha")
            // Disaster does not exist, create new disaster
            const disasterDocument = {
                disasterCode,
                disasterType,
                disasterStatus,
                disasterDateTime: new Date(disasterDateTime),
                barangays
            };            

            const createResponse = await fetch(`${process.env.REACT_APP_API_URL}/add-disaster`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(disasterDocument)
            });

            if (!createResponse.ok) throw new Error("Failed to save data.");
            setNotification({ type: "success", title: "Success", message: "New disaster record created successfully!" });
        }

        localStorage.removeItem("offlineDisasterData");

    } catch (error) {
        console.error("Sync failed:", error);
        if (setNotification) {
            setNotification({ type: "error", title: "Sync Failed", message: error.message });
        }
    }
};
