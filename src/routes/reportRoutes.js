const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const reportController = require("../controllers/reportController");

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const patientId = req.body.patientId || "general";
    return {
      folder: `healrec_reports/${patientId}`,
      resource_type: "auto", 
      allowed_formats: ["jpg", "png", "jpeg", "pdf"],
    };
  },
});

const upload = multer({ storage });

router.post("/uploadReport", upload.single("report"), reportController.uploadReport);

router.get("/:patientId", reportController.getReports);

module.exports = router;
