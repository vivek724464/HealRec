const mongoose = require("mongoose");
const Patient = require("../models/patientSchema");

const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
    const patientId = req.user._id;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const reportData = {
      fileName: req.file.originalname,
      url: req.file.path || req.file.secure_url,
      fileType: req.file.mimetype,
      uploadedAt: new Date(),
    };

    patient.reports.push(reportData);
    await patient.save();

    return res.json({
      success: true,
      message: "Report uploaded and saved successfully",
      report: reportData,
    });
  } catch (error) {
    console.error("Error in uploadReport:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading report",
      error: error.message,
    });
  }
};


const getReports = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.json({
        success: false,
        message: "patientId param required"
      });
    }

    const cleanId = patientId.trim();
    const patient = await Patient.findById(cleanId);

    if (!patient) {
      return res.json({
        success: false,
        message: "Patient not found"
      });
    }

    res.json({
      reports: patient.reports || [],
    });
  } catch (error) {
    console.error("Error in getReports:", error);
    res.json({
      success: false,
      message: "Error fetching reports",
      error: error.message || error,
    });
  }
};

module.exports = {uploadReport, getReports};
