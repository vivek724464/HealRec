const mongoose = require("mongoose");
const Patient = require("../models/patientSchema");

const uploadReport = async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!req.file) {
      return res.json({
        success: false,
        message: "No file uploaded"
      });
    }

    if (!patientId) {
      return res.json({
        success: false,
        message: "patientId is required in body"
      });
    }

    const fileName = req.file.originalname || req.file.filename;
    const fileType = req.file.mimetype || "application/octet-stream";

    let filePath = req.file?.path || req.file?.secure_url || req.file?.url;

    if (!filePath) {
      return res.json({
        success: false,
        message: "Uploaded file URL not found"
      });
    }
     const format =
      req.file?.format ||
      fileType.split("/")[1] ||
      fileName.split(".").pop();
    if (!filePath.endsWith(`.${format}`)) {
      filePath += `.${format}`;
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.json({
        success: false,
        message: "Patient not found"
      });
    }

    const reportData = {
      fileName,
      url: filePath,
      fileType,
      uploadedAt: new Date(),
    };

    console.log("REPORT TO PUSH:", reportData);

    patient.reports.push(reportData);

    await patient.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: "Report uploaded and saved successfully",
      report: reportData,
    });
  } catch (error) {
    console.error("Error in uploadReport:", error);
    res.json({
      success: false,
      message: "Error uploading report",
      error: error.message || error
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
