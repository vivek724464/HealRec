import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { authService } from "@/services/authService";

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [createdUsername, setCreatedUsername] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    identifier: "",
    password: "",
  });

  const handleRequestOtp = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.identifier || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.requestSignupOtp(
        formData.identifier,
        formData.name,
        formData.password,
        role
      );

      if (response?.success) {
        setIdentifier(response.identifier);
        setStep(2);
        toast.success("OTP sent to your email/phone");
      } else {
        toast.error(response?.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.verifySignupOtp(identifier, otp);

      if (response?.success) {
        toast.success("Account created successfully!");

        // Persist token if provided
        if (response?.token) {
          localStorage.setItem("token", response.token);
        }

        // Try to get username from response or from decoded token
        let username = response?.username || "";
        if (!username && response?.token) {
          try {
            const base64Url = response.token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const user = JSON.parse(jsonPayload);
            localStorage.setItem("user", JSON.stringify(user));
            username = user.username || user.name || username;
          } catch (err) {
            // decoding failed, continue without decoded username
          }
        }

        setCreatedUsername(username || formData.identifier);
        setStep(3);
      } else {
        toast.error(response?.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Join our healthcare community today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={role === "patient" ? "default" : "outline"}
                  onClick={() => setRole("patient")}
                  className="transition-all"
                  disabled={loading}
                >
                  Patient
                </Button>
                <Button
                  type="button"
                  variant={role === "doctor" ? "default" : "outline"}
                  onClick={() => setRole("doctor")}
                  className="transition-all"
                  disabled={loading}
                >
                  Doctor
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Phone</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="you@example.com or +91XXXXXXXXXX"
                  value={formData.identifier}
                  onChange={(e) =>
                    setFormData({ ...formData, identifier: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder=""
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending OTP..." : "Continue"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Login
                </Link>
              </p>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>Verify OTP</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Enter the OTP sent to {identifier}
                </p>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  maxLength={6}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-6">
              <h3 className="text-2xl font-semibold">Account Created</h3>
              <p className="text-sm text-muted-foreground">
                Your username is
                <span className="font-medium ml-2">{createdUsername}</span>
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    try {
                      const user = JSON.parse(localStorage.getItem("user") || "{}");
                      if (user?.role) {
                        navigate(user.role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard");
                        return;
                      }
                    } catch (err) {
                      // ignore
                    }
                    // fallback to login
                    navigate("/login");
                  }}
                  className="w-full"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
