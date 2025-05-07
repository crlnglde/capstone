

import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import "../css/Signature.css";

import Notification from "./again/Notif";

const SignaturePad = ({family, onSave, onClose}) => {
  const sigCanvas = useRef(null);
  const [imageURL, setImageURL] = useState(null);

  
  const [notification, setNotification] = useState(null);

  const saveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureData = sigCanvas.current.toDataURL("image/png");
      //console.log("Signature Image URL:", signatureData);
      onSave(signatureData); // Send signature back to editrds pero change ni to save to database
    } else {
      //console.log("No signature detected. Please sign before saving.");
      setNotification({ type: "error", title: "Signature Required", message: "Please provide a signature before saving." });
      setTimeout(() => setNotification(null), 3000);      
    }
  };  

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setImageURL(null);
    }
  };

  return (
    <div className="signature-container">

      {notification && (
        <Notification
          type={notification.type}
          title={notification.title} 
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

    <h2 className="title">Draw Your Signature, {family.familyHead}</h2>
      <div className="canvas-wrapper">
        <SignatureCanvas 
        ref={sigCanvas} 
        penColor="black" 
        canvasProps={{ 
            className: "canvasss", 
            width: 500, 
            height: 250,
            backgroundColor: "transparent",
        }} 
        />
      </div>
      <div className="button-container">
        <button className="clear-button" onClick={clearSignature}>
          Clear
        </button>
        <button className="save-button" onClick={saveSignature}>
          Save
        </button>
      </div>
     
    </div>
  );
};

export default SignaturePad;


