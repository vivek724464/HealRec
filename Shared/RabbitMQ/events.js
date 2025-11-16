module.exports = {
  EXCHANGE_NAME: "healrec.events",
  ROUTING_KEYS_OBJ: {
    FOLLOW_ACCEPTED: "follow.accepted",
    FOLLOW_REVOKED: "follow.revoked",
    FOLLOW_REQUESTED: "follow.requested",
  },
  ROUTING_KEYS_ARRAY: [
    "follow.accepted",
    "follow.revoked",
    "follow.requested",
  ],
  CHAT_QUEUE: "healrec.chat.follow"
};
