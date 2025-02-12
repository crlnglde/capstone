import React, { useEffect, useState } from "react";

import "../../css/forms/DAFAC.css";
import ICImage from '../../pic/IC.png';
import cswdImage from '../../pic/cswd.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';

const DAFAC= () => {


  return (
    <div className="dafac">
      
      <div className="res-btn">

      </div>

      <div className="dafac-container">

        <div className="rds-header">
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
    
        
        <div className="form-container">
            <form className="relief-form">

              <div className="upper-area">
                <div className="form-row">
                    <div className="checkbox-group">
                        <label><input type="checkbox" /> 4Ps</label>
                        <label><input type="checkbox" /> PWD</label>
                        <label><input type="checkbox" /> Pregnant/Lactating Mother</label>
                        <label><input type="checkbox" /> Senior Citizen</label>
                        <label><input type="checkbox" /> IPs</label>
                        <label><input type="checkbox" /> Solo Parent</label>
                    </div>
            
                    <div className="form-row form-col-1">
                        <div className="form-row serial">
                            <label>Serial No.: <input type="text" /></label>
                        </div>

                        <label>District / Cluster: <input type="text" /></label>
                        <label>Purok & Barangay: <input type="text" /></label>
                        <label>Evacuation Center: <input type="text" /></label>
                    </div>

                </div>

                <div className="form-row-2">

                  <div className="form-row detail">
                      <div className="form-row col">
                        <label>Name of Calamity: <input type="text" /></label>
                      </div>

                      <div className="form-row col">
                        <label>Date & Time of Occurrence: <input type="datetime-local" /></label>
                      </div>
                  </div>

                  <div className="form-row detail">
                    <div className="form-row col">
                      <label>Head of the Family </label>
                    </div>

                    <div className="form-row col">
                      <label>Contact No.: <input type="tel" /></label>
                    </div>
                  </div>

                  <div className="form-row detail">
                    <div className="form-row col"> 
                      <input type="text" />
                      <label>Surname </label>
                    </div>

                    <div className="form-row col"> 
                      <input type="text" />
                      <label>First Name </label>
                    </div>

                    <div className="form-row col"> 
                      <input type="text" />
                      <label>Middle Name</label>
                    </div>
  
                      <label>Gender:
                          <select>
                          <option value="M">M</option>
                          <option value="F">F</option>
                          </select>
                      </label>
                      <label>Age: <input type="number" min="0" /></label>
                  </div>

                  <div className="form-row detail">

                    <div className="form-row col"> 
                      <input type="text" />
                      <label>Home Address</label>
                    </div>

                    <div className="form-row col"> 
                      <input type="date" />
                      <label>Date of Birth</label>
                    </div>

                    <div className="form-row col"> 
                      <input type="text" />
                      <label>Occupation</label>
                    </div>

                    <div className="form-row col"> 
                      <input type="number" min="0" step="0.01" />
                      <label>Monthly Income</label>
                    </div>
                  </div>

                  <div className="form-row detail">
                    <div className="form-row col"> 
                      <input type="text" />
                      <label>Educational Attainment</label>
                    </div>

                    <div className="form-row col"> 
                      <input type="number" min="1" />
                      <label>No. of Family Members</label>
                      </div>
                  </div>

                </div>

              </div>

                <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Family Members</th>
                          <th>Relation to Family Head</th>
                          <th>Age</th>
                          <th>Sex</th>
                          <th>Education</th>
                          <th>Occupation Skills</th>

                        </tr>
                      </thead>
                      <tbody>

                        <tr>
                            <td>ddsd</td>
                            <td>ddsd</td>
                            <td>ddsd</td>
                            <td>ddsd</td>
                            <td>ddsd</td>
                            <td>ddsd</td>
                        </tr>

                        <tr>
                            <td>ddsd</td>
                            <td>ddsd</td>
                            <td>ddsd</td>
                            <td>ddsd</td>
                            <td>ddsd</td>
                            <td>ddsd</td>
                        </tr>
                                              
                      </tbody>
                </table>

                <div className="below-table">
                  <div className="form-row box">
                  <h3>Extent of Damage: </h3>
                    <label><input type="checkbox" /> Totally</label>
                    <label><input type="checkbox" /> Partially</label>
                    <label><input type="checkbox" /> Flooded</label>

                    <div className="cost-of-damage">
                      <span>Cost of Damage:</span>
                      <input type="text" placeholder="Enter amount" />
                    </div>
                  </div>

                  <div className="form-row box">
                  <h3>Occupancy Status: </h3>
                    <label><input type="checkbox" /> Owner</label>
                    <label><input type="checkbox" /> Renter</label>
                    <label><input type="checkbox" /> Sharer</label>
                    <label><input type="checkbox" /> Occupant</label>
                    <label><input type="checkbox" /> Non-Occupant</label>
                  </div>
                  
                  <div className="form-row box">
                  <h3>Casualty: </h3>
                    <label><input type="checkbox" /> Dead</label>
                    <label><input type="checkbox" /> Missing</label>
                    <label><input type="checkbox" /> Injured</label>
                  </div>

                </div>
                
                <div className="signature-section">
                  <div>
                    <p>Name/Signature of Family Head or Thumbmark:</p>
                    <div className="signature-box"></div>
                  </div>
                  <div>
                    <p>Name/Signature of Barangay Captain:</p>
                    <div className="signature-box"></div>
                  </div>
                  <div>
                    <p>Name/Signature of Social Worker:</p>
                    <div className="signature-box"></div>
                  </div>
                </div>

                <div className="date-registered">
                  <p>Date Registered:</p>
                  <input type="date" />
                </div>
               
            </form>
        </div>


       

          
     


            

      </div>

    </div>
  );
};

export default DAFAC;
