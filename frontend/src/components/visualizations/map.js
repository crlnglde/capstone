import React, { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from 'react-leaflet';
import DisasterLegend from "../again/Legend";
import axios from "axios";
import 'leaflet/dist/leaflet.css';
import iliganData from '../../data/iligan.json'; 
import "../../css/visualizations/map.css";
import { centroid } from '@turf/turf'; // Corrected import for centroid

const HomeMap = () => {
  const [disasterTypeFilter, setDisasterTypeFilter] = useState("All");
  const [disasterMonthFilter, setDisasterMonthFilter] = useState("All");
  const [disasters, setDisasters] = useState([]);
  const [filteredDisastersByBarangay, setFilteredDisastersByBarangay] = useState({});
  const barangay = "All";
  const year = "All";

  useEffect(() => {
    const fetchDisasters = async () => {
      const localData = localStorage.getItem("disasters");
      if (localData) {
        const parsed = JSON.parse(localData);
        setDisasters(parsed);
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-disasters`);
        const disasterData = response.data;
        setDisasters(disasterData); // Store disasters data in state
      } catch (error) {
        console.error("Error fetching disasters data:", error);
      }
    };
  
    fetchDisasters();
  }, []);  

  const allMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const filteredDisasters = useMemo(() => {
    return disasters.filter(disaster => {
      const disasterDate = new Date(disaster.disasterDateTime.$date);
      const disasterYear = disasterDate.getFullYear().toString();
      const disasterMonth = allMonths[disasterDate.getMonth()];
  
      return (
        (barangay === "All" || disaster.barangays.some(b => b.name === barangay)) &&
        (year === "All" || disasterYear === year) &&
        (disasterTypeFilter === "All" || disaster.disasterType === disasterTypeFilter) &&
        (disasterMonthFilter === "All" || disasterMonth === disasterMonthFilter)
      );  
    });
  }, [disasters, barangay, year, disasterTypeFilter, disasterMonthFilter, allMonths]);    

  const countFilteredDisastersByBarangayAndType = (filteredDisastersList) => {
    return filteredDisastersList.reduce((acc, disaster) => {
      disaster.barangays.forEach(b => {
        const barangay = b.name;
        const disasterType = disaster.disasterType;
  
        if (!acc[barangay]) {
          acc[barangay] = {};
        }
  
        acc[barangay][disasterType] = (acc[barangay][disasterType] || 0) + 1;
      });
  
      return acc;
    }, {});
  };

  useEffect(() => {
    const countByBarangayAndType = countFilteredDisastersByBarangayAndType(filteredDisasters);
    if (JSON.stringify(filteredDisastersByBarangay) !== JSON.stringify(countByBarangayAndType)) {
      setFilteredDisastersByBarangay(countByBarangayAndType);  // Only update state if data has changed
    }
  }, [filteredDisasters]); // Dependency only on filteredDisasters
  
  

  const styleFeature = (feature) => {
    const barangay = feature.properties.adm4_en;
    const count = filteredDisastersByBarangay[barangay] || 0;
    return {
      fillColor: getColor(count), 
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
      ? 'rgba(139,69,19, 0.7)'
      : 'rgba(75, 192, 192, 0.7)';
  };

  const getMarkerSize = (count) => {
    return Math.sqrt(count) * 5; // Size based on disaster count
  };

  const handleDisasterTypeChange = (event) => {
    setDisasterTypeFilter(event.target.value);
  };

  useEffect(() => {
    setFilteredDisastersByBarangay({});
  }, [disasterTypeFilter]);

  return (
    <div className="choropleth-map-container1">
      <div className='map1'>
        <div className="map-wrapper1">
          <h2><i className="fa-solid fa-location-dot"></i> Iligan City, Philippines</h2>
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={[8.230, 124.365]}
            zoom={12}
            scrollWheelZoom={false}
            minZoom={8}
            maxZoom={15}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON data={iliganData} style={styleFeature} />
            {Object.entries(filteredDisastersByBarangay).map(([barangay, disasterTypes]) => {
              const barangayData = iliganData.features.find(
                (feature) => feature.properties.adm4_en === barangay
              );

              if (barangayData) {
                const geometry = barangayData.geometry;
                let coordinates;
                if (geometry.type === "Polygon") {
                  coordinates = centroid(geometry).geometry.coordinates;
                } else if (geometry.type === "MultiPolygon") {
                  coordinates = centroid(geometry).geometry.coordinates;
                }

                if (coordinates) {
                  return (
                    Object.entries(disasterTypes).map(([disasterType, count]) => (
                      <CircleMarker
                        key={`${barangay}-${disasterType}`}
                        center={[coordinates[1], coordinates[0]]}
                        radius={getMarkerSize(count)}
                        color={getColorForBubble(disasterType)}
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
            <DisasterLegend />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default HomeMap;
