import React, { useState, useEffect, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import "../../css/again/Filter.css";

const Filter = ({ disasters, setAvailableBarangays, onFilter, filters, graphType }) => {
  const [showFilter, setShowFilter] = useState(false);

  const userRole = localStorage.getItem("role");
  const userBarangay = localStorage.getItem("barangay");


  const [selectedValues, setSelectedValues] = useState({
    year: "",
    month: "",
    barangay: userRole === "daycare worker" && userBarangay ? userBarangay : "All",
    disasterType: "All",
    disasterDate: "",
    disasterCode: "All",
  });
  

  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target) && 
          !event.target.closest(".filter-btn")) {
        setShowFilter(false);
      }
    };

    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter]);

  const applyFilter = () => {
    let filterData = {};
    filters.forEach(filter => {
      if (selectedValues[filter.key] !== "") {
        filterData[filter.key] = selectedValues[filter.key];
      }else{
        filterData[filter.key]="All";
      }
    });
    console.log("Applied Filters:", filterData);
    onFilter(filterData);
    setShowFilter(false);
  };

  const clearFilter = () => {
    setSelectedValues({
      year: "",
      month: "",
      barangay: "All",
      disasterType: "All",
      disasterDate: "",
      disasterCode: "All",
    });
    onFilter({});
  };

  const getFilterOrder = () => {
    switch (graphType) {
      case "bar":
        return ["disasterCode", "barangay"];
      case "map":
        return ["year", "month", "disasterType", "barangay"];
      case "donut":
        return ["year", "disasterType","barangay", "disasterCode"];
      case "pie":
        return ["year", "disasterType","barangay", "disasterCode"];
      default:
        return [];
    }
  };

  const filterOrder = getFilterOrder();

  const handleDisasterChange = (e) => {
    const value = e.target.value;
    setSelectedValues(prev => ({ ...prev, disasterCode: value }));
  
    const selectedDisaster = disasters.find(d => d.disasterCode === value);
    const filteredBarangays = selectedDisaster ? selectedDisaster.barangays.map(b => b.name) : [];
  
    if (typeof setAvailableBarangays === "function") {
      setAvailableBarangays(filteredBarangays);
    } else {
      console.error("setAvailableBarangays is not a function. Ensure it is passed as a prop.");
    }

    if (filteredBarangays.length > 0) {
      setSelectedValues(prev => ({ ...prev, barangay: filteredBarangays[0] }));
    }
  };

  const handleBarangayChange = (e) => {
    const value = e.target.value;
    setSelectedValues(prev => ({ ...prev, barangay: value }));
  };

  const getAvailableDisasterCodes = () => {
    console.log("Filtering disasters...");
    return disasters
      .filter((d) => {
        const yearMatch = selectedValues.year === "All" || new Date(d.disasterDateTime).getFullYear() == selectedValues.year;
        const typeMatch = selectedValues.disasterType === "All" || d.disasterType === selectedValues.disasterType;
        const barangayMatch =
          selectedValues.barangay === "All" ||
          d.barangays.some(b => b.name === selectedValues.barangay);
        
        console.log(`Checking disaster: ${d.disasterCode}`, { yearMatch, typeMatch, barangayMatch });
  
        return yearMatch && typeMatch && barangayMatch;
      })
      .map(d => d.disasterCode); // Returning disasterCode instead of disasterDateTime
  };
   

  return (
    <div className="filter-container">
      <button className="filter-btn" onClick={() => setShowFilter(prev => !prev)}>
        <FaFilter /> FILTER
      </button>

      {showFilter && (
        <div className="filter-dropdown" ref={filterRef}>
          <div className="filter-modal">
            <button className="clear-btn" onClick={clearFilter}>Clear</button>

            {filterOrder.map((filterKey) => {
              const filter = filters.find(f => f.key === filterKey);
              if (!filter) return null;

              if (filterKey === "month" && !selectedValues.year) {
                return null;
              }

              if (filterKey === "disasterCode" && (graphType === "pie" || graphType === "donut" )) {
                return (
                  <div className="filter-section" key={filterKey}>
                    <label>Disaster Code</label>
                    <select
                      className="filter-select"
                      value={selectedValues.disasterCode}
                      onChange={(e) =>
                        setSelectedValues((prev) => ({ ...prev, disasterCode: e.target.value }))
                      }
                      disabled={getAvailableDisasterCodes().length === 0} // Disable if no disaster codes available
                    >
                      <option value="">Select Disaster Code</option>
                      {getAvailableDisasterCodes().map((code, index) => (
                        <option key={index} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }              

              return (
                <div className="filter-section" key={filterKey}>
                  <label>{filterKey === "disasterType" ? "Disaster Type" : filterKey === "disasterCode" ? "Disaster Code" : filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}</label>
                  {filterKey === "year" || filterKey === "month" ? (
                    selectedValues[filterKey] ? (
                      <button
                        className="year-option full-width selected"
                        onClick={() => setSelectedValues(prev => ({ ...prev, [filterKey]: "" }))}
                      >
                        {selectedValues[filterKey]}
                      </button>
                    ) : (
                      <div className={filterKey === "year" ? "years-grid" : "months-grid"}>
                        <button
                          className={`year-option full-width ${selectedValues[filterKey] === "All" ? "selected" : ""}`}
                          style={{ gridColumn: "span 4" }}
                          onClick={() => setSelectedValues(prev => ({ ...prev, [filterKey]: "All" }))}
                        >
                          All
                        </button>
                        {filter.options.map((option, index) => (
                          <button
                            key={index}
                            className={`${filterKey}-option ${selectedValues[filterKey] === option ? "selected" : ""}`}
                            onClick={() => setSelectedValues(prev => ({ ...prev, [filterKey]: option }))}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )
                  ) : (
                    <select
                      className="filter-select"
                      value={selectedValues[filterKey]}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (filterKey === "barangay") {
                          handleBarangayChange(e);
                        } else if (filterKey === "disasterCode") {
                          handleDisasterChange(e);
                        } else {
                          setSelectedValues(prev => ({ ...prev, [filterKey]: value }));
                        }
                      }}                      
                      disabled={
                        (graphType === "bar" && filterKey === "barangay" && (!selectedValues.disasterCode || selectedValues.disasterCode === "All")) ||
                        (graphType === "map" && filterKey === "month" && !selectedValues.year) ||
                        (filterKey === "barangay" && userRole === "daycare worker") 
                      }
                    >
                      <option value="">Select {filterKey === "disasterType" ? "Disaster Type" : filterKey === "barangay" ? "Barangay" : filterKey === "disasterCode" ? "Disaster Code" : filterKey}</option>
                      {filter.options.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}

            <div className="filter-actions">
              <button className="cancel-btn" onClick={() => setShowFilter(false)}>Cancel</button>
              <button className="done-btn" onClick={applyFilter}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;