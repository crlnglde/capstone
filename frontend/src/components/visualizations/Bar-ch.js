import React, { useEffect, useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import "../../css/visualizations/Bar-ch.css";
import Filter from "../again/Filter";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarGraph = ({ isBarGraph }) => {
  const [disasterCodeFilter, setDisasterCodeFilter] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [disasters, setDisasters] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState("");
  const [disDate, setdisDate] = useState("");
  const [graphType, setGraphType] = useState("bar"); 
  const [availableBarangays, setAvailableBarangays] = useState([]);
  const [chartData, setChartData] = useState(null);

  const [barangayOptions, setBarangayOptions] = useState([]);
  useEffect(() => {
    const fetchDisasters = async () => {
      const localData = localStorage.getItem("disasters");
      if (localData) {
        const parsed = JSON.parse(localData);
        const disasterData = parsed.filter(disaster => disaster.disasterStatus === "Current");
        setDisasters(disasterData);
        if (disasterData.length > 0) {
          setDisasterCodeFilter(disasterData[0].disasterCode);
        }
      }
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-disasters`);
        const disasterData = response.data.filter(disaster => disaster.disasterStatus === "Current");
        setDisasters(disasterData);
  
        // Automatically select the first disaster code if available
        if (disasterData.length > 0) {
          setDisasterCodeFilter(disasterData[0].disasterCode);
        }
      } catch (error) {
        console.error("Error fetching disasters data:", error);
      }
    };
  
    const fetchDistributions = async ({ disasterCode, barangay, status } = {}) => {
      let distributionData = [];
    
      const localData = localStorage.getItem("parsedDistributions");
    
      if (localData) {
        try {
          let parsed = JSON.parse(localData);
    
          // Filter from cached local data
          if (disasterCode) {
            parsed = parsed.filter(d => d.disasterCode === disasterCode);
          }
    
          if (status) {
            parsed = parsed.filter(d => d.status === status);
          }
    
          if (barangay) {
            parsed = parsed.map(d => {
              const filteredBarangays = (d.barangays || []).filter(b => b.name === barangay);
              return { ...d, barangays: filteredBarangays };
            }).filter(d => d.barangays.length > 0);
          }
    
          distributionData = parsed;
          setDistributions(distributionData);
        } catch (e) {
          console.error("Error parsing cached distributions:", e);
        }
      }
    
      // Fetch from server for fresh data
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-distribution`, {
          params: { disasterCode, barangay, status }
        });
    
        if (Array.isArray(response.data)) {
          setDistributions(response.data);
        }
      } catch (error) {
        console.error("Error fetching fresh filtered distribution data:", error);
      }
    };    
  
    fetchDisasters();
    fetchDistributions();
  }, []);

  console.log(distributions)

  useEffect(() => {
    if (!disasterCodeFilter || !disasters.length) return;
  
    const selectedDisaster = disasters.find(d => d.disasterCode === disasterCodeFilter);
    if (!selectedDisaster) return;
  
    setSelectedDisaster(selectedDisaster);

    console.log("hehe", distributions)
  
    const affectedFamiliesCount = selectedDisaster.barangays
      .filter(barangay => !barangayFilter || barangay.name === barangayFilter)
      .reduce((sum, barangay) => sum + (barangay.affectedFamilies?.length || 0), 0);
  
    console.log("code filter", disasterCodeFilter)
    console.log("barangays", barangayFilter)
    const allDistributions = distributions
      .filter(d => d.disasterCode === disasterCodeFilter)
      .flatMap(d => d.barangays)
      .filter(barangay => !barangayFilter || barangay.name === barangayFilter)
      .flatMap(barangay => barangay.distribution || []);
    console.log("haha", allDistributions)
  
    const labels = allDistributions.map((distribution, index) => {
      const date = new Date(distribution.dateDistributed);
      return `Distribution ${index + 1} (${date.toLocaleDateString("en-US", {
        month: "short", day: "2-digit", year: "numeric"
      })})`;
    });
  
    const affectedFamiliesData = Array(allDistributions.length).fill(affectedFamiliesCount);
    const receivedFamiliesData = allDistributions.map(distribution =>
      distribution.families.filter(fam => fam.status === "Done").length
    );
  
    const date = new Date(selectedDisaster.disasterDateTime);
    setdisDate(date.toLocaleDateString("en-US", {
      month: "short", day: "2-digit", year: "numeric"
    }));
  
    setChartData({
      labels,
      datasets: [
        {
          label: "Affected Families",
          data: affectedFamiliesData,
          backgroundColor: "rgba(0, 76, 153, 0.7)",
          borderColor: "rgba(0, 76, 153, 1)",
          borderWidth: 1,
        },
        {
          label: "Families Received Assistance",
          data: receivedFamiliesData,
          backgroundColor: "rgba(30, 144, 255, 0.7)",
          borderColor: "rgba(30, 144, 255, 1)",
          borderWidth: 1,
        },
      ],
    });
  }, [disasterCodeFilter, barangayFilter, disasters, distributions]);
  
  console.log(chartData)
  
  const availableDisasterCodes = useMemo(() => {
    return Array.from(new Set(disasters.map(d => d.disasterCode)));
  }, [disasters]);

  useEffect(() => {
    if (disasterCodeFilter) {
      const selectedDisaster = disasters.find(d => d.disasterCode === disasterCodeFilter);
      const newBarangayOptions = selectedDisaster ? selectedDisaster.barangays.map(b => b.name) : [];
  
      setBarangayOptions(newBarangayOptions);
  
      // Only reset the barangay filter if it's not already set (i.e., if it's "All")
      if (barangayFilter === "All" && newBarangayOptions.length > 0) {
        setBarangayFilter(newBarangayOptions[0]);
      }
    }
  }, [disasterCodeFilter, disasters, barangayFilter]);  
  

  //filter
  const filtersForBar = [
    { label: "Disaster Code", key: "disasterCode", options: availableDisasterCodes },
    { label: "Barangay", key: "barangay", options: availableBarangays }
  ];

  const handleBarFilter = (filterData) => {
    const selectedDisasterCode = filterData.disasterCode || "All";
    setDisasterCodeFilter(selectedDisasterCode);
  
    if (selectedDisasterCode !== "All") {
      const selectedDisaster = disasters.find(d => d.disasterCode === selectedDisasterCode);
      const newBarangayList = selectedDisaster ? selectedDisaster.barangays.map(b => b.name) : [];
      
      // Keep barangay filter flexible
      setBarangayFilter(newBarangayList.includes(filterData.barangay) ? filterData.barangay : "All");
    } else {
      setBarangayFilter(filterData.barangay || "All");
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#000000", // White legend text
          font: {
            size: 14,
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#000000", // White X-axis labels
          
        },
        grid: {
          display: false, // Remove grid lines
        },
        barPercentage: 0.8, // Adjust bar width
        categoryPercentage: 0.6, // Space between grouped bars
      },
      y: {
        ticks: {
          color: "#000000", // White Y-axis labels
          callback: function (value) {
            return Number.isInteger(value) ? value : ""; // ✅ Hide decimals, show whole numbers
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)", // Light grid lines
        },
        beginAtZero: true,
      },
    },
    animation: {
      duration: 2000,
      easing: "easeInOutQuart",
    },
  };

  return (
    <div className="bar-graph-container">
      <div className='bar'>
        <div className="bar-filter">
          <h2>Current Distributions</h2>
          <div className="filters-right">
            <div className="pie-filter">

            <Filter disasters={disasters} setAvailableBarangays={setAvailableBarangays} filters={filtersForBar} onFilter={handleBarFilter}  graphType={graphType} />


            </div>
          </div>
        </div>
        <div className="bar-wrapper">
          {chartData ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <p>No distribution data available for this disaster.</p>
          )}
        </div>
      </div>

      <div className="pie-text-overlay">
        <h3>{selectedDisaster.disasterType} last {disDate}</h3>
        {chartData && chartData.labels.length > 0 ? (
          <>
            {chartData.datasets[1].data.some((received, index) => received < chartData.datasets[0].data[index]) ? (
              <p>
                Some distributions did not reach all affected families:{" "}
                <strong>
                  {chartData.labels
                    .filter((_, index) => chartData.datasets[1].data[index] < chartData.datasets[0].data[index])
                    .join(", ")}
                </strong>
              </p>
            ) : (
              <p>All affected families have received assistance in every distribution.</p>
            )}
          </>
        ) : (
          <p>No distribution data available for the selected filters.</p>
        )}
      </div>

    </div>
  );
};

export default BarGraph;
