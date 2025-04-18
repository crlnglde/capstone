import "../../css/visualizations/ResidentsVis.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
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

const ResidentsVis = ({ selectedBarangay }) => {
  const [stats, setStats] = useState(null);
  const [residents, setResidents] = useState([]);
  const [maleCount, setTotalMale] = useState(0);
  const [femaleCount, setTotalFemale] = useState(0);
  const [minorCount, setMinorCount] = useState(0);
  const [adultCount, setAdultCount] = useState(0);
  const [seniorCount, setSeniorCount] = useState(0);
  const [education, setEducation] = useState(0);
  const [occupation, setOccupation] = useState(0);

console.log(selectedBarangay)
  useEffect(() => {
    const fetchExistingResidents = async () => {
      try {
        const response = await axios.get("http://192.168.1.127:3003/get-residents");
        const data= response.data;
         // If a barangay is selected, filter the data for that barangay
         if (selectedBarangay) {
          const filteredData = data.filter(
            (resident) => resident.barangay === selectedBarangay
          );
          setResidents(filteredData);
        } else {
          setResidents(data); // No barangay selected, set all residents
        }
      } catch (error) {
        console.error("Error fetching residents:", error);
        return [];
      }
    };
    fetchExistingResidents();
  }, [selectedBarangay]);

  useEffect(() => {
    let maleCount = 0;
    let femaleCount = 0;

    let minorCount = 0;
    let adultCount = 0;
    let seniorCount = 0;
    
    let educationLevels = {};
    let occupationCounts = {};

    residents.forEach(resident => {
       // Count gender
      if (resident.sex === "M") maleCount++;
      if (resident.sex === "F") femaleCount++;

       // Categorize resident age
       const residentAge = resident.age; // Assuming 'age' is available
       if (residentAge >= 0 && residentAge <= 17) minorCount++;
       else if (residentAge >= 18 && residentAge <= 59) adultCount++;
       else if (residentAge >= 60) seniorCount++;
    
      // Categorize resident's educational attainment
       if (resident.education) {
        educationLevels[resident.education] = (educationLevels[resident.education] || 0) + 1;
      }

      // Categorize resident's occupation

      let occupation = resident.occupation;
      if (occupation && (occupation.toLowerCase() === "n/a" || occupation.toLowerCase() === "none")) {
        occupation = "Not Available"; // Standardize the occupation to "Not Available"
      }

    if (occupation) {
      occupationCounts[occupation] = (occupationCounts[occupation] || 0) + 1;
    }

      resident.dependents.forEach(dep => {
        if (dep.sex === "Male") maleCount++;
        if (dep.sex === "Female") femaleCount++;

        const dependentAge = dep.age; // Assuming 'age' is available
        if (dependentAge >= 0 && dependentAge <= 17) minorCount++;
        else if (dependentAge >= 18 && dependentAge <= 59) adultCount++;
        else if (dependentAge >= 60) seniorCount++;

        // Categorize dependent's educational attainment
        if (dep.education) {
          educationLevels[dep.education] = (educationLevels[dep.education] || 0) + 1;
        }
        // Categorize dependent's occupation

        let depOccupation = dep.occupationSkills;
        if (depOccupation && (depOccupation.toLowerCase() === "n/a" || depOccupation.toLowerCase() === "none")) {
          depOccupation = "Not Available"; // Standardize the occupation to "Not Available"
        }

        if (depOccupation) {
        occupationCounts[depOccupation] = (occupationCounts[depOccupation] || 0) + 1;
        }
      });

    });

    const sortedOccupations = Object.keys(occupationCounts).sort().reduce((acc, key) => {
      acc[key] = occupationCounts[key];
      return acc;
    }, {});

    setTotalMale(maleCount);
    setTotalFemale(femaleCount);
    setMinorCount(minorCount);
    setAdultCount(adultCount);
    setSeniorCount(seniorCount);
    setEducation(educationLevels);
    setOccupation(sortedOccupations);
  }, [residents]);

  if (!residents) return <p>Loading...</p>;

  return (
    <div className="grid-container">
    {/* Row 1: Senior Card + Educational Attainment Bar */}
    <div className="grid-item grid-item-1">
        <Card className="card total-senior-card">
        <div className="card-header m">
            <p className="title">Minors</p>
            <p className="age">(0–17)</p>
        </div>
        <CardContent className="card-body">
            <div className="icon-and-number">
              
            <span className="icon m"><FaUsers /></span>
            <h2 className="card-number">{minorCount}</h2>
            </div>
        </CardContent>
        </Card>

        <Card className="card total-senior-card">
        <div className="card-header a">
            <p className="title">Adults</p>
            <p className="age">(18–59)</p>
        </div>
        <CardContent className="card-body">
            <div className="icon-and-number">

            <span className="icon a"><FaUsers /></span>

            <h2 className="card-number">{adultCount}</h2>

            </div>
        </CardContent>
        </Card>

        <Card className="card total-senior-card">
        <div className="card-header s">
            <p className="title">Senior Citizen</p>
            <p className="age">(60+)</p>
        </div>
        <CardContent className="card-body">
            <div className="icon-and-number">

            <span className="icon s"><FaUsers /></span>

            <h2 className="card-number">{seniorCount}</h2>

            </div>
        </CardContent>
        </Card>
    </div>

    <Card className="card full-width">
        <CardContent>
        <p className="chart-title">Educational Attainment</p>
        <Bar
            data={{
            labels: Object.keys(education),
            datasets: [
                {
                label: "Residents",
                data: Object.values(education),
                backgroundColor: ["#93c5fd", "#60a5fa", "#3b82f6"],
                borderRadius: 5,
                },
            ],
            }}
            options={{
            responsive: true,
            plugins: {
                legend: { display: false },
            },
            scales: {
                y: {
                beginAtZero: true,
                ticks: { color: "#333" },
                },
                x: {
                ticks: { color: "#333" },
                },
            },
            }}
        />
        </CardContent>
    </Card>

    {/* Row 2: Dependents by Gender Pie + Occupation Distribution Bar */}
    <Card className="card pie-chart-card">
        <CardContent>
            <p className="chart-title">Gender Distribution</p>
            <div className="pie-chart-container">

            <Pie
            data={{
                labels: ["Male", "Female"],
                datasets: [
                    {
                    data: [maleCount, femaleCount],
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
                    color: "#444",
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
    <div className="chart-wrapper">
      <div
        className="chart-container"
        style={{
          height: '300px',
          overflowY: 'auto',
          maxHeight: '400px', // Limit the height for scroll
        }}
      >
        <Bar
          data={{
            labels: Object.keys(occupation), // All occupations (labels)
            datasets: [
              {
                label: "Residents",
                data: Object.values(occupation), // Occupation data
                backgroundColor: ["#93c5fd", "#60a5fa", "#3b82f6"],
                borderRadius: 5,
              },
            ],
          }}
          options={{
            indexAxis: "y", // Horizontal bars
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                beginAtZero: true,
                ticks: { color: "#333" },
              },
              y: {
                ticks: {
                  autoSkip: false, // Do not skip labels
                  maxRotation: 0,  // Keep labels straight
                  minRotation: 0,
                  color: "#333",
                },
                // Dynamically limit how many rows are displayed
                suggestedMin: Math.min(Object.keys(occupation).length, 6), // Limit to a minimum of 6 rows or fewer if there are less
                suggestedMax: 6, // Display a maximum of 6 rows at a time
              },
            },
          }}
        />
      </div>
    </div>
  </CardContent>
</Card>










    </div>

  );
};

export default ResidentsVis;
