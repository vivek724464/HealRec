const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Message = require("../models/message");
const AllowedPair = require("../models/AllowedPair");

/* ================= GLOBAL MAPS ================= */

const clients = new Map();
const activeChats = new Map();

/* ================= TOKEN VERIFY ================= */

function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}

/* ================= CHECK ALLOWED PAIR ================= */

async function isPairAllowed(doctorId, patientId) {
  return await AllowedPair.findOne({
    doctorId: new mongoose.Types.ObjectId(doctorId),
    patientId: new mongoose.Types.ObjectId(patientId),
    active: true,
  });
}

function sendToUserSockets(clientsMap, userId, payload) {
  const sockets = clientsMap.get(userId?.toString()) || new Set();
  sockets.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  });
}

/* ================= INIT WEBSOCKET ================= */

function initWs(wss, { jwtSecret }) {
  if (!jwtSecret) throw new Error("jwtSecret required");

  wss.on("connection", (ws, req) => {
    const token = req.token;

    const user = verifyToken(token, jwtSecret);

    if (!user) {
      const errorMsg = JSON.stringify({ type: "error", message: "Invalid token" });
      ws.send(errorMsg);
      setTimeout(() => ws.close(4001, "Unauthorized"), 100);
      return;
    }

    ws.userId = user.id.toString();
    ws.role = user.role;
    ws.isAlive = true;

    const userSockets = clients.get(ws.userId) || new Set();
    userSockets.add(ws);
    clients.set(ws.userId, userSockets);

    console.log("✅ User connected:", ws.userId, "Role:", ws.role);

    ws.send(
      JSON.stringify({
        type: "info",
        message: "Authenticated",
        userId: ws.userId,
        role: ws.role,
      })
    );

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    /* ================= MESSAGE HANDLER ================= */

    ws.on("message", async (raw) => {
      let data;

      try {
        data = JSON.parse(raw);
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
      }

      try {
        /* ================= JOIN CHAT ================= */

        if (data.type === "join_chat") {
          const chattingWith = data.with?.toString();
          if (!chattingWith) return;

          activeChats.set(ws.userId, chattingWith);
          ws.activeChatWith = chattingWith;
          console.log(`${ws.userId} is now chatting with ${chattingWith}`);
          return;
        }

        /* ================= LEAVE CHAT ================= */

        if (data.type === "leave_chat") {
          ws.activeChatWith = null;
          activeChats.delete(ws.userId);
          console.log(`${ws.userId} left chat`);
          return;
        }

        /* ================= HISTORY ================= */

        if (data.type === "history") {
          const senderId = ws.userId;
          const otherId = data.with?.toString();

          if (!otherId) {
            ws.send(JSON.stringify({ type: "error", message: "Missing 'with' field" }));
            return;
          }

          const messages = await Message.find({
            $or: [
              { senderId, receiverId: otherId },
              { senderId: otherId, receiverId: senderId },
            ],
          })
            .sort({ timestamp: 1 })
            .limit(50);

          ws.send(JSON.stringify({ type: "history", messages }));
          return;
        }

        /* ================= SEND MESSAGE ================= */

        if (data.type === "message") {
          const senderId = ws.userId;
          const senderRole = ws.role;
          const receiverId = data.receiverId?.toString();
          const content = data.content?.trim();
          const tempId = data.tempId;

          if (!senderId || !receiverId || !content) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid message payload" }));
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
            ws.send(JSON.stringify({ type: "error", message: "You are not allowed to chat" }));
            return;
          }

          /* Save message */
          const msgDoc = await Message.create({
            senderId,
            receiverId,
            senderModel: senderRole === "doctor" ? "Doctor" : "Patient",
            receiverModel: senderRole === "doctor" ? "Patient" : "Doctor",
            content,
          });

          const receiverSockets = clients.get(receiverId) || new Set();
          receiverSockets.forEach((receiverSocket) => {
            if (receiverSocket.readyState !== WebSocket.OPEN) return;

            const isSocketInActiveChat =
              receiverSocket.activeChatWith === senderId;

            if (isSocketInActiveChat) {
              receiverSocket.send(
                JSON.stringify({
                  type: "message",
                  from: senderId,
                  content,
                  timestamp: msgDoc.timestamp,
                  messageId: msgDoc._id,
                  isForwarded: msgDoc.isForwarded,
                  forwardedFrom: msgDoc.forwardedFrom || null,
                })
              );
            } else {
              receiverSocket.send(
                JSON.stringify({
                  type: "notification",
                  from: senderId,
                  content,
                  timestamp: msgDoc.timestamp,
                })
              );
            }
          });

          // Acknowledge sender
          ws.send(
            JSON.stringify({
              type: "sent",
              messageId: msgDoc._id,
              timestamp: msgDoc.timestamp,
              tempId: tempId || null,
            })
          );
          return;
        }

        if (data.type === "delete_for_me") {
          const messageId = data.messageId?.toString();
          if (!messageId) {
            ws.send(JSON.stringify({ type: "error", message: "Missing messageId" }));
            return;
          }

          const message = await Message.findById(messageId);
          if (!message) {
            ws.send(JSON.stringify({ type: "error", message: "Message not found" }));
            return;
          }

          const userId = ws.userId.toString();
          const senderId = message.senderId.toString();
          const receiverId = message.receiverId.toString();
          if (userId !== senderId && userId !== receiverId) {
            ws.send(JSON.stringify({ type: "error", message: "Not allowed" }));
            return;
          }

          await Message.updateOne(
            { _id: messageId },
            { $addToSet: { deletedFor: new mongoose.Types.ObjectId(userId) } }
          );

          ws.send(JSON.stringify({ type: "message_deleted_for_me", messageId }));
          return;
        }

        if (data.type === "delete_for_everyone") {
          const messageId = data.messageId?.toString();
          if (!messageId) {
            ws.send(JSON.stringify({ type: "error", message: "Missing messageId" }));
            return;
          }

          const message = await Message.findById(messageId);
          if (!message) {
            ws.send(JSON.stringify({ type: "error", message: "Message not found" }));
            return;
          }

          if (message.senderId.toString() !== ws.userId.toString()) {
            ws.send(JSON.stringify({ type: "error", message: "Only sender can delete for everyone" }));
            return;
          }

          await Message.updateOne(
            { _id: messageId },
            {
              $set: {
                isDeletedForEveryone: true,
                deletedForEveryoneAt: new Date(),
              },
            }
          );

          const payload = {
            type: "message_deleted_for_everyone",
            messageId,
            deletedBy: ws.userId,
          };

          sendToUserSockets(clients, message.senderId, payload);
          sendToUserSockets(clients, message.receiverId, payload);
          return;
        }

        if (data.type === "forward_message") {
          const senderId = ws.userId.toString();
          const senderRole = ws.role;
          const receiverId = data.receiverId?.toString();
          const messageId = data.messageId?.toString();
          const tempId = data.tempId;

          if (!receiverId || !messageId) {
            ws.send(JSON.stringify({ type: "error", message: "Missing forward payload" }));
            return;
          }

          const original = await Message.findById(messageId);
          if (!original) {
            ws.send(JSON.stringify({ type: "error", message: "Original message not found" }));
            return;
          }

          const participantIds = [
            original.senderId.toString(),
            original.receiverId.toString(),
          ];

          if (!participantIds.includes(senderId)) {
            ws.send(JSON.stringify({ type: "error", message: "Not allowed to forward this message" }));
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
            ws.send(JSON.stringify({ type: "error", message: "You are not allowed to chat" }));
            return;
          }

          const msgDoc = await Message.create({
            senderId,
            receiverId,
            senderModel: senderRole === "doctor" ? "Doctor" : "Patient",
            receiverModel: senderRole === "doctor" ? "Patient" : "Doctor",
            content: original.content,
            isForwarded: true,
            forwardedFrom: original._id,
          });

          const receiverSockets = clients.get(receiverId) || new Set();
          receiverSockets.forEach((receiverSocket) => {
            if (receiverSocket.readyState !== WebSocket.OPEN) return;

            const isSocketInActiveChat =
              receiverSocket.activeChatWith === senderId;

            if (isSocketInActiveChat) {
              receiverSocket.send(
                JSON.stringify({
                  type: "message",
                  from: senderId,
                  content: msgDoc.content,
                  timestamp: msgDoc.timestamp,
                  messageId: msgDoc._id,
                  isForwarded: true,
                  forwardedFrom: original._id,
                })
              );
            } else {
              receiverSocket.send(
                JSON.stringify({
                  type: "notification",
                  from: senderId,
                  content: msgDoc.content,
                  timestamp: msgDoc.timestamp,
                })
              );
            }
          });

          ws.send(
            JSON.stringify({
              type: "sent",
              messageId: msgDoc._id,
              timestamp: msgDoc.timestamp,
              tempId: tempId || null,
            })
          );
        }
      } catch (err) {
        console.log("WS error:", err.message);
        ws.send(JSON.stringify({ type: "error", message: "Server error" }));
      }
    });

    /* ================= DISCONNECT ================= */

    ws.on("close", () => {
      if (ws.userId) {
        console.log("❌ User disconnected:", ws.userId);
        const userSockets = clients.get(ws.userId);
        if (userSockets) {
          userSockets.delete(ws);
          if (!userSockets.size) {
            clients.delete(ws.userId);
            activeChats.delete(ws.userId);
          }
        }
      }
    });

    ws.on("error", (err) => {
      console.error("❌ WebSocket error for user", ws.userId, ":", err.message);
    });
  });

  /* ================= HEARTBEAT ================= */

  const interval = setInterval(() => {
    wss.clients.forEach((socket) => {
      if (!socket.isAlive) return socket.terminate();
      socket.isAlive = false;
      socket.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));

  /* ================= IMPORTANT FIX ================= */
  return {
    clients,
    activeChats,
  };
}

module.exports = { initWs };
