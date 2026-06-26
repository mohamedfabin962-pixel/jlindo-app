import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Loader2, MapPin, HardHat, Wrench, Eye, EyeOff } from "lucide-react";
import { JlindoLogo } from "@/components/JlindoLogo";

/* ─────────────────────────────────────────────────────────────
   Floating decorative job chip
───────────────────────────────────────────────────────────── */
function FloatingChip({
  icon: Icon,
  label,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full
                  border border-white/10 bg-white/5 backdrop-blur-sm
                  text-white/50 text-xs font-medium select-none pointer-events-none ${className}`}
    >
      <Icon className="h-3 w-3 text-amber-400/70" />
      {label}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main login page
───────────────────────────────────────────────────────────── */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login successful",
        description: "Redirecting...",
      });
      window.location.href = "/"; // ⭐ ONLY THIS
    }
  };

  return (
    <>
      {/* ══ KEYFRAMES & GLOBAL OVERRIDES ═══════════════════════ */}
      <style>{`
        @keyframes jl-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes jl-blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(24px, -16px) scale(1.05); }
          66%       { transform: translate(-16px, 12px) scale(0.96); }
        }
        @keyframes jl-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes jl-shimmer {
          0%   { background-position: -300px 0; }
          100% { background-position: 300px 0; }
        }

        /* staggered entrance */
        .jl-1 { animation: jl-fade-up .5s ease-out 0s forwards; }
        .jl-2 { animation: jl-fade-up .5s ease-out .06s forwards; }
        .jl-3 { animation: jl-fade-up .5s ease-out .12s forwards; }
        .jl-4 { animation: jl-fade-up .5s ease-out .18s forwards; }
        .jl-5 { animation: jl-fade-up .5s ease-out .24s forwards; }
        .jl-card { animation: jl-fade-up .55s ease-out .08s forwards; }

        /* blob glows */
        .jl-b1 { animation: jl-blob 15s ease-in-out infinite; }
        .jl-b2 { animation: jl-blob 19s ease-in-out 5s infinite reverse; }
        .jl-b3 { animation: jl-blob 23s ease-in-out 10s infinite; }

        /* floating chips */
        .jl-fc1 { animation: jl-float 6s ease-in-out infinite; }
        .jl-fc2 { animation: jl-float 8s ease-in-out 2s infinite; }
        .jl-fc3 { animation: jl-float 7s ease-in-out 4s infinite; }

        /* input overrides for dark glass surface */
        .jl-input {
          background: rgba(255,255,255,0.07) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          color: #ffffff !important;
          border-radius: 12px !important;
        }
        .jl-input::placeholder {
          color: rgba(255,255,255,0.28) !important;
        }
        .jl-input:focus-visible {
          outline: none !important;
          border-color: #F59E0B !important;
          background: rgba(255,255,255,0.10) !important;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.16) !important;
        }

        /* CTA shimmer */
        .jl-btn { position: relative; overflow: hidden; }
        .jl-btn:not(:disabled):hover::after {
          content: '';
          position: absolute; inset: 0; border-radius: inherit;
          background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%);
          background-size: 300px 100%;
          animation: jl-shimmer .65s ease forwards;
        }
      `}</style>

      {/* ══ ROOT CANVAS ════════════════════════════════════════ */}
      <div
        className="relative min-h-screen w-full flex flex-col lg:flex-row overflow-hidden"
        style={{ background: "#0d0a1e", fontFamily: "'Inter', sans-serif" }}
      >

        {/* ── AMBIENT GLOWS (behind everything) ────────────── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* amber warm — top-left */}
          <div
            className="jl-b1 absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.20) 0%, transparent 65%)" }}
          />
          {/* violet — right-center */}
          <div
            className="jl-b2 absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 60%)", transform: "translateX(40%)" }}
          />
          {/* blue depth — bottom */}
          <div
            className="jl-b3 absolute bottom-0 left-1/3 w-[700px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(37,99,235,0.13) 0%, transparent 65%)", transform: "translateY(50%)" }}
          />

          {/* dot grid */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.035 }}>
            <defs>
              <pattern id="jl-g" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#jl-g)" />
          </svg>
        </div>

        {/* ══════════════════════════════════════════════════════
            LEFT PANEL — editorial brand canvas (desktop only)
        ══════════════════════════════════════════════════════ */}
        <div className="relative z-10 hidden lg:flex lg:w-[56%] flex-col px-14 xl:px-20 py-12">

          {/* Brand */}
          <div className="jl-1 flex items-center gap-3">
            <JlindoLogo size="sm" variant="white" showTagline={false} />
          </div>

          {/* ── HERO TEXT BLOCK ─────────────────────────── */}
          <div className="flex-1 flex flex-col justify-center mt-12 mb-12">

            {/* Label */}
            <p className="jl-2" style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "rgba(245,158,11,0.80)",
              marginBottom: 20,
            }}>
              Your next opportunity awaits
            </p>

            {/* Giant headline */}
            <h1 style={{ margin: 0, padding: 0 }}>
              <span
                className="jl-3 block text-white"
                style={{
                  fontSize: "clamp(54px, 6.2vw, 88px)",
                  fontWeight: 800,
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                }}
              >
                Opportunities
              </span>
              <span
                className="jl-4 block"
                style={{
                  fontSize: "clamp(54px, 6.2vw, 88px)",
                  fontWeight: 800,
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(90deg, #F59E0B 0%, #FBBF24 55%, #F59E0B 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Start Here.
              </span>
            </h1>

            {/* Body */}
            <p
              className="jl-5"
              style={{
                marginTop: 28, fontSize: 15, lineHeight: 1.65,
                color: "rgba(255,255,255,0.40)", maxWidth: 340,
              }}
            >
              Jlindo connects skilled workers with employers across the country.
              Browse verified jobs, apply instantly, and track your journey.
            </p>

            {/* Floating job chips */}
            <div className="jl-5 flex flex-wrap gap-2 mt-10">
              <FloatingChip icon={HardHat} label="Construction" className="jl-fc1" />
              <FloatingChip icon={Wrench} label="Plumbing & Repair" className="jl-fc2" />
              <FloatingChip icon={MapPin} label="Jobs Near You" className="jl-fc3" />
            </div>

            {/* Social proof */}
            <div className="jl-5 flex items-center gap-4 mt-10">
              <div className="flex -space-x-2.5">
                {(["#F59E0B","#8B5CF6","#3B82F6","#10B981"] as const).map((bg, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{
                      backgroundColor: bg,
                      border: "2.5px solid #0d0a1e",
                      zIndex: 4 - i,
                    }}
                  >
                    {["RK","MF","SA","PL"][i]}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)" }}>
                <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>50,000+</span>
                {" "}workers found their job here
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", display: "flex", gap: 8 }}>
            <span>© 2025 Jlindo</span><span>·</span>
            <span>Privacy</span><span>·</span><span>Terms</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT PANEL — glass auth form
        ══════════════════════════════════════════════════════ */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-12 lg:py-0 lg:px-12 xl:px-16">

          {/* Spotlight glow behind the card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-80 h-80 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%)",
              filter: "blur(48px)",
            }}
          />

          <div className="relative w-full max-w-[390px]">

            {/* ── MOBILE ONLY: brand + headline ─────────── */}
            <div className="lg:hidden mb-8">
              <div className="jl-1 flex items-center gap-2.5 mb-8">
                <JlindoLogo size="sm" variant="white" showTagline={false} />
              </div>

              <h1 className="jl-2" style={{ margin: 0 }}>
                <span
                  className="block text-white"
                  style={{ fontSize: "clamp(38px, 10vw, 52px)", fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.03em" }}
                >
                  Opportunities
                </span>
                <span
                  className="block"
                  style={{
                    fontSize: "clamp(38px, 10vw, 52px)", fontWeight: 800,
                    lineHeight: 0.95, letterSpacing: "-0.03em",
                    background: "linear-gradient(90deg, #F59E0B, #FBBF24)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}
                >
                  Start Here.
                </span>
              </h1>
              <p className="jl-3 mt-3" style={{ fontSize: 14, color: "rgba(255,255,255,0.38)" }}>
                Sign in to continue your journey.
              </p>
            </div>

            {/* ── GLASS CARD ─────────────────────────────── */}
            <div
              className="jl-card rounded-3xl p-7 sm:p-9"
              style={{
                background: "rgba(255,255,255,0.055)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 20px 70px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)",
              }}
            >
              {/* Card header */}
              <div style={{ marginBottom: 28 }}>
                <h2 style={{
                  margin: 0, color: "#ffffff", fontSize: 22,
                  fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2,
                }}>
                  Welcome back
                </h2>
                <p style={{ marginTop: 6, fontSize: 14, color: "rgba(255,255,255,0.38)" }}>
                  Enter your credentials to continue
                </p>
              </div>

              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Email */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <Label
                    htmlFor="login-email"
                    style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}
                  >
                    Email Address
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="jl-input h-12 px-4 text-[15px]"
                  />
                </div>

                {/* Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Label
                      htmlFor="login-password"
                      style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}
                    >
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs transition-colors hover:text-amber-400"
                      style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div style={{ position: "relative" }}>
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="jl-input h-12 pl-4 pr-10 text-[15px] w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.35)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* CTA button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="jl-btn w-full h-12 rounded-xl font-semibold text-[15px] border-0
                             flex items-center justify-center gap-2 mt-1
                             transition-transform duration-100 active:scale-[0.97]"
                  style={{
                    background: loading
                      ? "rgba(245,158,11,0.5)"
                      : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    color: loading ? "rgba(255,255,255,0.6)" : "#1c0e00",
                    boxShadow: loading ? "none" : "0 4px 22px rgba(245,158,11,0.38)",
                    fontWeight: 700,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "24px 0" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontWeight: 600, letterSpacing: "0.1em" }}>
                  NEW TO JLINDO?
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              </div>

              {/* Sign-up link */}
              <Link
                to="/signup"
                className="flex items-center justify-center w-full h-11 rounded-xl text-sm font-semibold
                           transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
                style={{
                  color: "rgba(255,255,255,0.60)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  textDecoration: "none",
                }}
              >
                Create a free account
              </Link>
            </div>

            {/* Trust line */}
            <p style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)" }}>
              By signing in you agree to our Terms &amp; Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
