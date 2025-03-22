import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaFilter } from "react-icons/fa"; 
import "../../css/again/Search-filter.css";

const Search = ({ onSearch, onFilter }) => {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedYear, setSelectedYear] = useState(""); // No default year
  const [selectedMonth, setSelectedMonth] = useState(""); // No default month

  const [filterType, setFilterType] = useState("Yearly");
  const [query, setQuery] = useState("");
  const filterRef = useRef(null); // Reference for the filter modal

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i).reverse();
  const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("en-US", { month: "short" }));

  const handleSearchChange = (event) => {
    const value = event.target.value.toLowerCase();
    setQuery(value);
    onSearch(value);
  };

  const applyFilter = () => {
    let filterData = { type: filterType };

    if (filterType === "Yearly") {
      filterData.year = selectedYear;
    } else if (filterType === "Monthly") {
      filterData.year = selectedYear;
      filterData.month = selectedMonth;
    }

    onFilter(filterData);
    setShowFilter(false);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
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

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Type here to search"
        className="search-input"
        value={query}
        onChange={handleSearchChange}
      />
     <button
        className="search-btn"
        onClick={() => {
          if (selectedYear || selectedMonth) {
            // If filters are applied, clear them and show all disasters
            setFilterType("Yearly");
            setSelectedYear(""); // Reset year
            setSelectedMonth(""); // Reset month
            onFilter({ type: "All" }); // Show all disasters
          }
        }}
        disabled={!(selectedYear || selectedMonth)}
      >
        <FaSearch />
        {selectedYear || selectedMonth ? " CLEAR" : " SEARCH"}
      </button>



      <button
        className="search-filter-btn"
        onClick={() => {
          setFilterType("Yearly");
          setShowFilter(true);
        }}
      >
        <FaFilter /> FILTER
      </button>

      {showFilter && (
        <div className="search-filter-dropdown" ref={filterRef}>
          <select
            className="search-filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>

          <div className="search-filter-modal">
            {filterType !== "Yearly" && (
              <button className="year-btn" onClick={() => setFilterType("Yearly")}>
                {selectedYear} ▼
              </button>
            )}

            {filterType === "Yearly" && (
              <div className="years-grid">
                {years.map((year) => (
                  <button
                    key={year}
                    className={`sf-year-option ${year === selectedYear ? "selected" : ""}`}
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}

            {filterType === "Monthly" && (
              <div className="years-grid">
                {months.map((month) => (
                  <button
                    key={month}
                    className={`sf-year-option ${month === selectedMonth ? "selected" : ""}`}
                    onClick={() => setSelectedMonth(month)}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}

            <div className="search-filter-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowFilter(false); // Only close the filter modal
                }}  
              >
                Cancel
              </button>
              <button className="done-btn" onClick={applyFilter}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
