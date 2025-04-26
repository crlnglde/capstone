import React, { useEffect, useState, useRef  } from "react";
import { v4 as uuidv4 } from "uuid";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import "../../css/forms/DAFAC.css";
import ICImage from '../../pic/IC.png';
import cswdImage from '../../pic/cswd.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';

import Loading from "../again/Loading";
import Notification from "../again/Notif";

const DAFAC= ({ activeResident, disasterData, setIsModalOpen, mode}) => {
  const formRef = useRef(null);

  console.log("Active Resident", activeResident)
  console.log("DisasterData", disasterData)
  const [currentDate, setCurrentDate] = useState("");

      const [loading, setLoading] = useState(false);
      const [notification, setNotification] = useState(null); 
  
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    sex: "",
    phone: "",
    bdate: "",
    occupation: "",
    education: "",
    income: "",
    purok: "",
    barangay: "",
    dependents: [],
    is4ps: false,
    isPWD: false,
    isPreg:false,
    isSenior:false,
    isIps: false,
    isSolo:false,
    evacuation:"",
    extentDamage:"",
    ocuppancy:"",
    costDamage:0,
    casualty:[],
    regDate: "",
    dafacStatus: "",
  });

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD" format
    setCurrentDate(today);

    // Ensure regDate is updated inside formData
    setFormData((prevData) => ({
      ...prevData,
      regDate: today,
      dafacStatus: "Pending",
    }));
  }, []);

  // Update state when activeResident changes
  useEffect(() => {
    if (activeResident) {
      setFormData((prevData) => ({
        ...prevData,
        id: activeResident.memId || activeResident.id,
        firstName: activeResident.firstName || "",
        middleName: activeResident.middleName || "",
        lastName: activeResident.lastName || "",
        age: activeResident.age || "",
        sex: activeResident.sex || "",
        phone: activeResident.phone || "",
        bdate: activeResident.bdate ? activeResident.bdate.split("T")[0] : "",
        occupation: activeResident.occupation || "",
        education: activeResident.education || "",
        income: activeResident.income || "",
        purok: activeResident.purok || "",
        barangay: activeResident.barangay || disasterData.selectedBarangays,
        dependents: activeResident.dependents || [],
        familyMembers: (activeResident.dependents?.length || 0) + 1,
        is4ps: activeResident.is4ps || false,
        isPWD: activeResident.isPWD || false,
        isPreg: activeResident.isPreg || false,
        isSenior: activeResident.isSenior || false,
        isIps: activeResident.isIps || false,
        isSolo: activeResident.isSolo || false,
        evacuation: activeResident.evacuation || "",
        extentDamage: activeResident.extentDamage || "",
        occupancy: activeResident.occupancy || "",
        costDamage: activeResident.costDamage || 0,
        casualty: activeResident.casualty || [],
        regDate: activeResident.regDate ? activeResident.regDate.split("T")[0] : prevData.regDate,
      }));
    }
  }, [activeResident]);  

{/*const damageCostMap = {
    Totally: 10000,
    Partially: 5000,
    Flooded: 3000,
  };*/}

  // Handle single selection for "Extent of Damage"
  const handleExtentChange = (event) => {
    setFormData({ ...formData, extentDamage: event.target.checked ? event.target.value : "" });
  };


  // Handle single selection for "Occupancy Status"
  const handleOccupancyChange = (event) => {
    setFormData({ ...formData, occupancy: event.target.checked ? event.target.value : "" });
  };

  const handleCasualtyChange = (event) => {
    const { value, checked } = event.target;
  
    setFormData((prevState) => {
      const currentCasualty = Array.isArray(prevState.casualty) ? prevState.casualty : [];
  
      return {
        ...prevState,
        casualty: checked
          ? [
              ...currentCasualty,
              {
                type: value,
                names: [""] // Start with one empty name field only
              },
            ]
          : currentCasualty.filter((c) => c.type !== value),
      };
    });
  };  
  
  // Function to add a new name input field
  const handleAddInputField = (casualtyIndex) => {
    setFormData((prevState) => {
      const updatedCasualties = [...prevState.casualty];
      updatedCasualties[casualtyIndex] = {
        ...updatedCasualties[casualtyIndex],
        names: [...updatedCasualties[casualtyIndex].names, ""]
      };      
  
      return {
        ...prevState,
        casualty: updatedCasualties,
      };
    });
  };
  
  const handleRemoveInputField = (casualtyIndex, inputIndex) => {
    setFormData((prevState) => {
      const updatedCasualties = [...prevState.casualty];
      updatedCasualties[casualtyIndex].names.splice(inputIndex, 1); // Remove the selected input field
  
      return {
        ...prevState,
        casualty: updatedCasualties,
      };
    });
  };  
    
  
  // Handle the input change for the names fields
  const handleCasualtyInput = (casualtyIndex, inputIndex, event) => {
    const { value } = event.target;
    
    setFormData((prevState) => {
      const updatedCasualties = [...prevState.casualty];
      updatedCasualties[casualtyIndex].names[inputIndex] = value;
  
      return {
        ...prevState,
        casualty: updatedCasualties,
      };
    });
  };

  const evacuationOptions = ["Ditucalan Gym", "Maria Cristina Gym ", "Upper Tominobo Gym ", "Sta. Elena Gym ", "Villa Verde Gym", "San Miguel Children Park", "Buru-un Gym Evacuation Center",
    "Mandulog Gym", "Saray Gym", "Tibanga Gym", "Sto. Rosario Gym", "Bagong Silang Brgy Hall/Gym", "Upper Hinaplanon Gym", "Lunab Brgy. Gym", "San Roque Brgy. Hall", "Kiwalan Gym", "Dalipuga Gym", "Hindang Gym", 
    "Kabacsanan Brgy. Hall", "Suarez Gym", "City Evacuation Center", "Laville Gym"
  ];
  

 /* const handleSave = async (event) => {
    if (event) event.preventDefault(); // Prevent form refresh
  
    const savedData = JSON.parse(localStorage.getItem("savedForms")) || [];
  
    // Generate a unique key using uuidv4()
    const formDataWithId = { id: uuidv4(), ...formData };
  
    // Add new formData to the existing array
    savedData.push(formDataWithId);
  
    // Store the updated array back in localStorage
    localStorage.setItem("savedForms", JSON.stringify(savedData));
  
    try {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (!formRef.current) {
        setNotification({
          type: "error",
          title: "Form Error",
          message: "Form reference is not available.",
        });
      
        setTimeout(() => {
          setNotification(null);
        }, 3000);

        setLoading(false);
      
        return;
      }
      
      setLoading(false); 

      // Convert form to canvas
      const canvas = await html2canvas(formRef.current, {
        scale: 2, // Increase resolution
        useCORS: true, // Prevent cross-origin issues
      });
  
      const imgData = canvas.toDataURL("image/png");
  
      // Generate PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
  
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  
      console.log("Saving PDF...");
      pdf.save("DAFAC_Form.pdf"); // Trigger download
  
      setNotification({ type: "success", title: "Success", message: "Form data saved successfully" });


      setTimeout(() => {
        setIsModalOpen(false);  
      }, 2000);
    }catch (error) {
      console.error("Error generating PDF:", error);
    
      let errorTitle = "Error";
      let errorMessage = "An error occurred while generating the PDF. Please try again.";
    
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
      }, 3000);
    }
    finally {

    }
  };*/

  const handleSave = async (event) => {
    const confirmSubmit = window.confirm("Are you sure you want to save this form?");
    if (!confirmSubmit) return;
    
    if (event) event.preventDefault(); // Prevent form refresh
  
    const savedData = JSON.parse(localStorage.getItem("AffectedForms")) || [];

    // Check if a matching form already exists
    const existingIndex = savedData.findIndex((entry) =>
      entry.barangay === formData.barangay &&
      entry.firstName === formData.firstName &&
      entry.middleName === formData.middleName &&
      entry.lastName === formData.lastName &&
      entry.bdate === formData.bdate
    );

    if (existingIndex !== -1) {
      // If it exists, update the existing entry
      savedData[existingIndex] = {
        ...savedData[existingIndex],
        ...formData
      };
    } else {
      // Otherwise, add the new entry with a unique ID
      const formDataWithId = { id: uuidv4(), ...formData };
      savedData.push(formDataWithId);
    }

    // Save the updated array to localStorage
    localStorage.setItem("savedForms", JSON.stringify(savedData));

  
    try {
      setLoading(true); // Start loading
  
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulated delay
  
      if (!formRef.current) {
        setNotification({
          type: "error",
          title: "Form Error",
          message: "Form reference is not available.",
        });
  
        setTimeout(() => {
          setNotification(null);
        }, 3000);
  
        setLoading(false); // Ensure loading is turned off before returning
        return;
      }
  
      setLoading(false); // Hide loading before capturing the form
  
      // **Wait for UI to update before capturing**
      setTimeout(async () => {
        // Convert form to canvas
        const canvas = await html2canvas(formRef.current, {
          scale: 2, // Increase resolution
          useCORS: true, // Prevent cross-origin issues
        });
  
        const imgData = canvas.toDataURL("image/png");
  
        // Generate PDF
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
  
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  
        console.log("Saving PDF...");
        pdf.save("DAFAC_Form.pdf"); // Trigger download
  
        setNotification({
          type: "success",
          title: "Success",
          message: "Form data saved successfully",
        });
  
        setTimeout(() => {
          setIsModalOpen(false);
        }, 2000);
      }, 100); // **Wait 100ms to allow UI to refresh**
    } catch (error) {
      console.error("Error generating PDF:", error);
  
      setLoading(false); // Ensure loading is turned off in case of an error
  
      let errorTitle = "Error";
      let errorMessage =
        "An error occurred while generating the PDF. Please try again.";
  
      if (!error.response) {
        errorTitle = "Network Error";
        errorMessage =
          "Please check your internet connection and try again.";
      } else if (error.response.status === 400) {
        errorTitle = "Invalid Data";
        errorMessage =
          "There is an issue with the provided data. Please check and try again.";
      } else if (error.response.status === 401 || error.response.status === 403) {
        errorTitle = "Unauthorized Access";
        errorMessage = "You do not have permission to perform this action.";
      } else if (error.response.status === 500) {
        errorTitle = "Server Error";
        errorMessage =
          "An error occurred on the server. Please try again later.";
      } else if (error.message.includes("Failed to update disaster data")) {
        errorTitle = "Update Failed";
        errorMessage =
          "An error occurred while updating the disaster data. Please try again.";
      }
  
      setNotification({
        type: "error",
        title: errorTitle,
        message: errorMessage,
      });
  
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };
  
  

  return (
    <div className="dafac">

      <div ref={formRef}  className="dafac-container">

        <div className="dafac-header">
            {/* Left Logo */}
            <div className="header-logo">   
                <img src={ICImage} alt="Logo" />
            </div>

            {/* Central Text */}
            <div className="text-center">
                <h2 className="title">REPUBLIC OF THE PHILIPPINES</h2>
                <h2 className="bold">CITY OF ILIGAN</h2>
                <h2 className="italic-bold">
                    Office of the City Social Welfare and Development Officer
                </h2>

                <div className= "sheet-title">
                    <h2>Disaster Assistance Family Access Card (DAFAC)</h2>
                </div>
            </div>

            {/* Right Logo */}
            <div className="header-logo">
                <img src={cswdImage} alt="Logo" />
            </div>
        </div>
    
        
        <div className="form-container">

        {loading && <Loading />}
        {notification && <Notification type={notification.type} title={notification.title} message={notification.message} />}

            <form className="relief-form">

              <div className="upper-area">
                <div className="form-row-1">
                <div className="checkbox-group">
                        <label>
                        <input type="checkbox" 
                         checked={formData.is4ps} 
                         onChange={() => setFormData({ ...formData, is4ps: !formData.is4ps })} 
                        /> 4Ps</label>

                        <label>
                        <input type="checkbox" 
                         checked={formData.isPWD} 
                         onChange={() => setFormData({ ...formData, isPWD: !formData.isPWD })} 
                         /> PWD</label>

                        <label>
                        <input type="checkbox" 
                         checked={formData.isPreg} 
                         onChange={() => setFormData({ ...formData, isPreg: !formData.isPreg })} 
                         /> Pregnant/Lactating Mother</label>

                        <label>
                          <input type="checkbox" 
                           checked={formData.isSenior} 
                           onChange={() => setFormData({ ...formData, isSenior: !formData.isSenior })} 
                           /> Senior Citizen</label>

                        <label>
                          <input type="checkbox" 
                           checked={formData.isIps} 
                           onChange={() => setFormData({ ...formData, isIps: !formData.isIps })} 
                           /> IPs</label>

                        <label>
                          <input type="checkbox" 
                           checked={formData.isSolo} 
                           onChange={() => setFormData({ ...formData, isSolo: !formData.isSolo })} 
                           /> Solo Parent</label>
                    </div>
            
                    <div className="form-row form-col-1">
                        <div className="form-row serial">
                        <label>Serial No.: <input type="text" value = {disasterData.disasterCode || ""} /></label>
                        </div>

                        <div className="form-row serial1">
                          <label>District / Cluster: <input type="text" value="Iligan City"/></label>
                          <label>Purok & Barangay: <input type="text" value={`${formData.purok}, ${formData.barangay}`}  /></label>
                          <label>
                            Evacuation:
                            <select
                              value={formData.evacuation}
                              onChange={(e) => setFormData({ ...formData, evacuation: e.target.value })}
                            >
                              <option value="">Select Evacuation Center</option>
                              {evacuationOptions.map((option, index) => (
                                <option key={index} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </label>                       
                        </div>

                    </div>

                </div>

                <div className="form-row-2">

                  <div className="form-row detail firstline">
                      <div className="form-row col">
                      <label>Name of Calamity: <input type="text" value = {disasterData.disasterType || ""}/></label>
                      </div>

                      <div className="form-row col">
                      <label>Date & Time of Occurrence: <input type="datetime-local" value = {disasterData.date || ""}/></label>
                      </div>
                  </div>

                  <div className="form-row detail secondline">

                    <div className="form-row detail duha">
                      <div className="form-row col">
                        <label>Head of the Family </label>
                      </div>

                      <div className="form-row col">
                      <label>Contact No.: <input type="tel" value={formData.phone || ""} disabled={!!formData.phone} /></label>
                      </div>
                    </div>

                    <div className="form-row detail tulo">
                      <div className="form-row col name"> 
                      <input type="text" value={formData.lastName || ""} disabled={!!formData.lastName} />
                        <label>Surname </label>
                      </div>

                      <div className="form-row col name"> 
                      <input type="text" value={formData.firstName || ""}  disabled={!!formData.firstName} />
                        <label>First Name </label>
                      </div>

                      <div className="form-row col name"> 
                      <input type="text" value={formData.middleName || ""} disabled={!!formData.middleName} />
                        <label>Middle Name</label>
                      </div>
    
                        

                        <div className="form-row col"> 
                          <label>Gender:
                              <select value={formData.sex} disabled>
                              <option value="M">M</option>
                              <option value="F">F</option>
                              </select>
                          </label>
                        </div>

                        <div className="form-row age"> 
                          <label>Age: <input type="number" min="0" value={formData.age || ""} disabled={!!formData.age} /></label>
                        </div>
                        
                    </div>

                    <div className="form-row detail upat">

                      <div className="form-row homead"> 
                        <input type="text" value={`${formData.purok}, ${formData.barangay}`}  />
                        <label>Home Address</label>
                      </div>

                      <div className="form-row col"> 
                      <input type="date" value={formData.bdate || ""} disabled={!!formData.bdate} />
                        <label>Date of Birth</label>
                      </div>

                      <div className="form-row col"> 
                      <input type="text" value={formData.occupation || ""} disabled={!!formData.occupation} />
                        <label>Occupation</label>
                      </div>

                      <div className="form-row col mi"> 
                      <input type="number" min="0" step="0.01" value={formData.income || ""} disabled={!!formData.income} />
                        <label>Monthly Income</label>
                      </div>
                    </div>

                    <div className="form-row detail lima">
                      <div className="form-row homead"> 
                        <input type="text" value={formData.education || ""} disabled={!!formData.education} />
                        <label>Educational Attainment</label>
                      </div>

                      <div className="form-row col"> 
                        <input type="number" min="0" value={formData.familyMembers || ""} disabled={!!formData.familyMembers}/>
                        <label>No. of Family Members</label>
                        </div>
                    </div>

                  </div>

                </div>

              </div>

                <table className="dafac-table">
                      <thead>
                        <tr>
                          <th>Family Members</th>
                          <th>Relation to Family Head</th>
                          <th>Age</th>
                          <th>Sex</th>
                          <th>Education</th>
                          <th>Occupation Skills</th>

                        </tr>
                      </thead>
                      <tbody>

                      {formData.dependents.length > 0 ? (
                          formData.dependents.map((dependent) => (
                              <tr key={dependent._id}>
                                  <td>{dependent.name}</td>
                                  <td>{dependent.relationToHead}</td>
                                  <td>{dependent.age}</td>
                                  <td>{dependent.sex}</td>
                                  <td>{dependent.education}</td>
                                  <td>{dependent.occupationSkills}</td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                              <td colSpan="6">No dependents available</td>
                          </tr>
                      )}
                       {/* Show input fields to add a new dependent */}
                       {/** 
                      <tr>
                        <td><input type="text" name="name" value={newDependent.name} onChange={handleDependentChange} placeholder="Name" /></td>
                        <td><input type="text" name="relationToHead" value={newDependent.relationToHead} onChange={handleDependentChange} placeholder="Relation" /></td>
                        <td><input type="number" name="age" value={newDependent.age} onChange={handleDependentChange} placeholder="Age" /></td>
                        <td>
                          <select name="sex" value={newDependent.sex} onChange={handleDependentChange}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </td>
                        <td><input type="text" name="education" value={newDependent.education} onChange={handleDependentChange} placeholder="Education" /></td>
                        <td><input type="text" name="occupationSkills" value={newDependent.occupationSkills} onChange={handleDependentChange} placeholder="Skills" /></td>
                        <td><button onClick={addDependent}>Add</button></td>
                      </tr>*/}
                                              
                      </tbody>
                </table>

                <div className="below-table">
                  <div className="form-row box">
                  <h3>Extent of Damage: </h3>
                    <label>
                      <input type="checkbox"  
                      checked={formData.extentDamage === "Totally"}
                      value="Totally"
                      onChange={handleExtentChange}/> Totally</label>

                    <label>
                      <input type="checkbox" 
                      checked={formData.extentDamage === "Partially"}
                      value="Partially"
                      onChange={handleExtentChange}/> Partially</label>

                    <label>
                      <input type="checkbox" 
                      checked={formData.extentDamage === "Flooded"}
                      value="Flooded"
                      onChange={handleExtentChange}/> Flooded</label>

                    <div className="cost-of-damage">
                      <span>Cost of Damage:</span>
                      <input type="number" disabled={!formData.extentDamage && !formData.occupancy && formData.casualty.length === 0} value={formData.costDamage} onChange={(e) => {const newCostDamage = parseInt(e.target.value);
                        console.log("Input Value: ", newCostDamage); setFormData({ ...formData, costDamage: parseInt(newCostDamage)})}}/>
                    </div>
                  </div>

                  <div className="form-row box">
                  <h3>Occupancy Status: </h3>
                    <label>
                      <input type="checkbox" 
                      checked={formData.occupancy === "Owner"}
                      value="Owner"
                      onChange={handleOccupancyChange}/> Owner</label>

                    <label>
                      <input type="checkbox" 
                      checked={formData.occupancy === "Renter"}
                      value="Renter"
                      onChange={handleOccupancyChange}/> Renter</label>

                    <label>
                      <input type="checkbox" 
                      checked={formData.occupancy === "Sharer"}
                      value="Sharer"
                      onChange={handleOccupancyChange}/> Sharer</label>

                    <label>
                      <input type="checkbox" 
                      checked={formData.occupancy === "Occupant"}
                      value="Occupant"
                      onChange={handleOccupancyChange}/> Occupant</label>

                    <label>
                      <input type="checkbox" 
                      checked={formData.occupancy === "Non-Occupant"}
                      value="Non-Occupant"
                      onChange={handleOccupancyChange}/> Non-Occupant</label>
                  </div>
                  
                  <div className="form-row box">
                    <div className="form-row col"> 
                      <h3>Casualty:</h3>
                    </div>

                    {["Dead", "Missing", "Injured"].map((casualtyType) => {
                       const casualtyIndex = formData.casualty?.findIndex((c) => c.type === casualtyType) ?? -1;
                       const isChecked = casualtyIndex !== -1;

                      return (
                        <div key={casualtyType} className="form-row casualty"> 
                          <label>
                            <input 
                              type="checkbox" 
                              value={casualtyType} 
                              checked={isChecked} 
                              onChange={handleCasualtyChange} 
                            /> 
                            {casualtyType}
                          </label>
                          
                         {/* Show input fields only when checked */}
                        {isChecked && (
                          <>
                            {formData.casualty?.[casualtyIndex]?.names?.map((name, index) => (
                              <div key={index} style={{ marginBottom: '10px' }}>
                                <input 
                                  type="text" 
                                  value={name || ""} 
                                  onChange={(event) => handleCasualtyInput(casualtyIndex, index, event)}
                                />
                                {/* Add button for more input fields */}
                                {index === formData.casualty[casualtyIndex]?.names?.length - 1 && (
                                  <button 
                                    onClick={() => handleAddInputField(casualtyIndex)} 
                                    style={{ marginLeft: '5px' }}>
                                    +
                                  </button>
                                )}
                                {/* Remove button to delete an input field */}
                                {formData.casualty[casualtyIndex]?.names.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveInputField(casualtyIndex, index)}
                                    style={{ marginLeft: "5px", color: "red" }}
                                  >
                                    -
                                  </button>
                                )}
                              </div>
                            ))}
                          </>
                        )}

                        </div>
                      );
                    })}
                  </div>

                </div>
                
                <div className="signature-section">

                  <div className="signature-container">
                    
                    <input type="text" className="printed-name"  />
                    <label>Name/Signature of Family Head <br/> or Thumbmark</label>
                    
                  </div>

                  <div className="signature-container">
                    
                    <input type="text" className="printed-name"  />
                    <label>Name/Signature of Barangay Captain <br/> </label>
                  </div>

                  <div className="signature-container">
                    
                    <input type="text" className="printed-name" />
                    <label>Name/Signature of Social Worker <br/> </label>
                  </div>

                </div>

                <div className="form-row fd">
                    <div className="fingerprint">
                    
                    </div>
    
                    <div className="date-registered">
                      <p>Date Registered:</p>
                      <input type="date" value={formData.regDate || currentDate} readOnly />
                    </div>
                </div>

                
               
            </form>
        </div>
                 

      </div>
        {mode !== "confirm" && (
          <button type="submit" className="submit-btn" onClick={handleSave}>
                                  Save
          </button>
        )}
    </div>
  );
};

export default DAFAC;
