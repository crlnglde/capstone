import React, { useEffect, useState, useRef  } from "react";
import { v4 as uuidv4 } from "uuid";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import "../../css/forms/Res.css";
import ICImage from '../../pic/IC.png';
import cswdImage from '../../pic/cswd.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';

import ConfirmationDialog from "../again/Confirmation";


const RES = ({ residentData, isEditing, setResidentData }) => {
  const [formData, setFormData] = useState(residentData);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Keep formData in sync with incoming residentData when it's updated externally
  useEffect(() => {
    setFormData(residentData);
  }, [residentData]);

  console.log("res", residentData)
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setResidentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDependentChange = (index, field, value) => {
    const updatedDependents = [...formData.dependents];
    updatedDependents[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      dependents: updatedDependents,
    }));

    setResidentData((prev) => ({
      ...prev,
      dependents: updatedDependents,
    }));
  };

  const handleAddDependent = () => {
    const newDependent = {
      name: "",
      relationToHead: "",
      age: "",
      sex: "Male", 
      education: "",
      occupationSkills: "",
    };
    setFormData((prev) => ({
      ...prev,
      dependents: [...prev.dependents, newDependent],
    }));
  };

  const handleRemoveDependent = (index) => {
    const updatedDependents = formData.dependents.filter(
      (dependent, i) => i !== index
    );
    setFormData((prev) => ({
      ...prev,
      dependents: updatedDependents,
    }));

    setResidentData((prev) => ({
      ...prev,
      dependents: updatedDependents,
    }));
  };


  return (
    <div className="resvw">
      <form className="res-form">
        {/* Head of the Family */}
        <div className="form-header">
          <span>Head of the Family</span>
          <span className="contact">
            <label>Contact No.: </label>
            <input
              type="text"
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={!isEditing}
            />
          </span>
        </div>

        {/* Name and Basic Details */}
        <div className="row">
          <div className="col">
            <input
              type="text"
              value={formData.lastName || ""}
              onChange={(e) => handleChange("lastName", e.target.value)}
              disabled={!isEditing}
            />
            <label>Surname</label>
          </div>
          <div className="col">
            <input
              type="text"
              value={formData.firstName || ""}
              onChange={(e) => handleChange("firstName", e.target.value)}
              disabled={!isEditing}
            />
            <label>First Name</label>
          </div>
          <div className="col">
            <input
              type="text"
              value={formData.middleName || ""}
              onChange={(e) => handleChange("middleName", e.target.value)}
              disabled={!isEditing}
            />
            <label>Middle Name</label>
          </div>

          <div className="col gender">
            <label>Gender: </label>
            <select
              value={formData.sex}
              onChange={(e) => handleChange("sex", e.target.value)}
              disabled={!isEditing}
            >
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>

          <div className="col age">
            <label>Age: </label>
            <input
              type="number"
              min="0"
              value={formData.age || ""}
              onChange={(e) => handleChange("age", e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Address, DOB, Occupation, Income */}
        <div className="row">
        <div className="col address">
          {isEditing ? (
            <>
              <input
                type="text"
                value={formData.purok || ""}
                onChange={(e) => handleChange("purok", e.target.value)}
                placeholder="Purok"
              />
              <input
                type="text"
                value={formData.barangay || ""}
                onChange={(e) => handleChange("barangay", e.target.value)}
                placeholder="Barangay"
              />
            </>
          ) : (
            <input
              type="text"
              value={`${formData.purok || ""}, ${formData.barangay || ""}`}
              disabled
            />
          )}
          <label>Home Address</label>
        </div>
          <div className="col">
            <input
              type="date"
              value={formData.bdate ? formData.bdate.split("T")[0] : ""}
              onChange={(e) => handleChange("bdate", e.target.value)}
              disabled={!isEditing}
            />
            <label>Date of Birth</label>
          </div>
          <div className="col">
            <input
              type="text"
              value={formData.occupation || ""}
              onChange={(e) => handleChange("occupation", e.target.value)}
              disabled={!isEditing}
            />
            <label>Occupation</label>
          </div>
          <div className="col">
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.income || ""}
              onChange={(e) => handleChange("income", e.target.value)}
              disabled={!isEditing}
            />
            <label>Monthly Income</label>
          </div>
        </div>

        {/* Education and Family Members Count */}
        <div className="row">
          <div className="col">
            <select
              value={formData.education || ""}
              onChange={(e) => handleChange("education", e.target.value)}
              disabled={!isEditing}
            >
              <option value="">Select Educational Attainment</option>
              <option value="Elementary Level">Elementary Level</option>
              <option value="Elementary Graduate">Elementary Graduate</option>
              <option value="Junior High School level">Junior High School level</option>
              <option value="Junior High School Graduate">Junior High School Graduate</option>
              <option value="Senior High School Level">Senior High School Level</option>
              <option value="Senior High School Graduate">Senior High School Graduate</option>
              <option value="College Level">College Level</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="Doctorate Degree">Doctorate Degree</option>
              <option value="Vocational">Vocational</option>
            </select>
            <label>Educational Attainment</label>
          </div>
          <div className="col">
            <input
              type="number"
              min="1"
              value={1 + (formData.dependents?.length || 0)}
              disabled
            />
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
              {isEditing && <th style={{ width: "50px" }}></th>}
            </tr>
          </thead>
          <tbody>
            {formData?.dependents?.length > 0 ? (
              formData.dependents.map((dependent, index) => (
                <tr key={index}>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={dependent.name}
                        onChange={(e) =>
                          handleDependentChange(index, "name", e.target.value)
                        }
                      />
                    ) : (
                      <div className="static-cell">{dependent.name}</div>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={dependent.relationToHead}
                        onChange={(e) =>
                          handleDependentChange(index, "relationToHead", e.target.value)
                        }
                      />
                    ) : (
                      <div className="static-cell">{dependent.relationToHead}</div>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={dependent.age}
                        onChange={(e) =>
                          handleDependentChange(index, "age", e.target.value)
                        }
                      />
                    ) : (
                      <div className="static-cell">{dependent.age}</div>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        value={dependent.sex}
                        onChange={(e) =>
                          handleDependentChange(index, "sex", e.target.value)
                        }
                      >
                        <option value={dependent.sex}>
                          {dependent.sex === "Male" ? "M" : "F"}
                        </option>
                        <option value={dependent.sex === "Male" ? "Female" : "Male"}>
                          {dependent.sex === "Male" ? "F" : "M"}
                        </option>
                      </select>
                    ) : (
                     <div className="static-cell">{dependent.sex}</div>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        value={dependent.education}
                        onChange={(e) =>
                        handleDependentChange(index, "education", e.target.value)
                        }
                      >
                        <option value="Elementary Level">Elementary Level</option>
                        <option value="Elementary Graduate">Elementary Graduate</option>
                        <option value="Junior High School level">Junior High School level</option>
                        <option value="Junior High School Graduate">Junior High School Graduate</option>
                        <option value="Senior High School Level">Senior High School Level</option>
                        <option value="Senior High School Graduate">Senior High School Graduate</option>
                        <option value="College Level">College Level</option>
                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                        <option value="Master's Degree">Master's Degree</option>
                        <option value="Doctorate Degree">Doctorate Degree</option>
                        <option value="Vocational">Vocational</option>
                      </select>
                    ) : (
                      <div className="static-cell">{dependent.education}</div>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={dependent.occupationSkills}
                        onChange={(e) =>
                          handleDependentChange(index, "occupationSkills", e.target.value)
                        }
                      />
                    ) : (
                      <div className="static-cell">{dependent.occupationSkills}</div>
                    )}
                  </td>

                  {/* Remove icon in the last column */}
                    {isEditing && (
                      <td className="remove-icon">
                        <button
                          type="button"
                          onClick={() => handleRemoveDependent(index)}
                          title="Remove Dependent"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No dependents available</td>
              </tr>
            )}
          </tbody>

        </table>

        {/* Button to add a new family member */}
        {isEditing && (
          <div className="add-family-member-btn">
            <button type="button" onClick={handleAddDependent}>
              Add Family Member
            </button>
          </div>
        )}


      </form>
    </div>
  );
};

export default RES;

