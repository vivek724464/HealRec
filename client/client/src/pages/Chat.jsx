import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { toast } from "sonner";

const CHAT_API = "http://localhost:4444/HealRec";
const CHAT_WS = "ws://localhost:4444";

const Chat = () => {
  const { userId: partnerId } = useParams();

  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  /* ================= LOAD OLD MESSAGES ================= */
  useEffect(() => {
    if (!partnerId || !user || !token) return;

    fetch(`${CHAT_API}/messages/${user._id}/${partnerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("History fetch failed");
        return res.json();
      })
      .then((data) => setMessages(data.messages || []))
      .catch(() => toast.error("Failed to load messages"));
  }, [partnerId]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= WEBSOCKET ================= */
  useEffect(() => {
    if (!token || !partnerId) return;

    const ws = new WebSocket(`${CHAT_WS}/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Chat WS connected");
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        if (data.type === "message") {
          setMessages((prev) => [
            ...prev,
            {
              senderId: data.from,
              content: data.content,
              timestamp: data.timestamp,
            },
          ]);
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
      wsRef.current = null;
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [partnerId]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = () => {
    if (!content.trim()) return;

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Chat socket not connected");
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "message",
        receiverId: partnerId,
        content,
      })
    );

    // optimistic UI
    setMessages((prev) => [
      ...prev,
      {
        senderId: user._id,
        content,
        timestamp: new Date().toISOString(),
      },
    ]);

    setContent("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto p-6 flex flex-col h-[calc(100vh-64px)]">
        <ScrollArea className="flex-1 border rounded p-4 mb-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex mb-3 ${
                m.senderId === user._id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-xl ${
                  m.senderId === user._id
                    ? "bg-primary text-white"
                    : "bg-secondary"
                }`}
              >
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
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
