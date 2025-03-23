import React, { useEffect, useState, useMemo } from "react";
import Papa from 'papaparse';
import CryptoJS from "crypto-js";
import axios from "axios";
import Modal from "./Modal";
import RES from "./forms/Res";
import Pagination from "./again/Pagination";
import "../css/Residents.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Residents = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  
  const [selectedResident, setSelectedResident] = useState(null);

  const [csvFile, setCsvFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [residents, setResidents] = useState([]);
  const [birthdate, setBdate] = useState([]);
  const [education, setEducation] = useState([]);
  const [income, setIncome] = useState([]);
  const [memId, setMemId] = useState([]);
  const [familyHeadSex, setSex] = useState([]);
  const [familyHeadAge, setAge] = useState([]);
  const [barangay, setBarangay] = useState('');
  const [purok, setPurok] = useState('');
  const [familyHeadFirstName, setFamilyHeadFirstName] = useState('');
  const [familyHeadMiddleName, setFamilyHeadMiddleName] = useState('');
  const [familyHeadLastName, setFamilyHeadLastName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [phone, setPhone] = useState('');
  const [dependents, setDependents] = useState([""]);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedBarangay, setSelectedBarangay] = useState(''); // Filter state
  
 
  const rowsPerPage = 10;


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

  // Function to update residents list by adding new ones to the top
const addResidentsToTop = (newResidents) => {
  setResidents((prevResidents) => [...newResidents, ...prevResidents]);
};

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
  
      Papa.parse(text, {
        complete: async (result) => {
          const data = result.data;
          if (!data || data.length === 0) {
            console.error("No data found in CSV.");
            alert("No data found in the CSV.");
            setIsUploading(false);
            return;
          }
  
          const formattedData = data.map((row, index) => {
            if (!row || Object.values(row).every(val => !val)) {
              return null;
            }
  
            return {
              memId: row['memId'] ? row['memId'].trim() : `MEM${Date.now() + index}`,
              firstName: row['firstName']?.trim() || '',
              middleName: row['middleName']?.trim() || '',
              lastName: row['lastName']?.trim() || '',
              age: row['age'] ? parseInt(row['age'], 10) : null,
              sex: row['sex']?.trim().toUpperCase() || '',
              purok: row['purok']?.toString().trim() || '',
              barangay: row['barangay']?.trim() || '',
              phone: row['phone']?.toString().trim() || '',
              bdate: row['bdate'] ? new Date(row['bdate']).toISOString() : null,
              occupation: row['occupation']?.trim() || '',
              education: row['education']?.trim() || '',
              income: row['income'] ? parseFloat(row['income']) : 0,
              dependents: row['dependents'] ? JSON.parse(row['dependents']) : [],
            };
          }).filter(item => item !== null);
  
          try {
            await axios.post("http://localhost:3003/add-csvresidents", { residents: formattedData });
  
            alert('CSV data uploaded successfully!');
            addResidentsToTop(formattedData); // Add new residents to the top
            setIsUploading(false);
          } catch (error) {
            console.error('Error uploading CSV data:', error);
            setIsUploading(false);
          }
        },
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        delimiter: ',',
      });
    };
  
    reader.readAsText(csvFile);
  };

  //Add Manually
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const memId = `MEM${Date.now()}`;
  
    const formattedData = {
      memId,
      firstName: familyHeadFirstName.trim(),
      middleName: familyHeadMiddleName.trim(),
      lastName: familyHeadLastName.trim(),
      age: parseInt(familyHeadAge, 10),
      sex: familyHeadSex,
      purok: purok.trim(),
      barangay: barangay.trim(),
      phone: phone.trim(),
      bdate: birthdate || null,
      occupation: occupation.trim() || null,
      education: education.trim() || null,
      income: parseInt(income, 10),
      dependents: dependents
        .map(member => ({
          name: member.name.trim(),
          relationToHead: member.relation.trim(),
          age: parseInt(member.age, 10),
          sex: member.sex,
          education: member.education.trim() || null,
          occupationSkills: member.skills.trim() || null,
        }))
        .filter(member => member.name.length > 0),
    };
  
    try {
      const response = await axios.post("http://localhost:3003/add-residents", formattedData);
      alert(response.data.message);
      addResidentsToTop([formattedData]); // Add new resident to the top
      resetForm();
      handleCloseModal();
    } catch (error) {
      console.error("Error adding resident:", error);
      alert("Failed to add resident.");
    }
  };
  
  //reset add form
  const resetForm = () => {
    setMemId(''); 
    setFamilyHeadFirstName('');
    setAge('');
    setSex('');
    setBarangay('');
    setPurok('');
    setPhone('');
    setBdate(''); 
    setOccupation('');
    setIncome('');
    setEducation('');
    setDependents([{
      name: '',
      relationToHead: '',
      age: '',
      sex: '',
      education: '',
      occupationSkills: ''
    }]);
  };
  
  //Retrieve Residents
  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const response = await axios.get("http://localhost:3003/get-residents");
        const residentsData = response.data;
        setResidents(residentsData); 

        // Calculate total residents and total families
        const total = residentsData.reduce((sum, resident) => {
          return sum + 1 + resident.dependents.length;
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
  
  
  const filteredResidents = residents.filter(resident => {
    if (selectedBarangay) {
      return resident.barangay === selectedBarangay;
    }
    return true; 
  });

  const handleFilterChange = (event) => {
    setSelectedBarangay(event.target.value); // Update selected barangay
  };

  useEffect(() => {
    const totalFilteredResidents = filteredResidents.reduce((sum, resident) => {
      return sum + 1 + resident.dependents.length;
    }, 0);
    setTotalResidents(totalFilteredResidents);

    const familiesSet = new Set(filteredResidents.map(resident => resident.FamilyHead));
    setTotalFamilies(familiesSet.size);
  }, [selectedBarangay, residents]);
  


  const residentCount = selectedBarangay
  ? filteredResidents.length
  : residents.length;
  

  const handleAddMember = () => {
    setDependents([...dependents, ""]); // Add a new empty member field when "Add More Member" is clicked
  };

  const handleMemberChange = (index, field, value) => {
    setDependents((prevDependents) =>
      prevDependents.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      )
    );
  };  

  const handleRemoveMember = (index) => {
    const updateddependents= dependents.filter((_, i) => i !== index); // Remove the selected member input
    setDependents(updateddependents);
  };

  const handleAddResidentClick = () => {
    setModalType("add");
    setIsModalOpen(true);
  };

  const handleUploadCsvClick = () => {
    setModalType("upload");
    setIsModalOpen(true);
  };

  const handleViewMore = (resident) => {
    setSelectedResident(resident);
    setModalType("view");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {

    if (isUploading) return;  // Prevent closing if upload is in progress
      setIsModalOpen(false);
      setModalType(""); // Reset modal type
    
  };

  const closeModal = () => setIsModalOpen(false);


  //for search
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    console.log("Search Query: ", query); // Debugging the query
  };



    //pagination ni 
          const residentsPerPage = 10; // 4 columns x 4 rows
          const [currentPage, setCurrentPage] = useState(1);
        
          // Get reports for the current page
          const startIndex = (currentPage - 1) * residentsPerPage;
          const currentResidents = filteredResidents.slice(startIndex, startIndex + residentsPerPage);
    
          const paginatedReports = filteredResidents.slice(
            (currentPage - 1) * residentsPerPage,
            currentPage * residentsPerPage
          );

          // Ensure new residents appear at the top in pagination
          const sortedResidents = useMemo(() => {
            return [...filteredResidents].sort((a, b) => b.memId.localeCompare(a.memId));
          }, [filteredResidents]);

          // Apply search filtering
          const searchResidents = useMemo(() => {
            return sortedResidents.filter((resident) => {
              return Object.keys(resident).some((key) => {
                const value = resident[key];

                if (typeof value === "string" && value.toLowerCase().includes(searchQuery)) {
                  return true;
                }

                if (Array.isArray(value)) {
                  return value.some((item) =>
                    Object.values(item).some(
                      (subValue) =>
                        typeof subValue === "string" && subValue.toLowerCase().includes(searchQuery)
                    )
                  );
                }

                return false;
              });
            });
          }, [sortedResidents, searchQuery]);
        
          // Calculate total pages dynamically
          const totalPages = Math.ceil(searchResidents.length / residentsPerPage);

          // Paginate filtered residents
          const tableResidents = useMemo(() => {
            return searchResidents.slice(
              (currentPage - 1) * residentsPerPage,
              currentPage * residentsPerPage
            );
          }, [searchResidents, currentPage]);
    

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

          <div className="dstr-search">
            <div className="dstr-search-container">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input 
                type="text" 
                placeholder="Search..." 
                onChange={handleSearchChange} 
                className="search-bar"
              />
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
                <th>Age</th>
                <th>Sex</th>
                <th>Occupation</th>
                <th>Contact No.</th>
                <th>Education</th>
                <th>View More</th>
              </tr>
              </thead>
              <tbody>
                
              {tableResidents.length > 0 ? (
                  tableResidents.map((resident, index) => (
                    <tr key={index}>
                      <td>{resident.barangay}</td> {/* barangay */}
                      <td>{resident.purok}</td> {/* Purok */}
                      <td>{resident.firstName} {resident.middleName} {resident.lastName}</td> {/* Family Head (name) */}
                      <td>{resident.age}</td> {/* Family Head's Age */}
                      <td>{resident.sex}</td> {/* Family Head's Sex */}
                      <td>{resident.occupation}</td> {/* Occupation */}
                      <td>{resident.phone}</td> {/* Contact No. */}
                      <td>{resident.education || "Not Provided"}</td> {/* Education */}
                      
                      <td> 
                      <button className="res-viewmore-btn" onClick={() => handleViewMore(resident)}>
                        <i className="fa-solid fa-ellipsis"></i>
                      </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9">No residents found.</td>
                  </tr>
                )}
                                      
              </tbody>
          </table>
        </div>

        {totalPages > 1 && (
            <div className="pagination-wrapper">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalType === "add" ? "Add Resident" : modalType === "upload" ? "Upload Resident CSV" :  "Resident Details"}>

            {modalType === "add" && (
              <div>
                  <form className="add-form" onSubmit={handleSubmit}>

                    {/*head*/}
                    <label>Family Head</label>

                    <div className="res-pop-form">
                      {/*brgy*/}
                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-location-dot"></i></span>
                          <select
                            id="barangayFilter"
                            value={barangay}
                            onChange={(e) => setBarangay(e.target.value)} 
                          >
                            <option value="">Barangay</option>
                            {barangays.map((barangay, index) => (
                              <option key={index} value={barangay}>
                                {barangay}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {/*prk*/}
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
                      {/*fname*/}
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
                      {/*mname*/}
                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-user"></i></span>
                          <input 
                            type="text" 
                            value={familyHeadMiddleName} //wala pa na change 
                            onChange={(e) => setFamilyHeadMiddleName(e.target.value)} //wala pa na change
                            placeholder="Middle Name" 
                          />  
                        </div>
                      </div>
                      {/*lname*/}            
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
                   
                    <div className="res-pop-form">
                      {/*Sex*/}
                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-mars-and-venus"></i></span>
                          <select  value={familyHeadSex} onChange={(e) => setSex(e.target.value)} >
                            <option value="">Select Sex</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                          </select>
                        </div>
                      </div>
                      
                       {/*Bdate*/}
                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-calendar"></i></span>
                          <input 
                            type="date"  
                            value={birthdate} 
                            onChange={(e) => setBdate(e.target.value)}
                            placeholder="Date of Birth" 
                            required 
                          />
                        </div>
                      </div>

                      {/*Age*/}
                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-hourglass-half"></i></span>
                          <input 
                            type="number" 
                            value={familyHeadAge} 
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Age" 
                            required 
                          />
                        </div>
                      </div>                      
                      
                       {/*educAt*/}
                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-user-graduate"></i></span>
                          <input 
                            type="text" 
                            value={education} 
                            onChange={(e) => setEducation(e.target.value)}
                            placeholder="Educational Attainment" 
                            required 
                          />
                        </div>
                      </div>
                      
                     
                    </div>
                    
                    <div className="res-pop-form"> 


                      {/*Income*/}
                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-dollar-sign"></i></span>
                          <input 
                            type="number" 
                            value={income} 
                            onChange={(e) => setIncome(e.target.value)}
                            placeholder="Monthly Income" 
                            required 
                          />
                        </div>
                      </div>

                      {/*Occupation*/}
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

                      {/*Phone*/}
                      <div className="form-group">
                        <div className="input-group">
                          <span className="icon"><i className="fa-solid fa-phone"></i></span>
                          <input 
                            type="number" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            placeholder="Contact Number" 
                            required 
                          />
                        </div>
                      </div>
                    </div>

                    {/*Dependent*/}
                    <div className="res-pop-form1"> 

                        {/* Member Section */}
                        <div className="res-pop-form1">
                         <label>Family Dependents</label>

                          {dependents.map((member, index) => (
                            <div key={index} className="member-input-group">
                              <div className="res-pop-form2">
                                <div className="res-pop-form1">
                                  <div className="res-pop-form"> 
                                    {/*Name*/}
                                    <div className="form-group"> 
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
                                      
                                    </div>

                                    {/*Relation to FamHead*/}
                                    <div className="form-group"> 
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
                                    </div>
                                  </div>
                                  
                                  <div className="res-pop-form">
                                    {/*Age*/}
                                    <div className="form-group">
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
                                    </div>

                                    {/*Sex*/}
                                    <div className="form-group"> 
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
                                    </div>
                                  </div>

                                  <div className="res-pop-form">
                                    {/*EducAt*/}
                                    <div className="form-group">
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
                                    </div>

                                    {/*Occupation*/}
                                    <div className="form-group"> 
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
                                    </div>
                                  </div>
                                </div>

                              
                                <div className="res-pop-form2">
                                  
                                  <button
                                      type="button"
                                      className="remove-btn"
                                      onClick={() => handleRemoveMember(index)}
                                    >
                                      <i className="fa-solid fa-circle-xmark"></i>
                                    </button>
                                </div>
                              </div>

                              <hr />
                            </div>
                          ))}

                        </div>

                        <button type="button" className="add-more-btn" onClick={handleAddMember}>
                            + Add More Member
                        </button>
                    </div>

                    <button type="submit" className="submit-btn">
                      Save
                    </button>
                  </form>
                
              </div>
            )}

            {modalType === "upload" && (
              <div>
                <form onSubmit={handleFileUpload} className="upload-form">
                  <input type="file" accept=".csv" onChange={handleFileChange} />
                  <button type="submit" className="submit-btn" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </form>
              </div>
            )}      

            {modalType === "view" && selectedResident && (
              <RES residentData={selectedResident} />
            )}

      </Modal>

    </div>
  );
};

export default Residents;