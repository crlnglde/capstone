import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import "../css/Sidebar.css";
import Maxlogo from "../pic/logo-max.png";
import Minlogo from "../pic/logo-min.png";
import { SiHomeassistant } from "react-icons/si";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Loading from "./again/Loading";

const Sidebar = ({ isMinimized, setIsMinimized, setLoading }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const [isMinimizedState, setIsMinimizedState] = useState(isMinimized);
  const [username, setUsername] = useState(localStorage.getItem("username") || "Us3rn4me");
  const [barangay, setBarangay] = useState(localStorage.getItem("barangay") || "Barangay");

  const [role, setRole] = useState(localStorage.getItem("role") || "Role");

  useEffect(() => {
    localStorage.setItem("sidebarState", JSON.stringify(isMinimizedState));
    setIsMinimized(isMinimizedState);

    setUsername(localStorage.getItem("username") || "Us3rn4me");
    setRole(localStorage.getItem("role") || "Role");
  }, [isMinimizedState, setIsMinimized]);

  const toggleSidebar = () => {
    setIsMinimizedState(!isMinimizedState);
  };

  const handleLogout = () => {
    if (setLoading) {
      setLoading(true);
    }
  
    setTimeout(() => {
      const userRole = localStorage.getItem("role"); // get current role first
  
      localStorage.removeItem("token"); 
      localStorage.removeItem("role"); 
      localStorage.removeItem("username");
      localStorage.removeItem("residents");
  
      if (userRole === "daycare worker") {
        localStorage.removeItem("barangay"); // only if the role is daycare
      }
  
      window.location.href = "/";
    }, 1000);
  };
  

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  const handleHomeClick = (e) => {
    // If the current path is '/home', force navigation (programmatically)
    if (currentPath === "/home") {
      e.preventDefault();
      navigate(0); // This will force a page reload
    }
  };

  return (
    <div className={`sidebar ${isMinimized ? "minimized" : "maximized"}`}>
      <div className="logo">
        {isMinimizedState ? (
          <img src={Minlogo} alt="Logo Minimized" />
        ) : (
          <div className="logo-container">
            <img src={Minlogo} alt="Logo Maximized" className="logo-image" />
            <h3>
              Bayan<span>Aid</span>
            </h3>
          </div>
        )}

        <div className="in-out">
          <button onClick={toggleSidebar} className="toggle-btn">
            {isMinimizedState ? (
              <i className="fa-solid fa-caret-right"></i>
            ) : (
              <i className="fa-solid fa-caret-left"></i>
            )}
          </button>
        </div>
      </div>

      <ul className="menu">
        <li className="mainmenu">{isMinimizedState ? "Menu" : "Main Menu"}</li>

        <li>
        <NavLink 
            to="/home" 
            className={linkClass} 
            onClick={handleHomeClick} // Trigger the custom handler for /home
          >
            <i className="fa-solid fa-house-user"></i>
            {!isMinimizedState && <span>Home</span>}
          </NavLink>
        </li>

        {(role === "CSWD" || role === "daycare worker") && (
          <li>
            <NavLink to="/disaster" className={linkClass}>
              <i className="fa-solid fa-square-poll-vertical"></i>
              {!isMinimizedState && <span>Disaster</span>}
            </NavLink>
          </li>
        )}

        {(role === "CSWD" || role === "Enumerator") && (
          <li>
            <NavLink to="/distribution" className={linkClass}>
              <i>
                <SiHomeassistant />
              </i>
              {!isMinimizedState && <span>Distribution</span>}
            </NavLink>
          </li>
        )}

        {role === "CSWD" && (
          <li>
            <NavLink to="/reports" className={linkClass}>
              <i className="fa-solid fa-folder-open"></i>
              {!isMinimizedState && <span>Reports</span>}
            </NavLink>
          </li>
        )}

        {(role === "CSWD" || role === "daycare worker") && (
          <li>
            <NavLink to="/residents" className={linkClass}>
              <i className="fa-solid fa-people-roof"></i>
              {!isMinimizedState && <span>Residents</span>}
            </NavLink>
          </li>
        )}

        {/* <li>
          <NavLink to="/volunteers" className={linkClass}>
            <i className="fa-solid fa-handshake-angle"></i>
            {!isMinimizedState && <span>Volunteers</span>}
          </NavLink>
        </li> */}
      </ul>

      <div className={`user-section ${isMinimizedState ? "minimized" : ""}`}>
        <div className="prof-box">
          <div className="circle-prof">
            <i className="fa-solid fa-user"></i>
          </div>
        </div>

        {!isMinimizedState && (
          <div className="user-box">
            <h1>{barangay ? barangay.toUpperCase() : "Barangay"}</h1>
            <h3 style={{ textTransform: "capitalize" }}>{role || "Role"}</h3>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}

        {isMinimizedState && (
          <div className="logout-icon" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
