import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Navigation from "@/components/Navigation";
import FileUploadCard from "@/components/FileUploadCard";
import MedicalRecordViewer from "@/components/MedicalRecordViewer";
import DoctorCard from "@/components/DoctorCard";
import MedicalRecordCard from "@/components/MedicalRecordCard";
import PatientFollowPopup from "@/components/PatientFollowPopup";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { dataService } from "@/services/dataService";
import { authService } from "@/services/authService";
import { useNotifications } from "@/context/NotificationContext";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const patientId = user?.id;

  const { notifications, removeNotification } = useNotifications();

  const [doctors, setDoctors] = useState([]);
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    if (!patientId) return;

    const fetchData = async () => {
      try {
        const [docsRes, recRes] = await Promise.all([
          dataService.getFollowingDoctors(),
          dataService.getReports(patientId),
        ]);

        setDoctors(docsRes.data || []);
        setRecords(recRes.data || []);
      } catch {
        toast.error("Failed to load dashboard");
      }
    };

    fetchData();
  }, [patientId]);

  /* ================= REAL-TIME NOTIFICATIONS ================= */
  useEffect(() => {
    notifications.forEach((n) => {
      const doctorId = n.payload?.doctorId;
      if (!doctorId) return;

      // ✅ Doctor accepted request
      if (n.type === "FOLLOW_ACCEPTED") {
        setDoctors((prev) =>
          prev.map((d) =>
            d._id === doctorId
              ? { ...d, connectionStatus: "connected" }
              : d
          )
        );
      }

      // ❌ Doctor declined request
      if (n.type === "FOLLOW_DECLINED") {
        setDoctors((prev) =>
          prev.filter((d) => d._id !== doctorId)
        );
      }
      // ❌ Doctor removed patient
      if (n.type === "REMOVED_BY_DOCTOR") {
        setDoctors((prev) =>
          prev.filter((d) => d._id !== doctorId)
        );
      } 
    });
  }, [notifications]);

  /* ================= SEARCH ================= */
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setSearching(true);
        const res = await dataService.searchDoctors(searchQuery);

        setSearchResults(
          res.data.filter(
            (d) => !doctors.some((x) => x._id === d._id)
          )
        );
      } catch {
        toast.error("Search failed");
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, doctors]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole="patient" userName={user?.name} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <h1 className="text-4xl font-bold">
            Welcome back, {user?.name} 👋
          </h1>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* SEARCH RESULTS */}
        {searchQuery.length >= 2 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                Doctors matching “{searchQuery}”
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              {searching ? (
                <p>Searching...</p>
              ) : (
                searchResults.map((doc) => (
                  <DoctorCard
                    key={doc._id}
                    {...doc}
                    connectionStatus="none"
                    onConnect={async () => {
                      await dataService.sendFollowRequest(doc._id);
                      toast.success("Follow request sent");

                      setSearchResults((prev) =>
                        prev.filter((d) => d._id !== doc._id)
                      );

                      setDoctors((prev) => [
                        ...prev,
                        { ...doc, connectionStatus: "pending" },
                      ]);
                    }}
                  />
                ))
              )}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="doctors">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <FileUploadCard />
          </TabsContent>

          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle>My Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {records.map((r) => (
                  <MedicalRecordCard
                    key={r._id}
                    fileName={r.fileName}
                    uploadDate={new Date(
                      r.uploadedAt
                    ).toLocaleDateString()}
                    onView={() => setViewRecord(r)}
                    onDownload={() => window.open(r.url)}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctors">
            <Card>
              <CardHeader>
                <CardTitle>My Doctors</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                {doctors.map((doc) => (
                  <DoctorCard
                    key={doc._id}
                    {...doc}
                    onMessage={
                      doc.connectionStatus === "connected"
                        ? () => navigate(`/chat/${doc._id}`)
                        : undefined
                    }
                    onUnfollow={async () => {
                      await dataService.sendUnfollowRequest(doc._id);
                      toast.success(
                        doc.connectionStatus === "pending"
                          ? "Request cancelled"
                          : "Unfollowed"
                      );

                      setDoctors((prev) =>
                        prev.filter((d) => d._id !== doc._id)
                      );
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* 🔔 PATIENT POPUPS */}
      {notifications.map((n, i) => {
        if (
          n.type === "FOLLOW_ACCEPTED" ||
          n.type === "FOLLOW_DECLINED" ||
          n.type === "REMOVED_BY_DOCTOR"
        ) {
          return (
            <PatientFollowPopup
              key={i}
              type={n.type}
              doctorName={n.payload.doctorName}
              onClose={() => removeNotification(i)}
            />
          );
        }
        return null;
      })}

      <MedicalRecordViewer
        open={!!viewRecord}
        record={viewRecord}
        onClose={() => setViewRecord(null)}
      />
    </div>
  );
};

export default PatientDashboard;
