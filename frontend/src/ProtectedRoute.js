import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem("token");

    const userRole = localStorage.getItem("role"); // Get role from localStorage

    console.log("User Role from Storage:", userRole); // Debug log

    if (!userRole) {
        console.log("No role found, redirecting to /login");
        return <Navigate to="/" />;
    }



    console.log("Token:", token);
    console.log("User Role:", userRole);
    console.log("Allowed Roles:", allowedRoles);

    if (!token) {
        console.log("Redirecting to /login - No token found.");
        return <Navigate to="/" />;
    }

    if (userRole === "admin") {
        console.log("Admin detected - Granting access.");
        return <Outlet />;
    }

    if (!allowedRoles.includes(userRole)) {
        console.log("Redirecting to /unauthorized - Role not allowed.");
        return <Navigate to="/" />;
    }

    console.log("Access granted to:", userRole);
    return <Outlet />;
};

export default ProtectedRoute;
