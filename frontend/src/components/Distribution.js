import React, { useEffect, useState, useMemo } from "react";
import { useNavigate} from 'react-router-dom'; 
import { Outlet, useLocation  } from "react-router-dom";
import axios from "axios";
import RDS from "./forms/RDS";
import EditRDS from "./forms/EditRDS"
import ViewRDS from "./forms/ViewRDS"
import Modal from "./Modal";
import Barc from './visualizations/Bar-ch'
import Piec from './visualizations/Pie-ch'
import Map from './visualizations/Iligan'
import LineGraph from "./visualizations/Line-gr";
import "../css/Distribution.css";

import SignaturePad from "./Signature";

const Distribution = ({ setNavbarTitle }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("rds");
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const rowsPerPage = 10;
  const totalPages = 20;
  const [step, setStep] = useState(1);
  const [recentDisasters, setDisasters] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [activeTab, setActiveTab] = useState("list");
  const location = useLocation();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

   // Update navbar title when tab changes
   useEffect(() => {
    let title = `Distribution > ${activeTab === "list" ? "List" : "Visualization"}`;

   // Get the last segment of the path
   const pathSegments = location.pathname.split("/").filter(Boolean);
   const lastSegment = pathSegments[pathSegments.length - 1];

   // If the last segment is a subpage of "list", append it
   if (lastSegment === "rds") title += " > RDS";
   if (lastSegment === "edit-rds") title += " > Edit RDS";
   if (lastSegment === "view-rds") title += " > View RDS";

    setNavbarTitle(title);
}, [location.pathname, activeTab, setNavbarTitle]);

  //list of barangays
  const barangays = [
    "Abuno", "Acmac-Mariano Badelles Sr.", "Bagong Silang", "Bonbonon", "Bunawan", "Buru-un", "Dalipuga",
    "Del Carmen", "Digkilaan", "Ditucalan", "Dulag", "Hinaplanon", "Hindang", "Kabacsanan", "Kalilangan",
    "Kiwalan", "Lanipao", "Luinab", "Mahayahay", "Mainit", "Mandulog", "Maria Cristina", "Pala-o",
    "Panoroganan", "Poblacion", "Puga-an", "Rogongon", "San Miguel", "San Roque", "Santa Elena",
    "Santa Filomena", "Santiago", "Santo Rosario", "Saray", "Suarez", "Tambacan", "Tibanga",
    "Tipanoy", "Tomas L. Cabili (Tominobo Proper)", "Upper Tominobo", "Tubod", "Ubaldo Laya", "Upper Hinaplanon",
    "Villa Verde"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2012 + 1 }, (_, index) => 2012 + index);

  const [selectedBarangay, setSelectedBarangay] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  const handleBarangayChange = (event) => {
    setSelectedBarangay(event.target.value);
  };
  
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };


  useEffect(() => {
    setNavbarTitle(`Distribution > ${activeTab === "list" ? "List" : "Visualization"}`);
  }, [activeTab, setNavbarTitle]);


          // Static list of affected barangays FOR VIEW MORE
          const [activeBarangay, setActiveBarangay] = useState("ALL");
          const [affectedBarangays, setAffectedBarangays] = useState([]); 
          const [ViewDistribution, setViewDistribution] = useState(""); 
          
          useEffect(() => {
            if (affectedBarangays.length > 0) {
              setActiveBarangay(affectedBarangays[0]); // Automatically select the first barangay ✅
            }
          }, [affectedBarangays]); // Runs when `affectedBarangays` updates


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
  const handleViewMore = (barangays, id) => {
    setModalType("viewmore");
    setIsModalOpen(true);
    setAffectedBarangays(barangays.map(barangay => barangay.name)); 
    setViewDistribution(id); 
  };
  
    const handleBackClick = () => {
      if (step > 1) {
        setStep(step - 1);
        setIsEditMode(false);
        navigate("/distribution"); 
      } else {
        navigate(-1); 
      }
    };

    useEffect(() => {
      const fetchDisasters = async () => {
        try {
          const response = await axios.get("http://localhost:3003/get-disasters");
          const disasterData = response.data;
    
          // Filter disasters that happened **after** three days ago
          const recentDisasters = disasterData.filter(disaster =>
            disaster.disasterStatus === "Current"
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


//pagination area
    const [currentDisastersPage, setCurrentDisastersPage] = useState(1);// pagination sa current
    const [pendingDistributionsPage, setPendingDistributionsPage] = useState(1);///pagination sa pending
    const [historyPage, setHistoryPage] = useState(1);

    const disastersPerPage = 3;  
    const pendingPerPage = 3;
    const historyPerPage = 6;

    // Sort disasters by disasterDateTime (latest first)
      const sortedDisasters = [...recentDisasters].sort(
        (a, b) => new Date(b.disasterDateTime) - new Date(a.disasterDateTime)
      );

    // Sort pending distributions by dateDistributed (latest first)
      const sortedPending = [...pendingDistributions].sort(
        (a, b) => {
          const latestA = Math.max(...a.barangays.flatMap(b => b.distribution.map(d => new Date(d.dateDistributed))));
          const latestB = Math.max(...b.barangays.flatMap(b => b.distribution.map(d => new Date(d.dateDistributed))));
          return latestB - latestA;
        }
      );

      const sortedHistory = [...displayDistribution].sort(
        (a, b) => new Date(b.disasterDate) - new Date(a.disasterDate)
      );

      const totalDisasterPages = Math.ceil(sortedDisasters.length / disastersPerPage);
      const totalPendingPages = Math.ceil(sortedPending.length / pendingPerPage);
      const totalDistributionHistoryPages = Math.ceil(sortedHistory.length / historyPerPage);

    // Handle pagination for Current Disasters
      const handleNextDisasters = () => {
        if (currentDisastersPage < totalDisasterPages) {
          setCurrentDisastersPage(currentDisastersPage + 1);
        }
      };

      const handlePrevDisasters = () => {
        if (currentDisastersPage > 1) {
          setCurrentDisastersPage(currentDisastersPage - 1);
        }
      };

    // Handle pagination for Pending Distributions
      const handleNextPending = () => {
        if (pendingDistributionsPage < totalPendingPages) {
          setPendingDistributionsPage(pendingDistributionsPage + 1);
        }
      };

      const handlePrevPending = () => {
        if (pendingDistributionsPage > 1) {
          setPendingDistributionsPage(pendingDistributionsPage - 1);
        }
      };

    // Pagination handlers for History
      const handleNextHistory = () => {
        if (historyPage < totalDistributionHistoryPages) {
          setHistoryPage(historyPage + 1);
        }
      };

      const handlePrevHistory = () => {
        if (historyPage > 1) {
          setHistoryPage(historyPage - 1);
        }
      };

    // Slice the data to show only the required page data
      const displayedDisasters = sortedDisasters.slice(
        (currentDisastersPage - 1) * disastersPerPage,
        currentDisastersPage * disastersPerPage
      );
      
      const displayedPending = sortedPending.slice(
        (pendingDistributionsPage - 1) * pendingPerPage,
        pendingDistributionsPage * pendingPerPage
      );

      const displayedHistory = sortedHistory.slice(
        (historyPage - 1) * historyPerPage,
        historyPage * historyPerPage
      );

  return (
    <div className="distribution">

      {!isEditMode && step !== 2 && (
        <div className="toggle-container">
          <button
            className={activeTab === "list" ? "active" : ""}
            onClick={() => setActiveTab("list")}
          >
            List
          </button>
          <button
            className={activeTab === "visualization" ? "active" : ""}
            onClick={() => setActiveTab("visualization")}
          >
            Visualization
          </button>
        </div>
      )}

      <div className="distribution-container">
        {activeTab === "list" ? (
            step === 1 ? (
            <>
              <div className="content-container">

                <div className="column">
                  {/* Current */}
                  <div className="distribution-table">
                    <div className="header-container">
                      <h2 className="header-title">Current Disaster</h2>
                    </div>

                    <div className="container">
                    {displayedDisasters.length > 0 ? (
                      displayedDisasters.map((disaster, index) => (
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
                        onClick={handlePrevDisasters} 
                        disabled={currentDisastersPage === 1}
                      >
                        <i className="fa-solid fa-angle-left"></i>
                      </button>


                      <button 
                        className="nav-button next" 
                        onClick={handleNextDisasters} 
                        disabled={currentDisastersPage === totalDisasterPages}
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
                      {displayedPending.length > 0 ? (
                        displayedPending.map((distItem, index) => (
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
                      onClick={handlePrevPending} 
                      disabled={pendingDistributionsPage === 1}
                    >
                      <i className="fa-solid fa-angle-left"></i>
                    </button>

                      <button 
                        className="nav-button next" 
                        onClick={handleNextPending} 
                        disabled={pendingDistributionsPage === totalPendingPages}
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

                  <div className="distab">
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
                      {displayedHistory.length > 0 ? (
                        displayedHistory.map((item, index) => (
                          <tr key={index}>
                            <td>{item.disasterCode}</td>
                            <td>{new Date(item.disasterDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                            <td>
                              {item.barangays.map(barangay => `${barangay.name}`).join(" | ")}
                            </td>
                            <td>
                              <button className="dash-viewmore-btn" onClick={() => handleViewMore(item.barangays, item._id)}>
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

                      {/* Pagination Controls */}
                      <div className="btn-container">
                        <button className="nav-button prev" onClick={handlePrevHistory} disabled={historyPage === 1}>
                          <i className="fa-solid fa-angle-left"></i>
                        </button>
                        <button className="nav-button next" onClick={handleNextHistory} disabled={historyPage === totalDistributionHistoryPages}>
                          <i className="fa-solid fa-angle-right"></i>
                        </button>
                      </div>

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


                {isEditMode ? (
                    <EditRDS />
                ) : isViewMode ? (
                  <ViewRDS />
                ) : (
                    <RDS />
                )}
              </div>
            )

        ):(
          <div className="disasters-visualizations">

            <div className="header-container">
              <h2 className="header-title">Visualizations</h2>
    
              <div className="dis-filter">
    
                <div className="dis-filter-container">
                  {/*dropdown for barangays*/}
                  <label htmlFor="barangay">Select Barangay: </label>
                  <select id="barangay" name="barangay" value={selectedBarangay} onChange={handleBarangayChange}>
                  <option value="All">All</option>
                    {barangays.map((barangay, index) => (
                      <option key={index} value={barangay}>
                        {barangay}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="dis-filter-container">
                  {/*dropdown for years*/}
                  <label htmlFor="year">Select Year: </label>
                  <select id="year" name="year" value={selectedYear} onChange={handleYearChange}>
                  <option value="All">All</option>
                    {years.map((year, index) => (
                      <option key={index} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
    
              </div>
            </div>

            <div className="ch1">
              <Barc barangay={selectedBarangay} year={selectedYear}/>
            </div>
  
            <div className="ch2">
              <Map barangay={selectedBarangay} year={selectedYear}/>
              <Piec barangay={selectedBarangay} year={selectedYear}/>
            </div>
          </div>
        )}
      </div>

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

              <div className="tabs-container">
                <div className="tabs">
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

                {/* Display Day and Date */}
                <div className="distribution-info">
                  <span>
                    Day 1 - mm-dd-yyyy
                  </span>
                </div>
              </div>
              {/* Display RDS Component Based on Selected Barangay */}
              <ViewRDS selectedBarangay={activeBarangay} distributionId= {ViewDistribution} />
            
          </div>

        )}
      </Modal>

      {/* Modal Popup */}

    </div>
  );
};

export default Distribution;