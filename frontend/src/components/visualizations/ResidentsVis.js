import "../../css/visualizations/ResidentsVis.css";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../again/Card";
import { Bar, Pie } from "react-chartjs-2";
import { FaUsers } from "react-icons/fa";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ResidentsVis = () => {
  const [stats, setStats] = useState(null);

  // Static data to simulate the API response
  const mockData = {
    seniorCitizens: 150,
    totalMale: 1200,
    totalFemale: 1300,
    educationStats: {
      "High School": 400,
      "College": 600,
      "Graduate School": 300,
    },
    occupationStats: {
      "Fishermen": 800,
      "Unemployed": 600,
      "Self-Employed": 400,
    },
    totalDependents: 500,
    maleDependents: 250,
    femaleDependents: 250,
  };

  useEffect(() => {
    // Simulating a delay to mimic an API call
    setTimeout(() => {
      setStats(mockData);
    }, 1000); // Simulating API delay
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="grid-container">
      {/* Row 1: Senior Card + Educational Attainment Bar */}
      <div className="grid-item grid-item-1">
        <Card className="card total-senior-card">
            <div className="card-header">
                <p>Senior Citizen</p>
            </div>
            <CardContent className="card-body">
                <div className="icon-and-number">
                    <span className="icon"><FaUsers /></span>
                    <h2 className="card-number">{stats.seniorCitizens}</h2>
                </div>
            </CardContent>
        </Card>

      </div>

      <div className="grid-item grid-item-2">
        <Card className="card full-width">
          <CardContent>
            <p className="chart-title">Educational Attainment</p>
            <Bar
                data={{
                    labels: Object.keys(stats.educationStats),
                    datasets: [
                    {
                        label: "Residents",
                        data: Object.values(stats.educationStats),
                        backgroundColor: ["#93c5fd", "#60a5fa", "#3b82f6"], // light to darker blue shades
                        borderRadius: 5,
                    },
                    ],
                }}
                options={{
                    responsive: true,
                    plugins: {
                    legend: {
                        display: false,
                    },
                    },
                    scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                        color: "#333",
                        },
                    },
                    x: {
                        ticks: {
                        color: "#333",
                        },
                    },
                    },
                }}
            />

          </CardContent>
        </Card>
      </div>

      {/* Row 2: Dependents by Gender Pie + Occupation Distribution Bar */}
      <Card className="card pie-chart-card">
        <CardContent>
            <p className="chart-title">Dependents by Gender</p>
            <div className="pie-chart-container">
            <Pie
                data={{
                labels: ["Male", "Female"],
                datasets: [
                    {
                    data: [stats.maleDependents, stats.femaleDependents],
                    backgroundColor: ["#3B82F6", "#F472B6"], // Blue & Pink
                    borderColor: "#fff",
                    borderWidth: 2,
                    },
                ],
                }}
                options={{
                responsive: true,
                plugins: {
                    legend: {
                    position: "top",
                    labels: {
                        color: "#444", // darker gray text
                        font: {
                        size: 14,
                        weight: "500",
                        },
                    },
                    },
                    tooltip: {
                    backgroundColor: "#1e3a8a",
                    titleColor: "#fff",
                    bodyColor: "#ddd",
                    borderColor: "#ccc",
                    borderWidth: 1,
                    padding: 10,
                    },
                },
                }}
            />
            </div>
        </CardContent>
      </Card>



    <Card className="card full-width">
        <CardContent>
            <p className="chart-title">Occupation Distribution</p>
            <div className="chart-container">
            <Bar
                data={{
                labels: Object.keys(stats.occupationStats),
                datasets: [
                    {
                    label: "Residents",
                    data: Object.values(stats.occupationStats),
                    backgroundColor: "#10B981",
                    },
                ],
                }}
                options={{ responsive: true }}
            />
            </div>
        </CardContent>
    </Card>
    </div>
  );
};

export default ResidentsVis;
