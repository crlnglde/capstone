const mongoose = require("mongoose");

// Dependent Schema
const dependentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationToHead: { type: String, required: true },
  age: { type: Number, required: true },
  sex: { type: String, required: true, enum: ["Male", "Female"] },
  education: { type: String, default: null },
  occupationSkills: { type: String, default: null }
});

// Casualty Schema
const casualtySchema = new mongoose.Schema({
  type: { type: String, required: true },
  names: [{ type: String, required: true }]
});

// Affected Family Schema
const affectedFamilySchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  sex: { type: String, required: true },
  phone: { type: String, required: true },
  bdate: { type: String, required: true },
  occupation: { type: String },
  education: { type: String },
  income: { type: Number },
  purok: { type: String, required: true },
  dependents: [dependentSchema],
  is4ps: { type: Boolean, default: false },
  isPWD: { type: Boolean, default: false },
  isPreg: { type: Boolean, default: false },
  isSenior: { type: Boolean, default: false },
  isIps: { type: Boolean, default: false },
  isSolo: { type: Boolean, default: false },
  numFam: { type: Number },
  evacuation: { type: String },
  extentDamage: { type: String },
  occupancy: { type: String },
  costDamage: { type: Number },
  casualty: [casualtySchema],
  regDate: { type: Date, required: true }
});

// Distribution Schema (Updated)
const distributionSchema = new mongoose.Schema({
  familyHead: { type: String, required: true },
  rationCount: { type: Number, required: true },
  reliefItems: [{ type: String, required: true }],
  signature: { type: String, required: true }, // Base64 image for tracking
  dateDistributed: { type: Date, required: true }
});

// Barangay Schema
const barangaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  affectedFamilies: [affectedFamilySchema],
  distribution: [distributionSchema]
});

// Disaster Schema
const disasterSchema = new mongoose.Schema(
  {
    disasterCode: { type: String, required: true, unique: true },
    disasterType: { type: String, required: true },
    disasterDateTime: { type: Date, required: true },
    barangays: [barangaySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disaster", disasterSchema);
