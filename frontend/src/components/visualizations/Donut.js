import React, { useEffect, useState, useMemo } from "react";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import "../../css/visualizations/Donut.css"; 
import axios from "axios";
import Filter from "../again/Filter";

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutGraph = () => {
  const [disasters, setDisasters] = useState([]);
  const [disasterType, setDisasterType] = useState("All");
  const [disasterDate, setDisasterDate] = useState("");
  const [disasterCode, setDisasterCode] = useState(["All"]);

  const [graphType, setGraphType] = useState("donut"); 

  const [barangay, setBarangay] = useState("All");
  const [year, setYear] = useState("All");

  const filtersForDonut = [
    { label: "Year", key: "year", options: Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString()) },
    { label: "Barangay", key: "barangay", options: ["All",  "Abuno", "Acmac-Mariano Badelles Sr.", "Bagong Silang", "Bonbonon", "Bunawan", "Buru-un", "Dalipuga",
      "Del Carmen", "Digkilaan", "Ditucalan", "Dulag", "Hinaplanon", "Hindang", "Kabacsanan", "Kalilangan",
      "Kiwalan", "Lanipao", "Luinab", "Mahayahay", "Mainit", "Mandulog", "Maria Cristina", "Pala-o",
      "Panoroganan", "Poblacion", "Puga-an", "Rogongon", "San Miguel", "San Roque", "Santa Elena",
      "Santa Filomena", "Santiago", "Santo Rosario", "Saray", "Suarez", "Tambacan", "Tibanga", "Tipanoy",
      "Tomas L. Cabili (Tominobo Proper)", "Upper Tominobo", "Tubod", "Ubaldo Laya", "Upper Hinaplanon",
      "Villa Verde"] },
    { label: "Disaster Type", key: "disasterType", options: ["All", "Flood", "Landslide", "Typhoon", "Earthquake", "Fire Incident", "Armed Conflict"] },
    { label: "Disaster Code", key: "disasterCode", options: [] },
  ];
  
  const handleDonutFilter = (filterData) => {
    console.log("Received Filter Data:", filterData);
    setYear(filterData.year || "All");
    setBarangay(filterData.barangay || "All");
    setDisasterType(filterData.disasterType || "All");
    setDisasterCode(filterData.disasterCode || "");
  };

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const response = await axios.get("http://172.20.10.2:3003/get-disasters");
        setDisasters(response.data);
      } catch (error) {
        console.error("Error fetching disasters data:", error);
      }
    };
    fetchDisasters();
  }, []);

  const latestDisaster = useMemo(() => {
    if (disasters.length === 0) return null;
    
    // Sort disasters by date (latest first)
    const sortedDisasters = [...disasters].sort((a, b) => 
      new Date(b.disasterDateTime) - new Date(a.disasterDateTime)
    );
  
    return sortedDisasters[0]; // Get the most recent disaster
  }, [disasters]);

  const filteredDisasters = useMemo(() => {
    if (disasters.length === 0) return [];

    // If no filter is applied, default to the latest disaster
    if (
      (disasterCode.includes("All") || disasterCode.length === 0) &&
      barangay === "All" &&
      year === "All" &&
      disasterType === "All"
    ) {
      return latestDisaster ? [latestDisaster] : [];
    }
    
    return disasters.filter(disaster => {
      const date = new Date(disaster.disasterDateTime);
      const disasterYear = date.getFullYear().toString();
  
      const matchesCode = disasterCode.includes("All") || disasterCode.includes(disaster.disasterCode);
      const matchesBarangay = barangay === "All" || 
        disaster.barangays.some(b => b.name === barangay);
      const matchesYear = year === "All" || disasterYear === year;
      const matchesType = disasterType === "All" || disaster.disasterType === disasterType;
  
      console.log({
        disasterCode: disaster.disasterCode,
        matchesCode,
        matchesBarangay,
        matchesYear,
        matchesType
      });
  
      return matchesCode && matchesBarangay && matchesYear && matchesType;
    });
  }, [disasters, disasterCode, barangay, year, disasterType]);
  

  console.log("Filtered Disasters", filteredDisasters)

  // Calculate casualties stats
  const casualtyStats = useMemo(() => {
    if (filteredDisasters.length === 0) return { dead: 0, missing: 0, injured: 0 };
  
    return filteredDisasters.reduce((acc, disaster) => {
      disaster.barangays
      .filter(brgy => !barangay || barangay === "All" || brgy.name === barangay)
        .forEach(brgy => {
          brgy.affectedFamilies.forEach(family => {
            family.casualty.forEach(casualty => {
              if (casualty.type === "Dead") acc.dead += casualty.names.length;
              if (casualty.type === "Missing") acc.missing += casualty.names.length;
              if (casualty.type === "Injured") acc.injured += casualty.names.length;
            });
          });
        });
        return acc;
      }, { dead: 0, missing: 0, injured: 0 });
  }, [filteredDisasters, barangay]);  

  const totalCasualties = casualtyStats.dead + casualtyStats.missing + casualtyStats.injured;
  const latestDisasterDate = latestDisaster ? new Date(latestDisaster.disasterDateTime).toLocaleDateString() : "N/A";

  const data = totalCasualties === 0 ? {
    labels: ['No Data'],
    datasets: [{
    label: 'No Data Available',
    data: [1], // Placeholder value to render the gray donut
    backgroundColor: ['rgba(200, 200, 200, 0.7)'], // Gray color
    borderColor: ['rgba(200, 200, 200, 1)'],
    borderWidth: 1,
  }]
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
      <div className='donut'>

        <div className="donut-filter">
          <h2>Casualties Breakdown</h2>
          <Filter disasters={disasters} onFilter={handleDonutFilter} filters={filtersForDonut} graphType={graphType}/>
        </div>


        <div className="donut-wrapper">
          <Doughnut data={data} options={options} />
        </div>
      </div>

      <div className="donut-text-overlay">
        <h2>Disaster Insights</h2>
        {totalCasualties === 0 ? (
          <p>No casualty data available.</p>
        ) : (
          <p>
            There are <strong>{casualtyStats.injured}</strong> injured, 
            <strong> {casualtyStats.dead}</strong> dead, and 
            <strong> {casualtyStats.missing}</strong> missing from the last recorded disaster
            on  <strong>{latestDisasterDate}</strong>.
          </p>
        )}
      </div>
    </div>
  );
};

export default DonutGraph;
