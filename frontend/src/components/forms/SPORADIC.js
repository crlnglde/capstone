import React, { useEffect, useState } from "react";

import "../../css/forms/SPORADIC.css";
import ICImage from '../../pic/IC.png';
import cswdImage from '../../pic/cswd.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';

const SPORADIC= ({ report, distribution }) => {

    console.log("report:", report);
    console.log("SPORADIC ditribution: ", distribution)
  return (
    <div className="sporadic">
      
      <div className="res-btn">

      </div>

      <div className="sporadic-container">

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
                    {report?.families?.map((family, familyIndex) => (
                        <tr key={familyIndex}>
                            <td>{familyIndex + 1}</td>
                            <td>{`${family.firstName} ${family.middleName} ${family.lastName}`}</td>
                            <td>{family.age}</td>
                            <td>{family.sex}</td>
                            <td>{report.barangays}</td>
                            <td>{family.dependents.length}</td>
                            <td>{report.type}</td>
                            <td>{report.date}</td>
                            <td>{family.is4ps ? "4Ps" : "Non-4Ps"}</td>
                            <td>{family.isSenior ? "Yes" : "No"}</td>
                            <td>{family.isPWD ? "Yes" : "No"}</td>
                            <td>{family.isSolo ? "Yes" : "No"}</td>
                            <td>{family.isPreg ? "Yes" : "No"}</td>
                            <td>{family.isIps ? "Yes" : "No"}</td>
                            <td>{family.occupation || "N/A"}</td>
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>

        <div className="table-container1">
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

        <div className="reco">
            <p className="no-margin">Recommendation: </p>
            <div className="neym"> 
                <p className="no-margin">Financial Assistance from CSWD</p>
            </div>
            
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

export default SPORADIC;
