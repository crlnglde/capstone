import React, { useEffect, useState, useMemo, useCallback  } from "react";
import { MapContainer, TileLayer, GeoJSON,  CircleMarker, Popup } from 'react-leaflet';
import axios from "axios";
import 'leaflet/dist/leaflet.css';
import iliganData from '../../data/iligan.json'; 
import "../../css/visualizations/Iligan.css";
import Filter from "../again/Filter";
import DisasterLegend from "../again/Legend";

const MapDisaster = () => {
  const [disasterTypeFilter, setDisasterTypeFilter] = useState("All");
  const [disasterMonthFilter, setDisasterMonthFilter] = useState("All");
  const [disasters, setDisasters] = useState([]);
  const [filteredDisastersByBarangay, setFilteredDisastersByBarangay] = useState({});
  const [filteredData, setFilteredData] = useState(disasters);
  const [graphType, setGraphType] = useState("map"); 
  const [currentFilter, setCurrentFilter] = useState({
    barangay: "All",
    year: "All",
    month: "All",
    disasterType: "All",
  });
  
  const [barangay, setBarangay] = useState("All");
  const [year, setYear] = useState("All");

  const filtersForMap = [
    { label: "Year", key: "year", options: Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString()) },
    { label: "Month", key: "month", options: Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("en", { month: "short" })) },
    { label: "Barangay", key: "barangay", options: ["All",  "Abuno", "Acmac-Mariano Badelles Sr.", "Bagong Silang", "Bonbonon", "Bunawan", "Buru-un", "Dalipuga",
      "Del Carmen", "Digkilaan", "Ditucalan", "Dulag", "Hinaplanon", "Hindang", "Kabacsanan", "Kalilangan",
      "Kiwalan", "Lanipao", "Luinab", "Mahayahay", "Mainit", "Mandulog", "Maria Cristina", "Pala-o",
      "Panoroganan", "Poblacion", "Puga-an", "Rogongon", "San Miguel", "San Roque", "Santa Elena",
      "Santa Filomena", "Santiago", "Santo Rosario", "Saray", "Suarez", "Tambacan", "Tibanga", "Tipanoy",
      "Tomas L. Cabili (Tominobo Proper)", "Upper Tominobo", "Tubod", "Ubaldo Laya", "Upper Hinaplanon",
      "Villa Verde"] },
    { label: "Disaster Type", key: "disasterType", options: ["All", "Flood", "Landslide", "Typhoon", "Earthquake", "Fire Incident", "Armed Conflict"] },
  ];

  const handleFilter = useCallback((filterData) => {
    console.log("Received Filter Data:", filterData);
    setCurrentFilter(filterData) ;
    console.log("Original Disasters Data:", disasters); 
    
    if (!filterData) return;

    const filtered = disasters.filter(disaster => {
        const disasterDate = new Date(disaster.disasterDateTime);
        
        if (isNaN(disasterDate)) {
            console.warn("Invalid Date Format:", disaster.disasterDateTime);
            return false;
        }

        const disasterYear = disasterDate.getFullYear().toString();
        const disasterMonth = new Date(disaster.disasterDateTime).toLocaleString('en-US', { month: 'short' });
        console.log(`Checking: Year(${disasterYear}), Month(${disasterMonth}), Type(${disaster.disasterType})`);

        const matchYear = filterData.year === "All" || disasterYear === filterData.year;
        const matchMonth = filterData.month === "All" || disasterMonth === filterData.month;
        const matchType = filterData.disasterType === "All" || disaster.disasterType === filterData.disasterType;
        const matchBarangay = filterData.barangay === "All" || (disaster.barangays && disaster.barangays.some(b => b.name === filterData.barangay));

        console.log(`Match Conditions: Year: ${matchYear}, Month: ${matchMonth}, Type: ${matchType}, Barangay: ${matchBarangay}`);

        return matchYear && matchMonth && matchType && matchBarangay;
    });

    console.log("Filtered Data:", filtered);
    setFilteredData(filtered);
}, [disasters]);


  console.log("Original Disasters Data:", disasters);


  (console.log("filtered data", filteredData))
  
  useEffect(() => {
    if (disasters.length > 0) {
      handleFilter({ barangay, year, month: disasterMonthFilter, disasterType: disasterTypeFilter });
    }
  }, [disasters, barangay, year, disasterMonthFilter, disasterTypeFilter]);  
  
  
  
  useEffect(() => {
    const fetchDisasters = async () => {

      const localData = localStorage.getItem("disasters");
      if (localData) {
        const parsed = JSON.parse(localData);
        setDisasters(parsed);
        setFilteredData(parsed);
      }

      try {
        const response = await axios.get("http://localhost:3003/get-disasters");
        const disasterData = response.data;
        setDisasters(disasterData); 
        setFilteredData(disasterData); // Set filteredData with fetched data
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


    const countFilteredDisastersByBarangayAndType = (filteredDisastersList, currentBarangay) => {
      return filteredDisastersList.reduce((acc, disaster) => {
        if (!disaster.barangays || disaster.barangays.length === 0) return acc;
    
        // If a specific barangay is selected, filter out disasters that don't include it
        if (currentBarangay !== "All" && !disaster.barangays.some(b => b.name === currentBarangay)) {
          return acc;
        }
    
        disaster.barangays.forEach(({ name }) => {
          if (!name) return;
    
          const { disasterType } = disaster;
    
          // Only count the selected barangay (if not "All")
          if (currentBarangay === "All" || name === currentBarangay) {
            acc[name] = acc[name] || {};
            acc[name][disasterType] = (acc[name][disasterType] || 0) + 1;
          }
        });
    
        return acc;
      }, {});
    };
    
         
   
    useEffect(() => {
      if (filteredData.length > 0) {
        const newFilteredData = countFilteredDisastersByBarangayAndType(filteredData, currentFilter.barangay);
    setFilteredDisastersByBarangay(newFilteredData);
    console.log("Updated filteredDisastersByBarangay:", newFilteredData);
        setFilteredDisastersByBarangay(newFilteredData);
        console.log("Updated filteredDisastersByBarangay:", newFilteredData);
      } else {
        setFilteredDisastersByBarangay({}); // Ensure state updates to an empty object
        console.log("No disasters found, clearing map data.");
      }
    }, [filteredData, disasterTypeFilter, disasterMonthFilter, barangay, year]);    
    

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
      fillOpacity: 0.9,
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
      : 'rgba(0, 0, 0, 0.7)';
  };

  const getMarkerSize = (count) => {
    return Math.sqrt(count) * 5; // Size based on disaster count (you can adjust the scale)
  };

  const handleDisasterTypeChange = (event) => {
    setDisasterTypeFilter(event.target.value);
  };
  

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

        </div>

        <div className="map-wrapper">
          <MapContainer
            style={{ height: '100%', width: '100%'}}
            center={[8.228, 124.370]} // Approximate center of Iligan City
            zoom={11}  // Adjust the zoom level for wider view
            scrollWheelZoom={false}
            minZoom={8} // Set minimum zoom level
            maxZoom={14}
          >
            { /* original ni
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
              attribution="&copy; <a href='https://carto.com/'>CARTO</a>"
            />
            */}

          
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
              attribution="&copy; <a href='https://carto.com/'>CARTO</a>"
            />





            <GeoJSON data={iliganData} style={styleFeature} />

              {/* Add bubble markers based on the disaster count per barangay */}
              {Object.entries(filteredDisastersByBarangay).map(([barangay, disasterTypes]) => {
                const barangayData = iliganData.features.find(
                  (feature) => feature.properties.adm4_en === barangay
                );

                if (barangayData) {
                  const centroid = calculateCentroid(barangayData.geometry);
                  const offsetFactor = 0.0005; // Small adjustment to separate overlapping markers

                  return Object.entries(disasterTypes).map(([disasterType, count], index, array) => {
                    // Compute a slight offset for each disaster type
                    const angle = (index / array.length) * (2 * Math.PI); // Spread markers in a circular pattern
                    const offsetLat = centroid[0] + offsetFactor * Math.sin(angle);
                    const offsetLng = centroid[1] + offsetFactor * Math.cos(angle);

                    return (
                      <CircleMarker
                        key={`${barangay}-${disasterType}`}
                        center={[offsetLat, offsetLng]}
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
                    );
                  });
                }
                return null;
              })}

            <div className="filters-right"> 
              <Filter disasters={disasters} onFilter={handleFilter} filters={filtersForMap} graphType={graphType}/>
            </div>

            <DisasterLegend />

          </MapContainer>
        </div>


      </div>
      

      <div className="map-text-overlay">
        <h2>Disaster Insights</h2>
        <p>
          {filteredData.length > 0 ?
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

export default MapDisaster;
