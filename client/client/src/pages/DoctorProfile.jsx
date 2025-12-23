import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";

const DoctorProfile = () => {
  const [form, setForm] = useState({
    email: "",
    phone: "",
    gender: "",
    specialization: "",
    yearsOfExperience: "",
    licenseNumber: "",
    consultationFee: "",
    clinicName: "",
    clinicCity: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch existing profile
  useEffect(() => {
    api.get("/doctor/me").then((res) => {
      const d = res.data.doctor;
      setForm({
        email: d.email || "",
        phone: d.phone || "",
        gender: d.gender || "",
        specialization: d.specialization || "",
        yearsOfExperience: d.yearsOfExperience || "",
        licenseNumber: d.licenseNumber || "",
        consultationFee: d.consultationFee || "",
        clinicName: d.clinic?.name || "",
        clinicCity: d.clinic?.address?.city || "",
      });
    });
  }, []);

  // 🔹 Request OTP / Update
  const requestUpdate = async () => {
    try {
      setLoading(true);
      await api.put("/doctor/update-profile", {
        email: form.email || undefined,
        phone: form.phone || undefined,
        gender: form.gender,
        specialization: form.specialization,
        yearsOfExperience: form.yearsOfExperience,
        licenseNumber: form.licenseNumber,
        consultationFee: form.consultationFee,
        clinic: {
          name: form.clinicName,
          address: { city: form.clinicCity },
        },
      });

      toast.success("OTP sent");
      setOtpSent(true);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verify OTP
  const verifyOtp = async () => {
    try {
      await api.post("/doctor/update-profile/verify-otp", { otp });
      toast.success("Profile updated");
      setOtp("");
      setOtpSent(false);
    } catch (e) {
      toast.error(e.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Doctor Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <Label>Specialization</Label>
            <Input
              value={form.specialization}
              onChange={(e) =>
                setForm({ ...form, specialization: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Experience (years)</Label>
            <Input
              type="number"
              value={form.yearsOfExperience}
              onChange={(e) =>
                setForm({ ...form, yearsOfExperience: e.target.value })
              }
            />
          </div>

          <div>
            <Label>License Number</Label>
            <Input
              value={form.licenseNumber}
              onChange={(e) =>
                setForm({ ...form, licenseNumber: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Consultation Fee</Label>
            <Input
              type="number"
              value={form.consultationFee}
              onChange={(e) =>
                setForm({ ...form, consultationFee: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Clinic Name</Label>
            <Input
              value={form.clinicName}
              onChange={(e) =>
                setForm({ ...form, clinicName: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Clinic City</Label>
            <Input
              value={form.clinicCity}
              onChange={(e) =>
                setForm({ ...form, clinicCity: e.target.value })
              }
            />
          </div>

          {!otpSent ? (
            <Button onClick={requestUpdate} disabled={loading} className="w-full">
              Update Profile
            </Button>
          ) : (
            <>
              <Input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button onClick={verifyOtp} className="w-full">
                Verify OTP
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorProfile;
