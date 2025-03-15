

import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import "../css/Signature.css";

const SignaturePad = ({family, onSave, onClose}) => {
  const sigCanvas = useRef(null);
  const [imageURL, setImageURL] = useState(null);

  const saveSignature = () => {
    if (sigCanvas.current) {
        const signatureData = sigCanvas.current.toDataURL("image/png");
        onSave(signatureData); // Send signature back to editrds pero change ni to save to dataase
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


