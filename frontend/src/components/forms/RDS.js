import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; 
import axios from "axios";
import CryptoJS from "crypto-js";
import "../../css/forms/RDS.css";
import ICImage from '../../pic/IC.png';
import cswdImage from '../../pic/cswd.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';

const RDS= () => {
  const navigate = useNavigate();  
  const [families, setFamilies] = useState([]);
  const [decryptedImages, setDecryptedImages] = useState({});
  const [forDistribution, setForDistribution] = useState(() => {
    const storedData = localStorage.getItem("forDistribution");
    return storedData ? JSON.parse(storedData) : {
      disasterCode: "",
      disasterDate:"",
      barangay: "",
      entries: [{ name: "", quantity: "" }],
      receivedFrom: "",
      certifiedCorrect: "",
      submittedBy: "",
    };
  });

  const disasterDate = new Date(forDistribution.disasterDate);
  const formattedMonth = disasterDate.toLocaleString("default", { month: "long" }); 

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const response = await axios.get("http://localhost:3003/get-disasters");
        const disasterData = response.data;
  
        // Find the disaster matching the given disasterId
        const selectedDisaster = disasterData.find(d => d.disasterCode === forDistribution.disasterCode);
        if (!selectedDisaster) {
          console.error("Disaster not found.");
          return;
        }
  
        // Find barangay data
        const selectedBarangay = selectedDisaster.barangays.find(b => b.name === forDistribution.barangay);
        if (!selectedBarangay) {
          console.error("Barangay not found.");
          return;
        }
  
        // Set affected families
        let affectedFamilies = selectedBarangay.affectedFamilies || [];

        // Fetch esig for each family head
        const familiesWithStatus = await Promise.all(
          affectedFamilies.map(async (family) => {
            try {
              const res = await axios.get(`http://localhost:3003/get-resident-esig?firstName=${family.firstName}&middleName=${family.middleName || ""}&lastName=${family.lastName}`);
              return { ...family, status: "Pending", esig: res.data.esig };
            } catch (error) {
              console.error(`Error fetching e-signature for ${family.firstName} ${family.lastName}:`, error);
              return { ...family, status: "Pending", esig: "" }; // Default to Pending
            }
          })
        );
        
        setFamilies(familiesWithStatus);
  
      } catch (error) {
        console.error("Error fetching disasters data:", error);
      }
    };
  
    fetchFamilies();
  }, []);

  const handleDecryptEsig = (encryptedEsig, index) => {
    const password = prompt("Enter password to decrypt the thumbmark:");
    if (!password) {
      alert("Password is required!");
      return;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedEsig, password);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedData) {
        alert("Incorrect password!");
        return;
      }

      setFamilies((prevFamilies) => 
        prevFamilies.map((family, i) =>
          i === index ? { ...family, status: "Done" } : family
        )
      );
  
      setDecryptedImages((prev) => ({
        ...prev,
        [index]: decryptedData,
      }));
    } catch (error) {
      alert("Decryption failed! Check the password.");
      console.error(error);
    }
  };

  

  const handleSaveDistribution = async () => {
    try {
      await axios.post("http://localhost:3003/save-distribution", {
        disasterCode: forDistribution.disasterCode,
        disasterDate: forDistribution.disasterDate,
        barangay: forDistribution.barangay,
        reliefItems: forDistribution.entries,
        families: families.map(family => ({
          familyHead: `${family.firstName} ${family.middleName} ${family.lastName}`,
          status: family.status,  
          rationCount: 1 + (family.dependents ? family.dependents.length : 0),
      })),
        status: "Pending",
        receivedFrom: forDistribution.receivedFrom,
        certifiedCorrect: forDistribution.certifiedCorrect,
        submittedBy: forDistribution.submittedBy
      });
  
      alert("Distribution data saved successfully!");
      localStorage.removeItem("forDistribution");
      window.location.reload()
    } catch (error) {
      console.error("Error saving distribution data:", error);
      alert("Failed to save distribution data.");
    }
  };
  

  

  return (
    <div className="rds">
    
      <div className="rds-container">

        <div className="rds-header">
            {/* Left Logo */}
            <div className="header-logo">   
                <img src={ICImage} alt="Logo" />
            </div>

            {/* Central Text */}
            <div className="text-center">
                <h2 className="title">REPUBLIC OF THE PHILIPPINES</h2>
                <h2 className="bold">CITY OF ILIGAN</h2>
                <h2 className="italic-bold">
                    Office of the City Social Welfare and Development Officer
                </h2>
                <h2 className="light">Telefax No. 063-221-2488</h2>
                <h2 className="semi-bold">BUREAU OF ASSISTANCE</h2>
                <h2 className="light">Region Office No. X</h2>
                <h2 className="light">Province of Lanao del Norte</h2>
                <h2 className="light">Month: {formattedMonth}</h2>
            </div>

            {/* Right Logo */}
            <div className="header-logo">
                <img src={cswdImage} alt="Logo" />
            </div>
        </div>
    
        <div className= "sheet-title">
            <h2>RELIEF DISTRIBUTION SHEET</h2>
        </div>
        

        <p className="rds-text">We hereby acknowledge to have received from <strong>{forDistribution.receivedFrom || "_____________________"}</strong> on the date indicated the kind and quality opposite our respective names.</p>


        <table className="rds-table">
              <thead>
                <tr>
                  <th>Name of Family Head</th>
                  <th>No. of series of person Ration</th>
                  <th>Kind Source, Qty. of relief goods received</th>
                  <th>Signature or Thumb mark of recipient</th>

                </tr>
              </thead>
              <tbody>

              {families.length > 0 ? (
              families.map((family, index) => (
                <tr key={index}>
                  <td>{`${family.firstName} ${family.middleName || ""} ${family.lastName}`.trim()}</td>
                  <td>{family.dependents.length + 1}</td>
                  <td>
                      <p>
                        {forDistribution.entries.map(entry => `${entry.name} - ${entry.quantity}`).join(" | ")}
                      </p>
                  </td>
                  <td>
                    {decryptedImages[index] ? (
                      <img
                        src={decryptedImages[index]}
                        alt="Thumbmark"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "contain",
                          border: "1px solid #ccc",
                        }}
                      />
                    ) : (
                      <button onClick={() => handleDecryptEsig(family.esig, index)}>
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

          <p className="rds-text">       I HEREBY CERTIFY on the data that according to the records of this office the persons whose names appear above are real and that the persons are the qualified recipients to whom i distributed the above goods.</p>

        <div className="rds-footer">
            <p>CERTIFIED CORRECT: <br/>
            <strong> {forDistribution.certifiedCorrect || "_______________________________"}</strong></p>
        


            <p>SUBMITTED BY <br/>
            <strong> {forDistribution.submittedBy || "______________________________"}</strong></p>  
        </div>
            
        <button className="save-btn" onClick={handleSaveDistribution}>
            Save Distribution Data
        </button>


      </div>

    </div>
  );
};

export default RDS;
