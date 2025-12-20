const express=require("express");
const path=require("path");
const {requestRegisterOtp, verifyRegisterOtp, login, forgotPassword, resetPassword}=require("../controllers/authController")
const router =express.Router(); 

router.post("/signup",requestRegisterOtp);
router.post("/verify-otp", verifyRegisterOtp);

router.post("/login", login);
router.post("/forget-password", forgotPassword);
router.get("/reset-password/:token", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/resetPassword.html"));
});
router.post("/reset-password/:token", resetPassword);


module.exports=router;
