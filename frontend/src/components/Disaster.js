import React, { useEffect, useState } from "react";
import { useNavigate} from 'react-router-dom'; 
import axios from "axios";
import Papa from 'papaparse';
import moment from "moment";
import { LuClipboardPlus } from "react-icons/lu";
import { GiConfirmed } from "react-icons/gi";
import { RiEdit2Line } from "react-icons/ri";
import { FaLock, FaMale, FaFemale  } from "react-icons/fa";
import { IoMale, IoFemaleSharp, IoMaleFemale  } from "react-icons/io5";
import Pagination from "./again/Pagination";
import StackedBarChart from "./visualizations/Line-gr";
import DonutGraph from './visualizations/Donut'
import PieChart from "./visualizations/Pie";
import MapDisaster from "./visualizations/Iligan";
import Modal from "./Modal";
import AddAffFam from "./reusable/AddAffFam";
import EditAffFam from "./reusable/EditAffFam";
import ConAffFam from "./reusable/ConAffFam";
import { syncDAFACData } from "../components/sync/syncDisaster";
import { syncDisasterData } from "../components/sync/syncAddDisaster";
import { syncConfirmData } from "../components/sync/syncConfirmData";
import Notification from "./again/Notif";
import "../css/Disaster.css";

const Disaster = ({ setNavbarTitle }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isUploading, setIsUploading] = useState(false); 
  const [file, setFile] = useState(null);
  
  const [disasters, setDisasters] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");

  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [disCode, setSelectedDisCode] = useState(null);
  const [disBarangay, setDisBarangay] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeTab, setActiveTab] = useState("list");
  const [step, setStep] = useState(1);
  const [step2Type, setStep2Type] = useState("");
  const [notification, setNotification] = useState(null); 
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  //para daw ni sa auth role and all
  const [role, setRole] = useState(null);

  const [selectedBarangay, setSelectedBarangay] = useState(() => {
    const savedBarangay = localStorage.getItem('barangay');
    return role === "daycare worker" ? savedBarangay || "" : "All";
  });

    useEffect(() => {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("role");

      if (!token) {
          navigate("/");
      } else {
          setRole(userRole);
      }
  }, [navigate]);

  useEffect(() => {
    if (role === "daycare worker") {
      const savedBarangay = localStorage.getItem("barangay");
      setSelectedBarangay(savedBarangay || ""); // Update selectedBarangay for daycare workers
    } else {
      setSelectedBarangay("All"); // Default to "All" if not a daycare worker
    }
  }, [role]);



  useEffect(() => {
    let title = `Disaster `;

    if (activeTab === "list" && step === 2) {
        const stepTitles = {
            addAffectedFamily: "Add Affected Family",
            editAffectedFamily: "Edit DAFAC",
            confirmDamageCategory: "Confirm DAFAC",
        };

        if (step2Type && stepTitles[step2Type]) {
            title += ` > ${stepTitles[step2Type]}`;
        }
    }

    setNavbarTitle(title);
}, [activeTab, step, step2Type, setNavbarTitle]);

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

  const handleBarangayChange = (event) => {
    setSelectedBarangay(event.target.value);
  };
  
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleAddDisaster = () => {
    navigate("/disaster/add-disaster"); 
  };

  const handleUploadCsvClick = () => {
    setModalType("upload");
    setIsModalOpen(true);
  };

  const handleSyncDataClick = async () => {
    if (navigator.onLine) {
      if(role !== "CSWD"){
        await syncDisasterData(setNotification); 
        await syncDAFACData(setNotification); 
      }else{
        await syncConfirmData(setNotification); 
      }
    }
  };

  const handleStepChange = (type, disCode, disBarangay) => {
    setStep(2); // Move to step 2
    setStep2Type(type); // Set the type of content to show
    setSelectedDisCode(disCode);
    setDisBarangay(disBarangay);
};

const closeModal = () => {
  setIsModalOpen(false); // Close modal
};

  
  const handleViewMore = (disaster) => {
    setModalType("viewmore"); 
    setSelectedDisaster(disaster); 
    setIsModalOpen(true); 
  };

  const handleBackClick = () => {
    if (step > 1) {
      setStep(step - 1);
      localStorage.removeItem("savedForms");
      navigate("/disaster"); 
    } else {
      navigate(-1); 
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

//fetch disaster
useEffect(() => {
  const fetchDisasters = async () => {
    let disasterData = [];


    // Fetch updated data from API
    try {
      if (navigator.onLine){
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-disasters`);
      if (Array.isArray(response.data)) {
        disasterData = response.data;
        transformAndSetDisasters(disasterData);

      } else {
        setNotification({ type: "error", title: "Data Format Error", message: `Expected an array but got: ${JSON.stringify(response.data)}` });
        setTimeout(() => setNotification(null), 3000);
      }}
      else{
            // Load from localStorage first (if available)
        const localData = localStorage.getItem("disasters");
        const offlineData = localStorage.getItem("offlineDisasterData");

        let parsedLocal = [];
        let parsedOffline = [];

        if (localData) {
          try {
            parsedLocal = JSON.parse(localData);
            if (!Array.isArray(parsedLocal)) parsedLocal = [];
          } catch (e) {
            setNotification({ type: "error", title: "Parse Error", message: `Failed to parse local disasters data: ${e.message || e}` });
            setTimeout(() => setNotification(null), 3000);
          }
        }
  
        if (offlineData) {
          try {
            parsedOffline = JSON.parse(offlineData);
            if (!Array.isArray(parsedOffline)) parsedOffline = [];
          } catch (e) {
            setNotification({ type: "error", title: "Parse Error", message: `Failed to parse offline disaster data: ${e.message || e}` });
            setTimeout(() => setNotification(null), 3000);
          }
        }
  
        // Combine both arrays
        disasterData = [...parsedLocal, ...parsedOffline];
        localStorage.setItem('offlineDisaster', JSON.stringify(disasterData));
        transformAndSetDisasters(disasterData);
      }
    } catch (error) {
      setNotification({ type: "error", title: "Fetch Error", message: `Error fetching disasters data: ${error.message || error}` });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const transformAndSetDisasters = (data) => {
    const transformedData = data.flatMap((disaster) =>
      (disaster.barangays || []).map((brgy) => {
        // Initialize counters
        let maleCount = 0, femaleCount = 0, othersCount = 0;
        let maleSenior = 0, femaleSenior = 0, othersSenior= 0;
        let maleAdult = 0, femaleAdult = 0, othersAdult=0;
        let maleMinor = 0, femaleMinor = 0, othersMinor=0 ;
        let is4ps = 0, isPWD = 0, isPreg = 0, isIps = 0, isSolo = 0;
    
        // Count in affected families
        brgy.affectedFamilies.forEach(family => {
          if (family.sex === "M") maleCount++;
          if (family.sex === "F") femaleCount++;
          if (family.sex === "O") othersCount++;
    
          // Check age if available
          if (family.age !== undefined && family.age !== null) {
            if (family.sex === "M") {
              if (family.age >= 60) maleSenior++;
              else if (family.age >= 18) maleAdult++;
              else maleMinor++;
            } else if (family.sex === "F") {
              if (family.age >= 60) femaleSenior++;
              else if (family.age >= 18) femaleAdult++;
              else femaleMinor++;
            } else if (family.sex === "O") {
              if (family.age >= 60) othersSenior++;
              else if (family.age >= 18) othersAdult++;
              else othersMinor++;
            }
          }
    
          // Dependents
          family.dependents?.forEach(dependent => {
            if (dependent.sex === "Male") maleCount++;
            if (dependent.sex === "Female") femaleCount++;
            if (family.sex === "Others") othersCount++;

            if (dependent.age !== undefined && dependent.age !== null) {
              if (dependent.sex === "Male") {
                if (dependent.age >= 60) maleSenior++;
                else if (dependent.age >= 18) maleAdult++;
                else maleMinor++;
              } else if (dependent.sex === "Female") {
                if (dependent.age >= 60) femaleSenior++;
                else if (dependent.age >= 18) femaleAdult++;
                else femaleMinor++;
              } else if (family.sex === "O") {
                if (family.age >= 60) othersSenior++;
                else if (family.age >= 18) othersAdult++;
                else othersMinor++;
              }
            }
          });
    
          if (family.is4ps) is4ps++;
          if (family.isPWD) isPWD++;
          if (family.isPreg) isPreg++;
          if (family.isIps) isIps++;
          if (family.isSolo) isSolo++;
        });

        return {
          disasterCode: disaster.disasterCode,
          disasterType: disaster.disasterType,
          disasterStatus: disaster.disasterStatus,
          disasterDateTime: moment(disaster.disasterDateTime).format("MMMM D, YYYY h:mm A"),
          barangay: brgy.name || "Unknown",
          affectedFamilies: Array.isArray(brgy.affectedFamilies) ? brgy.affectedFamilies.length : 0,
          affectedPersons: brgy.affectedFamilies.reduce(
            (sum, family) => sum + 1 + (family.dependents ? family.dependents.length : 0),
            0
          ),
          sexBreakdown: {
            males: maleCount,
            females: femaleCount,
            others: othersCount,
            maleSenior,
            femaleSenior,
            othersSenior,
            maleAdult,
            femaleAdult,
            othersAdult,
            maleMinor,
            femaleMinor,
            othersMinor
          },
          is4ps: is4ps,
          isPWD: isPWD,
          isSolo: isSolo,
          isPreg: isPreg,
          isIps: isIps,
        };
      })
    );    

    setDisasters(transformedData);
  };

  fetchDisasters();
}, [role]); // Fetch disasters when the role changes

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    console.log("Search Query: ", query); // Debugging the query
  };
 
  const filteredDisasters = disasters
  .filter((disaster) => {
    const excludeColumns = [
      "affectedFamilies", "affectedPersons", "familiesInEC", "sexBreakdown",
      "pregnantWomen", "lactatingMothers", "pwds", "soloParents", "indigenousPeoples", "assistanceNeeded"
    ];

    return Object.keys(disaster).some((key) => {
      if (!excludeColumns.includes(key)) {
        const value = disaster[key];
        if (value && value.toString) {
          return value.toString().toLowerCase().includes(searchQuery);
        }
      }
      return false;
    });
  })
  .filter((disaster) => {
    if (role === "daycare worker") {
      return disaster.barangay?.toLowerCase().trim() === selectedBarangay?.toLowerCase().trim();
    }
    return selectedBarangay === "All" || disaster.barangay?.toLowerCase().trim() === selectedBarangay?.toLowerCase().trim();
  })


  //page sa disasters
    const [disasterPage, setDisasterPage] = useState(1);
    const disastersPerPage = 6;
    const totalPages = Math.ceil(filteredDisasters.length / disastersPerPage);

    // Sort disastersList by disasterDateTime (latest first)
    const sortedDisasters = [...filteredDisasters].sort(
      (a, b) => new Date(b.disasterDateTime) - new Date(a.disasterDateTime)
    );

    const totalDisasterPages = Math.ceil(sortedDisasters.length / disastersPerPage);

    const handleNextDisaster = () => {
      if (disasterPage < totalDisasterPages) {
        setDisasterPage(disasterPage + 1);
      }
    };
    
    const handlePrevDisaster = () => {
      if (disasterPage > 1) {
        setDisasterPage(disasterPage - 1);
      }
    };

  // Slice the sorted disasters for pagination
      const displayDisasters = sortedDisasters.slice(
        (disasterPage - 1) * disastersPerPage,
        disasterPage * disastersPerPage
      );

  return (
    <div className="disaster">

          {notification && (
                  <Notification
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    onClose={() => setNotification(null)}  // Close notification when user clicks ✖
                  />
                )}

        {step !== 2 && (
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

        {step == 2 && (
          <div className="back">
            <button className="backButton" onClick={handleBackClick}>
              <i className="fa-solid fa-chevron-left"></i>
              Back
            </button>
          </div>
        )}

      <div className="dashboard-container">
        

        {activeTab === "list" ? (
  
          step === 1 ? (
            <div className="disasters-table">

              <div className="header-container">
                <h2 className="header-title">List of Disasters</h2>
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

              <div className="dash-btn">

                <button className="add-disaster" onClick={handleAddDisaster}>
                  <i className="fa-solid fa-file-circle-plus"></i>
                  Add Disaster
                </button>
                
                <button className="upload-csv" onClick={handleSyncDataClick}>
                  <i className="fa-solid fa-sync"></i>
                  Sync Draft
                </button>
                
              </div>

              <div className="distab">
                <table>
                  <thead>
                    <tr>
                      <th rowSpan="2" className="wide-column">Disaster Code</th>
                      <th rowSpan="2" className="wide-column">Disaster Type</th>
                      <th rowSpan="2" className="wide-column">Disaster Date</th>
                      <th rowSpan="2" className="wide-column">Affected Barangay</th>
                      <th colSpan="5" className="action-column">Actions</th>
                    </tr>
                    <tr>

                      {role === "daycare worker" && (
                        <th className="action-column"> Add</th>
                      )}
                      
                      {role === "daycare worker" && (
                      <th className="action-column">Edit</th>
                      )}

                      {role === "CSWD" && (
                        <th className="action-column">Confirm</th>
                      )}

                      <th className="action-column">View More</th>
                    </tr>
                  </thead>

                  <tbody>

                    {displayDisasters.length > 0 ? (
                      displayDisasters.map((disaster, index) => (
                        <tr key={index}>
                          <td>{disaster.disasterCode}</td>
                          <td>{disaster.disasterType}</td>
                          <td>{disaster.disasterDateTime}</td>
                          <td>{disaster.barangay}</td>

                          {/*add*/}
                          {role === "daycare worker" && (
                            <td className="action-column">
                              <button 
                                className="dash-viewmore-btn" 
                                disabled={disaster.disasterStatus === "Done"} 
                                onClick={() => handleStepChange("addAffectedFamily", disaster.disasterCode, disaster.barangay)}
                                title={disaster.disasterStatus === "Done" ? "This disaster is finalized and cannot be modified." : ""}
                              >
                                {disaster.disasterStatus === "Done" ? <FaLock /> : <LuClipboardPlus />}
                              </button>
                            </td>
                          )}

                          {/*edit*/}
                          {role === "daycare worker" && (
                            <td className="action-column">
                              <button 
                                className="dash-viewmore-btn" 
                                disabled={disaster.disasterStatus === "Done"} 
                                onClick={() => handleStepChange("editAffectedFamily", disaster.disasterCode, disaster.barangay)}
                                title={disaster.disasterStatus === "Done" ? "This disaster is finalized and cannot be modified." : ""}
                              >
                                {disaster.disasterStatus === "Done" ? <FaLock /> : <RiEdit2Line />}
                              </button>
                            </td>
                          )}

                          {/*confirm*/}
                          {role === "CSWD" && (
                            <td className="action-column">
                              <button 
                                className="dash-viewmore-btn" 
                                disabled={disaster.disasterStatus === "Done"} 
                                onClick={() => handleStepChange("confirmDamageCategory", disaster.disasterCode, disaster.barangay)}
                                title={disaster.disasterStatus === "Done" ? "This disaster is finalized and cannot be modified." : ""}
                              >
                                {disaster.disasterStatus === "Done" ? <FaLock /> : <GiConfirmed />}
                              </button>
                            </td>
                          )}


                          {/*view*/}
                          <td className="action-column">
                            <button className="dash-viewmore-btn" onClick={() => handleViewMore(disaster)}>
                              <i className="fa-solid fa-ellipsis"></i>
                            </button>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7">No disasters found.</td>
                      </tr>
                    )}
                                          
                  </tbody>
                </table>
              </div>
      
              {/*Pagination*/}
              <div className="res-button-container">
                  {totalPages > 1 && (
                      <div className="pagination-wrapper">
                          <Pagination currentPage={disasterPage} totalPages={totalPages} onPageChange={setDisasterPage} />
                      </div>
                  )}
              </div>

            </div>

          ) : (
            <div className="step2">
              {step === 2 && (
                <>
                  {step2Type === "addAffectedFamily" && <AddAffFam disBarangay={disBarangay} disCode={disCode}  setStep={setStep}/>}
                  {step2Type === "editAffectedFamily" && <EditAffFam disBarangay={disBarangay} disCode={disCode} setStep={setStep}/>}
                  {step2Type === "confirmDamageCategory" && <ConAffFam disBarangay={disBarangay} disCode={disCode} setStep={setStep}/>}
                </>
              )}
            </div>
          )


        ):(  
          <div className="disasters-visualizations">

            <div className="header-container">
              <h2 className="header-title">Visualizations</h2>
    
            </div>
  
            <div className="ch1">
              <MapDisaster barangay={selectedBarangay} year={selectedYear}/>
            </div>

            <div
              className="charts-container"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: '2rem',
                height: '100%',
                paddingTop: 0,
                paddingRight: '20px',
                paddingBottom: '20px',
                paddingLeft: '20px'
              }}
            >
              {/* Left Column - Donut + Pie */}
              <div
                className="charts-left"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between', // makes them evenly distributed
                  height: '100%', // Ensures it stretches fully
                  gap: '15px'
                }}
              >
                <div className="chart-box" style={{ /*flex: 1*/ height: '100%' }}>
                  <DonutGraph barangay={selectedBarangay} year={selectedYear} />
                </div>
                <div className="chart-box" style={{ /*flex: 1*/ height: '100%' }}>
                  <PieChart barangay={selectedBarangay} year={selectedYear} />
                </div>
              </div>

              {/* Right Column - Line Chart */}
              <div
                className="charts-right"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%'
                }}
              >
                <div className="chart-box" style={{ flex: 1 }}>
                  <StackedBarChart />
                </div>
              </div>
            </div>
          </div>

        )}    
      </div>
    {/** 
      {isModalOpen && modalType === "upload" && (
        <div className="dash-modal-overlay" onClick={handleCloseModal}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal}>
              ×
            </button>
          
            <div>
              <h2 className="modal-title">Upload Disaster CSV</h2>
              <form onSubmit={handleFileUpload} className="upload-form">
                <input type="file" accept=".csv" onChange={handleFileChange} />
                <button type="submit" className="submit-btn" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </form>
            </div>
            
          </div>
        </div>
      )}
    */}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={
          modalType === "viewmore" 
          ? "Disaster Details" 
          : ""
      }>

        {modalType === "viewmore" && (
          <form className="viewmore-form">
              <div className="viewmore-pop">

                <div className="vm-form-group">
                  <label>Disaster Code</label>
                  <div className="vm-input-group">
                    <span className="icon"><i className="fa-solid fa-barcode"></i></span>
                    <span className="label"> {selectedDisaster.disasterCode} </span>
                  </div>
                </div>

                <div className="vm-form-group">
                  <label>Disaster Type</label>
                  <div className="vm-input-group">
                    <span className="icon"><i className="fa-solid fa-list"></i></span>
                    <span className="label">{selectedDisaster.disasterType}</span>
                  </div>
                </div>
              </div>
    
              <div className="viewmore-pop">

                <div className="vm-form-group">
                  <label>Disaster Date</label>
                  <div className="vm-input-group">
                    <span className="icon"><i className="fa-regular fa-calendar-days"></i></span>
                    <span className="label">{selectedDisaster.disasterDateTime}</span>
                  </div>
                </div>

                <div className="vm-form-group">
                  <label>Affected Barangays</label>
                  <div className="vm-input-group">
                    <span className="icon"><i className="fa-solid fa-person-shelter"></i></span>
                    <span className="label">{selectedDisaster.barangay}</span>
                  </div>
                </div>

              </div>

              <div className="viewmore-pop">

                <div className="vm-form-group">
                  <label>No. of Affected Families</label>
                  <div className="vm-input-group">
                    <span className="icon"><i className="fa-solid fa-hashtag"></i></span>
                    <span className="label">{selectedDisaster.affectedFamilies}</span>
                  </div>
                </div>

                <div className="vm-form-group">
                  <label>No. of Affected People</label>
                  <div className="vm-input-group">
                    <span className="icon"><i className="fa-solid fa-hashtag"></i></span>
                    <span className="label">{selectedDisaster.affectedPersons}</span>
                  </div>
                </div>

              </div>

              <div className="viewmore-pop">

              <div className="vm-form-group">

                <label>Sex Breakdown</label>
                <div className="vm-input-group sex">
                  
                  <div className="a">
                    <span className="icon"><IoMale /></span>
                    <span className="label">
                      Male: {selectedDisaster.sexBreakdown.males} 
                    </span>
                  </div>
                  
                  <div className="a">
                    <span className="icon"><IoFemaleSharp /></span>
                    <span className="label">
                      Female: {selectedDisaster.sexBreakdown.females}
                    </span>
                  </div>

                  
                  <div className="a">
                    <span className="icon"><IoMaleFemale /></span>
                    <span className="label">
                      Others: {selectedDisaster.sexBreakdown.others}
                    </span>
                  </div>         

                </div>

                {/* Breakdown by Age Groups */}
                <div className="vm-input-group1">

                    <div className="vm-input-group2">
                      <div className="aa"> 

                        <label> Senior (60+): </label>

                        <div className="vm-input-group a" style={{ fontSize: '0.9em' }}>
                          <span className="label"> Male: {selectedDisaster.sexBreakdown.maleSenior}   | 
                            Female: {selectedDisaster.sexBreakdown.femaleSenior}   | 
                            Others: {selectedDisaster.sexBreakdown.othersSenior}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="vm-input-group2">
                      <div className="aa"> 

                      <label> Adults (18-59): </label>

                        <div className="vm-input-group a" style={{ fontSize: '0.9em' }}>
                            <span className="label"> Male: {selectedDisaster.sexBreakdown.maleAdult}   | 
                              Female: {selectedDisaster.sexBreakdown.femaleAdult}  | 
                              Others: {selectedDisaster.sexBreakdown.othersAdult}
                            </span>
                        </div>
                      </div>
                    </div>

                    <div className="vm-input-group2">
                      <div className="aa"> 

                        <label> Minor (0-17): </label>

                        <div className="vm-input-group a" style={{ fontSize: '0.9em' }}>
                          <span className="label"> Male: {selectedDisaster.sexBreakdown.maleMinor}  | 
                            Female: {selectedDisaster.sexBreakdown.femaleMinor}  | 
                            Others: {selectedDisaster.sexBreakdown.othersMinor}
                          </span>
                        </div>
                      </div>

                    </div>
                </div>
              </div>


              </div>

              <div className="viewmore-pop">

                <div className="vm-form-group">
                  <label>No. of Pregnant Women/Lacticating Mothers</label>
                  <div className="vm-input-group">
                    <span className="icon"><i className="fa-solid fa-hashtag"></i></span>
                    <span className="label">{selectedDisaster.isPreg}</span>
                  </div>
                </div>

                <div className="vm-form-group">
                  <label>No. of 4P's</label>
                  <div className="vm-input-group">
                    <span className="icon"><i className="fa-solid fa-hashtag"></i></span>
                    <span className="label">{selectedDisaster.is4ps}</span>
                  </div>
                </div>

                <div className="vm-form-group">
                  <label>No. of PWDs</label>
                  <div className="vm-input-group">
                    <span className="icon"><i className="fa-solid fa-hashtag"></i></span>
                    <span className="label">{selectedDisaster.isPWD}</span>
                  </div>
                </div>

              </div>

              <div className="viewmore-pop">

                

                <div className="vm-form-group">
                  <label>No. of Solo Parents</label>
                  <div className="vm-input-group">
                    <span className="icon"><i className="fa-solid fa-hashtag"></i></span>
                    <span className="label">{selectedDisaster.isSolo}</span>
                  </div>
                </div>

                <div className="vm-form-group">
                  <label>No. of IP</label>
                  <div className="vm-input-group">
                    <span className="icon"><i className="fa-solid fa-hashtag"></i></span>
                    <span className="label">{selectedDisaster.isIps}</span>
                  </div>
                </div>

              </div>

          </form>
        )}
      </Modal>
    </div>
  );
};

export default Disaster;
