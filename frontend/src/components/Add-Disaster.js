import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; 

import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc, setDoc, doc  } from "firebase/firestore";


import "../css/Add-Disaster.css";
import DstrGif from "../pic/disaster.gif"

const AddDisaster = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();  


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("");


    const [disasterType, setDisasterType] = useState("");
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


    //new
    const [disasterCode] = useState(`D-${Date.now()}`);
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
        } else {
            navigate(-1);  
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
        if (hasClickedNext) {
            validateFields();
        }
    };

    const handleDateChange = (e) => {
        setDate(e.target.value);
        if (hasClickedNext) {
            validateFields();
        }
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;


        if (checked) {
            setSelectedBarangays((prev) => [...prev, value]); // Add to selected list
        } else {
            setSelectedBarangays((prev) => prev.filter((barangay) => barangay !== value)); // Remove from selected list
        }
        if (hasClickedNext) {
            validateFields();
        }
    };

    const handleBarangayClick = (barangay) => {
        console.log(`Barangay clicked: ${barangay}`);
   
        if (barangay === activeBarangay) {
            setActiveBarangay(null); // Deselect the active barangay
            fetchResidents(barangay);
        } else {
            setActiveBarangay(barangay); // Set the clicked barangay as active
            fetchResidents(barangay); // Fetch residents for the active barangay
        }
    };

// Load saved selections from localStorage on component mount
    //modified
    useEffect(() => {
        // Store all disaster information including the unique disaster code
        const disasterData = {
            disasterCode,
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

    const Step1 = (
        <form className="add-form">


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
                                    type="date" placeholder="Date" value={date}
                                    onChange={handleDateChange} required
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
                                        onChange={handleCheckboxChange} // Handle change
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
                        <button type="submit" className="dstr-submit-btn" onClick={handleNextClick}>
                        Next
                        </button>
                    </div>


                </div>
            </div>
       
        </form>
    );

     //modified
     const handleFinalSubmit = async () => {
        // Retrieve disasterData and residentData from localStorage
        const disasterData = JSON.parse(localStorage.getItem("disasterData")) || null;
        const residentData = JSON.parse(localStorage.getItem("residentData")) || [];
   
        if (!disasterData || residentData.length === 0) {
            alert("No data found in localStorage to save.");
            return;
        }
   
        try {
   
            // Extract other disaster-related fields from disasterData
            const { disasterCode, disasterType, date } = disasterData;

            // Group residentData by Barangay
            const groupedByBarangay = residentData.reduce((acc, resident) => {
                const barangay = resident.brgy || "Unknown Barangay";
                if (!acc[barangay]) {
                    acc[barangay] = [];
                }
                acc[barangay].push(resident);
                return acc;
            }, {});


            // Loop through each barangay and save its data
            for (const barangayName in groupedByBarangay) {
                const barangayResidents = groupedByBarangay[barangayName];
   
                // Calculate summary information for this barangay
                let affectedFamilies = barangayResidents.length;
                let affectedPersons = 0;
                let familiesInEC = 0;
                let sexBreakdown = { male: 0, female: 0 };
                let pregnantWomen = 0;
                let lactatingMothers = 0;
                let pwds = 0;
                let soloParents = 0;
                let indigenousPeoples = 0;
                let assistanceNeeded = [];
                let contact = `09${Math.floor(100000000 + Math.random() * 900000000)}`; // Generate random contact number
   
                barangayResidents.forEach((resident) => {
                    affectedPersons += resident.sexBreakdown.male + resident.sexBreakdown.female;
                    sexBreakdown.male += resident.sexBreakdown.male || 0;
                    sexBreakdown.female += resident.sexBreakdown.female || 0;
                    if (resident.familiesInsideECs === "yes") familiesInEC += 1;
                    pregnantWomen += resident.pregnantWomen || 0;
                    lactatingMothers += resident.lactatingMothers || 0;
                    pwds += resident.pwds || 0;
                    soloParents += resident.soloParents || 0;
                    indigenousPeoples += resident.indigenousPeoples || 0;
                    if (resident.servicesNeeded) assistanceNeeded.push(resident.servicesNeeded);
                });
                const sexBreakdownSummary = `Male: ${sexBreakdown.male}, Female: ${sexBreakdown.female}`;
                console.log("sex breakdown", sexBreakdownSummary )
                // Prepare the document structure for the barangay collection
                const barangayDocument = {
                    DisasterCode: disasterCode,
                    DisasterType: disasterType,
                    DisasterDate: date,
                    Residents: barangayResidents, // Save resident data for the barangay
                };
   
                // Save detailed data to the Barangay collection
                const barangayCollectionRef = collection(db, barangayName);
                const disasterDocRef = doc(barangayCollectionRef, disasterCode);
                await setDoc(disasterDocRef, barangayDocument);
   
                // Prepare summary data for the data collection
                const barangaySummaryData = {
                    disasterCode,
                    disasterDate: date,
                    disasterType,
                    barangays: barangayName,
                    affectedFamilies,
                    affectedPersons,
                    familiesInEC,
                    sexBreakdown: sexBreakdownSummary,
                    pregnantWomen,
                    lactatingMothers,
                    pwds,
                    soloParents,
                    indigenousPeoples,
                    assistanceNeeded: [...new Set(assistanceNeeded)].join(", "), // Remove duplicates
                    contact,
                };
   
                // Save the summary data for this barangay to the `data` collection
                const dataDocRef = doc(collection(db, "disasters"), `${disasterCode}-${barangayName}`);
                await setDoc(dataDocRef, barangaySummaryData);
            }


            alert("All data has been successfully stored in the database!");
   
            // Clear localStorage (optional)
            localStorage.removeItem("residentData");
        } catch (error) {
            console.error("Error saving data to database:", error);
            alert("An error occurred while saving data. Please try again.");
        }
    };

    const displayResidents = residents.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      );

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

    const Step2 = (
        <div className="residents-table">
            <div className="barangay-buttons">
                {selectedBarangays.map((barangay, index) => (
                    <button
                        key={index}
                        className={`barangay-button ${barangay === activeBarangay ? 'active' : ''}`}
                        onClick={() => handleBarangayClick(barangay)}
                    >
                        {barangay}
                    </button>
                ))}
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
                                    <th>Occupation</th>
                                    <th>Contact No.</th>
                                    <th>Family Members</th>
                                    <th>Answer</th>
                                </tr>
                            </thead>
                            <tbody>

                                {displayResidents.length > 0 ? (
                                    displayResidents.map((resident, index) => (
                                        <tr key={resident.id}>
                                        <td>{resident.Barangay}</td>
                                        <td>{resident.Purok}</td>
                                        <td>{resident.FamilyHead}</td>
                                        <td>{resident.Occupation}</td>
                                        <td>{resident.ContactNumber}</td>
                                        <td>{Array.isArray(resident.FamilyMembers) ? resident.FamilyMembers.join(", ") : "No family members"}</td>


                                        <td>
                                            
                                        <button className="res-submit-btn" onClick={() => handleResidentSelect(resident)}>
                                            <i className="fa-solid fa-pen-to-square"></i>
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
        try {
            const q = query(collection(db, "bgy-Residents"), where("Barangay", "==", barangay));
            const querySnapshot = await getDocs(q);
   
            if (querySnapshot.empty) {
                console.log(`No residents found for '${barangay}'`);
                setError(`No residents found for '${barangay}'`);
                return;
            }
   
            const residentsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
   
            console.log("Residents fetched successfully:", residentsData);
            setResidents(residentsData);
        } catch (err) {
            console.error("Error fetching residents:", err);
            setError("Failed to fetch residents. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
   
    useEffect(() => {
        if (activeBarangay) {
            const a= fetchResidents(activeBarangay);
            console.log(a);
        }
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
            brgy: e.target.brgy?.value || "", // Family ID
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
        alert("Family information saved successfully!");
   
        // Optional: Reset the form or close the modal
        handleCloseModal();
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
                        <button className="modal-close-btn" onClick={handleCloseModal}>
                            ×
                        </button>

                        {modalType === "add" && (
                            <div >

                                <div className="modal-h2">
                                    <h2>Resident Status</h2>
                                </div>
                                
                                <form className="add-form" onSubmit={handleFamilySubmit}>
                                   

                                    {/*barangay-purok */}
                                    <div className="dstr-bgy-pop-form">
                                        
                                        <div className="form-group">
                                        <label>Family ID</label>
                                            <div className="dstr-bgy-input-group">
                                                <span className="icon"><i className="fa-solid fa-location-dot"></i></span>
                                                <input type="text" placeholder="ID" name="familyId" value={activeResident.id} readOnly/>

                                            </div>
                                        </div>

                                        
                                        <div className="form-group">
                                        <label>Barangay</label>
                                            <div className="dstr-bgy-input-group">
                                                <span className="icon"><i className="fa-solid fa-road"></i></span>
                                                <input type="text" placeholder="brgy" name="brgy" value={activeResident.Barangay} readOnly/>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/*fam iec-sex */}
                                    <div className="dstr-bgy-pop-form1">

                                       <div className="form-group-fie">
                                            <label>Families Inside ECs</label>
                                            <div className="dstr-bgy-input-group-fie">
                                                <label>
                                                    <input type="radio" name="familiesInsideECs" value="yes" required />
                                                Yes
                                                </label>

                                                <label>
                                                    <input type="radio" name="familiesInsideECs" value="no" required />
                                                No
                                                </label>
                                            </div>
                                        </div>

                                        <div className="form-group-sex">
                                            <label>Sex Breakdown</label>
                                            <div className="dstr-bgy-input-group-sex">
                                                <div className="sex">
                                                    <label>
                                                    Male:
                                                        <input type="number" name="maleCount" placeholder="0" min="0" required />
                                                    </label>
                                                </div>

                                                <div className="sex">
                                                    <label>
                                                    Female:
                                                        <input type="number" name="femaleCount" placeholder="0" min="0" required />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/*preggy-lactating */}
                                    <div className="dstr-bgy-pop-form">
                                        <div className="form-group">
                                            <label>Number of Pregnant Women</label>
                                            <div className="dstr-bgy-input-group">
                                                <input type="number" name="pregnantWomen" placeholder="0" min="0" required />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Number of Lactating Mothers</label>
                                            <div className="dstr-bgy-input-group">
                                                <input type="number" name="lactatingMothers" placeholder="0" min="0" required />

                                            </div>
                                        </div>
                                    </div>

                                    {/*pwd-solo */}
                                    <div className="dstr-bgy-pop-form">

                                        <div className="form-group">
                                            <label>Number of PWDs</label>
                                            <div className="dstr-bgy-input-group">
                                                <input type="number" name="pwds" placeholder="0" min="0" required />

                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Number of Solo Parents</label>
                                            <div className="dstr-bgy-input-group">
                                                <input type="number" name="soloParents" placeholder="0" min="0" required />

                                            </div>
                                        </div>
                                    </div>

                                    {/*ip-idp */}
                                    <div className="dstr-bgy-pop-form">

                                        <div className="form-group">
                                            <label>Number of Indigenous Peoples</label>
                                            <div className="dstr-bgy-input-group">
                                                <input type="number" name="indigenousPeoples" placeholder="0" min="0" required />

                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/*ip-idp */}
                                    <div className="dstr-bgy-pop-form">
                                        <div className="form-group">
                                            <label>FNI Services Needed</label>
                                            <div className="dstr-bgy-input-group">
                                                <textarea name="fniServicesNeeded" placeholder="Describe services needed" rows="3" required></textarea>

                                            </div>
                                        </div>

                                    </div>

                                    <div className="dstr-bgy-pop-form">
                                        
                                        <div className="form-group">
                                            <label>Camp Manager Contact</label>
                                            <div className="dstr-bgy-input-group">
                                                
                                                <input type="tel" placeholder="Contact Number" required />
                                            </div>
                                        </div>

                                        
                                    </div>

                                    <button type="submit" className="submit-btn">
                                        Save
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
    
    </div>
  );
};

export default AddDisaster;
