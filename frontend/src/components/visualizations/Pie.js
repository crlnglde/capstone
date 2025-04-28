import React, { useEffect, useState, useMemo } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "../../css/visualizations/Pie.css"; 
import Filter from "../again/Filter";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
    const [disasterTypeFilter, setDisasterTypeFilter] = useState("All");
    const [disasters, setDisasters] = useState([]);
    const [disasterType, setDisasterType] = useState("All");
    const [disasterDate, setDisasterDate] = useState("");
  
    const [graphType, setGraphType] = useState("pie"); 
    
    const [disasterCode, setDisasterCode] = useState(["All"]);
    const [barangay, setBarangay] = useState(() => {
      const savedBarangay = localStorage.getItem('barangay');
      return savedBarangay || "All";  // Default to "All" if no barangay is saved
    });
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

        const localData = localStorage.getItem("disasters");
        if (localData) {
          const parsed = JSON.parse(localData);
          setDisasters(parsed);
        }
        
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
      console.log("Original Disasters", disasters);
    
      if (disasters.length === 0) return [];

      // Sort disasters by latest
      const sortedDisasters = [...disasters].sort((a, b) => 
        new Date(b.disasterDateTime) - new Date(a.disasterDateTime)
      );

      const latestDisaster = sortedDisasters.length > 0 ? sortedDisasters[0] : null;

      if (
        (disasterCode.includes("All") || disasterCode.length === 0) &&
        barangay === "All" &&
        year === "All" &&
        disasterType === "All"
      ) {
        return latestDisaster ? [latestDisaster] : [];
      }
    
    
      return sortedDisasters.filter(disaster => {
        const matchesBarangay = barangay === "All" || disaster.barangays.some(b => b.name === barangay);
        const matchesYear = year === "All" || new Date(disaster.disasterDateTime).getFullYear().toString() === year;
        const matchesType = disasterType === "All" || disaster.disasterType === disasterType;
        const matchesCode = (!disasterCode || disasterCode.includes("All")) || disasterCode.includes(disaster.disasterCode); // <-- Match disasterCode
    
        console.log({
          disasterCode: disaster.disasterCode,
          matchesBarangay,
          matchesYear,
          matchesType,
          matchesCode,
        });
    
        return matchesBarangay && matchesYear && matchesType && matchesCode;
      });
    }, [disasters, barangay, year, disasterType, disasterCode]);      

  const defaultDafacStatuses = ["Pending", "Confirmed"]; 

  console.log("Filtered Disasters", filteredDisasters);

// Calculate dafacStatus stats with barangay filter
const dafacStatusStats = useMemo(() => {
  const stats = defaultDafacStatuses.reduce((acc, status) => {
    acc[status] = 0; // Default all to 0
    return acc;
  }, {});

  filteredDisasters.forEach(disaster => {
    disaster.barangays
    .filter(brgy => !barangay || barangay === "All" || brgy.name === barangay) // Apply filter correctly
      .forEach(brgy => {
        brgy.affectedFamilies.forEach(family => {
          if (family.dafacStatus) {
            stats[family.dafacStatus] = (stats[family.dafacStatus] || 0) + 1;
          }
        });
      });
  });

  return stats;
}, [filteredDisasters, barangay]);
 
  const dafacLabels = Object.keys(dafacStatusStats);
  const dafacValues = Object.values(dafacStatusStats);
  const noDataAvailable = dafacLabels.length === 0 || dafacValues.every(value => value === 0);
  const latestDisaster = filteredDisasters.length > 0 ? filteredDisasters[0] : null;
  const latestDisasterDate = latestDisaster ? new Date(latestDisaster.disasterDateTime).toLocaleDateString() : "No Data";
  const latestDisasterType = latestDisaster ? latestDisaster.disasterType : "No Data";

  const data = noDataAvailable ? {
    labels: ["No Data"],
    datasets: [{ data: [1], backgroundColor: ["gray"], borderColor: ["gray"], borderWidth: 1 }],
  } : {
    labels: dafacLabels,
    datasets: [{
      label: 'Encoding Status',
      data: dafacValues,
      backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 159, 64, 0.7)', 'rgba(153, 102, 255, 0.7)'],
      borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 159, 64, 1)', 'rgba(153, 102, 255, 1)'],
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="pie-graph-container">
      <div className="pie">
        <div className="pie-filter">
          <h2>Validation and Status of Encoding</h2>
          <Filter disasters={disasters} onFilter={handleDonutFilter} filters={filtersForDonut} graphType={graphType}/>
        </div>

        <div className="pie-wrapper">
          <Pie data={data} options={options} />
        </div>
      </div>
      
      <div className="pie-text-overlay">
        <h2>Disaster Insights</h2>
        {dafacLabels.length === 0 || Object.values(dafacStatusStats).every(count => count === 0) ? (
        <p>No data available. Select specific date of disaster.</p>
        ) : (
          <p>
            Current encoding status for <strong>{latestDisasterType}</strong> last <strong>{latestDisasterDate}</strong>:{" "}
            {Object.entries(dafacStatusStats)
              .map(([status, count]) => `${status}: ${count}`)
              .join(", ")}.
          </p>
        )}
      </div>
    </div>
  );
};

export default PieChart;
