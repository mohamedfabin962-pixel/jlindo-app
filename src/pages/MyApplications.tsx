import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/StatusBadge";
import { Phone, Briefcase, MapPin, Clock, CalendarDays, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JobCardSkeleton } from "@/components/BrandedLoading";
import { EmptyState } from "@/components/EmptyState";
import { BrandedConfirmDialog } from "@/components/BrandedConfirmDialog";

export default function MyApplications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);

  const withdrawMutation = useMutation({
    mutationFn: async (appId: string) => {
      const { error } = await supabase.from("applications").delete().eq("id", appId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications-detail"] });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      toast({
        title: "Application withdrawn",
        description: "Your application was successfully withdrawn.",
      });
      setWithdrawTargetId(null);
    },
    onError: (err: any) => {
      toast({
        title: "Error withdrawing",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications-detail"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, jobs(*)")
        .eq("worker_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [employers, setEmployers] = useState<Record<string, any>>({});
  
  useEffect(() => {
    const fetchEmployers = async () => {
      if (!applications) return;
      const ids = applications.map((a: any) => a.jobs?.employer_id).filter(Boolean);
      if (ids.length === 0) return;

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", ids);

      const map: any = {};
      data?.forEach((e) => {
        map[e.id] = e;
      });
      setEmployers(map);
    };

    fetchEmployers();
  }, [applications]);

  return (
    <>
      <style>{`
        .jl-app-card:hover { box-shadow: 0 8px 32px rgba(15,10,30,0.10) !important; }
      `}</style>
      
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #F8FAFC 0%, #FFF7ED 55%, #F8FAFC 100%)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px 60px" }}>

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
                Applications
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0d0a1e", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              Track Your Progress
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "rgba(15,10,30,0.45)" }}>
              Keep tabs on the jobs you've applied for
            </p>
          </div>

          {/* ── LOADING STATE ───────────────────────────── */}
          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1, 2, 3].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* ── EMPTY STATE ─────────────────────────────── */}
          {applications?.length === 0 && !isLoading && (
             <EmptyState
               icon={Briefcase}
               title="No applications yet"
               description="Start exploring opportunities and apply to your first job."
               actionText="Browse Open Jobs"
               actionLink="/jobs"
             />
          )}

          {/* ── LIST ────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <AnimatePresence>
              {applications?.map((app, idx) => {
                const job = app.jobs as any;
                const employer = employers[job?.employer_id];

                return (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.04 } }}
                    className="jl-app-card"
                    style={{
                      background: "#fff",
                      borderRadius: 20,
                      border: "1px solid rgba(15,10,30,0.07)",
                      boxShadow: "0 2px 12px rgba(15,10,30,0.05)",
                      overflow: "hidden",
                      transition: "box-shadow .2s",
                      position: "relative",
                    }}
                  >
                    {/* Left status accent line */}
                    <div
                      style={{
                        position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
                        background: app.status === "accepted" ? "#10B981" : 
                                    app.status === "rejected" ? "#EF4444" : 
                                    "#F59E0B",
                      }}
                    />

                    <div style={{ padding: "20px 20px 20px 24px" }}>
                      {/* Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0d0a1e", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {job?.title ?? "Unknown Job"}
                          </h3>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          <StatusBadge status={app.status} />
                        </div>
                      </div>

                      {/* Job details */}
                      {job && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 16px", marginTop: 12 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "rgba(15,10,30,0.50)" }}>
                            <MapPin style={{ height: 13, width: 13, color: "rgba(15,10,30,0.30)" }} />
                            {job.location}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "rgba(15,10,30,0.50)" }}>
                            <Clock style={{ height: 13, width: 13, color: "rgba(15,10,30,0.30)" }} />
                            {job.working_hours}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#0d0a1e", fontWeight: 700 }}>
                            <span style={{ color: "#F59E0B", fontWeight: 800 }}>{job.salary}</span> <span style={{ fontSize: 10, color: "rgba(15,10,30,0.3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>/ day</span>
                          </span>
                        </div>
                      )}

                      {/* Accepted State */}
                      {app.status === "accepted" && (
                        <div
                          style={{
                            marginTop: 16, padding: "14px 16px",
                            background: "#F0FDF4", border: "1px solid #BBF7D0",
                            borderRadius: 14,
                          }}
                        >
                          <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#16A34A" }}>
                            <CheckCircle2 style={{ height: 15, width: 15 }} />
                            You are selected for this job
                          </p>
                          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                            <p style={{ margin: 0, fontSize: 13, color: "#0d0a1e" }}>
                              <span style={{ color: "rgba(15,10,30,0.4)" }}>Employer:</span>{" "}
                              <span style={{ fontWeight: 600 }}>{employer?.full_name || "Employer"}</span>
                            </p>
                            <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#0d0a1e", fontWeight: 600 }}>
                              <Phone style={{ height: 13, width: 13, color: "rgba(15,10,30,0.4)" }} />
                              {employer?.phone || "Phone not available"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "rgba(15,10,30,0.35)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          <CalendarDays style={{ height: 12, width: 12 }} />
                          Applied {new Date(app.created_at).toLocaleDateString()}
                        </div>
                        {app.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => setWithdrawTargetId(app.id)}
                            style={{
                              background: "none",
                              border: "none",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#EF4444",
                              cursor: "pointer",
                              padding: "4px 8px",
                              borderRadius: 6,
                              transition: "background .15s",
                            }}
                            className="hover:bg-red-50"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <BrandedConfirmDialog
        isOpen={!!withdrawTargetId}
        onClose={() => setWithdrawTargetId(null)}
        onConfirm={() => { if (withdrawTargetId) withdrawMutation.mutate(withdrawTargetId); }}
        title="Withdraw Application"
        description="Are you sure you want to withdraw this application? This action cannot be undone."
        confirmText="Withdraw"
        isDestructive
        isLoading={withdrawMutation.isPending}
      />
    </>
  );
}
