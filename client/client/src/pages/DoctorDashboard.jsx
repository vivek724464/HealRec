import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import ConnectionRequestCard from "@/components/ConnectionRequestCard";
import DoctorCard from "@/components/DoctorCard";
import MedicalRecordCard from "@/components/MedicalRecordCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserCheck, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { dataService } from "@/services/dataService";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const doctorId = user._id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [requestsData, patientsData, recordsData] = await Promise.all([
          dataService.getPendingRequests(),
          dataService.getDoctorPatients(),
          dataService.getSharedRecords(),
        ]);
        setRequests(requestsData?.data || []);
        setPatients(patientsData?.data || []);
        setRecords(recordsData?.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchData();
    }
  }, [doctorId]);

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
      value: patients.filter(p => p.isActive).length.toString(),
      icon: UserCheck,
      color: "from-primary to-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        userRole="doctor"
        userName={user?.name || "Doctor"}
        notificationCount={requests.length}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Good morning, {user?.name || "Doctor"}! 👨‍⚕️
          </h1>
          <p className="text-muted-foreground">
            Manage your patients and review medical records
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="hover:shadow-elevated transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Follow Requests</TabsTrigger>
            <TabsTrigger value="patients">My Patients</TabsTrigger>
            <TabsTrigger value="records">Patient Records</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Follow Requests</CardTitle>
                <CardDescription>
                  Review and respond to patient connection requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground">Loading requests...</p>
                ) : requests.length === 0 ? (
                  <p className="text-muted-foreground">No pending requests.</p>
                ) : (
                  requests.map((request) => (
                    <ConnectionRequestCard
                      key={request._id}
                      {...request}
                      onAccept={() =>
                        toast.success(`Accepted request`)
                      }
                      onDecline={() =>
                        toast.error(`Declined request`)
                      }
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Patients</CardTitle>
                <CardDescription>
                  View and manage your connected patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-muted-foreground">Loading patients...</p>
                  ) : patients.length === 0 ? (
                    <p className="text-muted-foreground">No patients connected yet.</p>
                  ) : (
                    patients.map((patient) => (
                      <Card
                        key={patient._id}
                        className="hover:shadow-elevated transition-all"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                                  {patient.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">{patient.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Last visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "N/A"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {patient.recordsCount || 0} medical records
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/patient/${patient._id}`)}
                              >
                                View Records
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => navigate(`/chat/${patient._id}`)}
                              >
                                Message
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Patient Records</CardTitle>
                <CardDescription>
                  View recently shared medical documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground">Loading records...</p>
                ) : records.length === 0 ? (
                  <p className="text-muted-foreground">No shared records yet.</p>
                ) : (
                  records.map((record) => (
                    <div key={record._id} className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Shared by {record.patientName || "Patient"}
                      </p>
                      <MedicalRecordCard
                        {...record}
                        onView={() =>
                          toast.info(`Viewing ${record.fileName}`)
                        }
                        onDownload={() =>
                          toast.success(`Downloading ${record.fileName}`)
                        }
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DoctorDashboard;