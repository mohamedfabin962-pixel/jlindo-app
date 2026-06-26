
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Ban, Users, Briefcase, FileCheck, MessageSquare, ShieldCheck, Check } from "lucide-react";
import { Navigate } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";

export default function AdminDashboard() {
  const { profile, loading } = useAuth();
  const isAdmin = profile?.role === "admin";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: jobs } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: applications } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*, jobs(title)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: feedbacks } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const updateJobStatus = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      const { error } = await supabase.from("jobs").update({ status }).eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({ title: "Job status updated" });
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({ title: "Job deleted" });
    },
  });

  const toggleBlockUser = useMutation({
    mutationFn: async ({ userId, blocked }: { userId: string; blocked: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_blocked: blocked }).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User updated" });
    },
  });

  const updateFeedbackStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("feedback")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast({ title: "Feedback status updated" });
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-pulse text-muted-foreground font-semibold">Loading system records…</div>
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  const totalUsers = users?.length || 0;
  const totalJobs = jobs?.length || 0;
  const totalApplications = applications?.length || 0;
  const openFeedback = feedbacks?.filter((f) => f.status !== "resolved").length || 0;

  return (
    <>
      <style>{`
        .jl-admin-card:hover {
          box-shadow: 0 6px 20px rgba(15,10,30,0.06) !important;
        }
        .jl-tabs-list {
          background: rgba(15,10,30,0.04) !important;
          border-radius: 14px !important;
          padding: 4px !important;
        }
        .jl-tab-trigger {
          border-radius: 10px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }
        .jl-tab-trigger[data-state="active"] {
          background: #fff !important;
          color: #EA580C !important;
          box-shadow: 0 2px 8px rgba(15,10,30,0.06) !important;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #F8FAFC 0%, #FFF7ED 55%, #F8FAFC 100%)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ maxWidth: 740, margin: "0 auto", padding: "32px 16px 60px" }}>
          
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <ShieldCheck className="text-amber-500" size={18} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(245,158,11,0.85)" }}>
                System administration
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0d0a1e", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              Admin Dashboard
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "rgba(15,10,30,0.45)" }}>
              Overview and moderation of platform resources
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div style={{ background: "#fff", border: "1px solid rgba(15,10,30,0.06)", borderRadius: 18, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(15,10,30,0.4)", marginBottom: 8 }}>
                <Users size={16} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>Users</span>
              </div>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0d0a1e" }}>{totalUsers}</p>
            </div>

            <div style={{ background: "#fff", border: "1px solid rgba(15,10,30,0.06)", borderRadius: 18, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(15,10,30,0.4)", marginBottom: 8 }}>
                <Briefcase size={16} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>Jobs</span>
              </div>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0d0a1e" }}>{totalJobs}</p>
            </div>

            <div style={{ background: "#fff", border: "1px solid rgba(15,10,30,0.06)", borderRadius: 18, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(15,10,30,0.4)", marginBottom: 8 }}>
                <FileCheck size={16} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>Applications</span>
              </div>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0d0a1e" }}>{totalApplications}</p>
            </div>

            <div style={{ background: "#fff", border: "1px solid rgba(15,10,30,0.06)", borderRadius: 18, padding: 16, borderLeft: openFeedback > 0 ? "3px solid #EF4444" : "1px solid rgba(15,10,30,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(15,10,30,0.4)", marginBottom: 8 }}>
                <MessageSquare size={16} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>Feedback</span>
              </div>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: openFeedback > 0 ? "#EF4444" : "#0d0a1e" }}>{openFeedback}</p>
            </div>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="jl-tabs-list w-full flex mb-6 h-12">
              <TabsTrigger value="users" className="jl-tab-trigger flex-1 h-9">Users ({users?.length || 0})</TabsTrigger>
              <TabsTrigger value="jobs" className="jl-tab-trigger flex-1 h-9">Jobs ({jobs?.length || 0})</TabsTrigger>
              <TabsTrigger value="applications" className="jl-tab-trigger flex-1 h-9">Applications ({applications?.length || 0})</TabsTrigger>
              <TabsTrigger value="feedback" className="jl-tab-trigger flex-1 h-9 flex items-center justify-center gap-1.5">
                Feedback
                {openFeedback > 0 && (
                  <span style={{ background: "#EF4444", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
                    {openFeedback}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* USERS TAB */}
            <TabsContent value="users" className="space-y-3">
              {!users || users.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No users registered"
                  description="Registered worker or employer accounts will appear here."
                />
              ) : (
                users.map((u) => (
                  <div
                    key={u.id}
                    className="jl-admin-card"
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      border: "1px solid rgba(15,10,30,0.06)",
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "box-shadow 0.2s",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0d0a1e" }}>
                        {u.full_name || "No name"}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(15,10,30,0.4)" }}>
                        Role: <strong style={{ textTransform: "capitalize" }}>{u.role}</strong> {u.phone && `• ${u.phone}`}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {u.is_blocked && <StatusBadge status="blocked" />}
                      <Button
                        size="sm"
                        variant={u.is_blocked ? "default" : "outline"}
                        style={{
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 600,
                          height: 32,
                          borderColor: u.is_blocked ? undefined : "rgba(15,10,30,0.08)",
                          color: u.is_blocked ? undefined : "rgba(15,10,30,0.6)"
                        }}
                        onClick={() => toggleBlockUser.mutate({ userId: u.user_id, blocked: !u.is_blocked })}
                      >
                        <Ban size={13} className="mr-1" /> {u.is_blocked ? "Unblock" : "Block"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* JOBS TAB */}
            <TabsContent value="jobs" className="space-y-3">
              {!jobs || jobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No jobs posted yet"
                  description="Active and closed job opportunities will be listed here."
                />
              ) : (
                jobs.map((j) => (
                  <div
                    key={j.id}
                    className="jl-admin-card"
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      border: "1px solid rgba(15,10,30,0.06)",
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "box-shadow 0.2s",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0d0a1e" }}>{j.title}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(15,10,30,0.4)" }}>
                        {j.location} • <span style={{ color: "#EA580C", fontWeight: 600 }}>{j.salary}</span>
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Select value={j.status} onValueChange={(s) => updateJobStatus.mutate({ jobId: j.id, status: s })}>
                        <SelectTrigger className="w-28 h-8.5 text-xs rounded-lg border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="filled">Filled</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive h-8.5 w-8.5 p-0 rounded-lg"
                        style={{ borderColor: "rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.02)" }}
                        onClick={() => deleteJob.mutate(j.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* APPLICATIONS TAB */}
            <TabsContent value="applications" className="space-y-3">
              {!applications || applications.length === 0 ? (
                <EmptyState
                  icon={FileCheck}
                  title="No applications submitted"
                  description="Job applications submitted by workers will appear here."
                />
              ) : (
                applications.map((a: any) => (
                  <div
                    key={a.id}
                    className="jl-admin-card"
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      border: "1px solid rgba(15,10,30,0.06)",
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "box-shadow 0.2s",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0d0a1e" }}>
                        {a.jobs?.title || "Unknown Job"}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(15,10,30,0.4)" }}>
                        Worker ID: {a.worker_id.slice(0, 8)}…
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))
              )}
            </TabsContent>

            {/* FEEDBACK TAB */}
            <TabsContent value="feedback" className="space-y-3">
              {!feedbacks || feedbacks.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No feedback yet"
                  description="User suggestions or issue reports will show up here."
                />
              ) : (
                feedbacks.map((f) => (
                  <div
                    key={f.id}
                    className="jl-admin-card"
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      border: "1px solid rgba(15,10,30,0.06)",
                      padding: "16px 20px",
                      transition: "box-shadow 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <StatusBadge status={f.status === "resolved" ? "success" : "pending"} />
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "rgba(15,10,30,0.4)" }}>
                        {f.type}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(15,10,30,0.35)", marginLeft: "auto" }}>
                        {new Date(f.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p style={{ margin: "8px 0 14px", fontSize: 13.5, color: "rgba(15,10,30,0.8)" }}>{f.message}</p>

                    {f.status !== "resolved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-semibold rounded-lg"
                        style={{
                          borderColor: "rgba(16,185,129,0.2)",
                          color: "#059669",
                          background: "rgba(16,185,129,0.03)"
                        }}
                        onClick={() =>
                          updateFeedbackStatus.mutate({
                            id: f.id,
                            status: "resolved",
                          })
                        }
                      >
                        <Check size={12} className="mr-1" /> Mark Resolved
                      </Button>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

