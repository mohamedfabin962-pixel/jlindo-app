import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, X, Briefcase, LayoutDashboard, Search, User, MessageSquare, PlusCircle } from "lucide-react";
import { useState } from "react";
import { BrandedConfirmDialog } from "@/components/BrandedConfirmDialog";
import { motion } from "framer-motion";
import { JlindoLogo } from "@/components/JlindoLogo";

export function AppHeader() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
    setShowLogoutConfirm(false);
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

  const getInitials = () => {
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "US";
  };

  const dropdownMenuStyle: React.CSSProperties = {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    width: 240,
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(15, 10, 30, 0.08)",
    borderRadius: 14,
    boxShadow: "0 10px 30px rgba(15, 10, 30, 0.08)",
    zIndex: 100,
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
  };

  const dropdownItemStyle = (isDanger = false): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: 500,
    color: isDanger ? "#EF4444" : "rgba(15, 10, 30, 0.65)",
    textDecoration: "none",
    transition: "all 0.15s",
    cursor: "pointer",
    background: "transparent",
    border: "none",
    textAlign: "left",
    width: "100%",
  });

  return (
    <>
      <style>{`
        .jl-nav-link:hover { color: #0d0a1e !important; background: rgba(245,158,11,0.06) !important; }
        .jl-signout:hover { color: #ef4444 !important; background: rgba(239,68,68,0.06) !important; }
        .jl-mobile-link:hover { background: rgba(245,158,11,0.08) !important; color: #0d0a1e !important; }
        .jl-dropdown-item:hover { background: rgba(245,158,11,0.06) !important; color: #0d0a1e !important; }
        .jl-dropdown-item-danger:hover { background: rgba(239,68,68,0.06) !important; color: #ef4444 !important; }
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
            style={{ textDecoration: "none", flexShrink: 0 }}
          >
            <JlindoLogo size="sm" variant="color" showTagline={false} />
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
              <div style={{ width: 1, height: 20, background: "rgba(15,10,30,0.10)", margin: "0 12px" }} />

              {/* Avatar & Dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    height: 36,
                    width: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                    boxShadow: "0 2px 6px rgba(245,158,11,0.24)",
                    transition: "transform 0.15s ease",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    getInitials()
                  )}
                </button>


                {dropdownOpen && (
                  <>
                    <div
                      onClick={() => setDropdownOpen(false)}
                      style={{ position: "fixed", inset: 0, zIndex: 40, cursor: "default" }}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={dropdownMenuStyle}
                    >
                      {/* Dropdown Header */}
                      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(15, 10, 30, 0.06)" }}>
                        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>
                          {profile?.full_name || "Welcome"}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "rgba(15, 10, 30, 0.45)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {user?.email}
                        </p>
                      </div>

                      {/* Dropdown Items */}
                      <div style={{ padding: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                        {role === "worker" && (
                          <>
                            <Link 
                              to="/profile" 
                              onClick={() => setDropdownOpen(false)}
                              className="jl-dropdown-item"
                              style={dropdownItemStyle()}
                            >
                              <User style={{ height: 14, width: 14 }} />
                              My Profile
                            </Link>
                            <Link 
                              to="/my-applications" 
                              onClick={() => setDropdownOpen(false)}
                              className="jl-dropdown-item"
                              style={dropdownItemStyle()}
                            >
                              <Briefcase style={{ height: 14, width: 14 }} />
                              My Applications
                            </Link>
                          </>
                        )}
                        {role === "employer" && (
                          <>
                            <Link 
                              to="/employer/dashboard" 
                              onClick={() => setDropdownOpen(false)}
                              className="jl-dropdown-item"
                              style={dropdownItemStyle()}
                            >
                              <LayoutDashboard style={{ height: 14, width: 14 }} />
                              Dashboard
                            </Link>
                            <Link 
                              to="/employer/post-job" 
                              onClick={() => setDropdownOpen(false)}
                              className="jl-dropdown-item"
                              style={dropdownItemStyle()}
                            >
                              <PlusCircle style={{ height: 14, width: 14 }} />
                              Post Job
                            </Link>
                            <Link 
                              to="/profile" 
                              onClick={() => setDropdownOpen(false)}
                              className="jl-dropdown-item"
                              style={dropdownItemStyle()}
                            >
                              <User style={{ height: 14, width: 14 }} />
                              Profile
                            </Link>
                          </>
                        )}
                        {isAdmin && (
                          <Link 
                            to="/admin" 
                            onClick={() => setDropdownOpen(false)}
                            className="jl-dropdown-item"
                            style={dropdownItemStyle()}
                          >
                            <LayoutDashboard style={{ height: 14, width: 14 }} />
                            Admin
                          </Link>
                        )}
                        <Link 
                          to="/feedback" 
                          onClick={() => setDropdownOpen(false)}
                          className="jl-dropdown-item"
                          style={dropdownItemStyle()}
                        >
                          <MessageSquare style={{ height: 14, width: 14 }} />
                          Feedback
                        </Link>
                        
                        <div style={{ height: 1, background: "rgba(15, 10, 30, 0.06)", margin: "4px 0" }} />
                        
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            setShowLogoutConfirm(true);
                          }}
                          className="jl-dropdown-item-danger"
                          style={dropdownItemStyle(true)}
                        >
                          <LogOut style={{ height: 14, width: 14 }} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
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
               onClick={() => {
                 setMobileOpen(false);
                 setShowLogoutConfirm(true);
               }}
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

      <BrandedConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        description="Are you sure you want to log out of your session?"
        confirmText="Sign Out"
        isDestructive
      />
    </>
  );
}