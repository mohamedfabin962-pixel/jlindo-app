import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, ShieldCheck, Loader2 } from "lucide-react";

export default function Profile() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone,
      })
      .eq("id", user?.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your details saved successfully",
      });
    }
  };

  return (
    <>
      <style>{`
        .jl-profile-input:focus-visible {
          outline: none !important;
          border-color: #F59E0B !important;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.14) !important;
        }
        .jl-save-btn:not(:disabled):hover {
          background: linear-gradient(135deg, #FBBF24, #F59E0B) !important;
          box-shadow: 0 6px 24px rgba(245,158,11,0.42) !important;
        }
        .jl-save-btn:not(:disabled):active { transform: scale(0.97); }
      `}</style>
      
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #F8FAFC 0%, #FFF7ED 55%, #F8FAFC 100%)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ maxWidth: 540, margin: "0 auto", padding: "32px 16px 60px" }}>

          {/* ── PAGE HEADER ─────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  height: 7, width: 7, borderRadius: "50%",
                  background: "linear-gradient(135deg, #F59E0B, #D97706)",
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(245,158,11,0.85)" }}>
                Settings
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0d0a1e", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              My Profile
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "rgba(15,10,30,0.45)" }}>
              Manage your personal information and preferences
            </p>
          </div>

          {/* ── PROFILE CARD ────────────────────────────── */}
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              border: "1px solid rgba(15,10,30,0.07)",
              boxShadow: "0 4px 24px rgba(15,10,30,0.04)",
              overflow: "hidden",
            }}
          >
            {/* Top accent */}
            <div style={{ height: 6, background: "linear-gradient(90deg, #F59E0B, #D97706)" }} />
            
            <div style={{ padding: "28px 24px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                
                {/* Email (Readonly) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.5)" }}>
                    Email Address
                  </Label>
                  <div style={{ position: "relative" }}>
                    <Mail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                    <Input
                      value={user?.email || ""}
                      disabled
                      style={{
                        height: 48, paddingLeft: 42, fontSize: 14,
                        borderRadius: 12, border: "1px solid rgba(15,10,30,0.1)",
                        background: "#F8FAFC", color: "rgba(15,10,30,0.5)",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.7)" }}>
                    Full Name
                  </Label>
                  <div style={{ position: "relative" }}>
                    <User style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="jl-profile-input"
                      style={{
                        height: 48, paddingLeft: 42, fontSize: 14,
                        borderRadius: 12, border: "1px solid rgba(15,10,30,0.1)",
                        background: "#fff", color: "#0d0a1e", fontWeight: 500,
                        transition: "all .2s",
                      }}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.7)" }}>
                    Phone Number
                  </Label>
                  <div style={{ position: "relative" }}>
                    <Phone style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="jl-profile-input"
                      style={{
                        height: 48, paddingLeft: 42, fontSize: 14,
                        borderRadius: 12, border: "1px solid rgba(15,10,30,0.1)",
                        background: "#fff", color: "#0d0a1e", fontWeight: 500,
                        transition: "all .2s",
                      }}
                    />
                  </div>
                </div>

                {/* Role (Readonly) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.5)" }}>
                    Account Type
                  </Label>
                  <div style={{ position: "relative" }}>
                    <ShieldCheck style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", height: 16, width: 16, color: "rgba(15,10,30,0.3)" }} />
                    <Input
                      value={(profile?.role || "").toUpperCase()}
                      disabled
                      style={{
                        height: 48, paddingLeft: 42, fontSize: 14, fontWeight: 600, letterSpacing: "0.05em",
                        borderRadius: 12, border: "1px solid rgba(15,10,30,0.1)",
                        background: "#F8FAFC", color: "rgba(15,10,30,0.5)",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Actions footer */}
            <div style={{ padding: "16px 24px 24px" }}>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="jl-save-btn"
                style={{
                  width: "100%", height: 50, borderRadius: 14,
                  fontSize: 15, fontWeight: 700, border: "none",
                  background: loading ? "rgba(245,158,11,0.5)" : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  color: loading ? "rgba(255,255,255,0.8)" : "#1c0e00",
                  boxShadow: loading ? "none" : "0 4px 18px rgba(245,158,11,0.32)",
                  transition: "all .18s",
                }}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...</>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}