import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/forms/RDS.css";
import ICImage from '../../pic/IC.png';
import cswdImage from '../../pic/cswd.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';

const RDS= () => {
  const [families, setFamilies] = useState([]);
  const barangay= "Tibanga";
  const disasterId= "D1-02202025";

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const response = await axios.get("http://localhost:3003/get-disasters");
        const disasterData = response.data;
  
        // Find the disaster matching the given disasterId
        const selectedDisaster = disasterData.find(d => d.disasterCode === disasterId);
        if (!selectedDisaster) {
          console.error("Disaster not found.");
          return;
        }
  
        // Find barangay data
        const selectedBarangay = selectedDisaster.barangays.find(b => b.name === barangay);
        if (!selectedBarangay) {
          console.error("Barangay not found.");
          return;
        }
  
        // Set affected families
        setFamilies(selectedBarangay.affectedFamilies || []);
  
      } catch (error) {
        console.error("Error fetching disasters data:", error);
      }
    };
  
    fetchFamilies();
  }, []);
  

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
                <h2 className="light">Month: ____________</h2>
            </div>

            {/* Right Logo */}
            <div className="header-logo">
                <img src={cswdImage} alt="Logo" />
            </div>
        </div>
    
        <div className= "sheet-title">
            <h2>RELIEF DISTRIBUTION SHEET</h2>
        </div>
        

        <p className="rds-text">We hereby acknowledge to have received from _______________ on the date indicated the kind and quality opposite our respective names.</p>


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
                  <td>_________</td>
                  <td>_________</td>
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
            _________________________</p>
        


            <p>SUBMITTED BY <br/>
            _________________________</p>  
        </div>
            

      </div>

    </div>
  );
};

export default RDS;
