import React, { useEffect, useState, useMemo } from "react";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import "../../css/visualizations/Bar-ch.css";

import { db } from "../../firebase";
import { collection, getDocs } from 'firebase/firestore';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarGraph = ({ barangay, year }) => {
  const [disasterTypeFilter, setDisasterTypeFilter] = useState("All");
  const [disasterDateFilter, setDisasterDateFilter] = useState("All");
  const [disasters, setDisasters] = useState([]);

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "disasters"));
        const disastersData = querySnapshot.docs.map(doc => doc.data());
        setDisasters(disastersData);  // Store data in state
      } catch (error) {
        console.error("Error fetching disasters data:", error);
      }
    };


    fetchDisasters();  // Call the function to fetch data
  }, []);

  // Filter disasters based on selected filters
  const filteredDisasters = useMemo(() => {
    return disasters
      .filter(disaster => {
        const matchesBarangay = barangay === "All" || disaster.barangays === barangay;
        const matchesYear = year === "All" || disaster.disasterDate.split("-")[0] === year;
        const matchesType = disasterTypeFilter === "All" || disaster.disasterType === disasterTypeFilter;
        const matchesDate = disasterDateFilter === "All" || disaster.disasterDate === disasterDateFilter;


        return matchesBarangay && matchesYear && matchesType && matchesDate;
      });
  }, [disasters, barangay, year, disasterTypeFilter, disasterDateFilter]);

  const allDates = useMemo(() => {
    return disasters
      .filter(disaster => {
        const matchesBarangay = barangay === "All" || disaster.barangays === barangay;
        const matchesYear = year === "All" || disaster.disasterDate.split("-")[0] === year;
        const matchesType = disasterTypeFilter === "All" || disaster.disasterType === disasterTypeFilter;


        return matchesBarangay && matchesYear && matchesType;
      })
      .map(disaster => disaster.disasterDate)
      .filter((value, index, self) => self.indexOf(value) === index);
  }, [filteredDisasters]);

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
      const barangays = Array.isArray(disaster.barangays) ? disaster.barangays : [disaster.barangays];
 
      barangays.forEach(barangay => {
        if (!barangayCounts[barangay]) {
          barangayCounts[barangay] = 0;
        }
       
        // Ensure affectedFamilies is treated as a number
        const affected = parseInt(disaster.affectedFamilies, 10);  // Parse it as a number (base 10)
       
        if (!isNaN(affected)) {
          barangayCounts[barangay] += affected;
        } else {
          console.warn(`Invalid affectedFamilies value for ${barangay}: ${disaster.affectedFamilies}`);
        }
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
