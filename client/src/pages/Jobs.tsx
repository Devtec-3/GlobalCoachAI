import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { SkeletonCard, AILoadingShimmer } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { apiRequest } from "@/lib/queryClient";
import {
  Search,
  MapPin,
  Building,
  Target,
  Globe,
  Plus,
  Loader2,
  Sparkles,
} from "lucide-react";

const locations = [
  "All Locations",
  "Remote",
  "USA",
  "Europe",
  "Asia",
  "Africa",
  "UK",
];

export default function Jobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // 1. Fetch AI Matched Jobs (Initial results)
  const { data: matchedJobs, isLoading: jobsLoading } = useQuery<any[]>({
    queryKey: ["/api/jobs/matched"],
    enabled: !!user,
  });

  // 2. AI Global Search Query (Multiple results from Gemini)
  const {
    data: searchResults,
    isFetching: isSearching,
    refetch: runSearch,
  } = useQuery<any[]>({
    queryKey: ["/api/jobs/search", searchQuery],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/jobs/search?q=${encodeURIComponent(searchQuery)}`
      );
      return res.json();
    },
    enabled: false, // Triggers on button click
  });

  // 3. TRACKER MUTATION (With Dashboard Sync)
  const applyMutation = useMutation({
    mutationFn: async (job: any) => {
      return apiRequest("POST", "/api/applications", {
        jobId: job.id?.toString() || Math.random().toString(),
        title: job.title,
        company: job.company,
        location: job.location,
        status: "to_apply",
      });
    },
    onSuccess: () => {
      // 🔄 This is what makes it appear on the Dashboard instantly!
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });

      setSelectedJob(null);
      toast({
        title: "Tracker Updated!",
        description: "This global opportunity is now live on your dashboard.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Error",
        description: "Ensure your database schema is pushed.",
        variant: "destructive",
      });
    },
  });

  const displayJobs = searchResults || matchedJobs || [];

  const filteredJobs = displayJobs.filter((job) => {
    return (
      selectedLocation === "All Locations" ||
      (selectedLocation === "Remote" &&
        (job.isRemote || job.location?.toLowerCase().includes("remote"))) ||
      job.location?.toLowerCase().includes(selectedLocation.toLowerCase())
    );
  });

  if (jobsLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <AILoadingShimmer text="AI Agent is sourcing global markets..." />
        <div className="grid gap-6 lg:grid-cols-3 mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 text-foreground">
            <Globe className="h-8 w-8 text-primary" /> Global Sourcing
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Sourcing Worldwide & Remote opportunities across 2025 tech hubs.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-primary/20 bg-primary/10 text-primary gap-2 px-4 py-2"
        >
          <Sparkles className="h-4 w-4" /> AI Agent Live
        </Badge>
      </div>

      {/* Search Bar - Dark Theme Corrected */}
      <Card className="mb-8 border-border bg-card shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search global roles (e.g. Remote DevOps, UK Finance)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-input text-foreground"
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
              />
            </div>
            <Button
              onClick={() => runSearch()}
              disabled={isSearching || !searchQuery}
              className="gap-2 min-w-[180px] font-bold"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              {isSearching ? "Sourcing..." : "AI Global Search"}
            </Button>
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger className="w-48 bg-background border-input">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid - Dark Theme Corrected */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon="jobs"
          title="No live matches found"
          description="Broaden your search query."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job, idx) => (
            <Card
              key={idx}
              className="group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl border-border bg-card overflow-hidden relative"
              onClick={() => setSelectedJob(job)}
            >
              <div className="h-1.5 w-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${job.matchPercentage ?? 0}%` }}
                />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between mb-4">
                  <div className="p-2 bg-muted rounded-lg text-primary group-hover:bg-primary/20">
                    <Building className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="font-bold">
                    {job.matchPercentage ?? 0}% AI Match
                  </Badge>
                </div>
                <h3 className="font-bold text-lg mb-1 truncate text-card-foreground">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground font-bold uppercase mb-4">
                  {job.company}
                </p>
                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase">
                  <MapPin className="h-3 w-3" /> {job.location || "Remote"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal - Dark Theme Corrected */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-card-foreground">
                  {selectedJob.title}
                </DialogTitle>
                <DialogDescription className="text-lg text-primary font-bold">
                  {selectedJob.company} • {selectedJob.location}
                </DialogDescription>
              </DialogHeader>
              <div className="py-6 space-y-6">
                <div className="p-5 bg-muted/50 border-l-4 border-primary rounded-r-xl">
                  <h4 className="text-xs font-black text-primary uppercase mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" /> AI Match Analysis:
                  </h4>
                  <p className="text-sm leading-relaxed text-card-foreground">
                    {selectedJob.reason || "High affinity for your profile."}
                  </p>
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase text-muted-foreground mb-2 font-bold">
                    Job Description
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedJob(null)}
                  className="text-foreground hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => applyMutation.mutate(selectedJob)}
                  disabled={applyMutation.isPending}
                  className="font-bold"
                >
                  {applyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add to Tracker
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
