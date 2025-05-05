import "../../css/visualizations/ResidentsVis.css";
import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef, } from "react";
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
import * as XLSX from "xlsx";
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ResidentsVis = forwardRef(({ selectedBarangay }, ref) => {
  const [residents, setResidents] = useState([]);
  const [maleCount, setTotalMale] = useState(0);
  const [femaleCount, setTotalFemale] = useState(0);
  const [minorCount, setMinorCount] = useState(0);
  const [adultCount, setAdultCount] = useState(0);
  const [seniorCount, setSeniorCount] = useState(0);
  const [education, setEducation] = useState(0);
  const [occupation, setOccupation] = useState(0);

  const [eduChart, setEduChart] = useState(null);
  const [occChart, setOccChart] = useState(null);
  const [genderChart, setGenderChart] = useState(null);

  const internalRef = useRef();

console.log(selectedBarangay)
useEffect(() => {
  const fetchExistingResidents = async () => {
    const localData = localStorage.getItem("residents");

    // Use cached data immediately
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        const cachedResidents = selectedBarangay
          ? parsed.filter(resident => resident.barangay === selectedBarangay)
          : parsed;

        const newResidents = cachedResidents. filter(resident => resident.status === "active");

        setResidents(newResidents);
        setResidents(cachedResidents);
      } catch (e) {
        console.error("Failed to parse cached residents:", e);
      }
    }

    // Try fetching fresh data
    try {
      const response = await axios.get("http://localhost:3003/get-residents");
      const data = response.data;

      // Save fresh data to localStorage
      localStorage.setItem("residents", JSON.stringify(data));

      // Apply filter after fetching
      const filteredResidents = selectedBarangay
        ? data.filter(resident => resident.barangay === selectedBarangay)
        : data;

      const newResidents = filteredResidents. filter(resident => resident.status === "active");

      setResidents(newResidents);
    } catch (error) {
      console.error("Error fetching residents:", error);
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

       const groupEducation = (level) => {
        if (!level) return "Not Specified";
      
        const val = level.toLowerCase();
      
        // Kinder
        if (val.includes("kinder") || val.includes("nursery") || val.includes("pre")) {
          return "Kinder";
        }
      
        // Elementary Level or Graduate
        if (
          val.includes("elementary") ||
          val.match(/\bgrade\s?[1-6]\b/) ||
          val.match(/\bg[1-6]\b/)
        ) {
          if (val.includes("grad")) return "Elementary Graduate";
          return "Elementary Level";
        }
      
        // High School Level or Graduate (excluding senior high)
        if (
          (val.includes("high school") && !val.includes("senior")) ||
          val.includes("junior high") ||
          val.match(/\bgrade\s?(7|8|9|10)\b/) ||
          val.match(/\bg(7|8|9|10)\b/)
        ) {
          if (val.includes("grad")) return "High School Graduate";
          return "High School Level";
        }
      
        // Senior High School Level or Graduate
        if (
          val.includes("senior high") ||
          val.match(/\bgrade\s?(11|12)\b/) ||
          val.match(/\bg(11|12)\b/)
        ) {
          if (val.includes("grad")) return "Senior High School Graduate";
          return "Senior High School Level";
        }
      
        // Bachelor's Degree or College Level or Graduate
        if (val.includes("college") || val.includes("bachelor")) {
          if (val.includes("grad")) return "Bachelor's Degree";
          return "College Level";
        }
      
        // Vocational
        if (val.includes("vocational") || val.includes("tech") || val.includes("tesda")) {
          return "Vocational";
        }
      
        // Master's Degree or Doctorate Degree
        if (val.includes("master") || val.includes("doctor") || val.includes("post")) {
          if (val.includes("master")) return "Master's Degree";
          return "Doctorate Degree";
        }
      
        return "Not Specified";
      };
      
    
      // Categorize resident's educational attainment

      const grouped = groupEducation(resident.education);
      educationLevels[grouped] = (educationLevels[grouped] || 0) + 1;

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
        const groupedDep = groupEducation(dep.education);
        educationLevels[groupedDep] = (educationLevels[groupedDep] || 0) + 1;
        
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

    const educationHierarchy = [
      "Not Specified",
      "Kinder",
      "Elementary Level",
      "Elementary Graduate",
      "High School Level",
      "High School Graduate",
      "Senior High School Level",
      "Senior High School Graduate",
      "Vocational",
      "College Level",
      "Bachelor's Degree",
      "Master's Degree",
      "Doctorate Degree"
    ];
    
    
    
    const sortedEducation = educationHierarchy.reduce((acc, level) => {
      if (educationLevels[level]) {
        acc[level] = educationLevels[level];
      }
      return acc;
    }, {});
    
    setEducation(sortedEducation);
    setOccupation(sortedOccupations);
  }, [residents]);

  useImperativeHandle(ref, () => ({
    downloadExcel() {
      const wb = XLSX.utils.book_new();
  
      const summaryData = [
        ["Category", "Count"],
        ["Minors", minorCount],
        ["Adults", adultCount],
        ["Seniors", seniorCount],
        ["Male", maleCount],
        ["Female", femaleCount],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, "Demographics");
  
      const educationSheet = XLSX.utils.json_to_sheet(
        Object.entries(education).map(([key, value]) => ({
          Education: key,
          Count: value,
        }))
      );
      XLSX.utils.book_append_sheet(wb, educationSheet, "Education");
  
      const occupationSheet = XLSX.utils.json_to_sheet(
        Object.entries(occupation).map(([key, value]) => ({
          Occupation: key,
          Count: value,
        }))
      );
      XLSX.utils.book_append_sheet(wb, occupationSheet, "Occupation");
  
      const residentsData = [];
      residents.forEach((resident) => {
        const base = {
          Name: `${resident.firstName} ${resident.middleName || ""} ${resident.lastName}`,
          Age: resident.age,
          Sex: resident.sex === "M" ? "Male" : "Female",
          Education: resident.education || "N/A",
          Occupation: resident.occupation || "N/A",
          Barangay: resident.barangay,
        };
        residentsData.push(base);
  
        resident.dependents.forEach((dep) => {
          const dependentRow = {
            Name: "",
            Age: "",
            Sex: "",
            Education: "",
            Occupation: "",
            Barangay: "",
            Dependents_Name: dep.name,
            Dependents_Age: dep.age,
            Dependents_Sex: dep.sex === "M" ? "Male" : "Female",
            Dependents_Education: dep.education || "N/A",
            Dependents_Occupation: dep.occupationSkills || "N/A",
          };
          residentsData.push(dependentRow);
        });

        
      });
  
      const residentsSheet = XLSX.utils.json_to_sheet(residentsData);
      XLSX.utils.book_append_sheet(wb, residentsSheet, "Resident List");
  
      // Add visualization summary sheet
      const visualizationSummary = [
        ["--- DEMOGRAPHIC CHART DATA ---"],
        [],
        ["Age Groups"],
        ["Minors (0–17)", minorCount],
        ["Adults (18–59)", adultCount],
        ["Seniors (60+)", seniorCount],
        [],
        ["Gender Distribution"],
        ["Male", maleCount],
        ["Female", femaleCount],
        [],
        ["Educational Attainment"],
        ...Object.entries(education).map(([level, count]) => [level, count]),
        [],
        ["Occupations"],
        ...Object.entries(occupation).map(([job, count]) => [job, count]),
      ];
      const visualSheet = XLSX.utils.aoa_to_sheet(visualizationSummary);
      XLSX.utils.book_append_sheet(wb, visualSheet, "Visualization Summary");
  
      XLSX.writeFile(
        wb,
        selectedBarangay
          ? `Residents_${selectedBarangay}_Visualizations.xlsx`
          : "Residents_Visualizations.xlsx"
      );
    },

    async downloadVisualization() {
      const chartElement = document.getElementById("chart-container");
      if (!chartElement) return;
    
      const canvas = await html2canvas(chartElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
    
      const topPageMargin = 50;          // Big margin before title
      const titleFontSize = 80;           // Font size in px
      const titleHeight = 50;             // Approximate title text height (same as font size usually)
      const extraPaddingBelowTitle = 10;  // Small margin between title and image
      const bottomPageMargin = 50;        // Big margin after chart
    
      const totalHeight = topPageMargin + titleHeight + extraPaddingBelowTitle + canvas.height + bottomPageMargin;
    
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, totalHeight],
      });
    
      const title = selectedBarangay ? selectedBarangay : "Iligan City";
    
      pdf.setFontSize(titleFontSize);
      pdf.text(title, canvas.width / 2, topPageMargin + titleFontSize / 2, { align: "center" });
    
      // Start the image after title + some extra space
      const imageStartY = topPageMargin + titleHeight + extraPaddingBelowTitle;
    
      pdf.addImage(imgData, "PNG", 0, imageStartY, canvas.width, canvas.height);
    
      pdf.save(
        selectedBarangay
          ? `Residents_${selectedBarangay}_Visualization.pdf`
          : "Residents_Visualization.pdf"
      );
    }
    
    
  }));

  
  

  

  if (!residents) return <p>Loading...</p>;

  return (
    <div className="grid-container"  id="chart-container" ref={internalRef}>
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
              ticks: {
                color: "#333",
                callback: function(value) {
                  // Only show whole numbers
                  if (Number.isInteger(value)) {
                    return value;
                  }
                }
              }
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
                    ticks: {
                      color: "#333",
                      callback: function(value) {
                        // Only show whole numbers
                        if (Number.isInteger(value)) {
                          return value;
                        }
                      }
                    }
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
});

export default ResidentsVis;
