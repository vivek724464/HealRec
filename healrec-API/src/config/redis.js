const { createClient } = require("redis");

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err));

(async () => {
  if (!redis.isOpen) await redis.connect();
})();

module.exports = redis;
