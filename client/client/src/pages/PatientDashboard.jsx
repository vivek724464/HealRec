import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Navigation from "@/components/Navigation";
import FileUploadCard from "@/components/FileUploadCard";
import MedicalRecordViewer from "@/components/MedicalRecordViewer";
import DoctorCard from "@/components/DoctorCard";
import MedicalRecordCard from "@/components/MedicalRecordCard";
import PatientFollowPopup from "@/components/PatientFollowPopup";
import MessageNotificationPopup from "@/components/MessageNotificationPopup";

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

  const { notifications = [], popups = [], removeNotification, removePopup } =
    useNotifications() || {};

  const [doctors, setDoctors] = useState([]);
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const doctorNameByIdRef = useRef({});

  const resolveDoctorName = (event) => {
    const payload = event?.payload || {};
    const fromPayload = payload?.doctorName;
    if (fromPayload && fromPayload.trim()) return fromPayload;

    const doctorId = payload?.doctorId;
    if (doctorId && doctorNameByIdRef.current[doctorId]) {
      return doctorNameByIdRef.current[doctorId];
    }

    return "Doctor";
  };

  /* ================= FETCH DOCTORS ================= */
  const refreshDoctors = async () => {
    try {
      const res = await dataService.getFollowingDoctors();

      const doctorsData =
        res?.data?.data ||
        res?.data ||
        [];

      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    if (!patientId) return;

    const fetchData = async () => {
      try {
        setAuditLoading(true);
        const [docsRes, recRes, auditRes] = await Promise.all([
          dataService.getFollowingDoctors(),
          dataService.getReports(patientId),
          dataService.getAuditLogs(1, 50),
        ]);

        const doctorsData =
          docsRes?.data?.data ||
          docsRes?.data ||
          [];

        const recordsData =
          recRes?.data?.data ||
          recRes?.data ||
          [];
        const auditData =
          auditRes?.data?.data ||
          auditRes?.data ||
          [];

        setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
        setRecords(Array.isArray(recordsData) ? recordsData : []);
        setAuditLogs(Array.isArray(auditData) ? auditData : []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard");
      } finally {
        setAuditLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  /* ================= REAL-TIME FOLLOW EVENTS ================= */
  useEffect(() => {
    const map = {};
    doctors.forEach((doc) => {
      const id = doc?._id || doc?.doctor?._id;
      const name = doc?.name || doc?.doctor?.name;
      if (id && name) map[id] = name;
    });
    doctorNameByIdRef.current = {
      ...doctorNameByIdRef.current,
      ...map,
    };
  }, [doctors]);

  useEffect(() => {
    if (!notifications.length) return;

    notifications.forEach((n) => {
      if (!n?.type) return;

      const { doctorId } = n.payload || {};

      if (n.type === "FOLLOW_REQUEST") {
        removeNotification(n.id);
      }

      if (n.type === "FOLLOW_ACCEPTED") {
        setDoctors((prev) =>
          prev.map((doc) =>
            doc.doctor?._id === doctorId || doc._id === doctorId
              ? { ...doc, status: "accepted", connectionStatus: "connected" }
              : doc
          )
        );
        removeNotification(n.id);
      }

      if (n.type === "FOLLOW_DECLINED") {
        setDoctors((prev) =>
          prev.filter((doc) => doc.doctor?._id !== doctorId && doc._id !== doctorId)
        );
        removeNotification(n.id);
      }

      if (
        n.type === "FOLLOW_UNFOLLOWED" ||
        n.type === "FOLLOW_REVOKED" ||
        n.type === "REMOVED_BY_DOCTOR"
      ) {
        setDoctors((prev) =>
          prev.filter((doc) => doc.doctor?._id !== doctorId && doc._id !== doctorId)
        );
        removeNotification(n.id);
      }
    });
  }, [notifications, removeNotification]);

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

        const searchData =
          res?.data?.data ||
          res?.data ||
          [];

        if (!Array.isArray(searchData)) {
          setSearchResults([]);
          return;
        }

        setSearchResults(
          searchData.filter(
            (d) => !doctors.some((x) => x._id === d._id)
          )
        );
      } catch (err) {
        console.error(err);
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
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="trust">Trust</TabsTrigger>
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
                {records.length > 0 ? (
                  records.map((r) => (
                    <MedicalRecordCard
                      key={r._id}
                      fileName={r.fileName}
                      uploadDate={
                        r.uploadedAt
                          ? new Date(r.uploadedAt).toLocaleDateString()
                          : "N/A"
                      }
                      onView={() => setViewRecord(r)}
                      onDownload={() => r.url && window.open(r.url)}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No records found
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctors">
            <Card>
              <CardHeader>
                <CardTitle>My Doctors</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                {doctors.length > 0 ? (
                  doctors.map((doc) => (
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
                        toast.success("Updated successfully");
                        refreshDoctors();
                      }}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No doctors connected
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trust">
            <Card>
              <CardHeader>
                <CardTitle>Trust Layer</CardTitle>
                <CardDescription>
                  Who accessed your health data and when
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {auditLoading ? (
                  <p className="text-muted-foreground">Loading trust logs...</p>
                ) : auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg border p-3 bg-card"
                    >
                      <p className="text-sm font-medium">
                        {log.actorName} ({log.actorRole}) accessed {log.resourceType}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Action: {log.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.viewedAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No access logs yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* 🔔 FOLLOW POPUPS */}
      {popups.map((n) =>
        n?.type === "MESSAGE_NOTIFICATION" ? (
          <MessageNotificationPopup
            key={n.id}
            senderLabel="New message from doctor"
            content={n?.payload?.content}
            onClose={() => removePopup(n.id)}
          />
        ) : n?.type === "FOLLOW_ACCEPTED" ||
        n?.type === "FOLLOW_DECLINED" ||
        n?.type === "FOLLOW_UNFOLLOWED" ||
        n?.type === "FOLLOW_REVOKED" ||
        n?.type === "REMOVED_BY_DOCTOR" ? (
          <PatientFollowPopup
            key={n.id}
            type={n.type}
            doctorName={resolveDoctorName(n)}
            onClose={() => removePopup(n.id)}
          />
        ) : null
      )}

      <MedicalRecordViewer
        open={!!viewRecord}
        record={viewRecord}
        onClose={() => setViewRecord(null)}
      />
    </div>
  );
};

export default PatientDashboard;
