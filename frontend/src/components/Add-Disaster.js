import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom'; 
import axios from "axios";

import "../css/Add-Disaster.css";
import DstrGif from "../pic/disaster.gif"
import DAFAC from "./forms/DAFAC";
import Loading from "./again/Loading";
import Notification from "./again/Notif";

const disasterTypeMapping = {
    "Typhoon": "D1",
    "Fire Incident": "D2",
    "Earthquake": "D3",
    "Flood": "D4",
    "Landslide": "D5"
  };

const AddDisaster = () => {
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


    const [residents, setResidents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [currentPage, setCurrentPage] = useState(1); // State for current page
    const rowsPerPage = 10;
    const totalPages = Math.ceil(residents.length / rowsPerPage);

    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null); 

    //new
    const generateDisasterCode = (type, date) => {
        console.log(date)
        if (!(date instanceof Date)) {
            date = new Date(date); // Convert string to Date object
        }
        if (isNaN(date.getTime())) {
            console.error("Invalid date:", date);
            return "Invalid-Date";
        }
    
        const prefix = disasterTypeMapping[type] || "DX"; // Default to DX if type is unknown
        const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}${date.getFullYear()}`;
        return `${prefix}-${formattedDate}`;
    };
    //new
    const [activeResident, setActiveResident] = useState(null);

    const handleResidentSelect = (resident) => {
        setActiveResident(resident); // Set the active resident
        handleOpenModal("add"); // Open the modal with "add" type
    };
   
    const handleOpenModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => setIsModalOpen(false);

    const handleBackClick = () => {
   
        if (step > 1) {
            setStep(step - 1);
            localStorage.removeItem("savedForms");
        } else {
            navigate(-1);  
            localStorage.removeItem("disasterData");
        }
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

    const handleDisasterTypeChange = (e) => {
        setDisasterType(e.target.value);
        setDisasterStatus("Current")
        if (hasClickedNext) {
            validateFields();
        }
    };

    const handleDateChange = (e) => {
        setDate(e.target.value);
        setDisasterCode(generateDisasterCode(disasterType, e.target.value));
        if (hasClickedNext) {
            validateFields();
        }
    };
    {/** 
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;

        setSelectedBarangays((prev) => {
            const updatedSelections = checked 
                ? [...prev, value]  // Add if checked
                : prev.filter((barangay) => barangay !== value);  // Remove if unchecked
    
            console.log("Updated selectedbarangays:", updatedSelections);
            return updatedSelections;
        });
        if (hasClickedNext) {
            validateFields();
        }
    };
    */}

    useEffect(() => {
        if (selectedBarangays) {
            setActiveBarangay(selectedBarangays);
            fetchResidents(selectedBarangays); // Automatically fetch residents
        }
    }, [selectedBarangays]);

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
        localStorage.setItem('disasterData', JSON.stringify(disasterData));  // Store all relevant data
        console.log('Disaster Data saved to localStorage:', disasterData);
    }, [disasterCode, disasterType, date, selectedBarangays]);


    // Save selected barangays to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('selectedBarangays', JSON.stringify(selectedBarangays));
    }, [selectedBarangays]);


    useEffect(() => {
        if (hasClickedNext) validateFields();
    }, [disasterType, date, selectedBarangays]);

    const syncData = async () => {
        // Retrieve disasterData and residentData from localStorage
        const disasterData = JSON.parse(localStorage.getItem("disasterData")) || null;
        const residentData = JSON.parse(localStorage.getItem("savedForms")) || [];
   
        if (!disasterData || residentData.length === 0) {
            setNotification({ type: "error", title: "Error", message: "No data found in localStorage to save." });
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        if (!disasterData){
            setNotification({ type: "error", title: "Error", message: "No data found in localStorage to save." });
            setTimeout(() => setNotification(null), 3000);
            return;
        }
        setLoading(true);

        try {
            const { disasterCode, disasterStatus, disasterType, date } = disasterData;
            
            const barangayName = disasterData.selectedBarangays || "Unknown Barangay";

            {/*const groupedByBarangay = {
                [barangayName]: residentData.filter(res => res.barangay === barangayName)
            };
            
            // Prepare barangays array
            let barangays = Object.entries(groupedByBarangay).map(([barangayName, residents]) => ({
                name: barangayName,
                affectedFamilies: [],
            }));*/}

             // Group resident data by barangay
             const groupedByBarangay = residentData.reduce((acc, resident) => {
                const barangay = resident.barangay || "Unknown Barangay";
                if (!acc[barangay]) {
                    acc[barangay] = [];
                }
                acc[barangay].push(resident);
                return acc;
            }, {});
            
            // Prepare barangays array
            let barangays = Object.entries(groupedByBarangay).map(([barangayName, residents]) => ({
                name: barangayName,
                affectedFamilies: residents.map(resident => ({
                    id: resident.id,
                    firstName: resident.firstName,
                    middleName: resident.middleName || "",
                    lastName: resident.lastName,
                    age: resident.age,
                    sex: resident.sex,
                    phone: resident.phone,
                    bdate: resident.bdate,
                    occupation: resident.occupation || "",
                    education: resident.education || "",
                    income: resident.income || 0,
                    purok: resident.purok,
                    dependents: resident.dependents || [],
                    is4ps: resident.is4ps || false,
                    isPWD: resident.isPWD || false,
                    isPreg: resident.isPreg || false,
                    isSenior: resident.isSenior || false,
                    isIps: resident.isIps || false,
                    isSolo: resident.isSolo || false,
                    numFam: resident.numFam || 0,
                    evacuation: resident.evacuation || "",
                    extentDamage: resident.extentDamage || "",
                    occupancy: resident.occupancy || "",
                    costDamage: resident.costDamage || 0,
                    casualty: resident.casualty || [],
                    regDate: resident.regDate || "",
                    dafacStatus: resident.dafacStatus || "",
                })),
            }));

            console.log("Barangays",barangays);
    
            // Check if disaster already exists
            const checkResponse = await fetch(`http://localhost:3003/get-disaster/${disasterCode}`);
            const existingDisaster = await checkResponse.json();
    
            if (checkResponse.ok && existingDisaster) {
                // Disaster exists, update affected families
                const updatedBarangays = [...existingDisaster.barangays];
    
                barangays.forEach(newBarangay => {
                    const existingBarangay = updatedBarangays.find(b => b.name === newBarangay.name);
                    if (existingBarangay) {
                        existingBarangay.affectedFamilies.push(...newBarangay.affectedFamilies);
                    } else {
                        updatedBarangays.push(newBarangay);
                    }
                });
                    console.log("hehe")
                const updateResponse = await fetch(`http://localhost:3003/update-disaster/${disasterCode}`, {
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
                    disasterDateTime: new Date(date),
                    barangays
                };
    
                const createResponse = await fetch("http://localhost:3003/add-disaster", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(disasterDocument)
                });
    
                if (!createResponse.ok) throw new Error("Failed to save data.");
                setNotification({ type: "success", title: "Success", message: "New disaster record created successfully!" });
            }
    
            localStorage.removeItem("savedForms");
            localStorage.removeItem("disasterData");

            setTimeout(() => {
                setNotification(null);
                setLoading(false); 
                navigate("/disaster");
            }, 1000); 

        } catch (error) {
            setNotification({ type: "error", title: "Error Occurred", message: error.message || "An error occurred while saving data. Please try again."});
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setLoading(false);
        }
    };

     //modified
     const handleFinalSubmit = async (e) => {
        e.preventDefault();

        // On first click, set isSubmitted to true to trigger validation
        setHasClickedNext(true);

        // Check if all required fields are filled
        const isValid = validateFields();
        if (!isValid) {
            setNotification({ type: "error", title: "Invalid Form", message: "Please fill out all required fields before submitting." });
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        const confirmSubmit = window.confirm("Are you sure you want to record new disaster?");
        if (!confirmSubmit) return;

        if(navigator.onLine){
            syncData();
        } else{
            // Retrieve disasterData and residentData from localStorage
            const disasterData = JSON.parse(localStorage.getItem("disasterData")) || null;
            const residentData = JSON.parse(localStorage.getItem("savedForms")) || [];

        }
    };    

    const Step1 = (
        <form className="add-form" onSubmit={handleNextClick}>


            <div className="add-form-h2">
                <h2>Disaster Information</h2>
            </div>
           
            <div className="dstr-rows">


                <div className="dstr-cols1">
                    <div className="dstr-image-container">
                        <img src={DstrGif} alt="Disaster Animation" className="gif-image" />
                    
                        <div className="ad-text-overlay">
                            <h2>Stay Prepared!</h2>
                            <p>Always be ready for the unexpected.</p>
                        </div>
                    </div>
                </div>


                <div className="dstr-cols2">


                    <div className="dstr-pop-form">
                        <div className="dstr-form-group">
                            <div className="dstr-input-group">
                                <span className="icon"><i className="fa-solid fa-hurricane"></i></span>
                               
                                <select
                                    id="disaster-select" value={disasterType}
                                    onChange={handleDisasterTypeChange} required
                                >
                                {/** modified */}
                                <option value="" disabled selected>Disaster Type</option>
                                <option value="Typhoon">Typhoon</option>
                                <option value="Fire Incident">Fire Incident</option>
                                <option value="Earthquake">Earthquake</option>
                                <option value="Flood">Flood</option>
                                <option value="Landslide">Landslide</option>
                                </select>
                            </div>
                        </div>


                        <div className="dstr-form-group">
                            <div className="dstr-input-group">
                                <span className="icon"><i className="fa-regular fa-calendar-days"></i></span>
                               
                                <input
                                    type="datetime-local"
                                    placeholder="Date and Time"
                                    value={date}
                                    onChange={handleDateChange}
                                    required
                                    max={new Date().toISOString().split("T")[0] + "T23:59"} // Allows selection up to today 11:59 PM
                                />

                            </div>
                        </div>
                    </div>


                    <div className="dstr-pop-form1">


                        <div className="dstr-form-group">
                       
                            <div className="ig">
                                <span className="icon"><i className="fa-solid fa-location-dot"></i></span>
                                <label  htmlFor="barangay-select">Barangay (Affected Areas)</label>
                            </div>


                            <div className="bgy-input-group">
                                <div className="checkbox-group">
                                    {[
                                    'Abuno', 'Acmac-Mariano Badelles Sr.', 'Bagong Silang', 'Bonbonon', 'Bunawan', 'Buru-un', 'Dalipuga',
                                    'Del Carmen', 'Digkilaan', 'Ditucalan', 'Dulag', 'Hinaplanon', 'Hindang', 'Kabacsanan', 'Kalilangan',
                                    'Kiwalan', 'Lanipao', 'Luinab', 'Mahayahay', 'Mainit', 'Mandulog', 'Maria Cristina', 'Pala-o',
                                    'Panoroganan', 'Poblacion', 'Puga-an', 'Rogongon', 'San Miguel', 'San Roque', 'Santa Elena',
                                    'Santa Filomena', 'Santiago', 'Santo Rosario', 'Saray', 'Suarez', 'Tambacan', 'Tibanga', 'Tipanoy',
                                    'Tomas L. Cabili (Tominobo Proper)', 'Upper Tominobo', 'Tubod', 'Ubaldo Laya', 'Upper Hinaplanon',
                                    'Villa Verde'
                                    ].map((barangay) => (
                                    <div key={barangay} className="checkbox-item">
                                        <input
                                        type="checkbox"
                                        id={barangay.replace(/\s+/g, '-').toLowerCase()}
                                        name="barangay"
                                        value={barangay}
                                        checked={selectedBarangays.includes(barangay)} // Check if barangay is selected
                                        onChange={() => setSelectedBarangays(barangay)}// Handle change
                                        />
                                        <label htmlFor={barangay.replace(/\s+/g, '-').toLowerCase()}>{barangay}</label>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>


                    {errorMessage && <p className="error-message">{errorMessage}</p>}


                    <div className="dstr-btn">
                        <button type="submit" className="dstr-submit-btn">
                        Next
                        </button>
                    </div>


                </div>
            </div>
       
        </form>
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

      const [searchQuery, setSearchQuery] = useState("");
      
      //for search
        const handleSearchChange = (event) => {
            const query = event.target.value.toLowerCase();
            setSearchQuery(query);
            console.log("Search Query: ", query);
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

    const Step2 = (
        <div className="residents-table">
            <div className="barangay-buttons">
                    <button
                        className={`barangay-button ${selectedBarangays === activeBarangay ? 'active' : ''}`}
                    >
                        {selectedBarangays}
                    </button>
               { /** 
                {selectedBarangays.map((barangay, index) => (
                    <button
                        key={index}
                        className={`barangay-button ${barangay === activeBarangay ? 'active' : ''}`}
                        onClick={() => handleBarangayClick(barangay)}
                    >
                        {barangay}
                    </button>
                ))}
                */}

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


            {activeBarangay && (
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
                                                
                                            <button className="res-submit-btn" onClick={() => handleResidentSelect(resident)}  disabled={isResidentSaved(resident)}>
                                                <i class="fa-solid fa-pen-to-square"></i>
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
     );
     
    //kulang ug active barangay na man retrieve ang residents dri
    // Fetch residents from the database sakto nani
    const fetchResidents = async (barangay) => {
        if (!barangay) {
            console.warn("No barangay provided for fetching residents.");
            return; // Early exit if no barangay is active
        }
   
        setIsLoading(true);
        setError(""); // Clear previous errors
       
        console.log(barangay);

        if(navigator.onLine){
            try {
                const response = await axios.get(`http://localhost:3003/get-brgyresidents?barangay=${barangay}`);
                if (response.data.length === 0) {
                    console.log(`No residents found for '${barangay}'`);
                }
       
                console.log("Residents fetched successfully:", response.data);
                setResidents(response.data);
            } catch (err) {
                console.error("Error fetching residents:", err);
                setError("Failed to fetch residents. Please try again.");
            } finally {
                setIsLoading(false);
            }
        } else{
            const localData = localStorage.getItem('residents');

            let residentData=[];
    
            if (localData) {
              const residentsData = JSON.parse(localData);

              residentData = residentsData.filter(resident =>
                resident.barangay === barangay
              );

              console.log("residents", residentData)
            }

            setResidents(residentData)
            setIsLoading(false);
        }
    };
   
    useEffect(() => {
        if (activeBarangay) {
            (async () => {
                await fetchResidents(activeBarangay);
            })();
        }   

        console.log(residents)
    }, [activeBarangay]);
    
    //remove
     // Function to handle form submission in the modal
     const handleFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);


        const data = {
            familiesInsideECs: formData.get("familiesInsideECs"),
            maleCount: Number(formData.get("maleCount")) || 0,
            femaleCount: Number(formData.get("femaleCount")) || 0,
            pregnantWomen: Number(formData.get("pregnantWomen")) || 0,
            lactatingMothers: Number(formData.get("lactatingMothers")) || 0,
            pwds: Number(formData.get("pwds")) || 0,
            soloParents: Number(formData.get("soloParents")) || 0,
            indigenousPeoples: Number(formData.get("indigenousPeoples")) || 0,
            idpsPlaceOfOrigin: formData.get("idpsPlaceOfOrigin") || "",
            fniServicesNeeded: formData.get("fniServicesNeeded") || "",
            campManagerContact: formData.get("campManagerContact") || "",
        };


        setBarangayData((prev) => ({
            ...prev,
            [activeBarangay]: data
        }));


        handleCloseModal();
    };
   

    //new
    //magstore sa affected sa data sa each barangay
    const handleFamilySubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
   
        // Collect form data
        const newFamilyData = {
            familyId: e.target.familyId?.value || "", // Family ID
            barangay: e.target.barangay?.value || "", // Family ID
            familiesInsideECs: e.target.familiesInsideECs?.value || "no", // Yes or No
            sexBreakdown: {
                male: Number(e.target.maleCount?.value || 0), // Male count
                female: Number(e.target.femaleCount?.value || 0), // Female count
            },
            pregnantWomen: Number(e.target.pregnantWomen?.value || 0), // Pregnant women count
            lactatingMothers: Number(e.target.lactatingMothers?.value || 0), // Lactating mothers count
            pwds: Number(e.target.pwds?.value || 0), // PWD count
            soloParents: Number(e.target.soloParents?.value || 0), // Solo parents count
            indigenousPeoples: Number(e.target.indigenousPeoples?.value || 0), // Indigenous Peoples count
            campManagerContact: e.target.contactNumber?.value || "", // Contact number
            servicesNeeded: e.target.fniServicesNeeded?.value || "", // Services needed
        };
   
        // Retrieve existing data from localStorage, default to an empty array if no data exists
        const existingData = JSON.parse(localStorage.getItem("residentData")) || [];
   
        if (!Array.isArray(existingData)) {
            console.error("Invalid data format in localStorage: resetting to an empty array.");
            localStorage.setItem("residentData", JSON.stringify([])); // Reset invalid data
            return;
        }
   
        // Add the new family data to the existing array
        const updatedData = [...existingData, newFamilyData];
   
        // Save the updated data back to localStorage
        localStorage.setItem("residentData", JSON.stringify(updatedData));
   
        console.log("Updated family data:", updatedData);
        setNotification({
            type: "success",
            title: "Success",
            message: "Family information saved successfully!",
        });
   
        setTimeout(() => {
            setNotification(null);
            handleCloseModal(); // Close the modal (if defined)
        }, 3000);
    };
   
    //new
    const savedData = JSON.parse(localStorage.getItem('residentData'));
        if (savedData) {
            console.log("Retrieved resident data from localStorage:", savedData);
        } else {
            console.log("No resident data found in localStorage.");
        }


  return (
    <div className="dstr-dashboard">

    {loading && <Loading />}  {/* Show loading spinner */}
      
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}  // Close notification when user clicks ✖
        />
      )}


        <div className="dash-btn">

            <button className="add-disaster" onClick={handleBackClick}>
            <i className="fa-solid fa-chevron-left"></i>
            Back
            </button>
            
        </div>

        <div className="dstr-dashboard-container">
            
            {step === 1 ? Step1 : Step2}

        </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="modal-area">
                            <button className="modal-close-btn" onClick={handleCloseModal}>
                                ×
                            </button>

                            {modalType === "add" && (
                                <div >  
                                    <DAFAC activeResident={activeResident} disasterData={JSON.parse(localStorage.getItem('disasterData'))} setIsModalOpen={setIsModalOpen} mode="add"/> 
                                    
                                </div>
                            )}
                        </div>
                        
                    </div>
                </div>
            )}
    
    </div>
  );
};

export default AddDisaster;
