import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import ConnectionRequestCard from "@/components/ConnectionRequestCard";
import FollowRequestPopup from "@/components/FollowRequestPopup";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { dataService } from "@/services/dataService";
import { useNotifications } from "@/context/NotificationContext";

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const { notifications, removeNotification } = useNotifications();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const doctorId = user?.id || user?._id;

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [reqRes, patRes] = await Promise.all([
          dataService.getPendingRequests(),
          dataService.getDoctorPatients(),
        ]);

        setRequests(reqRes?.data || []);
        setPatients(patRes?.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) fetchData();
  }, [doctorId]);

  /* ================= ACTIONS ================= */

  const handleAccept = async (patientId) => {
    try {
      await dataService.acceptFollowRequest(patientId);

      const accepted = requests.find(
        (r) => r.patient._id === patientId
      );

      setRequests((prev) =>
        prev.filter((r) => r.patient._id !== patientId)
      );

      if (accepted) {
        setPatients((prev) => [...prev, accepted]);
      }

      toast.success("Follow request accepted");
    } catch {
      toast.error("Failed to accept request");
    }
  };

  const handleDecline = async (patientId) => {
    try {
      await dataService.declineFollowRequest(patientId);

      setRequests((prev) =>
        prev.filter((r) => r.patient._id !== patientId)
      );

      toast.error("Follow request declined");
    } catch {
      toast.error("Failed to decline request");
    }
  };

  const handleRemovePatient = async (patientId) => {
  try {
    await dataService.removePatient(patientId);

    setPatients((prev) =>
      prev.filter((p) => (p.patient?._id || p._id) !== patientId)
    );

    toast.success("Patient removed");
  } catch (err) {
    console.error(err);
    toast.error("Failed to remove patient");
  }
};


  /* ================= REAL-TIME STATE UPDATES ================= */
  useEffect(() => {
    notifications.forEach((n) => {
      const patientId = n.payload?.patientId;
      if (!patientId) return;

      if (n.type === "FOLLOW_REQUEST") {
        setRequests((prev) => [
          {
            patient: {
              _id: patientId,
              name: n.payload.patientName,
            },
            createdAt: new Date(),
          },
          ...prev,
        ]);
      }

      if (
        n.type === "FOLLOW_UNFOLLOWED" ||
        n.type === "FOLLOW_REVOKED"
      ) {
        setPatients((prev) =>
          prev.filter((p) => p.patient._id !== patientId)
        );
      }
    });
  }, [notifications]);

  /* ================= STATS ================= */
  const stats = [
    {
      title: "Total Patients",
      value: patients.length.toString(),
      icon: Users,
      color: "from-primary to-primary/80",
    },
    {
      title: "Pending Requests",
      value: requests.length.toString(),
      icon: Clock,
      color: "from-accent to-accent/80",
    },
    {
      title: "Active Connections",
      value: patients.length.toString(),
      icon: UserCheck,
      color: "from-primary to-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation notificationCount={requests.length} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">
          Welcome, {user?.name || "Doctor"} 👨‍⚕️
        </h1>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((s) => (
            <Card key={s.title}>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{s.title}</p>
                  <p className="text-3xl font-bold">{s.value}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}
                >
                  <s.icon className="h-6 w-6 text-white" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="requests">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
          </TabsList>

          {/* REQUESTS */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                  Accept or decline follow requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {requests.length === 0 ? (
                  <p>No pending requests</p>
                ) : (
                  requests.map((r) => (
                    <ConnectionRequestCard
                      key={r.patient._id}
                      patientName={r.patient.name}
                      requestDate={new Date(
                        r.createdAt
                      ).toLocaleDateString()}
                      onAccept={() =>
                        handleAccept(r.patient._id)
                      }
                      onDecline={() =>
                        handleDecline(r.patient._id)
                      }
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PATIENTS */}
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>My Patients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patients.length === 0 ? (
                  <p>No connected patients</p>
                ) : (
                  patients.map(({ patient }) => (
                    <Card key={patient._id}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex gap-3 items-center">
                          <Avatar>
                            <AvatarFallback>
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold">
                            {patient.name}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              navigate(`/chat/${patient._id}`)
                            }
                          >
                            Chat
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleRemovePatient(patient._id)
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* REAL-TIME POPUPS */}
      {notifications.map((n, i) => (
        <FollowRequestPopup
          key={i}
          type={n.type}
          patientName={n.payload?.patientName}
          onAccept={() => handleAccept(n.payload.patientId)}
          onDecline={() => handleDecline(n.payload.patientId)}
          onClose={() => removeNotification(i)}
        />
      ))}
    </div>
  );
};

export default DoctorDashboard;
