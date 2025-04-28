import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { useLocation } from "react-router-dom";
import { FaUsers, FaDownload, FaFire, FaTint, FaFlag } from "react-icons/fa";
import { MdFlood, MdLandslide  } from "react-icons/md";
import { GiEntangledTyphoon, GiMachineGunMagazine } from "react-icons/gi";
import { FiDownload } from "react-icons/fi";
import { RiEarthquakeFill } from "react-icons/ri";
import * as XLSX from "xlsx";
import jsPDF  from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import "../css/Reports.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

import FDR from  "./forms/FDR";
import SPORADIC from  "./forms/SPORADIC";
import Payroll from "./forms/Payroll";

import fireIncident from "../pic/fire.jpg";
import flooding from "../pic/rain.jpg";
import typhoon from "../pic/typhoon.png";
import landslide from "../pic/landslide.jpg";
import earthquake from "../pic/earthquake.png";
import armedConflict from "../pic/armedconflict.png";
import ConfirmationDialog from "./again/Confirmation";
import Search from "./again/Search-filter";
import Pagination from "./again/Pagination";

const Reports = ({setNavbarTitle}) => {
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState("SPORADIC");
  const [brgyNames, setBrgyNames] = useState("SPORADIC");
  const [disasters, setDisasters] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    type: "",       // 'save', 'delete', 'add'
    title: "",
    message: "",
    onConfirm: null,
  });

  const handleCancelConfirm = () => {
    setConfirmDialog({ ...confirmDialog, show: false });
  };


  const fdrRef = useRef(null);
  const sporadicRef = useRef(null);
  const payrollRef = useRef(null);

    useEffect(() => {
      if (location.pathname === "/reports") {
        setNavbarTitle("Reports");
      }
    }, [location.pathname, setNavbarTitle]);

    console.log(reports)


  useEffect(() => {
    const countAffectedFamilies = (barangays) => {
      return barangays.reduce((total, barangay) => {
        return total + (barangay.affectedFamilies ? barangay.affectedFamilies.length : 0);
      }, 0);
    };    
    const transformDisasters = (data) => {
      return data
        .sort((a, b) => new Date(b.disasterDateTime) - new Date(a.disasterDateTime))
        .map(disaster => {
          const barangays = disaster.barangays.map(barangay => ({
            name: barangay.name,
            affectedFamilies: barangay.affectedFamilies,
          }));
    
          const totalFamilies = countAffectedFamilies(disaster.barangays);
    
          const date = new Date(disaster.disasterDateTime);
          const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
    
          const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
    
          return {
            id: disaster.disasterCode,
            date: formattedDate,
            time: formattedTime,
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            barangays, // now barangays is an array with { name, affectedFamilies }
            type: disaster.disasterType,
            households: totalFamilies,
          };
        });
    };
  
    const fetchReports = async () => {
      const localData = localStorage.getItem("disasters");
  
      // Use cached and transformed data immediately (offline-friendly)
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          const cachedReports = transformDisasters(parsed);
          setReports(cachedReports);
          setFilteredReports(cachedReports);
        } catch (e) {
          console.error("Error parsing cached disaster data:", e);
        }
      }
  
      // Try to fetch fresh data
      try {
        const response = await axios.get("http://localhost:3003/get-disasters");
        const data = response.data;
  
        const aggregatedReports = transformDisasters(data);
  
        setReports(aggregatedReports);
        setFilteredReports(aggregatedReports);
  
        // Update localStorage with fresh data
        localStorage.setItem("disasters", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch disaster reports:", error);
      }
    };
  
    fetchReports();
  }, []);
  

  useEffect(() => {
    const localData = localStorage.getItem("distributions");
    if (localData) {
      const parsed = JSON.parse(localData);
      setDistribution(parsed);
    }

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

  const getDistributionForReport = (reportId) => {
    return distribution.filter(item => item.disasterCode === reportId);
  };  
  
  // Function to assign the correct icon based on type
  const getIcon = (type) => {
    const iconMap = {
      "Fire Incident": <FaFire />,
      "Flood": <MdFlood />,
      "Typhoon": <GiEntangledTyphoon />,
      "Landslide": <MdLandslide />,
      "Earthquake": <RiEarthquakeFill />,
      "Armed Conflict": <GiMachineGunMagazine />,
    };
    return iconMap[type] || null; // Default to null if type is unknown
  };

  // Function to assign the correct label color based on type
  const getLabelColor = (type) => {
    const colorMap = {
      "Fire Incident": "red",
      "Flood": "blue",
      "Typhoon": "orange",
      "Landslide": "brown",
      "Earthquake": "black",
      "Armed Conflict": "green",
    };
    return colorMap[type] || "gray"; // Default to gray if type is unknown
  };

  // Function to assign the correct image based on type
  const getImage = (type) => {
    const imageMap = {
      "Fire Incident": fireIncident,
      "Flood": flooding,
      "Typhoon": typhoon,
      "Landslide": landslide,
      "Earthquake": earthquake,
      "Armed Conflict": armedConflict,
    };
    return imageMap[type] || fireIncident; // Default fallback
  };

    const handlePrint = async () => {
      const activeRef = activeTab === "SPORADIC" ? sporadicRef : activeTab === "FDR" ? fdrRef : payrollRef;
    
      let orientation = "portrait";
      let pageSize = "a4"; 
    
      if (activeTab === "SPORADIC") {
        orientation = "landscape";
        pageSize = "a4";
      } else if (activeTab === "Payroll") {
        orientation = "landscape";
        pageSize = [215.9, 330.2]; 
      }
    
      const doc = new jsPDF(orientation, "mm", pageSize);
      let y = 10;
    
      const addElementToPDF = async (elementId, yOffset = 10, align = "left") => {
        const element = document.querySelector(elementId);
        if (!element) {
          console.error(`Element ${elementId} not found`);
          return;
        }
    
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = doc.internal.pageSize.width - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
        let x = 10;
        if (align === "center") {
          const pageWidth = doc.internal.pageSize.width;
          x = (pageWidth - imgWidth) / 2;
        }
    
        doc.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
        y += imgHeight + yOffset;
      };
    
      if (activeTab === "SPORADIC") {
        await addElementToPDF(".header", 1, "center");
    
        const sporadicTable = document.querySelector("#yourTableID");
        if (sporadicTable) {
          const headers = [
            ["No.", "Name", "Age", "Sex", "Brgy. Address", "No. of Dependents", "Type of Calamity", "Date of Calamity", "Category", "Senior Citizen", "PWD", "Solo Parent", "Pregnant", "Lactating Mothers", "Livelihood"],
          ];
    
          const body = [];
          sporadicTable.querySelectorAll("tbody tr").forEach((tr) => {
            const rowData = [];
            tr.querySelectorAll("td").forEach((td) => {
              rowData.push(td.innerText.trim());
            });
            body.push(rowData);
          });
    
          autoTable(doc, {
            startY: y + 5,
            head: headers,
            body: body,
            styles: { fontSize: 8, halign: "center" },
            theme: "grid",
          });
    
          y = doc.lastAutoTable.finalY + 10;
        }
    
        await addElementToPDF(".table-container1", 5);
        await addElementToPDF(".reco", 10);
        await addElementToPDF(".footer", 10);
    
      } else if (activeTab === "FDR") {
        if (!fdrRef.current) {
          console.error("FDR content not found!");
          return;
        }
    
        try {
          const canvas = await html2canvas(fdrRef.current, { scale: 2, useCORS: true });
          const imgData = canvas.toDataURL("image/png");
          const imgWidth = doc.internal.pageSize.width - 20;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
          doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        } catch (error) {
          console.error("Error generating FDR print:", error);
        }
    
      } else if (activeTab === "Payroll") {
        if (!payrollRef.current) {
          console.error("Payroll content not found!");
          return;
        }
    
        try {
          const canvas = await html2canvas(payrollRef.current, { scale: 2, useCORS: true });
          const imgData = canvas.toDataURL("image/png");
          const imgWidth = doc.internal.pageSize.width - 10;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
          doc.addImage(imgData, "PNG", (doc.internal.pageSize.width - imgWidth) / 2, 10, imgWidth, imgHeight);
        } catch (error) {
          console.error("Error generating Payroll print:", error);
        }
      }
    
      doc.autoPrint();
      window.open(doc.output("bloburl"), "_blank");
    };
  
    const handleDownloadPDF = async () => {
      setConfirmDialog({
        show: true,
        type: "save",
        title: "Confirm Download",
        message: "Are you sure you want to download this form?",
        onConfirm: async () => {
          setConfirmDialog(prev => ({ ...prev, show: false })); // Close dialog after confirming
    
          const activeRef = activeTab === "SPORADIC" ? sporadicRef : activeTab === "FDR" ? fdrRef : payrollRef;
    
          // Set page size and orientation based on activeTab
          let orientation = "portrait";
          let pageSize = "a4"; // Default A4 size
          
          if (activeTab === "SPORADIC") {
            orientation = "landscape";
            pageSize = "a4";
          } else if (activeTab === "Payroll") {
            orientation = "landscape";
            pageSize = [215.9, 330.2]; // Folio size
          }
    
          const doc = new jsPDF(orientation, "mm", pageSize);
          let y = 10; // Initial Y position
    
          const addElementToPDF = async (elementId, yOffset = 10, align = "left") => {
            const element = document.querySelector(elementId);
            if (!element) {
              console.error(`Element ${elementId} not found`);
              return;
            }
        
            const canvas = await html2canvas(element);
            const imgData = canvas.toDataURL("image/png");
            const imgWidth = doc.internal.pageSize.width - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
            let x = 10;
            if (align === "center") {
              const pageWidth = doc.internal.pageSize.width;
              x = (pageWidth - imgWidth) / 2;
            }
        
            doc.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
            y += imgHeight + yOffset;
          };
    
          // (YOUR WHOLE LONG CODE GOES HERE — sporadic, FDR, payroll generation)
          // I won’t repeat the whole internal logic because you don't need to change it!
    
          // Final save
          doc.save(`${activeTab.toLowerCase()}-report.pdf`);
        }
      });
    };
    
    
    //for search
    const handleSearchChange = (query) => {
      setCurrentPage(1);
      setSearchQuery(query);

      if (!query.trim()) {
        // If search is empty, show all reports
        setFilteredReports(reports);
        return;
      }
    
      // Apply filtering based on the query
      const filtered = reports.filter(report =>
        report.type.toLowerCase().includes(query.toLowerCase()) ||
        report.barangays.toLowerCase().includes(query.toLowerCase())
      );
    
      setFilteredReports(filtered);
    };

    const handleFilter = (filter) => {
      if (!filter.year) {
        setFilteredReports(reports);
        return;
      }
      console.log("Filter selected:", filter);
    
      let filteredData = reports.filter((report) => {
        const reportDate = new Date(report.date);
        const reportYear = reportDate.getFullYear();
        const reportMonth = reportDate.toLocaleString("en-US", { month: "short" });
    
        if (filter.type === "Yearly") {
          return reportYear === Number(filter.year); // Ensure year comparison is accurate
        } else if (filter.type === "Monthly") {
          return reportYear === Number(filter.year) && reportMonth === filter.month;
        }
        
        return true;
      });
    
      console.log("Filtered Reports:", filteredData);
      setFilteredReports(filteredData);
    };

      //pagination ni 
      const reportsPerPage = 8; // 4 columns x 4 rows
      const [currentPage, setCurrentPage] = useState(1);
      
      // Calculate total pages dynamically
      const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
    
      // Get reports for the current page
      const startIndex = (currentPage - 1) * reportsPerPage;
      const currentReports = filteredReports.slice(startIndex, startIndex + reportsPerPage);

      const paginatedReports = filteredReports.slice(
        (currentPage - 1) * reportsPerPage,
        currentPage * reportsPerPage
      );

        // Function to transform data per barangay (only for download)
        const transformDataForDownload = async () => {
          try {
            const response = await axios.get("http://172.20.10.2:3003/get-disasters");
            const disasterData = response.data;
        
            const transformed = disasterData.flatMap(disaster =>
              (disaster.barangays || []).map(brgy => {
                let maleCount = 0, femaleCount = 0, is4ps = 0, isPWD = 0, isPreg = 0, isIps = 0, isSolo = 0;
        
                (brgy.affectedFamilies || []).forEach(family => {
                  if (family.sex === "M") maleCount++;
                  if (family.sex === "F") femaleCount++;
        
                  (family.dependents || []).forEach(dependent => {
                    if (dependent.sex === "Male") maleCount++;
                    if (dependent.sex === "Female") femaleCount++;
                  });
        
                  if (family.is4ps) is4ps++;
                  if (family.isPWD) isPWD++;
                  if (family.isPreg) isPreg++;
                  if (family.isIps) isIps++;
                  if (family.isSolo) isSolo++;
                });
        
                const dateObj = new Date(disaster.disasterDateTime);
        
                return {
                  disasterCode: disaster.disasterCode,
                  disasterType: disaster.disasterType,
                  disasterDateObj: dateObj, // for sorting
                  disasterDate: moment(dateObj).format("MMMM D, YYYY"),
                  disasterTime: moment(dateObj).format("h:mm A"),
                  barangay: brgy.name || "Unknown",
                  affectedFamilies: brgy.affectedFamilies?.length ?? 0,
                  affectedPersons: brgy.affectedFamilies?.reduce(
                    (sum, fam) => sum + 1 + (fam.dependents?.length || 0), 0
                  ) ?? 0,
                  sexBreakdown: `M: ${maleCount} | F: ${femaleCount}`,
                  isPreg,
                  is4ps,
                  isPWD,
                  isSolo,
                  isIps
                };
              })
            );
        
            // Sort by latest disaster date
            transformed.sort((a, b) => b.disasterDateObj - a.disasterDateObj);
        
            // Map to Excel-ready format
            return transformed.map(item => ({
              "Disaster Code": item.disasterCode,
              "Disaster Type": item.disasterType,
              "Disaster Date": item.disasterDate,
              "Disaster Time": item.disasterTime,
              "Affected Barangay": item.barangay,
              "No. of Affected Families": item.affectedFamilies,
              "No. of Affected People": item.affectedPersons,
              "Sex Breakdown": item.sexBreakdown,
              "No. of Pregnant Women/Lactating Mothers": item.isPreg,
              "No. of 4P's": item.is4ps,
              "No. of PWDs": item.isPWD,
              "No. of Solo Parents": item.isSolo,
              "No. of IP": item.isIps,
            }));
        
          } catch (error) {
            console.error("Error transforming disaster data:", error);
            return [];
          }
        };

        const handleDownloadAllReports = async () => {
          const formattedData = await transformDataForDownload();
          if (!formattedData.length) return;
      
          const worksheet = XLSX.utils.json_to_sheet(formattedData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Disaster Reports");
          XLSX.writeFile(workbook, "Disaster_Reports.xlsx");
        };

  return (
    <div className="reports">

    {confirmDialog.show && (
      <ConfirmationDialog
        type={confirmDialog.type}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={handleCancelConfirm}
      />
    )}  

    {selectedReport && (
      <div className="bck-btn">
        <button className="back-btn" onClick={() => setSelectedReport(null)}>
        <i className="fa-solid fa-chevron-left"></i>
          Back
        </button>
      </div>
    )}


      <div className="container">

        {!selectedReport ? (
          
        <div className="report-list-container">

          <div className="search-row">
            {/* Disaster Count on the Left */}
            <div className="disaster-count-section">
              <button className="download-btn" onClick={handleDownloadAllReports}>
                <FiDownload style={{ marginRight: "6px" }} />
              </button>

              <div className="disaster-count">
                {filteredReports.length === 0
                  ? ""
                  : `${filteredReports.length} ${filteredReports.length === 1 ? "disaster" : "disasters"} reported`}
              </div>

            </div>

            {/* Search in the Center */}
            <div className="search-wrapper" >
              <Search onSearch={handleSearchChange} onFilter={(filter) => handleFilter({
                type: filter.type,
                year: Number(filter.year),
                month: filter.month
              })} />
            </div>
          </div>


          <div className="report-list">
            {paginatedReports.length > 0 ? (
              /* }//Step 1: Display report cards*/
              paginatedReports.map((report) => (
                <div key={report.id} className="report-card" onClick={() => setSelectedReport(report)} style={{ cursor: "pointer" }}>
                  <div className="report-image" style={{ backgroundImage: `url(${getImage(report.type)})` }}>
                    <span className="report-label" style={{ backgroundColor: getLabelColor(report.type) }}>
                      <span className="icon">{getIcon(report.type)}</span> {report.type}
                    </span>
                  </div>
                  <div className="report-content">

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', width: '100%', margin: '0 0 10px 0' }}>
                  <h3>
                    {new Date(report.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })} — {report.time}
                  </h3>

                  </div>

                
                  <p className="barangay-name">
                    {report.barangays.map((barangay, index) => (
                      <React.Fragment key={index}>
                        {barangay.name} ({barangay.affectedFamilies.length})
                        {index !== report.barangays.length - 1 && ", "}
                      </React.Fragment>
                    ))}
                  </p>
                    <p className="report-type">{report.type}</p>
                    <div className="report-info">
                      <span><FaUsers /> {report.households} Families</span>
                      <span className="download-icon"><FaDownload /></span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-disaster-message">
              {searchQuery ? "No disasters match your search." : "No disaster record available."}
            </p>
            )}

          </div>

          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

        </div>
        ) : (
          // Step 2: Display report details (similar to uploaded image)
          <div className="report-preview">

            <div className="upper">

              <div className="tabs">
                <button className={activeTab === "SPORADIC" ? "tab active" : "tab"} onClick={() => setActiveTab("SPORADIC")}>
                  SPORADIC
                </button>
                <button className={activeTab === "FDR" ? "tab active" : "tab"} onClick={() => setActiveTab("FDR")}>
                  FDR
                </button>
                <button className={activeTab === "Payroll" ? "tab active" : "tab"} onClick={() => setActiveTab("Payroll")}>
                  Payroll
                </button>
              </div>

              <div className="buttons">
                <button className="download-btn" onClick={handleDownloadPDF}>
                  <FaDownload /> Download
                </button>
                <button className="print-btn" onClick={handlePrint}>
                  <i className="fa-solid fa-print"></i> Print
                </button>

              </div>

            </div>



            
            <div className="report-content-box">

              <div className="form-container">
                {activeTab === "SPORADIC" ? (
                  <div ref={sporadicRef}>
                    <SPORADIC report={selectedReport} distribution={getDistributionForReport(selectedReport.id)} />
                  </div>
                ) : activeTab === "FDR" ? (
                  <div ref={fdrRef}>
                    <FDR report={selectedReport} distribution={getDistributionForReport(selectedReport.id)} />
                  </div>
                ) : activeTab === "Payroll" ? (
                  <div ref={payrollRef}>
                    <Payroll report={selectedReport} />
                  </div>
                ) : null}

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;
