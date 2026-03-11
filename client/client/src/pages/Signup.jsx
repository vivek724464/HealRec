import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false); // ✅ NEW

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

        if (response?.token) {
          authService.setSession(response.token);
        }

        setCreatedUsername(response?.username || formData.identifier);
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

              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={role === "patient" ? "default" : "outline"}
                  onClick={() => setRole("patient")}
                  disabled={loading}
                >
                  Patient
                </Button>
                <Button
                  type="button"
                  variant={role === "doctor" ? "default" : "outline"}
                  onClick={() => setRole("doctor")}
                  disabled={loading}
                >
                  Doctor
                </Button>
              </div>

              {/* Full Name */}
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

              {/* Email / Phone */}
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

              {/* Password with Toggle */}
              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>

                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  disabled={loading}
                  className="pr-10"
                />

                <div
                  className="absolute right-3 top-9 cursor-pointer text-muted-foreground hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending OTP..." : "Continue"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
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
              <Button onClick={() => navigate("/login")} className="w-full">
                Continue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
