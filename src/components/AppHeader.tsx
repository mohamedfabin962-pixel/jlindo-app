import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Briefcase, Menu, X } from "lucide-react";
import { useState } from "react";

export function AppHeader() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const role = profile?.role;

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Briefcase className="h-5 w-5 text-primary" />
          JobConnecting
        </Link>

        {user && (
          <>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {role === "worker" && (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/jobs">Find Work</Link>
                  </Button>

                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/my-applications">My Jobs</Link>
                  </Button>

                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/profile">Profile</Link>
                  </Button>
                </>
              )}

              {role === "employer" && (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/employer/dashboard">Dashboard</Link>
                  </Button>

                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/employer/post-job">Post Job</Link>
                  </Button>
                </>
              )}

              {isAdmin && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin">Admin</Link>
                </Button>
              )}

              <Button variant="ghost" size="sm" asChild>
                <Link to="/feedback">Feedback</Link>
              </Button>

              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </nav>

            {/* Mobile toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </>
        )}

        {!user && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && user && (
        <div className="md:hidden border-t bg-card p-4 space-y-2">
          {role === "worker" && (
            <>
              <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/jobs">Find Work</Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/my-applications">My Jobs</Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/profile">Profile</Link>
              </Button>
            </>
          )}

          {role === "employer" && (
            <>
              <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/employer/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/employer/post-job">Post Job</Link>
              </Button>
            </>
          )}

          {isAdmin && (
            <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
              <Link to="/admin">Admin</Link>
            </Button>
          )}

          <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
            <Link to="/feedback">Feedback</Link>
          </Button>

          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      )}
    </header>
  );
}