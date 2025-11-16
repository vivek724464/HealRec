const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderModel: { type: String, enum: ["Doctor", "Patient"], required: true },
  receiverModel: { type: String, enum: ["Doctor", "Patient"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

messageSchema.index({ senderId: 1, receiverId: 1, timestamp: 1 });

module.exports = mongoose.model("Message", messageSchema);
