import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Zap, Menu, X, Briefcase, LayoutDashboard, Search, User, MessageSquare, PlusCircle } from "lucide-react";
import { useState } from "react";

export function AppHeader() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const role = profile?.role;

  const isActive = (path: string) => location.pathname === path;

  const navLinkStyle = (path: string): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: isActive(path) ? 600 : 500,
    color: isActive(path) ? "#0d0a1e" : "rgba(15,10,30,0.52)",
    background: isActive(path) ? "rgba(245,158,11,0.10)" : "transparent",
    textDecoration: "none",
    transition: "color .15s, background .15s",
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
  });

  return (
    <>
      <style>{`
        .jl-nav-link:hover { color: #0d0a1e !important; background: rgba(245,158,11,0.06) !important; }
        .jl-signout:hover { color: #ef4444 !important; background: rgba(239,68,68,0.06) !important; }
        .jl-mobile-link:hover { background: rgba(245,158,11,0.08) !important; color: #0d0a1e !important; }
      `}</style>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(248,250,252,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(15,10,30,0.07)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 20px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                height: 30,
                width: 30,
                borderRadius: 8,
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(245,158,11,0.30)",
              }}
            >
              <Zap style={{ height: 15, width: 15, color: "#fff" }} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0d0a1e", letterSpacing: "-0.02em" }}>
              Jlindo
            </span>
          </Link>


          {/* Desktop nav */}
          {user && (
            <nav className="hidden md:flex jl-desktop-nav" style={{ display: "none", alignItems: "center", gap: 2 }}>

              {role === "worker" && (
                <>
                  <Link to="/jobs" className="jl-nav-link" style={navLinkStyle("/jobs")}>
                    <Search style={{ height: 14, width: 14 }} />
                    Find Work
                  </Link>
                  <Link to="/my-applications" className="jl-nav-link" style={navLinkStyle("/my-applications")}>
                    <Briefcase style={{ height: 14, width: 14 }} />
                    My Jobs
                  </Link>
                  <Link to="/profile" className="jl-nav-link" style={navLinkStyle("/profile")}>
                    <User style={{ height: 14, width: 14 }} />
                    Profile
                  </Link>
                </>
              )}

              {role === "employer" && (
                <>
                  <Link to="/employer/dashboard" className="jl-nav-link" style={navLinkStyle("/employer/dashboard")}>
                    <LayoutDashboard style={{ height: 14, width: 14 }} />
                    Dashboard
                  </Link>
                  <Link to="/employer/post-job" className="jl-nav-link" style={navLinkStyle("/employer/post-job")}>
                    <PlusCircle style={{ height: 14, width: 14 }} />
                    Post Job
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link to="/admin" className="jl-nav-link" style={navLinkStyle("/admin")}>
                  <LayoutDashboard style={{ height: 14, width: 14 }} />
                  Admin
                </Link>
              )}

              <Link to="/feedback" className="jl-nav-link" style={navLinkStyle("/feedback")}>
                <MessageSquare style={{ height: 14, width: 14 }} />
                Feedback
              </Link>

              {/* Divider */}
              <div style={{ width: 1, height: 20, background: "rgba(15,10,30,0.10)", margin: "0 6px" }} />

              <button
                onClick={handleSignOut}
                className="jl-signout"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 8,
                  fontSize: 14, fontWeight: 500,
                  color: "rgba(15,10,30,0.45)",
                  background: "transparent", border: "none", cursor: "pointer",
                  transition: "color .15s, background .15s",
                  letterSpacing: "-0.01em",
                }}
              >
                <LogOut style={{ height: 14, width: 14 }} />
                Sign Out
              </button>
            </nav>
          )}

          {/* Unauthenticated nav */}
          {!user && (
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                to="/login"
                style={{
                  padding: "7px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                  color: "rgba(15,10,30,0.55)", textDecoration: "none",
                  border: "1px solid rgba(15,10,30,0.10)", background: "transparent",
                  transition: "all .15s",
                }}
              >
                Log In
              </Link>
              <Link
                to="/signup"
                style={{
                  padding: "7px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                  color: "#1c0e00", textDecoration: "none",
                  background: "linear-gradient(135deg, #F59E0B, #D97706)",
                  boxShadow: "0 2px 8px rgba(245,158,11,0.28)",
                  transition: "all .15s",
                }}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          {user && (
            <button
              className="md:hidden jl-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: "none",
                padding: 6, borderRadius: 8, border: "1px solid rgba(15,10,30,0.10)",
                background: "transparent", cursor: "pointer",
                color: "#0d0a1e",
              }}
            >
              {mobileOpen ? <X style={{ height: 20, width: 20 }} /> : <Menu style={{ height: 20, width: 20 }} />}
            </button>
          )}
        </div>

        {/* ── Desktop nav (CSS fix — flex is hidden by Tailwind's hidden, override) ── */}
        <style>{`
          @media (min-width: 768px) {
            nav.jl-desktop-nav { display: flex !important; }
            button.jl-mobile-toggle { display: none !important; }
          }
          @media (max-width: 767px) {
            nav.jl-desktop-nav { display: none !important; }
            button.jl-mobile-toggle { display: flex !important; }
          }
        `}</style>

        {/* Mobile dropdown */}
        {mobileOpen && user && (
          <div
            style={{
              borderTop: "1px solid rgba(15,10,30,0.07)",
              background: "rgba(248,250,252,0.97)",
              backdropFilter: "blur(16px)",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {role === "worker" && (
              <>
                {[
                  { to: "/jobs", icon: Search, label: "Find Work" },
                  { to: "/my-applications", icon: Briefcase, label: "My Jobs" },
                  { to: "/profile", icon: User, label: "Profile" },
                ].map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="jl-mobile-link"
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: 10,
                      fontSize: 14, fontWeight: isActive(to) ? 600 : 500,
                      color: isActive(to) ? "#0d0a1e" : "rgba(15,10,30,0.55)",
                      background: isActive(to) ? "rgba(245,158,11,0.08)" : "transparent",
                      textDecoration: "none", transition: "all .15s",
                    }}
                  >
                    <Icon style={{ height: 16, width: 16 }} />
                    {label}
                  </Link>
                ))}
              </>
            )}

            {role === "employer" && (
              <>
                {[
                  { to: "/employer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                  { to: "/employer/post-job", icon: PlusCircle, label: "Post Job" },
                ].map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="jl-mobile-link"
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: 10,
                      fontSize: 14, fontWeight: isActive(to) ? 600 : 500,
                      color: isActive(to) ? "#0d0a1e" : "rgba(15,10,30,0.55)",
                      background: isActive(to) ? "rgba(245,158,11,0.08)" : "transparent",
                      textDecoration: "none", transition: "all .15s",
                    }}
                  >
                    <Icon style={{ height: 16, width: 16 }} />
                    {label}
                  </Link>
                ))}
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="jl-mobile-link"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10,
                  fontSize: 14, fontWeight: 500,
                  color: "rgba(15,10,30,0.55)", textDecoration: "none", transition: "all .15s",
                }}
              >
                <LayoutDashboard style={{ height: 16, width: 16 }} />
                Admin
              </Link>
            )}

            <Link
              to="/feedback"
              onClick={() => setMobileOpen(false)}
              className="jl-mobile-link"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10,
                fontSize: 14, fontWeight: 500,
                color: "rgba(15,10,30,0.55)", textDecoration: "none", transition: "all .15s",
              }}
            >
              <MessageSquare style={{ height: 16, width: 16 }} />
              Feedback
            </Link>

            <div style={{ height: 1, background: "rgba(15,10,30,0.07)", margin: "4px 0" }} />

            <button
              onClick={handleSignOut}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10,
                fontSize: 14, fontWeight: 500,
                color: "#ef4444", background: "transparent",
                border: "none", cursor: "pointer", textAlign: "left",
                transition: "all .15s",
              }}
            >
              <LogOut style={{ height: 16, width: 16 }} />
              Sign Out
            </button>
          </div>
        )}
      </header>
    </>
  );
}