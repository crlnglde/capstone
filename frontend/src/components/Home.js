import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../css/Home.css";
import dswd1 from '../pic/dswd1.jpg'; 
import dswd from '../pic/dswd.jpg'; 
import cswd from '../pic/cswd1.jpg';
import dswd2 from '../pic/dswd2.png'; 
import dswd3 from '../pic/dswd3.jpg'; 
import videoBackground from '../pic/vid.mp4';
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import HomeMap from './visualizations/map'

const Home = ({setNavbarTitle}) => {
  const location = useLocation();
  const [reload, setReload] = useState(false);

  const images = [dswd1, dswd, dswd2, dswd3];
  const [currentIndex, setCurrentIndex] = useState(0);

  const [residents, setResidents] = useState([]);
  const [totalResidents, setTotalResidents] = useState(0);
  const [totalFamilies, setTotalFamilies] = useState(0);
  const [disasters, setDisasters] = useState([]);
  const [totalDisasters, setTotalDisasters] = useState(0);

  const ref = useRef(null);
  const isInView = useInView(ref, { triggerOnce: false, margin: "-50px" });


  useEffect(() => {
    if (location.pathname === "/home") {
      setNavbarTitle("Home");
    }
  }, [location.pathname, setNavbarTitle]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length); 
    }, 2000);

   
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    // Force a re-render when navigating away from /home
    if (location.pathname !== "/home") {
      setReload(true);
    } else {
      setReload(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (reload) {
      // Here you can reset any state or force certain actions based on the reload
      console.log("Force re-rendering Home");
    }
  }, [reload]);

// Fetch Residents Data and Calculate Counts
useEffect(() => {
  const fetchResidents = async () => {
    let residentsData = [];

    // Load from localStorage first (for faster initial display)
    const localData = localStorage.getItem("residents");
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        const data = parsed;
        residentsData = data.filter(resident => resident.status === "active");
        setResidents(residentsData);
        updateStats(residentsData);
      } catch (e) {
        console.error("Failed to parse local residents data", e);
      }
    }

    // Then attempt to fetch fresh data from server
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-residents`);
      residentsData = response.data.filter(resident => resident.status === "active");
      setResidents(residentsData);
      updateStats(residentsData);
      localStorage.setItem("residents", JSON.stringify(residentsData)); // Optional: Update localStorage
    } catch (error) {
      console.error("Error fetching residents data:", error);
    }
  };

  const updateStats = (data) => {
    const total = data.reduce(
      (sum, resident) => sum + 1 + (resident.dependents?.length || 0),
      0
    );
    setTotalResidents(total);
    setTotalFamilies(data.length);
  };

  fetchResidents();
}, []);


useEffect(() => {
  const fetchDisasters = async () => {
    const localData = localStorage.getItem("disasters");
    if (localData) {
      const parsed = JSON.parse(localData);
      setDisasters(parsed);
      setTotalDisasters(parsed.length);
    }
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-disasters`);
      const disasterData = response.data;
      setDisasters(disasterData); // Store disasters data in state

      // Set the total number of disasters
      setTotalDisasters(disasterData.length);
    } catch (error) {
      console.error("Error fetching disasters data:", error);
    }
  };

  fetchDisasters();
}, []);  

  return (
    <div className="home">
     
      
      <div className="home-container">
        
         <img src={cswd} alt="Background" className="background-image" />

          <div className="overlay">

            <motion.h1
              initial={{ opacity: 0, y: -50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}

              viewport={{ once: false, amount: 0.2 }}
            >
             Welcome to the CSWD<br />Disaster Assistance Portal
            </motion.h1>

            <motion.h3
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
              viewport={{ once: false, amount: 0.2 }}
            >
              Ensuring Safety, Preparedness, and Support for the Community
            </motion.h3>
          </div>
      </div>   

    <div className="home-container1">
      <div className="home-row" ref={ref}>

        {/* Residents Card */}
        <motion.div 
          className="home-count-card"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="hcc-label"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <i className="fa-solid fa-people-group"></i>
          </motion.div>
          <motion.label 
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Total Residents
          </motion.label>
          <motion.p 
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {totalResidents}
          </motion.p>
        </motion.div>

        {/* Families Card */}
        <motion.div 
          className="home-count-card"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.div 
            className="hcc-label"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <i className="fa-solid fa-people-roof"></i>
          </motion.div>
          <motion.label 
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Total Families
          </motion.label>
          <motion.p 
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {totalFamilies}
          </motion.p>
        </motion.div>

        {/* Disasters Card */}
        <motion.div 
          className="home-count-card"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div 
            className="hcc-label"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <i className="fa-solid fa-hurricane"></i>
          </motion.div>
          <motion.label 
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Total Disasters
          </motion.label>
          <motion.p 
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {totalDisasters}
          </motion.p>
        </motion.div>

      </div>
    </div>

      <div className="home-container2">
        <HomeMap/>
      </div>

    </div>
  );
};

export default Home;
