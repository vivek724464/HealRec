const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["doctor", "patient"],
      required: true,
    },
    type: {
      type: String,
      enum: [
        "FOLLOW_REQUEST",
        "FOLLOW_ACCEPTED",
        "FOLLOW_REQUEST_CANCELLED",
        "FOLLOW_DECLINED",
        "FOLLOW_UNFOLLOWED",
        "REMOVED_BY_DOCTOR"
      ],
      required: true,
    },
    payload: Object,
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
