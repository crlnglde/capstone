import React from "react";
import { useLocation } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = ({ isSidebarMinimized, customTitle }) => {
    const location = useLocation();

    // Function to generate a readable page name from the path
    const formatPageName = (pathname) => {
        if (pathname === "/") return "Home"; // Default for root

        return pathname
            .split("/") // Split path into parts
            .filter((part) => part) // Remove empty parts
            .map((part) => 
                part
                    .replace(/-/g, " ") // Replace hyphens with spaces
                    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
            )
            .join(" > "); // Join with " > " for breadcrumb-like structure
    };

    const currentPageName = formatPageName(location.pathname);

    return (
        <div className={`navbar ${isSidebarMinimized ? "adjusted-navbar" : ""}`}>
            <div className="page-name">
            <h1>{customTitle || currentPageName}</h1> 
            </div>

            <div className="notifications">
                <i className="fa-regular fa-bell"></i>
            </div>
        </div>
    );
};

export default Navbar;
