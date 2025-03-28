import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import "../../css/visualizations/Line-ch.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const barangayList = [
    "Abuno", "Acmac-Mariano Badelles Sr.", "Bagong Silang", "Bonbonon", "Bunawan", "Buru-un", "Dalipuga",
    "Del Carmen", "Digkilaan", "Ditucalan", "Dulag", "Hinaplanon", "Hindang", "Kabacsanan", "Kalilangan",
    "Kiwalan", "Lanipao", "Luinab", "Mahayahay", "Mainit", "Mandulog", "Maria Cristina", "Pala-o",
    "Panoroganan", "Poblacion", "Puga-an", "Rogongon", "San Miguel", "San Roque", "Santa Elena",
    "Santa Filomena", "Santiago", "Santo Rosario", "Saray", "Suarez", "Tambacan", "Tibanga", "Tipanoy",
    "Tomas L. Cabili (Tominobo Proper)", "Upper Tominobo", "Tubod", "Ubaldo Laya", "Upper Hinaplanon",
    "Villa Verde"
];

const disasterTypes = ["Fire Incident", "Flood", "Landslide", "Earthquake", "Typhoon"];

const LineGraph = () => {
    const [disasters, setDisasters] = useState([]);
    const [selectedDisaster, setSelectedDisaster] = useState("");
    const [selectedBarangays, setSelectedBarangays] = useState([]);

    useEffect(() => {
        const fetchDisasters = async () => {
            try {
                const response = await axios.get("http://localhost:3003/get-disasters");
                setDisasters(response.data);
            } catch (error) {
                console.error("Error fetching disasters:", error);
            }
        };
        fetchDisasters();
    }, []);

    const currentYear = new Date().getFullYear();
    const lastFiveYears = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);


    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "bottom",
                labels: {
                    boxWidth: 16,
                    font: { size: 10 },
                    padding: 6,
                    usePointStyle: true,
                    generateLabels: function(chart) {
                        const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
                        const labels = original(chart);
    
                        // Split into 4 rows, 11 per row
                        return labels.map((label, index) => ({
                            ...label,
                            lineIndex: Math.floor(index / 11)  // Groups every 11 items
                        }));
                    }
                },
            },
        },
        layout: {
            padding: {
                top: 10,
                bottom: 20
            }
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
              stepSize: 1,
              beginAtZero: true,
            },
          },
          animation: {
            duration: 2000,
            easing: "easeInOutQuart",
          },
    };
    
    
    const chartData = useMemo(() => {
        const barangayData = {};
        lastFiveYears.forEach(year => barangayData[year] = {});

        disasters.forEach(disaster => {
            if (selectedDisaster && disaster.disasterType !== selectedDisaster) return;
            const year = new Date(disaster.disasterDateTime).getFullYear();
            if (!lastFiveYears.includes(year)) return;

            disaster.barangays.forEach(({ name }) => {
                if (!barangayData[year][name]) {
                    barangayData[year][name] = 0;
                }
                barangayData[year][name] += 1;
            });
        });

        const filteredBarangays = selectedBarangays.length > 0 ? selectedBarangays.map(b => b.value) : barangayList;

        const datasets = filteredBarangays.map(barangay => ({
            label: barangay,
            data: lastFiveYears.map(year => barangayData[year][barangay] || 0),
            borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
            fill: false
        }));

        return { labels: lastFiveYears, datasets, barangayData };
    }, [disasters, selectedDisaster, selectedBarangays]);

    const disasterInsights = useMemo(() => {
        let totalOccurrences = 0;
        let mostAffectedBarangay = "";
        let mostAffectedCount = 0;
        let yearWithMostDisasters = "";
        let highestYearlyCount = 0;

        const barangayOccurrences = {};
        const yearlyOccurrences = {};

        disasters.forEach(disaster => {
            if (selectedDisaster && disaster.disasterType !== selectedDisaster) return;
            const year = new Date(disaster.disasterDateTime).getFullYear();
            if (!lastFiveYears.includes(year)) return;

            yearlyOccurrences[year] = (yearlyOccurrences[year] || 0) + 1;
            disaster.barangays.forEach(({ name }) => {
                if (selectedBarangays.length === 0 || selectedBarangays.some(b => b.value === name)) {
                    barangayOccurrences[name] = (barangayOccurrences[name] || 0) + 1;
                }
            });

            totalOccurrences += 1;
        });

        Object.entries(barangayOccurrences).forEach(([barangay, count]) => {
            if (count > mostAffectedCount) {
                mostAffectedCount = count;
                mostAffectedBarangay = barangay;
            }
        });

        Object.entries(yearlyOccurrences).forEach(([year, count]) => {
            if (count > highestYearlyCount) {
                highestYearlyCount = count;
                yearWithMostDisasters = year;
            }
        });

        return {
            totalOccurrences,
            mostAffectedBarangay,
            mostAffectedCount,
            yearWithMostDisasters
        };
    }, [disasters, selectedDisaster, selectedBarangays]);

    return (
        <div className="line-graph-container">
            <div className="filter-section">
                <h2>Disaster Occurrences</h2>
                <div className="filters">
                    <select value={selectedDisaster} onChange={(e) => setSelectedDisaster(e.target.value)}>
                        <option value="">All</option>
                        {disasterTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    <Select
                        options={barangayList.map(name => ({ value: name, label: name }))}
                        isMulti
                        value={selectedBarangays}
                        onChange={setSelectedBarangays}
                        placeholder="Select barangays..."
                    />
                </div>
            </div>

            <div className="graph-container">
                {chartData && chartData.datasets.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />

                ) : (
                    <p>No data available for the selected criteria.</p>
                )}
            </div>

                     {/* Dynamic Insights */}
            <div className="pie-text-overlay">
                {disasterInsights.totalOccurrences === 0 ? (
                    <p>No disaster data available.</p>
                ) : (
                    <div>
                        <p><strong>Total occurrences for all barangays:</strong> {disasterInsights.totalOccurrences}</p>
                        <p><strong>Most affected barangay:</strong> {disasterInsights.mostAffectedBarangay} ({disasterInsights.mostAffectedCount} occurrences)</p>
                        <p><strong>Year with highest disasters:</strong> {disasterInsights.yearWithMostDisasters}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LineGraph;
