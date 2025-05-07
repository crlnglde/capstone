// ToggleSwitch.jsx
import React from 'react';
import "../../css/again/ToggleButton.css"

const ToggleSwitch = ({ isChecked, onToggle }) => {
  return (
    <div className="ToggleContainer">
      <span className="label">Residency Status:</span>
      <label className="switch">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
        />
        <span className="slider">
          <span className="status-text">{isChecked ? "Active" : "Inactive"}</span>
        </span>
      </label>
    </div>
  );
};

export default ToggleSwitch;
