import React, { useEffect, useState, useMemo } from "react";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import "../../css/visualizations/Pie-ch.css"; 
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutGraph = ({ barangay, year }) => {
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

  // Generate available disaster dates based on selected disaster type
  const availableDisasterDates = useMemo(() => {
    const filtered = disasters
      .filter(disaster => disasterTypeFilter === "All" || disaster.disasterType === disasterTypeFilter)
      .map(disaster => {
        const disasterDate = new Date(disaster.disasterDateTime);
        return disasterDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      });

    return Array.from(new Set(filtered)); // Remove duplicates
  }, [disasters, disasterTypeFilter]);

  // Filter disasters based on all selected filters
  const filteredDisasters = useMemo(() => {
    return disasters.filter(disaster => {
      const disasterDate = new Date(disaster.disasterDateTime);
      const disasterYear = disasterDate.getFullYear().toString();
      const formattedDate = disasterDate.toISOString().split("T")[0]; // Extract YYYY-MM-DD

      const matchesBarangay = barangay === "All" || disaster.barangays.some(b => b.name === barangay);
      const matchesYear = year === "All" || disasterYear === year;
      const matchesType = disasterTypeFilter === "All" || disaster.disasterType === disasterTypeFilter;
      const matchesDate = disasterDateFilter === "All" || formattedDate === disasterDateFilter;

      return matchesBarangay && matchesYear && matchesType && matchesDate;
    });
  }, [disasters, barangay, year, disasterTypeFilter, disasterDateFilter]);

  // Calculate casualties stats
  const casualtyStats = useMemo(() => {
    return filteredDisasters.reduce((acc, disaster) => {
      disaster.barangays.forEach(barangay => {
        barangay.affectedFamilies.forEach(family => {
          family.casualty.forEach(casualty => {
            if (casualty.type === "Dead") acc.dead += casualty.names.length;
            if (casualty.type === "Missing") acc.missing += casualty.names.length;
            if (casualty.type === "Injured") acc.injured += casualty.names.length;
          });
        });
      });
      return acc;
    }, { dead: 0, missing: 0, injured: 0 });
  }, [filteredDisasters]);

  const totalCasualties = casualtyStats.dead + casualtyStats.missing + casualtyStats.injured;

  const data = totalCasualties === 0 ? {
    labels: ["No Data"],
    datasets: [{ data: [1], backgroundColor: ["gray"], borderColor: ["gray"], borderWidth: 1 }],
  } : {
    labels: ['Dead', 'Missing', 'Injured'],
    datasets: [{
      label: 'Casualties Breakdown',
      data: [casualtyStats.dead, casualtyStats.missing, casualtyStats.injured],
      backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(54, 162, 235, 0.7)'],
      borderColor: ['rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)', 'rgba(54, 162, 235, 1)'],
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
    },
  };

  return (
    <div className="donut-graph-container">
      <div className='pie'>
        <div className="pie-filter">
          <div className="col">
            <label htmlFor="disasterType">Disaster Type: </label>
            <select 
              id="disasterType" 
              name="disasterType" 
              value={disasterTypeFilter} 
              onChange={(e) => {
                setDisasterTypeFilter(e.target.value);
                setDisasterDateFilter("All"); // Reset date filter when disaster type changes
              }}
            >
              <option value="All">All</option>
              <option value="Fire Incident">Fire Incident</option>
              <option value="Flood">Flood</option>
              <option value="Landslide">Landslide</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Typhoon">Typhoon</option>
            </select>
          </div>
          <div className="col">
            <label htmlFor="disasterDate">Disaster Date: </label>
            <select 
              id="disasterDate" 
              name="disasterDate" 
              value={disasterDateFilter} 
              onChange={(e) => setDisasterDateFilter(e.target.value)}
            >
              <option value="All">All</option>
              {availableDisasterDates.map((date, index) => (
                <option key={index} value={date}>{date}</option>
              ))}
            </select>
          </div>
        </div>
        <h2>Casualties Breakdown</h2>
        <div className="pie-wrapper">
          <Doughnut data={data} options={options} />
        </div>
      </div>
      <div className="pie-text-overlay">
        <h2>Disaster Insights</h2>
        {totalCasualties === 0 ? (
          <p>No casualty data available for the selected filters.</p>
        ) : (
          <p>
            The highest number of casualties recorded is <strong>{Math.max(casualtyStats.dead, casualtyStats.missing, casualtyStats.injured)}</strong>
            from the category <strong>{['Dead', 'Missing', 'Injured'][[casualtyStats.dead, casualtyStats.missing, casualtyStats.injured].indexOf(Math.max(casualtyStats.dead, casualtyStats.missing, casualtyStats.injured))]}</strong>.
          </p>
        )}
      </div>
    </div>
  );
};

export default DonutGraph;
