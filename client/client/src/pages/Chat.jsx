import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Paperclip, FileText, Image as ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { dataService } from "@/services/dataService";
import { toast } from "sonner";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const currentUserId = user._id;

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const chatsData = await dataService.getUserChats();
        setChats(chatsData?.data || []);
        if ((chatsData?.data || []).length > 0) {
          setSelectedChat((chatsData?.data || [])[0]._id);
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
        toast.error("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [currentUserId]);

  // WebSocket connection for real-time messages
  useEffect(() => {
    const WS_URL = import.meta.env.VITE_CHAT_WS_URL || "ws://localhost:4444";
    try {
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected to", WS_URL);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          // Expect payload shape: { type: 'message', chatId, message }
          if (payload?.type === "message") {
            // If message belongs to current chat, append it
            if (payload.chatId === selectedChat) {
              setMessages((m) => [...m, payload.message]);
            }
            // Optionally update chat list (unread counts)
            setChats((prev) => {
              const idx = prev.findIndex((c) => c._id === payload.chatId);
              if (idx === -1) return prev;
              const copy = [...prev];
              copy[idx] = { ...copy[idx], lastMessage: payload.message.content, unread: (copy[idx].unread || 0) + 1 };
              return copy;
            });
          }
        } catch (err) {
          console.error("Invalid WS message", err);
        }
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected");
      };
    } catch (err) {
      console.warn("Failed to connect WebSocket", err);
    }

    return () => {
      try {
        wsRef.current && wsRef.current.close();
      } catch (e) {}
    };
  }, [selectedChat]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      try {
        const messagesData = await dataService.getChatHistory(currentUserId, selectedChat);
        setMessages(messagesData?.data || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
        toast.error("Failed to load messages");
      }
    };

    fetchMessages();
  }, [selectedChat, currentUserId]);

  const handleSend = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      // Prefer WebSocket if available
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({ type: "message", chatId: selectedChat, message: { content: message, senderId: currentUserId, senderName: user.name } })
        );
      } else {
        await dataService.sendMessage(selectedChat, message);
      }
      setMessage("");
      // Refetch messages to show the newly sent message
      const messagesData = await dataService.getChatHistory(currentUserId, selectedChat);
      setMessages(messagesData?.data || []);
      toast.success("Message sent");
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };

  const selectedChatData = chats.find(c => c._id === selectedChat);

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        userRole={user?.role || "patient"}
        userName={user?.name || "User"}
        notificationCount={chats.filter(c => c.unread > 0).length}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
          {/* Chat List */}
          <Card className="lg:col-span-4 shadow-elevated">
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-280px)]">
                {loading ? (
                  <p className="p-4 text-muted-foreground">Loading chats...</p>
                ) : chats.length === 0 ? (
                  <p className="p-4 text-muted-foreground">No chats yet</p>
                ) : (
                  chats.map((chat) => (
                    <div
                      key={chat._id}
                      onClick={() => setSelectedChat(chat._id)}
                      className={`p-4 border-b cursor-pointer transition-colors hover:bg-secondary/50 ${
                        selectedChat === chat._id ? "bg-secondary" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                            {chat.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold truncate">{chat.name}</h4>
                            <span className="text-xs text-muted-foreground">
                              {chat.lastMessageTime || "N/A"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.role || chat.specialty || "User"}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage || "No messages yet"}
                          </p>
                        </div>
                        {chat.unread > 0 && (
                          <Badge className="bg-primary">{chat.unread}</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          {selectedChatData ? (
            <Card className="lg:col-span-8 shadow-elevated flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                      {selectedChatData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedChatData.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedChatData.role || selectedChatData.specialty || "User"}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex gap-3 ${
                          msg.senderId === currentUserId ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar className="flex-shrink-0">
                          <AvatarFallback
                            className={
                              msg.senderId === currentUserId
                                ? "bg-primary"
                                : "bg-gradient-to-br from-primary to-accent"
                            }
                          >
                            {msg.senderName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`flex flex-col gap-1 max-w-[70%] ${
                            msg.senderId === currentUserId ? "items-end" : ""
                          }`}
                        >
                          <div
                            className={`rounded-2xl p-4 ${
                              msg.senderId === currentUserId
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            {msg.attachment && (
                              <div
                                className={`mt-2 p-3 rounded-lg flex items-center gap-2 ${
                                  msg.senderId === currentUserId
                                    ? "bg-primary-foreground/10"
                                    : "bg-background"
                                }`}
                              >
                                {msg.attachment.type === "pdf" ? (
                                  <FileText className="h-4 w-4" />
                                ) : (
                                  <ImageIcon className="h-4 w-4" />
                                )}
                                <span className="text-xs">
                                  {msg.attachment.name}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground px-2">
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <CardContent className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} size="icon">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="lg:col-span-8 shadow-elevated flex items-center justify-center">
              <p className="text-muted-foreground">Select a chat to start messaging</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;