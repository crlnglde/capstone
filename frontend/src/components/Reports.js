import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaDownload, FaFire, FaTint, FaFlag } from "react-icons/fa";
import "../css/Reports.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

import fireIncident from "../pic/fire.jpg";
import flooding from "../pic/rain.jpg";
import typhoon from "../pic/typhoon.png";
import landslide from "../pic/landslide.jpg";
import earthquake from "../pic/earthquake.png";
import armedConflict from "../pic/armedconflict.png";

const Reports = () => {
  const [reports, setReports] = useState([]);

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

          return {
            id: disaster.disasterCode,
            date: new Date(disaster.disasterDateTime).toLocaleDateString(),
            barangays: barangayNames,
            type: disaster.disasterType,
            households: `${totalFamilies} Families`
          };
        });

        setReports(aggregatedReports);
      } catch (error) {
        console.error("Failed to fetch disaster reports:", error);
      }
    };

    fetchReports();
  }, []);

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
              <p className="barangay-name">Affected Barangays: {report.barangays}</p>
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
