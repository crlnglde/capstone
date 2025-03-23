import React from "react";
import "../../css/again/Loading.css";

const Loading = () => {
  return (
    <div className="loader-container">
      <div className="circle-loader">
        <div className="arc"></div>
        <div className="dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Loading;
