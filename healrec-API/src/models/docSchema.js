const mongoose = require("mongoose");
const docSchema = new mongoose.Schema({
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
  role: { type: String, default: "doctor", required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  isActive: {
    type: Boolean,
    default: true,
  },
  availability: [
    {
      day: {
        type: String,
        enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      from: String,
      to: String,
    },
  ],
  specialization: {
    type: String,
    index: true,
  },

  qualifications: [
    {
      degree: String,
      institute: String,
      year: Number,
    },
  ],

  yearsOfExperience: {
    type: Number,
    min: 0,
  },
  licenseNumber: {
    type: String,
    unique: true,
    sparse: true,
  },

  consultationFee: {
    type: Number,
    min: 0,
  },
  clinic: {
    name: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: "India" },
      pincode: String,
    },
    contact: String,
  },
  signupMethod: {
    type: String,
    enum: ["email", "phone"],
    required: true,
    immutable: true,
  },



  followRequests: [
    {
      patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
      status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending",
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  },
})
module.exports = mongoose.model("Doctor", docSchema);