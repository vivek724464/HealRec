import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ChatList = () => {
  const navigate = useNavigate();
  const { userId: activeId } = useParams();

  const user = JSON.parse(localStorage.getItem("user"));
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!user) return;

    const url =
      user.role === "doctor"
        ? "/followers/get-followers"
        : "/followers/get-followed-doctors";

    api.get(url).then((res) => {
      const list =
        user.role === "doctor"
          ? res.data.followers.map((f) => f.patient)
          : res.data.following.map((f) => f.doctor);

      setChats(list || []);
    });
  }, []);

  return (
    <div className="w-72 border-r p-4">
      <h3 className="font-semibold mb-3">Chats</h3>

      <ScrollArea className="h-full">
        {chats.map((c) => (
          <div
            key={c._id}
            onClick={() => navigate(`/chat/${c._id}`)}
            className={`flex items-center gap-3 p-2 rounded cursor-pointer mb-1 ${
              activeId === c._id
                ? "bg-primary/10"
                : "hover:bg-muted"
            }`}
          >
            <Avatar>
              <AvatarFallback>
                {c.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {c.role}
              </p>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default ChatList;
