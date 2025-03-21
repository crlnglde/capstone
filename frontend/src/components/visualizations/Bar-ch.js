import React, { useEffect, useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import "../../css/visualizations/Bar-ch.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarGraph = () => {
  const [disasterCodeFilter, setDisasterCodeFilter] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [disasters, setDisasters] = useState([]);
  const [distributions, setDistributions] = useState([]);

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const response = await axios.get("http://localhost:3003/get-disasters");
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
  
    const fetchDistributions = async () => {
      try {
        const response = await axios.get("http://localhost:3003/get-distribution");
        setDistributions(response.data);
      } catch (error) {
        console.error("Error fetching distribution data:", error);
      }
    };
  
    fetchDisasters();
    fetchDistributions();
  }, []);

  const chartData = useMemo(() => {
    if (!disasterCodeFilter || !disasters.length) return null;
  
    const selectedDisaster = disasters.find(d => d.disasterCode === disasterCodeFilter);
    if (!selectedDisaster) return null;
  
    // Get total affected families based on barangay filter
    const affectedFamiliesCount = selectedDisaster.barangays
      .filter(barangay => !barangayFilter || barangay.name === barangayFilter)
      .reduce((sum, barangay) => sum + (barangay.affectedFamilies?.length || 0), 0);
  
    // Get all distributions for the selected disaster and barangay
    const allDistributions = distributions
      .filter(d => d.disasterCode === disasterCodeFilter)
      .flatMap(d => d.barangays)
      .filter(barangay => !barangayFilter || barangay.name === barangayFilter) // Apply barangay filter
      .flatMap(barangay => barangay.distribution || []);
  
    // Generate labels
    const labels = allDistributions.map((distribution, index) => {
      const date = new Date(distribution.dateDistributed);
      const formattedUTC = date.toUTCString().slice(5, 16); // Extracts "MMM DD YYYY"
      return `Distribution ${index + 1} (${formattedUTC})`;
    });      
  
    // Affected Families remains the same for each distribution
    const affectedFamiliesData = Array(allDistributions.length).fill(affectedFamiliesCount);
  
    // Count families that received assistance
    const receivedFamiliesData = allDistributions.map(distribution => 
      distribution.families.filter(fam => fam.status === "Done").length
    );
  
    return {
      labels,
      datasets: [
        {
          label: "Affected Families",
          data: affectedFamiliesData,
          backgroundColor: "rgba(0, 76, 153, 0.7)", // Darker blue
          borderColor: "rgba(0, 76, 153, 1)",
          borderWidth: 1,
        },
        {
          label: "Families Received Assistance",
          data: receivedFamiliesData,
          backgroundColor: "rgba(30, 144, 255, 0.7)", // Medium blue
          borderColor: "rgba(30, 144, 255, 1)",
          borderWidth: 1,
        }        
      ],
    };
  }, [disasterCodeFilter, barangayFilter, disasters, distributions]);
  
  const availableDisasterCodes = useMemo(() => {
    return Array.from(new Set(disasters.map(d => d.disasterCode)));
  }, [disasters]);

  const availableBarangays = useMemo(() => {
    const selectedDisaster = disasters.find(d => d.disasterCode === disasterCodeFilter);
    return selectedDisaster ? selectedDisaster.barangays.map(b => b.name) : [];
  }, [disasterCodeFilter, disasters]);
  
  useEffect(() => {
    if (availableBarangays.length > 0 && !barangayFilter) {
      setBarangayFilter(availableBarangays[0]); // Automatically select the first barangay
    }
  }, [availableBarangays]);  
  

  return (
    <div className="bar-graph-container">
      <div className='bar'>
        <div className="bar-filter">
          <h2>Current Distributions</h2>
          <div className="filters-right">
            <div className="pie-filter">
              <div className="col">
                <label htmlFor="disasterCode">Disaster Code: </label>
                <select id="disasterCode" value={disasterCodeFilter} onChange={(e) => setDisasterCodeFilter(e.target.value)}>
                  <option value="">Select Disaster</option>
                  {availableDisasterCodes.map((code, index) => (
                    <option key={index} value={code}>{code}</option>
                  ))}
                </select>
              </div>
              <div className="col">
                <label htmlFor="barangay">Barangay: </label>
                <select id="barangay" value={barangayFilter} onChange={(e) => setBarangayFilter(e.target.value)}>
                  {availableBarangays.map((barangay, index) => (
                    <option key={index} value={barangay}>{barangay}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="bar-wrapper">
          {chartData ? (
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          ) : (
            <p>No distribution data available for this disaster.</p>
          )}
        </div>
      </div>

      <div className="pie-text-overlay">
        <h2>Disaster Insights</h2>
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
