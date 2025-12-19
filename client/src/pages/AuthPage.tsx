import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, refreshUser } = useAuth(); // Removed loginMutation/registerMutation
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
  });

  // Automatically redirect if user state updates to "logged in"
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint =
      activeTab === "login" ? "/api/auth/signin" : "/api/auth/signup";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      toast({
        title: "Success",
        description:
          activeTab === "login"
            ? "Signed in successfully!"
            : "Account created!",
      });

      // This is the most important part: tell the AuthContext to update the user
      if (refreshUser) {
        await refreshUser();
      }

      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-2xl border-primary/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <ShieldCheck className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
              Global-Coach AI
            </CardTitle>
            <CardDescription>
              Enterprise Career Management Logic Hub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === "register" && (
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      name="displayName"
                      placeholder="Your Name"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      required={activeTab === "register"}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-4 h-11"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : null}
                  {activeTab === "login"
                    ? "Login to Dashboard"
                    : "Create My AI Profile"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex flex-col justify-center p-12 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="h-96 w-96 text-white" />
        </div>
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            Powered by Gemini 1.5 Pro
          </div>
          <h1 className="text-6xl font-extrabold leading-[1.1]">
            Your Career,
            <br /> <span className="text-yellow-400">Intelligently</span>{" "}
            Matched.
          </h1>
          <p className="text-xl text-primary-foreground/70 max-w-lg leading-relaxed">
            Connect your CV to the global labor market. Our Logic Hub performs
            real-time semantic analysis to find your perfect professional fit.
          </p>
          <div className="flex gap-12 pt-8 border-t border-white/10">
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-white/60">ATS Optimized</div>
            </div>
            <div>
              <div className="text-3xl font-bold">Live</div>
              <div className="text-sm text-white/60">AI Job Sourcing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
