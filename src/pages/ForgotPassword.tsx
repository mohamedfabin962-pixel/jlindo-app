import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Loader2, Zap, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "Please check your inbox for instructions.",
      });
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
        @keyframes jl-shimmer {
          0%   { background-position: -300px 0; }
          100% { background-position: 300px 0; }
        }

        .jl-1 { animation: jl-fade-up .5s ease-out 0s forwards; }
        .jl-2 { animation: jl-fade-up .5s ease-out .06s forwards; }
        .jl-card { animation: jl-fade-up .55s ease-out .08s forwards; }

        .jl-b1 { animation: jl-blob 15s ease-in-out infinite; }
        .jl-b2 { animation: jl-blob 19s ease-in-out 5s infinite reverse; }

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

        .jl-btn { position: relative; overflow: hidden; }
        .jl-btn:not(:disabled):hover::after {
          content: '';
          position: absolute; inset: 0; border-radius: inherit;
          background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%);
          background-size: 300px 100%;
          animation: jl-shimmer .65s ease forwards;
        }
      `}</style>

      <div
        className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#0d0a1e", fontFamily: "'Inter', sans-serif" }}
      >
        {/* AMBIENT GLOWS */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="jl-b1 absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 65%)" }}
          />
          <div
            className="jl-b2 absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 60%)", transform: "translate(20%, 20%)" }}
          />
          
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
            <rect width="100%" height="100%" fill="url(#jl-g)" />
          </svg>
        </div>

        {/* LOGO */}
        <div className="jl-1 flex items-center gap-2.5 mb-8">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              boxShadow: "0 4px 12px rgba(245,158,11,0.35)",
            }}
          >
            <Zap style={{ height: 16, width: 16, color: "#fff" }} strokeWidth={2.5} />
          </div>
          <span style={{ color: "rgba(255,255,255,0.88)", fontWeight: 700, letterSpacing: "-0.01em" }}>
            Jlindo
          </span>
        </div>

        {/* GLASS CARD */}
        <div className="relative w-full max-w-[420px] px-4">
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
            {!submitted ? (
              <>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{
                    margin: 0, color: "#ffffff", fontSize: 22,
                    fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2,
                  }}>
                    Reset password
                  </h2>
                  <p style={{ marginTop: 6, fontSize: 13.5, color: "rgba(255,255,255,0.38)", lineHeight: 1.5 }}>
                    Enter the email associated with your account and we will send you a secure recovery link.
                  </p>
                </div>

                <form onSubmit={handleResetRequest} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <Label
                      htmlFor="forgot-email"
                      style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}
                    >
                      Email Address
                    </Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="jl-input h-12 px-4 text-[15px]"
                    />
                  </div>

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
                        Sending link…
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", py: 8 }}>
                <div
                  style={{
                    height: 56, width: 56, borderRadius: "50%",
                    background: "rgba(16,185,129,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 20
                  }}
                >
                  <CheckCircle2 style={{ height: 28, width: 28, color: "#10B981" }} />
                </div>
                <h2 style={{
                  margin: 0, color: "#ffffff", fontSize: 20,
                  fontWeight: 700, letterSpacing: "-0.02em",
                }}>
                  Check your email
                </h2>
                <p style={{ marginTop: 8, fontSize: 14, color: "rgba(255,255,255,0.42)", lineHeight: 1.6 }}>
                  We sent a recovery link to <strong style={{ color: "#ffffff" }}>{email}</strong>.<br />
                  Please follow the instructions in the email to set a new password.
                </p>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "24px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Back to Login link */}
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl text-sm font-semibold
                         transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
              style={{
                color: "rgba(255,255,255,0.60)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                textDecoration: "none",
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>

          <p style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)" }}>
            © 2025 Jlindo · Secure Auth Portal
          </p>
        </div>
      </div>
    </>
  );
}
