import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { useLocation } from "react-router-dom";
import { FaUsers, FaDownload, FaFire, FaTint, FaFlag } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";
import jsPDF  from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import "../css/Reports.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

import FDR from  "./forms/FDR";
import SPORADIC from  "./forms/SPORADIC";
import Payroll from "./forms/Payroll";

import fireIncident from "../pic/fire.jpg";
import flooding from "../pic/rain.jpg";
import typhoon from "../pic/typhoon.png";
import landslide from "../pic/landslide.jpg";
import earthquake from "../pic/earthquake.png";
import armedConflict from "../pic/armedconflict.png";

import Search from "./again/Search-filter";
import Pagination from "./again/Pagination";

const Reports = ({setNavbarTitle}) => {
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState("SPORADIC");

  const [disasters, setDisasters] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");


  const fdrRef = useRef(null);
  const sporadicRef = useRef(null);
  const payrollRef = useRef(null);

    useEffect(() => {
      if (location.pathname === "/reports") {
        setNavbarTitle("Reports");
      }
    }, [location.pathname, setNavbarTitle]);


  useEffect(() => { 
    const fetchReports = async () => {
      try {
        const response = await axios.get("http://192.168.1.127:3003/get-disasters");
        const data = response.data;
  
        // Aggregate data by disaster
        const aggregatedReports = data.sort((a, b) => new Date(b.disasterDateTime) - new Date(a.disasterDateTime))
        .map(disaster => {
          const totalFamilies = disaster.barangays.reduce((sum, barangay) => 
            sum + barangay.affectedFamilies.length, 0
          );
          
          const barangayNames = disaster.barangays.map(barangay => barangay.name).join(", ");
          const affectedFamilies = disaster.barangays.flatMap(barangay => barangay.affectedFamilies);

          const date = new Date(disaster.disasterDateTime);
          const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
          
          const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          
          const dateTime = `${formattedDate} ${formattedTime}`;
  
          return {
            id: disaster.disasterCode,
            date: dateTime,
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            barangays: barangayNames,
            type: disaster.disasterType,
            households: totalFamilies,
            families: affectedFamilies, // Use the flattened array of affected families
          };
        });
  
        setReports(aggregatedReports);
        setFilteredReports(aggregatedReports); 
      } catch (error) {
        console.error("Failed to fetch disaster reports:", error);
      }
    };
  
    fetchReports();
  }, []);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        const response = await axios.get("http://192.168.1.127:3003/get-distribution");
        const distributionData = response.data;
        setDistribution(distributionData);
      } catch (error) {
        console.error("Error fetching distribution data:", error);
      }
    };
  
    fetchDistribution();
  }, []);  

  const getDistributionForReport = (reportId) => {
    return distribution.filter(item => item.disasterCode === reportId);
  };  
  
  // Function to assign the correct icon based on type
  const getIcon = (type) => {
    const iconMap = {
      "Fire Incident": <FaFire />,
      "Flooding": <FaTint />,
      "Typhoon": <FaTint />,
      "Landslide": <FaTint />,
      "Earthquake": <FaTint />,
      "Armed Conflict": <FaFlag />,
    };
    return iconMap[type] || null; // Default to null if type is unknown
  };

  // Function to assign the correct label color based on type
  const getLabelColor = (type) => {
    const colorMap = {
      "Fire Incident": "red",
      "Flood": "blue",
      "Typhoon": "orange",
      "Landslide": "brown",
      "Earthquake": "black",
      "Armed Conflict": "green",
    };
    return colorMap[type] || "gray"; // Default to gray if type is unknown
  };

  // Function to assign the correct image based on type
  const getImage = (type) => {
    const imageMap = {
      "Fire Incident": fireIncident,
      "Flood": flooding,
      "Typhoon": typhoon,
      "Landslide": landslide,
      "Earthquake": earthquake,
      "Armed Conflict": armedConflict,
    };
    return imageMap[type] || fireIncident; // Default fallback
  };

    const handlePrint = async () => {
      const activeRef = activeTab === "SPORADIC" ? sporadicRef : activeTab === "FDR" ? fdrRef : payrollRef;
    
      let orientation = "portrait";
      let pageSize = "a4"; 
    
      if (activeTab === "SPORADIC") {
        orientation = "landscape";
        pageSize = "a4";
      } else if (activeTab === "Payroll") {
        orientation = "landscape";
        pageSize = [215.9, 330.2]; 
      }
    
      const doc = new jsPDF(orientation, "mm", pageSize);
      let y = 10;
    
      const addElementToPDF = async (elementId, yOffset = 10, align = "left") => {
        const element = document.querySelector(elementId);
        if (!element) {
          console.error(`Element ${elementId} not found`);
          return;
        }
    
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = doc.internal.pageSize.width - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
        let x = 10;
        if (align === "center") {
          const pageWidth = doc.internal.pageSize.width;
          x = (pageWidth - imgWidth) / 2;
        }
    
        doc.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
        y += imgHeight + yOffset;
      };
    
      if (activeTab === "SPORADIC") {
        await addElementToPDF(".header", 1, "center");
    
        const sporadicTable = document.querySelector("#yourTableID");
        if (sporadicTable) {
          const headers = [
            ["No.", "Name", "Age", "Sex", "Brgy. Address", "No. of Dependents", "Type of Calamity", "Date of Calamity", "Category", "Senior Citizen", "PWD", "Solo Parent", "Pregnant", "Lactating Mothers", "Livelihood"],
          ];
    
          const body = [];
          sporadicTable.querySelectorAll("tbody tr").forEach((tr) => {
            const rowData = [];
            tr.querySelectorAll("td").forEach((td) => {
              rowData.push(td.innerText.trim());
            });
            body.push(rowData);
          });
    
          autoTable(doc, {
            startY: y + 5,
            head: headers,
            body: body,
            styles: { fontSize: 8, halign: "center" },
            theme: "grid",
          });
    
          y = doc.lastAutoTable.finalY + 10;
        }
    
        await addElementToPDF(".table-container1", 5);
        await addElementToPDF(".reco", 10);
        await addElementToPDF(".footer", 10);
    
      } else if (activeTab === "FDR") {
        if (!fdrRef.current) {
          console.error("FDR content not found!");
          return;
        }
    
        try {
          const canvas = await html2canvas(fdrRef.current, { scale: 2, useCORS: true });
          const imgData = canvas.toDataURL("image/png");
          const imgWidth = doc.internal.pageSize.width - 20;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
          doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        } catch (error) {
          console.error("Error generating FDR print:", error);
        }
    
      } else if (activeTab === "Payroll") {
        if (!payrollRef.current) {
          console.error("Payroll content not found!");
          return;
        }
    
        try {
          const canvas = await html2canvas(payrollRef.current, { scale: 2, useCORS: true });
          const imgData = canvas.toDataURL("image/png");
          const imgWidth = doc.internal.pageSize.width - 10;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
          doc.addImage(imgData, "PNG", (doc.internal.pageSize.width - imgWidth) / 2, 10, imgWidth, imgHeight);
        } catch (error) {
          console.error("Error generating Payroll print:", error);
        }
      }
    
      doc.autoPrint();
      window.open(doc.output("bloburl"), "_blank");
    };
  
    const handleDownloadPDF = async () => {

      const confirmDownload = window.confirm("Are you sure you want to download this form?");
      if (!confirmDownload) return;

      const activeRef = activeTab === "SPORADIC" ? sporadicRef : activeTab === "FDR" ? fdrRef : payrollRef;
     
      // Set page size and orientation based on activeTab
      let orientation = "portrait";
      let pageSize = "a4"; // Default A4 size
      
      if (activeTab === "SPORADIC") {
        orientation = "landscape";
        pageSize = "a4";
      } else if (activeTab === "Payroll") {
        orientation = "landscape";
        pageSize = [215.9, 330.2]; // Folio size (Width x Height in mm)
      }

      const doc = new jsPDF(orientation, "mm", pageSize);
      let y = 10; // Initial Y position

      const addElementToPDF = async (elementId, yOffset = 10, align = "left") => {
        const element = document.querySelector(elementId);
        if (!element) {
          console.error(`Element ${elementId} not found`);
          return;
        }
    
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = doc.internal.pageSize.width - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
        let x = 10; // Default left alignment
        if (align === "center") {
          const pageWidth = doc.internal.pageSize.width;
          x = (pageWidth - imgWidth) / 2;
        }
    
        doc.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
        y += imgHeight + yOffset; // Increase Y position for spacing
      };
  
      if (activeTab === "SPORADIC") {
        // Add Header
        await addElementToPDF(".header", 1 , "center");
      
        // Extract Table Data
        const sporadic1 = document.querySelector("#yourTableID");
        if (sporadic1) {
            const headers = [
                [
                    { content: "No.", rowSpan: 2 },
                    { content: "Name", rowSpan: 2 },
                    { content: "Age", rowSpan: 2 },
                    { content: "Sex", rowSpan: 2 },
                    { content: "Brgy. Address", rowSpan: 2 },
                    { content: "No. of Dependents", rowSpan: 2 },
                    { content: "Type of Calamity", rowSpan: 2 },
                    { content: "Date of Calamity", rowSpan: 2 },
                    { content: "Category", rowSpan: 2 },
                    { content: "Sectoral", colSpan: 5 },
                    { content: "Livelihood", rowSpan: 2 },
                ],
                ["Senior Citizen", "PWD", "Solo Parent", "Pregnant", "Lactating Mothers"],
            ];

            const body = [];
            sporadic1.querySelectorAll("tbody tr").forEach((tr) => {
                const rowData = [];
                tr.querySelectorAll("td").forEach((td) => {
                    rowData.push(td.innerText.trim());
                });
                body.push(rowData);
            });

            // Define margin values
            const topMargin = 1;  // Small top margin
            const bottomMargin = 10; // Small bottom margin

            // Generate table with proper formatting
            autoTable(doc, {
                startY: y + topMargin, // Apply top margin before table
                head: headers,
                body: body,
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    valign: "middle",
                    halign: "center",
                    lineWidth: 0.2,
                    lineColor: [0, 0, 0], 
                },
                headStyles: {
                    fillColor: [255, 255, 255], 
                    textColor: [0, 0, 0], 
                    fontSize: 9,
                    lineWidth: 0.2,
                    lineColor: [0, 0, 0],
                },
                columnStyles: {
                    9: { halign: "center" },
                    10: { halign: "center" },
                    11: { halign: "center" },
                    12: { halign: "center" },
                    13: { halign: "center" },
                },
                theme: "grid",
            });

            y = doc.lastAutoTable.finalY + bottomMargin; // Apply bottom margin after table
        } else {
            console.error("Report table not found!");
        }

      
        // Add Immediate Food Assistance Table as Image
        const sporadic2 = document.querySelector(".table-container1");
        if (sporadic2) {
            const headers2 = [
                ["Name of Agency", "Type of Relief Assistance", "Quantity", "Assistance per Family", "Estimated Cost"]
            ];
        
            const body2 = [];
            sporadic2.querySelectorAll("tbody tr").forEach((tr) => {
                const rowData = [];
                tr.querySelectorAll("td").forEach((td, index) => {
                    let cellContent = td.innerText.trim();
        
                    // Handling the "TOTAL" row
                    if (cellContent.toUpperCase() === "TOTAL") {
                        rowData[0] = { content: "TOTAL", colSpan: 3, styles: { halign: "right", fontStyle: "bold" } };
                        rowData[1] = { content: td.nextElementSibling?.innerText.trim() || "₱0", styles: { fontStyle: "bold" } };
                        rowData[2] = { content: td.nextElementSibling?.nextElementSibling?.innerText.trim() || "₱0", styles: { fontStyle: "bold" } };
                        return; // Skip normal processing
                    }
        
                    rowData.push(cellContent);
                });
        
                body2.push(rowData);
            });

            // Add the title (h5) before the table
            const title = sporadic2.querySelector("h5")?.innerText.trim() || "Immediate Food Assistance From CSWD:";

            // Set starting X position to apply right margin
            const tableWidth = doc.internal.pageSize.width * 0.8; // 80% of page width
            const leftMargin = 30;
            const rightMargin = 50;
            const startX = leftMargin; // Keeps right margin space

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(title, startX, y);  // Adjust position (X=14, Y=y+5)

        
            // Generate table with proper formatting
            autoTable(doc, {
                startY: y + 3,
                head: headers2,
                body: body2,
                tableWidth: tableWidth,
                margin: { left: leftMargin, right: rightMargin },
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    valign: "middle",
                    halign: "center",
                    lineWidth: 0.2,
                    lineColor: [0, 0, 0],
                },
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontSize: 9,
                    fontStyle: "bold",
                    lineWidth: 0.2,
                    lineColor: [0, 0, 0],
                },
                columnStyles: {
                  0: { halign: "left", cellWidth: 30 },  // Name of Agency
                  1: { cellWidth: 40 },  // Type of Relief Assistance
                  2: { halign: "center", cellWidth: 50 },  // Quantity
                  3: { halign: "center", cellWidth: 40 },  // Assistance per Family
                  4: { halign: "center", cellWidth: 60 },  // Estimated Cost
                },
                theme: "grid",
            });
        
            y = doc.lastAutoTable.finalY + 1; // Move Y position after table
        } else {
            console.error("Immediate Food Assistance table not found!");
        }
        
        // Add Recommendation Section
        const recoSection = document.querySelector(".reco");
        if (recoSection) {
            const recoTitle = recoSection.querySelector("p.no-margin")?.innerText.trim() || "Recommendation:";
            const recoContent = recoSection.querySelector(".neym p.no-margin")?.innerText.trim() || "";
        
            // Set alignment margins (same as Sporadic1 table)
            const leftMargin = 15; // Align "Recommendation:" with the table
            const contentIndent = leftMargin + 35; // Indent for <p> inside .neym
            const extraGap = 1; // Small gap between "Sporadic1" and "Recommendation"
        
            y += extraGap; // Add extra gap before the recommendation section
        
            // Add "Recommendation" Title
            doc.setFontSize(10);
            doc.text(recoTitle, leftMargin, y + 10); // Align title with the table
        
            // Add Recommendation Content (Indented)
            doc.setFontSize(9);
            doc.text(recoContent, contentIndent, y + 15, { maxWidth: 160, align: "justify" });
        
            y += 15; // Move Y position after recommendation section
        }
      
        // Add Footer
        const footerSection = document.querySelector(".footer");
        if (footerSection) {
            const pageWidth = doc.internal.pageSize.width;
            const columnWidth = pageWidth / 3; // Divide page into 3 sections
            const leftMargin = 15; // Adjust to align with "Recommending Approval"
            const extraMargin = 10; // Space between "Recommending Approval" and the footer
            const titleToNameGap = 8; // Gap between Title and Name

            const footerY = doc.internal.pageSize.height - 50 + extraMargin; // Move footer down

            const footerColumns = footerSection.querySelectorAll(".one, .two, .three");

            footerColumns.forEach((column, index) => {
                const title = column.querySelector("p:first-child")?.innerText.trim() || "";
                const name = column.querySelector("h4")?.innerText.trim() || "";
                const positions = Array.from(column.querySelectorAll("p:not(:first-child)"))
                    .map(p => p.innerText.trim());

                const x = columnWidth * index + leftMargin; // Apply left margin
                const centerX = columnWidth * index + columnWidth / 2 + leftMargin; // Adjust center position

                // Title (e.g., "Prepared by") - Left aligned with margin
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(title, x, footerY, { align: "left" });

                // Name (Bold, Centered but Indented) - Added gap below title
                doc.setFontSize(12);
                doc.setFont(undefined, "bold");
                doc.setTextColor(0);
                doc.text(name, centerX, footerY + titleToNameGap + 7, { align: "center" });

                // Position Titles (Centered under Name)
                doc.setFontSize(10);
                doc.setFont(undefined, "normal");
                doc.setTextColor(100);
                positions.forEach((pos, idx) => {
                    doc.text(pos, centerX, footerY + titleToNameGap + 12 + idx * 5, { align: "center" });
                });
            });

            y = footerY + titleToNameGap + 25; // Move Y position after footer
        }
      } else if (activeTab === "FDR") {
          // Handling FDR tab 
          if (!fdrRef.current) {
            console.error("FDR content not found!");
            return;
          }

          try {
            // Ensure we're using the existing doc instance
            const pageWidth = doc.internal.pageSize.width;  // Get width from initialized doc
            const pageHeight = doc.internal.pageSize.height; // Get height from initialized doc
    
            // Capture the entire FDR section as an image
            const canvas = await html2canvas(fdrRef.current, {
                scale: 2, // Increase resolution for better quality
                useCORS: true,
                logging: false,
            });
    
            const imgData = canvas.toDataURL("image/png");
            const imgWidth = pageWidth - 20; // Account for margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const usablePageHeight = pageHeight - 20; // Account for margins
    
            const pageCount = Math.ceil(imgHeight / usablePageHeight);
    
            for (let i = 0; i < pageCount; i++) {
                if (i > 0) doc.addPage();
    
                const srcY = i * usablePageHeight * (canvas.height / imgHeight);
                const sHeight = Math.min(canvas.height - srcY, usablePageHeight * (canvas.height / imgHeight));
    
                // Create a temporary canvas to crop the current section
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = canvas.width;
                tempCanvas.height = sHeight;
    
                const ctx = tempCanvas.getContext("2d");
                ctx.drawImage(canvas, 0, srcY, canvas.width, sHeight, 0, 0, canvas.width, sHeight);
    
                const tempImgData = tempCanvas.toDataURL("image/png");
    
                doc.addImage(tempImgData, "PNG", 10, 10, imgWidth, (sHeight * imgWidth) / canvas.width);
            }

        } catch (error) {
            console.error("Error generating FDR PDF:", error);
        }
             
      } else if (activeTab === "Payroll") {
          if (!payrollRef.current) {
              console.error("Payroll content not found!");
              return;
          }

          try {
              const pageWidth = doc.internal.pageSize.width;  // Folio width
              const pageHeight = doc.internal.pageSize.height; // Folio height

              // Capture the entire Payroll section as an image
              const canvas = await html2canvas(payrollRef.current, {
                  scale: 2, // Higher scale for better quality
                  useCORS: true,
                  logging: false,
              });

              let imgData = canvas.toDataURL("image/png");

              // Maintain aspect ratio while fitting to Folio size
              const imgAspectRatio = canvas.width / canvas.height;
              let imgWidth = pageWidth - 10;  // Apply margin
              let imgHeight = imgWidth / imgAspectRatio;

              // Ensure it doesn't exceed page height
              if (imgHeight > pageHeight - 20) {
                  imgHeight = pageHeight - 20;
                  imgWidth = imgHeight * imgAspectRatio;
              }

              // Center image horizontally
              const xPos = (pageWidth - imgWidth) / 2;
              const yPos = 10; // Top margin

              // Add image to PDF and save
              doc.addImage(imgData, "PNG", xPos, yPos, imgWidth, imgHeight);

          } catch (error) {
              console.error(`Error generating Payroll PDF:`, error);
          }
      }

      // Save the PDF
      doc.save(`${activeTab.toLowerCase()}-report.pdf`);
    };
    
    //for search
    const handleSearchChange = (query) => {
      setCurrentPage(1);
      setSearchQuery(query);

      if (!query.trim()) {
        // If search is empty, show all reports
        setFilteredReports(reports);
        return;
      }
    
      // Apply filtering based on the query
      const filtered = reports.filter(report =>
        report.type.toLowerCase().includes(query.toLowerCase()) ||
        report.barangays.toLowerCase().includes(query.toLowerCase())
      );
    
      setFilteredReports(filtered);
    };

    const handleFilter = (filter) => {
      if (!filter.year) {
        setFilteredReports(reports);
        return;
      }
      console.log("Filter selected:", filter);
    
      let filteredData = reports.filter((report) => {
        const reportDate = new Date(report.date);
        const reportYear = reportDate.getFullYear();
        const reportMonth = reportDate.toLocaleString("en-US", { month: "short" });
    
        if (filter.type === "Yearly") {
          return reportYear === Number(filter.year); // Ensure year comparison is accurate
        } else if (filter.type === "Monthly") {
          return reportYear === Number(filter.year) && reportMonth === filter.month;
        }
        
        return true;
      });
    
      console.log("Filtered Reports:", filteredData);
      setFilteredReports(filteredData);
    };

      //pagination ni 
      const reportsPerPage = 8; // 4 columns x 4 rows
      const [currentPage, setCurrentPage] = useState(1);
      
      // Calculate total pages dynamically
      const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
    
      // Get reports for the current page
      const startIndex = (currentPage - 1) * reportsPerPage;
      const currentReports = filteredReports.slice(startIndex, startIndex + reportsPerPage);

      const paginatedReports = filteredReports.slice(
        (currentPage - 1) * reportsPerPage,
        currentPage * reportsPerPage
      );

        // Function to transform data per barangay (only for download)
        const transformDataForDownload = async () => {
          try {
            const response = await axios.get("http://192.168.1.127:3003/get-disasters");
            const disasterData = response.data;
        
            const transformed = disasterData.flatMap(disaster =>
              (disaster.barangays || []).map(brgy => {
                let maleCount = 0, femaleCount = 0, is4ps = 0, isPWD = 0, isPreg = 0, isIps = 0, isSolo = 0;
        
                (brgy.affectedFamilies || []).forEach(family => {
                  if (family.sex === "M") maleCount++;
                  if (family.sex === "F") femaleCount++;
        
                  (family.dependents || []).forEach(dependent => {
                    if (dependent.sex === "Male") maleCount++;
                    if (dependent.sex === "Female") femaleCount++;
                  });
        
                  if (family.is4ps) is4ps++;
                  if (family.isPWD) isPWD++;
                  if (family.isPreg) isPreg++;
                  if (family.isIps) isIps++;
                  if (family.isSolo) isSolo++;
                });
        
                const dateObj = new Date(disaster.disasterDateTime);
        
                return {
                  disasterCode: disaster.disasterCode,
                  disasterType: disaster.disasterType,
                  disasterDateObj: dateObj, // for sorting
                  disasterDate: moment(dateObj).format("MMMM D, YYYY"),
                  disasterTime: moment(dateObj).format("h:mm A"),
                  barangay: brgy.name || "Unknown",
                  affectedFamilies: brgy.affectedFamilies?.length ?? 0,
                  affectedPersons: brgy.affectedFamilies?.reduce(
                    (sum, fam) => sum + 1 + (fam.dependents?.length || 0), 0
                  ) ?? 0,
                  sexBreakdown: `M: ${maleCount} | F: ${femaleCount}`,
                  isPreg,
                  is4ps,
                  isPWD,
                  isSolo,
                  isIps
                };
              })
            );
        
            // Sort by latest disaster date
            transformed.sort((a, b) => b.disasterDateObj - a.disasterDateObj);
        
            // Map to Excel-ready format
            return transformed.map(item => ({
              "Disaster Code": item.disasterCode,
              "Disaster Type": item.disasterType,
              "Disaster Date": item.disasterDate,
              "Disaster Time": item.disasterTime,
              "Affected Barangay": item.barangay,
              "No. of Affected Families": item.affectedFamilies,
              "No. of Affected People": item.affectedPersons,
              "Sex Breakdown": item.sexBreakdown,
              "No. of Pregnant Women/Lactating Mothers": item.isPreg,
              "No. of 4P's": item.is4ps,
              "No. of PWDs": item.isPWD,
              "No. of Solo Parents": item.isSolo,
              "No. of IP": item.isIps,
            }));
        
          } catch (error) {
            console.error("Error transforming disaster data:", error);
            return [];
          }
        };
        
        

        const handleDownloadAllReports = async () => {
          const formattedData = await transformDataForDownload();
          if (!formattedData.length) return;
      
          const worksheet = XLSX.utils.json_to_sheet(formattedData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Disaster Reports");
          XLSX.writeFile(workbook, "Disaster_Reports.xlsx");
        };

  return (
    <div className="reports">

    {selectedReport && (
      <div className="bck-btn">
        <button className="back-btn" onClick={() => setSelectedReport(null)}>
        <i className="fa-solid fa-chevron-left"></i>
          Back
        </button>
      </div>
    )}


      <div className="container">

        {!selectedReport ? (
          
        <div className="report-list-container">

          <div className="search-row">
            {/* Disaster Count on the Left */}
            <div className="disaster-count-section">
              <button className="download-btn" onClick={handleDownloadAllReports}>
                <FiDownload style={{ marginRight: "6px" }} />
              </button>

              <div className="disaster-count">
                {filteredReports.length === 0
                  ? ""
                  : `${filteredReports.length} ${filteredReports.length === 1 ? "disaster" : "disasters"} reported`}
              </div>



            </div>




            {/* Search in the Center */}
            <div className="search-wrapper" >
              <Search onSearch={handleSearchChange} onFilter={(filter) => handleFilter({
                type: filter.type,
                year: Number(filter.year),
                month: filter.month
              })} />
            </div>
          </div>


          <div className="report-list">
            {paginatedReports.length > 0 ? (
              /* }//Step 1: Display report cards*/
              paginatedReports.map((report) => (
                <div key={report.id} className="report-card" onClick={() => setSelectedReport(report)} style={{ cursor: "pointer" }}>
                  <div className="report-image" style={{ backgroundImage: `url(${getImage(report.type)})` }}>
                    <span className="report-label" style={{ backgroundColor: getLabelColor(report.type) }}>
                      <span className="icon">{getIcon(report.type)}</span> {report.type}
                    </span>
                  </div>
                  <div className="report-content">
                    <h3>{report.date}</h3>
                    <p className="barangay-name">{report.barangays}</p>
                    <p className="report-type">{report.type}</p>
                    <div className="report-info">
                      <span><FaUsers /> {report.households} Families</span>
                      <span className="download-icon"><FaDownload /></span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-disaster-message">
              {searchQuery ? "No disasters match your search." : "No disaster record available."}
            </p>
            )}

          </div>

          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

        </div>
        ) : (
          // Step 2: Display report details (similar to uploaded image)
          <div className="report-preview">

            <div className="upper">

              <div className="tabs">
                <button className={activeTab === "SPORADIC" ? "tab active" : "tab"} onClick={() => setActiveTab("SPORADIC")}>
                  SPORADIC
                </button>
                <button className={activeTab === "FDR" ? "tab active" : "tab"} onClick={() => setActiveTab("FDR")}>
                  FDR
                </button>
                <button className={activeTab === "Payroll" ? "tab active" : "tab"} onClick={() => setActiveTab("Payroll")}>
                  Payroll
                </button>
              </div>

              <div className="buttons">
                <button className="download-btn" onClick={handleDownloadPDF}>
                  <FaDownload /> Download
                </button>
                <button className="print-btn" onClick={handlePrint}>
                  <i className="fa-solid fa-print"></i> Print
                </button>

              </div>

            </div>



            
            <div className="report-content-box">

              <div className="form-container">
                {activeTab === "SPORADIC" ? (
                  <div ref={sporadicRef}>
                    <SPORADIC report={selectedReport} distribution={getDistributionForReport(selectedReport.id)} />
                  </div>
                ) : activeTab === "FDR" ? (
                  <div ref={fdrRef}>
                    <FDR report={selectedReport} distribution={getDistributionForReport(selectedReport.id)} />
                  </div>
                ) : activeTab === "Payroll" ? (
                  <div ref={payrollRef}>
                    <Payroll report={selectedReport} />
                  </div>
                ) : null}

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;
