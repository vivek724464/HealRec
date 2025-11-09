const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  url: { type: String, required: true }, 
  fileType: { type: String, required: true }, 
  uploadedAt: { type: Date, default: Date.now },
});

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "patient" },
    patientInfo: {
      age: { type: Number },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      contact: { type: String },
      bloodGroup: { type: String },
    },
    reports: [reportSchema],
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
