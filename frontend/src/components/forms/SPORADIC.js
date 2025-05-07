import React, { useEffect, useState } from "react";
import "../../css/forms/SPORADIC.css";
import ICImage from '../../pic/IC.png';
import cswdImage from '../../pic/cswd.jpg';
import '@fortawesome/fontawesome-free/css/all.min.css';

const SPORADIC = ({ report, distribution }) => {
    const [totalAssistance, setTotalAssistance] = useState(0);
    const [totalEstimatedCost, setTotalEstimatedCost] = useState(0);
    //console.log("Families", report);
    //console.log("Distribution", distribution);

    // Extract barangays array from the distribution prop
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

    // Function to categorize families based on certain criteria
    const categorizeFamily = (family, barangayName) => {
        let category = family.extentDamage || "None";
        let amount = 0;

        // Categorize based on occupancy
        if (family.occupancy === "Renter" || family.occupancy === "Sharer") {
            category = family.occupancy === "Renter" ? "Renter" : "Sharer";
            amount = 3500;
        } else if (family.occupancy === "Owner") {
            if (family.extentDamage?.toLowerCase() === "totally") {
                amount = 10000;
            } else if (family.extentDamage?.toLowerCase() === "partially") {
                amount = 5000;
            } else if (family.extentDamage?.toLowerCase() === "flooded") {
                amount = 3000;
            }
        }

        // Casualty check for dead and injured
        const casualties = [];
        if (Array.isArray(family.casualty) && family.casualty.length > 0) {
            family.casualty.forEach((casualty) => {
                if (casualty.type.toLowerCase() === "dead") {
                    casualty.names.forEach((name) => {
                        casualties.push({
                            name: `${name}`.trim(),
                            category: "Casualty (Dead)",
                            address: `${family.purok || ""}, ${barangayName}`.trim() || "Unknown",
                            amount: 10000,
                        });
                    });
                } else if (casualty.type.toLowerCase() === "injured") {
                    casualty.names.forEach((name) => {
                        casualties.push({
                            name: `${name}`.trim(),
                            category: "Injured",
                            address: `${family.purok || ""}, ${barangayName}`.trim() || "Unknown",
                            amount: 3000,
                        });
                    });
                }
            });
        }

        return {
            name: `${family.firstName} ${family.middleName || ""} ${family.lastName}`.trim(),
            category,
            address: `${family.purok || ""}, ${barangayName}`.trim() || "Unknown",
            amount,
            casualties, // Add casualties to the return value
        };
    };
    let index=1;
    return (
        <div className="sporadic">
            <div className="sporadic-container">
                <div className="header">
                    <div className="header-logo">
                        <img src={ICImage} alt="Logo" />
                    </div>
                    <div className="text-center">
                        <h2 className="title">REPUBLIC OF THE PHILIPPINES</h2>
                        <h2 className="bold">CITY OF ILIGAN</h2>
                        <h2 className="italic-bold">Office of the City Social Welfare and Development Officer</h2>
                        <div className="sheet-title">
                            <h2>SPORADIC Report</h2>
                        </div>
                    </div>
                    <div className="header-logo">
                        <img src={cswdImage} alt="Logo" />
                    </div>
                </div>
                
                <div className="table-container">
                    <table border="1" id="yourTableID" className="sporadic-report">
                        <thead>
                            <tr>
                                <th rowSpan="2">No.</th>
                                <th rowSpan="2">Name</th>
                                <th rowSpan="2">Age</th>
                                <th rowSpan="2">Sex</th>
                                <th rowSpan="2">Brgy. Address</th>
                                <th rowSpan="2">No. of Dependents</th>
                                <th rowSpan="2">Type of Calamity</th>
                                <th rowSpan="2">Date of Calamity</th>
                                <th rowSpan="2">Category</th>
                                <th colSpan="5">Sectoral</th>
                                <th rowSpan="2">Livelihood</th>
                            </tr>
                            <tr>
                                <th>Senior Citizen</th>
                                <th>PWD</th>
                                <th>Solo Parent</th>
                                <th>Pregnant</th>
                                <th>Lactating Mothers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report?.barangays?.map((barangay, barangayIndex) => (
                                barangay?.affectedFamilies?.map((family, familyIndex) => {
                                    const categorizedFamily = categorizeFamily(family, barangay.name);

                                    // Start with displaying the basic family details
                                    return (
                                        <React.Fragment key={`${barangayIndex}-${familyIndex}`}>
                                            <tr>
                                                <td>{index++}</td>
                                                <td>{categorizedFamily.name}</td>
                                                <td>{family.age}</td>
                                                <td>{family.sex}</td>
                                                <td>{barangay.name || "N/A"}</td>
                                                <td>{family.dependents?.length || 0}</td>
                                                <td>{report.type}</td>
                                                <td>{report.date}</td>
                                                <td>{categorizedFamily.category}</td>
                                                <td>{family.isSenior ? "Yes" : "No"}</td>
                                                <td>{family.isPWD ? "Yes" : "No"}</td>
                                                <td>{family.isSolo ? "Yes" : "No"}</td>
                                                <td>{family.isPreg ? "Yes" : "No"}</td>
                                                <td>{family.isIps ? "Yes" : "No"}</td>
                                                <td>{family.occupation || "N/A"}</td>
                                            </tr>
                                            
                                            {/* Loop through casualties and display them as separate rows */}
                                            {categorizedFamily.casualties.map((casualty, casualtyIndex) => (
                                                <tr key={`${familyIndex}-casualty-${casualtyIndex}`}>
                                                    <td>{index-1}.{casualtyIndex + 1}</td>
                                                    <td>{casualty.name}</td>
                                                    <td>-</td> {/* No age for casualty */}
                                                    <td>-</td> {/* No sex for casualty */}
                                                    <td>{casualty.address}</td>
                                                    <td>-</td> {/* No dependents for casualty */}
                                                    <td>{report.type}</td>
                                                    <td>{report.date}</td>
                                                    <td>{casualty.category}</td>
                                                    <td>-</td> {/* No sectoral data for casualty */}
                                                    <td>-</td>
                                                    <td>-</td>
                                                    <td>-</td>
                                                    <td>-</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })
                            ))}
                        </tbody>
                    </table>
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

                <div className="reco">
                    <p className="no-margin">Recommendation: </p>
                    <div className="neym">
                        <p className="no-margin">Financial Assistance from CSWD</p>
                    </div>
                </div>

                <div className="footer">
                    <div className="one">
                        <p>Prepared by</p>
                        <div className="neym">
                            <h4 className="no-margin">MARGIE RIZA ANN C. AMARGA</h4>
                            <p className="no-margin">Social Welfare Officer 1</p>
                            <p className="no-margin">Emergency Welfare Program Supervisor</p>
                        </div>
                    </div>

                    <div className="two">
                        <p>Recommending Approval:</p>
                        <div className="neym">
                            <h4 className="no-margin">LILY M. BERSAMIN</h4>
                            <p className="no-margin">City Social Welfare & Development Officer</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SPORADIC;
