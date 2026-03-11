import { createContext, useContext, useEffect, useRef, useState } from "react";

const NotificationContext = createContext(null);
const FOLLOW_EVENT_TYPES = new Set([
  "FOLLOW_REQUEST",
  "FOLLOW_ACCEPTED",
  "FOLLOW_DECLINED",
  "FOLLOW_UNFOLLOWED",
  "FOLLOW_REVOKED",
  "REMOVED_BY_DOCTOR",
  "FOLLOW_REQUEST_CANCELLED",
]);

export const NotificationProvider = ({ children }) => {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isManuallyClosedRef = useRef(false);
  const popupTimeoutsRef = useRef(new Map());

  const [notifications, setNotifications] = useState([]);
  const [popups, setPopups] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", syncToken);
    window.addEventListener("healrec-auth-changed", syncToken);

    return () => {
      window.removeEventListener("storage", syncToken);
      window.removeEventListener("healrec-auth-changed", syncToken);
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    if (wsRef.current) return;

    const connect = () => {
      const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:7000";
      const wsUrl = new URL(WS_BASE);
      wsUrl.searchParams.set("token", token);
      const ws = new WebSocket(wsUrl.toString());
      wsRef.current = ws;
      isManuallyClosedRef.current = false;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("✅ Global WS connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          let followType = null;
          let payload = null;

          if (data.type === "follow_notification") {
            followType = data.event;
            payload = data.payload;
          } else if (FOLLOW_EVENT_TYPES.has(data.type)) {
            followType = data.type;
            payload = data.payload;
          }

          if (followType) {
            const id = `${followType}:${payload?.doctorId || ""}:${
              payload?.patientId || ""
            }:${Date.now()}`;
            const event = {
              id,
              type: followType,
              payload: payload || {},
            };

            setNotifications((prev) => [event, ...prev]);
            setPopups((prev) => [event, ...prev]);

            // Auto-close informational popups after 8s.
            if (followType !== "FOLLOW_REQUEST") {
              const timeoutId = setTimeout(() => {
                setPopups((prev) => prev.filter((p) => p.id !== id));
                popupTimeoutsRef.current.delete(id);
              }, 8000);
              popupTimeoutsRef.current.set(id, timeoutId);
            }
            return;
          }

          if (data.type === "notification") {
            const id = `MESSAGE_NOTIFICATION:${data.from || ""}:${Date.now()}`;
            const event = {
              id,
              type: "MESSAGE_NOTIFICATION",
              payload: {
                from: data.from,
                content: data.content || "",
                timestamp: data.timestamp,
              },
            };

            setPopups((prev) => [event, ...prev]);

            const timeoutId = setTimeout(() => {
              setPopups((prev) => prev.filter((p) => p.id !== id));
              popupTimeoutsRef.current.delete(id);
            }, 8000);
            popupTimeoutsRef.current.set(id, timeoutId);

            return;
          }
        } catch (err) {
          console.error("Invalid WS message", err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        if (!isManuallyClosedRef.current) {
          reconnectTimeoutRef.current = setTimeout(connect, 2000);
        }
      };
    };

    connect();

    return () => {
      isManuallyClosedRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      popupTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      popupTimeoutsRef.current.clear();

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [token]);

  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };
  const removePopup = (popupId) => {
    const timeoutId = popupTimeoutsRef.current.get(popupId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      popupTimeoutsRef.current.delete(popupId);
    }
    setPopups((prev) => prev.filter((p) => p.id !== popupId));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        removeNotification,
        popups,
        removePopup,
        isConnected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};
