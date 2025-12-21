const express=require("express");
const path=require("path");
const {requestRegisterOtp, verifyRegisterOtp, login, forgotPassword, resetPassword, searchUserByUsername}=require("../controllers/authController");
const {isLoggedIn}=require("../middleware/authmiddleware");
const router =express.Router(); 

router.post("/signup",requestRegisterOtp);
router.post("/verify-otp", verifyRegisterOtp);

router.post("/login", login);
router.post("/forget-password", forgotPassword);
router.get("/reset-password", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/resetPassword.html"));
});
router.post("/reset-password", resetPassword);
router.get("/search", isLoggedIn, searchUserByUsername);


module.exports=router;