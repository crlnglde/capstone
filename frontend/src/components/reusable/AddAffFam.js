import React, { useEffect, useState, useMemo } from "react";
import { useNavigate} from 'react-router-dom'; 
import axios from "axios";
import Papa from 'papaparse';
import moment from "moment";
import "../../css/reusable/AffFam.css";
import DAFAC from "../forms/DAFAC";
import Modal from "../Modal";
import Loading from "../again/Loading";
import Notification from "../again/Notif";
import ConfirmationDialog from "../again/Confirmation";

const AddAffFam = ({disBarangay, disCode, setStep}) => {

    const navigate = useNavigate();  

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("");

    const [disasterType, setDisasterType] = useState("");
    const [disasterCode, setDisasterCode] = useState("");
    const [disasterStatus, setDisasterStatus] = useState("");
    const [date, setDate] = useState("");
    const [selectedBarangays, setSelectedBarangays] = useState([]);


    const [activeBarangay, setActiveBarangay] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [hasClickedNext, setHasClickedNext] = useState(false);


    const [barangayData, setBarangayData] = useState({});// To store all collected data per barangay


    const [affectedFamilies, setAffectedFamilies] = useState([]);
    const [residents, setResidents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [currentPage, setCurrentPage] = useState(1); // State for current page
    const rowsPerPage = 10;
    const totalPages = Math.ceil(affectedFamilies.length / rowsPerPage);

    const [activeResident, setActiveResident] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");

    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null); 
    const [confirmDialog, setConfirmDialog] = useState({
        show: false,
        type: "",       // 'save', 'delete', 'add'
        title: "",
        message: "",
        onConfirm: null,
      });
    
      const handleCancelConfirm = () => {
        setConfirmDialog({ ...confirmDialog, show: false });
      };

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [D, setD] = useState([]);
    

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
      
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
      
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }, []);

      useEffect(() => {
        if (navigator.onLine) {
            syncData();
        }
    
        window.addEventListener('online', syncData);
        return () => window.removeEventListener('online', syncData);
        }, []);
    

       const closeModal = () => {
            setIsModalOpen(false); // Close modal
          };

        const handleResidentSelect = (resident) => {
            setActiveResident(resident); // Set the active resident
            handleOpenModal("dafac"); // Open the modal with "add" type
        };

       
        const handleOpenModal = (type) => {
            setModalType(type);
            setIsModalOpen(true);
        };
        
        

        const validateFields = () => {
            const missingFields = [];
    
    
            if (!disasterType) missingFields.push("Disaster Type");
            if (!date) missingFields.push("Date");
            if (selectedBarangays.length === 0) missingFields.push("at least one Barangay");
    
    
            if (missingFields.length > 0) {
                setErrorMessage(`Please fill all the fields: ${missingFields.join(", ")}`);
                return false;
            } else {
                setErrorMessage(""); // Clear error message if all fields are filled
                return true;
            }
        };

    
    
        const handleDateChange = (e) => {
            setDate(e.target.value);
            if (hasClickedNext) {
                validateFields();
            }
        };
    
        useEffect(() => {
            if (hasClickedNext) validateFields();
        }, [disasterType, date, selectedBarangays]);
        
    
        const isResidentSaved = (resident) => {
            const savedData = JSON.parse(localStorage.getItem("savedForms")) || [];
            
            return savedData.some(data => 
                data.firstName === resident.firstName &&
                data.middleName === resident.middleName &&
                data.lastName === resident.lastName &&
                data.barangay === resident.barangay &&
                data.purok === resident.purok
        );
        };

        useEffect(() => {
            const fetchResidents = async (barangay) => {
                setIsLoading(true);
                setError("");
        
                if (!barangay) {
                    console.error("Invalid barangay value:", barangay);
                    setIsLoading(false);
                    return;
                }

                const localData = localStorage.getItem("residents");

                // Use cached data immediately
                if (localData) {
                    try {
                        const parsed = JSON.parse(localData);
                        const cachedResidents = parsed.filter(resident => resident.barangay === barangay);
                        const activeResidents = cachedResidents.filter(resident => resident.status === "active");
                        setResidents(activeResidents);
                    } catch (e) {
                        console.error("Failed to parse cached residents:", e);
                    }
                }

                if(navigator.onLine) {
                    try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-brgyresidents?barangay=${barangay}`);
                    if (!response.data || response.data.length === 0) {
                        console.warn(`No residents found for '${barangay}'`);
                        setResidents([]);
                    } else {
                        const activeResidents = response.data.filter(resident => resident.status === "active");
                        setResidents(activeResidents);
                    }
                    } catch (err) {
                        console.error("Error fetching residents:", err);
                        setError("Failed to fetch residents. Please try again.");
                    } finally {
                        setIsLoading(false);
                    }
                }
            };
        
            if (disBarangay) {
                fetchResidents(disBarangay); // Pass disBarangay correctly
            }
        }, [disBarangay]); // Runs only when disBarangay changes  

        console.log(residents);
        
        useEffect(() => {
            const fetchAffectedFamilies = async () => {
                if (!disCode) return;
        
                setIsLoading(true);
                setError("");
        
                const formatDate = (datetime) => {
                    const date = new Date(datetime);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                };
        
                try {

                 if(navigator.onLine){
                    // Try fetching from the server
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-disaster/${disCode}`);
                    const disasterData = response.data;
        
                    setDisasterCode(disasterData.disasterCode);
                    setDisasterStatus(disasterData.disasterStatus);
                    setDisasterType(disasterData.disasterType);
                    setDate(formatDate(disasterData.disasterDateTime));
        
                    if (!disasterData?.barangays) {
                        setAffectedFamilies([]);
                        console.warn("No barangays data found.");
                        return;
                    }
        
                    const barangayData = disasterData.barangays.find(b => b.name === disBarangay);
                    setSelectedBarangays(barangayData?.name || "");
        
                    if (!barangayData?.affectedFamilies) {
                        setAffectedFamilies([]);
                        console.warn("No affected families found for this barangay.");
                        return;
                    }
        
                    setAffectedFamilies(barangayData.affectedFamilies);
                    }else{
                    // Try fallback to localStorage
                    const localData = localStorage.getItem("offlineDisaster")
                    const savedForms = localStorage.getItem("AffectedForms");
                    console.log("affected forms", savedForms)
                    
                    const dData = JSON.parse(localData);
                    console.log("offline", dData)
                    const savedFormData = JSON.parse(savedForms || "[]");
                    const disasterData = dData.find(d => d.disasterCode === disCode);
                    console.log("saved form", savedFormData)
                    console.log("offline disasters", disasterData)

                    
                    if (disasterData) {
                        console.log("disasterData", disasterData)

                        try {
                            if (!disasterData) {
                                console.warn("Disaster not found in local cache.");
                                setAffectedFamilies([]);
                                return;
                            }

                            setDisasterCode(disasterData.disasterCode);
                            setDisasterStatus(disasterData.disasterStatus);
                            setDisasterType(disasterData.disasterType);
                            setDate(formatDate(disasterData.disasterDateTime));
        
                            const barangayData = disasterData.barangays?.find(b => b.name === disBarangay);
                            setSelectedBarangays(barangayData?.name || "");
                            console.log("barangay data", barangayData)
        
                            let residentsList = barangayData?.affectedFamilies || [];

                            console.log(disCode)
                            console.log(disBarangay)
                            const unsyncedResidents = savedFormData.filter(form =>
                                form.disasterCode === disCode && form.barangay === disBarangay
                            );

                            console.log(unsyncedResidents)

                            if (unsyncedResidents.length > 0) {
                                console.log("Including unsynced residents from savedform:", unsyncedResidents);
                                // Optional: Mark unsynced entries for UI feedback
                                const flaggedUnsynced = unsyncedResidents.map(u => ({ ...u, unsynced: true }));
                                residentsList = [...residentsList, ...flaggedUnsynced];
                            }

                            if (residentsList.length === 0) {
                                console.warn("No affected families found for this barangay in offline data.");
                            }
        
                            setAffectedFamilies(residentsList);
                        } catch (parseErr) {
                            console.error("Failed to parse offline data:", parseErr);
                            setError("No usable offline data available.");
                            setAffectedFamilies([]);
                        }
                    } else {
                        console.warn("No offline data found.");
                        setAffectedFamilies([]);
                    }
                }
                    
                } catch (err) {
                    console.error("Unexpected error:", err);
                    setError("An error occurred while loading data.");
                } finally {
                    setIsLoading(false);
                }
            };
        
            fetchAffectedFamilies();
        }, [disCode, disBarangay]);

        console.log(affectedFamilies)
        
        
        useEffect(() => {
            // Store all disaster information including the unique disaster code
            const disasterData = {
                disasterCode,
                disasterStatus,
                disasterType,
                date,
                selectedBarangays
            };
            localStorage.setItem('disasterData', JSON.stringify(disasterData));  // Store all relevant data
            console.log('Disaster Data saved to localStorage:', disasterData);
        }, [disasterCode, disasterType, date, selectedBarangays]);

        const syncData = async () => {
            const disasterData = JSON.parse(localStorage.getItem("disasterData"));
            const residentData = JSON.parse(localStorage.getItem("savedForms")) || [];
        
            if (!disasterData || residentData.length === 0) return;
        
            try {
                const { disasterCode } = disasterData;
        
                const groupedByBarangay = residentData.reduce((acc, resident) => {
                    const barangay = resident.barangay || "Unknown Barangay";
                    if (!acc[barangay]) acc[barangay] = [];
                    acc[barangay].push(resident);
                    return acc;
                }, {});
        
                const checkResponse = await fetch(`${process.env.REACT_APP_API_URL}/get-disaster/${disasterCode}`);
                const existingDisaster = await checkResponse.json();
        
                if (!checkResponse.ok) throw new Error("Failed to fetch disaster data");
        
                const updatedBarangays = existingDisaster.barangays.map(existingBarangay => {
                    const newFamilies = groupedByBarangay[existingBarangay.name]?.filter(newFamily =>
                        !existingBarangay.affectedFamilies.some(existingFamily =>
                            existingFamily.firstName === newFamily.firstName &&
                            existingFamily.lastName === newFamily.lastName &&
                            existingFamily.bdate === newFamily.bdate
                        )
                    ) || [];
        
                    return {
                        ...existingBarangay,
                        affectedFamilies: [...existingBarangay.affectedFamilies, ...newFamilies]
                    };
                });
        
                const updateResponse = await fetch(`${process.env.REACT_APP_API_URL}/update-disaster/${disasterCode}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ barangays: updatedBarangays }),
                });
        
                if (!updateResponse.ok) throw new Error("Failed to update disaster data");
        
                localStorage.removeItem("savedForms");
                localStorage.removeItem("disasterData");
        
                setNotification({ type: "success", title: "Saved", message: "Data saved successfully." });
        
                setTimeout(() => {
                    setNotification(null);
                    setStep(1); // Redirect to step 1
                    setLoading(false); // Stop loading
                }, 2000); 

            } catch (error) {
                console.error("Sync failed:", error);
                setNotification({ type: "error", title: "Sync Failed", message: error.message });
            }
        };
        
    
        const handleFinalSubmit = () => {

            setConfirmDialog({
                show: true,
                type: "confirm", // or customize this type for your dialog styling
                title: "Submit Forms",
                message: "Are you sure you want to submit the forms?",
                onConfirm: async () => {
                    if (navigator.onLine) {
                        syncData();
                    } else {
                        const residentData = JSON.parse(localStorage.getItem("savedForms")) || [];
                    
                        const updatedForms = residentData.map(form => ({
                            ...form,
                            disasterCode: disasterCode, // make sure disasterCode is available
                        }));
                    
                        // Get all offline disasters
                        const disasterData = JSON.parse(localStorage.getItem("offlineDisasterData")) || [];
                    
                        const disasterIndex = disasterData.findIndex(d => d.disasterCode === disasterCode);
                        console.log("offline index", disasterIndex)
        
                        if (disasterIndex !== -1) {
                            // Disaster exists
                            const existingDisaster = disasterData[disasterIndex];
                    
                            // For each updated form, find the correct barangay and add to affectedFamilies
                            residentData.forEach(form => {
                                const barangayIndex = existingDisaster.barangays.findIndex(b => b.name === form.barangay);
                                if (barangayIndex !== -1) {
                                    existingDisaster.barangays[barangayIndex].affectedFamilies.push(form);
                                } else {
                                    // If barangay not found, you can optionally create it
                                    existingDisaster.barangays.push({
                                        name: form.barangay,
                                        affectedFamilies: [form]
                                    });
                                }
                            });
                    
                            // Update the disaster back in the array
                            disasterData[disasterIndex] = existingDisaster;
                    
                            // Save back to localStorage
                            localStorage.setItem("offlineDisasterData", JSON.stringify(disasterData));
                    
                            // Clear saved forms
                            localStorage.removeItem("savedForms");
                    
                            setNotification({ type: "info", title: "Offline", message: "You're offline. Data saved locally and will sync when you're back online." });
                            setTimeout(() => {
                                setNotification(null);
                                setStep(1);
                                setLoading(false);
                            }, 2000);
                    
                        } else {
                            // Disaster doesn't exist - continue your original behavior
                            const existing = JSON.parse(localStorage.getItem("AffectedForms") || "[]");
        
                            console.log("existing", existing)
                            console.log("updated", updatedForms)
                    
                            const combined = [...existing, ...updatedForms];
        
                            console.log("combined", combined)
                    
                            localStorage.setItem("AffectedForms", JSON.stringify(combined));
                            localStorage.removeItem("savedForms");
                    
                            setNotification({ type: "info", title: "Offline", message: "You're offline. Data saved locally and will sync when you're back online." });
                            setTimeout(() => {
                                setNotification(null);
                                setStep(1);
                                setLoading(false);
                            }, 2000);
                        }
        
                        window.location.reload();
                    }    
                }
            })        
        };

        //search
        const handleSearchChange = (event) => {
            const query = event.target.value.trim().toLowerCase();
            setSearchQuery(query);
            console.log("Search Query: ", query); // Debugging the query
          };

        const filteredResidents = useMemo(() => {
            return residents.filter((resident) => {
                const excludeColumns = []; // Add column names here if you want to exclude specific fields
        
                // Construct a full name string for searching
                const fullName = `${resident.firstName} ${resident.middleName} ${resident.lastName}`.toLowerCase();
                // Check if any dependent's name includes the search query
                const hasMatchingDependent = resident.dependents?.some((dependent) => 
                    dependent.name.toLowerCase().includes(searchQuery)
                );
    
                return (
                    fullName.includes(searchQuery) || // Match full name
                    hasMatchingDependent || // Match dependent names
                    Object.keys(resident).some((key) => {
                        if (!excludeColumns.includes(key)) {
                            const value = resident[key];
                            return value && value.toString().toLowerCase().includes(searchQuery);
                        }
                        return false;
                    })
                );
            });
        }, [residents, searchQuery]);    

        //Page ni
        const handleNext = () => {
            if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
            }
        };
    
        const handlePrev = () => {
            if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            }
        };

        // Slice the sorted disasters for pagination
        const displayResidents = filteredResidents.slice(
            (currentPage - 1) * rowsPerPage,
            currentPage * rowsPerPage
          );

          console.log("displayed", displayResidents)
        
  return (
    <div className="AddAffFam">

      <div className="AddAffFam-container">
      
      {loading && <Loading />}  {/* Show loading spinner */}
      
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}  // Close notification when user clicks ✖
        />
      )}

        {confirmDialog.show && (
            <ConfirmationDialog
              type={confirmDialog.type}
              title={confirmDialog.title}
              message={confirmDialog.message}
              onConfirm={confirmDialog.onConfirm}
              onCancel={handleCancelConfirm}
            />
          )}

        <div className="afffam-residents-table">

        <div className="upper">
            <div className="barangay-buttons">
                <button
                className={`barangay-button ${activeBarangay === disBarangay ? 'active' : ''}`}
                //onClick={() => handleBarangayClick(disBarangay)}
                >
                    {disBarangay}
                </button>
            </div>

            <div className="dstr-search">
                <div className="dstr-search-container">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    onChange={handleSearchChange} 
                    className="search-bar"
                  />
                </div>
            </div>
        </div>
        
            {disBarangay && (
                <div>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : residents.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                <th>Barangay</th>
                                    <th>Purok</th>
                                    <th>Family Head</th>
                                    <th>Age</th>
                                    <th>Sex</th>
                                    <th>Occupation</th>
                                    <th>Contact No.</th>
                                    <th>Education</th>
                                    <th>Dependents</th>
                                    <th>Answer</th>
                                </tr>
                            </thead>
                            <tbody>

                                {displayResidents.length > 0 ? (
                                    displayResidents.map((resident, index) => (
                                        <tr key={resident.id}>
                                            <td>{resident.barangay}</td>
                                            <td>{resident.purok}</td>
                                            <td>{resident.firstName} {resident.middleName} {resident.lastName}</td> 
                                            <td>{resident.age}</td> 
                                            <td>{resident.sex}</td> 
                                            <td>{resident.occupation}</td>
                                            <td>{resident.phone}</td> 
                                            <td>{resident.education || "Not Provided"}</td> 
                                            <td>
                                                {resident.dependents && resident.dependents.length > 0
                                                ? resident.dependents.map((dependent, depIndex) => (
                                                    <div key={depIndex}>
                                                        {dependent.name}
                                                    </div>
                                                    ))
                                                : "No dependents"}
                                            </td> {/* Dependents information */}
                                            <td>

                                            <button 
                                                className="res-submit-btn" 
                                                onClick={() => handleResidentSelect(resident)}
                                                disabled={affectedFamilies.some(family => family.id === resident.memId) || isResidentSaved(resident)}
                                            >
                                                 {affectedFamilies.some(family => family.id === resident.memId) || isResidentSaved(resident) ? (
                                                    <i className="fa-solid fa-check-circle"></i>
                                                ) : (
                                                    <i className="fa-solid fa-pen-to-square"></i> 
                                                )}

                                            </button>

                                            </td>

                                        </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="6">No residents found.</td>
                                    </tr>
                                  )}
                            </tbody>
                        </table>
                    ) : (
                        <p>No residents found for {activeBarangay}.</p>
                    )}

                    <div className="res-button-container">
                    <button 
                        className="nav-button prev" 
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                    >
                        <i className="fa-solid fa-angle-left"></i>
                    </button>

                    <button 
                        className="nav-button next" 
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                    >
                        <i className="fa-solid fa-angle-right"></i>
                    </button>
                    </div>


                    {/*new*/}
                    <div className="dstr-bgay-btn">

                        <button className="bgy-submit-btn" onClick={handleFinalSubmit} >
                            <i class="fa-solid fa-floppy-disk"></i>Submit
                        </button>

                    </div>

                    
                </div>
            )}
        </div>

      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="">
        {modalType === "dafac" && (
          <div>
             <DAFAC activeResident={activeResident} disasterData={JSON.parse(localStorage.getItem('disasterData'))} setIsModalOpen={setIsModalOpen} mode="add"/> 
          </div>
        )}
      </Modal>

    </div>
  );
};

export default AddAffFam;