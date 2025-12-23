const express = require("express");
const Doctor = require("../models/docSchema");
const router = express.Router();
const {isLoggedIn, isDoctor}=require("../middleware/authmiddleware");
const {updateDoctorProfileOtpRequest, verifyDoctorProfileOtp}=require("../controllers/docController");

router.put("/update-profile", isLoggedIn, isDoctor, updateDoctorProfileOtpRequest);
router.post("/update-profile/verify-otp", isLoggedIn, isDoctor, verifyDoctorProfileOtp);
router.get("/me", isLoggedIn, isDoctor, async (req, res) => {
  const doctor = await Doctor.findById(req.user._id).select("-password");
  res.json({ doctor });
});

module.exports = router;
