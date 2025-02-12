import React, { useEffect, useState, useMemo, useCallback  } from "react";
import { MapContainer, TileLayer, GeoJSON,  CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import iliganData from '../../data/iligan.json'; 
import "../../css/visualizations/map.css";

import { db } from "../../firebase";
import { collection, getDocs } from 'firebase/firestore';

const ChoroplethGraph = () => {
  const [disasterTypeFilter, setDisasterTypeFilter] = useState("All");
  const [disasterMonthFilter, setDisasterMonthFilter] = useState("All");
  const [disasters, setDisasters] = useState([]);
  const [filteredDisastersByBarangay, setFilteredDisastersByBarangay] = useState({});
  const barangay = "All";
  const year= "All";

  useEffect(() => {
      const fetchDisasters = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "disasters"));
          const disastersData = querySnapshot.docs.map(doc => doc.data());
          setDisasters(disastersData);  // Store data in state
        } catch (error) {
          console.error("Error fetching disasters data:", error);
        }
      };
 
      fetchDisasters();  // Call the function to fetch data
    }, []);


    const allMonths = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];


    const filteredDisasters = useMemo(() => {
      return disasters.filter(disaster => {
        const disasterDate = new Date(disaster.disasterDate);
        const disasterMonth = allMonths[disasterDate.getMonth()]; // Get month from disaster date
        // Filter based on the selected barangay, year, disaster type, and month
        return (
          (barangay === "All" || disaster.barangays === barangay) &&
          (year === "All" || disaster.disasterDate.split("-")[0] === year) &&
          (disasterTypeFilter === "All" || disaster.disasterType === disasterTypeFilter) &&
          (disasterMonthFilter === "All" || disasterMonth === disasterMonthFilter)
        );  
      });
    }, [disasters, barangay, year, disasterTypeFilter, disasterMonthFilter, allMonths]);


    const countFilteredDisastersByBarangayAndType = (filteredDisastersList) => {
      return filteredDisastersList.reduce((acc, disaster) => {
        const barangay = disaster.barangays;
        const disasterType = disaster.disasterType;
       
        // Initialize the barangay object if it doesn't exist
        if (!acc[barangay]) {
          acc[barangay] = {};
        }
   
        // Increment the count for the specific disaster type in the barangay
        acc[barangay][disasterType] = (acc[barangay][disasterType] || 0) + 1;
        return acc;
      }, {});
    };
   
    useEffect(() => {
      const countByBarangayAndType = countFilteredDisastersByBarangayAndType(filteredDisasters);
      setFilteredDisastersByBarangay(countByBarangayAndType); // Set the state with the counts
    }, [filteredDisasters]);
   
   


  // Define a function to style each feature
  const styleFeature = (feature) => {
    const barangay = feature.properties.adm4_en;
    const count = filteredDisastersByBarangay[barangay] || 0;
    return {
      fillColor: getColor(count), // Use the disaster count for coloring
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  };
 
  const getColor = (density) => {
    return density > 1000
      ? '#800026'
      : density > 500
      ? '#BD0026'
      : density > 200
      ? '#E31A1C'
      : density > 100
      ? '#FC4E2A'
      : density > 50
      ? '#FD8D3C'
      : density > 20
      ? '#FEB24C'
      : density > 10
      ? '#FED976'
      : '#FFEDA0';
  };


  // Define a function to get color based on density (or other property)
  const getColorForBubble = (disasterType) => {
    return disasterType === "Fire Incident"
      ? 'rgba(255, 99, 132, 0.7)'
      : disasterType === "Flood"
      ? 'rgba(54, 162, 235, 0.7)'
      : disasterType === "Earthquake"
      ? 'rgba(255, 159, 64, 0.7)'
      : disasterType === "Typhoon"
      ? 'rgba(153, 102, 255, 0.7)'
      : disasterType === "Landslide"
      ? 'rgba(139,69,19)'
      : 'rgba(75, 192, 192, 0.7)';  // Default color for any other disaster type
  };


  const getMarkerSize = (count) => {
    return Math.sqrt(count) * 5; // Size based on disaster count (you can adjust the scale)
  };


  const handleDisasterTypeChange = (event) => {
    setDisasterTypeFilter(event.target.value);
  };


  useEffect(() => {
    // Reset filtered disasters and barangay counts when disaster type changes
    setFilteredDisastersByBarangay({});
  }, [disasterTypeFilter]);

  return (
    <div className="choropleth-map-container1">
      

      <div className='map1'>

        <div className="map-wrapper1">
          <h2><i class="fa-solid fa-location-dot"></i> Iligan City, Philippines</h2>
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={[8.230, 124.365]} // Approximate center of Iligan City
            zoom={12}  // Adjust the zoom level for wider view
            scrollWheelZoom={false}
            minZoom={8} // Set minimum zoom level
            maxZoom={15} 
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON data={iliganData} style={styleFeature} />

              {/* Add bubble markers based on the disaster count per barangay */}
              {Object.entries(filteredDisastersByBarangay).map(([barangay, disasterTypes]) => {
              const barangayData = iliganData.features.find(
                (feature) => feature.properties.adm4_en === barangay
              );
            
              if (barangayData) {
                // Extract the coordinates for the barangay
                let coordinates;
                if (barangayData.geometry.type === "Polygon") {
                  coordinates = barangayData.geometry.coordinates[0][0]; // First coordinate of the first ring
                } else if (barangayData.geometry.type === "MultiPolygon") {
                  coordinates = barangayData.geometry.coordinates[0][0][0]; // First coordinate of the first polygon's first ring
                }


                if (coordinates) {
                  return (
                    // Loop through each disaster type for the barangay
                    Object.entries(disasterTypes).map(([disasterType, count]) => (
                      <CircleMarker
                        key={`${barangay}-${disasterType}`}
                        center={[coordinates[1], coordinates[0]]} // Leaflet expects [lat, lng]
                        radius={getMarkerSize(count)} // Size based on disaster count
                        color={getColorForBubble(disasterType)} // Color based on disaster type
                        fillColor={getColorForBubble(disasterType)}
                        fillOpacity={0.5}
                      >
                        <Popup>
                          <strong>{barangay}</strong><br />
                          Disaster Type: {disasterType}<br />
                          Disaster Count: {count}
                        </Popup>
                      </CircleMarker>
                    ))
                  );
                }
              }
              return null;
              })}

          </MapContainer>
        </div>
      </div>
      

    </div>
  );
};

export default ChoroplethGraph;
