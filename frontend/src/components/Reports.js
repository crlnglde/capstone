import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaDownload, FaFire, FaTint, FaFlag } from "react-icons/fa";
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

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState("SPORADIC");

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

        {!selectedReport ? (
          <div className="report-list">
          
          {/* }//Step 1: Display report cards*/}
          {reports.map((report) => (
            <div
              key={report.id}
              className="report-card"
              onClick={() => setSelectedReport(report)}
              style={{ cursor: "pointer" }}
            >
              <div className="report-image" style={{ backgroundImage: `url(${getImage(report.type)})` }}>
                <span
                  className="report-label"
                  style={{ backgroundColor: getLabelColor(report.type) }}
                >
                  <span className="icon">{getIcon(report.type)}</span> {report.type}
                </span>
              </div>
              <div className="report-content">
                <h3>{report.date}</h3>
                <p className="barangay-name">{report.barangay}</p>
                <p className="report-type">{report.type}</p>
                <div className="report-info">
                  <span>
                    <FaUsers /> {report.households} Families
                  </span>
                  <span className="download-icon">
                    <FaDownload />
                  </span>
                </div>
              </div>
            </div>
          ))}
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
                <button className="download-btn">
                  <FaDownload /> Download Report
                </button>
              </div>

              <div className="form-container">
              
                {activeTab === "SPORADIC" ? (
                  <SPORADIC report={selectedReport} distribution={getDistributionForReport(selectedReport.id)}/>
                ) : activeTab === "FDR" ? (
                  <FDR report={selectedReport} distribution={getDistributionForReport(selectedReport.id)} />
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
