import React, { useEffect, useState, useRef  } from "react";
import { v4 as uuidv4 } from "uuid";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import "../../css/forms/Res.css";
import ICImage from '../../pic/IC.png';
import cswdImage from '../../pic/cswd.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';

const RES = ({ residentData }) => {
  return (
    <div className="resvw">
      <form className="res-form">
        {/* Head of the Family Section */}
        <div className="form-header">
          <span>Head of the Family</span>
          <span className="contact">
            Contact No.: <input type="text" value={residentData.phone || ""} disabled />
          </span>
        </div>

        {/* Name and Basic Details */}
        <div className="row">
          <div className="col">
            <input type="text" value={residentData.lastName || ""} disabled />
            <label>Surname</label>
          </div>
          <div className="col">
            <input type="text" value={residentData.firstName || ""} disabled />
            <label>First Name</label>
          </div>
          <div className="col">
            <input type="text" value={residentData.middleName || ""} disabled />
            <label>Middle Name</label>
          </div>
          <div className="col">
            <label>Gender: </label>
            <select value={residentData.sex} disabled>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>
          <div className="col">
            <label>Age: </label>
            <input type="number" min="0" value={residentData.age || ""} disabled />
          </div>
        </div>

        {/* Address, Date of Birth, Occupation, Income */}
        <div className="row">
          <div className="col address">
            <input type="text" value={`${residentData.purok}, ${residentData.barangay}`} disabled />
            <label>Home Address</label>
          </div>
          <div className="col">
            <input type="date" value={residentData.bdate || ""} disabled />
            <label>Date of Birth</label>
          </div>
          <div className="col">
            <input type="text" value={residentData.occupation || ""} disabled />
            <label>Occupation</label>
          </div>
          <div className="col">
            <input type="number" min="0" step="0.01" value={residentData.income || ""} disabled />
            <label>Monthly Income</label>
          </div>
        </div>

        {/* Educational Attainment and Family Members */}
        <div className="row">
          <div className="col">
            <input type="text" value={residentData.education || ""} disabled />
            <label>Educational Attainment</label>
          </div>
          <div className="col">
            <input type="number" min="0" value={residentData.familyMembers || ""} disabled />
            <label>No. of Family Members</label>
          </div>
        </div>

        {/* Family Members Table */}
        <table className="family-table">
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
            {residentData?.dependents?.length > 0 ? (
              residentData.dependents.map((dependent, index) => (
                <tr key={index}>
                  <td>{dependent.name}</td>
                  <td>{dependent.relationToHead}</td>
                  <td>{dependent.age}</td>
                  <td>{dependent.sex}</td>
                  <td>{dependent.education}</td>
                  <td>{dependent.occupationSkills}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No dependents available</td>
              </tr>
            )}
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default RES;
