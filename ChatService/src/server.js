const path = require("path");
const cors = require("cors");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
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
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://192.168.56.1:8080",
];

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in environment.");
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error("❌ Missing JWT_SECRET in environment.");
  process.exit(1);
}
if (!RABBIT_URL) {
  console.error("❌ Missing RABBITMQ_URL in environment.");
  process.exit(1);
}

connectDB(MONGO_URI);
const app = express();
app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.indexOf(origin) !== -1) return cb(null, true);
      return cb(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    preflightContinue: false,
  })
);
app.use(express.json());
app.use("/HealRec/messages", messagesRouter);
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
server.on("upgrade", (req, socket, head) => {
  try {
    // Accept token either via Authorization header (Bearer) or URL query parameter
    let token;
    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) {
      token = auth.split(" ")[1];
    } else {
      // fallback to ?token=xyz for browsers that cannot set headers
      const url = new URL(req.url, `http://${req.headers.host}`);
      token = url.searchParams.get("token");
    }

    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    req.token = token;

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } catch (err) {
    console.error("WebSocket upgrade error:", err.message);
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
  }
});


// 🔥 Initialize WebSocket and get clients map
const { clients } = initWs(wss, { jwtSecret: JWT_SECRET });

(async () => {
  try {
    await initRabbitMQ(RABBIT_URL);
    console.log("Connected to RabbitMQ. Listening for follow events...");

    await subscribe(
  RABBIT_URL,
  EVENTS.CHAT_QUEUE,
  EVENTS.ROUTING_KEYS_ARRAY,
  async (payload, routingKey) => {
    try {
      const { doctorId, patientId } = payload;
      if (!doctorId || !patientId) return;

      const doctorSockets = clients.get(doctorId.toString()) || new Set();
      const patientSockets = clients.get(patientId.toString()) || new Set();

      // 🔥 Normalize routingKey to event name
      let eventName = "";

      if (routingKey === EVENTS.ROUTING_KEYS_OBJ.FOLLOW_REQUEST) {
        eventName = "FOLLOW_REQUEST";
        // nothing else required; doctor will see pending request
      }

      if (routingKey === EVENTS.ROUTING_KEYS_OBJ.FOLLOW_ACCEPTED) {
        eventName = "FOLLOW_ACCEPTED";

        await AllowedPair.updateOne(
          { doctorId, patientId },
          { $set: { active: true, createdAt: new Date() } },
          { upsert: true }
        );
      }

      if (routingKey === EVENTS.ROUTING_KEYS_OBJ.FOLLOW_UNFOLLOWED) {
        eventName = "FOLLOW_UNFOLLOWED";
        // Clean up AllowedPair when patient unfollows
        await AllowedPair.deleteOne({ doctorId, patientId });
      }

      if (routingKey === EVENTS.ROUTING_KEYS_OBJ.FOLLOW_REVOKED) {
        eventName = "FOLLOW_REVOKED";
        // Clean up AllowedPair when doctor revokes access
        await AllowedPair.deleteOne({ doctorId, patientId });
      }

      if (!eventName) return;

      [doctorSockets, patientSockets].forEach((socketSet) => {
        socketSet.forEach((sock) => {
          if (sock && sock.readyState === WebSocket.OPEN) {
            sock.send(
              JSON.stringify({
                type: "follow_notification",
                event: eventName,
                payload,
              })
            );
          }
        });
      });
    } catch (err) {
      console.error("RabbitMQ message handler error:", err);
    }
  }
);

  } catch (err) {
    console.log("Rabbit error:", err);
  }
})();

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the running process or change PORT in ChatService/.env.`
    );
  } else {
    console.error("Chat service startup error:", err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Chat service running on http://localhost:${PORT}`);
});
