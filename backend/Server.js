const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Resident = require('../backend/models/Resident')
const Disaster = require('../backend/models/Disaster')

const app = express();
const port = 3003;
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/capstone-project',{
    useNewUrlParser: true,
    useUnifiedTopology:true
})

.then(db=>console.log('DB is connected'))
.catch(err=> console.log(err));

app.post("/add-residents", async (req, res) => {
  try {
    const { memId, firstName, middleName, lastName, age, sex, purok, barangay, phone, bdate, occupation, education, income, dependents, esig } = req.body;

    // Validate required fields
    if (!memId || !firstName || !lastName || !age || !sex || !purok || !barangay || !phone) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Ensure `memId` is unique
    const existingResident = await Resident.findOne({ memId });
    if (existingResident) {
      return res.status(400).json({ message: "Resident with this memId already exists." });
    }
    if (!esig) {
      return res.status(400).json({ message: "eSignature is required." });
    }

    // Validate `bdate`
    const formattedBdate = bdate ? new Date(bdate) : null;
    if (formattedBdate && isNaN(formattedBdate.getTime())) {
      return res.status(400).json({ message: "Invalid birthdate format." });
    }

    // Ensure `dependents` is an array
    const formattedDependents = Array.isArray(dependents) ? dependents : [];

    // Create new resident entry
    const newResident = new Resident({
      memId,
      firstName,
      middleName,
      lastName,
      age,
      sex,
      purok,
      barangay,
      phone,
      bdate: formattedBdate,
      occupation,
      education,
      income,
      dependents: formattedDependents,
      esig,
    });

    await newResident.save();
    res.status(201).json({ message: "Resident added successfully!" });

  } catch (error) {
    console.error("Error saving resident:", error);
    res.status(500).json({ message: "Failed to add resident.", error: error.message  });
  }
});

app.post("/add-csvresidents", async (req, res) => {
    try {
      await Resident.insertMany(req.body.residents);
      res.status(201).json({ message: "Bulk residents uploaded successfully!" });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload residents", details: error.message });
    }
  });

app.get('/get-residents', async (req, res) => {
    try {
      const residents = await Resident.find();
      res.status(200).json(residents);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching residents' });
    }
});

app.get("/get-brgyresidents", async (req, res) => {
  try {
    const { barangay } = req.query; // Expect a single brgy

    if (!barangay) {
      return res.status(400).json({ message: "barangay is required" });
    }

    const residents = await Resident.find({ barangay: barangay }); // Filter by single brgy

    res.status(200).json(residents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching residents" });
  }
});

// Get resident esignature by memId
app.get("/get-resident/:memId", async (req, res) => {
  try {
    const { memId } = req.params;

    // Fetch resident by memId
    const resident = await Resident.findOne({ memId:memId });

    if (!resident) {
      return res.status(404).json({ message: "Resident not found." });
    }

    res.json({
      memId: resident.memId,
      name: resident.name,
      esig: resident.esig, // Send the encrypted signature
    });
  } catch (error) {
    console.error("Error fetching resident:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/add-disaster", async (req, res) => {
  try {
    const { disasterCode, disasterType, disasterDateTime, barangays } = req.body;

    if (!disasterCode || !disasterType || !disasterDateTime || !barangays || !Array.isArray(barangays)) {
      return res.status(400).json({ message: "Missing required fields: disasterCode, disasterType, disasterDateTime, or barangays" });
    }

    // Create and Save New Disaster Record
    const newDisaster = new Disaster({
      disasterCode,
      disasterType,
      disasterDateTime,
      barangays
    });

    await newDisaster.save();

    res.status(201).json({ message: "Disaster data added successfully", data: newDisaster });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation Error", error: error.message });
    }
    res.status(500).json({ message: "Error saving disaster data", error: error.message });
  }
});

app.get("/get-disasters", async(req, res)=> {
  try {
    const disasters = await Disaster.find();
    res.json(disasters);
  } catch (error) {
    console.error("Error fetching disasters:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/get-disaster/:disasterCode", async (req, res) => {
  try {
      const { disasterCode } = req.params;

      // Find disaster by disasterCode
      const disaster = await Disaster.findOne({ disasterCode });

      if (!disaster) {
          return res.status(404).json({ message: "Disaster not found" });
      }

      res.status(200).json(disaster);
  } catch (error) {
      console.error("Error fetching disaster data:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/update-disaster/:disasterCode", async (req, res) => {
  try {
    const { disasterCode } = req.params;
    const { barangays } = req.body;

    const existingDisaster = await Disaster.findOne({ disasterCode });

    if (!existingDisaster) {
      return res.status(404).json({ message: "Disaster not found" });
    }

    // Update only the affectedFamilies in existing barangays
    barangays.forEach((newBarangay) => {
      let existingBarangay = existingDisaster.barangays.find((b) => b.name === newBarangay.name);

      if (existingBarangay) {
        // Add only new families (avoid duplicates)
        newBarangay.affectedFamilies.forEach((newFamily) => {
          const isDuplicate = existingBarangay.affectedFamilies.some(
            (existingFamily) =>
              existingFamily.firstName === newFamily.firstName &&
              existingFamily.lastName === newFamily.lastName &&
              existingFamily.bdate === newFamily.bdate
          );
          if (!isDuplicate) {
            existingBarangay.affectedFamilies.push(newFamily);
          }
        });
      } else {
        // If barangay does not exist, add it
        existingDisaster.barangays.push(newBarangay);
      }
    });

    await existingDisaster.save();

    res.json({ message: "Disaster data updated successfully", updatedDisaster: existingDisaster });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.post("/add-distribution/:disasterCode/:barangayName", async (req, res) => {
  const { disasterCode, barangayName } = req.params;
  const { reliefItems, dateDistributed, families, receivedFrom, certifiedCorrect, submittedBy } = req.body;

  try {
    const disaster = await Disaster.findOne({ disasterCode });

    if (!disaster) {
      return res.status(404).json({ message: "Disaster not found" });
    }

    // Find the barangay
    const barangay = disaster.barangays.find(b => b.name === barangayName);

    if (!barangay) {
      return res.status(404).json({ message: "Barangay not found in this disaster" });
    }

    // Create new distribution entry
    const newDistribution = {
      reliefItems,
      dateDistributed,
      families,
      receivedFrom,
      certifiedCorrect,
      submittedBy
    };

    // Add to distributions array
    barangay.distribution.push(newDistribution);

    // Save the updated document
    await disaster.save();

    res.status(201).json({ message: "Distribution added successfully", newDistribution });
  } catch (error) {
    console.error("Error adding distribution:", error);  // ✅ Log the full error
    res.status(500).json({ message: "Server error", error: error.message });
  }
});






app.listen(port,()=>{
    console.log('Example app listening on port ${port}');
});