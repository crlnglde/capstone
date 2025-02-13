import React, { useEffect, useState } from "react";

import "../../css/forms/SPORADIC.css";
import ICImage from '../../pic/IC.png';
import cswdImage from '../../pic/cswd.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';

const SPORADIC= () => {


  return (
    <div className="spodaric">
      
      <div className="res-btn">

      </div>

      <div className="spodaric-container">

        <div className="spodaric-header">
            {/* Left Logo */}
            <div className="header-logo">   
                <img src={ICImage} alt="Logo" />
            </div>

            {/* Central Text */}
            <div className="text-center">
                <h2 className="title">REPUBLIC OF THE PHILIPPINES</h2>
                <h2 className="bold">CITY OF ILIGAN</h2>
                <h2 className="italic-bold">
                    Office of the City Social Welfare and Development Officer
                </h2>

                <div className= "sheet-title">
                    <h2>Disaster Assistance Family Access Card (DAFAC)</h2>
                </div>
            </div>

            {/* Right Logo */}
            <div className="header-logo">
                <img src={cswdImage} alt="Logo" />
            </div>
        </div>
    
        
        <div className="table-container">
            <table className="sporadic-report">
                <thead>
                <tr>
                    <th rowSpan="2">No.</th>
                    <th rowSpan="2">Name</th>
                    <th rowSpan="2">Age</th>
                    <th rowSpan="2">Sex</th>
                    <th rowSpan="2">Brgy. Address</th>
                    <th rowSpan="2">No. of Dependents</th>
                    <th rowSpan="2">Type of Calamity</th>
                    <th rowSpan="2">Date of Calamity</th>
                    <th rowSpan="2">Category</th>
                    <th colSpan="5">Sectoral</th>
                    <th rowSpan="2">Livelihood</th>
                </tr>
                <tr>
                    <th>Senior Citizen</th>
                    <th>PWD</th>
                    <th>Solo Parent</th>
                    <th>Pregnant</th>
                    <th>Lactating Mothers</th>
                </tr>
                </thead>
                <tbody>
                {[...Array(5)].map((_, index) => (
                    <tr key={index}>
                    <td>{index + 1}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>

      </div>

    </div>
  );
};

export default SPORADIC;
