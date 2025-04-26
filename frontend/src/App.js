import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate  } from "react-router-dom";
import { ToastContextProvider } from "./context/ToastContextProvider";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Residents from "./components/Residents";
import Disaster from "./components/Disaster";
import Distribution from "./components/Distribution";
import AddDisaster from "./components/Add-Disaster";
import Reports from "./components/Reports";
import RDS from "./components/forms/RDS";
import EditRDS from "./components/forms/EditRDS";
import ViewRDS from "./components/forms/ViewRDS";
import DAFAC from "./components/forms/DAFAC";
import SPORADIC from "./components/forms/SPORADIC";
import FDR from "./components/forms/FDR";
import Landing from "./components/landing";
import Login from "./components/Login";
import Loading from "./components/again/Loading";
import { motion } from "framer-motion";
import "./App.css";
import Minlogo from "./pic/logo-min.png";
import ProtectedRoute from "./ProtectedRoute";
import axios from "axios";
import Notification from "../src/components/again/Notif";

function App() {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(() => {
    // Check localStorage to persist the minimized state
    const storedState = JSON.parse(localStorage.getItem("sidebarState"));
    return storedState !== null ? storedState : false; // Default to false if no state in localStorage
  });

  const [navbarTitle, setNavbarTitle] = useState("");

  const [showLogo, setShowLogo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null); 

  const fetchData = async () => {
    try {
        const [residentsRes, disastersRes, distributionsRes] = await Promise.all([
            axios.get("http://localhost:3003/get-residents"),
            axios.get("http://localhost:3003/get-disasters"),
            axios.get("http://localhost:3003/get-distributions"),
        ]);
        localStorage.setItem("residents", JSON.stringify(residentsRes.data));
        localStorage.setItem("disasters", JSON.stringify(disastersRes.data));
        localStorage.setItem("distributions", JSON.stringify(distributionsRes.data));
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

  useEffect(() => {
    if (navigator.onLine) {
        fetchData();
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return(
    <div className="app">


      <ToastContextProvider>
        <Router>


        {loading && (
            <div className="full-page-loading">
              <Loading />
            </div>
          )}

           {notification && (
                  <Notification
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    onClose={() => setNotification(null)}  // Close notification when user clicks ✖
                  />
                )}


          <ConditionalLayout 
            isSidebarMinimized={isSidebarMinimized} 
            setIsSidebarMinimized={setIsSidebarMinimized} // Pass the setter here
            navbarTitle={navbarTitle} 
            setLoading={setLoading}
          >
            <Routes>
              {/*<Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              {/*<Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<Home />} />
              <Route path="/disaster" element={<Disaster setNavbarTitle={setNavbarTitle} />} /> 
              <Route path="/disaster/add-disaster" element={<AddDisaster />} />

              <Route path="/distribution" element={<Distribution setNavbarTitle={setNavbarTitle} />}>
                <Route path="rds" element={<RDS/>} />
                <Route path="edit-rds" element={<EditRDS/>} />
                <Route path="view-rds" element={<ViewRDS/>} />
              </Route>

              <Route path="/residents" element={<Residents />} />
              
              <Route path="/reports" element={<Reports />} />
              <Route path="/rds" element={<RDS />} />
              <Route path="/dafac" element={<DAFAC />} />
              <Route path="/sporadic" element={<SPORADIC />} />
              <Route path="/fdr" element={<FDR />} />*/}

            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute allowedRoles={["CSWD", "daycare worker", "Enumerator"]} />}>
                  <Route path="/home" element={<Home />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["CSWD", "daycare worker"]} />}>
                  <Route path="/disaster" element={<Disaster setNavbarTitle={setNavbarTitle} />} />
                  <Route path="/disaster/add-disaster" element={<AddDisaster />} />
                  <Route path="/residents" element={<Residents />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["CSWD", "Enumerator"]} />}>
                <Route path="/distribution" element={<Distribution setNavbarTitle={setNavbarTitle} />}>
                  <Route path="rds" element={<RDS/>} />
                  <Route path="edit-rds" element={<EditRDS/>} />
                  <Route path="view-rds" element={<ViewRDS/>} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["CSWD"]} />}>
                <Route path="/rds" element={<RDS />} />
                <Route path="/dafac" element={<DAFAC />} />
                <Route path="/sporadic" element={<SPORADIC />} />
                <Route path="/fdr" element={<FDR />} />
                <Route path="/reports" element={<Reports />} />
              </Route>

            </Routes>

          </ConditionalLayout>
        </Router>
      </ToastContextProvider>
    </div>
  );
}

function ConditionalLayout({ isSidebarMinimized, setIsSidebarMinimized,  navbarTitle, setLoading, children }) {
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
            setLoading={setLoading}
          />
          <div className={`main-content ${isSidebarMinimized ? "adjusted" : ""}`}>
            <Navbar isSidebarMinimized={isSidebarMinimized} customTitle={navbarTitle} />
            {children}
          </div>
        </>
      )}
      {isLandingPage && <div className="full-screen">{children}</div>}
    </>
  );
}

export default App;
