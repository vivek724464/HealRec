import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreVertical, Send } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CHAT_API =
  import.meta.env.VITE_CHAT_API_URL || "http://localhost:7000/HealRec";
const CHAT_WS = import.meta.env.VITE_WS_URL || "ws://localhost:7000";

const Chat = () => {
  const { userId: partnerId } = useParams();

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const bottomRef = useRef(null);
  const isUnmountingRef = useRef(false);
  const pendingMessagesRef = useRef([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserId = user?._id || user?.id;
  const token = localStorage.getItem("token");

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [connected, setConnected] = useState(false);

  const normalizeMessage = useCallback(
    (m) => ({
      _id: m._id,
      senderId: m.senderId?.toString?.() || m.senderId,
      content: m.isDeletedForEveryone ? "This message was deleted" : m.content,
      timestamp: m.timestamp,
      isForwarded: !!m.isForwarded,
      isDeletedForEveryone: !!m.isDeletedForEveryone,
      read: !!m.read,
      status: "sent",
    }),
    []
  );

  const flushPendingMessages = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    if (!pendingMessagesRef.current.length) return;

    pendingMessagesRef.current.forEach((msg) => {
      ws.send(
        JSON.stringify({
          type: "message",
          tempId: msg.tempId,
          receiverId: partnerId,
          content: msg.content,
        })
      );
    });

    pendingMessagesRef.current = [];
  }, [partnerId]);

  /* ================= LOAD OLD MESSAGES ================= */
  useEffect(() => {
    if (!partnerId || !currentUserId || !token) return;

    const loadMessages = async () => {
      try {
        const res = await fetch(
          `${CHAT_API}/messages/${currentUserId}/${partnerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error();
        const data = await res.json();
        setMessages((data.messages || []).map(normalizeMessage));
      } catch {
        toast.error("Failed to load messages");
      }
    };

    loadMessages();
  }, [partnerId, token, currentUserId, normalizeMessage]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= CONNECT SOCKET ================= */
  const connectSocket = useCallback(() => {
    if (!token) return;

    // Prevent duplicate connections
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const wsUrl = new URL(CHAT_WS);
    wsUrl.searchParams.set("token", token);
    const ws = new WebSocket(wsUrl.toString());
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Chat WS connected");
      setConnected(true);

      ws.send(
        JSON.stringify({
          type: "join_chat",
          with: partnerId,
        })
      );

      flushPendingMessages();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "message") {
          setMessages((prev) => {
            const exists = prev.some(
              (m) =>
                m.senderId === data.from &&
                m.timestamp === data.timestamp
            );
            if (exists) return prev;

            return [
              ...prev,
              {
                _id: data.messageId || crypto.randomUUID(),
                senderId: data.from,
                content: data.content,
                timestamp: data.timestamp,
                isForwarded: !!data.isForwarded,
                isDeletedForEveryone: false,
                read: false,
                status: "sent",
              },
            ];
          });
        }

        if (data.type === "sent" && data.tempId) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === data.tempId
                ? {
                    ...m,
                    _id: data.messageId,
                    timestamp: data.timestamp,
                    status: "sent",
                  }
                : m
            )
          );
        }

        if (data.type === "message_deleted_for_me" && data.messageId) {
          setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
        }

        if (data.type === "message_deleted_for_everyone" && data.messageId) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === data.messageId
                ? {
                    ...m,
                    content: "This message was deleted",
                    isDeletedForEveryone: true,
                  }
                : m
            )
          );
        }

        if (data.type === "error") {
          toast.error(data.message);
        }
      } catch {
        console.error("Invalid WS message");
      }
    };

    ws.onerror = () => {
      console.warn("⚠️ Chat socket error");
    };

    ws.onclose = () => {
      console.log("🔌 Chat socket closed");
      setConnected(false);
      wsRef.current = null;

      if (!isUnmountingRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSocket();
        }, 3000);
      }
    };
  }, [token, partnerId, flushPendingMessages]);

  /* ================= INIT SOCKET ================= */
  useEffect(() => {
    if (!partnerId || !token) return;

    isUnmountingRef.current = false;
    setMessages([]);
    connectSocket();

    return () => {
      isUnmountingRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN
      ) {
        wsRef.current.send(
          JSON.stringify({ type: "leave_chat" })
        );
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [partnerId, token, connectSocket]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = () => {
    const text = content.trim();
    if (!text) return;

    const tempId = crypto.randomUUID();
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      pendingMessagesRef.current.push({ tempId, content: text });
      connectSocket();
    } else {
      ws.send(
        JSON.stringify({
          type: "message",
          tempId,
          receiverId: partnerId,
          content: text,
        })
      );
    }

    setMessages((prev) => [
      ...prev,
      {
        _id: tempId,
        senderId: currentUserId,
        content: text,
        timestamp: new Date().toISOString(),
        isForwarded: false,
        isDeletedForEveryone: false,
        read: false,
        status: "sending",
      },
    ]);

    setContent("");
  };

  const deleteForMe = (messageId) => {
    if (!messageId) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Chat socket not connected");
      return;
    }
    wsRef.current?.send(
      JSON.stringify({
        type: "delete_for_me",
        messageId,
      })
    );
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  };

  const deleteForEveryone = (message) => {
    if (!message?._id) return;
    if (message.senderId !== currentUserId) {
      toast.error("Only sender can delete for everyone");
      return;
    }
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Chat socket not connected");
      return;
    }
    wsRef.current?.send(
      JSON.stringify({
        type: "delete_for_everyone",
        messageId: message._id,
      })
    );
    setMessages((prev) =>
      prev.map((m) =>
        m._id === message._id
          ? {
              ...m,
              content: "This message was deleted",
              isDeletedForEveryone: true,
            }
          : m
      )
    );
  };

  const forwardMessage = (message) => {
    if (!message?._id || message.isDeletedForEveryone) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Chat socket not connected");
      return;
    }

    const tempId = crypto.randomUUID();
    wsRef.current?.send(
      JSON.stringify({
        type: "forward_message",
        messageId: message._id,
        receiverId: partnerId,
        tempId,
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        _id: tempId,
        senderId: currentUserId,
        content: message.content,
        timestamp: new Date().toISOString(),
        isForwarded: true,
        isDeletedForEveryone: false,
        read: false,
        status: "sending",
      },
    ]);
  };

  const copyMessage = async (text) => {
    if (!text || text === "This message was deleted") return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Message copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const showMessageInfo = (message) => {
    const by = message.senderId === currentUserId ? "You" : "Partner";
    const when = new Date(message.timestamp).toLocaleString();
    const status = message.isDeletedForEveryone
      ? "Deleted for everyone"
      : message.status || "sent";
    const forwarded = message.isForwarded ? "Yes" : "No";

    window.alert(
      `Message Info\n\nFrom: ${by}\nTime: ${when}\nStatus: ${status}\nForwarded: ${forwarded}`
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto p-6 flex flex-col h-[calc(100vh-64px)]">
        <ScrollArea className="flex-1 border rounded p-4 mb-4">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`group flex items-center gap-1 mb-3 ${
                m.senderId === currentUserId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Message actions"
                    className="opacity-100 md:opacity-0 md:pointer-events-none transition-opacity md:group-hover:opacity-100 md:group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => copyMessage(m.content)}>
                    Copy message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => showMessageInfo(m)}>
                    Message info
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => forwardMessage(m)}>
                    Forward message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteForMe(m._id)}>
                    Delete for me
                  </DropdownMenuItem>
                  {m.senderId === currentUserId && !m.isDeletedForEveryone && (
                    <DropdownMenuItem onClick={() => deleteForEveryone(m)}>
                      Delete for everyone
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <div
                className={`max-w-[70%] p-3 rounded-xl ${
                  m.senderId === currentUserId
                    ? "bg-primary text-white"
                    : "bg-secondary"
                }`}
              >
                {m.isForwarded && (
                  <p className="text-xs opacity-80 mb-1">Forwarded</p>
                )}
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              connected ? "Type a message..." : "Connecting..."
            }
            disabled={!connected}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage} disabled={!connected}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
