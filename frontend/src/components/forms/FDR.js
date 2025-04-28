import React, { useEffect, useState } from "react";

import "../../css/forms/FDR.css";
import ICImage from '../../pic/IC.png';
import cswdImage from '../../pic/cswd.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';

const FDR= ({ report, distribution }) => {

    console.log("FDR ditribution: ", distribution)
    console.log("Report: ", report)

    const [totalDependents, setTotalDependents] = useState(0);
    const [totalPersonsAffected, setTotalPersonsAffected] = useState(0);
    const [totalCostDamage, setTotalCostDamage] = useState(0);
    const [evacuation, setEvacuation] = useState("");
    const [totalAssistance, setTotalAssistance] = useState(0);
    const [totalEstimatedCost, setTotalEstimatedCost] = useState(0);
  
    useEffect(() => {
        if (!report?.barangays || report.barangays.length === 0) return;
      
        let totalDependents = 0;
        let totalPersonsAffected = 0;
        let totalCostDamage = 0;
        let evacuation = "";
      
        // Loop through each barangay
        report.barangays.forEach(barangay => {
          // Loop through affected families in the barangay
          barangay.affectedFamilies.forEach(family => {
            totalDependents += family.dependents?.length || 0;
            totalPersonsAffected += 1 + (family.dependents?.length || 0); // 1 for the main person + dependents
            totalCostDamage += family.costDamage || 0;
      
            // If we want to pick the evacuation from each family (e.g., last one overwrites)
            evacuation = family.evacuation;
          });
        });
      
        setEvacuation(evacuation);
        setTotalDependents(totalDependents);
        setTotalPersonsAffected(totalPersonsAffected);
        setTotalCostDamage(totalCostDamage);
      }, [report]);      

    const barangays = distribution?.[0]?.barangays ?? [];
    
      useEffect(() => {
        let assistanceTotal = 0;
        let estimatedCostTotal = 0;
      
        barangays.forEach((barangay) => {
          barangay.distribution.forEach((dist) => {
            dist.reliefItems.forEach((reliefItem) => {
              const assistancePerFamily = (reliefItem.quantity ?? 0) * (reliefItem.assistanceCost ?? 0);
              const affectedFamilies = dist.families?.length ?? 0;
              const estimatedCost = assistancePerFamily * affectedFamilies;
      
              assistanceTotal += assistancePerFamily;
              estimatedCostTotal += estimatedCost;
            });
          });
        });
      
        setTotalAssistance(assistanceTotal);
        setTotalEstimatedCost(estimatedCostTotal);
      }, [distribution]);
  

  return (
    <div className="fdr">

      <div className="fdr-container">

        <div className="header">
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

                <div className= "sheet-title">
                    <h2>SPORADIC Report</h2>
                </div>
            </div>

            {/* Right Logo */}
            <div className="header-logo">
                <img src={cswdImage} alt="Logo" />
            </div>
        </div>

        <div className="upper-area">

            <div className="row">
                <div className="col1">
                    <p>Type of Calamity</p>
                </div>

                <div className="col1">
                    <p>{report.type}</p>
                </div>
            </div>

            <div className="row">
                <div className="col1">
                    <p>Date/Time Occurrence</p>
                </div>

                <div className="col1">
                    <p>{report.date}</p>
                </div>
            </div>

            <div className="row">
                <div className="col1">
                    <p>Evacuation Camp</p>
                </div>

                <div className="col1">
                    <p>{evacuation}</p>
                </div>
            </div>

            <div className="row">
                <div className="col1">
                    <p>No. of Families Affected</p>
                </div>

                <div className="col1">
                    <p>{report.households} Family/Families</p>
                </div>
            </div>

            <div className="row">
                <div className="col1">
                    <p>No. of Dependents</p>
                </div>

                <div className="col1">
                    <p>{totalDependents} Dependents</p>
                </div>
            </div>

            <div className="row">

                <div className="col1">
                    <p>total No. of Persons Affected</p>
                </div>

                <div className="col1">
                    <p>{totalPersonsAffected} Persons</p>
                </div>
                
            </div>

            <div className="row">

                <div className="col1">
                    <p>Estimated Cost of Damaged </p>
                </div>

                <div className="col1">
                    <p>P{totalCostDamage}</p>
                </div>
                
            </div>

        </div>

        <div className="reco">
            <p className="no-margin">Assistance Extended </p>
            <div className="neym"> 
                <p className="no-margin">Food from LGU through DRMMO and Barangay (Cooked food-- community kitchen)</p>
            </div>
            
        </div>

        <div className="table-container1">
            <h5 className="no-margin">Immediate Food Assistance From CSWD: </h5>
            <table className="ifa">
            <thead>
                <tr>
                <th>Name of Agency</th>
                <th>Type of Relief Assistance</th>
                <th>Quantity</th>
                <th>Assistance per Family</th>
                <th>Estimated Cost</th>
                </tr>
            </thead>
            <tbody>
                {barangays.map((barangay) =>
                    barangay.distribution.map((dist, distIndex) => (
                        <React.Fragment key={dist._id}>
                            {dist.reliefItems.map((reliefItem, subIndex) => {
                                const assistancePerFamily = (reliefItem.quantity ?? 0) * (reliefItem.assistanceCost ?? 0);
                                const affectedFamilies = dist.families?.length ?? 0;
                                const estimatedCost = assistancePerFamily * affectedFamilies;

                                return (
                                    <tr key={reliefItem?._id}>
                                        {subIndex === 0 && (
                                            <>
                                                <td rowSpan={dist.reliefItems.length}>{dist.receivedFrom}</td>
                                                <td rowSpan={dist.reliefItems.length}>{dist.assistanceType}</td>
                                            </>
                                        )}
                                        <td>{reliefItem?.quantity ?? "N/A"} {reliefItem?.name ?? "N/A"} @ ₱{(reliefItem?.assistanceCost ?? 0).toLocaleString()}</td>
                                        <td>₱{assistancePerFamily.toLocaleString()}</td>
                                        <td>₱{assistancePerFamily.toLocaleString()} x {dist.families.length}= ₱{estimatedCost.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </React.Fragment>
                    ))
                )}
                <tr>
                    <td colSpan="3" style={{ textAlign: "right" }}>TOTAL</td>
                    <td>₱{totalAssistance.toLocaleString()}</td>
                    <td>₱{totalEstimatedCost.toLocaleString()}</td>
                </tr>

            </tbody>
            </table>
        </div>
        
        <div className="footer">

            <div>
                <p>Prepared by</p>

                <div className="neym">
                    <h4 className="no-margin">MARGIE RIZA ANN C. AMARGA</h4>
                    <p className="no-margin">Social Welfare Officer 1</p>
                    <p className="no-margin">Emergency Welfare Program Supervisor</p>
                </div>

            </div>

            <div>
                <p>Recommending Approval:</p>

                <div className="neym">
                    <h4 className="no-margin">EVELYN S. MADRIO</h4>
                    <p className="no-margin">City Gov't. Department Head II</p>
                    <p className="no-margin">CSWDO</p>
                </div>
            </div>
            

            <div>
                <p>Approved by</p>

                <div className="neym">
                    <h4 className="no-margin">FREDERICK W. SIAO</h4>
                    <p className="no-margin">City Mayor</p>
                </div>
            </div>

        </div>

      </div>

    </div>
  );
};

export default FDR;
