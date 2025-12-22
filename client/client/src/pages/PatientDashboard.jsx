import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import FileUploadCard from "@/components/FileUploadCard";
import MedicalRecordViewer from "@/components/MedicalRecordViewer";
import DoctorCard from "@/components/DoctorCard";
import MedicalRecordCard from "@/components/MedicalRecordCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, Upload, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { dataService } from "@/services/dataService";
import { authService } from "@/services/authService";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const patientId = user?.id;

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
        const [doctorsRes, recordsRes] = await Promise.all([
          dataService.getFollowingDoctors(),
          dataService.getReports(patientId),
        ]);

        setDoctors(doctorsRes.data || []);
        setRecords(recordsRes.data || []);
      } catch {
        toast.error("Failed to load dashboard data");
      }
    };

    fetchData();
  }, [patientId]);

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

        // ❌ REMOVE doctors already in Doctors tab from search
        const filtered = (res.data || []).filter(
          (doc) => !doctors.some((d) => d._id === doc._id)
        );

        setSearchResults(filtered);
      } catch (err) {
        toast.error(err.response?.data?.message || "Doctor search failed");
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, doctors]);

  /* ================= STATS ================= */
  const stats = [
    { title: "Total Records", value: records.length, icon: FileText },
    {
      title: "Connected Doctors",
      value: doctors.filter((d) => d.connectionStatus === "connected").length,
      icon: Users,
    },
    {
      title: "Recent Uploads",
      value: records.filter(
        (r) =>
          new Date(r.uploadedAt) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      icon: Upload,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole="patient" userName={user?.name || "Patient"} />

      <main className="container mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold">
            Welcome back, {user?.name || "Patient"} 👋
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

            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searching ? (
                <p>Searching...</p>
              ) : searchResults.length === 0 ? (
                <p className="text-muted-foreground">No doctors found.</p>
              ) : (
                searchResults.map((doc) => (
                  <DoctorCard
                    key={doc._id}
                    name={doc.name}
                    specialty={doc.specialization}
                    experience={
                      doc.experience
                        ? `${doc.experience} years`
                        : "Not specified"
                    }
                    rating={doc.rating}
                    connectionStatus={doc.connectionStatus}
                    onConnect={
                      doc.connectionStatus === "none"
                        ? async () => {
                            await dataService.sendFollowRequest(doc._id);
                            toast.success("Follow request sent");

                            // 🔥 REMOVE FROM SEARCH
                            setSearchResults((prev) =>
                              prev.filter((d) => d._id !== doc._id)
                            );

                            // 🔥 ADD TO DOCTORS TAB
                            setDoctors((prev) => [
                              ...prev,
                              { ...doc, connectionStatus: "pending" },
                            ]);
                          }
                        : undefined
                    }
                  />
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* TABS */}
        <Tabs defaultValue="upload">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="records">My Records</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <FileUploadCard onUploadSuccess={() => window.location.reload()} />
          </TabsContent>

          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle>My Medical Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {records.map((r, i) => (
                  <MedicalRecordCard
                    key={i}
                    fileName={r.fileName}
                    fileType={r.fileType?.split("/").pop()}
                    uploadDate={new Date(r.uploadedAt).toLocaleDateString()}
                    onView={() => setViewRecord(r)}
                    onDownload={() => window.open(r.url, "_blank")}
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
              <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doc) => (
                  <DoctorCard
                    key={doc._id}
                    name={doc.name}
                    specialty={doc.specialization}
                    experience={
                      doc.experience
                        ? `${doc.experience} years`
                        : "Not specified"
                    }
                    rating={doc.rating}
                    connectionStatus={doc.connectionStatus}
                    onMessage={
                      doc.connectionStatus === "connected"
                        ? () => navigate(`/chat/${doc._id}`)
                        : undefined
                    }
                    onUnfollow={
                      doc.connectionStatus === "pending"
                        ? async () => {
                            await dataService.sendUnfollowRequest(doc._id);
                            toast.success("Follow request cancelled");

                            // 🔥 REMOVE FROM DOCTORS
                            setDoctors((prev) =>
                              prev.filter((d) => d._id !== doc._id)
                            );

                            // 🔥 RESTORE SEARCH RESULT AS FOLLOW
                            setSearchResults((prev) => [
                              { ...doc, connectionStatus: "none" },
                              ...prev,
                            ]);
                          }
                        : undefined
                    }
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <MedicalRecordViewer
        open={!!viewRecord}
        record={viewRecord}
        onClose={() => setViewRecord(null)}
      />
    </div>
  );
};

export default PatientDashboard;
