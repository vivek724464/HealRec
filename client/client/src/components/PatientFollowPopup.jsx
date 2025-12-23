import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PatientFollowPopup = ({ type, doctorName, onClose }) => {
  const isAccepted = type === "FOLLOW_ACCEPTED";
  const isDeclined = type === "FOLLOW_DECLINED";
  const isRemoved = type === "REMOVED_BY_DOCTOR";

  return (
    <Card className="fixed top-6 right-6 w-96 z-50 shadow-xl animate-in slide-in-from-right">
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg">
          {isAccepted ? "Request Accepted" : isRemoved ? "Removed by Doctor" : "Request Declined"}
        </h3>

        <p className="text-sm text-muted-foreground">
          {isAccepted
            ? `${doctorName} accepted your follow request`
            : isRemoved
            ? `${doctorName} removed you`
            : `${doctorName} declined your follow request`}
        </p>

        <Button className="w-full" onClick={onClose}>
          Close
        </Button>
      </CardContent>
    </Card>
  );
};

export default PatientFollowPopup;
