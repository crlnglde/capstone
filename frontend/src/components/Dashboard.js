import React, { useEffect, useState } from "react";
import { useNavigate} from 'react-router-dom'; 
import axios from "axios";
import Papa from 'papaparse';
import moment from "moment";
import { LuClipboardPlus } from "react-icons/lu";
import { GiConfirmed } from "react-icons/gi";
import Ling from './visualizations/Line-gr'
import Barc from './visualizations/Bar-ch'
import Piec from './visualizations/Pie-ch'
import Map from './visualizations/Iligan'
import Modal from "./Modal";
import AddAffFam from "./reusable/AddAffFam";
import EditAffFam from "./reusable/EditAffFam";
import ConAffFam from "./reusable/ConAffFam";
import "../css/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isUploading, setIsUploading] = useState(false); 
  const [file, setFile] = useState(null);

  const [disasters, setDisasters] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [disCode, setSelectedDisCode] = useState(null);
  const [disBarangay, setDisBarangay] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeTab, setActiveTab] = useState("list");

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

  const handleAddAffFam = (disCode, disBarangay) => {
    setModalType("addAffectedFamily"); 
    setSelectedDisCode(disCode); 
    setDisBarangay(disBarangay); 
    setIsModalOpen(true);
  };
  const handleEditAffFam = (disCode, disBarangay) => {
    setModalType("editAffectedFamily"); 
    setSelectedDisCode(disCode); 
    setDisBarangay(disBarangay); 
    setIsModalOpen(true);
  };
  
  const handleConfirm = (disCode, disBarangay) => {
    setModalType("confirmDamageCategory"); 
    setSelectedDisCode(disCode); 
    setDisBarangay(disBarangay); 
    setIsModalOpen(true); 
  };
  
  const handleViewMore = (disaster) => {
    setModalType("viewmore"); 
    setSelectedDisaster(disaster); 
    setIsModalOpen(true); 
  };

  const closeModal = () => setIsModalOpen(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

//fetch disaster
useEffect(() => {
  const fetchDisasters = async () => {
    try {
      const response = await axios.get("http://localhost:3003/get-disasters");
      const disasterData = response.data;

      if (!Array.isArray(disasterData)) {
        console.error("Error: Expected an array but got", disasterData);
        return;
      }


      // Transform data so each barangay has its own row
      const transformedData = disasterData.flatMap((disaster) =>
        (disaster.barangays || []).map((brgy) => {
          // Initialize gender counts
          let maleCount = 0, femaleCount = 0,  is4ps = 0, isPWD = 0, isPreg = 0, isIps = 0, isSolo = 0;;

          // Count males and females in affected families
          brgy.affectedFamilies.forEach(family => {
            if (family.sex === "M") maleCount++;
            if (family.sex === "F") femaleCount++;

            // Count dependents' genders
            family.dependents?.forEach(dependent => {
              if (dependent.sex === "Male") maleCount++;
              if (dependent.sex === "Female") femaleCount++;
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
            disasterDateTime: moment(disaster.disasterDateTime).format("MMMM D, YYYY h:mm A"),
            barangay: brgy.name || "Unknown",
            affectedFamilies: Array.isArray(brgy.affectedFamilies) ? brgy.affectedFamilies.length : 0,
            affectedPersons: brgy.affectedFamilies.reduce(
              (sum, family) => sum + 1 + (family.dependents ? family.dependents.length : 0),
              0
            ),
            sexBreakdown: {
              males: maleCount,
              females: femaleCount
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
    } catch (error) {
      console.error("Error fetching disasters data:", error);
    }
  };

    fetchDisasters();  // Call the function to fetch data
  }, []);

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    console.log("Search Query: ", query); // Debugging the query
  };
 
  const filteredDisasters = disasters.filter((disaster) => {
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
  });  

  //page sa disasters
    const [disasterPage, setDisasterPage] = useState(1);
    const disastersPerPage = 6;
    const totalPages = Math.ceil(disasters.length / disastersPerPage);

    // Sort disastersList by disasterDateTime (latest first)
    const sortedDisasters = [...disasters].sort(
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
    <div className="dashboard">
        
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

      <div className="dashboard-container">

        {activeTab === "list" ? (

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
              {/** 
              <button className="upload-csv" onClick={handleUploadCsvClick}>
                <i className="fa-solid fa-upload"></i>
                Upload CSV
              </button>
              */}
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
                    <th className="action-column">Add</th>
                    <th className="action-column">Edit</th>
                    <th className="action-column">Confirm</th>
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
                              <td className="action-column">
                        <button className="dash-viewmore-btn" onClick={() => handleAddAffFam(disaster.disasterCode, disaster.barangay)}>
                          <LuClipboardPlus />
                        </button>
                      </td>
                      <td className="action-column">
                        <button className="dash-viewmore-btn" onClick={() => handleEditAffFam(disaster.disasterCode, disaster.barangay)}>
                          <LuClipboardPlus />
                        </button>
                      </td>
                      <td className="action-column">
                        <button className="dash-viewmore-btn" onClick={() => handleConfirm(disaster.disasterCode, disaster.barangay)}>
                          <GiConfirmed />
                        </button>
                      </td>
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
              <button
                className="nav-button prev"
                onClick={handlePrevDisaster}
                disabled={disasterPage === 1}
              >
                <i className="fa-solid fa-angle-left"></i>
              </button>

              <button
                className="nav-button next"
                onClick={handleNextDisaster}
                disabled={disasterPage === totalDisasterPages}
              >
                <i className="fa-solid fa-angle-right"></i>
              </button>
            </div>

          </div>
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
              <Ling/>
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
        modalType === "addAffectedFamily" 
          ? "Add Affected Family" 
          : modalType === "editAffectedFamily" 
          ?"Edit Affected Family"
          : modalType === "confirmDamageCategory" 
          ? "Confirm Damage Category" 
          : modalType === "viewmore" 
          ? "Disaster Details" 
          : ""
      }>
        {modalType === "addAffectedFamily" && (
          <div>
            <AddAffFam  disBarangay={disBarangay} disCode={disCode} closeModal={closeModal}/>
          </div>
        )}

{       modalType === "editAffectedFamily" && (
          <div>
            <EditAffFam  disBarangay={disBarangay} disCode={disCode}/>
          </div>
        )}    

        {modalType === "confirmDamageCategory" && (
          <div>
            <ConAffFam disBarangay={disBarangay} disCode={disCode}/>
          </div>
        )}

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
                  <div className="vm-input-group">
                    <span className="icon"><i className="fa-solid fa-user"></i></span>
                    <span className="label">M: {selectedDisaster.sexBreakdown.males} F: {selectedDisaster.sexBreakdown.females}</span>
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

export default Dashboard;
