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
        
                try {
                    const response = await axios.get(`http://192.168.1.127:3003/get-brgyresidents?barangay=${barangay}`);
                    if (!response.data || response.data.length === 0) {
                        console.warn(`No residents found for '${barangay}'`);
                        setResidents([]);
                    } else {
                        setResidents(response.data);
                    }
                } catch (err) {
                    console.error("Error fetching residents:", err);
                    setError("Failed to fetch residents. Please try again.");
                } finally {
                    setIsLoading(false);
                }
            };
        
            if (disBarangay) {
                fetchResidents(disBarangay); // Pass disBarangay correctly
            }
        }, [disBarangay]); // Runs only when disBarangay changes  
        
        useEffect(() => {
            const fetchAffectedFamilies = async () => {
                if (!disCode) return; // Ensure disasterCode is available
        
                setIsLoading(true);
                setError("");
        
                try {
                    const response = await axios.get(`http://192.168.1.127:3003/get-disaster/${disCode}`);
                    const disasterData = response.data;

                    function formatDate(datetime) {
                        const date = new Date(datetime); // Parse ISO string
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                        const day = String(date.getDate()).padStart(2, '0');
                        const hours = String(date.getHours()).padStart(2, '0'); // 24-hour format
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                    
                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                    }
        
                    setDisasterCode(disasterData.disasterCode)
                    setDisasterStatus(disasterData.disasterStatus)
                    setDisasterType(disasterData.disasterType)
                    setDate(formatDate(disasterData.disasterDateTime))

                    if (!disasterData || !disasterData.barangays) {
                        console.warn("No barangays data found.");
                        setAffectedFamilies([]);
                        return;
                    }
        
                    // Find the specified barangay
                    const barangayData = disasterData.barangays.find(b => b.name === disBarangay);

                    setSelectedBarangays(barangayData.name) 
        
                    if (!barangayData || !barangayData.affectedFamilies) {
                        console.warn("No affected families found for this barangay.");
                        setAffectedFamilies([]);
                        return;
                    }
        
                    // Extract affected families
                    setAffectedFamilies(barangayData.affectedFamilies);
        
                } catch (err) {
                    console.error("Error fetching affected families:", err);
                    setError("Failed to fetch affected families. Please try again.");
                } finally {
                    setIsLoading(false);
                }
            };
        
            fetchAffectedFamilies();
        }, [disCode, disBarangay]);         
        
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
    
        const handleFinalSubmit = async () => {

            const confirmSubmit = window.confirm("Are you sure you want to submit the forms?");
            if (!confirmSubmit) return;

            const disasterData = JSON.parse(localStorage.getItem("disasterData")) || null;
            const residentData = JSON.parse(localStorage.getItem("savedForms")) || [];
        
            if (!disasterData || residentData.length === 0) {
                setNotification({ type: "error", title: "Error", message: "No data found in localStorage to save." });
                return;
            }
            setLoading(true); 

            try {
                await new Promise((resolve) => setTimeout(resolve, 2000));

                const { disasterCode } = disasterData;
        
                // Group resident data by barangay
                const groupedByBarangay = residentData.reduce((acc, resident) => {
                    const barangay = resident.barangay || "Unknown Barangay";
                    if (!acc[barangay]) acc[barangay] = [];
                    acc[barangay].push(resident);
                    return acc;
                }, {});
        
                // Fetch existing disaster data
                const checkResponse = await fetch(`http://192.168.1.127:3003/get-disaster/${disasterCode}`);
                const existingDisaster = await checkResponse.json();
        
                if (checkResponse.ok && existingDisaster) {
                    const updatedBarangays = existingDisaster.barangays.map(existingBarangay => {
                        if (groupedByBarangay[existingBarangay.name]) {
                            // Append new families only if they don't already exist
                            const newFamilies = groupedByBarangay[existingBarangay.name].filter(newFamily =>
                                !existingBarangay.affectedFamilies.some(existingFamily =>
                                    existingFamily.firstName === newFamily.firstName &&
                                    existingFamily.lastName === newFamily.lastName &&
                                    existingFamily.bdate === newFamily.bdate
                                )
                            );
                            return { ...existingBarangay, affectedFamilies: [...existingBarangay.affectedFamilies, ...newFamilies] };
                        }
                        return existingBarangay;
                    });
        
                    const updateResponse = await fetch(`http://192.168.1.127:3003/update-disaster/${disasterCode}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ barangays: updatedBarangays }),
                    });
        
                    if (!updateResponse.ok) throw new Error("Failed to update disaster data.");

                    setNotification({ type: "success", title: "Success", message: "Affected families updated successfully!" });
                    localStorage.removeItem("savedForms");
                    localStorage.removeItem("disasterData");
                    
                    setTimeout(() => {
                        setNotification(null);
                        setStep(1); // Redirect to step 1
                        setLoading(false); // Stop loading
                    }, 2000); 
                    
                } else {
                    let errorTitle = "Error";
                    let errorMessage = "An error occurred while saving data. Please try again.";
                  
                    if (!error.response) {
                      errorTitle = "Network Error";
                      errorMessage = "Please check your internet connection and try again.";
                    } else if (error.response.status === 400) {
                      errorTitle = "Invalid Data";
                      errorMessage = "There is an issue with the provided data. Please check and try again.";
                    } else if (error.response.status === 401 || error.response.status === 403) {
                      errorTitle = "Unauthorized Access";
                      errorMessage = "You do not have permission to perform this action.";
                    } else if (error.response.status === 500) {
                      errorTitle = "Server Error";
                      errorMessage = "An error occurred on the server. Please try again later.";
                    } else if (error.message.includes("Failed to update disaster data")) {
                      errorTitle = "Update Failed";
                      errorMessage = "An error occurred while updating the disaster data. Please try again.";
                    }
                  
                    setNotification({ 
                      type: "error", 
                      title: errorTitle, 
                      message: errorMessage 
                    });
                  
                      setTimeout(() => {
                        setNotification(null);
                        setLoading(false); 
                      }, 3000);
                }
            } catch (error) {
                setNotification({ type: "error", title: "Error", message: "An error occurred while saving data. Please try again." });
                setTimeout(() => {
                    setNotification(null);
                    setLoading(false);
                }, 2000);
            }
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