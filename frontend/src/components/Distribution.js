import React, { useEffect, useState } from "react";
import { useNavigate} from 'react-router-dom'; 
import { Outlet } from "react-router-dom";

import RDS from "./forms/RDS";
import Modal from "./Modal";
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
  const [step, setStep] = useState(1);

  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const disasterData = [
    { disasterCode: "D001", disasterType: "Flood", disasterDate: "2024-02-10", affectedBarangay: "Barangay 1" },
    { disasterCode: "D002", disasterType: "Earthquake", disasterDate: "2024-03-15", affectedBarangay: "Barangay 3" },
    { disasterCode: "D003", disasterType: "Typhoon", disasterDate: "2024-04-20", affectedBarangay: "Barangay 5" },
    { disasterCode: "D004", disasterType: "Landslide", disasterDate: "2024-05-05", affectedBarangay: "Barangay 2" },
    { disasterCode: "D005", disasterType: "Fire", disasterDate: "2024-06-12", affectedBarangay: "Barangay 4" }
  ];

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    console.log("Search Query: ", query); // Debugging the query
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

    const handleNextStep = (event) =>{ 
      event.preventDefault();
      setIsModalOpen(false);

      setStep(2);
      navigate("/distribution/rds");
    };

    const handleEdit = () => {
      setStep(2);
      navigate("/distribution/rds");
    };

    const handleBackClick = () => {
      if (step > 1) {
        setStep(step - 1);
        navigate("/distribution"); 
      } else {
        navigate(-1); 
      }
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
      {step === 1 ? (
      <>
        <div className="content-container">

          <div className="column">
            {/* Current */}
            <div className="distribution-table">
              <div className="header-container">
                <h2 className="header-title">Current Disaster</h2>
              </div>

              <div className="container">
              {disasterData.length > 0 ? (
                disasterData.map((disaster, index) => (
                  <div key={index} className="transactionItem">
                    <div className="dateBox">
                      <span className="date">{new Date(disaster.disasterDate).getDate()}</span>
                      <span className="month">{new Date(disaster.disasterDate).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="details">
                      <span className="title">{disaster.disasterType}</span>
                      <span className="subtitle">{disaster.disasterCode}</span>
                    </div>
                    {disaster.affectedBarangay && (
                      <div className="brgy">
                        <span className="subtitle">{disaster.affectedBarangay}</span>
                      </div>
                    )}
                    <div className="actions">
                      <button className="addButton" onClick={openModal}>Add</button>
                      <button className="doneButton">Done</button>
                    </div>
                  </div>
                  ) )): (
                    <tr>
                      <td colSpan="5">No disasters found.</td>
                    </tr>
                )}
              </div>

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
          
            {/* Pending */}
            <div className="distribution-table">
              <div className="header-container">
                <h2 className="header-title">Pending Distribution</h2>
              </div>

              <div className="container">
              {disasterData.length > 0 ? (
                disasterData.map((disaster, index) => (
                  <div key={index} className="transactionItem">
                    <div className="dateBox">
                      <span className="date">{new Date(disaster.disasterDate).getDate()}</span>
                      <span className="month">{new Date(disaster.disasterDate).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="details">
                      <span className="title">{disaster.disasterType}</span>
                      <span className="subtitle">{disaster.disasterCode}</span>
                    </div>
                    {disaster.affectedBarangay && (
                      <div className="brgy">
                        <span className="subtitle">{disaster.affectedBarangay}</span>
                      </div>
                    )}
                    <div className="actions">
                      <button className="doneButton" onClick={handleEdit}>Edit</button>
                    </div>
                  </div>
                  ) )): (
                    <tr>
                      <td colSpan="5">No disasters found.</td>
                    </tr>
                )}
              </div>

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
                {disasterData.length > 0 ? (
                  disasterData.map((item, index) => (
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

      </>
      ) : (

        <div className="rds-form-container">

          <div className="back">
            <button className="backButton" onClick={handleBackClick}>
              <i className="fa-solid fa-chevron-left"></i>
              Back
            </button>
          </div>


          <RDS />
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title="RDS">
        
        <form className="modal-form">
            <label>Affected Barangay:</label>
            <input type="text" placeholder="Enter barangay" />

            <label>Kind Source:</label>
            <input type="text" placeholder="Enter code" />

            <label>Quantity:</label>
            <input type="text" placeholder="Enter type" />

            <label>Received From:</label>
            <input type="text" />

            <label>Certified Correct:</label>
            <input type="text" />

            <label>Submitted by:</label>
            <input type="text" />

            <button type="submit" className="submitButton" onClick={handleNextStep}>Next</button>
          </form>

      </Modal>

      {/* Modal Popup */}

    </div>
  );
};

export default Distribution;
