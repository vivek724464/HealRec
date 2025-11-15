const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const {uploadReport, getReports}= require("../controllers/reportController");
const {isLoggedIn, isPatient}=require("../middleware/authmiddleware");

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const patientId = req.body.patientId;
    return {
      folder: `healrec_reports/${patientId}`,
       resource_type: "auto",
      format: file.originalname.split(".").pop(),
      allowed_formats: ["jpg", "png", "jpeg", "pdf", "docx"],
    };
  },
});
const upload = multer({ storage });

router.post("/uploadReport",isLoggedIn, isPatient, upload.single("report"), uploadReport);

router.get("/:patientId", isLoggedIn, isPatient, getReports);

module.exports = router;
