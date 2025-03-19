require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../backend/models/User')
const Resident = require('../backend/models/Resident')
const Disaster = require('../backend/models/Disaster')
const Distribution = require ('../backend/models/Distribution')

const app = express();
const port = 3003;
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology:true
})
.then(db=>console.log('DB is connected'))
.catch(err=> console.log(err));


  // Register Route
  app.post("/register", async (req, res) => {
    try {
      const { username, password, role } = req.body;

      // Check if user already exists
      let user = await User.findOne({ username });
      if (user) return res.status(400).json({ message: "User already exists" });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      user = new User({ username, password: hashedPassword, role });
      await user.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.error("Registration Error:", err); // Log the error
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


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
    const { disasterCode, disasterType, disasterStatus, disasterDateTime, barangays } = req.body;

    if (!disasterCode || !disasterType || !disasterDateTime || !barangays || !Array.isArray(barangays)) {
      return res.status(400).json({ message: "Missing required fields: disasterCode, disasterType, disasterDateTime, or barangays" });
    }

    // Create and Save New Disaster Record
    const newDisaster = new Disaster({
      disasterCode,
      disasterStatus,
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

app.put("/update-dafac-status/:disCode/:disBarangay/:familyId", async (req, res) => {
  try {
      const { disCode, disBarangay, familyId } = req.params;

      const disaster = await Disaster.findOne({ disasterCode: disCode });

      if (!disaster) {
        return res.status(404).json({ message: "Disaster not found" });
    }

        // Find the barangay
        const barangay = disaster.barangays.find(b => b.name === disBarangay);
        if (!barangay) {
            return res.status(404).json({ message: "Barangay not found" });
        }

        // Find the affected family
        const family = barangay.affectedFamilies.find(f => f.id === familyId);
        if (!family) {
            return res.status(404).json({ message: "Affected family not found" });
        }

        // Update the dafacStatus
        family.dafacStatus = "Confirmed";

        // Save the updated disaster document
        await disaster.save();

        res.json({ message: "DAFAC status updated successfully" });
    } catch (error) {
        console.error("Error updating DAFAC status:", error);
        res.status(500).json({ message: "Server error" });
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

    // Iterate through new barangays
    barangays.forEach((newBarangay) => {
      let existingBarangay = existingDisaster.barangays.find(
        (b) => b.name === newBarangay.name
      );

      if (existingBarangay) {
        newBarangay.affectedFamilies.forEach((newFamily) => {
          const existingFamilyIndex = existingBarangay.affectedFamilies.findIndex(
            (existingFamily) =>
              existingFamily.firstName === newFamily.firstName &&
              existingFamily.lastName === newFamily.lastName &&
              existingFamily.bdate === newFamily.bdate
          );      

          if (existingFamilyIndex !== -1) {
            // Update existing family data
            existingBarangay.affectedFamilies[existingFamilyIndex] = {
              ...existingBarangay.affectedFamilies[existingFamilyIndex],
              ...newFamily,
            };
          } else {
            // Add new family if not found
            existingBarangay.affectedFamilies.push(newFamily);
          }
        });
      } else {
        // If the barangay does not exist, add it
        existingDisaster.barangays.push(newBarangay);
      }
    });

    // Ensure Mongoose detects the change
    existingDisaster.markModified("barangays");

    // Save updated disaster record
    await existingDisaster.save();

    res.json({
      message: "Disaster data updated successfully",
      updatedDisaster: existingDisaster,
    });
  } catch (error) {
    console.error("Error updating disaster:", error);
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

app.get("/get-resident-esig", async (req, res) => {
  const { memId } = req.query;  // Extract memId from query parameters

  try {
    if (!memId) {
      return res.status(400).json({ error: "memId is required" });
    }

    // Find resident by memId
    const resident = await Resident.findOne({ memId: memId.trim() });

    if (!resident) {
      return res.status(404).json({ error: "Resident not found" });
    }

    res.json({ esig: resident.esig});
  } catch (error) {
    console.error("Error fetching resident signature:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/save-distribution", async (req, res) => {
  try {
    const { disasterCode, disasterDate, assistanceType, barangay, families, reliefItems, receivedFrom, certifiedCorrect, submittedBy, status } = req.body;


    console.log(families)
    console.log("type:", assistanceType)
    // Validate required fields
    if (!disasterCode || !disasterDate || !barangay || !families || !reliefItems) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure memId is present for each family
    for (let family of families) {
      if (!family.memId) {
        console.error("Missing memId for family:", family);
        return res.status(400).json({ message: "memId is required for all families" });
      }
    }

    let existingDistribution = await Distribution.findOne({ disasterCode });

    if (!existingDistribution) {
      existingDistribution = new Distribution({
        disasterCode,
        status,
        disasterDate,
        barangays: []
      });
    }

    let barangayData = existingDistribution.barangays.find(b => b.name === barangay);

    if (!barangayData) {
      barangayData = { name: barangay, distribution: [] };
      existingDistribution.barangays.push(barangayData);
    }

    const newDistribution = {
      reliefItems: reliefItems.map(item => ({
        name: item.name,
        quantity: Number(item.quantity) || 0,
        assistanceCost: Number(item.assistanceCost) || 0
      })),
      assistanceType,
      dateDistributed: new Date(),
      families: families.map(family => ({
        familyHead: family.familyHead,
        rationCount: family.rationCount,
        memId: family.memId,
        status: family.status,
        signature: family.signature // Ensure signature is included
      })),
      receivedFrom,
      certifiedCorrect,
      submittedBy
    };

    // Update barangay distribution
    existingDistribution.barangays = existingDistribution.barangays.map(b => {
      if (b.name === barangay) {
        return {
          ...b,
          distribution: [...b.distribution, newDistribution]
        };
      }
      return b;
    });

    barangayData.distribution.forEach(dist => dist.families.forEach(fam => dist.markModified("families")));
    existingDistribution.markModified("barangays");

    await existingDistribution.save();

    res.status(201).json({ message: "Distribution data saved successfully!" });
  } catch (error) {
    console.error("Error saving distribution data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.get("/get-distribution", async (req, res) => {
  try {
      const { disasterCode, barangay, status } = req.query;

      let query = {};

      if (disasterCode) query.disasterCode = disasterCode;
      if (status) query.status = status;

      // Fetch matching distributions
      let distributions = await Distribution.find(query);

      // If barangay filter is applied, refine the data
      if (barangay) {
          distributions = distributions.map(d => ({
              ...d.toObject(),
              barangays: d.barangays.filter(b => b.name === barangay)
          })).filter(d => d.barangays.length > 0); // Remove empty results
      }

      res.status(200).json(distributions);
  } catch (error) {
      console.error("Error fetching distribution data:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/get-distribution/:distributionId", async (req, res) => {
  try {
    const { distributionId } = req.params;

    // Find the specific distribution using nested array filters
    const distribution = await Distribution.findOne({
      "barangays.distribution._id": distributionId,
    });

    if (!distribution) {
      return res.status(404).json({ message: "Distribution not found" });
    }

    // Extract the specific barangay that contains the distribution
    const barangay = distribution.barangays.find(barangay =>
      barangay.distribution.some(dist => dist._id.toString() === distributionId)
    );

    if (!barangay) {
      return res.status(404).json({ message: "Barangay not found" });
    }

    // Extract the specific distribution
    const specificDistribution = barangay.distribution.find(dist => dist._id.toString() === distributionId);

    res.json({
      disasterCode: distribution.disasterCode,
      barangayName: barangay.name,
      distribution: specificDistribution
    });
  } catch (error) {
    console.error("Error fetching distribution:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/get-disdistribution/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the entire distribution entry
    const barangayDistribution = await Distribution.findById(id);

    if (!barangayDistribution) {
      return res.status(404).json({ message: "Distribution not found" });
    }

    // Return the entire distribution object
    res.status(200).json(barangayDistribution);
  } catch (error) {
    console.error("Error fetching distribution:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Update status to "Done" for a specific distribution and its corresponding disaster
app.put("/update-status/:disasterCode", async (req, res) => {
  try {
    const { disasterCode } = req.params;

    // Find the distribution by disasterCode
    const distribution = await Distribution.findOne({ disasterCode });

    if (!distribution) {
      return res.status(404).json({ message: "Distribution not found for this disaster ID" });
    }

    // Update the status of the found distribution
    distribution.status = "Done";
    await distribution.save();

    // Find the corresponding disaster and update its status
    const disaster = await Disaster.updateOne(
      { disasterCode },  // Find the disaster by disasterCode
      { $set: { disasterStatus: "Done" } }  // Only update the status field
    );

    res.json({ message: "Status updated to Done for both disaster and distribution", updatedDistribution: distribution, updatedDisaster: disaster });

  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/update-distribution/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { families } = req.body;

    console.log("Received PUT request:", req.params.id, req.body);

    // Convert id to a valid ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    const updatedDistribution = await Distribution.findOneAndUpdate(
      { 
        "barangays.distribution._id": objectId 
      },
      { 
        $set: { "barangays.$[].distribution.$[d].families": families }  
      },
      { 
        new: true,
        arrayFilters: [{ "d._id": objectId }] 
      }
    );

    if (updatedDistribution) {
      res.status(200).send("Distribution data updated successfully.");
    } else {
      res.status(404).send("Distribution not found.");
    }
  } catch (error) {
    console.error("Error updating distribution:", error.message);  // Improved error log
    res.status(500).send("An error occurred while updating the data.");
  }
});



app.listen(port,()=>{
    console.log('Example app listening on port ${port}');
});