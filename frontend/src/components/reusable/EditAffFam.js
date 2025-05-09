import React, { useEffect, useState, useMemo } from "react";
import { useNavigate} from 'react-router-dom'; 
import axios from "axios";
import Papa from 'papaparse';
import moment from "moment";
import Modal from "../Modal";
import DAFAC from "../forms/DAFAC";
import "../../css/reusable/AffFam.css";
import Loading from "../again/Loading";
import Notification from "../again/Notif";
import ConfirmationDialog from "../again/Confirmation";
import Pagination from "../again/Pagination";

const EditAffFam = ({disBarangay, disCode, setStep}) => {

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
    const rowsPerPage = 5;
    const totalPages = Math.ceil(residents.length / rowsPerPage);

    const [activeResident, setActiveResident] = useState(null);

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

        const handleResidentSelect = (resident) => {
            setActiveResident(resident); // Set the active resident
            handleOpenModal("dafac"); // Open the modal with "add" type
        };
       
        const handleOpenModal = (type) => {
            setModalType(type);
            setIsModalOpen(true);
        };

        const closeModal = () => {
            setIsModalOpen(false); // Close modal
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
    
    
    // Load saved selections from localStorage on component mount
        //modified
        useEffect(() => {
            // Store all disaster information including the unique disaster code
            const disasterData = {
                disasterCode,
                disasterStatus,
                disasterType,
                date,
                selectedBarangays
            };
            localStorage.setItem('disasterData', JSON.stringify(disasterData));
        }, [disasterCode, disasterType, date, selectedBarangays]);
    
    
        // Save selected barangays to localStorage whenever they change
        useEffect(() => {
            localStorage.setItem('selectedBarangays', JSON.stringify(selectedBarangays));
        }, [selectedBarangays]);
    
    
        useEffect(() => {
            if (hasClickedNext) validateFields();
        }, [disasterType, date, selectedBarangays]);

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
                        setResidents([]);
                        console.warn("No barangays data found.");
                        return;
                    }
        
                    const barangayData = disasterData.barangays.find(b => b.name === disBarangay);
                    setSelectedBarangays(barangayData?.name || "");
        
                    if (!barangayData?.affectedFamilies) {
                        setResidents([]);
                        console.warn("No affected families found for this barangay.");
                        return;
                    }
        
                    setResidents(barangayData.affectedFamilies);
                    }else{
                    // Try fallback to localStorage
                    const localData = localStorage.getItem("offlineDisaster")
                    const savedForms = localStorage.getItem("AffectedForms");

                    const dData = JSON.parse(localData);
                    const savedFormData = JSON.parse(savedForms || "[]");

                    const disasterData = dData.find(d => d.disasterCode === disCode);

                    
                    if (disasterData) {
                        console.log("disasterData", disasterData)

                        try {
                            if (!disasterData) {
                                console.warn("Disaster not found in local cache.");
                                setResidents([]);
                                return;
                            }

                            setDisasterCode(disasterData.disasterCode);
                            setDisasterStatus(disasterData.disasterStatus);
                            setDisasterType(disasterData.disasterType);
                            setDate(formatDate(disasterData.disasterDateTime));
        
                            const barangayData = disasterData.barangays?.find(b => b.name === disBarangay);
                            setSelectedBarangays(barangayData?.name || "");
        
                            let residentsList = barangayData?.affectedFamilies || [];

                            const unsyncedResidents = savedFormData.filter(form =>
                                form.disasterCode === disCode && form.barangay === disBarangay
                            );

                            if (unsyncedResidents.length > 0) {
                                console.log("Including unsynced residents from savedform:", unsyncedResidents);
                                // Optional: Mark unsynced entries for UI feedback
                                const flaggedUnsynced = unsyncedResidents.map(u => ({ ...u, unsynced: true }));
                                residentsList = [...residentsList, ...flaggedUnsynced];
                            }

                            if (residentsList.length === 0) {
                                console.warn("No affected families found for this barangay in offline data.");
                            }
        
                            setResidents(residentsList);
                        } catch (parseErr) {
                            console.error("Failed to parse offline data:", parseErr);
                            setError("No usable offline data available.");
                            setResidents([]);
                        }
                    } else {
                        console.warn("No offline data found.");
                        setResidents([]);
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
    
        const syncData = async () => {
            console.log("haha")
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
                    const affectedFamilies = existingBarangay.affectedFamilies || [];
        
                    const newFamilies = groupedByBarangay[existingBarangay.name]?.map(newFamily => {
                        const index = affectedFamilies.findIndex(existingFamily =>
                            existingFamily.firstName.trim().toLowerCase() === newFamily.firstName.trim().toLowerCase() &&
                            existingFamily.lastName.trim().toLowerCase() === newFamily.lastName.trim().toLowerCase() &&
                            existingFamily.bdate === newFamily.bdate
                        );
        
                        if (index !== -1) {
                            affectedFamilies[index] = { ...affectedFamilies[index], ...newFamily };
                            return null;
                        }
        
                        return newFamily;
                    }).filter(Boolean) || [];
        
                    return {
                        ...existingBarangay,
                        affectedFamilies: [...affectedFamilies, ...newFamilies]
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
                    setStep(1);
                    setLoading(false);
                }, 2000);
        
            } catch (error) {
                console.error("Sync failed:", error);
                setNotification({ type: "error", title: "Sync Failed", message: error.message });
            }
        };
        
        const handleFinalSubmit = () => {
            setConfirmDialog({
                show: true,
                type: "submit", // or "confirm" depending on your modal design
                title: "Confirm Submission",
                message: "Are you sure you want to submit the forms?",
                onConfirm: () => {
                    const disasterData = JSON.parse(localStorage.getItem("disasterData"));
                    const disasterCode = disasterData?.disasterCode;
                    setLoading(true);
                
                    if (navigator.onLine) {
                        //console.log("hihi")
                        syncData();
                    } else {
                        const savedForms = JSON.parse(localStorage.getItem("savedForms") || "[]");
                        const offlineDisasterData = JSON.parse(localStorage.getItem("offlineDisasterData") || "[]");
                        let affectedForms = JSON.parse(localStorage.getItem("AffectedForms") || "[]");

                        savedForms.forEach(newForm => {
                            let formUpdated = false;

                            // 1. Check inside OfflineDisasterData -> barangays -> affectedFamilies
                            for (let disaster of offlineDisasterData) {
                                for (let barangay of disaster.barangays || []) {
                                    const familyIndex = barangay.affectedFamilies?.findIndex(existingForm =>
                                        existingForm.firstName.trim().toLowerCase() === newForm.firstName.trim().toLowerCase() &&
                                        existingForm.lastName.trim().toLowerCase() === newForm.lastName.trim().toLowerCase() &&
                                        existingForm.bdate === newForm.bdate &&
                                        barangay.name.trim().toLowerCase() === newForm.barangay?.trim().toLowerCase()
                                    );

                                    if (familyIndex !== -1) {
                                        // Update the form inside affectedFamilies
                                        barangay.affectedFamilies[familyIndex] = { ...barangay.affectedFamilies[familyIndex], ...newForm };
                                        formUpdated = true;
                                        break; // Stop after finding and updating
                                    }
                                }
                                if (formUpdated) break; // Stop searching disasters once updated
                            }

                            if (formUpdated){
                                //console.log("hehe")
                            }

                            if (!formUpdated) {
                                // 2. Check inside AffectedForms
                                const index = affectedForms.findIndex(existingForm =>
                                    existingForm.firstName.trim().toLowerCase() === newForm.firstName.trim().toLowerCase() &&
                                    existingForm.lastName.trim().toLowerCase() === newForm.lastName.trim().toLowerCase() &&
                                    existingForm.bdate === newForm.bdate &&
                                    existingForm.barangay?.trim().toLowerCase() === newForm.barangay?.trim().toLowerCase()
                                );

                                if (index !== -1) {
                                    // Update the form inside AffectedForms
                                    affectedForms[index] = { ...affectedForms[index], ...newForm };
                                } else {
                                    // 3. If not found anywhere, add as new to AffectedForms
                                    affectedForms.push(newForm);
                                }
                            }
                        });

                        // Save back updated data
                        localStorage.setItem("offlineDisasterData", JSON.stringify(offlineDisasterData));
                        localStorage.setItem("AffectedForms", JSON.stringify(affectedForms));

                        // Clear the temporary saved forms
                        localStorage.removeItem("savedForms");

                        setNotification({
                            type: "info",
                            title: "Offline",
                            message: "You're offline. Data updated locally and will sync when you're back online."
                        });

                        setTimeout(() => {
                            setNotification(null);
                            setStep(1);
                            setLoading(false);
                        }, 2000);
                        window.location.reload();
                    }
                }
            })  
        };


    const [searchQuery, setSearchQuery] = useState("");
    
    //for search
    const handleSearchChange = (event) => {
        const query = event.target.value.trim().toLowerCase();
        setSearchQuery(query);
        //console.log("Search Query: ", query);
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
    
      // Slice the sorted disasters for pagination
      const displayResidents = filteredResidents.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      );

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
                        Barangay {disBarangay}
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
                                    <th>Purok</th>
                                    <th>Family Head</th>
                                    <th>Age</th>
                                    <th>Sex</th>
                                    <th>Occupation</th>
                                    <th>Contact No.</th>
                                    <th>Education</th>
                                    <th>Dependents</th>
                                    <th>Edit DAFAC Form</th>
                                </tr>
                            </thead>
                            <tbody>

                                {displayResidents.length > 0 ? (
                                    displayResidents.map((resident, index) => (
                                        <tr key={resident.id}>
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
                                                
                                            <button className="res-submit-btn"disabled={resident.dafacStatus === "Confirmed"} onClick={() => handleResidentSelect(resident)}>
                                                <i className="fa-solid fa-pen-to-square" ></i>
                                            </button>
                                            </td>
                                        </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="9">No record found.</td>
                                    </tr>
                                  )}
                            </tbody>
                        </table>
                    ) : (
                        <p>No affected families available to edit.</p>
                    )}

                    <div className="res-button-container">
                        {totalPages > 1 && (
                            <div className="pagination-wrapper">
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </div>
                        )}
                    </div>


                    {/*new*/}
                    <div className="dstr-bgay-btn">

                        <button className="bgy-submit-btn" onClick={handleFinalSubmit}>
                            <i className="fa-solid fa-floppy-disk"></i>Submit
                        </button>

                    </div>

                    
                </div>
            )}
        </div>

      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="">
        {modalType === "dafac" && (
          <div>
            <DAFAC activeResident={activeResident} disasterData={JSON.parse(localStorage.getItem('disasterData'))} setIsModalOpen={setIsModalOpen} mode="edit"/> 
          </div>
        )}
      </Modal>
   
    </div>
  );
};

export default EditAffFam;
