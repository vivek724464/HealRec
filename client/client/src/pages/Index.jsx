import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileText,
  UserPlus,
  MessageSquare,
  Shield,
  CheckCircle,
  Clock,
  Users,
  Lock,
} from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";
import healthcareTeamImage from "@/assets/healthcare-team.jpg";
import patientExperienceImage from "@/assets/patient-experience.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Your Health,{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Connected
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Bridge the gap between doctors and patients. Share medical
                records securely, connect with healthcare professionals, and
                take control of your health journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto shadow-soft hover:shadow-elevated transition-all"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Healthcare professionals and patients"
                className="relative rounded-3xl shadow-elevated w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform designed for seamless healthcare
              communication
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-elevated transition-all duration-300 border-2 hover:border-primary/50">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Records</h3>
              <p className="text-muted-foreground">
                Securely upload and manage your medical records in multiple
                formats
              </p>
            </Card>

            <Card className="p-6 hover:shadow-elevated transition-all duration-300 border-2 hover:border-primary/50">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Connect with Doctors
              </h3>
              <p className="text-muted-foreground">
                Follow healthcare professionals and build trusted relationships
              </p>
            </Card>

            <Card className="p-6 hover:shadow-elevated transition-all duration-300 border-2 hover:border-primary/50">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Direct Messaging</h3>
              <p className="text-muted-foreground">
                Chat with your doctors and share important health information
              </p>
            </Card>

            <Card className="p-6 hover:shadow-elevated transition-all duration-300 border-2 hover:border-primary/50">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your health data is protected with enterprise-grade security
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Getting started is simple. Follow these three easy steps to
              connect with healthcare professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Create Your Account
              </h3>
              <p className="text-muted-foreground">
                Sign up as a patient or doctor in seconds. Choose your role and
                complete your profile with essential information.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload & Connect</h3>
              <p className="text-muted-foreground">
                Upload your medical records securely and send connection
                requests to doctors. They can review and approve your request.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Chat & Share</h3>
              <p className="text-muted-foreground">
                Once connected, communicate directly with your doctors, share
                records, and get personalized healthcare guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src={patientExperienceImage}
                alt="Patient using tablet to communicate with doctor"
                className="rounded-3xl shadow-elevated w-full"
              />
            </div>
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-4">
                  Why Choose Our Platform?
                </h2>
                <p className="text-xl text-muted-foreground">
                  We're revolutionizing healthcare communication by making it
                  easier, faster, and more secure than ever before.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Instant Access to Records
                    </h3>
                    <p className="text-muted-foreground">
                      All your medical documents in one place, accessible
                      anytime from any device. No more searching through
                      paperwork.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Save Time</h3>
                    <p className="text-muted-foreground">
                      No more phone calls or waiting rooms. Communicate with
                      your doctor directly and get quick responses to your
                      questions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Bank-Level Security
                    </h3>
                    <p className="text-muted-foreground">
                      Your health data is encrypted and protected with the
                      highest security standards. HIPAA compliant and fully
                      secure.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Better Coordination
                    </h3>
                    <p className="text-muted-foreground">
                      Connect with multiple healthcare providers and ensure
                      everyone has access to your complete medical history.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <h2 className="text-4xl font-bold">
                Trusted by Healthcare Professionals
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of doctors and patients who are already
                experiencing better healthcare communication through our
                platform.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    10,000+
                  </div>
                  <div className="text-muted-foreground">Active Users</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-accent mb-2">
                    500+
                  </div>
                  <div className="text-muted-foreground">Verified Doctors</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    50,000+
                  </div>
                  <div className="text-muted-foreground">Records Shared</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-accent mb-2">
                    99.9%
                  </div>
                  <div className="text-muted-foreground">Uptime</div>
                </Card>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <img
                src={healthcareTeamImage}
                alt="Diverse team of healthcare professionals"
                className="rounded-3xl shadow-elevated w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real experiences from patients and doctors using our platform
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-primary"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "This platform has completely changed how I communicate with my
                patients. I can respond to questions quickly and review records
                efficiently."
              </p>
              <div className="font-semibold">Dr. Sarah Johnson</div>
              <div className="text-sm text-muted-foreground">Cardiologist</div>
            </Card>

            <Card className="p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-primary"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Finally, all my medical records in one secure place! I love
                being able to share them instantly with my doctors when needed."
              </p>
              <div className="font-semibold">Michael Chen</div>
              <div className="text-sm text-muted-foreground">Patient</div>
            </Card>

            <Card className="p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-primary"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "The secure messaging feature has made follow-ups so much
                easier. I feel more connected to my healthcare providers than
                ever before."
              </p>
              <div className="font-semibold">Emily Rodriguez</div>
              <div className="text-sm text-muted-foreground">Patient</div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary to-accent p-12 text-center shadow-elevated">
            <h2 className="text-4xl font-bold text-primary-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands of patients and doctors already using our platform
            </p>
            <Link to="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="shadow-soft hover:shadow-elevated transition-all"
              >
                Create Your Account
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;