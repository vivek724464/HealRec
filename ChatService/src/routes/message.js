const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
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
  console.log("📨 Received request for message history:", req.params);
  try {
    const user = verifyToken(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { userId, partnerId } = req.params;

    // Ensure ID comparison works with both string and ObjectId
    const userIdStr = user.id.toString();
    if (userIdStr !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - You can only access your own messages",
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

    // Verify the pair is allowed
    const allowed = await AllowedPair.findOne({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      patientId: new mongoose.Types.ObjectId(patientId),
      active: true,
    });

    if (!allowed) {
      console.warn("⚠️ Pair not allowed:", doctorId, patientId);
      return res.json({ success: true, messages: [] });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const partnerObjectId = new mongoose.Types.ObjectId(partnerId);

    const messages = await Message.find({
      $or: [
        { senderId: userObjectId, receiverId: partnerObjectId },
        { senderId: partnerObjectId, receiverId: userObjectId },
      ],
      deletedFor: { $ne: userObjectId },
    })
      .sort({ timestamp: 1 })
      .limit(100);

    console.log("✅ Found", messages.length, "messages");
    res.json({ success: true, messages });
  } catch (err) {
    console.error("❌ [messages route] error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
