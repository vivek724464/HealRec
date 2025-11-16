require("dotenv").config({ path: "../.env" });
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const connectDB = require("./config/db");
const Message = require("./models/message");
const AllowedPair = require("./models/AllowedPair");
const { initRabbitMQ } = require("../../Shared/RabbitMQ/index");
const { subscribe } = require("../../Shared/RabbitMQ/subscriber");
const EVENTS = require("../../Shared/RabbitMQ/events");
const { initWs } = require("./ws/wsHandler");
const messagesRouter = require("./routes/message");
const PORT = process.env.PORT || 7000;
const MONGO_URI = process.env.MONGO_URI;
const RABBIT_URL = process.env.RABBITMQ_URL;
const JWT_SECRET = process.env.JWT_SECRET;
if (!MONGO_URI) {
  console.log("Missing MONGO_URI in environment.");
  process.exit(1);
}
if (!JWT_SECRET) {
  console.log(" Missing JWT_SECRET in environment.");
  process.exit(1);
}
connectDB(MONGO_URI);
const app = express();
app.use(express.json());
app.use("/HealRec/messages", messagesRouter);
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
server.on("upgrade", (req, socket, head) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      console.log(" No token provided in WS connection");
      socket.destroy();
      return;
    }


    req.token = token;

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } catch (err) {
    console.error("Upgrade error:", err);
    socket.destroy();
  }
});


initWs(wss, { jwtSecret: JWT_SECRET });

(async () => {
  try {
    await initRabbitMQ(RABBIT_URL);
    console.log("Connected to RabbitMQ. Listening for follow events...");

    await subscribe(
      RABBIT_URL,
      EVENTS.CHAT_QUEUE,
      EVENTS.ROUTING_KEYS_ARRAY,
      async (payload, routingKey) => {
        console.log("Received:", routingKey, payload);

        const { doctorId, patientId } = payload || {};
        if (!doctorId || !patientId) return;


        if (routingKey === EVENTS.ROUTING_KEYS_OBJ.FOLLOW_ACCEPTED) {

          await AllowedPair.updateOne(
            { doctorId, patientId },
            {
              $set: {
                doctorId,
                patientId,
                active: true,
                createdAt: new Date(),
              },
            },
            { upsert: true }
          );

          console.log(`AllowedPair CREATED: ${doctorId} <-> ${patientId}`);

        } else if (routingKey === EVENTS.ROUTING_KEYS_OBJ.FOLLOW_REVOKED) {

          await AllowedPair.updateOne(
            { doctorId, patientId },
            { $set: { active: false } }
          );

          console.log(`AllowedPair REVOKED: ${doctorId} <-> ${patientId}`);

        } else if (routingKey === EVENTS.ROUTING_KEYS_OBJ.FOLLOW_REQUESTED) {

          console.log(
            `Follow request received → no DB changes: ${doctorId} <-> ${patientId}`
          );

        } else {

          console.log("Unknown routing key:", routingKey);

        }
      }
    );

  } catch (err) {
    console.log("Rabbit error", err.message);
  }
})();


server.listen(PORT, () =>
  console.log(`Chat service running on http://localhost:${PORT}`)
);
