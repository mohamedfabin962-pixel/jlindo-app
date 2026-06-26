import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Loader2,
  HardHat,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { JlindoLogo } from "@/components/JlindoLogo";

/* ─────────────────────────────────────────────────────────────
   Role card — premium selectable tile
───────────────────────────────────────────────────────────── */
function RoleCard({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "relative",
        flex: 1,
        padding: "14px 12px",
        borderRadius: 14,
        border: active
          ? "1.5px solid rgba(245,158,11,0.6)"
          : "1.5px solid rgba(255,255,255,0.09)",
        background: active
          ? "rgba(245,158,11,0.10)"
          : "rgba(255,255,255,0.04)",
        cursor: "pointer",
        textAlign: "left",
        transition: "border-color .18s, background .18s",
        outline: "none",
      }}
    >
      <div
        style={{
          height: 32,
          width: 32,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
          background: active
            ? "rgba(245,158,11,0.22)"
            : "rgba(255,255,255,0.07)",
          transition: "background .18s",
        }}
      >
        <Icon
          style={{
            height: 16,
            width: 16,
            color: active ? "#F59E0B" : "rgba(255,255,255,0.4)",
            transition: "color .18s",
          }}
          strokeWidth={2}
        />
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          color: active ? "#F59E0B" : "rgba(255,255,255,0.65)",
          transition: "color .18s",
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: "3px 0 0",
          fontSize: 11,
          color: "rgba(255,255,255,0.30)",
          lineHeight: 1.4,
        }}
      >
        {description}
      </p>
      {active && (
        <CheckCircle2
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            height: 14,
            width: 14,
            color: "#F59E0B",
          }}
        />
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main signup page
───────────────────────────────────────────────────────────── */
export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"worker" | "employer">("worker");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1️⃣ Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: fullName,
          phone: phone,
        },
      },
    });

    if (error) {
      setLoading(false);
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const userId = data.user?.id;

    // 2️⃣ Insert profile data (VERY IMPORTANT)
    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        email,
        full_name: fullName,
        phone,
        role,
      } as any);

      if (profileError) {
        console.log("PROFILE INSERT ERROR:", profileError);
      }
    }

    setLoading(false);

    toast({
      title: "Account created",
      description: "You can login now",
    });

    navigate("/login");
  };

  return (
    <>
      {/* ══ KEYFRAMES (identical token to Login) ══════════════ */}
      <style>{`
        @keyframes jl-fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes jl-blob {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(20px,-14px) scale(1.04); }
          66%       { transform: translate(-14px,10px) scale(0.97); }
        }
        @keyframes jl-shimmer {
          0%   { background-position: -300px 0; }
          100% { background-position: 300px 0; }
        }

        .su-1 { animation: jl-fade-up .5s ease-out 0s forwards; }
        .su-2 { animation: jl-fade-up .5s ease-out .06s forwards; }
        .su-3 { animation: jl-fade-up .5s ease-out .12s forwards; }
        .su-4 { animation: jl-fade-up .5s ease-out .18s forwards; }
        .su-5 { animation: jl-fade-up .5s ease-out .24s forwards; }
        .su-card { animation: jl-fade-up .55s ease-out .08s forwards; }

        .su-b1 { animation: jl-blob 16s ease-in-out infinite; }
        .su-b2 { animation: jl-blob 20s ease-in-out 6s infinite reverse; }
        .su-b3 { animation: jl-blob 24s ease-in-out 11s infinite; }

        /* dark glass input — same as login */
        .su-input {
          background: rgba(255,255,255,0.07) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          color: #ffffff !important;
          border-radius: 12px !important;
        }
        .su-input::placeholder { color: rgba(255,255,255,0.28) !important; }
        .su-input:focus-visible {
          outline: none !important;
          border-color: #F59E0B !important;
          background: rgba(255,255,255,0.10) !important;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.16) !important;
        }

        /* CTA shimmer */
        .su-btn { position: relative; overflow: hidden; }
        .su-btn:not(:disabled):hover::after {
          content:'';
          position:absolute; inset:0; border-radius:inherit;
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
        {/* ── AMBIENT GLOWS ──────────────────────────────────── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* violet — top-left (different from login's amber-top) */}
          <div
            className="su-b1 absolute -top-40 -left-32 w-[580px] h-[580px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)" }}
          />
          {/* amber — right-center */}
          <div
            className="su-b2 absolute top-1/4 right-0 w-[560px] h-[560px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.17) 0%, transparent 60%)", transform: "translateX(35%)" }}
          />
          {/* blue depth — bottom-left */}
          <div
            className="su-b3 absolute -bottom-32 left-0 w-[600px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(37,99,235,0.13) 0%, transparent 65%)", transform: "translateX(-20%)" }}
          />

          {/* dot grid */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.035 }}>
            <defs>
              <pattern id="su-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#su-dots)" />
          </svg>
        </div>

        {/* ══════════════════════════════════════════════════════
            LEFT PANEL — brand canvas (desktop)
        ══════════════════════════════════════════════════════ */}
        <div className="relative z-10 hidden lg:flex lg:w-[48%] flex-col px-14 xl:px-20 py-12">

          {/* Brand */}
          <div className="su-1 flex items-center gap-3">
            <JlindoLogo size="sm" variant="white" showTagline={false} />
          </div>

          {/* Hero copy */}
          <div className="flex-1 flex flex-col justify-center mt-12 mb-12">

            <p className="su-2" style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "rgba(245,158,11,0.80)", marginBottom: 20,
            }}>
              Join thousands of workers
            </p>

            <h1 style={{ margin: 0, padding: 0 }}>
              <span
                className="su-3 block text-white"
                style={{ fontSize: "clamp(50px, 5.8vw, 82px)", fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.03em" }}
              >
                Your Career
              </span>
              <span
                className="su-4 block"
                style={{
                  fontSize: "clamp(50px, 5.8vw, 82px)", fontWeight: 800,
                  lineHeight: 0.95, letterSpacing: "-0.03em",
                  background: "linear-gradient(90deg, #F59E0B 0%, #FBBF24 55%, #F59E0B 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}
              >
                Starts Now.
              </span>
            </h1>

            <p
              className="su-5"
              style={{ marginTop: 28, fontSize: 15, lineHeight: 1.65, color: "rgba(255,255,255,0.40)", maxWidth: 340 }}
            >
              Create your free profile in under 2 minutes. Browse hundreds of
              verified jobs and connect directly with trusted employers.
            </p>

            {/* Benefit list */}
            <ul className="su-5" style={{ listStyle: "none", padding: 0, margin: "32px 0 0", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                "Free to join — no hidden fees, ever",
                "Verified employer listings only",
                "Apply with one tap, track in real time",
              ].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <CheckCircle2 style={{ height: 16, width: 16, color: "#F59E0B", marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>

            {/* Social proof */}
            <div className="su-5" style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 40 }}>
              <div style={{ display: "flex" }}>
                {(["#F59E0B","#8B5CF6","#3B82F6","#10B981"] as const).map((bg, i) => (
                  <div
                    key={i}
                    style={{
                      height: 32, width: 32, borderRadius: "50%",
                      backgroundColor: bg,
                      border: "2.5px solid #0d0a1e",
                      marginLeft: i === 0 ? 0 : -10,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: "#fff",
                      zIndex: 4 - i,
                      position: "relative",
                    }}
                  >
                    {["RK","MF","SA","PL"][i]}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)" }}>
                <span style={{ color: "rgba(255,255,255,0.70)", fontWeight: 600 }}>50,000+</span>
                {" "}workers already joined
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
            RIGHT PANEL — glass form (full width on mobile)
        ══════════════════════════════════════════════════════ */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-10 lg:py-6 lg:px-10 xl:px-14">

          {/* Amber spotlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />

          <div className="relative w-full max-w-[420px]">

            {/* Mobile: brand + headline */}
            <div className="lg:hidden mb-7">
              <div className="su-1 flex items-center gap-2.5 mb-7">
                <JlindoLogo size="sm" variant="white" showTagline={false} />
              </div>

              <h1 className="su-2" style={{ margin: 0 }}>
                <span className="block text-white" style={{ fontSize: "clamp(36px, 9.5vw, 50px)", fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.03em" }}>
                  Your Career
                </span>
                <span className="block" style={{
                  fontSize: "clamp(36px, 9.5vw, 50px)", fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.03em",
                  background: "linear-gradient(90deg, #F59E0B, #FBBF24)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  Starts Now.
                </span>
              </h1>
              <p className="su-3 mt-2.5" style={{ fontSize: 14, color: "rgba(255,255,255,0.38)" }}>
                Create your free account to get started.
              </p>
            </div>

            {/* ── GLASS CARD ─────────────────────────────── */}
            <div
              className="su-card rounded-3xl p-7 sm:p-8"
              style={{
                background: "rgba(255,255,255,0.055)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 20px 70px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)",
              }}
            >
              {/* Header */}
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: 0, color: "#fff", fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em" }}>
                  Create your account
                </h2>
                <p style={{ marginTop: 5, fontSize: 13.5, color: "rgba(255,255,255,0.38)" }}>
                  Free forever. No credit card needed.
                </p>
              </div>

              <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Name + Phone — 2 col */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <Label
                      htmlFor="su-fullName"
                      style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)" }}
                    >
                      Full Name
                    </Label>
                    <Input
                      id="su-fullName"
                      required
                      placeholder="Rajan Kumar"
                      value={fullName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                      className="su-input h-11 px-3.5 text-[14px]"
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <Label
                      htmlFor="su-phone"
                      style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)" }}
                    >
                      Phone
                    </Label>
                    <Input
                      id="su-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                      className="su-input h-11 px-3.5 text-[14px]"
                    />
                  </div>
                </div>

                {/* Email */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <Label
                    htmlFor="su-email"
                    style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)" }}
                  >
                    Email Address
                  </Label>
                  <Input
                    id="su-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="su-input h-11 px-3.5 text-[14px]"
                  />
                </div>

                {/* Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <Label
                    htmlFor="su-password"
                    style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)" }}
                  >
                    Password
                  </Label>
                  <div style={{ position: "relative" }}>
                    <Input
                      id="su-password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      className="su-input h-11 pl-3.5 pr-10 text-[14px] w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10 flex items-center justify-center p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Role selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)" }}>
                    I am joining as
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <RoleCard
                      icon={HardHat}
                      title="Worker"
                      description="Find jobs & apply"
                      active={role === "worker"}
                      onClick={() => setRole("worker")}
                    />
                    <RoleCard
                      icon={Building2}
                      title="Employer"
                      description="Post jobs & hire"
                      active={role === "employer"}
                      onClick={() => setRole("employer")}
                    />
                  </div>
                </div>

                {/* CTA */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="su-btn w-full h-12 rounded-xl font-bold text-[15px] border-0 mt-1
                             flex items-center justify-center gap-2
                             transition-transform duration-100 active:scale-[0.97]"
                  style={{
                    background: loading
                      ? "rgba(245,158,11,0.5)"
                      : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    color: loading ? "rgba(255,255,255,0.6)" : "#1c0e00",
                    boxShadow: loading ? "none" : "0 4px 22px rgba(245,158,11,0.38)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create Free Account
                      <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontWeight: 600, letterSpacing: "0.1em" }}>
                  ALREADY A MEMBER?
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              </div>

              {/* Login link */}
              <Link
                to="/login"
                className="flex items-center justify-center w-full h-11 rounded-xl text-sm font-semibold
                           transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
                style={{
                  color: "rgba(255,255,255,0.60)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  textDecoration: "none",
                }}
              >
                Sign in to your account
              </Link>
            </div>

            {/* Trust note */}
            <p style={{ marginTop: 18, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)" }}>
              By creating an account you agree to our Terms &amp; Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
