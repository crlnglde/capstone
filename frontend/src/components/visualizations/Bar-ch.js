import React, { useEffect, useState, useMemo } from "react";
import { Bar } from 'react-chartjs-2';
import axios from "axios";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import "../../css/visualizations/Bar-ch.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarGraph = ({ barangay, year }) => {
  const [disasterTypeFilter, setDisasterTypeFilter] = useState("All");
  const [disasterDateFilter, setDisasterDateFilter] = useState("All");
  const [disasters, setDisasters] = useState([]);

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const response = await axios.get("http://localhost:3003/get-disasters");
        const disasterData = response.data;
        setDisasters(disasterData); // Store disasters data in state
  
        // Set the total number of disasters
        setDisasters(disasterData);
      } catch (error) {
        console.error("Error fetching disasters data:", error);
      }
    };
  
    fetchDisasters();
  }, []);  

  // Filter disasters based on selected filters
  const filteredDisasters = useMemo(() => {
    return disasters.filter(disaster => {
      const disasterDate = new Date(disaster.disasterDateTime);
      const disasterYear = disasterDate.getFullYear().toString();
      const formattedDate = disasterDate.toISOString().split("T")[0]; // Extract YYYY-MM-DD
  
      // Check if barangay exists in disaster.barangays (assuming it's an array of objects with a "name" field)
      const matchesBarangay = barangay === "All" || disaster.barangays.some(b => b.name === barangay);
      
      const matchesYear = year === "All" || disasterYear === year;
      const matchesType = disasterTypeFilter === "All" || disaster.disasterType === disasterTypeFilter;
      const matchesDate = disasterDateFilter === "All" || formattedDate === disasterDateFilter;
  
      return matchesBarangay && matchesYear && matchesType && matchesDate;
    });
  }, [disasters, barangay, year, disasterTypeFilter, disasterDateFilter]);
  

  const allDates = useMemo(() => {
    return disasters
      .filter(disaster => {
        const disasterDate = new Date(disaster.disasterDateTime);
        const disasterYear = disasterDate.getFullYear().toString();
  
        // Check if the barangay exists in the disaster's barangays list
        const matchesBarangay = barangay === "All" || disaster.barangays.some(b => b.name === barangay);
        const matchesYear = year === "All" || disasterYear === year;
        const matchesType = disasterTypeFilter === "All" || disaster.disasterType === disasterTypeFilter;
  
        return matchesBarangay && matchesYear && matchesType;
      })
      .map(disaster => new Date(disaster.disasterDateTime).toISOString().split("T")[0]) // Extract YYYY-MM-DD
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
  }, [disasters, barangay, year, disasterTypeFilter]);
  

   // Update filtered dates based on filtered disasters
   const filteredDates = useMemo(() => {
    return filteredDisasters
    .map(disaster => disaster.disasterDate) // Map through filtered disasters to get dates
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
  }, [filteredDisasters]);

  // Calculate affected families per barangay
  const affectedFamilies = useMemo(() => {
    const barangayCounts = {};
 
    filteredDisasters.forEach(disaster => {
      disaster.barangays.forEach(barangay => {
        const barangayName = barangay.name;
  
        if (!barangayCounts[barangayName]) {
          barangayCounts[barangayName] = 0;
        }
  
        // Count the number of affected families
        const affectedCount = Array.isArray(barangay.affectedFamilies) ? barangay.affectedFamilies.length : 0;
        barangayCounts[barangayName] += affectedCount;
      });
    });
 
    return barangayCounts;
  }, [filteredDisasters]);

  
  const data = useMemo(() => {
    const barangayNames = Object.keys(affectedFamilies);
    const affectedFamilyCounts = barangayNames.map(barangay => affectedFamilies[barangay]);
    return {
      labels: barangayNames,
      datasets: [
        {
          label: 'Affected Families',
          data: affectedFamilyCounts,
          backgroundColor: 'rgba(75, 192, 192, 0.5)', // Green
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [affectedFamilies]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      x: {
        // Adjust spacing between bars
        barPercentage: 0.9,  // Increase for larger bars, decrease for more space between bars
        categoryPercentage: 1.0, // Set to 1 to take full width per label
      },
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false, // Ensures the chart adapts to the container's width and height
  };

  return (
    
    <div className="bar-graph-container">
      
      <div className='bar'>

      <div className="bar-filter">
          <h2>Disaster Impact</h2>

          <div className="filters-right">
            <div className="bar-filter-container">
              {/* Dropdown for Disaster Type */}
              <select
                id="disasterType"
                name="disasterType"
                onChange={(e) => setDisasterTypeFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Fire Incident">Fire Incident</option>
                <option value="Flood">Flood</option>
                <option value="Landslide">Landslide</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Typhoon">Typhoon</option>
              </select>
            </div>

            <div className="bar-filter-container">
              <label htmlFor="disasterDate">Select Disaster Date: </label>
              <select
                id="disasterDate"
                name="disasterDate"
                onChange={(e) => setDisasterDateFilter(e.target.value)}
                value={disasterDateFilter}
              >
                <option value="All">All</option>
                {allDates.map((date, index) => (
                  <option key={index} value={date}>
                    {date}
                  </option>
                ))}
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
        {Object.keys(affectedFamilies).length > 0 ? (
          <p>
            The barangay with the most affected families is <strong>
              {Object.keys(affectedFamilies).reduce((a, b) => affectedFamilies[a] > affectedFamilies[b] ? a : b)}
            </strong>, while the barangay with the least affected families is <strong>
              {Object.keys(affectedFamilies).reduce((a, b) => affectedFamilies[a] < affectedFamilies[b] ? a : b)}
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

{/**
  Add extent damage sa comparison or Casualties
  */}
