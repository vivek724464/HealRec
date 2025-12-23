const express = require("express");
const Notification = require("../models/notificationSchema");
const { isLoggedIn } = require("../middleware/authmiddleware");

const router = express.Router();

router.get("/", isLoggedIn, async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    notifications,
  });
});

module.exports = router;
