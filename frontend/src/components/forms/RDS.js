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
import Notification from "../again/Notif";
import ConfirmationDialog from "../again/Confirmation";

const RDS= () => {
  const navigate = useNavigate();  
  const [families, setFamilies] = useState([]);
  const [decryptedImages, setDecryptedImages] = useState({});

 const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFamilyIndex, setSelectedFamilyIndex] = useState(null);
  //const [selectedFamilyName, setSelectedFamilyName] = useState("");
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [signature, setSignature] = useState({});

  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    type: "",       // 'save', 'delete', 'add'
    title: "",
    message: "",
    onConfirm: null,
  });

  const handleCancelConfirm = () => {
    setConfirmDialog({ ...confirmDialog, show: false });
  };

  const handleOpenModal = (family) => {
    //setSelectedFamilyIndex(index);
    setSelectedFamily(family);
    setIsModalOpen(true);
  };

  const handleSaveSignature = (signatureData) => {
    if (!selectedFamily || !selectedFamily._id) return; 

    //console.log("Signature Image URL fo Database:", signatureData);
  
    setFamilies((prevFamilies) => 
      prevFamilies.map((family) => 
        family._id === selectedFamily._id ? { ...family, signature: signatureData, status: "Done" } : family
      )
    );
  
    handleCloseModal(); // Close modal automatically
  };  

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


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

      let disasterData=[];

      if (navigator.onLine){
        const response = await axios.get("http://localhost:3003/get-disasters");
        disasterData = response.data;
      }else{
        const localData = localStorage.getItem("disasters");
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            disasterData = parsed;
          } catch (e) {
            console.error("Failed to parse local disasters data", e);
          }
        }
      }
      try {
  
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
        
        setFamilies(affectedFamilies);
  
      } catch (error) {
        console.error("Error fetching disasters data:", error);
      }
    };
  
    fetchFamilies();
  }, []);

  useEffect(() => {
    families.forEach(family => {
      console.log(family.signature);
    });
  }, [families]);

  const handleSaveDistribution = async () => {
    setConfirmDialog({
      show: true,
      type: "confirm",
      title: "Submit Form",
      message: "Are you sure you want to submit this form?",
      onConfirm: async() =>{
        const payload = {
          disasterCode: forDistribution.disasterCode,
          disasterDate: forDistribution.disasterDate,
          barangay: forDistribution.barangay,
          assistanceType: forDistribution.assistanceType,
          reliefItems: forDistribution.entries,
          families: families.map(family => ({
            familyHead: `${family.firstName} ${family.middleName} ${family.lastName}`,
            memId: family.id,
            status: family.status || "Pending",
            rationCount: 1 + (family.dependents ? family.dependents.length : 0),
            signature: family.signature || "",
          })),
          status: "Pending",
          receivedFrom: forDistribution.receivedFrom,
          certifiedCorrect: forDistribution.certifiedCorrect,
          submittedBy: forDistribution.submittedBy,
        };
      
        if (navigator.onLine) {
    
          //console.log(payload)
          try {
            await axios.post("http://localhost:3003/save-distribution", payload);
            setNotification({ type: "success", title: "Save Successful", message: "Distribution data saved successfully!" });
            setTimeout(() => setNotification(null), 3000);
    
            localStorage.removeItem("forDistribution");
            window.location.reload();
          } catch (error) {
            console.error("Error saving distribution data:", error);
            setNotification({ type: "error", title: "Save Error", message: "Failed to save distribution data." });
            setTimeout(() => setNotification(null), 3000);
          }
        } else {
    
          const distributionId = `dist-${Date.now()}`;
    
          // Add the ID to the payload
          const payloadWithId = {
            ...payload,
            distributionId,
          };
          // Offline fallback: save to localStorage
          const offlineDistributions = JSON.parse(localStorage.getItem("offlineDistributions") || "[]");
          offlineDistributions.push(payloadWithId);
          localStorage.setItem("offlineDistributions", JSON.stringify(offlineDistributions));
          localStorage.removeItem("forDistribution");
          window.location.reload();
      
          setNotification({ type: "info", title: "Offline Mode", message: "You are offline. Data saved locally and will be submitted when online." });
          setTimeout(() => setNotification(null), 3000);
        }
      }
    })

  };

  return (
    <div className="rds">
    
      <div className="rds-container">

      {notification && (
        <Notification
          type={notification.type}
          title={notification.title} 
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

        {confirmDialog.show && (
            <ConfirmationDialog
              type={confirmDialog.type}
              title={confirmDialog.title}
              message={confirmDialog.message}
              onConfirm={confirmDialog.onConfirm}
              onCancel={handleCancelConfirm}
            />
          )}

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
                  <td className="signature-cell">
                    {family.signature ? (
                      <img
                        src={family.signature}
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Signature Pad">
        <SignaturePad family={selectedFamily} onSave={handleSaveSignature} onClose={handleCloseModal} />
      </Modal>

    </div>
  );
};

export default RDS;
