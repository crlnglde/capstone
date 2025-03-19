import React, { useEffect, useState } from "react";
import { useNavigate} from 'react-router-dom'; 
import axios from "axios";
import Papa from 'papaparse';
import moment from "moment";
import Modal from "../Modal";
import DAFAC from "../forms/DAFAC";
import "../../css/reusable/AffFam.css";

const ConAffFam = ({disBarangay, disCode}) => {
const [step, setStep] = useState(1);
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
    const totalPages = Math.ceil(residents.length / rowsPerPage);

    const [activeResident, setActiveResident] = useState(null);

    const handleBackClick = () => {

        if (step > 1) {
            setStep(step - 1);
            navigate("/disaster"); 
        } else {
            navigate(-1);  
        }
    };

        const handleResidentSelect = (resident) => {
            setActiveResident(resident); // Set the active resident
            handleOpenModal("dafac"); // Open the modal with "add" type
        };
       
        const handleOpenModal = (type) => {
            setModalType(type);
            setIsModalOpen(true);
        };

        const closeModal = () => setIsModalOpen(false);
    
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
    
    
        const handleNextClick = (e) => {
            e.preventDefault();
               
            // On first click, set isSubmitted to true to trigger validation
            setHasClickedNext(true);
    
            // Check if all required fields are filled
            const isValid = validateFields();
    
            if (isValid) {
                setStep(2);
            }
        };
    
    
        const handleDateChange = (e) => {
            setDate(e.target.value);
            if (hasClickedNext) {
                validateFields();
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

        const displayResidents = residents.slice(
            (currentPage - 1) * rowsPerPage,
            currentPage * rowsPerPage
          );
    
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
            const fetchAffectedFamilies = async (disCode, disBarangay) => {
                if (!disCode || !disBarangay) {
                    console.warn("No disaster code or barangay provided.");
                    return;
                }
        
                setIsLoading(true);
                setError(""); // Clear previous errors
        
                try {
                    const response = await fetch(`http://localhost:3003/get-disaster/${disCode}`);
                    const data = await response.json();
        
                    if (!data || !data.barangays) {
                        throw new Error("Invalid data received.");
                    }

                    function formatDate(datetime) {
                        const date = new Date(datetime); // Parse ISO string
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                        const day = String(date.getDate()).padStart(2, '0');
                        const hours = String(date.getHours()).padStart(2, '0'); // 24-hour format
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                    
                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                    }
        
                    setDisasterCode(data.disasterCode)
                    setDisasterStatus(data.disasterStatus)
                    setDisasterType(data.disasterType)
                    setDate(formatDate(data.disasterDateTime))


                    // Find the specific barangay
                    const barangay = data.barangays.find(b => b.name === disBarangay);
                    setSelectedBarangays(disBarangay) 
                    if (!barangay) {
                        console.log(`No residents found for barangay '${disBarangay}'`);
                        setResidents([]);
                        return;
                    }
        
                    // Set affected families from the selected barangay
                    setResidents(barangay.affectedFamilies || []);
        
                } catch (err) {
                    console.error("Error fetching residents:", err);
                    setError("Failed to fetch residents. Please try again.");
                } finally {
                    setIsLoading(false);
                }
            };
        
            if (disCode && disBarangay) {
                fetchAffectedFamilies(disCode, disBarangay);
            }
        }, [disCode, disBarangay]);    
    
        const handleFinalSubmit = async () => {
            const disasterData = JSON.parse(localStorage.getItem("disasterData")) || null;
            const residentData = JSON.parse(localStorage.getItem("savedForms")) || [];

            console.log("saved forms", residentData)
        
            if (!disasterData || residentData.length === 0) {
                alert("No data found in localStorage to save.");
                return;
            }
        
            try {
                // Fetch existing disaster data
                const checkResponse = await fetch(`http://localhost:3003/get-disaster/${disasterCode}`);
                const existingDisaster = await checkResponse.json();
            
                if (checkResponse.ok && existingDisaster) {
                    console.log("Existing Disaster Data:", existingDisaster);

                    const groupedByBarangay = residentData.reduce((acc, resident) => {
                        if (!acc[resident.barangay]) {
                            acc[resident.barangay] = [];
                        }
                        acc[resident.barangay].push(resident);
                        return acc;
                    }, {});
            
                    const updatedBarangays = existingDisaster.barangays.map(existingBarangay => {
                        const affectedFamilies = existingBarangay.affectedFamilies || []; // Ensure it's an array
            
                        if (groupedByBarangay[existingBarangay.name]) {
                            const newFamilies = groupedByBarangay[existingBarangay.name].map(newFamily => {
                                // Check if the family already exists
                                const existingFamilyIndex = affectedFamilies.findIndex(existingFamily =>
                                    existingFamily.firstName.trim().toLowerCase() === newFamily.firstName.trim().toLowerCase() &&
                                    existingFamily.lastName.trim().toLowerCase() === newFamily.lastName.trim().toLowerCase() &&
                                    existingFamily.bdate === newFamily.bdate
                                );
            
                                if (existingFamilyIndex !== -1) {
                                    // Family exists, update their data
                                    affectedFamilies[existingFamilyIndex] = { ...affectedFamilies[existingFamilyIndex], ...newFamily };
                                    return null; // Skip adding to new families since it's already updated
                                }
                                return newFamily; // Add only if it's new
                            }).filter(family => family !== null); // Remove null values (updated families)
            
                            console.log(`New Families for ${existingBarangay.name}:`, newFamilies);
            
                            return {
                                ...existingBarangay,
                                affectedFamilies: [...affectedFamilies, ...newFamilies], // Keep updated and new families
                            };
                        }
                        return existingBarangay;
                    });
            
                    console.log("Updated Barangays Data:", updatedBarangays);
            
                    // Send the updated barangays data to backend
                    const updateResponse = await fetch(`http://localhost:3003/update-disaster/${disasterCode}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ barangays: updatedBarangays }),
                    });
            
                    console.log("Update Response:", await updateResponse.json());
            
                    if (!updateResponse.ok) throw new Error("Failed to update disaster data.");
            
                    alert("Affected families updated successfully!");
                    localStorage.removeItem("savedForms");
                    localStorage.removeItem("disasterData");
                    closeModal();
                } else {
                    alert("Disaster not found!");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while saving data. Please try again.");
            }            
        };        


    const [searchQuery, setSearchQuery] = useState("");
    
    //for search
    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
        console.log("Search Query: ", query);
    };

  return (
    <div className="AddAffFam">

      <div className="AddAffFam-container">

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
                                    <th>Generate Form</th>
                                </tr>
                            </thead>
                            <tbody>

                                {displayResidents.length > 0 ? (
                                    displayResidents.map((resident, index) => (
                                        <tr key={resident.id}>
                                            <td>{disBarangay}</td>
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
                                                
                                            <button className="res-submit-btn"disabled={resident.dafacStatus === "Confirmed" || isResidentSaved(resident)} onClick={() => handleResidentSelect(resident)}>
                                                <i class="fa-solid fa-pen-to-square" ></i>
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

                        <button className="bgy-submit-btn" onClick={handleFinalSubmit}>
                            <i class="fa-solid fa-floppy-disk"></i>Submit
                        </button>

                    </div>

                    
                </div>
            )}
        </div>

      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalType === "dafac"}>
        {modalType === "dafac" && (
          <div>
            <DAFAC activeResident={activeResident} disasterData={JSON.parse(localStorage.getItem('disasterData'))} setIsModalOpen={setIsModalOpen} mode="edit"/> 
          </div>
        )}
      </Modal>
   
    </div>
  );
};

export default ConAffFam;
