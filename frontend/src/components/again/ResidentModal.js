// ResidentsModal.js
import React from "react";
import "../../css/again/ResidentModal.css";

const ResidentModal = ({ isOpen, onClose, title, children, withHistory }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`res-modal-overlay`}
      onClick={onClose}
    >
      <div
        className={`res-modal-content ${withHistory ? "shifted-left" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="res-modal-close" onClick={onClose}>
          ×
        </button>
        {title && <h2 className="res-modal-title">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default ResidentModal;
