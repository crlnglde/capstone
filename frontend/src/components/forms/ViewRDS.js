import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; 
import axios from "axios";
import CryptoJS from "crypto-js";
import "../../css/forms/RDS.css";
import ICImage from '../../pic/IC.png';
import cswdImage from '../../pic/cswd.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';

const ViewRDS = ({selectedBarangay, distributionId, setDistributionDate, page, setPage}) => {
  const navigate = useNavigate();  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [distributionData, setDistributionData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [fordisasterMonth, setforDisasterMonth] = useState("");

  useEffect(() => {
    const fetchDisasterDistribution = async () => {
      let data=[];

      if (navigator.onLine){

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-disdistribution/${distributionId}`);
        data = response.data;
      } else{

        const localData = JSON.parse(localStorage.getItem("distributions") || "[]");
        //console.log(localData)
        if (localData){
          data = localData.find(dist => dist._id === distributionId);
          //console.log(data)
        }
      }

      try {
        setforDisasterMonth(data.disasterDate)
        if (!data || !data.barangays) {
          throw new Error("Invalid data format");
        }

        const filteredData = data.barangays.filter(barangay => barangay.name === selectedBarangay);
        setDistributionData(filteredData.length > 0 ? filteredData[0].distribution : []);

        if (filteredData.length > 0 && filteredData[0].distribution.length > 0) {
          updateDistributionDate(0, filteredData[0].distribution);
        }
      } catch (err) {
        console.error("Error fetching disaster distribution data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (distributionId && selectedBarangay) {
      fetchDisasterDistribution();
    }
  }, [distributionId, selectedBarangay]);

  const updateDistributionDate = (index, data) => {
    //console.log("data", data)
    if (data[index]) {
      const date = new Date(data[index].dateDistributed);
      setDistributionDate({
        year: date.getFullYear(),
        month: date.toLocaleString("default", { month: "long"}),
        day: date.getDate(),
      });
    }
  };

  useEffect(() => {
    if (page === 0) {
      //console.log("Resetting to first distribution data.");
      const newPage = 0;
      setCurrentPage(newPage);
      updateDistributionDate(newPage, distributionData);
    }
  }, [currentPage, distributionData]);
  

  const handleNext = () => {
    if (currentPage < distributionData.length - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setPage(newPage);
      updateDistributionDate(newPage, distributionData);
    }
  };
  
  const handlePrev = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setPage(newPage);
      updateDistributionDate(newPage, distributionData);
    }
  };
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const currentDistribution = distributionData[currentPage];
  const disasterDate = fordisasterMonth ? new Date(fordisasterMonth) : null;
  const formattedMonth = disasterDate ? disasterDate.toLocaleString("default", { month: "long" }) : "";

  return (
    <div className="rds">
      <div className="rds-container">
        <div className="rds-header">
          <div className="header-logo">
            <img src={ICImage} alt="Logo" />
          </div>
          <div className="text-center">
            <h2 className="title">REPUBLIC OF THE PHILIPPINES</h2>
            <h2 className="bold">CITY OF ILIGAN</h2>
            <h2 className="italic-bold">Office of the City Social Welfare and Development Officer</h2>
            <h2 className="light">Month: {formattedMonth}</h2>
          </div>
          <div className="header-logo">
            <img src={cswdImage} alt="Logo" />
          </div>
        </div>

        <div className="sheet-title">
          <h2>RELIEF DISTRIBUTION SHEET</h2>
        </div>

        <p className="rds-text">We hereby acknowledge to have received from <strong>{currentDistribution?.receivedFrom || "_____________________"}</strong> on the date indicated the kind and quality opposite our respective names.</p>
        <table className="rds-table">
          <thead>
            <tr>
              <th>Name of Family Head</th>
              <th>No. of Series of Person Ration</th>
              <th>Kind Source, Qty. of Relief Goods Received</th>
              <th>Signature or Thumbmark of Recipient</th>
            </tr>
          </thead>
          <tbody>
            {currentDistribution?.families?.length > 0 ? (
              currentDistribution.families.map((family, index) => (
                <tr key={family._id}>
                  <td>{family.familyHead || ""}</td>
                  <td>{family.rationCount || ""}</td>
                  <td>{currentDistribution.reliefItems.map(item => `${item.name} - ${item.quantity}`).join(" | ")}</td>

                  <td className="signature-cell">
                    {family.status === "Done" ? (
                      <img
                        src={family.signature} 
                        alt="Signature"
                        className="signature-image"
                      />
                    ) : (
                    <p>Unclaimed</p>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>No data available</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="rds-footer">
        <p>CERTIFIED CORRECT: <br/>
          <strong>{currentDistribution?.certifiedCorrect || "_______________________________"}</strong>
        </p>
        <p>SUBMITTED BY: <br/>
          <strong>{currentDistribution?.submittedBy || "_______________________________"}</strong>
        </p>  
        </div>

        <div className="res-button-container">
          <button className="nav-button prev" onClick={handlePrev} disabled={currentPage === 0}>
            <i className="fa-solid fa-angle-left"></i>
          </button>
          <button className="nav-button next" onClick={handleNext} disabled={currentPage >= distributionData.length - 1}>
            <i className="fa-solid fa-angle-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRDS;
