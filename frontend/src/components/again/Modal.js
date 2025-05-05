// Modal.js
import React from "react";
import "../css/Modal.css"; 

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button> 

        <div > 
          {title && <h2 className="modal-title">{title}</h2>}
        </div>
        
        <div className="children">
          
        </div>
        {children }
      </div>
    </div>
  );
};

export default Modal;
