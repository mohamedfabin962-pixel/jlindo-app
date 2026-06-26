import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Briefcase, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BrandedLoadingScreen } from "@/components/BrandedLoading";

export default function Index() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <BrandedLoadingScreen message="Loading Jlindo..." />;
  }

  if (user) {
    if (!profile) {
      return <BrandedLoadingScreen message="Loading profile..." />;
    }

    if (profile.role === "admin") return <Navigate to="/admin" replace />;
    if (profile.role === "employer") return <Navigate to="/employer/dashboard" replace />;
    return <Navigate to="/jobs" replace />;
  }

  return (
    <>
      <style>{`
        .jl-btn-primary {
          background: linear-gradient(135deg, #F59E0B, #EA580C) !important;
          color: white !important;
          border: 0 !important;
          transition: all 0.3s ease !important;
        }
        .jl-btn-primary:hover {
          background: linear-gradient(135deg, #FBBF24, #F59E0B) !important;
          box-shadow: 0 4px 18px rgba(245,158,11,0.35) !important;
        }
        .jl-hero-badge {
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.18);
          color: #EA580C;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-radius: 99px;
          padding: 6px 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col"
        style={{
          background: "linear-gradient(160deg, #F8FAFC 0%, #FFF7ED 55%, #F8FAFC 100%)",
          fontFamily: "'Inter', sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Decorative background blur blobs */}
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="flex-1 flex items-center justify-center p-6" style={{ zIndex: 1 }}>
          <div className="max-w-xl text-center space-y-6">
            
            <div className="flex justify-center mb-2">
              <div className="jl-hero-badge">
                <Briefcase size={13} />
                Hyperlocal Job Matching
              </div>
            </div>

            <h1 style={{ margin: 0, fontSize: "clamp(2.2rem, 5vw, 3.2rem)", fontWeight: 900, color: "#0d0a1e", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Find work today.<br />
              <span style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Get paid tomorrow.
              </span>
            </h1>

            <p style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)", color: "rgba(15,10,30,0.52)", lineHeight: 1.6, maxWidth: 480, margin: "16px auto 0" }}>
              The premium, hyperlocal marketplace connecting skilled blue-collar workers with trusted employers in real time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4" style={{ maxWidth: 400, margin: "24px auto 0" }}>
              <Button size="lg" className="jl-btn-primary h-12 rounded-xl px-8 font-bold shadow-md" asChild>
                <Link to="/signup" className="flex items-center gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" className="h-12 rounded-xl px-8 font-semibold border-slate-200 hover:bg-slate-50" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 24, paddingTop: 32, fontSize: 13, color: "rgba(15,10,30,0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={15} style={{ color: "#10B981" }} />
                <span>Verified Workers</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={15} style={{ color: "#10B981" }} />
                <span>Fast Payments</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}