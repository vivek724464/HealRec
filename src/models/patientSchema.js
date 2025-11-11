const mongoose = require("mongoose");
const reportSchema = require("./reportSchema");


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
followingDoctors: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
],
pendingRequests: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
],
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);