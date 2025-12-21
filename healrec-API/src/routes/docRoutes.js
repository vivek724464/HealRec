const express = require("express");
const router = express.Router();
const {isLoggedIn, isDoctor}=require("../middleware/authmiddleware");
const {updateDoctorProfileOtpRequest, verifyDoctorProfileOtp}=require("../controllers/docController");

router.put("/update-profile", isLoggedIn, isDoctor, updateDoctorProfileOtpRequest);
router.post("/update-profile/verify-otp", isLoggedIn, isDoctor, verifyDoctorProfileOtp);

module.exports = router;
