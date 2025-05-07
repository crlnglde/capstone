import React, { useEffect, useState, useMemo, useRef }  from "react";
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
import { FiDownload } from "react-icons/fi";
import ToggleSwitch from "./again/ToggleButton";
import { FaHistory } from "react-icons/fa";

import ConfirmationDialog from "./again/Confirmation";
import HistoryModal from "./again/HistoryModal";
import ResidentModal from "./again/ResidentModal";

const Residents = ({ setNavbarTitle }) => {
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
  const [openModalType, setOpenModalType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [prevRes, setPrevRes] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [role, setRole] = useState(() => {
    const savedRole = localStorage.getItem('role');
    return savedRole ? savedRole.toLowerCase() : null;
  });

  const [selectedBarangay, setSelectedBarangay] = useState(() => {
    const savedBarangay = localStorage.getItem('barangay');
    return savedBarangay || "";
  });  
 
  const rowsPerPage = 10;


  const [totalResidents, setTotalResidents] = useState(0);
  const [activeFamilies, setActiveFamilies] = useState(0);
  const [inactiveResidents, setTotalInactiveResidents] = useState(0);
  const [totalFamilies, setTotalFamilies] = useState(0);

  const [notification, setNotification] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    type: "",       // 'save', 'delete', 'add'
    title: "",
    message: "",
    onConfirm: null,
  });

  const [activeTab, setActiveTab] = useState("list");
  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [residentData, setResidentData] = useState({ ...selectedResident });
  const [history, setHistory] = useState([]);

   // Toggle the history modal
   const openHistoryModal = () => {
    if (selectedResident && selectedResident.editHistory) {
      setHistory(
        selectedResident.editHistory.map(entry => {
          let formattedDependentsChanges = [];
  
          // Check if dependents is part of the changes
          if (entry.changes.dependents && Array.isArray(entry.changes.dependents)) {
            formattedDependentsChanges = entry.changes.dependents.map(dependent => {
              if (dependent.type === 'added' && dependent.data) {
                // For added dependents, display the after values only
                console.log(dependent.name);
                return {
                  field: `Dependent`,
                  name: dependent.name,
                  type: dependent.type,
                  details: Object.keys(dependent.data).map(field => ({
                    field: field,
                    before: '', // No "Before" for added dependents
                    after: dependent.data[field],
                  })),
                };
              }
  
              if (dependent.type === 'modified' && dependent.changes) {
                // For modified dependents, display both before and after values
                return {
                  field: `Dependent`,
                  name: dependent.name,
                  type: dependent.type,
                  details: Object.keys(dependent.changes).map(changeKey => ({
                    field: changeKey,
                    before: dependent.changes[changeKey].before,
                    after: dependent.changes[changeKey].after,
                  })),
                };
              }

              // Handle "removed" dependents
              if (dependent.type === 'removed') {
                return {
                  field: `Dependent`,
                  name: dependent.name,
                  type: dependent.type,
                  details: [{ field: 'Removed', before: '', after: '' }],
                };
              }
  
              return null; // If neither added nor modified, return null
            }).filter(dependentChange => dependentChange !== null); // Remove null entries
          }
  
          // Format the rest of the changes (excluding dependents)
          const formattedChanges = Object.keys(entry.changes).map(field => {
            if (field !== 'dependents') {
              return {
                field,
                before: entry.changes[field].before,
                after: entry.changes[field].after,
              };
            }
            return null;
          }).filter(change => change !== null);
  
          // Merge dependents changes with other changes
          return {
            date: new Date(entry.timestamp).toLocaleString(),
            action: entry.type,
            user: entry.username,
            changes: [...formattedChanges, ...formattedDependentsChanges]
          };
        })
      );
    } else {
      setHistory([]); // If no history, reset to empty array
    }
    setHistoryModalOpen(true);
  };
  
  
   const closeHistoryModal = () => {
    setHistoryModalOpen(false);
    setOpenModalType("resident");
  };


    useEffect(() => {
      setNavbarTitle(`Residents > ${activeTab === "list" ? "List" : "Visualization"}`);
    }, [activeTab, setNavbarTitle]);

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
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-residents`);
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

  const handleFileUpload = async (event) => {
    event.preventDefault();
    setNotification(null);
  
    // ✅ Check if a file is selected
    if (!csvFile) {
      setNotification({
        type: "error",
        title: "No File Selected",
        message: "Please select a CSV file to upload."
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
  
    // ✅ Validate file type
    const allowedFileTypes = ['text/csv', 'application/vnd.ms-excel'];
    if (!allowedFileTypes.includes(csvFile.type)) {
      setNotification({
        type: "error",
        title: "Invalid File Type",
        message: "Only CSV files are allowed. Please upload a valid file."
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
  
    // 🛑 Before upload, show CONFIRMATION DIALOG
    setConfirmDialog({
      show: true,
      type: "upload", // or "add" depending on your style
      title: "Confirm Upload",
      message: "Are you sure you want to upload this CSV file?",
      onConfirm:  async () => {
        setConfirmDialog({ ...confirmDialog, show: false });
        setIsUploading(true);
        setNotification(null);
      
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target.result;
      
          // ✅ Check empty file
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
                setNotification({ type: "error", title: "No data found in CSV", message: "No data found in the CSV." });
                setIsUploading(false);
                return;
              }
      
              //console.log("📂 Parsed CSV Data:", data);
      
              const existingResidents = await fetchExistingResidents();
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
                  dependents: row['dependents'] ? JSON.parse(row['dependents']).map(dep => ({
                    ...dep,
                    sex: dep.sex === "M" ? "Male" : dep.sex === "F" ? "Female" : dep.sex === "O"? "Others" : dep.sex
                  })) : [],
                };
              }).filter(item => item !== null);
      
              //console.log("✅ Formatted Data Ready for API:", formattedData);
      
              const newResidents = formattedData.filter(newResident => {
                return !existingResidents.some(existing => existing.memId === newResident.memId);
              });
      
              if (newResidents.length === 0) {
                setNotification({ type: "error", title: "No New Residents", message: "All residents in the file are already in the list." });
                setIsUploading(false);
                return;
              }
      
              try {
                await new Promise((resolve) => setTimeout(resolve, 2000)); // UX delay
      
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/add-csvresidents`, { residents: newResidents });
      
                console.log("✅ Server Response:", response.data);
      
                setNotification({
                  type: "success",
                  title: "CSV Upload Successful",
                  message: `${response.data.added} residents added! ${response.data.skipped} duplicates skipped.`
                });
      
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
                  errorMessage = "Only CSV files are allowed.";
                } else if (error.message.includes("empty file")) {
                  errorTitle = "Empty File";
                  errorMessage = "The uploaded CSV file is empty.";
                }
      
                setNotification({ type: "error", title: errorTitle, message: errorMessage });
                setTimeout(() => setNotification(null), 3000);
              } finally {
                setIsUploading(false);
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
      }
    });
  };


  //Add Manually
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    setConfirmDialog({
      show: true,
      type: "add", // or "save" depending on your meaning
      title: "Confirm Add Resident",
      message: "Are you sure you want to submit this form?",
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, show: false }); // Close the dialog
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
  
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/add-residents`, formattedData);
  
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
          setIsUploading(false); 
        }
      }
    });
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
    const localData = localStorage.getItem('residents');
    
    if (localData) {
      const residentsData = JSON.parse(localData);
      //console.log("Loaded from localStorage:", residentsData);
      setResidents(residentsData);
  
      // Calculate total residents and total families
      const total = residentsData.reduce((sum, resident) => {
        return sum + 1 + resident.dependents.length;
      }, 0);
      setTotalResidents(total);
  
      const families = new Set(residentsData.map(resident => resident.FamilyHead));
      setTotalFamilies(families.size);
      
    }
  
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-residents`);
      localStorage.setItem('residents', JSON.stringify(response.data));
  
      // If you're online, update the UI with fresh data too
      const freshData = response.data;
      setResidents(freshData);
  
      const total = freshData.reduce((sum, resident) => {
        return sum + 1 + resident.dependents.length;
      }, 0);
      setTotalResidents(total);
  
      const families = new Set(freshData.map(resident => resident.FamilyHead));
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

    const activeData= filteredResidents.filter(resident => resident.status === "active");
    const inactiveData= filteredResidents.filter(resident => resident.status === "inactive");
    
    const totalFilteredResidents = activeData.reduce((sum, resident) => {
      return sum + 1 + resident.dependents.length;
    }, 0);
    const totalInactiveFilteredResidents = inactiveData.reduce((sum, resident) => {
      return sum + 1 + resident.dependents.length;
    }, 0);

    setTotalResidents(totalFilteredResidents);
    setTotalInactiveResidents(totalInactiveFilteredResidents);

    const familiesSet = new Set(filteredResidents.map(resident => resident.FamilyHead));
    setTotalFamilies(familiesSet.size);
  }, [selectedBarangay, residents]);
  


  const residentCount = selectedBarangay
  ? filteredResidents.filter(r => r.status === "active").length
  : residents.filter(r => r.status === "active").length;

  const residentInactiveCount = selectedBarangay
  ? filteredResidents.filter(r => r.status === "inactive").length
  : residents.filter(r => r.status === "inactive").length;

  

  const handleAddMember = () => {
    setDependents([...dependents, ""]); 
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
    setOpenModalType("addup");
  };

  const handleUploadCsvClick = () => {
    setModalType("upload");
    setIsModalOpen(true);
    setOpenModalType("addup");
  };

  const handleViewMore = (resident) => {
    setOpenModalType("resident");
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

  const closeModal = () => {
    setIsModalOpen(false);
    setHistoryModalOpen(false);
    setOpenModalType("");
  };
  
  //for search
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    //console.log("Search Query: ", query); // Debugging the query
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

          const handleSave = () => {
            setConfirmDialog({
              show: true,
              type: "save",
              title: "Confirm Save",
              message: "Are you sure you want to submit this form?",
              onConfirm: handleConfirmSave, // pass function
            });
          };
          
          const handleConfirmSave = async () => {
            setConfirmDialog({ ...confirmDialog, show: false });
            setIsEditing(false); 
        
            const updatedResidentData = sanitizeResidentData(selectedResident);
            //console.log("Updated data:", updatedResidentData);
        
            try {
              const response = await fetch(`${process.env.REACT_APP_API_URL}/update-resident/${updatedResidentData.memId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedResidentData),
              });
      
                if (response.ok) {
                    const data = await response.json();

                          // Record final saved changes
                    const prevData = sanitizeResidentData(prevRes); // This is the original before update
                    //console.log("previous", prevData.bdate)
                    const newData = updatedResidentData;
                    //console.log("new", newData.bdate)

                    const normalizeDate = (date) => {
                      try {
                        // Strip time and return only the date in YYYY-MM-DD format
                        return new Date(date).toISOString().split("T")[0]; // Format to YYYY-MM-DD
                      } catch {
                        return date; // If invalid date, return the original value
                      }
                    };
                    
                    const changedFields = Object.keys(newData).reduce((acc, key) => {
                      if (key === "dependents" || key === "editHistory") return acc; // skip, handled below
                      
                      const prevVal = (key === "bdate") ? normalizeDate(prevData[key]) : prevData[key];
                      const newVal = (key === "bdate") ? normalizeDate(newData[key]) : newData[key];
                      
                      if (newVal !== prevVal) {
                        acc[key] = {
                          before: prevData[key],
                          after: newData[key],
                        };
                      }
                      return acc;
                    }, {});                    

                   // --- Compare dependents ---
                    const prevDependents = prevData.dependents || [];
                    const newDependents = newData.dependents || [];

                    //console.log("prev: ", prevDependents)
                    //console.log("new: ", newDependents)
                    const dependentsChanges = [];

                    const normalize = (val) => (val ?? "").toString().trim().toLowerCase();

                    // Check modified or removed dependents
                    prevDependents.forEach((prevDep) => {
                      const matching = newDependents.find(
                        (nd) =>
                          normalize(nd.name) === normalize(prevDep.name) &&
                          normalize(nd.relationToHead) === normalize(prevDep.relationToHead)
                      );
                    
                      if (matching) {
                        const changes = {};
                    
                        if (matching.age !== prevDep.age)
                          changes.age = { before: prevDep.age, after: matching.age };
                    
                        if (normalize(matching.sex) !== normalize(prevDep.sex))
                          changes.sex = { before: prevDep.sex, after: matching.sex };
                    
                        if (normalize(matching.education) !== normalize(prevDep.education))
                          changes.education = {
                            before: prevDep.education,
                            after: matching.education,
                          };
                    
                        if (
                          normalize(matching.occupationSkills) !==
                          normalize(prevDep.occupationSkills)
                        )
                          changes.occupationSkills = {
                            before: prevDep.occupationSkills,
                            after: matching.occupationSkills,
                          };
                    
                        if (Object.keys(changes).length > 0) {
                          dependentsChanges.push({
                            name: prevDep.name,
                            relation: prevDep.relationToHead,
                            type: "modified",
                            changes,
                          });
                        }
                      } else {
                        dependentsChanges.push({
                          name: prevDep.name,
                          relation: prevDep.relationToHead,
                          type: "removed",
                        });
                      }
                    });
                    
                    // Check added dependents
                    newDependents.forEach((newDep) => {
                      const matching = prevDependents.find(
                        (pd) =>
                          normalize(pd.name) === normalize(newDep.name) &&
                          normalize(pd.relationToHead) === normalize(newDep.relationToHead)
                      );
                      if (!matching) {
                        dependentsChanges.push({
                          name: newDep.name,
                          relation: newDep.relationToHead,
                          type: "added",
                          data: newDep,
                        });
                      }
                    });
                    
                    if (dependentsChanges.length > 0) {
                      changedFields.dependents = dependentsChanges;
                    }

                    // --- Save to localStorage if there are any changes ---
                    if (Object.keys(changedFields).length > 0) {
                      const username = localStorage.getItem("username") || "Unknown User";
                      const log = {
                        type: "Update",
                        memId: newData.memId,
                        timestamp: new Date().toISOString(),
                        username: username,
                        changes: changedFields,
                      };

                      const existingLog = JSON.parse(localStorage.getItem("changelog")) || [];
                      localStorage.setItem("changelog", JSON.stringify([...existingLog, log]));

                      await fetch(`${process.env.REACT_APP_API_URL}/update-resident/${newData.memId}/history`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json", 
                        },
                        body: JSON.stringify(log),
                      });
                    }
                    
                    setSelectedResident(data); 
                    fetchResidents();

                    setNotification({
                      type: "success",
                      title: "Success",
                      message: "Resident data updated successfully!"
                    });                    

                    setTimeout(() => {
                      setNotification(null);
                      setOpenModalType('');
                    }, 1000);

                    
                } else {
                    const errorData = await response.json();
                    setNotification({
                      type: "error",
                      title: "Error",
                      message: errorData.message || 'Error updating resident data'
                    });
                    
                }
              } catch (error) {
                  console.error('Error saving data:', error);
                  setNotification({
                    type: "error",
                    title: "Error",
                    message: 'An error occurred while saving the data'
                  });
                  
            }
          }; 

          const toggleEdit = () => {
            setPrevRes(structuredClone(selectedResident));
            setIsEditing(!isEditing);
          };

          const handleCancel = () => {
            setIsEditing(false); 
            setSelectedResident((prev) => ({ ...prev }));
          };

          const handleDeleteClick = () => {
            setConfirmDialog({
              show: true,
              type: "delete",
              title: "Confirm Delete",
              message: "Are you sure you want to delete this resident?",
              onConfirm: handleConfirmDelete, // pass function
            });
          };
          
        
          const handleConfirmDelete = async () => {
            setConfirmDialog({ ...confirmDialog, show: false });
          
            if (!selectedResident) return;
          
            try {
              const response = await axios.delete(`${process.env.REACT_APP_API_URL}/delete-resident/${selectedResident.memId}`);
              if (response.status === 200) {
                setNotification({ type: "success", title: "Delete Successful", message: "Resident deleted successfully." });
                setTimeout(() => setNotification(null), 3000);
          
                setResidents((prevResidents) => prevResidents.filter((resident) => resident.memId !== selectedResident.memId));
                setSelectedResident(null);
                closeModal();
              }
            } catch (error) {
              console.error("Error deleting resident:", error);
              setNotification({ type: "error", title: "Delete Error", message: "An error occurred while deleting the resident." });
              setTimeout(() => setNotification(null), 3000);
            }
          };

          const handleCancelConfirm = () => {
            setConfirmDialog({ ...confirmDialog, show: false });
          };
          
          const updateResidentData = (newData) => {
            setResidentData(newData);
          };

          const [showDownloadMenu, setShowDownloadMenu] = useState(false);
          const residentsVisRef = useRef();
          const [menuVisible, setMenuVisible] = useState(false);
         
          
          const buttonRef = useRef(null); // Reference to the button for position calculation
          const menuRef = useRef(null);

          // Function to toggle the menu visibility
          const toggleMenu = () => {
            setMenuVisible((prev) => !prev);
          };
        
          // Function to handle mouse enter and leave
      

          const handleDownloadVisualization = () => {
            if (residentsVisRef.current) {
              residentsVisRef.current.downloadVisualization();
            }
            setShowDownloadMenu(false);
          };
        
          const handleDownloadExcel = () => {
            if (residentsVisRef.current) {
              residentsVisRef.current.downloadExcelData();
            }
            setShowDownloadMenu(false);
          };

  return (
    <div className="residents">

      
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
                        <label>Active Residents</label>
                      </div>

                      <p><i className="fa-solid fa-people-group"></i>{totalResidents}</p>
                    </div>

                    <div className="resident-count-card">
                      <div className="rcc-label">
                        <label>Active Families</label>
                      </div>
                      
                      <p><i className="fa-solid fa-people-roof"></i>{residentCount}</p>
                    </div>
                    
                    <div className="resident-count-card inactive-card">
                      <div className="rcc-label">
                        <label>Inactive Residents</label>
                      </div>
                      <p><i className="fa-solid fa-people-group"></i>{inactiveResidents}</p>
                    </div>

                    <div className="resident-count-card inactive-card">
                      <div className="rcc-label">
                        <label>Inactive Families</label>
                      </div>
                      <p><i className="fa-solid fa-people-roof"></i>{residentInactiveCount}</p>
                    </div>
                  </div>

                  <div className="res-top-col2">
                    <div className="res-search">
                      <div className="res-search-container">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input 
                          type="text" 
                          placeholder="Search..." 
                          onChange={handleSearchChange} 
                          className="search-bar"
                        />
                      </div>
                    </div>
              
                    {role !== "daycare worker" && (
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
                    )}
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
                              <td>{resident.barangay}</td> 
                              <td>{resident.purok}</td>
                              <td>{resident.firstName} {resident.middleName} {resident.lastName}</td> 
                              <td>{resident.age}</td> 
                              <td>{resident.sex}</td> 
                              <td>{resident.occupation}</td> 
                              <td>{resident.phone}</td> 
                              <td>{resident.education || "Not Provided"}</td> 
                              
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
                <div
                  className="download-container"

                >
                  <button
                    className="download-button"
                    onClick={toggleMenu}
                    ref={buttonRef}
                  >
                    <FiDownload style={{ marginRight: "6px" }} />
                    Download
                  </button>

                  {menuVisible && (
                    <div
                      className="download-menu"
                      ref={menuRef}
                      style={{
                        position: 'absolute',
                        zIndex: 10,
                        transition: 'top 0.3s, left 0.3s',
                      }}
                    >
                      <button onClick={() => residentsVisRef.current.downloadVisualization()}>Download Visualization</button>
                      <button onClick={() => residentsVisRef.current.downloadExcel()}>Download Excel File</button>
                    </div>
                  )}
                </div>

                {role !== "daycare worker" && (
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
                )}
              </div>
            </div>

            <ResidentsVis  ref={residentsVisRef} selectedBarangay={selectedBarangay}/>
          </div>

        )}  
      </div>

      {(openModalType === "addup") && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={modalType === "add" ? "Add Resident" : modalType === "upload" ? "Upload Resident CSV" :  ""}>

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
                              <option value="O">Others</option>
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
                                            <option value="Others">Others</option>
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
        </Modal>
      )}

        {(openModalType === "resident") && (
          <div className="modal-wrapper">
          
              <ResidentModal  
                isOpen={isModalOpen} 
                onClose={closeModal} 
                title={modalType === "view" ?  "Resident Details" : " "}
                withHistory={isHistoryModalOpen}  
              >

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

                  {modalType === "view" && selectedResident && (
                    <div className="res-view">
                      <div className="row-wrapper">
                            <div className="hisBut">
                                <button onClick={openHistoryModal}> 
                                  <FaHistory />
                                </button>
                            </div>

                        <div className="button-container">
                          <button onClick={isEditing ? handleSave : toggleEdit}>
                            {isEditing ? "Save" : "Edit"}
                          </button>

                          <button onClick={handleDeleteClick}>Delete</button>
                        </div>
                      </div>

                      <RES 
                        residentData={selectedResident} 
                        isEditing={isEditing} 
                        setResidentData={setSelectedResident}
                      />
                    </div>
                  )}
              </ResidentModal>
        

            {isHistoryModalOpen && (
              <div className="history-wrapper">
                <HistoryModal isOpen={openHistoryModal} onClose={closeHistoryModal} history={history}  />
              </div>
            )}
            
          </div>
        )}
    </div>
  );
};

export default Residents;