import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MessageNotificationPopup = ({
  senderLabel = "New message",
  content = "",
  onClose,
}) => {
  return (
    <Card className="fixed top-6 right-6 w-96 z-50 shadow-xl animate-in slide-in-from-right">
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg">{senderLabel}</h3>
        <p className="text-sm text-muted-foreground">
          {content || "You received a new message."}
        </p>

        <Button className="w-full" onClick={onClose}>
          Close
        </Button>
      </CardContent>
    </Card>
  );
};

export default MessageNotificationPopup;
