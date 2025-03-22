import React, { useState, useEffect, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import "../../css/again/Filter.css";

const Filter = ({ onFilter, filters, graphType }) => {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedValues, setSelectedValues] = useState({
    year: "",
    month: "",
    barangay: "All",
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
      if (selectedValues[filter.key] !== "All" && selectedValues[filter.key] !== "") {
        filterData[filter.key] = selectedValues[filter.key];
      }
    });
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
        return ["barangay", "year", "disasterType", "disasterCode"];
      default:
        return [];
    }
  };

  const filterOrder = getFilterOrder();

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
                      onChange={(e) => setSelectedValues(prev => ({ ...prev, [filterKey]: e.target.value }))}
                      disabled={
                        (graphType === "bar" && filterKey === "barangay" && (!selectedValues.disasterCode || selectedValues.disasterCode === "All")) ||
                        (graphType === "map" && filterKey === "month" && !selectedValues.year)
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