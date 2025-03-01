import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; 
import axios from "axios";
import "../../css/forms/RDS.css";
import ICImage from '../../pic/IC.png';
import cswdImage from '../../pic/cswd.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';


const EditRDS = () => {
  const navigate = useNavigate();  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [families, setFamilies] = useState([]);
  const [distributionId, setDistributionId] = useState("");

  useEffect(() => {
    const storedId = localStorage.getItem("distributionId");
    if (storedId) {
      setDistributionId(storedId);
      console.log("distributionId updated from localStorage:", storedId);
    }
  }, []);

  const [distributionData, setDistributionData] = useState({
    disasterCode: "",
    disasterDate: "",
    barangayName: "",
    distribution: [],
    receivedFrom: "",
    certifiedCorrect: "",
    submittedBy: ""
  });

  // Fetch distribution data
  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        console.log(distributionId);
        const response = await axios.get(`http://localhost:3003/get-distribution/${distributionId}`);
        setDistributionData(prev => ({
          ...prev,
          ...response.data
        }));
        console.log("Distribution:", response.data);
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

  // Handle input change for editable fields
  const handleInputChange = (event, index) => {
    const { name, value } = event.target;
    setFamilies(prevFamilies => prevFamilies.map((family, i) =>
      i === index ? { ...family, [name]: value } : family
    ));
  };

  // Handle input change for relief items
  const handleReliefItemChange = (index, field, value) => {
    const updatedDistribution = [...distributionData.distribution];
    updatedDistribution[index][field] = value;
    setDistributionData(prev => ({ ...prev, distribution: updatedDistribution }));
  };

  // Save distribution data
  const handleSaveDistribution = async () => {
    try {
      await axios.post("http://localhost:3003/save-distribution", {
        disasterCode: distributionData.disasterCode,
        disasterDate: distributionData.disasterDate,
        barangay: distributionData.barangayName,
        reliefItems: distributionData.distribution,
        families: families.map(family => ({
          familyHead: `${family.firstName} ${family.middleName || ""} ${family.lastName}`,
          status: family.status || "Pending",
          rationCount: 1 + (family.dependents ? family.dependents.length : 0),
        })),
        receivedFrom: distributionData.receivedFrom,
        certifiedCorrect: distributionData.certifiedCorrect,
        submittedBy: distributionData.submittedBy
      });

      alert("Distribution data saved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving distribution data:", error);
      alert("Failed to save distribution data.");
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
            {distributionData?.distribution?.length > 0 ? (
              distributionData.distribution.map((distribution, index) => (
                <tr key={distribution._id}>
                  <td>{distribution.familyHead || ""}</td>
                  <td>{distribution.rationCount || ""}</td>
                  <td>
                    <p>
                      {distribution.reliefItems.map(item => `${item.name} - ${item.quantity}`).join(" | ")}
                    </p>
                  </td>
                  <td>
                    <button>
                      Signature/Thumbmark
                    </button>
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

        <button className="save-btn" onClick={handleSaveDistribution}>
          Save Distribution Data
        </button>
      </div>
    </div>
  );
};

export default EditRDS;
