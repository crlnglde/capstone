import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate  } from "react-router-dom";
import { ToastContextProvider } from "./context/ToastContextProvider";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Residents from "./components/Residents";
import Dashboard from "./components/Dashboard";
import Distribution from "./components/Distribution";
import AddDisaster from "./components/Add-Disaster";
import Reports from "./components/Reports";
import RDS from "./components/forms/RDS";
import EditRDS from "./components/forms/EditRDS"
import DAFAC from "./components/forms/DAFAC";
import SPORADIC from "./components/forms/SPORADIC";
import FDR from "./components/forms/FDR";
import Landing from "./components/landing";

import { motion } from "framer-motion";
import "./App.css";
import Minlogo from "./pic/logo-min.png";

function App() {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(() => {
    // Check localStorage to persist the minimized state
    const storedState = JSON.parse(localStorage.getItem("sidebarState"));
    return storedState !== null ? storedState : false; // Default to false if no state in localStorage
  });

  const [showLogo, setShowLogo] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide the logo animation after 3 seconds
    const timer = setTimeout(() => setShowLogo(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.onload = () => {
      setTimeout(() => setLoading(false), 1000); // Fade-out delay
    };
  }, []);

  return (
    <div className="app">
      {loading && (
        <div className={`loader-container ${!loading ? "hidden" : ""}`}>
          <div className="spinner"></div>
        </div>
      )}

      <ToastContextProvider>
        <Router>
          <ConditionalLayout 
            isSidebarMinimized={isSidebarMinimized} 
            setIsSidebarMinimized={setIsSidebarMinimized} // Pass the setter here
          >
            <Routes>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />  {/* add distribution after this*/}
              <Route path="/distribution" element={<Distribution />}>
                <Route path="rds" element={<RDS/>} />
                <Route path="editrds" element={<RDS/>} />
              </Route>
              <Route path="/residents" element={<Residents />} />
              <Route path="/dashboard/add-disaster" element={<AddDisaster />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/rds" element={<RDS />} />
              <Route path="/dafac" element={<DAFAC />} />
              <Route path="/sporadic" element={<SPORADIC />} />
              <Route path="/fdr" element={<FDR />} />
            </Routes>
          </ConditionalLayout>
        </Router>
      </ToastContextProvider>
    </div>
  );
}

function ConditionalLayout({ isSidebarMinimized, setIsSidebarMinimized, children }) {
  const location = useLocation();

  // Check if the current route is the Landing page
  const isLandingPage = location.pathname === "/";

  return (
    <>
      {!isLandingPage && (
        <>
          <Sidebar
            isMinimized={isSidebarMinimized}
            setIsMinimized={setIsSidebarMinimized}
          />
          <div className={`main-content ${isSidebarMinimized ? "adjusted" : ""}`}>
            <Navbar isSidebarMinimized={isSidebarMinimized} />
            {children}
          </div>
        </>
      )}
      {isLandingPage && <div className="full-screen">{children}</div>}
    </>
  );
}

export default App;
