const Step1 = (
        
    <form className="add-form">

        <div className="add-form-h2">
            <h2>Disaster Information</h2>
        </div>
        
        <div className="dstr-rows">

            <div className="dstr-cols1">
                <div className="dstr-image-container">
                    <img src={DstrGif} alt="Disaster Animation" className="gif-image" />
                
                    <div className="ad-text-overlay">
                        <h2>Stay Prepared!</h2>
                        <p>Always be ready for the unexpected.</p>
                    </div>
                </div>
            </div>

            <div className="dstr-cols2">

                <div className="dstr-pop-form">
                    <div className="dstr-form-group">
                        <div className="dstr-input-group">
                            <span className="icon"><i className="fa-solid fa-hurricane"></i></span>
                            
                            <select 
                                id="disaster-select" value={disasterType}
                                onChange={handleDisasterTypeChange} required 
                            >

                            <option value="" disabled selected>Disaster Type</option>
                            <option value="Typhoon">Typhoon</option>
                            <option value="Fire Incident">Fire Incident</option>
                            <option value="Earthquake">Earthquake</option>
                            <option value="Flood">Flood</option>
                            <option value="Landslide">Landslide</option>

                            </select>
                        </div>
                    </div>

                    <div className="dstr-form-group">
                        <div className="dstr-input-group">
                            <span className="icon"><i className="fa-regular fa-calendar-days"></i></span>
                            
                            <input 
                                type="date" placeholder="Date" value={date}
                                onChange={handleDateChange} required 
                            />
                        </div>
                    </div>
                </div>

                <div className="dstr-pop-form1">

                    <div className="dstr-form-group">
                    
                        <div className="ig">
                            <span className="icon"><i className="fa-solid fa-location-dot"></i></span>
                            <label  htmlFor="barangay-select">Barangay (Affected Areas)</label>
                        </div>

                        <div className="bgy-input-group">
                            <div className="checkbox-group">
                                {[
                                'Abuno', 'Acmac-Mariano Badelles Sr.', 'Bagong Silang', 'Bonbonon', 'Bunawan', 'Buru-un', 'Dalipuga', 
                                'Del Carmen', 'Digkilaan', 'Ditucalan', 'Dulag', 'Hinaplanon', 'Hindang', 'Kabacsanan', 'Kalilangan', 
                                'Kiwalan', 'Lanipao', 'Luinab', 'Mahayahay', 'Mainit', 'Mandulog', 'Maria Cristina', 'Pala-o', 
                                'Panoroganan', 'Poblacion', 'Puga-an', 'Rogongon', 'San Miguel', 'San Roque', 'Santa Elena', 
                                'Santa Filomena', 'Santiago', 'Santo Rosario', 'Saray', 'Suarez', 'Tambacan', 'Tibanga', 'Tipanoy', 
                                'Tomas L. Cabili (Tominobo Proper)', 'Upper Tominobo', 'Tubod', 'Ubaldo Laya', 'Upper Hinaplanon', 
                                'Villa Verde'
                                ].map((barangay) => (
                                <div key={barangay} className="checkbox-item">
                                    <input
                                    type="checkbox"
                                    id={barangay.replace(/\s+/g, '-').toLowerCase()}
                                    name="barangay"
                                    value={barangay}
                                    checked={selectedBarangays.includes(barangay)} // Check if barangay is selected
                                    onChange={handleCheckboxChange} // Handle change
                                    />
                                    <label htmlFor={barangay.replace(/\s+/g, '-').toLowerCase()}>{barangay}</label>
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <div className="dstr-btn">
                    <button type="submit" className="dstr-submit-btn" onClick={handleNextClick}>
                    Next
                    </button>
                </div>

            </div>
        </div>
    
    </form> 


);

 //modified
 const handleFinalSubmit = async () => {
    // Retrieve disasterData and residentData from localStorage
    const disasterData = JSON.parse(localStorage.getItem("disasterData")) || null;
    const residentData = JSON.parse(localStorage.getItem("residentData")) || [];

    if (!disasterData || residentData.length === 0) {
        alert("No data found in localStorage to save.");
        return;
    }

    try {

        // Extract other disaster-related fields from disasterData
        const { disasterCode, disasterType, date } = disasterData;




        // Group residentData by Barangay
        const groupedByBarangay = residentData.reduce((acc, resident) => {
            const barangay = resident.brgy || "Unknown Barangay";
            if (!acc[barangay]) {
                acc[barangay] = [];
            }
            acc[barangay].push(resident);
            return acc;
        }, {});


        // Loop through each barangay and save its data
        for (const barangayName in groupedByBarangay) {
            const barangayResidents = groupedByBarangay[barangayName];

            // Calculate summary information for this barangay
            let affectedFamilies = barangayResidents.length;
            let affectedPersons = 0;
            let familiesInEC = 0;
            let sexBreakdown = { male: 0, female: 0 };
            let pregnantWomen = 0;
            let lactatingMothers = 0;
            let pwds = 0;
            let soloParents = 0;
            let indigenousPeoples = 0;
            let assistanceNeeded = [];
            let contact = `09${Math.floor(100000000 + Math.random() * 900000000)}`; // Generate random contact number

            barangayResidents.forEach((resident) => {
                affectedPersons += resident.sexBreakdown.male + resident.sexBreakdown.female;
                sexBreakdown.male += resident.sexBreakdown.male || 0;
                sexBreakdown.female += resident.sexBreakdown.female || 0;
                if (resident.familiesInsideECs === "yes") familiesInEC += 1;
                pregnantWomen += resident.pregnantWomen || 0;
                lactatingMothers += resident.lactatingMothers || 0;
                pwds += resident.pwds || 0;
                soloParents += resident.soloParents || 0;
                indigenousPeoples += resident.indigenousPeoples || 0;
                if (resident.servicesNeeded) assistanceNeeded.push(resident.servicesNeeded);
            });
            const sexBreakdownSummary = `Male: ${sexBreakdown.male}, Female: ${sexBreakdown.female}`;
            console.log("sex breakdown", sexBreakdownSummary )
            // Prepare the document structure for the barangay collection
            const barangayDocument = {
                DisasterCode: disasterCode,
                DisasterType: disasterType,
                DisasterDate: date,
                Residents: barangayResidents, // Save resident data for the barangay
            };

            // Save detailed data to the Barangay collection
            const barangayCollectionRef = collection(db, barangayName);
            const disasterDocRef = doc(barangayCollectionRef, disasterCode);
            await setDoc(disasterDocRef, barangayDocument);

            // Prepare summary data for the data collection
            const barangaySummaryData = {
                disasterCode,
                disasterDate: date,
                disasterType,
                barangays: barangayName,
                affectedFamilies,
                affectedPersons,
                familiesInEC,
                sexBreakdown: sexBreakdownSummary,
                pregnantWomen,
                lactatingMothers,
                pwds,
                soloParents,
                indigenousPeoples,
                assistanceNeeded: [...new Set(assistanceNeeded)].join(", "), // Remove duplicates
                contact,
            };

            // Save the summary data for this barangay to the `data` collection
            const dataDocRef = doc(collection(db, "data"), `${disasterCode}-${barangayName}`);
            await setDoc(dataDocRef, barangaySummaryData);
        }


        alert("All data has been successfully stored in the database!");

        // Clear localStorage (optional)
        localStorage.removeItem("residentData");
    } catch (error) {
        console.error("Error saving data to database:", error);
        alert("An error occurred while saving data. Please try again.");
    }
};


const Step2 = (
    <div className="residents-table">
        <div className="barangay-buttons">
            {selectedBarangays.map((barangay, index) => (
                <button
                    key={index}
                    className={`barangay-button ${barangay === activeBarangay ? 'active' : ''}`}
                    onClick={() => handleBarangayClick(barangay)}
                >
                    {barangay}
                </button>
            ))}
        </div>

        {activeBarangay && (
            <div>
                {isLoading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : residents.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Barangay</th>
                                <th>Purok</th>
                                <th>Family Head</th>
                                <th>Occupation</th>
                                <th>Contact No.</th>
                                <th>Family Members</th>
                                <th>Answer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {residents.map((resident) => (
                                <tr key={resident.id}>
                                    <td>{resident.Barangay}</td>
                                    <td>{resident.Purok}</td>
                                    <td>{resident.FamilyHead}</td>
                                    <td>{resident.Occupation}</td>
                                    <td>{resident.ContactNumber}</td>
                                    <td>{Array.isArray(resident.FamilyMembers) ? resident.FamilyMembers.join(", ") : "No family members"}</td>

                                    <td>
                                        <button onClick={() => handleOpenModal("add", resident)}>
                                            Answer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No residents found for {activeBarangay}.</p>
                )}
            </div>
        )}
    </div>
 );