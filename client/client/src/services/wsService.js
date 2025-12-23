let socket = null;

export const connectWebSocket = ({ token, onMessage, onClose }) => {
  if (!token) return;

  const WS_URL =
    import.meta.env.VITE_WS_URL || "ws://localhost:5000/ws";

  socket = new WebSocket(`${WS_URL}?token=${token}`);

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    } catch (err) {
      console.error("WS parse error", err);
    }
  };

  socket.onclose = () => {
    console.log("❌ WebSocket disconnected");
    onClose?.();
  };

  socket.onerror = (err) => {
    console.error("WebSocket error", err);
  };
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
