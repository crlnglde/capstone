import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; 
import axios from "axios";
import CryptoJS from "crypto-js";
import "../../css/forms/RDS.css";
import ICImage from '../../pic/IC.png';
import cswdImage from '../../pic/cswd.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Modal from "../Modal";
import SignaturePad from "../Signature";

const EditRDS = () => {
  const navigate = useNavigate();  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distributionId, setDistributionId] = useState("");
  //const [signature, setSignature] = useState(null);
  const [isUpdated, setIsUpdated] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFamilyIndex, setSelectedFamilyIndex] = useState(null);
  //const [selectedFamilyName, setSelectedFamilyName] = useState("");
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [signature, setSignature] = useState({});

  const handleOpenModal = (family) => {
    //setSelectedFamilyIndex(index);
    setSelectedFamily(family);
    setIsModalOpen(true);
  };

  const handleSaveSignature = (imageURL) => {
    if (!selectedFamily || !selectedFamily._id) return; 

    setSignature((prev) => ({
      ...prev,
      [selectedFamily._id]: imageURL,
    }));

    setDistributionData((prevData) => ({
      ...prevData,
      families: prevData.families.map(family =>
        family._id === selectedFamily._id ? { ...family, signature: imageURL, status: "Done" } : family
      )
    }));

    setIsUpdated(true);

    handleCloseModal(); // Close modal automatically
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const [distributionData, setDistributionData] = useState({
    disasterCode: "",
    disasterDate: "",
    barangayName: "",
    reliefItems: [],
    receivedFrom: "",
    certifiedCorrect: "",
    submittedBy: "",
    families: [],
  });

  useEffect(() => {
    const storedId = localStorage.getItem("distributionId");
    if (storedId) {
      setDistributionId(storedId);
      console.log("distributionId updated from localStorage:", storedId);
    }
  }, []);

  // Fetch distribution data
  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        console.log(distributionId);
        const response = await axios.get(`http://192.168.1.127:3003/get-distribution/${distributionId}`);

        const data = response.data;

        // Extract relief items and families from nested structure

        setDistributionData({
          disasterCode: data.disasterCode || "",
          disasterDate: data.disasterDate || "",
          barangayName: data.barangayName || "",
          assistanceType: data.assistanceType || "",
          reliefItems: data.distribution?.reliefItems || [],  // Fix: Access as object, not array
          receivedFrom: data.distribution?.receivedFrom || "",
          certifiedCorrect: data.distribution?.certifiedCorrect || "",
          submittedBy: data.distribution?.submittedBy || "",
          families: data.distribution?.families || []  // Fix: Access as object, not array
        });
        console.log("Distribution:", data);
      } catch (err) {
        console.error("Error fetching distribution data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (distributionId) {
      fetchDistribution();
    }
  }, [distributionId]);

  // Extract disaster date and formatted month
  const disasterDate = distributionData.disasterDate ? new Date(distributionData.disasterDate) : null;
  const formattedMonth = disasterDate ? disasterDate.toLocaleString("default", { month: "long" }) : "";

  const handleSaveDistribution = async () => {

    const confirmSubmit = window.confirm("Are you sure you want to submit this form?");
    if (!confirmSubmit) return;
    
    try {
      // Send only the updated families array to the backend to update their status
      const updatedFamilies = distributionData.families;
  
      const response = await axios.put(`http://192.168.1.127:3003/update-distribution/${distributionId}`, {
        families: updatedFamilies
      });
  
      if (response.status === 200) {
        alert("Distribution data saved successfully!");
        setIsUpdated(false);  // Reset the update flag after successful save
        window.location.reload()
      } else {
        alert("Failed to save distribution data.");
      }
    } catch (error) {
      console.error("Error saving distribution data:", error);
      alert("An error occurred while saving the data.");
    }
  };  
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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

        <p className="rds-text">We hereby acknowledge to have received from <strong>{distributionData.receivedFrom || "_____________________"}</strong> on the date indicated the kind and quality opposite our respective names.</p>

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
            {distributionData.families.length > 0 ? (
              distributionData.families.map((family, index) => (
                <tr key={family._id}>
                  <td>{family.familyHead || ""}</td>
                  <td>{family.rationCount || ""}</td>
                  <td>
                    <p>
                      {distributionData.reliefItems.map(item => `${item.name} - ${item.quantity}`).join(" | ")}
                    </p>
                  </td>
                  <td className="signature-cell">
                    {family.signature || signature[family._id] ? (
                      <img
                        src={family.signature || signature[family._id]} 
                        alt="Signature"
                        className="signature-image"
                      />
                    ) : (
                      <button
                        className="show-signature-button"
                        onClick={() => handleOpenModal(family)}
                      >
                        Signature/Thumbmark
                      </button>
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

        <p className="rds-text">I HEREBY CERTIFY on the data that according to the records of this office the persons whose names appear above are real and that the persons are the qualified recipients to whom I distributed the above goods.</p>

        <div className="rds-footer">
          <p>CERTIFIED CORRECT: <br/>
            <strong>{distributionData.certifiedCorrect || "_______________________________"}</strong>
          </p>
          <p>SUBMITTED BY: <br/>
            <strong>{distributionData.submittedBy || "_______________________________"}</strong>
          </p>  
        </div>

        {(isUpdated || !distributionData.families.every((family) => family.status === "Done")) && (
          <button className="save-btn" onClick={handleSaveDistribution}>
            Save Distribution Data
          </button>
        )}

      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Signature Pad">
        <SignaturePad family={selectedFamily} onSave={handleSaveSignature} onClose={handleCloseModal} />
      </Modal>

    </div>
  );
};

export default EditRDS;
