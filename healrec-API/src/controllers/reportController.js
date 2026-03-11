const mongoose = require("mongoose");
const Patient = require("../models/patientSchema");
const Doctor = require("../models/docSchema");
const { logPatientAccess } = require("../utils/auditLogger");

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
    const requesterId = req.user?._id?.toString();
    const requesterRole = req.user?.role;

    if (!patientId) {
      return res.json({
        success: false,
        message: "patientId param required"
      });
    }

    const cleanId = patientId.trim();
    if (requesterRole === "patient") {
      if (requesterId !== cleanId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    } else if (requesterRole === "doctor") {
      const doctor = await Doctor.findById(requesterId).select("followRequests");
      const hasAccess = !!doctor?.followRequests?.some(
        (r) =>
          r.patient?.toString() === cleanId &&
          r.status === "accepted"
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const patient = await Patient.findById(cleanId);

    if (!patient) {
      return res.json({
        success: false,
        message: "Patient not found"
      });
    }

    if (requesterRole === "doctor") {
      await logPatientAccess({
        patientId: cleanId,
        actor: req.user,
        action: "VIEW_PATIENT_REPORTS",
        resourceType: "report_collection",
        resourceId: cleanId,
        req,
        details: {
          endpoint: "GET /HealRec/reports/:patientId",
          reportCount: patient.reports?.length || 0,
        },
      });
    }

    return res.json({
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
