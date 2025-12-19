import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  FileText,
  Briefcase,
  LayoutDashboard,
  LogOut,
  Bell,
  Loader2,
  BookOpen,
  Circle,
  Lightbulb,
} from "lucide-react";

export function Navbar() {
  const auth = useAuth() as any;
  const { user } = auth;
  const [location] = useLocation();
  const queryClient = useQueryClient();

  // 1. Fetch Real-Time AI Mentorship Notifications
  const { data: notifications } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
    refetchInterval: 3000, // Frequent polling for live "Real Knowledge" updates
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  // 2. Mark as Read Mutation
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const isAuthLoading = auth.userLoading || auth.loading || auth.isLoading;
  const logoutAction = auth.logoutMutation || auth.logout || auth.signOut;
  const isPending = logoutAction?.isPending || false;

  const isLandingPage = location === "/";

  const handleLogout = () => {
    if (logoutAction?.mutate) {
      logoutAction.mutate();
    } else if (typeof logoutAction === "function") {
      logoutAction();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-sans text-xl font-bold tracking-tight">
            GlobalCoach<span className="text-primary">AI</span>
          </span>
        </Link>

        {!isLandingPage && user && (
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/">
              <Button
                variant={location === "/" ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <Link href="/cv-builder">
              <Button
                variant={location === "/cv-builder" ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <FileText className="h-4 w-4" /> CV Builder
              </Button>
            </Link>
            <Link href="/jobs">
              <Button
                variant={location === "/jobs" ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Briefcase className="h-4 w-4" /> Jobs
              </Button>
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isAuthLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <div className="flex items-center gap-2">
              {/* --- 🔔 ENHANCED AI MENTOR BELL --- */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative group"
                  >
                    <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    {unreadCount > 0 && (
                      <span className="absolute right-2 top-2 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-background"></span>
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 mt-2 p-0 shadow-2xl border-primary/20"
                >
                  <div className="bg-primary/5 p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <h3 className="text-xs font-black uppercase tracking-tighter">
                        AI Mentor Insights
                      </h3>
                    </div>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="max-h-[450px] overflow-y-auto">
                    {notifications?.length === 0 ? (
                      <div className="p-10 text-center space-y-2">
                        <p className="text-xs text-muted-foreground italic">
                          No learning insights yet.
                        </p>
                        <p className="text-[10px] text-muted-foreground/60">
                          Search for jobs to trigger AI gap analysis.
                        </p>
                      </div>
                    ) : (
                      notifications?.map((n) => (
                        <div
                          key={n.id}
                          className={`p-4 border-b flex gap-3 items-start transition-all hover:bg-muted/30 cursor-default ${
                            !n.read
                              ? "border-l-4 border-l-primary bg-primary/5"
                              : "opacity-70"
                          }`}
                          onMouseEnter={() =>
                            !n.read && markReadMutation.mutate(n.id)
                          }
                        >
                          <div
                            className={`mt-0.5 p-2 rounded-lg ${
                              n.type === "skill_gap"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {n.type === "skill_gap" ? (
                              <BookOpen className="h-4 w-4" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black">{n.title}</p>
                              {!n.read && (
                                <Circle className="h-1.5 w-1.5 fill-primary text-primary" />
                              )}
                            </div>
                            <p className="text-[11px] leading-relaxed text-foreground font-medium italic">
                              "{n.message}"
                            </p>
                            <p className="text-[9px] text-muted-foreground uppercase pt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 bg-muted/20 text-center border-t">
                    <p className="text-[10px] text-muted-foreground font-medium italic">
                      AI is continuously analyzing your profile...
                    </p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* --- USER ACCOUNT --- */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full border border-primary/10"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                        {user.displayName?.charAt(0) ||
                          user.email?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 mt-2 shadow-xl"
                >
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-bold truncate">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/cv-builder"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" /> CV Builder
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:bg-destructive/10"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
