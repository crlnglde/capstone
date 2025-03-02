import React, { useState } from "react";
import { FaUsers, FaDownload, FaFire, FaTint, FaFlag } from "react-icons/fa";
import "../css/Reports.css";
import FDR from  "./forms/FDR";
import RDS from  "./forms/RDS";
import fireIncident from "../pic/fire.jpg";
import flooding from "../pic/rain.jpg";
import armedConflict from "../pic/armedconflict.png";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState("RDS");

  const reports = [
    {
      id: 1,
      date: "01/01/24",
      barangay: "Barangay Tibanga",
      type: "Fire Incident",
      households: "10 Families",
    },
    {
      id: 2,
      date: "01/01/24",
      barangay: "Barangay Tambacan",
      type: "Flooding",
      households: "10 Families",
    },
    {
      id: 3,
      date: "01/01/24",
      barangay: "Barangay Tibanga",
      type: "Armed Conflict",
      households: "10 Families",
    },
  ];

  const getIcon = (type) => ({
    "Fire Incident": <FaFire />,
    "Flooding": <FaTint />,
    "Armed Conflict": <FaFlag />,
  }[type] || null);

  const getLabelColor = (type) => ({
    "Fire Incident": "red",
    "Flooding": "blue",
    "Armed Conflict": "green",
  }[type] || "gray");

  const getImage = (type) => ({
    "Fire Incident": fireIncident,
    "Flooding": flooding,
    "Armed Conflict": armedConflict,
  }[type] || fireIncident);

  return (
    <div className="reports">
      <div className="container">
        {!selectedReport ? (
          // Step 1: Display report cards
          reports.map((report) => (
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
                    <FaUsers /> {report.households}
                  </span>
                  <span className="download-icon">
                    <FaDownload />
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Step 2: Display report details (similar to uploaded image)
          <div className="report-preview">
            <div className="tabs">
              <button className={activeTab === "RDS" ? "tab active" : "tab"} onClick={() => setActiveTab("RDS")}>
                RDS
              </button>
              <button className={activeTab === "FDR" ? "tab active" : "tab"} onClick={() => setActiveTab("FDR")}>
                FDR
              </button>
            </div>
            <div className="report-content-box">
              <div>
                <button className="download-btn">
                  <FaDownload /> Download Report
                </button>
                <button className="back-btn" onClick={() => setSelectedReport(null)}>
                  Back
                </button>
              </div>
              <div className="form-container">
                {activeTab === "RDS" ? <RDS report={selectedReport} /> : <FDR report={selectedReport} />}
              </div>
            </div>
          </div>

        )}
      </div>
    </div>
  );
};

export default Reports;
