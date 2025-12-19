import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { PageLoader, AILoadingShimmer } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { apiRequest } from "@/lib/queryClient";
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
  FileText,
  CheckCircle,
  Clock,
  Users,
  Trophy,
  Plus,
  Loader2,
  GripVertical,
  MoreHorizontal,
  Trash2,
  Edit,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ApplicationWithJob, Application } from "@shared/schema";

type ApplicationStatus = "to_apply" | "applied" | "interviewing" | "hired";

const statusConfig: Record<ApplicationStatus, { label: string; icon: typeof Clock; color: string; bgColor: string }> = {
  to_apply: { label: "To Apply", icon: Clock, color: "text-muted-foreground", bgColor: "bg-muted" },
  applied: { label: "Applied", icon: FileText, color: "text-chart-1", bgColor: "bg-chart-1/10" },
  interviewing: { label: "Interviewing", icon: Users, color: "text-chart-4", bgColor: "bg-chart-4/10" },
  hired: { label: "Hired", icon: Trophy, color: "text-chart-2", bgColor: "bg-chart-2/10" },
};

const statusOrder: ApplicationStatus[] = ["to_apply", "applied", "interviewing", "hired"];

export default function Applications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<ApplicationWithJob | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

  const { data: applications, isLoading } = useQuery<ApplicationWithJob[]>({
    queryKey: ["/api/applications"],
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/applications/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({ title: "Updated!", description: "Application status updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      return apiRequest("PATCH", `/api/applications/${id}`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({ title: "Saved!", description: "Notes updated." });
      setEditingNotes(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/applications/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({ title: "Deleted!", description: "Application removed." });
      setSelectedApp(null);
    },
  });

  const generateCoverLetterMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiRequest("POST", "/api/ai/cover-letter", { jobId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.coverLetter && selectedApp) {
        setSelectedApp({ ...selectedApp, coverLetter: data.coverLetter });
      }
      toast({ title: "Generated!", description: "Cover letter created." });
      setGeneratingCoverLetter(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate.", variant: "destructive" });
      setGeneratingCoverLetter(false);
    },
  });

  const moveToNextStatus = (app: ApplicationWithJob) => {
    const currentIndex = statusOrder.indexOf(app.status as ApplicationStatus);
    if (currentIndex < statusOrder.length - 1) {
      updateStatusMutation.mutate({ id: app.id, status: statusOrder[currentIndex + 1] });
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  const groupedApplications = statusOrder.reduce((acc, status) => {
    acc[status] = (applications || []).filter((app) => app.status === status);
    return acc;
  }, {} as Record<ApplicationStatus, ApplicationWithJob[]>);

  const stats = {
    total: applications?.length || 0,
    toApply: groupedApplications.to_apply.length,
    applied: groupedApplications.applied.length,
    interviewing: groupedApplications.interviewing.length,
    hired: groupedApplications.hired.length,
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Application Tracker</h1>
          <p className="text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total:</span>
            <Badge variant="secondary">{stats.total}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Success Rate:</span>
            <Badge variant="secondary" className={stats.hired > 0 ? "bg-chart-2/20 text-chart-2" : ""}>
              {stats.total > 0 ? Math.round((stats.hired / stats.total) * 100) : 0}%
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statusOrder.map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          return (
            <Card key={status} className={config.bgColor}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{config.label}</p>
                    <p className="mt-1 text-2xl font-bold">{groupedApplications[status].length}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${config.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board */}
      {stats.total === 0 ? (
        <EmptyState
          icon="applications"
          title="No applications yet"
          description="Start by finding jobs that match your skills and adding them to your tracker"
          actionLabel="Find Jobs"
          onAction={() => window.location.href = "/jobs"}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          {statusOrder.map((status) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const apps = groupedApplications[status];

            return (
              <div key={status} className="flex flex-col">
                <div className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2 ${config.bgColor}`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {apps.length}
                  </Badge>
                </div>

                <div className="flex-1 space-y-3">
                  {apps.map((app) => (
                    <Card
                      key={app.id}
                      className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
                      onClick={() => {
                        setSelectedApp(app);
                        setNotes(app.notes || "");
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Building className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {status !== "hired" && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveToNextStatus(app);
                                  }}
                                >
                                  <ArrowRight className="mr-2 h-4 w-4" />
                                  Move to {statusConfig[statusOrder[statusOrder.indexOf(status) + 1]]?.label}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMutation.mutate(app.id);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <h4 className="mb-1 font-semibold line-clamp-1">
                          {app.job?.title || "Unknown Position"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {app.job?.company || "Unknown Company"}
                        </p>

                        {app.job?.location && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {app.job.location}
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {app.createdAt
                              ? new Date(app.createdAt).toLocaleDateString()
                              : "Recently"}
                          </span>
                          {app.notes && (
                            <Badge variant="outline" className="text-xs">
                              <FileText className="mr-1 h-3 w-3" />
                              Notes
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Add Card Placeholder */}
                  {status === "to_apply" && (
                    <Card
                      className="cursor-pointer border-dashed transition-colors hover:border-primary hover:bg-muted/50"
                      onClick={() => window.location.href = "/jobs"}
                    >
                      <CardContent className="flex items-center justify-center gap-2 p-4 text-muted-foreground">
                        <Plus className="h-4 w-4" />
                        <span className="text-sm">Add Job</span>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-lg">
          {selectedApp && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Building className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle>{selectedApp.job?.title || "Unknown Position"}</DialogTitle>
                    <DialogDescription>
                      {selectedApp.job?.company || "Unknown Company"}
                    </DialogDescription>
                  </div>
                  <Badge className={statusConfig[selectedApp.status as ApplicationStatus].bgColor}>
                    {statusConfig[selectedApp.status as ApplicationStatus].label}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Quick Info */}
                <div className="flex flex-wrap gap-2">
                  {selectedApp.job?.location && (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedApp.job.location}
                    </Badge>
                  )}
                  {selectedApp.job?.type && (
                    <Badge variant="outline" className="gap-1">
                      <Briefcase className="h-3 w-3" />
                      {selectedApp.job.type}
                    </Badge>
                  )}
                  {selectedApp.appliedDate && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      Applied: {new Date(selectedApp.appliedDate).toLocaleDateString()}
                    </Badge>
                  )}
                </div>

                {/* Status Actions */}
                <div>
                  <Label className="mb-2 block text-sm">Update Status</Label>
                  <div className="flex gap-2">
                    {statusOrder.map((status) => {
                      const config = statusConfig[status];
                      const Icon = config.icon;
                      const isActive = selectedApp.status === status;
                      return (
                        <Button
                          key={status}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => {
                            updateStatusMutation.mutate({ id: selectedApp.id, status });
                            setSelectedApp({ ...selectedApp, status });
                          }}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Icon className="h-3 w-3" />
                          <span className="hidden sm:inline">{config.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="text-sm">Notes</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingNotes(!editingNotes)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      {editingNotes ? "Cancel" : "Edit"}
                    </Button>
                  </div>
                  {editingNotes ? (
                    <div className="space-y-2">
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this application..."
                        className="min-h-24 resize-none"
                        data-testid="textarea-notes"
                      />
                      <Button
                        size="sm"
                        onClick={() => updateNotesMutation.mutate({ id: selectedApp.id, notes })}
                        disabled={updateNotesMutation.isPending}
                      >
                        {updateNotesMutation.isPending && (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        )}
                        Save Notes
                      </Button>
                    </div>
                  ) : (
                    <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                      {selectedApp.notes || "No notes added yet"}
                    </p>
                  )}
                </div>

                {/* Cover Letter */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="text-sm">Cover Letter</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        setGeneratingCoverLetter(true);
                        generateCoverLetterMutation.mutate(selectedApp.jobId);
                      }}
                      disabled={generatingCoverLetter}
                      data-testid="button-generate-cover-letter-modal"
                    >
                      {generatingCoverLetter ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      Generate with AI
                    </Button>
                  </div>
                  {generatingCoverLetter ? (
                    <AILoadingShimmer text="Creating personalized cover letter..." />
                  ) : selectedApp.coverLetter ? (
                    <div className="max-h-40 overflow-y-auto rounded-lg border bg-muted/30 p-3 text-sm">
                      {selectedApp.coverLetter}
                    </div>
                  ) : (
                    <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                      No cover letter generated yet
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(selectedApp.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                {selectedApp.job?.applicationUrl && (
                  <Button asChild>
                    <a
                      href={selectedApp.job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Apply Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
