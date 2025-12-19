import { useState, useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Navbar } from "@/components/Navbar";
import { PageLoader } from "@/components/LoadingSpinner";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";
import Dashboard from "@/pages/Dashboard";
import CVBuilder from "@/pages/CVBuilder";
import Jobs from "@/pages/Jobs";
import Applications from "@/pages/Applications";
import AuthPage from "./pages/AuthPage";

// 1. IMPROVED PROTECTED ROUTE
function ProtectedRoute({
  component: Component,
}: {
  component: () => JSX.Element;
}) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If we've finished loading and there's no user, send to auth page
    if (!loading && !user) {
      setLocation("/auth");
    }
  }, [loading, user, setLocation]);

  if (loading) {
    return <PageLoader />;
  }

  // If no user, show loader while the useEffect above handles the redirect
  if (!user) {
    return <PageLoader />;
  }

  return <Component />;
}

function Router() {
  const { user, loading } = useAuth();

  return (
    <Switch>
      {/* 2. AUTO-REDIRECT LOGGED IN USERS AWAY FROM AUTH/SIGNIN */}
      <Route path="/">
        {user ? <Redirect to="/dashboard" /> : <Landing />}
      </Route>

      <Route path="/auth">
        {user ? <Redirect to="/dashboard" /> : <AuthPage />}
      </Route>

      <Route path="/signup">
        {user ? <Redirect to="/dashboard" /> : <SignUp />}
      </Route>

      <Route path="/signin">
        {user ? <Redirect to="/dashboard" /> : <SignIn />}
      </Route>

      {/* 3. PROTECTED CORE ROUTES */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>

      <Route path="/cv-builder">
        <ProtectedRoute component={CVBuilder} />
      </Route>

      <Route path="/jobs">
        <ProtectedRoute component={Jobs} />
      </Route>

      <Route path="/applications">
        <ProtectedRoute component={Applications} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Router />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
