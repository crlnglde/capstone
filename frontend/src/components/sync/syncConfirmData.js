export async function syncConfirmData(setNotification) {
    const offlineUpdates = JSON.parse(localStorage.getItem("offlineDafacUpdates")) || [];
  
    for (const update of offlineUpdates) {
      try {
        const response = await fetch(
            `http://localhost:3003/update-dafac-status/${update.disCode}/${update.disBarangay}/${update.familyId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              }
            }
          );
    
          if (!response.ok) {
            throw new Error("Failed to sync update");
          }
      } catch (error) {
        console.error(`Failed to sync DAFAC update for family ${update.familyId}:`, error);
        // continue syncing others even if one fails
      }
    }

    setNotification({ type: "success", title: "Synced", message: "DAFAC data confirmed successfully" });
  
    // Remove only if you want — maybe you want to retry failed ones separately
    localStorage.removeItem("offlineDafacUpdates");
  }
  