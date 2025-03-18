import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaUsers, FaDownload, FaFire, FaTint, FaFlag } from "react-icons/fa";
import jsPDF from "jspdf";
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

import Pagination from "./again/Pagination";
import Search from "./again/Search-filter";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState("SPORADIC");
  const fdrRef = useRef(null);
  const sporadicRef = useRef(null);

  useEffect(() => { 
    const fetchReports = async () => {
      try {
        const response = await axios.get("http://localhost:3003/get-disasters");
        const data = response.data;
  
        // Aggregate data by disaster
        const aggregatedReports = data.map(disaster => {
          const totalFamilies = disaster.barangays.reduce((sum, barangay) => 
            sum + barangay.affectedFamilies.length, 0
          );
          const barangayNames = disaster.barangays.map(barangay => barangay.name).join(", ");
          const affectedFamilies = disaster.barangays.flatMap(barangay => barangay.affectedFamilies);

          const formattedDate = new Date(disaster.disasterDateTime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
          
          const formattedTime = new Date(disaster.disasterDateTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          
          const dateTime = `${formattedDate} ${formattedTime}`;
  
          return {
            id: disaster.disasterCode,
            date: dateTime,
            barangays: barangayNames,
            type: disaster.disasterType,
            households: totalFamilies,
            families: affectedFamilies, // Use the flattened array of affected families
          };
        });
  
        setReports(aggregatedReports);
        setFilteredReports(aggregatedReports); 
      } catch (error) {
        console.error("Failed to fetch disaster reports:", error);
      }
    };
  
    fetchReports();
  }, []);

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

  const getDistributionForReport = (reportId) => {
    return distribution.filter(item => item.disasterCode === reportId);
  };  
  
  // Function to assign the correct icon based on type
  const getIcon = (type) => {
    const iconMap = {
      "Fire Incident": <FaFire />,
      "Flooding": <FaTint />,
      "Typhoon": <FaTint />,
      "Landslide": <FaTint />,
      "Earthquake": <FaTint />,
      "Armed Conflict": <FaFlag />,
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

  const handleDownloadPDF = () => {
    const activeRef = activeTab === "SPORADIC" ? sporadicRef : fdrRef;
    const orientation = activeTab === "SPORADIC" ? "landscape" : "portrait";
    const pageWidth = orientation === "landscape" ? 297 : 210;  // A4 width in mm
    const pageHeight = orientation === "landscape" ? 210 : 297;  // A4 height in mm

    // Define margins (in mm)
    const topMargin = 20;
    const bottomMargin = 20;
    const leftMargin = 15;
    const rightMargin = 15;

    if (activeRef.current) {
        html2canvas(activeRef.current, { scale: 2 }).then((canvas) => {
            const pdf = new jsPDF(orientation, "mm", "a4");
            const imgData = canvas.toDataURL("image/png");

            // Adjust image size based on margins
            const imgWidth = pageWidth - leftMargin - rightMargin;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const usablePageHeight = pageHeight - topMargin - bottomMargin;

            let position = 0;
            let pageCount = Math.ceil(imgHeight / usablePageHeight);

            for (let i = 0; i < pageCount; i++) {
                if (i > 0) pdf.addPage();  // Add a new page if not the first

                // Calculate the part of the canvas to be added on the current page
                const srcY = i * usablePageHeight * (canvas.height / imgHeight);
                const sHeight = Math.min(canvas.height - srcY, usablePageHeight * (canvas.height / imgHeight));

                // Create a temporary canvas to crop the current part
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = canvas.width;
                tempCanvas.height = sHeight;

                const ctx = tempCanvas.getContext("2d");
                ctx.drawImage(canvas, 0, srcY, canvas.width, sHeight, 0, 0, canvas.width, sHeight);

                const tempImgData = tempCanvas.toDataURL("image/png");

                pdf.addImage(
                    tempImgData,
                    "PNG",
                    leftMargin,
                    topMargin,
                    imgWidth,
                    (sHeight * imgWidth) / canvas.width
                );
            }

            pdf.save(`${activeTab}-report.pdf`);
        });
        }
    };




    const [filteredReports, setFilteredReports] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterOptions, setFilterOptions] = useState({ type: "Yearly", year: 2024 });
    
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
      let filteredData = reports;
  
      if (filter.type === "Yearly") {
        filteredData = reports.filter((report) => report.year === filter.year);
      } else if (filter.type === "Monthly") {
        filteredData = reports.filter(
          (report) => report.year === filter.year && report.month === filter.month
        );
      }
  
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

  return (
    <div className="reports">

    {selectedReport && (
      <div className="bck-btn">
        <button className="back-btn" onClick={() => setSelectedReport(null)}>
        <i className="fa-solid fa-chevron-left"></i>
          Back
        </button>
      </div>
    )}


      <div className="container">

                    <div className="dstr-search">
                        <Search onSearch={handleSearchChange} onFilter={handleFilter} />
                    </div>

        {!selectedReport ? (
        <div className="report-list-container">
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
                    <h3>{report.date}</h3>
                    <p className="barangay-name">{report.barangays}</p>
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
                No disasters under that filter.
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
            
            <div className="report-content-box">
              <div>
                <button className="download-btn" onClick={handleDownloadPDF}>
                  <FaDownload /> Download Report
                </button>
              </div>

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
                  <Payroll />
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
