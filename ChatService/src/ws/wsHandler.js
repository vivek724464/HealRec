const WebSocket = require("ws");
const jwt = require("jsonwebtoken");

const Message = require("../models/message");
const AllowedPair = require("../models/AllowedPair");

const clients = new Map();
function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}
async function isPairAllowed(doctorId, patientId) {
  return await AllowedPair.findOne({ doctorId, patientId, active: true });
}

function initWs(wss, { jwtSecret }) {
  if (!jwtSecret) throw new Error("jwtSecret required");
  wss.on("connection", (ws, req) => {
    const token = req.token;
    const user = verifyToken(token, jwtSecret);

    if (!user) {
      ws.send(JSON.stringify({
        type: "error",
        message: "Invalid token"
      }));
      ws.close();
      return;
    }
    ws.userId = user.id;
    ws.role = user.role;
    ws.isAlive = true;
    clients.set(ws.userId, ws);
    ws.send(JSON.stringify({
      type: "info",
      message: "Authenticated",
      userId: ws.userId,
      role: ws.role
    }));
    ws.on("pong", () => {
      (ws.isAlive = true)
    });
    ws.on("message", async (raw) => {
      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        ws.send(JSON.stringify({
          type: "error",
          message: "Invalid JSON"
        }));
        return;
      }

      try {

        if (data.type === "history") {
          const senderId = ws.userId;
          const otherId = data.with;

          if (!otherId) {
            ws.send(JSON.stringify({
              type: "error",
              message: "Missing 'with' field"
            }));
            return;
          }

          const messages = await Message.find({
            $or: [
              { senderId, receiverId: otherId },
              { senderId: otherId, receiverId: senderId }
            ]
          })
            .sort({ timestamp: 1 })
            .limit(50);

          ws.send(JSON.stringify({
            type: "history",
            messages
          }));

          return;
        }

        if (data.type === "message") {
          const senderId = ws.userId;
          const senderRole = ws.role;
          const receiverId = (data.receiverId).toString();
          const content = (data.content).trim();

          if (!senderId || !receiverId || !content) {
            ws.send(JSON.stringify({
              type: "error",
              message: "Invalid message payload"
            }));
            return;
          }
          let doctorId, patientId;
          if (senderRole === "doctor") {
            doctorId = senderId;
            patientId = receiverId;
          } else {
            doctorId = receiverId;
            patientId = senderId;
          }
          const allowed = await isPairAllowed(doctorId, patientId);
          if (!allowed) {
            ws.send(JSON.stringify({
              type: "error",
              message: "You are not allowed to chat"
            }));
            return;
          }
          const msgDoc = await Message.create({
            senderId,
            receiverId,
            senderModel: senderRole === "doctor" ? "Doctor" : "Patient",
            receiverModel: senderRole === "doctor" ? "Patient" : "Doctor",
            content,
          });
          const receiverSocket = clients.get(receiverId);
          if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
            receiverSocket.send(JSON.stringify({
              type: "message",
              from: senderId,
              content,
              timestamp: msgDoc.timestamp,
              messageId: msgDoc._id
            }));
          }
          ws.send(JSON.stringify({
            type: "sent",
            messageId: msgDoc._id,
            timestamp: msgDoc.timestamp
          }));
        }
      } catch (err) {
        console.log(err.message);
        ws.send(JSON.stringify({
          type: "error",
          message: "Server error"
        }));
      }
    });

    ws.on("close", () => {
      clients.delete(ws.userId);
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((socket) => {
      if (!socket.isAlive) return socket.terminate();
      socket.isAlive = false;
      socket.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));
}

module.exports = { initWs };
