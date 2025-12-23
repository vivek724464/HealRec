import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { dataService } from "@/services/dataService";

const PatientProfile = () => {
  const [form, setForm] = useState({
    email: "",
    phone: "",
    dateOfBirth: "",
    bloodGroup: "",
    emergencyContact: {
      name: "",
      relation: "",
      phone: "",
    },
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    profileService
      .getPatientProfile()
      .then((user) => {
        if (!user) return;
        setForm({
          email: user.email || "",
          phone: user.phone || "",
          dateOfBirth: user.dateOfBirth?.slice(0, 10) || "",
          bloodGroup: user.bloodGroup || "",
          emergencyContact: user.emergencyContact || {
            name: "",
            relation: "",
            phone: "",
          },
        });
      })
      .catch(() => toast.error("Failed to load profile"));
  }, []);

  /* ================= UPDATE PROFILE ================= */
  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await profileService.updatePatientProfile(form);

      if (res.success && res.message.includes("OTP")) {
        setOtpSent(true);
        toast.success("OTP sent");
      } else if (res.success) {
        toast.success("Profile updated");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerifyOtp = async () => {
    try {
      const res = await profileService.verifyPatientProfileOtp(otp);
      if (res.success) {
        toast.success("Profile updated successfully");
        setOtpSent(false);
        setOtp("");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("OTP verification failed");
    }
  };

  return (
    <>
      <Navigation />

      <div className="max-w-3xl mx-auto mt-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Patient Profile</CardTitle>
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
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm({ ...form, dateOfBirth: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Blood Group</Label>
              <Input
                value={form.bloodGroup}
                onChange={(e) =>
                  setForm({ ...form, bloodGroup: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Emergency Contact Name</Label>
              <Input
                value={form.emergencyContact.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emergencyContact: {
                      ...form.emergencyContact,
                      name: e.target.value,
                    },
                  })
                }
              />
            </div>

            <div>
              <Label>Emergency Contact Relation</Label>
              <Input
                value={form.emergencyContact.relation}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emergencyContact: {
                      ...form.emergencyContact,
                      relation: e.target.value,
                    },
                  })
                }
              />
            </div>

            <div>
              <Label>Emergency Contact Phone</Label>
              <Input
                value={form.emergencyContact.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emergencyContact: {
                      ...form.emergencyContact,
                      phone: e.target.value,
                    },
                  })
                }
              />
            </div>

            {!otpSent ? (
              <Button onClick={handleUpdate} disabled={loading}>
                Save Changes
              </Button>
            ) : (
              <>
                <Input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <Button onClick={handleVerifyOtp}>Verify OTP</Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PatientProfile;
