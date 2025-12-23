module.exports = {
  EXCHANGE_NAME: "healrec.events",

  ROUTING_KEYS_OBJ: {
    FOLLOW_ACCEPTED: "follow.accepted",
    FOLLOW_UNFOLLOWED: "follow.unfollowed",
    FOLLOW_REVOKED: "follow.revoked",
  },

  ROUTING_KEYS_ARRAY: [
    "follow.accepted",
    "follow.unfollowed",
    "follow.revoked",
  ],

  CHAT_QUEUE: "healrec.chat.follow",
};
