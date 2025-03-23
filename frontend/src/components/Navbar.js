import React from "react";
import { useLocation } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = ({ isSidebarMinimized, customTitle }) => {
    const location = useLocation();

    // Function to generate a readable page name from the path
    const formatPageName = (pathname) => {
        if (pathname === "/") return ""; // Default for root

        let pathSegments = pathname.split("/").filter(Boolean); // Remove empty parts

        // Handle "/distribution" separately
        if (pathSegments[0] === "distribution") {
            let breadcrumb = "Distribution > List"; // Default active tab

            // If it's a subpage under distribution (rds, edit-rds, view-rds), add it to the title
            if (pathSegments.length > 1) {
                const subPage = pathSegments[1];
                if (["rds", "edit-rds", "view-rds"].includes(subPage)) {
                    breadcrumb += ` > ${subPage.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}`;
                }
            }

            return breadcrumb; // Ensure breadcrumb is returned correctly
        }

        // Default behavior for other routes
        return pathSegments
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
