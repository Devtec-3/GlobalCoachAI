import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/LoadingSpinner";
import { apiRequest } from "@/lib/queryClient";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  FolderOpen,
  ArrowRight,
  Sparkles,
  Plus,
  Loader2,
  Download,
} from "lucide-react";
import type { CvProfileWithDetails } from "@shared/schema";

const steps = [
  { id: 1, name: "Personal Info", icon: User },
  { id: 2, name: "Education", icon: GraduationCap },
  { id: 3, name: "Experience", icon: Briefcase },
  { id: 4, name: "Skills", icon: Code },
  { id: 5, name: "Projects", icon: FolderOpen },
];

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  summary: z.string().optional(),
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

export default function CVBuilder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [optimizingField, setOptimizingField] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data: cvProfile, isLoading } = useQuery<CvProfileWithDetails>({
    queryKey: ["/api/cv-profile/full"],
    enabled: !!user,
  });

  const form = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: cvProfile?.firstName || user?.displayName?.split(" ")[0] || "",
      lastName:
        cvProfile?.lastName ||
        user?.displayName?.split(" ").slice(1).join(" ") ||
        "",
      email: cvProfile?.email || user?.email || "",
      phone: cvProfile?.phone || "",
      location: cvProfile?.location || "",
      linkedinUrl: cvProfile?.linkedinUrl || "",
      portfolioUrl: cvProfile?.portfolioUrl || "",
      summary: cvProfile?.summary || (cvProfile as any)?.bio || "",
    },
  });

  // --- REAL-TIME STRENGTH CALCULATION ---
  const completionPercentage = useMemo(() => {
    if (!cvProfile) return 0;
    let score = 0;
    const p = cvProfile as any;

    if ((p.summary || p.bio)?.length > 5) score += 30;
    if (p.location || p.phone) score += 10;
    if (p.skills && p.skills.length >= 3) score += 20;
    if (p.education && p.education.length > 0) score += 20;
    if (p.workExperience && p.workExperience.length > 0) score += 20;

    return Math.min(100, score);
  }, [cvProfile]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("cv-preview-content");
    if (!element) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${cvProfile?.firstName || "My"}_AI_CV.pdf`);
      toast({ title: "Success!", description: "CV Downloaded." });
    } catch (err) {
      toast({ title: "Export Failed", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: PersonalInfoForm) => {
      return apiRequest("POST", "/api/cv-profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cv-profile/full"] });
      toast({ title: "Saved!", description: "Personal info updated." });
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/ai/optimize", {
        content: text,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.optimizedText) {
        form.setValue("summary", data.optimizedText);
        toast({
          title: "Optimized!",
          description: "AI enhanced your summary.",
        });
      }
    },
    onSettled: () => setOptimizingField(null),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">CV Builder</h1>
          <p className="text-muted-foreground font-medium">
            Build your AI-optimized profile
          </p>
        </div>
        <div className="flex items-center gap-4">
          {showPreview && (
            <Button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              variant="outline"
              className="bg-primary/5"
            >
              {isExporting ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export PDF
            </Button>
          )}
          <div className="flex items-center gap-2 border rounded-full px-4 py-2 bg-muted/30">
            <Label
              htmlFor="preview-toggle"
              className="text-xs font-bold uppercase"
            >
              Preview Mode
            </Label>
            <Switch
              id="preview-toggle"
              checked={showPreview}
              onCheckedChange={setShowPreview}
            />
          </div>
        </div>
      </div>

      <div className="mb-8 space-y-2">
        <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
          <span>Profile Strength</span>
          <span>{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2 bg-muted" />
      </div>

      <div
        className={`grid gap-8 ${
          showPreview ? "lg:grid-cols-3" : "max-w-3xl mx-auto"
        }`}
      >
        <div className={showPreview ? "lg:col-span-2" : ""}>
          <Card className="border-primary/10 shadow-xl">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="flex items-center gap-2">
                {steps[currentStep - 1].name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {currentStep === 1 && (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) => {
                      saveMutation.mutate(data);
                      setCurrentStep(2);
                    })}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center mb-2">
                            <FormLabel>Professional Summary</FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-primary text-xs font-bold"
                              onClick={() => {
                                setOptimizingField("summary");
                                optimizeMutation.mutate(field.value || "");
                              }}
                            >
                              {optimizingField === "summary" ? (
                                <Loader2 className="animate-spin h-3 w-3 mr-1" />
                              ) : (
                                <Sparkles className="h-3 w-3 mr-1" />
                              )}
                              AI Optimize
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea className="min-h-[120px]" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Save & Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              )}
              {currentStep === 2 && (
                <EducationStep
                  education={cvProfile?.education || []}
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                />
              )}
              {currentStep === 3 && (
                <ExperienceStep
                  experience={cvProfile?.workExperience || []}
                  onNext={() => setCurrentStep(4)}
                  onBack={() => setCurrentStep(2)}
                />
              )}
              {currentStep === 4 && (
                <SkillsStep
                  skills={cvProfile?.skills || []}
                  onNext={() => setCurrentStep(5)}
                  onBack={() => setCurrentStep(3)}
                />
              )}
              {currentStep === 5 && (
                <ProjectsStep
                  projects={cvProfile?.projects || []}
                  onBack={() => setCurrentStep(4)}
                />
              )}
            </CardContent>
          </Card>
        </div>
        {showPreview && <CVPreview profile={cvProfile} />}
      </div>
    </div>
  );
}

// SUB-COMPONENTS
function EducationStep({ education, onNext, onBack }: any) {
  const [entries, setEntries] = useState(
    education.length > 0 ? education : [{}]
  );
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: (data: any[]) =>
      apiRequest("POST", "/api/cv-profile/education", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cv-profile/full"] });
      onNext();
    },
  });
  return (
    <div className="space-y-6">
      {entries.map((entry: any, i: number) => (
        <div key={i} className="border p-4 rounded-lg space-y-4">
          <Input
            placeholder="Institution"
            defaultValue={entry.institution}
            onChange={(e) => {
              entries[i].institution = e.target.value;
              setEntries([...entries]);
            }}
          />
          <Input
            placeholder="Degree"
            defaultValue={entry.degree}
            onChange={(e) => {
              entries[i].degree = e.target.value;
              setEntries([...entries]);
            }}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              defaultValue={entry.startDate}
              onChange={(e) => {
                entries[i].startDate = e.target.value;
                setEntries([...entries]);
              }}
            />
            <Input
              type="date"
              defaultValue={entry.endDate}
              onChange={(e) => {
                entries[i].endDate = e.target.value;
                setEntries([...entries]);
              }}
            />
          </div>
        </div>
      ))}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => save.mutate(entries)}>Continue</Button>
      </div>
    </div>
  );
}

function ExperienceStep({ experience, onNext, onBack }: any) {
  const [entries, setEntries] = useState(
    experience.length > 0 ? experience : [{}]
  );
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: (data: any[]) =>
      apiRequest("POST", "/api/cv-profile/experience", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cv-profile/full"] });
      onNext();
    },
  });
  return (
    <div className="space-y-6">
      {entries.map((entry: any, i: number) => (
        <div key={i} className="border p-4 rounded-lg space-y-4">
          <Input
            placeholder="Company"
            defaultValue={(entry as any).company}
            onChange={(e) => {
              (entries[i] as any).company = e.target.value;
              setEntries([...entries]);
            }}
          />
          <Input
            placeholder="Position"
            defaultValue={(entry as any).position}
            onChange={(e) => {
              (entries[i] as any).position = e.target.value;
              setEntries([...entries]);
            }}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              defaultValue={entry.startDate}
              onChange={(e) => {
                entries[i].startDate = e.target.value;
                setEntries([...entries]);
              }}
            />
            <Input
              type="date"
              defaultValue={entry.endDate}
              onChange={(e) => {
                entries[i].endDate = e.target.value;
                setEntries([...entries]);
              }}
            />
          </div>
        </div>
      ))}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => save.mutate(entries)}>Continue</Button>
      </div>
    </div>
  );
}

function SkillsStep({ skills, onNext, onBack }: any) {
  const [list, setList] = useState<string[]>(
    skills.map((s: any) => s.name) || []
  );
  const [val, setVal] = useState("");
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: (s: string[]) =>
      apiRequest("POST", "/api/cv-profile/skills", s),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cv-profile/full"] });
      onNext();
    },
  });
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Add Skill"
        />
        <Button
          onClick={() => {
            if (val) {
              setList([...list, val]);
              setVal("");
            }
          }}
        >
          <Plus />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((s) => (
          <Badge
            key={s}
            variant="secondary"
            className="bg-primary/10 text-primary uppercase text-[10px]"
          >
            {s}
          </Badge>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => save.mutate(list)}>Continue</Button>
      </div>
    </div>
  );
}

function ProjectsStep({ projects, onBack }: any) {
  const [entries, setEntries] = useState(projects.length > 0 ? projects : [{}]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const save = useMutation({
    mutationFn: (data: any[]) =>
      apiRequest("POST", "/api/cv-profile/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cv-profile/full"] });
      toast({ title: "CV Complete!" });
    },
  });
  return (
    <div className="space-y-6">
      {entries.map((entry: any, i: number) => (
        <div key={i} className="border p-4 rounded-lg space-y-4">
          <Input
            placeholder="Project Name"
            defaultValue={entry.name}
            onChange={(e) => {
              entries[i].name = e.target.value;
              setEntries([...entries]);
            }}
          />
        </div>
      ))}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => save.mutate(entries)}>Finish CV</Button>
      </div>
    </div>
  );
}

function CVPreview({ profile }: { profile: any }) {
  if (!profile) return null;
  return (
    <div className="lg:sticky lg:top-24 h-fit">
      <div
        id="cv-preview-content"
        className="rounded-xl border bg-white text-slate-900 shadow-2xl p-8 overflow-hidden"
        style={{
          width: "210mm",
          minHeight: "297mm",
          transform: "scale(0.4)",
          transformOrigin: "top left",
        }}
      >
        <div className="h-3 bg-primary mb-8" />
        <h2 className="text-4xl font-black text-primary uppercase">
          {profile.firstName} {profile.lastName}
        </h2>
        <div className="mt-4 flex gap-4 text-sm font-bold text-slate-500 uppercase tracking-widest border-b-2 pb-6 mb-8">
          {profile.email && <span>{profile.email}</span>}
          {profile.phone && <span>• {profile.phone}</span>}
          {profile.location && <span>• {profile.location}</span>}
        </div>
        {(profile.summary || profile.bio) && (
          <section className="mb-8">
            <h4 className="text-xs font-black text-primary uppercase border-l-4 border-primary pl-3 mb-4 tracking-[0.2em]">
              Profile Summary
            </h4>
            <p className="text-sm italic text-slate-600">
              "{profile.summary || profile.bio}"
            </p>
          </section>
        )}
        {profile.skills?.length > 0 && (
          <section className="mb-8">
            <h4 className="text-xs font-black text-primary uppercase border-l-4 border-primary pl-3 mb-4 tracking-[0.2em]">
              Technical Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s: any, i: number) => (
                <span
                  key={i}
                  className="border-2 px-3 py-1 rounded text-[10px] font-black uppercase text-slate-600"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
