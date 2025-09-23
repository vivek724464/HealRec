const express=require("express");
const path=require("path");
const {register, login, forgotPassword, resetPassword}=require("../controllers/authController")
const router =express.Router(); 

router.post("/signup", register);
router.post("/login", login);
router.post("/forget-password", forgotPassword);
router.get("/reset-password/:token", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/resetPassword.html"));
});
router.post("/reset-password/:token", resetPassword);


module.exports=router;
