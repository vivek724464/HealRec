const express = require("express");
const router = express.Router();
const {isLoggedIn, isPatient}=require("../middleware/authmiddleware");
const {updatePatientProfileOtpRequest, verifyPatientProfileUpdateRequestOtp, searchDoctors}=require("../controllers/patientController");

router.put("/update-profile", isLoggedIn, isPatient, updatePatientProfileOtpRequest);
router.post("/update-profile/verify-otp", isLoggedIn, isPatient, verifyPatientProfileUpdateRequestOtp);
router.get("/search-doctors", isLoggedIn, isPatient, searchDoctors);

module.exports = router;
