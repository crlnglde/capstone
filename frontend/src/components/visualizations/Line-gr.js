import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import "../../css/visualizations/Bar-ch.css";

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

        return { labels: lastFiveYears, datasets };
    }, [disasters, selectedDisaster, selectedBarangays]);

    return (
        <div className="bar-graph-container">

            <div className='bar'>

                <div className="bar-filter">
                    <h2>Disaster Occurrences per Barangay (Past 5 Years)</h2>

                    <div className="filters-right">
                        <div className="bar-filter-container">
                            {/* Disaster Type Dropdown */}

                            <select value={selectedDisaster} onChange={(e) => setSelectedDisaster(e.target.value)}>
                                <option value="">All</option>
                                {disasterTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
       
                        </div>

                        <div className="bar-filter-container">
                            <Select
                                options={barangayList.map(name => ({ value: name, label: name }))}
                                isMulti
                                value={selectedBarangays}
                                onChange={setSelectedBarangays}
                                placeholder="Select barangays..."
                            />
                                    
                        </div>
                    </div>
                </div>
    
                <div className="bar-wrapper">
                {/* Render Line Graph */}
           
                    {chartData && chartData.datasets.length > 0 ? (
                        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    ) : (
                        <p>No data available for the selected criteria.</p>
                    )}

                </div>
            </div>
        </div>
    );
};

export default LineGraph;
