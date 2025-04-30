import React, { useEffect, useState } from "react";

import "../../css/forms/Payroll.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Payroll= ({ report}) => {

    console.log("report",report)

    const employees = [];

    report?.barangays?.forEach((barangay) => {
        barangay.affectedFamilies
        ?.filter((family) => family.dafacStatus === "Confirmed")
        ?.forEach((family) => {
            // Occupancy Check
            if (family.occupancy === "Renter" || family.occupancy === "Sharer") {
                employees.push({
                    name: `${family.firstName} ${family.middleName || ""} ${family.lastName}`.trim(),
                    category: family.occupancy === "Renter" ? "Renter" : "Sharer",
                    address: `${family.purok || ""}, ${barangay.name}`.trim() || "Unknown", // barangay.name
                    amount: 3500,
                });
            } else if (family.occupancy === "Owner") {
                let amount = 0;
                let category = family.extentDamage || "None";

                if (family.extentDamage?.toLowerCase() === "totally") {
                    amount = 10000;
                } else if (family.extentDamage?.toLowerCase() === "partially") {
                    amount = 5000;
                } else if (family.extentDamage?.toLowerCase() === "flooded") {
                    amount = 3000;
                }

                employees.push({
                    name: `${family.firstName} ${family.middleName || ""} ${family.lastName}`.trim(),
                    category,
                    address: `${family.purok || ""}, ${barangay.name}`.trim() || "Unknown",
                    amount,
                });
            }

            // Casualty Check (dead and injured)
            if (Array.isArray(family.casualty) && family.casualty.length > 0) {
                family.casualty.forEach((casualty) => {
                    if (casualty.type.toLowerCase() === "dead") {
                        casualty.names.forEach((name) => {
                            employees.push({
                                name: `${name}`.trim(),
                                category: "Casualty (Dead)",
                                address: `${family.purok || ""}, ${barangay.name}`.trim() || "Unknown",
                                amount: 10000,
                            });
                        });
                    } else if (casualty.type.toLowerCase() === "injured") {
                        casualty.names.forEach((name) => {
                            employees.push({
                                name: `${name}`.trim(),
                                category: "Injured",
                                address: `${family.purok || ""}, ${barangay.name}`.trim() || "Unknown",
                                amount: 3000,
                            });
                        });
                    }
                });
            }
        });
    });


    const maxRows = 15;
    const emptyRows = maxRows - employees.length;

    return (
        <div className="payroll">

            <div className="header">
                {/* Left Logo */}
                <div className="col">   
                
                        <div>
                            <h6>Period of Service</h6>
                        </div> 
                        <div>
                            <h6 className="col subtitle">Inclusive Dates</h6>
                        </div>
                
                </div>

                {/* Central Text */}
                <div className="col">
                        <div>
                            <h6><span className="underline">CITY OF ILIGAN</span> PAYROLL</h6>

                        </div> 
                        <div>
                            <h6 className="col subtitle">[Provincial, City or Municipal]</h6>
                        </div>
                </div>

                {/* Right Logo */}
                <div className="col">
                        <div>
                            <h6>Provincial Form No. 38[A]</h6>
                        </div> 
                        <div>
                            <h6>[Revised March, 1973]</h6>
                        </div>
                        <div>
                            <h6>Sheet No. ___________</h6>
                        </div>
                </div>
            </div>

                <h6 className="ack">We hereby acknowledge to have received from, ________________ treasurer of, ILIGAN CITY the sums herein specified opposite out respective names, the same being full compensation for our <br/> services rendered during the period stated below, to the correctness of which we hereby severally certify.</h6>
                
                <table className="payroll-table">
                    <thead>
                    <tr>
                        <th>No</th>
                        <th>NAME</th>
                        <th>Category</th>
                        <th>Address</th>
                        <th>TOTAL AMOUNT</th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th>AMOUNT DUE</th>
                        <th>SIGNATURE</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{emp.name}</td>
                                <td>{emp.category}</td>
                                <td>{emp.address}</td>
                                <td>{emp.amount.toLocaleString()}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>{emp.amount.toLocaleString()}</td>
                                <td></td>
                                <td>{index + 1}</td>
                            </tr>
                        ))}
                        {/* Add empty rows to ensure a total of 15 */}
                        {Array.from({ length: emptyRows }).map((_, index) => (
                            <tr key={`empty-${index}`}>
                                <td>{employees.length + index + 1}</td>
                                <td></td> 
                                <td></td> 
                                <td></td> 
                                <td></td> 
                                <td></td> 
                                <td></td> 
                                <td></td> 
                                <td></td> 
                                <td></td> 
                                <td></td> 
                                <td></td> 
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="4">TOTAL</td>
                            <td>{employees.reduce((sum, emp) => sum + emp.amount, 0).toLocaleString()}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>{employees.reduce((sum, emp) => sum + emp.amount, 0).toLocaleString()}</td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
                
            <div className="footer">
                <div className="col">   
                    <div>
                        <h6>[1] I HEREBY CERTIFY on my oficial oath that the above PAYROLL is correct, and that service above stated have been  duly rendered. Payment for such services is also hereby approved from the appropriation indicated.</h6>
                    </div> 
                </div>

                <div className="col approved">   
                    <div>
                        <h6>[4] APPROVED:</h6>
                    </div> 
                </div>

                <div className="col">   
                    <div>
                        <h6>[5] I HEREBY CERTIFY on my oficial oath that I have paid in cash to each official and employees whose name appears on the above roll the amount set opposite his name, under column 13, he having signed or marked his name under column 14 above, in my presence and at the time that payment was made to him, in acknowledgement of receipt oof the money amount to</h6>
                    </div> 
                </div>

            </div>

            <div className="footer">
                <div className="col yr">   
                    <div>
                        <h6 className="underline">     2019</h6>
                    </div> 
                </div>

                <div className="col asst">   
                    <div className="col sig">
                        <h6>EVELYN S. MADRIO</h6>
                        <h6>City Social Welfare Officer</h6>
                    </div> 
                </div>

                <div className="col">   
                    <div className="col sig">
                            <h6>FREDERICK W. SIAO</h6>
                            <h6>City Mayor</h6>
                    </div> 
                </div>

                <div className="col low">   
                    <div className="col sig low">
                        <h6 ></h6>
                        <h6 className="col signature">[Signature]</h6>
                    </div> 
                </div>

            </div>

            <div className="footer two">
                <div className="col">   
                    <div>
                        <h6>[2] APPROVED for payment subject to preaudit: </h6>
                    </div> 
                </div>

                <div className="col two">   
                    <div>
                        <h6>____________________________, 2019 ________________________</h6>

                    </div> 
                </div>
            </div>

            <div className="footer three">
                <div className="col yr">   
                    <div>
                        <h6>______, 2019</h6>
                    </div> 
                </div>

                <div className="col asst">   
                    <div className="col sig">
                        <h6>JASON JOHN V. ALEGARME</h6>
                        <h6>Assistant City Accountant</h6>
                    </div> 
                </div>

                <div className="col atty">   
                    <div className="col sig">
                            <h6>ATTY. LAURENTINO P. BADELLED CPA, MDM</h6>
                            <h6>City Treasurer</h6>
                    </div> 
                </div>

                <div className="col hereby">   
                    <div>
                        <h6>[6] I HEREBY CERTIFY on my official oath that each employee whose name appears on the above roll has been paid in cash or in check, and in no other mode, the amount shown under column 13 above, opposite his name. The total of the payments made by means this payroll amounts to </h6>
                        <h6>........................................</h6>
                    </div> 
                </div>

            </div>

            <div className="footer two">
                <div className="col">   
                    <div>
                        <h6>[3]Preaudit and approved for payment in the month of</h6>
                        <h6>______________________ [P ........................] pesos only</h6>
                    </div> 
                </div>

                <div className="col three">   
                    <div>
                        <h6>____________________________, [P_____________________] pesos only.</h6>
                        <div className="col sigb">
                            <h6>  __________________________________</h6>
                            <h6 className="signature">[Signature]</h6>
                        </div>
                    </div> 
                </div>
            </div>

            <div className="footer">
                <div className="col year">   
                    <div>
                        <h6>___________, 2019 __________________________________</h6>
                    </div> 
                </div>

                <div className="col ">   
                    <div >
                        <h6 >________________, 2019 </h6>
                    </div> 
                </div>
            </div>


           
        </div>
    );
};

export default Payroll;