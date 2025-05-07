import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import "../../css/visualizations/Line-ch.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

const disasterColors = {
    "Fire Incident": "rgba(255, 99, 132, 0.7)",
    "Flood": "rgba(54, 162, 235, 0.7)",
    "Landslide": "rgba(139,69,19, 0.7)",
    "Earthquake": "rgba(255, 159, 64, 0.7)",
    "Typhoon": "rgba(153, 102, 255, 0.7)"
  };
  

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


const StackedBarChart = () => {
    const [disasters, setDisasters] = useState([]);
    const [selectedBarangays, setSelectedBarangays] = useState([]);
    const [selectedYear, setSelectedYear] = useState("All Years"); 

    const [user, setUser] = useState({ role: "", barangay: "" });

    useEffect(() => {
        // Fetch user role and barangay from localStorage
        const storedRole = localStorage.getItem("role");
        const storedBarangay = localStorage.getItem("barangay");

        if (storedRole && storedBarangay) {
            setUser({ role: storedRole, barangay: storedBarangay });

            if (storedRole === "daycare worker") {
                // If daycare worker, preselect their barangay and don't allow others
                setSelectedBarangays([{ value: storedBarangay, label: storedBarangay }]);
            }
        }
    }, []);

    useEffect(() => {
        const fetchDisasters = async () => {

            const localData = localStorage.getItem("disasters");
            if (localData) {
              const parsed = JSON.parse(localData);
              setDisasters(parsed);
            }
            
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-disasters`);
                setDisasters(response.data);
            } catch (error) {
                console.error("Error fetching disasters:", error);
            }
        };
        fetchDisasters();
    }, []);

    const chartData = useMemo(() => {
        const dataByMonthAndType = {};

        for (let month = 0; month < 12; month++) {
            dataByMonthAndType[month] = {};
            disasterTypes.forEach(type => {
                dataByMonthAndType[month][type] = 0;
            });
        }

        disasters.forEach(disaster => {
            const date = new Date(disaster.disasterDateTime);
            const year = date.getFullYear();
            const month = date.getMonth(); // 0 = Jan, 11 = Dec

            if (selectedYear !== "All Years" && year !== Number(selectedYear)) return;
            
            const isRelevant = selectedBarangays.length === 0 ||
                disaster.barangays.some(({ name }) => selectedBarangays.some(b => b.value === name));

            if (isRelevant) {
                dataByMonthAndType[month][disaster.disasterType] += 1;
            }
        });

        const datasets = disasterTypes.map(type => ({
            label: type,
            data: monthLabels.map((_, monthIndex) => dataByMonthAndType[monthIndex][type]),
            backgroundColor: disasterColors[type],
        }));

        return {
            labels: monthLabels,
            datasets
        };
    }, [disasters, selectedYear, selectedBarangays]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    font: { size: 10 },
                    boxWidth: 16,
                    padding: 6,
                },
            },
        },
        scales: {
            x: {
                stacked: true,
                ticks: { color: "#000" },
                grid: { display: false },
            },
            y: {
                stacked: true,
                ticks: {
                    color: "#000",
                    stepSize: 1,
                    beginAtZero: true,
                    callback: function (value) {
                        return Number.isInteger(value) ? value : "";
                    }
                },
                grid: {
                    color: "rgba(0, 0, 0, 0.1)",
                },
            },
        },
        animation: {
            duration: 2000,
            easing: "easeInOutQuart",
        },
    };

    const updatedChartData = useMemo(() => {
        if (!chartData) return null;
        
        return {
          labels: [0, ...chartData.labels],
          datasets: chartData.datasets.map((dataset) => ({
            ...dataset,
            data: [0, ...dataset.data],
          })),
        };
      }, [chartData]);
      
      const disasterInsights = useMemo(() => {
        let totalOccurrences = 0;
        let barangayCounts = {};
        let typeCounts = {};
        let monthCounts = {};

        disasters.forEach(disaster => {
            const date = new Date(disaster.disasterDateTime);
            const year = date.getFullYear();
            const month = date.getMonth();

            if (selectedYear !== "All Years" && year !== Number(selectedYear)) return;

            const isRelevant = selectedBarangays.length === 0 ||
                disaster.barangays.some(({ name }) => selectedBarangays.some(b => b.value === name));

            if (isRelevant) {
                totalOccurrences += 1;

                // For barangay counting
                disaster.barangays.forEach(({ name }) => {
                    barangayCounts[name] = (barangayCounts[name] || 0) + 1;
                });

                // For type counting
                typeCounts[disaster.disasterType] = (typeCounts[disaster.disasterType] || 0) + 1;

                // For month counting
                monthCounts[month] = (monthCounts[month] || 0) + 1;
            }
        });

        const mostAffectedBarangay = Object.entries(barangayCounts).reduce((max, [name, count]) =>
            count > max.count ? { name, count } : max, { name: "", count: 0 });

        const mostCommonType = Object.entries(typeCounts).reduce((max, [type, count]) =>
            count > max.count ? { type, count } : max, { type: "", count: 0 });

        const monthWithMostDisasters = Object.entries(monthCounts).reduce((max, [month, count]) =>
            count > max.count ? { month: Number(month), count } : max, { month: "", count: 0 });

        return {
            totalOccurrences,
            mostAffectedBarangay: mostAffectedBarangay.name,
            mostAffectedCount: mostAffectedBarangay.count,
            mostCommonType: mostCommonType.type,
            monthWithMostDisasters: monthLabels[monthWithMostDisasters.month] || ""
        };
    }, [disasters, selectedYear, selectedBarangays]);

    const availableYears = ["All Years", ...Array.from(new Set(disasters.map(d => new Date(d.disasterDateTime).getFullYear()))).sort((a, b) => b - a)];
    
    return (
        <div className="line-graph-container">
            <div className="filter-section">
                <h2>Monthly Disaster Occurrences <br /> ({selectedYear})</h2>
                
                <div className="filters">

                    <div class="select-wrapper">
                        <select class="styled-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    
                    <Select
                        options={barangayList.map(name => ({ value: name, label: name }))}
                        isMulti={user.role !== "daycare worker"} 
                        isDisabled={user.role === "daycare worker"}
                        value={selectedBarangays}
                        onChange={setSelectedBarangays}
                        placeholder="Filter by barangays..."
                    />


                </div>
            </div>

            <div className="graph-container">
                {chartData && chartData.datasets.length > 0 ? (
                    <Bar data={chartData} options={chartOptions} />
                ) : (
                    <p>No data available for the selected criteria.</p>
                )}
            </div>

            
            {/* Dynamic Insights */}
            <div className="line-text-overlay">
                {disasterInsights.totalOccurrences === 0 ? (
                    <p>No disaster data available.</p>
                ) : (
                    <div>
                    <p><strong>Total occurrences:</strong> {disasterInsights.totalOccurrences}</p>
                    {user.role === "daycare worker" ? (
                        <>
                            <p><strong>Most common disaster type:</strong> {disasterInsights.mostCommonType}</p>
                            <p><strong>Month with highest disasters:</strong> {disasterInsights.monthWithMostDisasters}</p>
                        </>
                    ) : (
                        <>
                            <p><strong>Most affected barangay:</strong> {disasterInsights.mostAffectedBarangay} ({disasterInsights.mostAffectedCount} occurrences)</p>
                            <p><strong>Month with highest disasters:</strong> {disasterInsights.monthWithMostDisasters}</p>
                        </>
                    )}
                </div>
                )}
            </div>
        </div>
    );
};

export default StackedBarChart;
