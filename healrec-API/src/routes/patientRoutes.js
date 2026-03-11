const express = require("express");
const router = express.Router();
const Patient = require("../models/patientSchema");
const {isLoggedIn, isPatient}=require("../middleware/authmiddleware");
const {updatePatientProfileOtpRequest, verifyPatientProfileUpdateRequestOtp, searchDoctors}=require("../controllers/patientController");
const { getMyAuditLogs } = require("../controllers/auditController");

router.get("/me", isLoggedIn, isPatient, async (req, res) => {
  const user = await Patient.findById(req.user._id).select("-password");
  res.json({ user });
});
router.put("/update-profile", isLoggedIn, isPatient, updatePatientProfileOtpRequest);
router.post("/update-profile/verify-otp", isLoggedIn, isPatient, verifyPatientProfileUpdateRequestOtp);
router.get("/search-doctors", isLoggedIn, isPatient, searchDoctors);
router.get("/audit-logs", isLoggedIn, isPatient, getMyAuditLogs);

module.exports = router;
