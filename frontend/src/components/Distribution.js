import React, { useEffect, useState } from "react";
import { useNavigate} from 'react-router-dom'; 

import { db } from "../firebase";
import { collection, addDoc, getDocs } from 'firebase/firestore';
import Papa from 'papaparse';

import Barc from './visualizations/Bar-ch'
import Piec from './visualizations/Pie-ch'
import Map from './visualizations/Iligan'
import "../css/Distribution.css";

const Distribution = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const rowsPerPage = 10;
  const totalPages = 20;
  //const totalPages = Math.ceil(disasters.length / rowsPerPage);

  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const data = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
  ];

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    console.log("Search Query: ", query); // Debugging the query
  };

  const handleViewMore = (disaster) => {
    setModalType("viewmore");
    setSelectedDisaster(disaster); 
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDisaster(null); 
    setModalType("");
  };

    //page sa disasters
    const handleNext = () => {
      if (currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
      }
    };
  
    const handlePrev = () => {
      if (currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    };

  return (
    <div className="distribution">

      <div className="distribution-container">

        {/* Visualization ni diri */}

        {/* Current */}
        <div className="distribution-table">

          <div className="header-container">
            <h2 className="header-title">Current Disaster</h2>
          </div>

          <table>
              <thead>
                <tr>
                  <th>Disaster Code</th>
                  <th>Disaster Type</th>
                  <th>Disaster Date</th>
                  <th>Affected Barangay</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td>hehe</td>
                      <td>hehe</td>
                      <td>hehe</td>
                      <td>hehe</td>
                      <td>
                        <button className="dash-viewmore-btn" onClick={() => handleViewMore()}>
                          <i className="fa-solid fa-ellipsis"></i> add
                        </button>

                        <button className="dash-viewmore-btn">
                          <i className="fa-solid fa-ellipsis"></i> done
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No disasters found.</td>
                  </tr>
                )}
              </tbody>

            </table>

            <div className="btn-container">

              <button
                className="nav-button prev"
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                  <i className="fa-solid fa-angle-left"></i>
              </button>


              <button
                className="nav-button next"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                  <i className="fa-solid fa-angle-right"></i>
              </button>
            </div>
          
        </div>

        {/*History */}
        <div className="distribution-table">

          <div className="header-container">
            <h2 className="header-title">Distribution History</h2>
            <div className="dstr-search">
              <div className="dstr-search-container">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  onChange={handleSearchChange} 
                  className="search-bar"
                />
              </div>
            </div>
          </div>

            <table>
              <thead>
                <tr>
                  <th>Disaster Code</th>
                  <th>Disaster Type</th>
                  <th>Disaster Date</th>
                  <th>Affected Barangay</th>
                  <th>View More</th>
                </tr>
              </thead>
             
             <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={index}>
                    <td>hehe</td>
                    <td>hehe</td>
                    <td>hehe</td>
                    <td>hehe</td>
                    <td>
                      <button className="dash-viewmore-btn">
                        <i className="fa-solid fa-ellipsis"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No disasters found.</td>
                </tr>
              )}
            </tbody>

            </table>

            <div className="btn-container">

              <button
                className="nav-button prev"
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                  <i className="fa-solid fa-angle-left"></i>
              </button>


              <button
                className="nav-button next"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                  <i className="fa-solid fa-angle-right"></i>
              </button>
            </div>

          </div>

      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">

            <form>
              <label>Affected Barangay:</label>
              <input type="text" placeholder="Enter barangay" />

              <label>Kind Source</label>
              <input type="text" placeholder="Enter code" />

              <label>Quantity</label>
              <input type="text" placeholder="Enter type" />

              <label>received from</label>
              <input type="text" />

              <label>Certified Correct: </label>
              <input type="text" />

              <label>Submitted by: </label>
              <input type="text" />





              <button type="submit">Submit</button>
            </form>
            <button className="close-btn" onClick={handleCloseModal}>
              Close
            </button>
          </div>
        </div>
      )}



    </div>
  );
};

export default Distribution;
