import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

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
import Login from "./components/Login";
import Loading from "./components/again/Loading";
import ProtectedRoute from "./ProtectedRoute";

import "./App.css";

function App() {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(() => {
    const storedState = JSON.parse(localStorage.getItem("sidebarState"));
    return storedState !== null ? storedState : false;
  });

  const [navbarTitle, setNavbarTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 200);
  }, []);

  return (
    <div className="app">
      <ToastContextProvider>
        <Router>
          {loading && (
            <div className="full-page-loading">
              <Loading />
            </div>
          )}

          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Login />} />

            {/* Protected Routes with Layout */}
            <Route
              element={
                <Layout
                  isSidebarMinimized={isSidebarMinimized}
                  setIsSidebarMinimized={setIsSidebarMinimized}
                  navbarTitle={navbarTitle}
                  setNavbarTitle={setNavbarTitle}
                  setLoading={setLoading}
                />
              }
            >
              <Route element={<ProtectedRoute allowedRoles={["CSWD", "daycare worker", "Enumerator"]} />}>
                <Route path="/home" element={<Home  setNavbarTitle={setNavbarTitle}/>}/>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["CSWD", "daycare worker"]} />}>
                <Route path="/disaster" element={<Disaster setNavbarTitle={setNavbarTitle} />} />
                <Route path="/disaster/add-disaster" element={<AddDisaster />} />
                <Route path="/residents" element={<Residents setNavbarTitle={setNavbarTitle}/>} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["CSWD", "Enumerator"]} />}>
                <Route path="/distribution" element={<Distribution setNavbarTitle={setNavbarTitle} />} />
                <Route path="/distribution/rds" element={<RDS />} />
                <Route path="/distribution/edit-rds" element={<EditRDS />} />
                <Route path="/distribution/view-rds" element={<ViewRDS />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["CSWD"]} />}>
                <Route path="/rds" element={<RDS />} />
                <Route path="/dafac" element={<DAFAC />} />
                <Route path="/sporadic" element={<SPORADIC />} />
                <Route path="/fdr" element={<FDR />} />
                <Route path="/reports" element={<Reports setNavbarTitle={setNavbarTitle}/>} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
      </ToastContextProvider>
    </div>
  );
}

// Layout wrapper that includes Sidebar and Navbar only when not on login page
function Layout({
  isSidebarMinimized,
  setIsSidebarMinimized,
  navbarTitle,
  setLoading,
  setNavbarTitle,
}) {
  const location = useLocation();
  const isLogin = location.pathname === "/";

  if (isLogin) {
    return <Outlet />;
  }

  return (
    <>
      <Sidebar
        isMinimized={isSidebarMinimized}
        setIsMinimized={setIsSidebarMinimized}
        setLoading={setLoading}
      />
      <div className={`main-content ${isSidebarMinimized ? "adjusted" : ""}`}>
        <Navbar isSidebarMinimized={isSidebarMinimized} customTitle={navbarTitle} />
        <Outlet key={location.pathname} /> 
      </div>
    </>
  );
}

export default App;
