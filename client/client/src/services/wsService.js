let socket = null;

export const connectWebSocket = ({ token, onMessage, onClose }) => {
  if (!token) {
    console.error("❌ Token is required to connect WebSocket");
    return;
  }

  const WS_BASE =
    import.meta.env.VITE_WS_URL || "ws://localhost:7000";

  socket = new WebSocket(WS_BASE);

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
    // Send authentication after connection
    socket.send(JSON.stringify({
      type: "AUTH",
      token: token,
    }));
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    } catch (err) {
      console.error("❌ WebSocket parse error:", err);
    }
  };

  socket.onclose = (event) => {
    console.log("❌ WebSocket disconnected", event.code);
    onClose?.();
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
  };
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};