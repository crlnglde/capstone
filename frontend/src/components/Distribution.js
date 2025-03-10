import React, { useEffect, useState, useMemo } from "react";
import { useNavigate} from 'react-router-dom'; 
import { Outlet } from "react-router-dom";
import axios from "axios";
import RDS from "./forms/RDS";
import EditRDS from "./forms/EditRDS"
import ViewRDS from "./forms/ViewRDS"
import Modal from "./Modal";
import Barc from './visualizations/Bar-ch'
import Piec from './visualizations/Pie-ch'
import Map from './visualizations/Iligan'
import "../css/Distribution.css";

const Distribution = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("rds");
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const rowsPerPage = 10;
  const totalPages = 20;
  //const totalPages = Math.ceil(disasters.length / rowsPerPage);
  const [step, setStep] = useState(1);
  const [recentDisasters, setDisasters] = useState([]);
  const [distribution, setDistribution] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false);

          // Static list of affected barangays FOR VIEW MORE
          const [activeBarangay, setActiveBarangay] = useState("ALL");
          const affectedBarangays = ["Barangay 1", "Barangay 2", "Barangay 3"];


  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState([{ name: "", quantity: "" }]);

  const disasterCode = localStorage.getItem("selectedDisasterCode") || "";

  const selectedDisaster = recentDisasters.find(
    (disaster) => disaster.disasterCode === disasterCode
  );
  
  const [forDistribution, setforDistribution] = useState({
    disasterCode: disasterCode, 
    disasterMonth:"",
    assistanceType: "",
    barangay: "",
    entries: [{ name: "", quantity: "", assistanceCost: ""  }],
    receivedFrom: "",
    certifiedCorrect: "",
    submittedBy: "",
  });

  const handleAddEntry = () => {
    setforDistribution((prevData) => ({
      ...prevData,
      entries: [...prevData.entries, { name: "", quantity: "" }],
    }));
  };

  const handleRemoveEntry = (index) => {
    const updatedEntries = forDistribution.entries.filter((_, i) => i !== index);
    setforDistribution((prevData) => ({ ...prevData, entries: updatedEntries }));
  };

  const handleChange = (field, value) => {
    setforDistribution((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...forDistribution.entries];
    updatedEntries[index][field] = value;
    setforDistribution((prevData) => ({ ...prevData, entries: updatedEntries }));
  };

  //open modal for "add" distribution
  const openModal = (disaster) => {
    const disasterDate = new Date(disaster.disasterDateTime);
    //const formattedMonth = disasterDate.toLocaleString("default", { month: "long" }); 

    localStorage.setItem("disasterCode", disaster.disasterCode);

    // Ensure state updates immediately
    setforDistribution(prevState => ({
        ...prevState,
        disasterCode: disaster.disasterCode,
        disasterDate: disasterDate
    }));
    setModalType("rds");
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleNextStep = (e) => {
    e.preventDefault(); // Prevent page reload
    if (validateFields()){
      localStorage.setItem("forDistribution", JSON.stringify(forDistribution));
      alert("Form data saved!");
      setIsModalOpen(false);
      setIsEditMode(false);
      setStep(2);
      navigate("/distribution/rds");

    }
  };

  const handleEdit = (distributionId) => {
    setIsEditMode(true)
    setStep(2);
    localStorage.setItem("distributionId", distributionId);
    navigate("/distribution/edit-rds");
};

  //for viewmore content sa distribution history 
  const handleViewMore = () => {
    setModalType("viewmore");
    setIsModalOpen(true);
  };


    const handleBackClick = () => {
      if (step > 1) {
        setStep(step - 1);
        navigate("/distribution"); 
      } else {
        navigate(-1); 
      }
    };

    //page sa disasters
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
      const fetchDisasters = async () => {
        try {
          const response = await axios.get("http://localhost:3003/get-disasters");
          const disasterData = response.data;
    
          // Get the current date and subtract 3 days
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    
          // Filter disasters that happened **after** three days ago
          const recentDisasters = disasterData.filter(disaster =>
            new Date(disaster.disasterDateTime) > threeDaysAgo   && disaster.disasterStatus === "Current" // Excludes disasters older than 3 days
          );
    
          setDisasters(recentDisasters);
        } catch (error) {
          console.error("Error fetching disasters data:", error);
        }
      };
    
      fetchDisasters();
    }, []);    

    console.log(recentDisasters);
    
    useEffect(() => {
      const fetchDistribution = async () => {
        try {
          const response = await axios.get("http://localhost:3003/get-distribution");
          const distributionData = response.data;
          setDistribution(distributionData);
        } catch (error) {
          console.error("Error fetching distribution data:", error);
        }
      };
    
      fetchDistribution();
    }, []);  

    const getPendingDistributions = () => {
      return distribution.filter((dist) => dist.status === "Pending");
    };
    
    const getDoneDistributions = () => {
      return distribution.filter((dist) => dist.status === "Done");
    };

    const pendingDistributions = getPendingDistributions();
    const doneDistributions = getDoneDistributions();
    

    const handleDoneClick = async (disasterCode) => {
      try {
        const response = await axios.put(`http://localhost:3003/update-status/${disasterCode}`);

        alert(response.data.message);
          window.location.reload()
      } catch (error) {
        console.error("Error updating status:", error);
        alert("No existing distribution yet.");
      }
    };

  //for search
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    console.log("Search Query: ", query);
  };

  const filteredDistribution = useMemo(() => {
    return doneDistributions.filter((distribution) => {
      return Object.keys(distribution).some((key) => {
        const value = distribution[key];
  
        // Handle string-based fields (disasterCode, status, disasterDate, etc.)
        if (typeof value === "string" && value.toLowerCase().includes(searchQuery)) {
          return true;
        }
  
        // Handle array fields (e.g., barangays)
        if (Array.isArray(value)) {
          return value.some((item) => {
            // Convert object properties to a string and check for searchQuery
            return Object.values(item).some(
              (subValue) =>
                typeof subValue === "string" && subValue.toLowerCase().includes(searchQuery)
            );
          });
        }
  
        return false;
      });
    });
  }, [doneDistributions, searchQuery]);


  const displayDistribution = useMemo(() => {
    return filteredDistribution.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredDistribution, currentPage, rowsPerPage]);
    
//input validation

const validateFields = () => {
  const errors = [];

  // Validate Barangay
  if (!forDistribution.barangay) {
    errors.push("Please select a Barangay.");
  }

  // Validate Entries
  if (forDistribution.entries.length === 0) {
    errors.push("At least one relief item entry is required.");
  } else {
    forDistribution.entries.forEach((entry, index) => {
      if (!entry.name.trim()) {
        errors.push(`Kind Source in entry ${index + 1} is required.`);
      }
      if (!entry.quantity.trim() || isNaN(entry.quantity) || Number(entry.quantity) <= 0) {
        errors.push(`Quantity in entry ${index + 1} must be a valid positive number.`);
      }
    });
  }

  // Validate Other Fields
  if (!forDistribution.receivedFrom.trim()) {
    errors.push("Received From is required.");
  }
  if (!forDistribution.certifiedCorrect.trim()) {
    errors.push("Certified Correct is required.");
  }
  if (!forDistribution.submittedBy.trim()) {
    errors.push("Submitted By is required.");
  }

  // Return errors if any
  if (errors.length > 0) {
    alert(errors.join("\n")); // Show errors in an alert (or use a more user-friendly method)
    return false;
  }

  return true; // Form is valid
};


  return (
    <div className="distribution">
      {step === 1 ? (
      <>
        <div className="content-container">

          <div className="column">
            {/* Current */}
            <div className="distribution-table">
              <div className="header-container">
                <h2 className="header-title">Current Disaster</h2>
              </div>

              <div className="container">
              {recentDisasters.length > 0 ? (
                recentDisasters.map((disaster, index) => (
                  <div key={index} className="transactionItem"> 
                    <div className="dateBox">
                      <span className="date">{new Date(disaster.disasterDateTime).getDate()}</span>
                      <span className="month">{new Date(disaster.disasterDateTime).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="details">
                      <span className="title">{disaster.disasterType}</span>
                      <span className="subtitle">{disaster.disasterCode}</span>
                    </div>
                     {/* Display affected barangays properly */}
                      {disaster.barangays && disaster.barangays.length > 0 && (
                        <div className="brgy">
                          <span className="subtitle">
                            {disaster.barangays.map((barangay, bIndex) => (
                              <span key={bIndex}>{barangay.name}{bIndex !== disaster.barangays.length - 1 ? ", " : ""}</span>
                            ))}
                          </span>
                        </div>
                      )}
                    <div className="actions">
                    <button className="addButton" onClick={() => {
                        localStorage.setItem("selectedDisasterCode", disaster.disasterCode);
                        openModal(disaster);
                      }}>
                        Add
                      </button>
                      <button className="doneButton" onClick={() => handleDoneClick(disaster.disasterCode)}>
                        Done
                      </button>
                    </div>
                  </div>
                  ) )): (
                    <tr>
                      <td colSpan="5">No disasters found.</td>
                    </tr>
                )}
              </div>

              <div className="btn-container">

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
            </div>
          
            {/* Pending */}
            <div className="distribution-table">
            <div className="header-container">
              <h2 className="header-title">Pending Distribution</h2>
            </div>

            <div className="container">
              {pendingDistributions.length > 0 ? (
                pendingDistributions.map((distItem, index) => (
                  <div key={index} >
                    {/* Loop through barangays */}
                    {distItem.barangays.map((barangay, bIndex) => (
                      <div key={bIndex}>
                        {barangay.distribution.map((dist, dIndex) => (
                          <div key={dIndex} className="transactionItem">
                            {/* Date Box */}
                            <div className="dateBox">
                              <span className="date">{new Date(dist.dateDistributed).getDate()}</span>
                              <span className="month">
                                {new Date(dist.dateDistributed).toLocaleString("default", { month: "short" })}
                              </span>
                            </div>

                            {/* Disaster Code */}
                            <div className="details">
                              <span className="title">{distItem.disasterCode}</span>
                            </div>

                            {/* Barangay Name */}
                            <div className="brgy">
                              <span className="subtitle">{barangay.name}</span>
                            </div>

                            {/* Actions */}
                            <div className="actions">
                              <button className="doneButton" onClick={() => handleEdit(dist._id)} >Edit</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div>No distributions found.</div>
              )}
            </div>


              <div className="btn-container">

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
            </div>
          </div>

          {/*History */}
          <div className="distribution-table">

            <div className="header-container">
              <h2 className="header-title">Distribution History</h2>
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

              <table>
                <thead>
                  <tr>
                    <th>Disaster Code</th>
                    <th>Disaster Date</th>
                    <th>Affected Barangay</th>
                    <th>View More</th>
                  </tr>
                </thead>
              
              <tbody>
                {displayDistribution.length > 0 ? (
                  displayDistribution.map((item, index) => (
                    <tr key={index}>
                      <td>{item.disasterCode}</td>
                      <td>{new Date(item.disasterDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                      <td>
                        {item.barangays.map(barangay => `${barangay.name}`).join(" | ")}
                      </td>
                      <td>
                        <button className="dash-viewmore-btn" onClick={() => handleViewMore()}>
                          <i className="fa-solid fa-ellipsis"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No disasters found.</td>
                  </tr>
                )}
              </tbody>

              </table>

          </div>

        </div>

      </>
      ) : (

        <div className="rds-form-container">

          <div className="back">
            <button className="backButton" onClick={handleBackClick}>
              <i className="fa-solid fa-chevron-left"></i>
              Back
            </button>
          </div>


         {isEditMode ? <EditRDS /> : <RDS />}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalType === "rds" ? "RDS" : "Distribution Details"}>

        {modalType === "rds" ? (
          <form className="modal-form">

            <div className="content">
              <label>Type of Assistance:</label>
              <select
                value={forDistribution.assistanceType}
                onChange={(e) => handleChange("assistanceType", e.target.value)}
              >
                <option value="">Select Assistance Type</option>
                <option value="Cash">Cash</option>
                <option value="Food">Food</option>
                <option value="Essentials">Essentials</option>
              </select>
            </div>

            <div className="content">
              <label>Barangay:</label>
              <select
                value={forDistribution.barangay}
                onChange={(e) => handleChange("barangay", e.target.value)} 
              >
                <option value="">Select Barangay</option>
                {selectedDisaster?.barangays?.map((barangay, index) => (
                  <option key={index} value={barangay.name}>
                    {barangay.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="content">
              <div className="entry">
                {forDistribution.entries.map((entry, index) => (
                  <div key={index} className="entry-group">
                    <div className="row-quan"> 
                      <label>Kind Source:</label>
                      <input
                        type="text"
                        value={entry.name}
                        onChange={(e) => handleEntryChange(index, "name", e.target.value)}
                      />
                    </div>

                    <div className="row-quan"> 
                      <label>Price:</label>
                      <input
                        type="number"
                        value={entry.assistanceCost}
                        onChange={(e) => handleEntryChange(index, "assistanceCost", e.target.value)}
                      />
                    </div>

                    <div className="row-quan"> 
                      <label>Quantity:</label>
                      <input
                        type="text"
                        value={entry.quantity}
                        onChange={(e) => handleEntryChange(index, "quantity", e.target.value)}
                      />
                    </div>

                    {forDistribution.entries.length > 1 && (
                      <button type="button" className="remove-btn" onClick={() => handleRemoveEntry(index)}>
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-btn" onClick={handleAddEntry}> 
                  <i className="fa-solid fa-plus"></i> Add More
                </button>
              </div>
            </div>

            <div className="content">
              <label>Received From:</label>
              <input type="text" value={forDistribution.receivedFrom} onChange={(e) => handleChange("receivedFrom", e.target.value)} />
            </div>

            <div className="content">
              <label>Certified Correct:</label>
              <input type="text" value={forDistribution.certifiedCorrect} onChange={(e) => handleChange("certifiedCorrect", e.target.value)} />
            </div>

            <div className="content">
              <label>Submitted by:</label>
              <input type="text" value={forDistribution.submittedBy} onChange={(e) => handleChange("submittedBy", e.target.value)} />
            </div>

            <button type="submit" className="submitButton" onClick={handleNextStep}>Next</button>
          </form>
        ) : (
          // Distribution Details (View More)
          <div className="view-more-content">
            <div className="tabs">
              <button
                className={activeBarangay === "ALL" ? "tab active" : "tab"}
                onClick={() => setActiveBarangay("ALL")}
              >
                All
              </button>

              {affectedBarangays.map((barangay) => (
                <button
                  key={barangay}
                  className={activeBarangay === barangay ? "tab active" : "tab"}
                  onClick={() => setActiveBarangay(barangay)}
                >
                  {barangay}
                </button>
              ))}
            </div>

            {/* Display RDS Component Based on Selected Barangay */}
            <ViewRDS selectedBarangay={activeBarangay} />
            
          </div>

        )}
      </Modal>

      {/* Modal Popup */}

    </div>
  );
};

export default Distribution;