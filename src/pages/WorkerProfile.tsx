import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { User, Award, ListChecks } from "lucide-react";

export default function WorkerProfile() {
  const { user, profile } = useAuth();

  const { data: applications } = useQuery({
    queryKey: ["worker-profile-apps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("status")
        .eq("worker_id", user!.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const total = applications?.length || 0;
  const accepted = applications?.filter((a) => a.status === "accepted").length || 0;
  const rejected = applications?.filter((a) => a.status === "rejected").length || 0;
  const pending = applications?.filter((a) => a.status === "pending").length || 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #F8FAFC 0%, #FFF7ED 55%, #F8FAFC 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px 60px" }}>
        
        {/* Profile Details Card */}
        <Card
          style={{
            background: "#fff",
            borderRadius: 24,
            border: "1px solid rgba(15,10,30,0.07)",
            boxShadow: "0 4px 20px rgba(15,10,30,0.04)",
            overflow: "hidden",
            marginBottom: 20
          }}
        >
          <CardHeader style={{ borderBottom: "1px solid rgba(15,10,30,0.06)", padding: "20px 24px" }}>
            <CardTitle style={{ fontSize: 18, fontWeight: 800, color: "#0d0a1e", display: "flex", alignItems: "center", gap: 8 }}>
              <User size={18} className="text-amber-500" />
              Worker Profile Info
            </CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 24 }} className="space-y-3">
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.02)", paddingBottom: 10 }}>
              <span style={{ fontSize: 13, color: "rgba(15,10,30,0.4)" }}>Full Name</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0d0a1e" }}>{profile?.full_name || "No Name"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.02)", paddingBottom: 10 }}>
              <span style={{ fontSize: 13, color: "rgba(15,10,30,0.4)" }}>Phone Number</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0d0a1e" }}>{profile?.phone || "No Phone"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "rgba(15,10,30,0.4)" }}>Account Role</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#EA580C", textTransform: "capitalize" }}>{profile?.role}</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card
          style={{
            background: "#fff",
            borderRadius: 24,
            border: "1px solid rgba(15,10,30,0.07)",
            boxShadow: "0 4px 20px rgba(15,10,30,0.04)",
            overflow: "hidden",
          }}
        >
          <CardHeader style={{ borderBottom: "1px solid rgba(15,10,30,0.06)", padding: "20px 24px" }}>
            <CardTitle style={{ fontSize: 18, fontWeight: 800, color: "#0d0a1e", display: "flex", alignItems: "center", gap: 8 }}>
              <Award size={18} className="text-amber-500" />
              Application Statistics
            </CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 24 }} className="space-y-4">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.02)", paddingBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(15,10,30,0.6)" }}>Total Applications Submitted</span>
              <strong style={{ fontSize: 18, color: "#0d0a1e" }}>{total}</strong>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(15,10,30,0.6)" }}>
                  <span style={{ height: 6, width: 6, borderRadius: "50%", background: "#10B981" }} />
                  Accepted Applications
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#10B981" }}>{accepted}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(15,10,30,0.6)" }}>
                  <span style={{ height: 6, width: 6, borderRadius: "50%", background: "#EF4444" }} />
                  Rejected Applications
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#EF4444" }}>{rejected}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(15,10,30,0.6)" }}>
                  <span style={{ height: 6, width: 6, borderRadius: "50%", background: "#F59E0B" }} />
                  Pending Applications
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#F59E0B" }}>{pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}