const mongoose = require("mongoose");
const reportSchema = require("./reportSchema");


const patientSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, default: "patient" },
    dateOfBirth: {
      type: Date,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    signupMethod: {
      type: String,
      enum: ["email", "phone"],
      required: true,
      immutable: true,
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true });


module.exports = mongoose.model("Patient", patientSchema);