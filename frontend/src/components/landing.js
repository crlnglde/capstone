import React from "react";
import "../css/Home.css";
import dswd from '../pic/dswd.jpg'; // Keep if needed elsewhere
import videoBackground from '../pic/vid.mp4'; // Video file

import { db } from "../firebase";
import { collection, addDoc, getDocs } from 'firebase/firestore';

const LandingPage = () => {
  return (
    <div className="landing">
      {/* Video Background */}
      <div className="video-container">
        <video 
          className="video-background" 
          src={videoBackground} 
          autoPlay 
          loop 
          muted 
        />
      </div>

      {/* Overlay content */}
      <div className="landing-container">
        <div className="landing-overlay">
          <h1>Welcome to the Disaster <br />Monitoring System</h1>
          <h3>Quick Action, Timely Disaster Response</h3>
          <p>
            This platform tracks and provides information on<br />
            disaster-affected families and residents, enabling<br />
            effective response and recovery efforts.
          </p>

          
        </div>
      </div>   
    </div>
  );
};

export default LandingPage;
