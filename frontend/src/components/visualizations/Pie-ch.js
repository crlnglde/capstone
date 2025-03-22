import React, { useEffect, useState, useMemo } from "react";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import "../../css/visualizations/Pie-ch.css"; 
import axios from "axios";
import Filter from "../again/Filter";

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutGraph = () => {
  const [disasterTypeFilter, setDisasterTypeFilter] = useState("All");
  const [disasterDateFilter, setDisasterDateFilter] = useState("All");
  const [disasters, setDisasters] = useState([]);
  const [disasterType, setDisasterType] = useState("All");
  const [disasterDate, setDisasterDate] = useState("");

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
    { label: "Disaster Date", key: "disasterDate", options: [] },
  ];
  
  const handleDonutFilter = (filterData) => {
    console.log("Received Filter Data:", filterData);
    setYear(filterData.year || "All");
    setBarangay(filterData.barangay || "All");
    setDisasterType(filterData.disasterType || "All");
    setDisasterDate(filterData.disasterDate || "");
  };

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
  console.log("Filters:", { barangay, year, disasterType, disasterDate });

const filteredDisasters = useMemo(() => {
  console.log("Original Disasters", disasters);
  
  return disasters.filter(disaster => {
    const date = new Date(disaster.disasterDateTime);
    const disasterYear = date.getFullYear().toString();
    const formattedDate = date.toISOString().split("T")[0];

    console.log("Date", formattedDate)
    console.log("Filter Date", disasterDate)

    const matchesBarangay = barangay === "All" || 
      disaster.barangays.some(b => b.name === barangay);

    const matchesYear = year === "All" || disasterYear === year;
    const matchesType = disasterType === "All" || disaster.disasterType === disasterType;
    const matchesDate = !disasterDate || formattedDate === disasterDate;

    console.log({
      disasterCode: disaster.disasterCode,
      matchesBarangay,
      matchesYear,
      matchesType,
      matchesDate
    });

    return matchesBarangay && matchesYear && matchesType && matchesDate;
  });
}, [disasters, barangay, year, disasterType, disasterDate]);

  console.log("Filtered Disasters", filteredDisasters)

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

        <Filter disasters={disasters} onFilter={handleDonutFilter} filters={filtersForDonut} graphType={graphType}/>
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
            There are <strong>{casualtyStats.injured}</strong> injured, 
            <strong> {casualtyStats.dead}</strong> dead, and 
            <strong> {casualtyStats.missing}</strong> missing from the last recorded disaster on 
            <strong> {disasterDate}</strong>.
          </p>
        )}
      </div>
    </div>
  );
};

export default DonutGraph;
