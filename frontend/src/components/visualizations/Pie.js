import React, { useState, useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "../../css/visualizations/Pie-ch.css"; 
import Filter from "../again/Filter";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
  const [casualtyStats, setCasualtyStats] = useState({
    injured: 120,
    dead: 45,
    missing: 20
  });

  const [totalCasualties] = useState(casualtyStats.injured + casualtyStats.dead + casualtyStats.missing);
  const [disasterDate] = useState("March 15, 2025");

  const data = useMemo(() => ({
    labels: ["Injured", "Dead", "Missing"],
    datasets: [
      {
        data: [casualtyStats.injured, casualtyStats.dead, casualtyStats.missing],
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
      },
    ],
  }), [casualtyStats]);

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
          <Filter disasters={[]} onFilter={() => {}} filters={{}} graphType="pie" />
        </div>
        <h2>Casualties Breakdown</h2>
        <div className="pie-wrapper">
          <Pie data={data} options={options} />
        </div>
      </div>
      <div className="pie-text-overlay">
        <h2>Disaster Insights</h2>
        {totalCasualties === 0 ? (
          <p>No casualty data available.</p>
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

export default PieChart;
