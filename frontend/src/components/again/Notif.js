import React from "react";
import "../../css/again/Notif.css";

const Notification = ({ type, title, message, onClose }) => {
  const getBadgeText = () => {
    if (type === "success") return "SUCCESS";
    if (type === "error") return "ERROR";
    if (type === "info") return "INFO";
    return "NOTICE";
  };

  return (
    <div className={`notification ${type}`}>
      <div className={`badge ${type}`}>
        {getBadgeText()}
      </div>
      <div className="content">
        <strong className="title">{title}</strong>
        <p>{message}</p>
      </div>
      <button className="close-btn" onClick={onClose}>✖</button>
    </div>
  );
};

export default Notification;

