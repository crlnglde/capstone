const mongoose = require("mongoose");

const familySchema = new mongoose.Schema({
  familyHead: { type: String, required: true },
  rationCount: { type: Number, required: true },
  memId: { type: String },
  status:{ type: String, required: true, enum: ["Done", "Pending"] },
});

// Relief Items Schema
const reliefItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  assistanceCost:  { type: Number},
  quantity: { type: Number, required: true }
});

// Distribution Schema (Updated)
const distributionSchema = new mongoose.Schema({
  assistanceType: { type: String},
  reliefItems: [reliefItemSchema], // Stores name & quantity of items
  dateDistributed: { type: Date, required: true },
  families: [familySchema], // Stores families receiving relief
  receivedFrom: { type: String, required: true },
  certifiedCorrect: { type: String, required: true },
  submittedBy: { type: String, required: true }
});

const barangaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  distribution: [distributionSchema]
});

const barangaydistributionSchema= new mongoose.Schema({
    disasterCode: {type: String, required: true},
    disasterDate: { type: Date, required: true },
    status:{ type: String, required: true, enum: ["Done", "Pending"] },
    barangays: [barangaySchema]
})

module.exports = mongoose.model("Distribution", barangaydistributionSchema);