const mongoose = require('mongoose');

const ResidentsSchema = new mongoose.Schema({
    memId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String,
    },
    lastName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    sex: { 
        type: String, 
        required: true, 
        enum: ["M", "F"] 
    },
    purok: {
        type: String,
        required: true
    },
    barangay: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    bdate: {
        type: Date
    },
    occupation: {
        type: String,
        default: null
    },
    income: {
        type: Number,
        required: true
    },
    education: {
        type: String,
        default: null
    },
    dependents: [
        {
            name: { type: String, required: true },
            relationToHead: { type: String, required: true },
            age: { type: Number, required: true },
            sex: { type: String, required: true, enum: ["Male", "Female"] },
            education: { type: String, default: null },
            occupationSkills: { type: String, default: null }
        }
    ]
});

const ResidentsModel = mongoose.model("residents", ResidentsSchema);

module.exports = ResidentsModel;
