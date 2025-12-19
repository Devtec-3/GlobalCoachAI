import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { SkeletonStats, SkeletonCard } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import jsPDF from "jspdf";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";
import {
  FileText,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle,
  Target,
  Building,
  MapPin,
  Activity,
  Download,
  Zap,
  Globe,
  Settings,
  Award,
  RefreshCw,
} from "lucide-react";
import type {
  Application,
  CvProfileWithDetails,
  JobOpportunityWithMatch,
} from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch CV Profile
  const { data: cvProfile, isLoading: cvLoading } =
    useQuery<CvProfileWithDetails>({
      queryKey: ["/api/cv-profile/full"],
      enabled: !!user,
    });

  // 2. Fetch Matched Jobs (AI Feed)
  const { data: matchedJobs, isLoading: jobsLoading } = useQuery<
    JobOpportunityWithMatch[]
  >({
    queryKey: ["/api/jobs/matched"],
    enabled: !!user,
  });

  // 3. Fetch Applications (Live Tracker)
  const { data: applications, isLoading: appsLoading } = useQuery<
    Application[]
  >({
    queryKey: ["/api/applications"],
    enabled: !!user,
    // This ensures the data is considered "fresh" for longer but re-fetches on focus
    refetchOnWindowFocus: true,
  });

  // --- PDF GENERATION ---
  const downloadCV = () => {
    if (!cvProfile) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(`${cvProfile.firstName} ${cvProfile.lastName}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`${cvProfile.email} | ${cvProfile.location || "Remote"}`, 20, 30);
    doc.save(`${cvProfile.firstName}_AI_CV.pdf`);
  };

  // --- ANALYTICS DATA LOGIC (FIXED) ---
  const chartData = [
    { day: "Mon", apps: 0 },
    { day: "Tue", apps: 0 },
    { day: "Wed", apps: 0 },
    { day: "Thu", apps: 0 },
    { day: "Fri", apps: 0 },
    { day: "Sat", apps: 0 },
    { day: "Sun", apps: 0 },
  ];

  applications?.forEach((app) => {
    const day = new Date(app.createdAt || new Date()).toLocaleDateString(
      "en-US",
      { weekday: "short" }
    );
    const entry = chartData.find((d) => d.day === day);
    if (entry) entry.apps += 1; // Fixed: was dayEntry
  });

  // --- UPDATED ANALYTICS DATA LOGIC ---
  const skillData = cvProfile?.skills?.slice(0, 6).map((s) => ({
    subject: s.name,
    // Use (s.proficiency ?? 0) to ensure we always have a number
    A: (Number(s.proficiency) || 0) * 20,
    fullMark: 100,
  })) || [
    { subject: "Coding", A: 20, fullMark: 100 },
    { subject: "Design", A: 20, fullMark: 100 },
    { subject: "DevOps", A: 20, fullMark: 100 },
  ];

  const stats = {
    profileCompletion: cvProfile?.completionPercentage || 0,
    matchedJobsCount: matchedJobs?.length || 0,
    activeTracking: applications?.length || 0,
    marketReadiness: Math.min(
      100,
      (cvProfile?.skills?.length || 0) * 10 +
        (cvProfile?.workExperience?.length || 0) * 15
    ),
  };

  if (cvLoading || jobsLoading || appsLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <SkeletonStats />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 animate-in fade-in duration-700">
      {/* 1. TOP NAV / HEADER */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900">
            Career Command Center
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
            <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            AI Sync Status: Optimal | Welcome, {user?.displayName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => queryClient.invalidateQueries()}
            className="text-muted-foreground hover:text-primary"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Sync Data
          </Button>
          <Button
            onClick={downloadCV}
            variant="outline"
            className="gap-2 border-slate-200 shadow-sm"
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Link href="/cv-builder">
            <Button className="gap-2 bg-primary shadow-lg shadow-primary/20">
              <Settings className="h-4 w-4" /> Configure Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. CORE KPIS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Profile Index
              </p>
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-black mt-2">
              {stats.profileCompletion}%
            </p>
            <Progress value={stats.profileCompletion} className="h-1.5 mt-4" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-2 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Global Matches
              </p>
              <Globe className="h-5 w-5 text-chart-2" />
            </div>
            <p className="text-3xl font-black mt-2">{stats.matchedJobsCount}</p>
            <p className="text-[10px] text-chart-2 font-bold mt-4 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Real-time Market Data
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-3 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Active Tracker
              </p>
              <Briefcase className="h-5 w-5 text-chart-3" />
            </div>
            <p className="text-3xl font-black mt-2">{stats.activeTracking}</p>
            <p className="text-[10px] text-muted-foreground font-bold mt-4">
              Synced with Database
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Market Readiness
              </p>
              <Award className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-black mt-2">{stats.marketReadiness}%</p>
            <p className="text-[10px] text-orange-500 font-bold mt-4">
              Top 15% of candidates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. MAIN ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              Application Velocity Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="apps"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              AI Skill Mapping
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fontWeight: 700 }}
                />
                <Radar
                  name="Skills"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 4. ACTIVITY & MATCHES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-chart-2" /> Top AI Job Matches
              </CardTitle>
              <Link href="/jobs">
                <Button variant="ghost" className="text-primary font-bold">
                  View Global Feed <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {matchedJobs?.slice(0, 4).map((job, idx) => (
                  <div
                    key={idx}
                    className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Building className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{job.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {job.company} • {job.location || "Remote"}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-none">
                      {job.matchPercentage}% Match
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* REAL-TIME TRACKER LOG */}
        <Card className="border-none shadow-md flex flex-col">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-chart-3" /> Tracker Log (Latest)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {applications && applications.length > 0 ? (
                // Reversing to show the newest job first
                [...applications]
                  .reverse()
                  .slice(0, 6)
                  .map((app) => (
                    <div
                      key={app.id}
                      className="p-4 flex justify-between items-center hover:bg-slate-50 transition-all"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-black truncate text-slate-800">
                          {app.title}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                          {app.company}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[9px] uppercase font-black bg-blue-50 text-blue-700 border-blue-100"
                      >
                        {app.status}
                      </Badge>
                    </div>
                  ))
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Your tracker is empty.
                </div>
              )}
            </div>
          </CardContent>
          <div className="p-4 border-t">
            <Link href="/applications">
              <Button className="w-full text-xs font-bold" variant="outline">
                Manage Full Pipeline
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
