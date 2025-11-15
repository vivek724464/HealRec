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
      doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
      status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending",
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  },
{ timestamps: true });


module.exports = mongoose.model("Patient", patientSchema);