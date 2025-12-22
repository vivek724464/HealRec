import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import FileUploadCard from "@/components/FileUploadCard";
import DoctorCard from "@/components/DoctorCard";
import MedicalRecordCard from "@/components/MedicalRecordCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, FileText, Users, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { dataService } from "@/services/dataService";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const patientId = user._id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [doctorsData, recordsData] = await Promise.all([
          dataService.getAvailableDoctors(),
          dataService.getReports(patientId),
        ]);
        setDoctors(doctorsData?.data || []);
        setRecords(recordsData?.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  const stats = [
    {
      title: "Total Records",
      value: records.length.toString(),
      icon: FileText,
      color: "from-primary to-primary/80",
    },
    {
      title: "Connected Doctors",
      value: doctors.filter(d => d.connectionStatus === "connected").length.toString(),
      icon: Users,
      color: "from-accent to-accent/80",
    },
    {
      title: "Recent Uploads",
      value: records.filter(r => {
        const uploadDate = new Date(r.uploadDate);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return uploadDate > sevenDaysAgo;
      }).length.toString(),
      icon: Upload,
      color: "from-primary to-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        userRole="patient"
        userName={user?.name || "Patient"}
        notificationCount={2}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || "Patient"}! 👋</h1>
          <p className="text-muted-foreground">
            Manage your health records and connect with doctors
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

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload Records</TabsTrigger>
            <TabsTrigger value="records">My Records</TabsTrigger>
            <TabsTrigger value="doctors">Find Doctors</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <FileUploadCard onUploadSuccess={() => window.location.reload()} />
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Medical Records</CardTitle>
                <CardDescription>
                  View and manage all your uploaded medical documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground">Loading records...</p>
                ) : records.length === 0 ? (
                  <p className="text-muted-foreground">No medical records found. Upload one to get started!</p>
                ) : (
                  records.map((record) => (
                    <MedicalRecordCard
                      key={record._id}
                      {...record}
                      onView={() => toast.info(`Viewing ${record.fileName}`)}
                      onDownload={() =>
                        toast.success(`Downloading ${record.fileName}`)
                      }
                      onShare={() => toast.info("Share dialog would open")}
                      onDelete={() => toast.error("Record deleted")}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Find Doctors</CardTitle>
                <CardDescription>
                  Search and connect with healthcare professionals
                </CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading doctors...</p>
                ) : doctors.length === 0 ? (
                  <p className="text-muted-foreground">No doctors found.</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors
                      .filter(
                        (doctor) =>
                          !searchQuery ||
                          doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((doctor) => (
                        <DoctorCard
                          key={doctor._id}
                          {...doctor}
                          onConnect={() =>
                            toast.success(
                              `Follow request sent to ${doctor.name}`
                            )
                          }
                          onUnfollow={() =>
                            toast.info(`Unfollowed ${doctor.name}`)
                          }
                          onMessage={() => navigate(`/chat/${doctor._id}`)}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PatientDashboard;