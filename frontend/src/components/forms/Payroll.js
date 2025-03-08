import React, { useEffect, useState } from "react";

import "../../css/forms/Payroll.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Payroll= () => {

    const employees = Array(25).fill({
        name: "XXXXXXXXXXXXX",
        category: "SHARER",
        address: "PK 10, TAMBACAN",
        amount: 3000.0,
    });

    return (
        <div className="payroll">
        
        <div className="res-btn">

        </div>

        <div className="header">
            {/* Left Logo */}
            <div className="header-logo">   
                
            </div>

            {/* Central Text */}
            <div className="text-center">
                <div className= "sheet-title">
                    <h2>CITY OF ILIGAN PAYROLL</h2>
                </div>
            </div>

            {/* Right Logo */}
            <div className="header-logo">
                
            </div>
        </div>

        <div className="payroll-container">
            <h5 className="no-margin">We hereby acknowledge to have received from, ________________ treasurer of, ILIGAN CITY the sums hereins </h5>
            <table className="payroll-table">
                <thead>
                <tr>
                    <th>No</th>
                    <th>NAME</th>
                    <th>Category</th>
                    <th>Address</th>
                    <th>AMOUNT DUE</th>
                    <th>TOTAL AMOUNT</th>
                    <th>SIGNATURE</th>
                </tr>
                </thead>
                <tbody>
                {employees.map((emp, index) => (
                    <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{emp.name}</td>
                    <td>{emp.category}</td>
                    <td>{emp.address}</td>
                    <td>{emp.amount.toLocaleString()}</td>
                    <td>{emp.amount.toLocaleString()}</td>
                    <td></td>
                    </tr>
                ))}
                </tbody>
                <tfoot>
                <tr>
                    <td colSpan="4">TOTAL</td>
                    <td>000,000.00</td>
                    <td>000,000.00</td>
                    <td></td>
                </tr>
                </tfoot>
            </table>
            
            <div className="footer">
            </div>

        </div>

        </div>
    );
};

export default Payroll;