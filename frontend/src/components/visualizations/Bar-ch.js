import React, { useEffect, useState, useMemo } from "react";
import { Bar } from 'react-chartjs-2';
import axios from "axios";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import "../../css/visualizations/Bar-ch.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarGraph = ({ barangay, year }) => {
  const [disasterTypeFilter, setDisasterTypeFilter] = useState("All");
  const [disasterDateFilter, setDisasterDateFilter] = useState("All");
  const [disasters, setDisasters] = useState([]);

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const response = await axios.get("http://localhost:3003/get-disasters");
        setDisasters(response.data);
      } catch (error) {
        console.error("Error fetching disasters data:", error);
      }
    };
    fetchDisasters();
  }, []);

  const filteredDisasters = useMemo(() => {
    return disasters.filter(disaster => {
      const disasterDate = new Date(disaster.disasterDateTime);
      const disasterYear = disasterDate.getFullYear().toString();
      const formattedDate = disasterDate.toISOString().split("T")[0];
      const matchesBarangay = barangay === "All" || disaster.barangays.some(b => b.name === barangay);
      const matchesYear = year === "All" || disasterYear === year;
      const matchesType = disasterTypeFilter === "All" || disaster.disasterType === disasterTypeFilter;
      const matchesDate = disasterDateFilter === "All" || formattedDate === disasterDateFilter;
      return matchesBarangay && matchesYear && matchesType && matchesDate;
    });
  }, [disasters, barangay, year, disasterTypeFilter, disasterDateFilter]);

  const affectedData = useMemo(() => {
    const counts = {};
    filteredDisasters.forEach(disaster => {
      disaster.barangays.forEach(b => {
        counts[b.name] = (counts[b.name] || 0) + (Array.isArray(b.affectedFamilies) ? b.affectedFamilies.length : 0);
      });
    });
    return counts;
  }, [filteredDisasters]);

  const casualtiesData = useMemo(() => {
    const counts = {};
    filteredDisasters.forEach(disaster => {
      disaster.barangays.forEach(b => {
        counts[b.name] = (counts[b.name] || 0) + (Array.isArray(b.casualties) ? b.casualties.length : 0);
      });
    });
    return counts;
  }, [filteredDisasters]);

  const data = useMemo(() => {
    const barangayNames = Object.keys(affectedData);
    return {
      labels: barangayNames,
      datasets: [
        {
          label: 'Affected Families',
          data: barangayNames.map(name => affectedData[name] || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Casualties',
          data: barangayNames.map(name => casualtiesData[name] || 0),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        }
      ]
    };
  }, [affectedData, casualtiesData]);

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
    },
    scales: {
      x: { barPercentage: 0.9, categoryPercentage: 1.0 },
      y: { beginAtZero: true },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bar-graph-container">
      <div className='bar'>
        <div className="bar-filter">
          <h2>Disaster Impact</h2>
          <div className="filters-right">
            <div className="bar-filter-container">
              <select id="disasterType" name="disasterType" onChange={(e) => setDisasterTypeFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Fire Incident">Fire Incident</option>
                <option value="Flood">Flood</option>
                <option value="Landslide">Landslide</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Typhoon">Typhoon</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bar-wrapper">
          <Bar data={data} options={options} />
        </div>
      </div>
      <div className="bar-text-overlay">
        <h2>Disaster Impact Overview</h2>
        {Object.keys(affectedData).length > 0 ? (
          <p>
            The barangay with the most affected families is <strong>
              {Object.keys(affectedData).reduce((a, b) => affectedData[a] > affectedData[b] ? a : b)}
            </strong>, while the barangay with the most casualties is <strong>
              {Object.keys(casualtiesData).reduce((a, b) => casualtiesData[a] > casualtiesData[b] ? a : b)}
            </strong>.
          </p>
        ) : (
          <p>No disaster data available.</p>
        )}
      </div>
    </div>
  );
};

export default BarGraph;
