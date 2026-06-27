import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { JlindoLogo } from "@/components/JlindoLogo";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // 2. Validate admin role
      if (data?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileError) {
          await supabase.auth.signOut();
          toast({
            title: "Verification error",
            description: "Failed to verify user profile credentials.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!profileData || profileData.role !== "admin") {
          // If logged in user is NOT an admin, sign out immediately
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "This portal is strictly reserved for administrators.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Redirect to admin dashboard
        toast({
          title: "Welcome Administrator",
          description: "Login successful. Redirecting to admin panel...",
        });
        
        // Wait a brief moment to show success redirecting
        setTimeout(() => {
          window.location.href = "/admin";
        }, 800);
      }
    } catch (err: any) {
      toast({
        title: "Unexpected Error",
        description: err.message || "An unexpected login error occurred.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <>
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

        .jl-1 { animation: jl-fade-up .5s ease-out 0s forwards; }
        .jl-2 { animation: jl-fade-up .5s ease-out .06s forwards; }
        .jl-card { animation: jl-fade-up .55s ease-out .08s forwards; }
        .jl-btn { position: relative; overflow: hidden; }
        
        .jl-btn:not(:disabled):hover::after {
          content: '';
          position: absolute; inset: 0; border-radius: inherit;
          background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%);
          background-size: 300px 100%;
          animation: jl-shimmer .65s ease forwards;
        }

        .jl-input-admin {
          background: rgba(255, 255, 255, 0.07) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          color: #ffffff !important;
          border-radius: 12px !important;
        }
        .jl-input-admin::placeholder {
          color: rgba(255, 255, 255, 0.28) !important;
        }
        .jl-input-admin:focus-visible {
          outline: none !important;
          border-color: #F59E0B !important;
          background: rgba(255, 255, 255, 0.10) !important;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.16) !important;
        }
      `}</style>

      <div
        className="relative min-h-screen w-full flex flex-col items-center justify-center p-5 overflow-hidden"
        style={{ background: "#0d0a1e", fontFamily: "'Inter', sans-serif" }}
      >
        {/* Blob background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 65%)",
              animation: "jl-blob 15s ease-in-out infinite"
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)",
              animation: "jl-blob 19s ease-in-out 5s infinite reverse",
              transform: "translateX(20%)"
            }}
          />
        </div>

        <div className="relative w-full max-w-[400px] z-10 flex flex-col items-center">
          {/* Logo */}
          <div className="jl-1 mb-8 flex items-center justify-center">
            <JlindoLogo size="md" variant="white" showTagline={false} />
          </div>

          {/* Admin Glass Card */}
          <div
            className="jl-card w-full rounded-3xl p-7 sm:p-9"
            style={{
              background: "rgba(255, 255, 255, 0.055)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(255, 255, 255, 0.09)",
              boxShadow: "0 20px 70px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255, 255, 255, 0.07)",
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: 28 }} className="text-center">
              <div className="inline-flex p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-3.5">
                <ShieldCheck size={24} />
              </div>
              <h2
                style={{
                  margin: 0,
                  color: "#ffffff",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                }}
              >
                Administrator Portal
              </h2>
              <p style={{ marginTop: 6, fontSize: 13.5, color: "rgba(255,255,255,0.38)" }}>
                Authenticate with administrator credentials
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="admin-email"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  Admin Email
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@jlindo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="jl-input-admin h-12 px-4 text-[15px]"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="admin-password"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="jl-input-admin h-12 pl-4 pr-10 text-[15px] w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors z-10 flex items-center justify-center p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={loading}
                className="jl-btn w-full h-12 rounded-xl font-semibold text-[15px] border-0
                           flex items-center justify-center gap-2 mt-2
                           transition-transform duration-100 active:scale-[0.97]"
                style={{
                  background: loading
                    ? "rgba(245,158,11,0.5)"
                    : "linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)",
                  color: loading ? "rgba(255,255,255,0.6)" : "#ffffff",
                  boxShadow: loading ? "none" : "0 4px 22px rgba(245,158,11,0.3)",
                  fontWeight: 800,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Access Admin Panel
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Footer Back Link */}
          <button
            onClick={() => navigate("/login")}
            className="mt-6 text-xs font-semibold text-slate-400 hover:text-amber-500 transition-colors bg-transparent border-0 cursor-pointer"
          >
            ← Back to Employee / Jobseeker Sign In
          </button>
        </div>
      </div>
    </>
  );
}
