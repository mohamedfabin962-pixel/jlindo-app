import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Briefcase, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (user) {
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading profile…</div>
      </div>
    );
  }

  if (profile.role === "employer") return <Navigate to="/employer/dashboard" replace />;
  return <Navigate to="/jobs" replace />;
}

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Find work today.<br />Get paid tomorrow.
          </h1>
          <p className="text-lg text-muted-foreground">
            The hyperlocal marketplace connecting blue-collar workers with employers in your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <Link to="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
          <div className="flex justify-center gap-8 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> For Workers
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" /> For Employers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
