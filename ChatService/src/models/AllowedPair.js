const mongoose = require("mongoose");
const allowedPairSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});
allowedPairSchema.index({ doctorId: 1, patientId: 1 }, { unique: true });

module.exports = mongoose.model("AllowedPair", allowedPairSchema);
