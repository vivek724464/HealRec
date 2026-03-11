import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PatientFollowPopup = ({ type, doctorName = "Doctor", onClose }) => {
  const isAccepted = type === "FOLLOW_ACCEPTED";
  const isDeclined = type === "FOLLOW_DECLINED";
  const isRemoved = type === "REMOVED_BY_DOCTOR";
  const isUnfollowed = type === "FOLLOW_UNFOLLOWED";
  const isRevoked = type === "FOLLOW_REVOKED";

  const title = isAccepted
    ? "Request Accepted"
    : isDeclined
    ? "Request Declined"
    : isRemoved
    ? "Removed by Doctor"
    : "Connection Updated";

  const message = isAccepted
    ? `${doctorName} accepted your follow request`
    : isDeclined
    ? `${doctorName} declined your follow request`
    : isRemoved
    ? `${doctorName} removed you`
    : isUnfollowed || isRevoked
    ? `Your connection with ${doctorName} has ended`
    : `Connection status changed with ${doctorName}`;

  return (
    <Card className="fixed top-6 right-6 w-96 z-50 shadow-xl animate-in slide-in-from-right">
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg">{title}</h3>

        <p className="text-sm text-muted-foreground">{message}</p>

        <Button className="w-full" onClick={onClose}>
          Close
        </Button>
      </CardContent>
    </Card>
  );
};

export default PatientFollowPopup;
