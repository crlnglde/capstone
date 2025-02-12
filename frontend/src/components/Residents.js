import React, { useEffect, useState } from "react";

import { db } from "../firebase";
import { collection, addDoc, getDocs } from 'firebase/firestore';
import Papa from 'papaparse';

import axios from "axios";
import Modal from "./Modal"
import "../css/Residents.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Residents = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [residents, setResidents] = useState([]);

  const [barangay, setBarangay] = useState('');
  const [purok, setPurok] = useState('');
  const [familyHeadFirstName, setFamilyHeadFirstName] = useState('');
  const [familyHeadLastName, setFamilyHeadLastName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [members, setMembers] = useState([""]);

  const [selectedBarangay, setSelectedBarangay] = useState(''); // Filter state
  
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const rowsPerPage = 10;
  const totalPages = Math.ceil(residents.length / rowsPerPage);

  const [totalResidents, setTotalResidents] = useState(0);
  const [totalFamilies, setTotalFamilies] = useState(0);

  //list of barangays
  const barangays = [
    'Abuno', 'Acmac-Mariano Badelles Sr.', 'Bagong Silang', 'Bonbonon', 'Bunawan', 'Buru-un', 'Dalipuga',
    'Del Carmen', 'Digkilaan', 'Ditucalan', 'Dulag', 'Hinaplanon', 'Hindang', 'Kabacsanan', 'Kalilangan',
    'Kiwalan', 'Lanipao', 'Luinab', 'Mahayahay', 'Mainit', 'Mandulog', 'Maria Cristina', 'Pala-o',
    'Panoroganan', 'Poblacion', 'Puga-an', 'Rogongon', 'San Miguel', 'San Roque', 'Santa Elena',
    'Santa Filomena', 'Santiago', 'Santo Rosario', 'Saray', 'Suarez', 'Tambacan', 'Tibanga', 'Tipanoy',
    'Tomas L. Cabili (Tominobo Proper)', 'Upper Tominobo', 'Tubod', 'Ubaldo Laya', 'Upper Hinaplanon',
    'Villa Verde'
  ];

  //CSV Upload
  const handleFileChange = (event) => {
    setCsvFile(event.target.files[0]);
  };

  //CSV Upload
  const handleFileUpload = async (event) => {
    event.preventDefault();
  
    if (!csvFile) {
      alert("Please select a CSV file to upload.");
      return;
    }
  
    setIsUploading(true);
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
  
      // Use PapaParse to parse the CSV content
      Papa.parse(text, {
        complete: async (result) => {
          console.log("Parsed Data:", result); // Log the result of the parsing
  
          const data = result.data; // This is the parsed CSV data
          if (data.length === 0) {
            console.error("No data found in CSV.");
            alert("No data found in the CSV.");
            setIsUploading(false);
            return;
          }
  
          // Log headers to check if they're being recognized
          console.log("CSV Headers:", result.meta.fields);
  
          // Skip the header row and process data rows
          const formattedData = data.map((row, index) => {
            // Log the raw row data for debugging
            console.log(`Raw Row [${index}]:`, row);
  
            // If the row is empty (can happen with bad CSV formatting)
            if (!row || row.length === 0) {
              console.log(`Skipping empty row [${index}]`);
              return null;
            }
  
            const barangay = row['Barangay'] ? row['Barangay'].trim() : '';
            const purok = row['Purok'] ? row['Purok'].trim() : '';
            const familyHead = row['Family Head'] ? row['Family Head'].trim() : '';
            const familyMembers = row['Family Members'] ? row['Family Members'].split(',').map(member => member.trim()) : [];
  
            let contactNumber = '';
            if (row['Contact Number']) {
              contactNumber = row['Contact Number'].toString().trim(); // Ensure it's a string
            }
  
            const occupation = row['Occupation'] ? row['Occupation'].trim() : '';
  
            const formattedItem = {
              Barangay: barangay,
              Purok: purok,
              FamilyHead: familyHead,
              FamilyMembers: familyMembers,
              ContactNumber: contactNumber,
              Occupation: occupation,
            };
  
            // Log formatted item
            console.log(`Formatted Item [${index}]:`, formattedItem);
  
            // Only return the item if it has valid data
            if (barangay && purok && familyHead && familyMembers.length > 0) {
              return formattedItem;
            } else {
              console.log(`Skipping row [${index}] due to missing data.`);
              return null;
            }
          }).filter(item => item !== null); // Remove null values (invalid rows)
  
          console.log("Formatted Data:", formattedData); // Check the final formatted data
  
          // Store the formatted data in Firestore
          try {
            const batch = formattedData.map(async (item, index) => {
              const docRef = await addDoc(collection(db, 'bgy-Residents'), item);
              console.log("Document added with ID:", docRef.id);
            });
  
            await Promise.all(batch);
            alert('CSV data uploaded successfully!');
            setIsUploading(false);
            window.location.reload();
          } catch (error) {
            console.error('Error uploading CSV data:', error);
            setIsUploading(false);
          }
        },
        header: true, 
        skipEmptyLines: true, // Skips empty lines in the CSV
        dynamicTyping: true, // Automatically converts numbers, booleans, etc.
        delimiter: ',',  // Ensure CSV delimiter is correctly set (for comma-separated)
      });
    };
  
    reader.readAsText(csvFile);
  };

  //Add Manually
  const handleSubmit = async (event) => {
    event.preventDefault();

    const familyMembersArray = members.map(member => member.trim()).filter(member => member.length > 0);

    const formattedData = {
      Barangay: barangay.trim(),
      Purok: purok.trim(),
      FamilyHead: `${familyHeadFirstName.trim()} ${familyHeadLastName.trim()}`,
      FamilyMembers: familyMembersArray,
      ContactNumber: contactNumber.trim(),
      Occupation: occupation.trim(),
    };

    console.log("Formatted Data to Store:", formattedData);

    try {
      // Store data in Firestore
      await addDoc(collection(db, 'bgy-Residents'), formattedData);
      alert('Resident added successfully!');
      resetForm();
      handleCloseModal();
      window.location.reload();
    } catch (error) {
      console.error('Error adding resident:', error);
      alert('Failed to add resident.');
    }
  };

  //reset add form
  const resetForm = () => {
    setBarangay('');
    setPurok('');
    setFamilyHeadFirstName('');
    setFamilyHeadLastName('');
    setOccupation('');
    setContactNumber('');
    setMembers(['']); 
  };
  
  //Retrieve Residents
  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "bgy-Residents"));
        const residentsData = querySnapshot.docs.map(doc => doc.data());
        setResidents(residentsData); 

        // Calculate total residents and total families
        const total = residentsData.reduce((sum, resident) => {
          return sum + 1 + resident.FamilyMembers.length;
        }, 0);
        setTotalResidents(total);

        // Calculate total families (unique family heads)
        const families = new Set(residentsData.map(resident => resident.FamilyHead));
        setTotalFamilies(families.size);
      } catch (error) {
        console.error("Error fetching residents data:", error);
      }
    };

    fetchResidents();  // Call function to fetch data
  }, []);
  

  //Page ni
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const filteredResidents = residents.filter(resident => {
    if (selectedBarangay) {
      return resident.Barangay === selectedBarangay;
    }
    return true; 
  });

  const handleFilterChange = (event) => {
    setSelectedBarangay(event.target.value); // Update selected barangay
  };

  useEffect(() => {
    const totalFilteredResidents = filteredResidents.reduce((sum, resident) => {
      return sum + 1 + resident.FamilyMembers.length;
    }, 0);
    setTotalResidents(totalFilteredResidents);

    const familiesSet = new Set(filteredResidents.map(resident => resident.FamilyHead));
    setTotalFamilies(familiesSet.size);
  }, [selectedBarangay, residents]);
  
  const displayResidents = filteredResidents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const residentCount = selectedBarangay
  ? filteredResidents.length
  : residents.length;
  
  {/*const displayResidents = residents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );*/}

  const handleAddMember = () => {
    setMembers([...members, ""]); // Add a new empty member field when "Add More Member" is clicked
  };

  const handleMemberChange = (index, value) => {
    const updatedMembers = [...members];
    updatedMembers[index] = value; // Update the specific member's input value
    setMembers(updatedMembers);
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = members.filter((_, i) => i !== index); // Remove the selected member input
    setMembers(updatedMembers);
  };

  const handleAddResidentClick = () => {
    setModalType("add");
    setIsModalOpen(true);
  };

  const handleUploadCsvClick = () => {
    setModalType("upload");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {

    if (isUploading) return;  // Prevent closing if upload is in progress
      setIsModalOpen(false);
      setModalType(""); // Reset modal type
    
  };

  return (
    <div className="residents">
      
      <div className="res-btn">

        <button className="add-resident" onClick={handleAddResidentClick}>
          <i className="fa-solid fa-circle-plus"></i>
          Add Resident
        </button>
          
        <button className="upload-csv" onClick={handleUploadCsvClick}>
          <i className="fa-solid fa-upload"></i>
          Upload CSV
        </button>

      </div>

      

      <div className="residents-container">

        {/* Filter Dropdown */}
        <div className="res-top-row">

          <div className="res-top-col">
            <div className="resident-count-card">
              <div className="rcc-label">
                <label>Total Residents</label>
              </div>

              <p><i className="fa-solid fa-people-group"></i>{totalResidents}</p>
            </div>

            <div className="resident-count-card">
              <div className="rcc-label">
                <label>Total Families</label>
              </div>
              
              <p><i className="fa-solid fa-people-roof"></i>{residentCount}</p>
            </div>
          </div>
    
          <div className="res-filter-container">
            <label htmlFor="barangayFilter"><i className="fa-solid fa-filter"></i> Filter: </label>
            <select
              id="barangayFilter"
              value={selectedBarangay}
              onChange={handleFilterChange}
            >
              <option value="">All Barangays</option>
              {barangays.map((barangay, index) => (
                <option key={index} value={barangay}>
                  {barangay}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="residents-table">
          <table>
              <thead>
                <tr>
                  <th>Barangay</th>
                  <th>Purok</th>
                  <th>Family Head</th>
                  <th>Occupation</th>
                  <th>Contact No.</th>
                  <th>Family Members</th>
                  
                </tr>
              </thead>
              <tbody>
                
                {displayResidents.length > 0 ? (
                  displayResidents.map((resident, index) => (
                    <tr key={index}>
                      <td>{resident.Barangay}</td>
                      <td>{resident.Purok}</td>
                      <td>{resident.FamilyHead}</td>
                      <td>{resident.Occupation}</td>
                      <td>{resident.ContactNumber}</td>
                      <td>{resident.FamilyMembers.join(", ")}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No residents found.</td>
                  </tr>
                )}
                                      
              </tbody>
          </table>
          
        </div>

        <div className="res-button-container">
          <button 
            className="nav-button prev" 
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
              <i className="fa-solid fa-angle-left"></i>
          </button>

          <button 
            className="nav-button next" 
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
              <i className="fa-solid fa-angle-right"></i>
          </button>
        </div>


      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="res-modal" onClick={(e) => e.stopPropagation()} >
            <button className="modal-close-btn" onClick={handleCloseModal}>
              ×
            </button>

            {modalType === "add" && (
              <div>

                <div className="res-h2">
                  <h2>Add Resident</h2>
                </div>
                
                  <form className="add-form" onSubmit={handleSubmit}>
                    <label>Family Head</label>
                    <div className="res-pop-form">
                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-location-dot"></i></span>
                          <input 
                            type="text" 
                            value={barangay} 
                            onChange={(e) => setBarangay(e.target.value)} 
                            placeholder="Barangay" 
                            required 
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-road"></i></span>
                          <input 
                            type="text" 
                            value={purok} 
                            onChange={(e) => setPurok(e.target.value)} 
                            placeholder="Purok" 
                            required 
                          />
                        </div>
                      </div>
                    </div>
          
                    <div className="res-pop-form">
                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-user"></i></span>
                          <input 
                            type="text" 
                            value={familyHeadFirstName} 
                            onChange={(e) => setFamilyHeadFirstName(e.target.value)}
                            placeholder="First Name" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-user"></i></span>
                          <input 
                            type="text" 
                            value={familyHeadLastName} //wala pa na change 
                            onChange={(e) => setFamilyHeadLastName(e.target.value)} //wala pa na change
                            placeholder="Middle Name" 
                            required 
                          />  
                        </div>
                      </div>

                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-user"></i></span>
                          <input 
                            type="text" 
                            value={familyHeadLastName} 
                            onChange={(e) => setFamilyHeadLastName(e.target.value)} 
                            placeholder="Last Name" 
                            required 
                          />
                        </div>
                      </div>
                    </div>


                    {/* new without backend */}
                    <div className="res-pop-form">
                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-mars-and-venus"></i></span>
                          <select  >
                            <option value="">Select Sex</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-calendar"></i></span>
                          <input 
                            type="date"  
                            placeholder="Date of Birth" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-user-graduate"></i></span>
                          <input 
                            type="text" 
                            
                            placeholder="Educational Attainment" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-dollar-sign"></i></span>
                          <input 
                            type="number" 
                            
                            placeholder="Monthly Income" 
                            required 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="res-pop-form1"> 
                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-person-digging"></i></span>
                          <input 
                            type="text" 
                            value={occupation} 
                            onChange={(e) => setOccupation(e.target.value)}
                            placeholder="Occupation" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-phone"></i></span>
                          <input 
                            type="text"
                            value={contactNumber} 
                            onChange={(e) => setContactNumber(e.target.value)} 
                            placeholder="Contact Number" 
                            required 
                          />
                        </div>
                      </div>

                      {/* Member Section */}
                        {/* Member Section */}
                        <div className="form-group1">
                          <label>Family Members</label>
                          {members.map((member, index) => (
                            <div key={index} className="member-input-group">
                              <div className="input-group">
                                <span className="icon">
                                  <i className="fa-solid fa-users"></i>
                                </span>
                                <input
                                  type="text"
                                  placeholder={`Member ${index + 1} Name`}
                                  value={member.name || ''}
                                  onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                                  required
                                />
                              </div>

                              <div className="input-group">
                                <span className="icon">
                                  <i className="fa-solid fa-user-tag"></i>
                                </span>
                                <input
                                  type="text"
                                  placeholder="Relation to Family Head"
                                  value={member.relation || ''}
                                  onChange={(e) => handleMemberChange(index, 'relation', e.target.value)}
                                  required
                                />
                              </div>

                              <div className="input-group">
                                <span className="icon">
                                  <i className="fa-solid fa-hourglass-half"></i>
                                </span>
                                <input
                                  type="number"
                                  placeholder="Age"
                                  value={member.age || ''}
                                  onChange={(e) => handleMemberChange(index, 'age', e.target.value)}
                                  required
                                />
                              </div>

                              <div className="input-group">
                                <span className="icon">
                                  <i className="fa-solid fa-venus-mars"></i>
                                </span>
                                <select
                                  value={member.sex || ''}
                                  onChange={(e) => handleMemberChange(index, 'sex', e.target.value)}
                                  required
                                >
                                  <option value="" disabled>
                                    Select Sex
                                  </option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                </select>
                              </div>

                              <div className="input-group">
                                <span className="icon">
                                  <i className="fa-solid fa-school"></i>
                                </span>
                                <input
                                  type="text"
                                  placeholder="Educational Attainment"
                                  value={member.education || ''}
                                  onChange={(e) => handleMemberChange(index, 'education', e.target.value)}
                                  required
                                />
                              </div>

                              <div className="input-group">
                                <span className="icon">
                                  <i className="fa-solid fa-briefcase"></i>
                                </span>
                                <input
                                  type="text"
                                  placeholder="Occupation / Skills"
                                  value={member.skills || ''}
                                  onChange={(e) => handleMemberChange(index, 'skills', e.target.value)}
                                  required
                                />
                              </div>

                              <button
                                type="button"
                                className="remove-btn"
                                onClick={() => handleRemoveMember(index)}
                              >
                                <i className="fa-solid fa-circle-xmark"></i> Remove Member
                              </button>

                              <hr />
                            </div>
                          ))}

                          <button type="button" className="add-more-btn" onClick={handleAddMember}>
                            + Add More Member
                          </button>
                        </div>

                    </div>

                    <button type="submit" className="submit-btn">
                      Save
                    </button>
                  </form>
                
              </div>
            )}

            {modalType === "upload" && (
              <div>
                <h2 className="modal-title">Upload Resident CSV</h2>
                <form onSubmit={handleFileUpload} className="upload-form">
                  <input type="file" accept=".csv" onChange={handleFileChange} />
                  <button type="submit" className="submit-btn" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}




    </div>
  );
};

export default Residents;