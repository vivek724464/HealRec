const express = require("express");
const jwt = require("jsonwebtoken");
const Message = require("../models/message");
const AllowedPair = require("../models/AllowedPair");

const router = express.Router();

function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

router.get("/:userId/:partnerId", async (req, res) => {
  console.log("Received request for message history:", req.params);
  try {
    const user = verifyToken(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { userId, partnerId } = req.params;

    if (user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }
    let doctorId, patientId;
    if (user.role === "doctor") {
      doctorId = userId;
      patientId = partnerId;
    } else {
      doctorId = partnerId;
      patientId = userId;
    }

    const allowed = await AllowedPair.findOne({
      doctorId,
      patientId,
      active: true,
    });

    if (!allowed) {
      return res.json({ success: true, messages: [] });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    }).sort({ timestamp: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    console.error("[messages route] error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
