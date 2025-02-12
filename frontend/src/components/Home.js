import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Home.css";
import dswd1 from '../pic/dswd1.jpg'; 
import dswd from '../pic/dswd.jpg'; 
import dswd2 from '../pic/dswd2.png'; 
import dswd3 from '../pic/dswd3.jpg'; 
import videoBackground from '../pic/vid.mp4';

import Map from './visualizations/map'

import { db } from "../firebase";
import { collection, addDoc, getDocs } from 'firebase/firestore';

const Home = () => {

  const images = [dswd1, dswd, dswd2, dswd3];
  const [currentIndex, setCurrentIndex] = useState(0);

  const [residents, setResidents] = useState([]);
  const [totalResidents, setTotalResidents] = useState(0);
  const [totalFamilies, setTotalFamilies] = useState(0);
  const [disasters, setDisasters] = useState([]);
  const [totalDisasters, setTotalDisasters] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length); 
    }, 2000);

   
    return () => clearInterval(interval);
  }, [images.length]);


// Fetch Residents Data and Calculate Counts
useEffect(() => {
  const fetchResidents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "bgy-Residents"));
      const residentsData = querySnapshot.docs.map(doc => doc.data());
      setResidents(residentsData);

      // Calculate total residents (1 per resident + the length of their family members)
      const total = residentsData.reduce((sum, resident) => {
        return sum + 1 + (resident.FamilyMembers ? resident.FamilyMembers.length : 0); // Check if FamilyMembers exists
      }, 0);
      setTotalResidents(total);

      // Calculate total families 
      setTotalFamilies(residentsData.length);

    } catch (error) {
      console.error("Error fetching residents data:", error);
    }
  };

  fetchResidents();
}, []); 

useEffect(() => {
  const fetchDisasters = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "disasters"));
      const disastersData = querySnapshot.docs.map(doc => doc.data());
      setDisasters(disastersData); // Store disasters data in state

      // Set the total number of disasters
      setTotalDisasters(disastersData.length);
    } catch (error) {
      console.error("Error fetching disasters data:", error);
    }
  };

  fetchDisasters();
}, []);  
  
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  
  const goToPrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="home">
     
      
      <div className="home-container">
        
         <img src={dswd} alt="Background" className="background-image" />

            <div className="overlay">
            <h1>Welcome to the Disaster <br />Monitoring System </h1>
            
            <h3>Quick Action, Timely Disaster Response</h3>
              
            </div>
      </div>   

      <div className="home-container1">
        <div className="home-row">
          <div className="home-count-card">
            <div className="hcc-label">
              <i className="fa-solid fa-people-group"></i>
              
            </div>
            <label>Total Residents</label>
            <p>{totalResidents}</p>
          </div>

          <div className="home-count-card">
            <div className="hcc-label">
              <i className="fa-solid fa-people-roof"></i>
              
            </div>
            <label>Total Families</label>
            <p>{totalFamilies}</p>
          </div>


          {/* Display Total Disasters */}
          <div className="home-count-card">
            <div className="hcc-label">
              <i className="fa-solid fa-hurricane"></i>
            </div>
            <label>Total Disasters</label>
            <p>{totalDisasters}</p> {/* Display the total disasters */}
          </div>

        </div>

      </div>

      <div className="home-container2">
      
       
        

        <Map/>

      </div>

    </div>
  );
};

export default Home;
