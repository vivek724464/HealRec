/**
 * GET /HealRec/messages/:userId/:partnerId
 * Returns ordered message history between two users
 */
const express = require("express");
const router = express.Router();
const Message = require("../models/message");

router.get("/:userId/:partnerId", async (req, res) => {
  try {
    const { userId, partnerId } = req.params;
    if (!userId || !partnerId) {
      return res.status(400).json({ success: false, message: "userId and partnerId required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId }
      ]
    }).sort({ timestamp: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    console.error("[messages route] error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
