import React, { useEffect, useState, useMemo, useCallback  } from "react";
import { MapContainer, TileLayer, GeoJSON,  CircleMarker, Popup } from 'react-leaflet';
import axios from "axios";
import 'leaflet/dist/leaflet.css';
import iliganData from '../../data/iligan.json'; 
import "../../css/visualizations/Iligan.css";
import Filter from "../again/Filter";

const ChoroplethGraph = () => {
  const [disasterTypeFilter, setDisasterTypeFilter] = useState("All");
  const [disasterMonthFilter, setDisasterMonthFilter] = useState("All");
  const [disasters, setDisasters] = useState([]);
  const [filteredDisastersByBarangay, setFilteredDisastersByBarangay] = useState({});

   const [graphType, setGraphType] = useState("map"); 

  const [barangay, setBarangay] = useState("All");
  const [year, setYear] = useState("All");

  const filtersForMap = [
    { label: "Year", key: "year", options: Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString()) },
    { label: "Month", key: "month", options: Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("en", { month: "short" })) },
    { label: "Barangay", key: "barangay", options: ["All", "Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5"] },
    { label: "Disaster Type", key: "disasterType", options: ["All", "Flood", "Landslide", "Typhoon", "Earthquake", "Fire"] },
  ];
  
  const handleFilter = (filterData) => {
    setBarangay(filterData.barangay || "All");
    setYear(filterData.year || "All");
    
  };
  
  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const response = await axios.get("http://localhost:3003/get-disasters");
        const disasterData = response.data;
        setDisasters(disasterData); // Store disasters data in state
  
        // Set the total number of disasters
        setDisasters(disasterData);
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
        const disasterDate = new Date(disaster.disasterDateTime);
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
      if (JSON.stringify(countByBarangayAndType) !== JSON.stringify(filteredDisastersByBarangay)) {
        setFilteredDisastersByBarangay(countByBarangayAndType);
      }
    }, [filteredDisasters, filteredDisastersByBarangay]);
    

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
      ? 'rgba(255, 160, 173, 0.7)'
      : disasterType === "Landslide"
      ? 'rgba(75, 192, 192, 0.7)'
      : 'rgba(0, 0, 0, 0.7)';
  };

  const getMarkerSize = (count) => {
    return Math.sqrt(count) * 5; // Size based on disaster count (you can adjust the scale)
  };

  const handleDisasterTypeChange = (event) => {
    setDisasterTypeFilter(event.target.value);
  };

  useEffect(() => {
    if (Object.keys(filteredDisastersByBarangay).length !== 0) {
      setFilteredDisastersByBarangay({});
    }
  }, [disasterTypeFilter]);
  

  const calculateCentroid = (geometry) => {
    let coordinates = [];
    if (geometry.type === "Polygon") {
      coordinates = geometry.coordinates[0];
    } else if (geometry.type === "MultiPolygon") {
      coordinates = geometry.coordinates[0][0];
    }


    let totalLat = 0,
      totalLng = 0,
      count = coordinates.length;


    coordinates.forEach(([lng, lat]) => {
      totalLat += lat;
      totalLng += lng;
    });


    return [totalLat / count, totalLng / count]; // [lat, lng]
  };


  return (
    <div className="choropleth-map-container">
      

      <div className='map'>

        <div className="map-filter">

            <h2>Iligan City</h2>

          <div className="filters-right">
          
          <Filter onFilter={handleFilter} filters={filtersForMap} graphType={graphType}/>

            <div className="map-filter-container">
              {/* Dropdown for Disaster Date */}
              <select id="disasterType" name="disasterType" onChange={(e) => setDisasterTypeFilter(e.target.value)} value={disasterTypeFilter}>
                  <option value="All">All</option>
                  <option value="Fire Incident">Fire Incident</option>
                  <option value="Flood">Flood</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Typhoon">Typhoon</option>
                </select>

            </div>

            <div className="map-filter-container">
                <label htmlFor="disasterMonth">Select Disaster Month: </label>
                <select id="disasterMonth" name="disasterMonth" onChange={(e) => setDisasterMonthFilter(e.target.value)}  value={disasterMonthFilter}>
                  <option value="All">All</option>
                  {allMonths.map((date, index) => (
                    <option key={index} value={date}>{date}</option>
                  ))}
                </select>
            </div>
          </div>

        </div>

        <div className="map-wrapper">
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={[8.228, 124.370]} // Approximate center of Iligan City
            zoom={10.5}  // Adjust the zoom level for wider view
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
                const centroid = calculateCentroid(barangayData.geometry);


                return Object.entries(disasterTypes).map(([disasterType, count]) => (
                  <CircleMarker
                    key={`${barangay}-${disasterType}`}
                    center={centroid}
                    radius={getMarkerSize(count)}
                    color={getColorForBubble(disasterType)}
                    fillColor={getColorForBubble(disasterType)}
                    fillOpacity={0.5}
                  >
                    <Popup>
                      <strong>{barangay}</strong>
                      <br />
                      Disaster Type: {disasterType}
                      <br />
                      Disaster Count: {count}
                    </Popup>
                  </CircleMarker>
                ));
              }
              return null;
              })}

          </MapContainer>
        </div>
      </div>
      

      <div className="map-text-overlay">
        <h2>Disaster Insights</h2>
        <p>
          {filteredDisasters.length > 0 ?
            (disasterTypeFilter === "All" ?
              <span>
                There is a noticeable concentration of <strong style={{ color:"white"}}>disasters</strong> in specific barangays.
                You may want to focus on these areas for disaster preparedness and response strategies. Stay alert and be prepared for the unexpected!
              </span> :
              <span>
              <strong style={{ color: getColorForBubble(disasterTypeFilter) }}>
                {disasterTypeFilter}
              </strong> shows a noticeable concentration in the following barangays:
              <strong>
                {Object.entries(filteredDisastersByBarangay)
                  .map(([barangay, disasterTypes]) => {
                    if (disasterTypes[disasterTypeFilter] > 0) {
                      return barangay;
                    }
                    return null;
                  })
                  .filter(Boolean)
                  .join(", ")
                }
              </strong>. You may want to focus on these areas for disaster preparedness and response strategies. Stay alert and be prepared for the unexpected!
            </span>            
            ) :
            "No data available for the selected filters. Please adjust the criteria for more insights."
          }
        </p>

      </div>

    </div>
  );
};

export default ChoroplethGraph;
