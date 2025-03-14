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

  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const rowsPerPage = 10;
  const totalPages = Math.ceil(disasters.length / rowsPerPage);

  const [selectedDisaster, setSelectedDisaster] = useState(null);
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

  const handleAddDisaster = () => {
    navigate("/disaster/add-disaster"); 
  };

  const handleUploadCsvClick = () => {
    setModalType("upload");
    setIsModalOpen(true);
  };

  const handleAddAffFam = (disaster) => {
    setModalType("addAffectedFamily"); 
    setSelectedDisaster(disaster); 
    setIsModalOpen(true);
  };
  
  const handleConfirm = (disaster) => {
    setModalType("confirmDamageCategory"); 
    setSelectedDisaster(disaster); 
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
{/** 
  const handleFileUpload = async (event) => {
    event.preventDefault();
 
    if (file) {
      setIsUploading(true);
 
      // Parse the CSV file
      Papa.parse(file, {
        header: true,
        complete: async (result) => {
          const parsedData = result.data;
          const collectionRef = collection(db, "disasters"); // Replace with your Firestore collection name
 
          // Map the CSV fields to single-word keys
          const mappedData = parsedData.map(row => ({
            barangays: row["Affected Barangays"],
            contact: row["Camp Manager Contact"],
            disasterCode: row["Disaster Code"],
            disasterDate: row["Disaster Date"],
            disasterType: row["Disaster Type"],
            familiesInEC: row["No. Of Families Inside ECs"],
            affectedFamilies: row["No. of Affected Families"],
            affectedPersons: row["No. of Affected Persons"],
            indigenousPeoples: row["Number of Indigenous Peoples"],
            lactatingMothers: row["Number of Lactating Mothers"],
            pwds: row["Number of PWDs"],
            pregnantWomen: row["Number of Pregnant Women"],
            soloParents: row["Number of Solo Parents"],
            assistanceNeeded: row["Services/Assistance Needed"],
            sexBreakdown: row["Sex Breakdown"],
          }));
 
          // Upload each transformed row to Firestore
          for (const row of mappedData) {
            try {
              console.log("Uploading row:", row); // Log row being uploaded
              await addDoc(collectionRef, row); // Upload row to Firestore
             
              console.log("Disaster Code:", row.disasterCode); // Check the disasterCode value
              if (!row.disasterCode) {
                console.error("Missing disaster code for row:", row); // Log if disasterCode is missing
                return; // Skip the row if disasterCode is missing
              }
            } catch (error) {
              console.error("Error uploading row:", row, error); // Log the row that failed
            }
          }

 
          setIsUploading(false);
          setIsModalOpen(false);
          alert("File upload process completed!");
          window.location.reload();
        },
        error: (error) => {
          console.error("Error parsing CSV file:", error);
          setIsUploading(false);
          alert("Error parsing CSV file: " + error.message);
          
        },
      });
    }
  };

*/}

  //fetch disaster
//fetch disaster
useEffect(() => {
  const fetchDisasters = async () => {
    try {
      const response = await axios.get("http://localhost:3003/get-disasters");
      const disasterData = response.data;
      console.log("Disasters from DB:", disasterData);

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

          console.log ("hehe", is4ps)

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

      console.log("Transformed Disasters (By Barangay):", transformedData);
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


  const displayDisasters = filteredDisasters.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
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

            <table>
            <thead>
              <tr>
                <th rowSpan="2" className="wide-column">Disaster Code</th>
                <th rowSpan="2" className="wide-column">Disaster Type</th>
                <th rowSpan="2" className="wide-column">Disaster Date</th>
                <th rowSpan="2" className="wide-column">Affected Barangay</th>
                <th rowSpan="2" className="wide-column">No. of Affected Families</th>
                <th rowSpan="2" className="wide-column">No. of Affected People</th>
                <th colSpan="5" className="action-column">Actions</th>
              </tr>
              <tr>
                <th className="action-column">Add</th>
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
                      <td>{disaster.affectedFamilies}</td>
                      <td>{disaster.affectedPersons}</td>
                      <td className="action-column">
                        <button className="dash-viewmore-btn" onClick={() => handleAddAffFam(disaster)}>
                          <LuClipboardPlus />
                        </button>
                      </td>
                      <td className="action-column">
                        <button className="dash-viewmore-btn" onClick={() => handleConfirm(disaster)}>
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

            {/*wala pa ni css */}
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
          : modalType === "confirmDamageCategory" 
          ? "Confirm Damage Category" 
          : modalType === "viewmore" 
          ? "Distribution Details" 
          : ""
      }>
        {modalType === "addAffectedFamily" && (
          <div>
            <AddAffFam/>
          </div>
        )}

        {modalType === "confirmDamageCategory" && (
          <div>
            <ConAffFam/>
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
