const mongoose = require("mongoose");
const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "patient", required: true },
    patientInfo: {
        age: Number,
        gender: { type: String, enum: ["Male", "Female", "Other"] },
        contact: { type: String }, bloodGroup: { type: String },
        medicalReports: [{
            fileName: String, filePath: String,
            uploadedAt: { type: Date, default: Date.now },
            fileType: String
        }]
    },
     resetPasswordToken: {
        type:String
    },
    resetPasswordExpire: {
        type:Date
    },
})
module.exports = mongoose.model("Patient", patientSchema);