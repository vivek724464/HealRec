import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserMinus, MessageSquare, Check } from "lucide-react";

const DoctorCard = ({
  name,
  specialty,
  experience,
  rating = 4.5,
  connectionStatus = "none",
  onConnect,
  onUnfollow,
  onMessage,
}) => {
  return (
    <Card className="hover:shadow-elevated transition-all duration-300 border-2 hover:border-primary/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-lg">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription>{specialty}</CardDescription>
            </div>
          </div>
          {connectionStatus === "connected" && (
            <Badge className="bg-accent">
              <Check className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
          {connectionStatus === "pending" && (
            <Badge variant="secondary">Pending</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Experience:</span>
          <span className="font-medium">{experience}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Rating:</span>
          <span className="font-medium">⭐ {rating}/5.0</span>
        </div>

        <div className="flex gap-2 pt-2">
          {connectionStatus === "none" && (
            <Button onClick={onConnect} className="flex-1">
              <UserPlus className="h-4 w-4 mr-2" />
              Follow
            </Button>
          )}
          {connectionStatus === "pending" && (
            <Button variant="outline" disabled className="flex-1">
              Request Sent
            </Button>
          )}
          {connectionStatus === "connected" && (
            <>
              <Button onClick={onMessage} className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button onClick={onUnfollow} variant="outline">
                <UserMinus className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;