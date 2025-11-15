const mongoose = require("mongoose");
const docSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "doctor", required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    doctorInfo: { specialization: { type: String }, Contact: { type: String } },
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
        type:String
    },
    resetPasswordExpire: {
        type:Date
    },
})
module.exports = mongoose.model("Doctor", docSchema);