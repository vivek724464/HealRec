const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const Notification = require("../models/notificationSchema");

const clients = new Map(); // userId -> ws

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    ws.on("message", async (message) => {
      let data;
      try {
        data = JSON.parse(message);
      } catch {
        return;
      }

      if (data.type === "AUTH") {
        try {
          const decoded = jwt.verify(data.token, process.env.JWT_SECRET);

          ws.userId = decoded.id;
          ws.role = decoded.role;

          clients.set(ws.userId.toString(), ws);
          const pending = await Notification.find({
            userId: ws.userId,
            isRead: false,
          }).sort({ createdAt: 1 });

          for (const n of pending) {
            ws.send(
              JSON.stringify({
                type: n.type,
                payload: n.payload,
              })
            );
            n.isRead = true;
            await n.save();
          }
        } catch (err) {
          ws.close();
        }
      }
    });

    ws.on("close", () => {
      if (ws.userId) {
        clients.delete(ws.userId.toString());
      }
    });
  });
}

async function notifyUser(userId, role, type, payload) {
  const notification = await Notification.create({
    userId,
    role,
    type,
    payload,
  });

  const ws = clients.get(userId.toString());

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
    notification.isRead = true;
    await notification.save();
  }
}

module.exports = {
  initWebSocket,
  notifyUser,
};
