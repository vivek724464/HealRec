import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FollowRequestPopup = ({
  type,
  patientName = "Patient",
  onAccept,
  onDecline,
  onClose,
}) => {
  let title = "";
  let message = "";
  let showActions = false;

  switch (type) {
    case "FOLLOW_REQUEST":
      title = "New Follow Request";
      message = `${patientName} wants to connect with you`;
      showActions = true;
      break;

    case "FOLLOW_REQUEST_CANCELLED":
      title = "Request Cancelled";
      message = `Follow request from ${patientName} was cancelled`;
      break;

    case "FOLLOW_UNFOLLOWED":
      title = "Patient Unfollowed";
      message = `${patientName} unfollowed you`;
      break;

    case "REMOVED_BY_DOCTOR":
      title = "Connection Removed";
      message = `${patientName} was removed from your patients`;
      break;

    default:
      return null;
  }

  return (
    <Card className="fixed top-6 right-6 w-96 z-50 shadow-xl animate-in slide-in-from-right">
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>

        <div className="flex gap-2 pt-2">
          {showActions ? (
            <>
              <Button
                className="flex-1"
                onClick={() => {
                  onAccept?.();
                  onClose?.();
                }}
              >
                Accept
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onDecline?.();
                  onClose?.();
                }}
              >
                Decline
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowRequestPopup;
