const express = require("express");
const router = express.Router();
const {isLoggedIn, isPatient}=require("../middleware/authmiddleware");
const {updatePatientProfileOtpRequest, verifyPatientProfileUpdateRequestOtp}=require("../controllers/patientController");

router.put("/update-profile", isLoggedIn, isPatient, updatePatientProfileOtpRequest);
router.post("/update-profile/verify-otp", isLoggedIn, isPatient, verifyPatientProfileUpdateRequestOtp);

module.exports = router;
