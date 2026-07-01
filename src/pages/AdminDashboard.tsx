import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrandedConfirmDialog } from "@/components/BrandedConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2, Ban, Users, Briefcase, FileCheck, MessageSquare, ShieldCheck, Check,
  ChevronLeft, ChevronRight, Search, Mail, Phone, Calendar, User,
  MapPin, DollarSign, Clock, X, ExternalLink
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { decodeLocation } from "@/utils/locationUtils";

export default function AdminDashboard() {
  const { profile, loading } = useAuth();
  const isAdmin = profile?.role === "admin";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  
  // Users section states
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [confirmBlockUser, setConfirmBlockUser] = useState<{ userId: string; blocked: boolean } | null>(null);

  // Jobs section states
  const [jobSearch, setJobSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [jobPage, setJobPage] = useState(1);
  const [closeJobId, setCloseJobId] = useState<string | null>(null);
  const [viewJob, setViewJob] = useState<any | null>(null);

  // Feedback section states
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [deleteFeedbackId, setDeleteFeedbackId] = useState<string | null>(null);
  const [viewFeedback, setViewFeedback] = useState<any | null>(null);
  
  const itemsPerPage = 5;

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
      const { error } = await supabase.from("profiles").update({ is_blocked: blocked }).eq("id", userId);
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

  const deleteFeedback = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feedback").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast({ title: "Feedback deleted successfully" });
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

  const filteredUsers = (users || []).filter((u) => {
    const s = userSearch.toLowerCase().trim();
    const nameMatch = u.full_name?.toLowerCase().includes(s) ?? false;
    const emailMatch = u.email?.toLowerCase().includes(s) ?? false;
    const phoneMatch = u.phone?.toLowerCase().includes(s) ?? false;
    const matchesSearch = s === "" || nameMatch || emailMatch || phoneMatch;

    let matchesFilter = true;
    if (userFilter === "worker") {
      matchesFilter = u.role === "worker";
    } else if (userFilter === "employer") {
      matchesFilter = u.role === "employer";
    } else if (userFilter === "blocked") {
      matchesFilter = !!u.is_blocked;
    }

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (userPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getEmployerName = (employerId: string | null) => {
    if (!employerId) return "System / Unknown";
    const matchedUser = (users || []).find((u: any) => u.id === employerId);
    return matchedUser?.full_name || "Unknown Employer";
  };

  const getApplicationCount = (jobId: string) => {
    return (applications || []).filter((app: any) => app.job_id === jobId).length;
  };

  const filteredJobs = (jobs || []).filter((j) => {
    const s = jobSearch.toLowerCase().trim();
    const titleMatch = j.title?.toLowerCase().includes(s) ?? false;
    const employerName = getEmployerName(j.employer_id).toLowerCase();
    const employerMatch = employerName.includes(s);
    const decodedLoc = decodeLocation(j.location);
    const cityMatch = decodedLoc.city?.toLowerCase().includes(s) ?? false;
    
    const matchesSearch = s === "" || titleMatch || employerMatch || cityMatch;

    let matchesFilter = true;
    if (jobFilter === "open") {
      matchesFilter = j.status === "open";
    } else if (jobFilter === "filled") {
      matchesFilter = j.status === "filled";
    } else if (jobFilter === "closed") {
      matchesFilter = j.status === "closed";
    } else if (jobFilter === "blocked") {
      matchesFilter = j.status === "blocked";
    }

    return matchesSearch && matchesFilter;
  });

  const totalJobPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startJobIndex = (jobPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startJobIndex, startJobIndex + itemsPerPage);

  const filteredFeedbacks = (feedbacks || []).filter((f) => {
    const s = feedbackSearch.toLowerCase().trim();
    const messageMatch = f.message?.toLowerCase().includes(s) ?? false;
    const typeMatch = f.type?.toLowerCase().includes(s) ?? false;
    const matchesSearch = s === "" || messageMatch || typeMatch;

    let matchesFilter = true;
    if (feedbackFilter === "pending") {
      matchesFilter = f.status !== "resolved";
    } else if (feedbackFilter === "resolved") {
      matchesFilter = f.status === "resolved";
    }

    return matchesSearch && matchesFilter;
  });

  const totalFeedbackPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  const startFeedbackIndex = (feedbackPage - 1) * itemsPerPage;
  const paginatedFeedbacks = filteredFeedbacks.slice(startFeedbackIndex, startFeedbackIndex + itemsPerPage);

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
            <TabsContent value="users" className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-amber-500 bg-white"
                  />
                </div>

                <Select
                  value={userFilter}
                  onValueChange={(val) => {
                    setUserFilter(val);
                    setUserPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl border-slate-200 bg-white text-slate-700 font-medium">
                    <SelectValue placeholder="Filter users" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="worker">Workers</SelectItem>
                    <SelectItem value="employer">Employers</SelectItem>
                    <SelectItem value="blocked">Blocked Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paginatedUsers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No users found"
                  description={
                    userSearch || userFilter !== "all"
                      ? "Try adjusting your search query or filter settings."
                      : "No users have registered on the platform yet."
                  }
                />
              ) : (
                <div className="space-y-4">
                  {paginatedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="jl-admin-card"
                      style={{
                        background: "#fff",
                        borderRadius: 18,
                        border: "1px solid rgba(15,10,30,0.06)",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 8px rgba(15,10,30,0.02)",
                      }}
                    >
                      {/* Top Info Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Avatar + Basic Details */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className="shrink-0 flex items-center justify-center"
                            style={{
                              height: 44,
                              width: 44,
                              borderRadius: 14,
                              background: u.role === "employer" ? "rgba(245,158,11,0.08)" : "rgba(37,99,235,0.08)",
                              color: u.role === "employer" ? "#EA580C" : "#2563EB",
                              border: u.role === "employer" ? "1px solid rgba(245,158,11,0.15)" : "1px solid rgba(37,99,235,0.15)",
                            }}
                          >
                            <User size={20} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-slate-900 truncate m-0">
                              {u.full_name || "No name"}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                                  u.role === "employer"
                                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                                    : "bg-blue-50 text-blue-700 border border-blue-100"
                                }`}
                              >
                                {u.role === "employer" ? "Employer" : "Worker"}
                              </span>
                              {u.is_blocked && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-1">
                                  <Ban size={10} /> Blocked
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Block / Unblock Action Button */}
                        <div className="flex items-center sm:justify-end shrink-0">
                          <Button
                            size="sm"
                            variant={u.is_blocked ? "default" : "outline"}
                            style={{
                              borderRadius: 10,
                              fontSize: 12.5,
                              fontWeight: 600,
                              height: 36,
                              borderColor: u.is_blocked ? undefined : "rgba(239,68,68,0.2)",
                              color: u.is_blocked ? undefined : "#E11D48",
                              background: u.is_blocked ? undefined : "rgba(239,68,68,0.02)",
                            }}
                            className={u.is_blocked ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-0 w-full sm:w-auto" : "hover:bg-rose-50/50 w-full sm:w-auto"}
                            onClick={() => setConfirmBlockUser({ userId: u.id, blocked: !u.is_blocked })}
                          >
                            <Ban size={13} className="mr-1.5" />
                            {u.is_blocked ? "Unblock Account" : "Block User"}
                          </Button>
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ height: 1, background: "rgba(15,10,30,0.04)", width: "100%" }} />

                      {/* Bottom Metadata Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-slate-500">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail size={13.5} className="text-slate-400 shrink-0" />
                          <span className="truncate" title={u.email || "No email"}>
                            {u.email || "No email"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Phone size={13.5} className="text-slate-400 shrink-0" />
                          <span className="truncate">
                            {u.phone || "No phone number"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Calendar size={13.5} className="text-slate-400 shrink-0" />
                          <span className="truncate">
                            Joined {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination Section */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 order-2 sm:order-1 text-center sm:text-left">
                        Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                      </span>
                      
                      <div className="flex items-center gap-1.5 order-1 sm:order-2">
                        <Button
                          disabled={userPage === 1}
                          onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
                          style={{
                            background: "#ffffff",
                            border: "1px solid rgba(15,10,30,0.08)",
                            borderRadius: 10,
                            height: 36,
                            width: 36,
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#0d0a1e",
                            cursor: userPage === 1 ? "not-allowed" : "pointer",
                            opacity: userPage === 1 ? 0.4 : 1,
                            boxShadow: "0 2px 6px rgba(15,10,30,0.02)",
                          }}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            onClick={() => setUserPage(page)}
                            style={{
                              background: userPage === page ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" : "#ffffff",
                              border: userPage === page ? "none" : "1px solid rgba(15,10,30,0.08)",
                              borderRadius: 10,
                              height: 36,
                              width: 36,
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: userPage === page ? "#ffffff" : "#0d0a1e",
                              fontWeight: 600,
                              fontSize: 13,
                              cursor: "pointer",
                              boxShadow: userPage === page ? "0 2px 8px rgba(245,158,11,0.24)" : "0 2px 6px rgba(15,10,30,0.02)",
                            }}
                          >
                            {page}
                          </Button>
                        ))}

                        <Button
                          disabled={userPage === totalPages}
                          onClick={() => setUserPage((prev) => Math.min(prev + 1, totalPages))}
                          style={{
                            background: "#ffffff",
                            border: "1px solid rgba(15,10,30,0.08)",
                            borderRadius: 10,
                            height: 36,
                            width: 36,
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#0d0a1e",
                            cursor: userPage === totalPages ? "not-allowed" : "pointer",
                            opacity: userPage === totalPages ? 0.4 : 1,
                            boxShadow: "0 2px 6px rgba(15,10,30,0.02)",
                          }}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* JOBS TAB */}
            <TabsContent value="jobs" className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    placeholder="Search by job title, employer, or city..."
                    value={jobSearch}
                    onChange={(e) => {
                      setJobSearch(e.target.value);
                      setJobPage(1);
                    }}
                    className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-amber-500 bg-white"
                  />
                </div>

                <Select
                  value={jobFilter}
                  onValueChange={(val) => {
                    setJobFilter(val);
                    setJobPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl border-slate-200 bg-white text-slate-700 font-medium">
                    <SelectValue placeholder="Filter jobs" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="filled">Filled</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paginatedJobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No jobs found"
                  description={
                    jobSearch || jobFilter !== "all"
                      ? "Try adjusting your search query or filter settings."
                      : "No job listings have been posted yet."
                  }
                />
              ) : (
                <div className="space-y-4">
                  {paginatedJobs.map((j) => (
                    <div
                      key={j.id}
                      className="jl-admin-card"
                      style={{
                        background: "#fff",
                        borderRadius: 18,
                        border: "1px solid rgba(15,10,30,0.06)",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 8px rgba(15,10,30,0.02)",
                      }}
                    >
                      {/* Top Info Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Title & Employer */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className="shrink-0 flex items-center justify-center"
                            style={{
                              height: 44,
                              width: 44,
                              borderRadius: 14,
                              background: "rgba(245,158,11,0.08)",
                              color: "#EA580C",
                              border: "1px solid rgba(245,158,11,0.15)",
                            }}
                          >
                            <Briefcase size={20} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-slate-900 truncate m-0 font-sans tracking-tight">
                              {j.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs font-semibold text-slate-500">
                                by {getEmployerName(j.employer_id)}
                              </span>
                              <span className="text-slate-300 text-[10px]">•</span>
                              <span className="text-xs font-semibold text-slate-400">
                                {j.category || "General Work"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center shrink-0">
                          <StatusBadge status={j.status} />
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ height: 1, background: "rgba(15,10,30,0.04)", width: "100%" }} />

                      {/* Job Metadata Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin size={13.5} className="text-slate-400 shrink-0" />
                          <span className="truncate" title={decodeLocation(j.location).city || "Remote"}>
                            {decodeLocation(j.location).city || "Remote"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <DollarSign size={13.5} className="text-slate-400 shrink-0" />
                          <span className="truncate font-semibold text-slate-700">
                            {j.salary}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Calendar size={13.5} className="text-slate-400 shrink-0" />
                          <span className="truncate">
                            {new Date(j.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCheck size={13.5} className="text-slate-400 shrink-0" />
                          <span className="truncate font-semibold text-amber-600">
                            {getApplicationCount(j.id)} application(s)
                          </span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ height: 1, background: "rgba(15,10,30,0.04)", width: "100%" }} />

                      {/* Actions Footer */}
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewJob(j)}
                          style={{ borderRadius: 10, height: 32, fontSize: 12, fontWeight: 600 }}
                          className="border-slate-200 hover:bg-slate-50 text-slate-700"
                        >
                          View Job
                        </Button>

                        {j.status !== "closed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCloseJobId(j.id)}
                            style={{ borderRadius: 10, height: 32, fontSize: 12, fontWeight: 600 }}
                            className="border-slate-200 hover:bg-slate-50 text-slate-700"
                          >
                            Close Job
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteJobId(j.id)}
                          style={{ borderRadius: 10, height: 32, fontSize: 12, fontWeight: 600 }}
                          className="border-rose-100 hover:bg-rose-50 text-rose-600 hover:text-rose-700 bg-rose-50/20"
                        >
                          <Trash2 size={13} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Pagination Section */}
                  {totalJobPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 order-2 sm:order-1 text-center sm:text-left">
                        Showing {startJobIndex + 1}–{Math.min(startJobIndex + itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
                      </span>
                      
                      <div className="flex items-center gap-1.5 order-1 sm:order-2">
                        <Button
                          disabled={jobPage === 1}
                          onClick={() => setJobPage((prev) => Math.max(prev - 1, 1))}
                          style={{
                            background: "#ffffff",
                            border: "1px solid rgba(15,10,30,0.08)",
                            borderRadius: 10,
                            height: 36,
                            width: 36,
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#0d0a1e",
                            cursor: jobPage === 1 ? "not-allowed" : "pointer",
                            opacity: jobPage === 1 ? 0.4 : 1,
                            boxShadow: "0 2px 6px rgba(15,10,30,0.02)",
                          }}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        
                        {Array.from({ length: totalJobPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            onClick={() => setJobPage(page)}
                            style={{
                              background: jobPage === page ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" : "#ffffff",
                              border: jobPage === page ? "none" : "1px solid rgba(15,10,30,0.08)",
                              borderRadius: 10,
                              height: 36,
                              width: 36,
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: jobPage === page ? "#ffffff" : "#0d0a1e",
                              fontWeight: 600,
                              fontSize: 13,
                              cursor: "pointer",
                              boxShadow: jobPage === page ? "0 2px 8px rgba(245,158,11,0.24)" : "0 2px 6px rgba(15,10,30,0.02)",
                            }}
                          >
                            {page}
                          </Button>
                        ))}

                        <Button
                          disabled={jobPage === totalJobPages}
                          onClick={() => setJobPage((prev) => Math.min(prev + 1, totalJobPages))}
                          style={{
                            background: "#ffffff",
                            border: "1px solid rgba(15,10,30,0.08)",
                            borderRadius: 10,
                            height: 36,
                            width: 36,
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#0d0a1e",
                            cursor: jobPage === totalJobPages ? "not-allowed" : "pointer",
                            opacity: jobPage === totalJobPages ? 0.4 : 1,
                            boxShadow: "0 2px 6px rgba(15,10,30,0.02)",
                          }}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
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
            <TabsContent value="feedback" className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    placeholder="Search by feedback message or category..."
                    value={feedbackSearch}
                    onChange={(e) => {
                      setFeedbackSearch(e.target.value);
                      setFeedbackPage(1);
                    }}
                    className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-amber-500 bg-white"
                  />
                </div>

                <Select
                  value={feedbackFilter}
                  onValueChange={(val) => {
                    setFeedbackFilter(val);
                    setFeedbackPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl border-slate-200 bg-white text-slate-700 font-medium">
                    <SelectValue placeholder="Filter feedback" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Feedback</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paginatedFeedbacks.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No feedback found"
                  description={
                    feedbackSearch || feedbackFilter !== "all"
                      ? "Try adjusting your search query or filter settings."
                      : "User suggestions or issue reports will show up here."
                  }
                />
              ) : (
                <div className="space-y-4">
                  {paginatedFeedbacks.map((f) => {
                    const isLong = (f.message || "").length > 180;
                    return (
                      <div
                        key={f.id}
                        className="jl-admin-card"
                        style={{
                          background: "#fff",
                          borderRadius: 18,
                          border: "1px solid rgba(15,10,30,0.06)",
                          padding: "20px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 14,
                          transition: "all 0.2s ease",
                          boxShadow: "0 2px 8px rgba(15,10,30,0.02)",
                        }}
                      >
                        {/* Header Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={f.status === "resolved" ? "success" : "pending"} />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md font-sans">
                              {f.type || "Feedback"}
                            </span>
                          </div>
                          
                          <span className="text-xs font-semibold text-slate-400">
                            {new Date(f.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Message / Message Preview */}
                        <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100/80">
                          <p className="m-0 whitespace-pre-wrap">
                            {isLong ? (
                              <>
                                {(f.message || "").slice(0, 180)}...{" "}
                                <button
                                  onClick={() => setViewFeedback(f)}
                                  className="text-xs font-bold text-amber-600 hover:text-amber-700 underline focus:outline-none"
                                >
                                  Read Full Feedback
                                </button>
                              </>
                            ) : (
                              f.message
                            )}
                          </p>
                        </div>

                        {/* Action buttons row */}
                        <div className="flex items-center justify-between gap-3 mt-1">
                          {/* User ID reference if logged in */}
                          <div className="text-[11px] font-medium text-slate-400 truncate max-w-[150px] sm:max-w-xs">
                            {f.user_id ? `By User: ${f.user_id.slice(0, 8)}...` : "By Anonymous User"}
                          </div>

                          <div className="flex items-center gap-2">
                            {f.status !== "resolved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8.5 text-xs font-semibold rounded-xl border-emerald-100 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 bg-emerald-50/10"
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

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8.5 text-xs font-semibold rounded-xl border-rose-100 hover:bg-rose-50 text-rose-600 hover:text-rose-700 bg-rose-50/20"
                              onClick={() => setDeleteFeedbackId(f.id)}
                            >
                              <Trash2 size={13} className="mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination Section */}
                  {totalFeedbackPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 order-2 sm:order-1 text-center sm:text-left">
                        Showing {startFeedbackIndex + 1}–{Math.min(startFeedbackIndex + itemsPerPage, filteredFeedbacks.length)} of {filteredFeedbacks.length} feedbacks
                      </span>
                      
                      <div className="flex items-center gap-1.5 order-1 sm:order-2">
                        <Button
                          disabled={feedbackPage === 1}
                          onClick={() => setFeedbackPage((prev) => Math.max(prev - 1, 1))}
                          style={{
                            background: "#ffffff",
                            border: "1px solid rgba(15,10,30,0.08)",
                            borderRadius: 10,
                            height: 36,
                            width: 36,
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#0d0a1e",
                            cursor: feedbackPage === 1 ? "not-allowed" : "pointer",
                            opacity: feedbackPage === 1 ? 0.4 : 1,
                            boxShadow: "0 2px 6px rgba(15,10,30,0.02)",
                          }}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        
                        {Array.from({ length: totalFeedbackPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            onClick={() => setFeedbackPage(page)}
                            style={{
                              background: feedbackPage === page ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" : "#ffffff",
                              border: feedbackPage === page ? "none" : "1px solid rgba(15,10,30,0.08)",
                              borderRadius: 10,
                              height: 36,
                              width: 36,
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: feedbackPage === page ? "#ffffff" : "#0d0a1e",
                              fontWeight: 600,
                              fontSize: 13,
                              cursor: "pointer",
                              boxShadow: feedbackPage === page ? "0 2px 8px rgba(245,158,11,0.24)" : "0 2px 6px rgba(15,10,30,0.02)",
                            }}
                          >
                            {page}
                          </Button>
                        ))}

                        <Button
                          disabled={feedbackPage === totalFeedbackPages}
                          onClick={() => setFeedbackPage((prev) => Math.min(prev + 1, totalFeedbackPages))}
                          style={{
                            background: "#ffffff",
                            border: "1px solid rgba(15,10,30,0.08)",
                            borderRadius: 10,
                            height: 36,
                            width: 36,
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#0d0a1e",
                            cursor: feedbackPage === totalFeedbackPages ? "not-allowed" : "pointer",
                            opacity: feedbackPage === totalFeedbackPages ? 0.4 : 1,
                            boxShadow: "0 2px 6px rgba(15,10,30,0.02)",
                          }}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BrandedConfirmDialog
        isOpen={!!deleteJobId}
        onClose={() => setDeleteJobId(null)}
        onConfirm={() => {
          if (deleteJobId) {
            deleteJob.mutate(deleteJobId);
            setDeleteJobId(null);
          }
        }}
        title="Delete Job Listing"
        description="Are you sure you want to permanently delete this job listing? This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={deleteJob.isPending}
      />
      <BrandedConfirmDialog
        isOpen={!!confirmBlockUser}
        onClose={() => setConfirmBlockUser(null)}
        onConfirm={() => {
          if (confirmBlockUser) {
            toggleBlockUser.mutate({
              userId: confirmBlockUser.userId,
              blocked: confirmBlockUser.blocked
            });
            setConfirmBlockUser(null);
          }
        }}
        title={confirmBlockUser?.blocked ? "Block User Account" : "Unblock User Account"}
        description={
          confirmBlockUser?.blocked
            ? "Are you sure you want to block this user? They will not be able to log in or use platform features."
            : "Are you sure you want to unblock this user? Their account access will be fully restored."
        }
        confirmText={confirmBlockUser?.blocked ? "Block" : "Unblock"}
        isDestructive={confirmBlockUser?.blocked}
        isLoading={toggleBlockUser.isPending}
      />
      <BrandedConfirmDialog
        isOpen={!!closeJobId}
        onClose={() => setCloseJobId(null)}
        onConfirm={() => {
          if (closeJobId) {
            updateJobStatus.mutate({ jobId: closeJobId, status: "closed" });
            setCloseJobId(null);
          }
        }}
        title="Close Job Listing"
        description="Are you sure you want to close this job listing? It will no longer accept new applications."
        confirmText="Close Job"
        isDestructive
        isLoading={updateJobStatus.isPending}
      />

      <Dialog open={!!viewJob} onOpenChange={(open) => !open && setViewJob(null)}>
        <DialogContent className="max-w-md sm:max-w-lg rounded-2xl p-6 bg-white border border-slate-100 shadow-xl overflow-y-auto max-h-[90vh]">
          {viewJob && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                  <Briefcase size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-slate-900 leading-snug">{viewJob.title}</h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">{viewJob.category || "General Work"}</p>
                </div>
                <button onClick={() => setViewJob(null)} className="text-slate-400 hover:text-slate-600 shrink-0 self-start p-1 rounded-md hover:bg-slate-50 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Status & Quick Stats */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                  <div className="mt-1">
                    <StatusBadge status={viewJob.status} />
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applications</span>
                  <span className="block text-sm font-bold text-slate-800 mt-1">
                    {getApplicationCount(viewJob.id)} candidate(s)
                  </span>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <MapPin className="text-slate-400 shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">Location</span>
                    <span className="text-sm font-bold text-slate-800">
                      {decodeLocation(viewJob.location).city || "Remote"}
                    </span>
                    {decodeLocation(viewJob.location).exactLocation && (
                      <p className="text-xs text-slate-500 mt-0.5">{decodeLocation(viewJob.location).exactLocation}</p>
                    )}
                    {decodeLocation(viewJob.location).mapsUrl && (
                      <a
                        href={decodeLocation(viewJob.location).mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:underline mt-1"
                      >
                        Open Google Maps <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="text-slate-400 shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">Salary / Payout</span>
                    <span className="text-sm font-bold text-slate-800">{viewJob.salary}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="text-slate-400 shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">Working Hours</span>
                    <span className="text-sm font-bold text-slate-800">{viewJob.working_hours || "Standard shift"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="text-slate-400 shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">Workers Required</span>
                    <span className="text-sm font-bold text-slate-800">{viewJob.workers_required || "Not specified"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="text-slate-400 shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">Posted On</span>
                    <span className="text-sm font-bold text-slate-800">
                      {new Date(viewJob.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="text-slate-400 shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">Employer</span>
                    <span className="text-sm font-bold text-slate-800">{getEmployerName(viewJob.employer_id)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-slate-100 pt-4">
                <span className="block text-xs font-semibold text-slate-400 mb-2">Job Description</span>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-48 overflow-y-auto">
                  {viewJob.description || "No description provided."}
                </p>
              </div>

              {/* Action buttons inside Modal */}
              <div className="flex gap-3 border-t border-slate-100 pt-4 mt-6">
                {viewJob.status !== "closed" && (
                  <Button
                    onClick={() => {
                      setCloseJobId(viewJob.id);
                      setViewJob(null);
                    }}
                    style={{ borderRadius: 10 }}
                    className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border-0"
                  >
                    Close Job
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setDeleteJobId(viewJob.id);
                    setViewJob(null);
                  }}
                  variant="destructive"
                  style={{ borderRadius: 10 }}
                  className="flex-1 h-11 font-semibold"
                >
                  Delete Job
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BrandedConfirmDialog
        isOpen={!!deleteFeedbackId}
        onClose={() => setDeleteFeedbackId(null)}
        onConfirm={() => {
          if (deleteFeedbackId) {
            deleteFeedback.mutate(deleteFeedbackId);
            setDeleteFeedbackId(null);
          }
        }}
        title="Delete User Feedback"
        description="Are you sure you want to permanently delete this user feedback? This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={deleteFeedback.isPending}
      />

      <Dialog open={!!viewFeedback} onOpenChange={(open) => !open && setViewFeedback(null)}>
        <DialogContent className="max-w-md sm:max-w-lg rounded-2xl p-6 bg-white border border-slate-100 shadow-xl overflow-y-auto max-h-[90vh]">
          {viewFeedback && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                  <MessageSquare size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-slate-900 leading-snug">User Feedback</h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">{viewFeedback.type || "General Feedback"}</p>
                </div>
                <button onClick={() => setViewFeedback(null)} className="text-slate-400 hover:text-slate-600 shrink-0 self-start p-1 rounded-md hover:bg-slate-50 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Status & Date */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                  <div className="mt-1">
                    <StatusBadge status={viewFeedback.status === "resolved" ? "success" : "pending"} />
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted On</span>
                  <span className="block text-xs font-bold text-slate-800 mt-1.5">
                    {new Date(viewFeedback.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Sender Details */}
              <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted By</span>
                <span className="block text-sm font-semibold text-slate-700 truncate">
                  {viewFeedback.user_id ? `User ID: ${viewFeedback.user_id}` : "Anonymous Guest"}
                </span>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-slate-400">Full Message</span>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-60 overflow-y-auto">
                  {viewFeedback.message}
                </p>
              </div>

              {/* Action buttons inside Modal */}
              <div className="flex gap-3 border-t border-slate-100 pt-4 mt-6">
                {viewFeedback.status !== "resolved" && (
                  <Button
                    onClick={() => {
                      updateFeedbackStatus.mutate({ id: viewFeedback.id, status: "resolved" });
                      setViewFeedback(null);
                    }}
                    style={{ borderRadius: 10 }}
                    className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold border-0"
                  >
                    Mark Resolved
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setDeleteFeedbackId(viewFeedback.id);
                    setViewFeedback(null);
                  }}
                  variant="destructive"
                  style={{ borderRadius: 10 }}
                  className="flex-1 h-11 font-semibold"
                >
                  Delete Feedback
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

