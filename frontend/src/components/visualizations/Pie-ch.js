import React, { useEffect, useState, useMemo } from "react";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import "../../css/visualizations/Pie-ch.css"; 


import { db } from "../../firebase";
import { collection, getDocs } from 'firebase/firestore';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutGraph = ({ barangay, year }) => {

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

  // Calculate disaster stats (only when filtered disasters change)
  const disasterStats = useMemo(() => {
    return filteredDisasters.reduce((acc, disaster) => {
      acc.pregnantWomen += Number(disaster.pregnantWomen) || 0;
      acc.lactatingMothers += Number(disaster.lactatingMothers) || 0;
      acc.pwds += Number(disaster.pwds) || 0;
      acc.soloParents += Number(disaster.soloParents) || 0;
      acc.indigenousPeople += Number(disaster.indigenousPeople) || 0;
      return acc;
    }, {
      pregnantWomen: 0,
      lactatingMothers: 0,
      pwds: 0,
      soloParents: 0,
      indigenousPeople: 0,
    });
  }, [filteredDisasters]);


  useEffect(() => {
    setDisasterDateFilter("All");  // Reset the disaster date to "All"
  }, [disasterTypeFilter]);

  const totalAffected = disasterStats.pregnantWomen + disasterStats.lactatingMothers + disasterStats.pwds + disasterStats.soloParents + disasterStats.indigenousPeople;


  const percentages = [
    (disasterStats.pregnantWomen / totalAffected) * 100,
    (disasterStats.lactatingMothers / totalAffected) * 100,
    (disasterStats.pwds / totalAffected) * 100,
    (disasterStats.soloParents / totalAffected) * 100,
    (disasterStats.indigenousPeople / totalAffected) * 100,
  ];


  const highestPercentageIndex = percentages.indexOf(Math.max(...percentages));

  let data;

  if (filteredDisasters.length === 0) {
    // If no data matches the filters, show a gray donut chart
    data = {
      labels: ["No Data"],
      datasets: [
        {
          data: [1],
          backgroundColor: ["gray"], // Set color to gray
          borderColor: ["gray"],
          borderWidth: 1,
        },
      ],
    };
  }else {
    data = {
      labels: [
        'Pregnant Women',
        'Lactating Mothers',
        'PWDs',
        'Solo Parents',
        'Indigenous People',
      ],
      datasets: [
        {
          label: 'Disaster Affected Groups',
          data: [
            disasterStats.pregnantWomen,
            disasterStats.lactatingMothers,
            disasterStats.pwds,
            disasterStats.soloParents,
            disasterStats.indigenousPeople,
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)', // Green
            'rgba(255, 206, 86, 0.7)', // Yellow
            'rgba(54, 162, 235, 0.7)', // Blue
            'rgba(153, 102, 255, 0.7)', // Purple
            'rgba(255, 99, 132, 0.7)', // Red

          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom', // Legend position at the bottom
        labels: {
          boxWidth: 20, // Width of the colored boxes next to the labels
          padding: 10,  // Space between the box and the label
        },
        // Use custom legend display
        onClick: (event, legendItem, legend) => {
          // Optional: Custom onClick function for legend items
          console.log(legendItem);
        },
        // Customizing the layout of legend items (grid)
        layout: {
          padding: {
            top: 5, // Padding above the legend
            left: 20, // Left padding for legend
            right: 20, // Right padding for legend
            bottom: 5 // Bottom padding for legend
          },
          // Change `wrap` value to true to enable row-column behavior
          wrap: true, // This helps in wrapping legend items into multiple rows/columns
        },
      },
    },
  };
  


  return (
    <div className="donut-graph-container">

      <div className='pie'>

        <div className="pie-filter">
    
          <div className="col">
          
            <label htmlFor="disasterDate">Disaster Type: </label>
            <div className="pie-filter-container">
            {/* Dropdown for Disaster Date */}
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

          <div className="col">

          
            <label htmlFor="disasterDate">Disaster Date: </label>
            <div className="pie-filter-container">
              <select id="disasterDate" name="disasterDate" onChange={(e) => setDisasterDateFilter(e.target.value)}  value={disasterDateFilter}>
                <option value="All">All</option>
                {allDates.map((date, index) => (
                  <option key={index} value={date}>{date}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        <h2>Category</h2>
        
        <div className="pie-wrapper">
          <Doughnut data={data} options={options} />
        </div>
      </div>

     

      <div className="pie-text-overlay">
        <h2>Disaster Insights</h2>

        {totalAffected === 0 ? (
          <p>No data available for the selected filters.</p> // Show message when there's no data
        ) : (
          <p>
            The most affected group by the disaster is <strong>{['Pregnant Women', 'Lactating Mothers', 'PWDs', 'Solo Parents', 'Indigenous People'][highestPercentageIndex]}</strong>,
            with a percentage of <strong>{percentages[highestPercentageIndex].toFixed(2)}%</strong>.
          </p>
        )}

      </div>
    </div>
  );
};

export default DonutGraph;
