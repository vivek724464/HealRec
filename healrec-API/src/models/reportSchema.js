const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  url: { type: String, required: true }, 
  fileType: { type: String, required: true }, 
  uploadedAt: { type: Date, default: Date.now },
});
module.exports = reportSchema;