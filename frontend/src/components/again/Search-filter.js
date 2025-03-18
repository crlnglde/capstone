import React, { useState } from "react";
import { FaSearch, FaFilter } from "react-icons/fa"; // Import icons
import "../../css/again/Search-filter.css";

const Search = ({ onSearch, onFilter }) => {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString("en-US", { month: "short" }));
  const [filterType, setFilterType] = useState("Yearly");
  const [query, setQuery] = useState("");

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

    onFilter(filterData); // Send filter to parent
    setShowFilter(false);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Type here to search"
        className="search-input"
        value={query}
        onChange={handleSearchChange}
      />
      <button className="search-btn">
        <FaSearch /> SEARCH
      </button>
      <button className="filter-btn" onClick={() => setShowFilter(!showFilter)}>
        <FaFilter /> FILTER
      </button>

      {showFilter && (
        <div className="filter-dropdown">
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>

          <div className="filter-modal">
            {filterType !== "Weekly" && (
              <button className="year-btn">{selectedYear} ▼</button>
            )}

            {filterType === "Yearly" && (
              <div className="years-grid">
                {years.map((year) => (
                  <button
                    key={year}
                    className={`year-option ${year === selectedYear ? "selected" : ""}`}
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
                    className={`year-option ${month === selectedMonth ? "selected" : ""}`}
                    onClick={() => setSelectedMonth(month)}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}

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

export default Search;
