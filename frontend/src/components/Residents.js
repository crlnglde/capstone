import React, { useEffect, useState, useMemo } from "react";
import Papa from 'papaparse';
import CryptoJS from "crypto-js";
import axios from "axios";
import Modal from "./Modal";
import RES from "./forms/Res";
import Pagination from "./again/Pagination";
import "../css/Residents.css";
import Loading from "./again/Loading";
import Notification from "./again/Notif";
import '@fortawesome/fontawesome-free/css/all.min.css';
import ResidentsVis from "./visualizations/ResidentsVis";

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

  const [notification, setNotification] = useState(null);

  const [activeTab, setActiveTab] = useState("list");
  const [step, setStep] = useState(1);

  const [isEditing, setIsEditing] = useState(false);
  const [residentData, setResidentData] = useState({ ...selectedResident });


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

const fetchExistingResidents = async () => {
  try {
    const response = await axios.get("http://192.168.1.24:3003/get-residents");
    return response.data; 
  } catch (error) {
    console.error("Error fetching residents:", error);
    return [];
  }
};


  //CSV Upload
  const handleFileChange = (event) => {
    setCsvFile(event.target.files[0]);
  };

  //CSV Upload
  const handleFileUpload = async (event) => {
    const confirmSubmit = window.confirm("Are you sure you want to upload this file?");
    if (!confirmSubmit) return;

    event.preventDefault();
    setNotification(null);

    // 1️⃣ Check if a file is selected
    if (!csvFile) {
      setNotification({
        type: "error",
        title: "No File Selected",
        message: "Please select a CSV file to upload."
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // 2️⃣ Validate the file type (CSV only)
    const allowedFileTypes = ['text/csv', 'application/vnd.ms-excel']; // CSV MIME types
    if (!allowedFileTypes.includes(csvFile.type)) {
      setNotification({
        type: "error",
        title: "Invalid File Type",
        message: "Only CSV files are allowed. Please upload a valid file."
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setIsUploading(true);
    setNotification(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;

      // 3️⃣ Check if the file is empty
      if (!text.trim()) {
        setNotification({
          type: "error",
          title: "Empty File",
          message: "The file you uploaded is empty."
        });
        setTimeout(() => setNotification(null), 3000);
        setIsUploading(false);
        return;
      }

      Papa.parse(text, {
        complete: async (result) => {
          const data = result.data;

          if (!data || data.length === 0) {
            console.error("🚨 No data found in CSV.");
            alert("No data found in the CSV.");
            setIsUploading(false);
            return;
          }

          console.log("📂 Parsed CSV Data:", data);

          const existingResidents = await fetchExistingResidents();

          // 4️⃣ Format the CSV data for the API
          const formattedData = data.map((row, index) => {
            if (!row || Object.values(row).every(val => !val || val.toString().trim() === "")) {
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
              dependents: row['dependents']
              ? JSON.parse(row['dependents']).map(dep => ({
                  ...dep,
                  sex: dep.sex === "M" ? "Male" : dep.sex === "F" ? "Female" : dep.sex
                }))
              : [],
            };
          }).filter(item => item !== null);

          console.log("✅ Formatted Data Ready for API:", formattedData);

                  // ✅ Filter out already existing residents
            const newResidents = formattedData.filter(newResident => {
              return !existingResidents.some(existing => existing.memId === newResident.memId);
            });

            if (newResidents.length === 0) {
              setNotification({ type: "error", title: "No New Residents", message: "All residents in the file are already in the list." });
              setIsUploading(false);
              return;
            }

          try {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate a delay for better UX

            // 5️⃣ Send data to backend
            const response = await axios.post("http://192.168.1.24:3003/add-csvresidents", { residents: newResidents });

            console.log("✅ Server Response:", response.data);

            setNotification({
              type: "success",
              title: "CSV Upload Successful",
              message: `${response.data.added} residents added! ${response.data.skipped} duplicates skipped.`
            });

            // 6️⃣ Update UI & Reset Form
            setTimeout(() => {
              addResidentsToTop(formattedData);
              resetForm();
              setNotification(null);
              closeModal();
            }, 3000);

          } catch (error) {
            console.error("❌ Upload Error:", error.response ? error.response.data : error.message);

            let errorTitle = "Upload Failed";
            let errorMessage = "Something went wrong! Please try again.";

            // 7️⃣ Handle Specific API Errors
            if (!error.response) {
              errorTitle = "Network Error";
              errorMessage = "Please check your internet connection and try again.";
            } else if (error.response.status === 400) {
              errorTitle = "Invalid CSV Format";
              errorMessage = "Ensure all required columns are present in the file.";
            } else if (error.response.status === 401 || error.response.status === 403) {
              errorTitle = "Unauthorized Access";
              errorMessage = "You do not have permission to upload files.";
            } else if (error.response.status === 500) {
              errorTitle = "Server Error";
              errorMessage = "An error occurred on the server. Please try again later.";
            } else if (error.message.includes("unsupported file type")) {
              errorTitle = "Invalid File Type";
              errorMessage = "Only CSV files are allowed. Please upload a valid file.";
            } else if (error.message.includes("empty file")) {
              errorTitle = "Empty File";
              errorMessage = "The uploaded CSV file is empty. Please provide a valid file.";
            }

            setNotification({
              type: "error",
              title: errorTitle,
              message: errorMessage
            });

            setTimeout(() => setNotification(null), 3000);
          } finally {
            setIsUploading(false); // Stop loading spinner
            window.location.reload();
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

    const confirmSubmit = window.confirm("Are you sure you want to submit this form?");
    if (!confirmSubmit) return;

    event.preventDefault();
    setIsUploading(true); 
    setNotification(null); 
  
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

      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const response = await axios.post("http://192.168.1.24:3003/add-residents", formattedData);

      
      setNotification({ type: "success", message: "Resident added successfully!" });

      setTimeout(() => {
        addResidentsToTop([formattedData]);
        resetForm();
        setNotification(null);
        closeModal();
      }, 3000);
    } catch (error) {
        setNotification({ type: "error", message: "Failed to add resident. Please try again." });

        setTimeout(() => {
          setNotification(null);
        }, 3000);
    } finally {
      setIsUploading(false); // Stop Loading after success/error
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
    const fetchResidents = async () => {
      try {
        const response = await axios.get("http://192.168.1.24:3003/get-residents");
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


  useEffect(() => {
    fetchResidents();  // Fetch residents data when the component mounts
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
    setIsEditing(false); 
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
              const fullName = `${resident.firstName} ${resident.middleName} ${resident.lastName}`.toLowerCase();
              const hasMatchingDependent = resident.dependents?.some((dependent) => 
                dependent.name.toLowerCase().includes(searchQuery)
              );
          
              if (fullName.includes(searchQuery) || hasMatchingDependent) {
                return true;
              }
          
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
    

          const sanitizeResidentData = (selectedResident) => {
            return {
              ...selectedResident,
              age: Number(selectedResident.age),
              income: Number(selectedResident.income),
              phone: Number(selectedResident.phone),
              bdate: selectedResident.bdate ? new Date(selectedResident.bdate) : null, 
              dependents: selectedResident.dependents.map((dep) => ({
                ...dep,
                age: Number(dep.age),
              })),
            };
          };
          

          const handleSave = async () => {
            const confirmSubmit = window.confirm("Are you sure you want to submit this form?");
            if (!confirmSubmit) return;

            setIsEditing(false); 
            const updatedResidentData = sanitizeResidentData(selectedResident);
            console.log("Updated data:", updatedResidentData)

            try {
              const response = await fetch(`http://192.168.1.24:3003/update-resident/${updatedResidentData.memId}`, {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(updatedResidentData),
              });
      
                if (response.ok) {
                    const data = await response.json();
                    setSelectedResident(data); 
                    fetchResidents();
                    alert('Resident data updated successfully!');
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Error updating resident data');
                }
              } catch (error) {
                  console.error('Error saving data:', error);
                  alert('An error occurred while saving the data');
            }

          };

          const toggleEdit = () => {
            setIsEditing(!isEditing);
          };

          const handleCancel = () => {
            setIsEditing(false); 
            setSelectedResident((prev) => ({ ...prev }));
          };
        
          const handleDelete = async () => {
            if (!selectedResident) return;
        
            const confirmDelete = window.confirm("Are you sure you want to delete this resident?");
            if (!confirmDelete) return;
        
            try {
              const response = await axios.delete(`http://192.168.1.24:3003/delete-resident/${selectedResident.memId}`);
              if (response.status === 200) {
                alert('Resident deleted successfully');
                setResidents((prevResidents) => prevResidents.filter((resident) => resident.memId !== selectedResident.memId)); // Update state to remove the deleted resident
                setSelectedResident(null); 
                closeModal();
              }
            } catch (error) {
              console.error("Error deleting resident:", error);
              alert('An error occurred while deleting the resident');
            }
          };

          const updateResidentData = (newData) => {
            setResidentData(newData);
          };

  return (
    <div className="residents">

        {step !== 2 && (
        <div className="toggle-container">
          <button
            className={activeTab === "list" ? "active" : ""}
            onClick={() => setActiveTab("list")}
          >
            List
          </button>
          <button
            className={activeTab === "visualization" ? "active" : ""}
            onClick={() => setActiveTab("visualization")}
          >
            Visualization
          </button>
        </div>
        )}


      {activeTab === "list" && (
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
      )}


      <div className="residents-container">

        {activeTab === "list" ? (

              <>
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
              </>

        ):(  

          <div className="residdents-visualizations">

            <div className="header-container">
              <h2 className="header-title">Visualizations</h2>
  

              <div className="res-top-row">

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

            </div>

            <ResidentsVis selectedBarangay={selectedBarangay}/>

           
          </div>

        )}  



      </div>


      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalType === "add" ? "Add Resident" : modalType === "upload" ? "Upload Resident CSV" :  "Resident Details"}>

      {notification && (
        <Notification
          type={notification.type}
          title={notification.title} 
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {isUploading && <Loading message="Uploading..." />}


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
                          <select 
                            value={education} 
                            onChange={(e) => setEducation(e.target.value)} 
                            required
                            className="form-control"
                          >
                            <option value="">Select Educational Attainment</option>
                            <option value="Elementary Level">Elementary Level</option>
                            <option value="Elementary Graduate">Elementary Graduate</option>
                            <option value="Junior High School level">Junior High School level</option>
                            <option value="Junior High School Graduate">Junior High School Graduate</option>
                            <option value="Senior High School Level">Senior High School Level</option>
                            <option value="Senior High School Graduate">Senior High School Graduate</option>
                            <option value="College Level">College Level</option>
                            <option value="Bachelor's Degree">Bachelor's Degree</option>
                            <option value="Master's Degree">Master's Degree</option>
                            <option value="Doctorate Degree">Doctorate Degree</option>
                            <option value="Vocational">Vocational</option>
                          </select>
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
                                        <select
                                          value={member.education || ''}
                                          onChange={(e) => handleMemberChange(index, 'education', e.target.value)}
                                          required
                                          className="form-control"
                                        >
                                          <option value="">Select Educational Attainment</option>
                                          <option value="Elementary Level">Elementary Level</option>
                                          <option value="Elementary Graduate">Elementary Graduate</option>
                                          <option value="Junior High School level">Junior High School level</option>
                                          <option value="Junior High School Graduate">Junior High School Graduate</option>
                                          <option value="Senior High School Level">Senior High School Level</option>
                                          <option value="Senior High School Graduate">Senior High School Graduate</option>
                                          <option value="College Level">College Level</option>
                                          <option value="Bachelor's Degree">Bachelor's Degree</option>
                                          <option value="Master's Degree">Master's Degree</option>
                                          <option value="Doctorate Degree">Doctorate Degree</option>
                                          <option value="Vocational">Vocational</option>
                                        </select>
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

                    <button type="submit" className="submit-btn" disabled={isUploading}>
                      {isUploading ? <i className="fa fa-spinner fa-spin"></i> : "Save"}
                    </button>
                  </form>
                
              </div>
            )}

            {modalType === "upload" && (
              <div>
                <form onSubmit={handleFileUpload} className="upload-form">
                  <input type="file" accept=".csv" onChange={handleFileChange} />
                  <button type="submit" className="submit-btn" disabled={isUploading}>
                    {isUploading ? <i className="fa fa-spinner fa-spin"></i> : "Save"}
                  </button>
                </form>
              </div>
            )}      

            {modalType === "view" && selectedResident && (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "10px" }}>
                  <button onClick={isEditing ? handleSave : toggleEdit }>{isEditing ? "Save" : "Edit"}</button>
                  <button onClick={handleDelete}>Delete</button>
                </div>

                <RES 
                  residentData={selectedResident} 
                  isEditing={isEditing} 
                  setResidentData={setSelectedResident}
                />

              </div>
            )}

      </Modal>

    </div>
  );
};

export default Residents;