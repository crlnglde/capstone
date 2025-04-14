import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout({ setLoading }) {
  const location = useLocation();
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("sidebarState"));
    return stored !== null ? stored : false;
  });

  const isLoginPage = location.pathname === "/" || location.pathname === "/login";

  if (isLoginPage) {
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
        <Navbar isSidebarMinimized={isSidebarMinimized} />
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
