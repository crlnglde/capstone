import React from "react";
import "../../css/again/Confirmation.css";

const ConfirmationDialog = ({ type, title, message, onConfirm, onCancel }) => {
  const getIcon = () => {
    if (type === "delete") return "🗑️"; // Trash icon for delete
    if (type === "save" || type === "add") return "✅"; // Checkmark for save or add
    if (type === "upload") return "📤"; 
    if (type === "submit") return "📄"; // Page icon for submit
    if (type === "confirm") return "❔";
    return "❔"; // Question mark for other
  };

  return (
    <div className="confirmation-dialog-overlay">
      <div className="confirmation-dialog">
        <div className={`confirmation-icon ${type}`}>
          {getIcon()}
        </div>
        <div className="confirmation-content">
          <strong className="confirmation-title">{title}</strong>
          <p className="confirmation-message">{message}</p>
        </div>
        <div className="confirmation-actions">
          <button className="btn-confirm" onClick={onConfirm}>Yes</button>
          <button className="btn-cancel" onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
