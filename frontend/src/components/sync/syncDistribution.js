export const syncRDSData = async (setNotification) => {
    if (!navigator.onLine) return;
  
    const offlineDataRaw = JSON.parse(localStorage.getItem("offlineDistributions")) || [];
    const offlineData = offlineDataRaw.map(({ distributionId, families, ...rest }) => ({
      ...rest,
      families: families?.map(({ _id, ...familyRest }) => familyRest) || []
    }));
  
    try {
      // Sync newly created distributions
      if (offlineData.length > 0) {
        for (const distribution of offlineData) {
          await fetch(`${process.env.REACT_APP_API_URL}/save-distribution`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(distribution),
          });
        }
        localStorage.removeItem("offlineDistributions");
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
  