import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  FileText,
  Briefcase,
  LayoutDashboard,
  CheckCircle,
  ArrowRight,
  Target,
  Bell,
  TrendingUp,
  Users,
  Globe,
  Shield,
  Zap,
} from "lucide-react";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center">
              <Badge variant="secondary" className="mb-6 w-fit gap-2">
                <Sparkles className="h-3 w-3" />
                AI-Powered Career Platform
              </Badge>
              
              <h1 className="mb-6 font-sans text-4xl font-bold tracking-tight lg:text-5xl xl:text-6xl">
                Build Your
                <span className="block text-primary">Global Career</span>
                with AI
              </h1>
              
              <p className="mb-8 max-w-lg text-lg text-muted-foreground">
                Create ATS-optimized CVs, discover matched opportunities, and track your applications - all powered by intelligent AI that helps you land your dream job.
              </p>
              
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-2" data-testid="button-go-dashboard">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg" className="gap-2" data-testid="button-start-building">
                        <Sparkles className="h-4 w-4" />
                        Start Building Free
                      </Button>
                    </Link>
                    <Link href="/signin">
                      <Button size="lg" variant="outline" className="gap-2" data-testid="button-sign-in">
                        Sign In
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}
                <Button variant="outline" size="lg" className="gap-2" data-testid="button-see-demo">
                  See How It Works
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-chart-2" />
                  ATS-Optimized
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-chart-2" />
                  AI-Powered
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-chart-2" />
                  Free to Start
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-accent/20 blur-2xl" />
              
              <Card className="relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="border-b bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-destructive/60" />
                      <div className="h-3 w-3 rounded-full bg-chart-4/60" />
                      <div className="h-3 w-3 rounded-full bg-chart-2/60" />
                      <span className="ml-2 text-xs text-muted-foreground">CV Builder</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold">Work Experience</h3>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                        <Sparkles className="h-3 w-3" />
                        Optimize with AI
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-lg border bg-card p-3">
                        <p className="text-sm text-muted-foreground line-through">
                          "Managed team projects and helped with sales"
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ArrowRight className="h-3 w-3 text-primary" />
                        AI Optimization
                      </div>
                      <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-3">
                        <p className="text-sm font-medium">
                          "Led cross-functional team of 8 members, driving 35% increase in quarterly sales through strategic client relationship management"
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
            Trusted by students and professionals worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            <div className="flex items-center gap-2 text-muted-foreground/70">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">10,000+ Users</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground/70">
              <Globe className="h-5 w-5" />
              <span className="text-sm font-medium">50+ Countries</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground/70">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">25,000+ CVs Created</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground/70">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">85% Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Our AI-powered platform provides all the tools you need to build a standout CV, find matching opportunities, and track your progress.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group relative overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">AI CV Builder</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Create professional, ATS-optimized CVs with our intelligent builder. Our AI transforms your experience into compelling achievements.
                </p>
                <Link href="/cv-builder" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Build Your CV
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                  <Target className="h-6 w-6 text-chart-2" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Smart Job Matching</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Our AI analyzes your skills and experience to find opportunities that match your profile with percentage compatibility scores.
                </p>
                <Link href="/jobs" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Find Opportunities
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                  <LayoutDashboard className="h-6 w-6 text-chart-3" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Application Tracker</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Track all your applications in one place with our Kanban-style board. Never lose track of an opportunity again.
                </p>
                <Link href="/applications" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Track Applications
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
                  <Bell className="h-6 w-6 text-chart-4" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Real-time Notifications</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Get instant alerts when new opportunities match your profile. Stay ahead of the competition.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  Coming Soon
                </span>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-5/10">
                  <Sparkles className="h-6 w-6 text-chart-5" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">AI Cover Letters</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Generate personalized cover letters for each application with our AI. Tailored to the company and position.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  AI-Powered
                </span>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Global Standards</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  CVs optimized for international job markets. Our templates follow global best practices for maximum impact.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  ATS-Friendly
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y bg-muted/20 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
              Your Journey to Success in 4 Steps
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              From signup to landing your dream job, our platform guides you every step of the way.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: 1,
                title: "Create Your Profile",
                description: "Sign up and set up your career profile in minutes.",
                icon: Users,
              },
              {
                step: 2,
                title: "Build Your CV",
                description: "Use our AI-powered builder to create a professional, ATS-optimized CV.",
                icon: FileText,
              },
              {
                step: 3,
                title: "Discover Opportunities",
                description: "Find jobs that match your skills with our intelligent matching system.",
                icon: Target,
              },
              {
                step: 4,
                title: "Track & Succeed",
                description: "Manage your applications and track your progress to success.",
                icon: TrendingUp,
              },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                {index < 3 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-border lg:block" />
                )}
                <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
            Ready to Transform Your Career?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of professionals who have already boosted their career with GlobalCareer AI.
          </p>
          
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="gap-2" data-testid="button-cta-dashboard">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/signup">
              <Button size="lg" className="gap-2" data-testid="button-cta-start">
                <Sparkles className="h-4 w-4" />
                Start Building Your Future
              </Button>
            </Link>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Secure & Private
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Instant Setup
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Global Standards
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold">GlobalCareer AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered career platform for building your global future.
              </p>
            </div>
            
            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/cv-builder" className="hover-elevate rounded px-1">CV Builder</Link></li>
                <li><Link href="/jobs" className="hover-elevate rounded px-1">Job Matching</Link></li>
                <li><Link href="/applications" className="hover-elevate rounded px-1">Application Tracker</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="cursor-pointer hover-elevate rounded px-1">Career Tips</span></li>
                <li><span className="cursor-pointer hover-elevate rounded px-1">CV Templates</span></li>
                <li><span className="cursor-pointer hover-elevate rounded px-1">Interview Guide</span></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="cursor-pointer hover-elevate rounded px-1">About Us</span></li>
                <li><span className="cursor-pointer hover-elevate rounded px-1">Privacy Policy</span></li>
                <li><span className="cursor-pointer hover-elevate rounded px-1">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} GlobalCareer AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
