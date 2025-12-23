import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, Clock } from "lucide-react";

const ConnectionRequestCard = ({
  patient,
  requestDate,
  message,
  onAccept,
  onDecline,
}) => {
  // ✅ SAFETY FIRST
  const patientName = patient?.name || "Unknown Patient";

  const initials = patientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="hover:shadow-elevated transition-all border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold">{patientName}</h4>

                {requestDate && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {requestDate}
                  </p>
                )}
              </div>
            </div>

            {message && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {message}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3">
              <Button onClick={onAccept} size="sm" className="flex-1">
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>

              <Button
                onClick={onDecline}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionRequestCard;
