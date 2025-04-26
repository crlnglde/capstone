export const syncEditedData = async (setNotification) => {
    if (!navigator.onLine) return;
    const editedData = JSON.parse(localStorage.getItem("editedDistributions")) || [];
  
    try {
      // Sync edited distributions
      if (editedData.length > 0) {
        for (const distribution of editedData) {
          await fetch(`http://localhost:3003/update-distribution/${distribution.distributionId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ families: distribution.families }),
          });
        }
        localStorage.removeItem("editedDistributions");
        if (setNotification) {
            setNotification({
              type: "success",
              title: "Synced",
              message: "Offline and edited data synced successfully.",
            });
          }else{
            if (setNotification) {
                setNotification({
                  type: "error",
                  title: "Sync Failed",
                  message: "Offline data failed to sync. Please try again later.",
                });
              }
          }
      }
    } catch (error) {
      console.error("Failed to sync offline data:", error);
      if (setNotification) {
        setNotification({
          type: "error",
          title: "Sync Failed",
          message: "Offline data failed to sync. Please try again later.",
        });
      }
    }
  };
  