import React from "react";
import "../../css/again/Notif.css";

const Notification = ({ type, title, message, onClose}) => {
  return (
    <div className={`notification ${type}`}>
      <div className={`badge ${type}`}>
        {type === "success" ? "SUCCESS" : "ERROR"}
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
