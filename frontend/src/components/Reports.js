import React from "react";
import { FaUsers, FaDownload, FaFire, FaTint, FaFlag } from "react-icons/fa";
import "../css/Reports.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

import fireIncident from "../pic/fire.jpg";
import flooding from "../pic/rain.jpg";
import armedConflict from "../pic/armedconflict.png";

const Reports = () => {
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

  // Function to assign the correct icon based on type
  const getIcon = (type) => {
    const iconMap = {
      "Fire Incident": <FaFire />,
      "Flooding": <FaTint />,
      "Armed Conflict": <FaFlag />,
    };
    return iconMap[type] || null; // Default to null if type is unknown
  };

  // Function to assign the correct label color based on type
  const getLabelColor = (type) => {
    const colorMap = {
      "Fire Incident": "red",
      "Flooding": "blue",
      "Armed Conflict": "green",
    };
    return colorMap[type] || "gray"; // Default to gray if type is unknown
  };

  // Function to assign the correct image based on type
  const getImage = (type) => {
    const imageMap = {
      "Fire Incident": fireIncident,
      "Flooding": flooding,
      "Armed Conflict": armedConflict,
    };
    return imageMap[type] || fireIncident; // Default fallback
  };

  return (
    <div className="reports">
      <div className="container">
        {reports.map((report) => (
          <div key={report.id} className="report-card">
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
        ))}
      </div>
    </div>
  );
};

export default Reports;
