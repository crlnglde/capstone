  import React from "react";
  import { useLocation } from "react-router-dom";
  import "../css/Navbar.css";

  const Navbar = ({ isSidebarMinimized }) => {

    const location = useLocation();

    // Map paths to page names
    const pageNames = {
      "/home": "Home",
      "/dashboard": "Dashboard",
      "/distribution":"Distribution",
      "/distribution/rds":"Distribution > RDS",
      "/editrds":"Distribution > RDS",
      "/reports": "Reports",
      "/residents": "List of Residents",
      "/volunteers": "Volunteers",
      "/rds": "Relief Distribution Sheet",
      "/dafac": "Disaster Assistance Family Access Card",
      "/sporadic": "SPORADIC REPORT",
      "/fdr": "Final Disaster Report",
      "/dashboard/add-disaster":"Add Disaster",
    };

    const currentPageName = pageNames[location.pathname] || "Page Name";

    return (
      <div className={`navbar ${isSidebarMinimized ? "adjusted-navbar" : ""}`}>

        <div className="page-name"> 
          <h1>{currentPageName}</h1>
        </div>
          
        {/*<div className="search"> 
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Search..." />
        </div>*/}

        <div className="notifications">
          <i className="fa-regular fa-bell"></i>
        </div>

      </div>
    );
  };

  export default Navbar;
