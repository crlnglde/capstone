import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Home.css";
import dswd1 from '../pic/dswd1.jpg'; 
import dswd from '../pic/dswd.jpg'; 
import dswd2 from '../pic/dswd2.png'; 
import dswd3 from '../pic/dswd3.jpg'; 
const Home = () => {


  {/*old ni */}
  const images = [dswd1, dswd, dswd2, dswd3];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length); 
    }, 5000);

   
    return () => clearInterval(interval);
  }, [images.length]);

  
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
      
          <div className="row1">

          <div className="bg-right" style={{ backgroundImage: `url(${images[currentIndex]})` }}>
          {/* Optionally, you can add text or other elements here */}
        </div>

        <div className="bg-right" style={{ backgroundImage: `url(${images[(currentIndex + 1) % images.length]})` }}>
          {/* Optionally, you can add text or other elements here */}
        </div>

        <div className="bg-right" style={{ backgroundImage: `url(${images[(currentIndex + 2) % images.length]})` }}>
          {/* Optionally, you can add text or other elements here */}
        </div>

        <div className="bg-right" style={{ backgroundImage: `url(${images[(currentIndex + 3) % images.length]})` }}>
          {/* Optionally, you can add text or other elements here */}
        </div>

          

          <h1>
        Welcome to the Disaster Monitoring System
        </h1>
        <h3>
        Quick Action, Timely Disaster Response
        </h3>

          <div>
            <h2>Quick Action, Timely Disaster Response</h2>
          </div>

          <div className="home-pic-main">

            <div className="home-pic1">
              <img src={dswd} alt="Image 1" />
            </div>

            <div className="home-pic2">
              <img src={dswd2} alt="Image 1" />
            </div>

          </div>
        </div>

      


        <div className="carousel">
          <div className="image-container">
            <img src={images[currentIndex]} alt="Disaster Response" />
          </div>

          {/* Previous and Next buttons */}
          <button className="prev-button" onClick={goToPrevious}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          <button className="next-button" onClick={goToNext}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          {/* Tracking dots */}
          <div className="dots-container">
            {images.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => goToImage(index)}
              >
              </span>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
};

export default Home;
