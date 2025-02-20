import React,  { useState, useEffect  } from "react";
import { useLocation } from "react-router-dom";

import "../css/Sidebar.css";
import Maxlogo from '../pic/logo-max.png'
import Minlogo from '../pic/logo-min.png'
import '@fortawesome/fontawesome-free/css/all.min.css';


const Sidebar = ({isMinimized, setIsMinimized}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const [isMinimizedState, setIsMinimizedState] = useState(isMinimized);

  useEffect(() => {
    // Store sidebar state in localStorage
    localStorage.setItem("sidebarState", JSON.stringify(isMinimizedState));
    setIsMinimized(isMinimizedState); // Synchronize with the parent
  }, [isMinimizedState, setIsMinimized]);
 
  // Toggle sidebar state
  const toggleSidebar = () => {
    setIsMinimizedState(!isMinimizedState);
  };

  const isActive = (menuPath) => {
    return currentPath.startsWith(menuPath);
  };

  return (
    <div className={`sidebar ${isMinimized ? "minimized" : "maximized"}`}>
      
      <div className="logo">

        {isMinimizedState ? (
            <img src={Minlogo} alt="Logo Minimized" />
          ) : (

            <div className="logo-container">
              <img src={Minlogo} alt="Logo Maximized" className="logo-image" />
              <h3>Bayan<span>Aid</span></h3>
            </div>
            
          )}
        

        <div className="in-out">
          <button onClick={toggleSidebar} className="toggle-btn">
            {isMinimizedState  ? (
              <i className="fa-solid fa-caret-right"></i>
            ) : (
              <i className="fa-solid fa-caret-left"></i>
            )}
          </button>
        </div>

      </div>
       
       
        <ul className="menu">

          <li className="mainmenu"> {isMinimizedState ? "Menu" : "Main Menu"}</li>

          <li >
            <a href="/home" className={isActive("/home") ? "active" : ""}>
                <i className="fa-solid fa-house-user"></i>
                {!isMinimizedState && <span>Home</span>}
              </a>
          </li>

          <li>
            <a
              href="/dashboard"
              className={isActive("/dashboard") ? "active" : ""}
            >
            <i className="fa-solid fa-square-poll-vertical"></i>
            {!isMinimizedState && <span>Disaster</span>}
            </a>
          </li>
          <li>
            <a
              href="/distribution"
              className={isActive("/distribution") ? "active" : ""}
            >
            <i className="fa-solid fa-square-poll-vertical"></i>
            {!isMinimizedState && <span>Distribution</span>}
            </a>
          </li>

          <li>
            <a
              href="/reports"
              className={isActive("/reports") ? "active" : ""}
            >
            <i className="fa-solid fa-folder-open"></i>
            {!isMinimizedState && <span>Reports</span>}
            </a>
          </li>

          <li>
            <a
              href="/rds"
              className={isActive("/rds") ? "active" : ""}
            >
            <i className="fa-solid fa-folder-open"></i>
            {!isMinimizedState && <span>RDS</span>}
            </a>
          </li>

          <li>
            <a
              href="/dafac"
              className={isActive("/dafac") ? "active" : ""}
            >
            <i className="fa-solid fa-folder-open"></i>
            {!isMinimizedState && <span>DAFAC</span>}
            </a>
          </li>

          <li>
            <a
              href="/sporadic"
              className={isActive("/sporadic") ? "active" : ""}
            >
            <i className="fa-solid fa-folder-open"></i>
            {!isMinimizedState && <span>SPORADIC</span>}
            </a>
          </li>

          <li>
            <a
              href="/fdr"
              className={isActive("/sporadic") ? "active" : ""}
            >
            <i className="fa-solid fa-folder-open"></i>
            {!isMinimizedState && <span>FDR</span>}
            </a>
          </li>

          <li >
            <a
              href="/residents"
              className={isActive("/residents") ? "active" : ""}
            >
            <i className="fa-solid fa-people-roof"></i>
            {!isMinimizedState && <span>Residents</span>}
            </a>
          </li>

          {/*<li>
            <a
              href="/volunteers"
              className={isActive("/volunteers") ? "active" : ""}
            >
            <i className="fa-solid fa-handshake-angle"></i>
            {!isMinimizedState && <span>Volunteers</span>}
            </a>
          </li>*/}
        </ul>

        <div className={`user-section ${isMinimizedState ? "minimized" : ""}`}>
          <div className="prof-box">
            <div className="circle-prof">
              <i className="fa-solid fa-user"></i>
            </div>
          </div>

          {!isMinimizedState && (
            <div className="user-box">
              <h1>Us3rn4me</h1>
              <h3>Role</h3>
              <button className="logout-btn">Logout</button>
            </div>
          )}

          {/* Show logout icon if minimized */}
          {isMinimizedState && (
            <div className="logout-icon">
              <i className="fa-solid fa-right-from-bracket"></i>
            </div>
          )}
        </div>

    </div>
  );
};

export default Sidebar;
