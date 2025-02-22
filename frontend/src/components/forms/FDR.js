import React, { useEffect, useState } from "react";

import "../../css/forms/FDR.css";
import ICImage from '../../pic/IC.png';
import cswdImage from '../../pic/cswd.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';

const FDR= () => {


  return (
    <div className="fdr">
      
      <div className="res-btn">

      </div>

      <div className="fdr-container">

        <div className="header">
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
                    <h2>SPORADIC Report</h2>
                </div>
            </div>

            {/* Right Logo */}
            <div className="header-logo">
                <img src={cswdImage} alt="Logo" />
            </div>
        </div>

        <div className="upper-area">

            <div className="row">
                <div className="col1">
                    <p>Type of Calamity</p>
                </div>

                <div className="col1">
                    <p>Heavy Rain</p>
                </div>
            </div>

            <div className="row">
                <div className="col1">
                    <p>Date/Time Occurrence</p>
                </div>

                <div className="col1">
                    <p>Heavy Rain</p>
                </div>
            </div>

            <div className="row">
                <div className="col1">
                    <p>Evacuation Camp</p>
                </div>

                <div className="col1">
                    <p>Heavy Rain</p>
                </div>
            </div>

            <div className="row">
                <div className="col1">
                    <p>No. of Families Affected</p>
                </div>

                <div className="col1">
                    <p>Heavy Rain</p>
                </div>
            </div>

            <div className="row">
                <div className="col1">
                    <p>No. of Dependents</p>
                </div>

                <div className="col1">
                    <p>Heavy Rain</p>
                </div>
            </div>

            <div className="row">

                <div className="col1">
                    <p>total No. of Persons Affected</p>
                </div>

                <div className="col1">
                    <p>Heavy Rain</p>
                </div>
                
            </div>

            <div className="row">

                <div className="col1">
                    <p>Estimated Cost of Damaged </p>
                </div>

                <div className="col1">
                    <p>Heavy Rain</p>
                </div>
                
            </div>

        </div>

        <div className="reco">
            <p className="no-margin">Assistance Extended </p>
            <div className="neym"> 
                <p className="no-margin">Food from LGU through DRMMO and Barangay (Cooked food-- community kitchen)</p>
            </div>
            
        </div>

        <div className="table-container">
            <h5 className="no-margin">Immediate Food Assistance From CSWD: </h5>
            <table className="ifa">
                <thead>
                    <tr>
                        <th >Name of Agency</th>
                        <th >Type of Relief Assistance</th>
                        <th >Quantity</th>
                        <th >Assistance per Family</th>
                        <th >Estimated Cost</th>
                        
                    </tr>

                </thead>
                <tbody>
                   
                    <tr>
                        <td rowSpan="3">CSWD</td> 
                        <td rowSpan="3">Food Assistance</td> 
                        <td>hehe</td>
                        <td>hehe</td>
                        <td>hehe</td>
                    </tr>

                    <tr>
                        <td>hehe</td>
                        <td>hehe</td>
                        <td>hehe</td>
                    </tr>

                    <tr>
                        <td>hehe</td>
                        <td>hehe</td>
                        <td>hehe</td>
                    </tr>

                    <tr>
                        <td colSpan="3" style={{ textAlign: "right"}} >TOTAL</td>
                        <td>hehe</td>
                        <td>hehe</td>
                    </tr>
            
                </tbody>
            </table>
        </div>
        
        <div className="footer">

            <div>
                <p>Prepared by</p>

                <div className="neym">
                    <h4 className="no-margin">MARGIE RIZA ANN C. AMARGA</h4>
                    <p className="no-margin">Social Welfare Officer 1</p>
                    <p className="no-margin">Emergency Welfare Program Supervisor</p>
                </div>

            </div>

            <div>
                <p>Recommending Approval:</p>

                <div className="neym">
                    <h4 className="no-margin">EVELYN S. MADRIO</h4>
                    <p className="no-margin">City Gov't. Department Head II</p>
                    <p className="no-margin">CSWDO</p>
                </div>
            </div>
            

            <div>
                <p>Approved by</p>

                <div className="neym">
                    <h4 className="no-margin">FREDERICK W. SIAO</h4>
                    <p className="no-margin">City Mayor</p>
                </div>
            </div>

        </div>

      </div>

    </div>
  );
};

export default FDR;
