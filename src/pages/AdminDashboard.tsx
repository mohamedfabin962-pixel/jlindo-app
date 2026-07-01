import { useState, Component, ErrorInfo, ReactNode } from "react";
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
  MapPin, DollarSign, Clock, X, ExternalLink, TrendingUp, Activity,
  RotateCcw, Archive, AlertTriangle, Flag, HeartPulse
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { decodeLocation } from "@/utils/locationUtils";
import { createActivityLog } from "@/utils/activityLogger";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid,
} from "recharts";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside Admin Panel component:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6 text-center shadow-[0_2px_12px_rgba(15,10,30,0.02)]">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-3 text-rose-500">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            {this.props.fallbackTitle || "Failed to load component"}
          </h3>
          <p className="text-xs text-rose-600 max-w-md mx-auto mb-4 font-semibold">
            {this.state.error?.message || "An unexpected error occurred while rendering this section."}
          </p>
          <Button
            size="sm"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="h-8 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-sm"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

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

  // Applications section states
  const [appSearch, setAppSearch] = useState("");
  const [appFilter, setAppFilter] = useState("all");
  const [appPage, setAppPage] = useState(1);

  // Activity Log section states
  const [activitySearch, setActivitySearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");
  const [activityPage, setActivityPage] = useState(1);

  // Trash section states
  const [trashSearch, setTrashSearch] = useState("");
  const [trashFilter, setTrashFilter] = useState("all"); // all | jobs | feedback
  const [trashPage, setTrashPage] = useState(1);
  const [confirmPermDeleteJob, setConfirmPermDeleteJob] = useState<string | null>(null);
  const [confirmPermDeleteFeedback, setConfirmPermDeleteFeedback] = useState<string | null>(null);
  const [confirmRestoreJob, setConfirmRestoreJob] = useState<string | null>(null);
  const [confirmRestoreFeedback, setConfirmRestoreFeedback] = useState<string | null>(null);

  // Reports section states
  const [reportSearch, setReportSearch] = useState("");
  const [reportFilter, setReportFilter] = useState("all"); // all | pending | resolved | ignored
  const [reportPage, setReportPage] = useState(1);
  const [confirmIgnoreReportId, setConfirmIgnoreReportId] = useState<string | null>(null);
  const [confirmResolveReportId, setConfirmResolveReportId] = useState<string | null>(null);
  const [confirmWarnReport, setConfirmWarnReport] = useState<any | null>(null);
  const [warnMessage, setWarnMessage] = useState("");
  const [confirmRemoveReportJob, setConfirmRemoveReportJob] = useState<{ reportId: string; jobId: string; jobTitle: string } | null>(null);
  
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
      const { data, error } = await supabase.from("jobs").select("*").neq("status", "deleted").order("created_at", { ascending: false });
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
      const { data, error } = await supabase.from("feedback").select("*").neq("status", "deleted").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: trashedJobs } = useQuery({
    queryKey: ["admin-trashed-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("status", "deleted").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: trashedFeedbacks } = useQuery({
    queryKey: ["admin-trashed-feedbacks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("feedback").select("*").eq("status", "deleted").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const prepareChartData = (items: any[] | undefined) => {
    if (!items) return [];
    
    const dailyCounts: { [key: string]: number } = {};
    const last7Days: string[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      dailyCounts[dateStr] = 0;
      last7Days.push(dateStr);
    }
    
    items.forEach((item) => {
      if (!item.created_at) return;
      const dateStr = new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" });
      if (dailyCounts[dateStr] !== undefined) {
        dailyCounts[dateStr] += 1;
      }
    });
    
    return last7Days.map((date) => ({
      date,
      count: dailyCounts[date],
    }));
  };

  const updateJobStatus = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      const targetJob = (jobs || []).find((j: any) => j.id === jobId);
      const jobTitle = targetJob?.title || "Unknown Job";

      const { error } = await supabase.from("jobs").update({ status }).eq("id", jobId);
      if (error) throw error;

      let logType = "log_job_edited";
      let detailMsg = `Updated status of job "${jobTitle}" to ${status}`;
      if (status === "closed") {
        logType = "log_job_closed";
        detailMsg = `Closed job listing: "${jobTitle}"`;
      } else if (status === "open") {
        logType = "log_job_reopened";
        detailMsg = `Reopened job listing: "${jobTitle}"`;
      }

      await createActivityLog({
        type: logType,
        actorId: profile!.id,
        actorName: profile!.full_name || "System Admin",
        jobId,
        jobTitle,
        details: detailMsg
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast({ title: "Job status updated" });
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (jobId: string) => {
      const targetJob = (jobs || []).find((j: any) => j.id === jobId);
      const jobTitle = targetJob?.title || "Unknown Job";

      // Soft delete — move to trash
      const { error } = await supabase.from("jobs").update({ status: "deleted" }).eq("id", jobId);
      if (error) throw error;

      await createActivityLog({
        type: "log_job_deleted",
        actorId: profile!.id,
        actorName: profile!.full_name || "System Admin",
        jobId,
        jobTitle,
        details: `Moved job to Trash: "${jobTitle}"`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-trashed-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast({ title: "Job moved to Trash" });
    },
  });

  const restoreJob = useMutation({
    mutationFn: async (jobId: string) => {
      const targetJob = (trashedJobs || []).find((j: any) => j.id === jobId);
      const jobTitle = targetJob?.title || "Unknown Job";

      const { error } = await supabase.from("jobs").update({ status: "open" }).eq("id", jobId);
      if (error) throw error;

      await createActivityLog({
        type: "log_job_restored",
        actorId: profile!.id,
        actorName: profile!.full_name || "System Admin",
        jobId,
        jobTitle,
        details: `Restored job from Trash: "${jobTitle}"`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-trashed-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast({ title: "Job restored successfully" });
    },
  });

  const permanentDeleteJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trashed-jobs"] });
      toast({ title: "Job permanently deleted" });
    },
  });

  const toggleBlockUser = useMutation({
    mutationFn: async ({ userId, blocked }: { userId: string; blocked: boolean }) => {
      const targetUser = (users || []).find((u: any) => u.id === userId);
      const targetName = targetUser?.full_name || targetUser?.email || "Unknown User";

      const { error } = await supabase.from("profiles").update({ is_blocked: blocked }).eq("id", userId);
      if (error) throw error;

      await createActivityLog({
        type: blocked ? "log_user_blocked" : "log_user_unblocked",
        actorId: profile!.id,
        actorName: profile!.full_name || "System Admin",
        targetId: userId,
        targetName,
        details: blocked ? `Blocked user account: ${targetName}` : `Unblocked user account: ${targetName}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast({ title: "User updated" });
    },
  });

  const toggleVerificationMutation = useMutation({
    mutationFn: async ({ userId, verified }: { userId: string; verified: boolean }) => {
      const targetUser = (users || []).find((u: any) => u.id === userId);
      const targetName = targetUser?.full_name || targetUser?.email || "Unknown Employer";

      const { error } = await supabase
        .from("profiles")
        .update({ is_verified: verified })
        .eq("id", userId);
      if (error) throw error;

      await createActivityLog({
        type: verified ? "log_employer_verified" : "log_user_unblocked",
        actorId: profile!.id,
        actorName: profile!.full_name || "System Admin",
        targetId: userId,
        targetName,
        details: verified ? `Verified employer profile: ${targetName}` : `Removed verification from employer profile: ${targetName}`
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ 
        title: variables.verified ? "Employer Verified" : "Verification Removed",
        description: variables.verified 
          ? "The employer profile has been successfully verified."
          : "Verification status has been removed from this employer profile."
      });
    },
    onError: (error: any) => {
      if (error.message?.includes("column") && error.message?.includes("is_verified")) {
        toast({
          title: "Database Migration Required",
          description: "Please run the SQL query: 'ALTER TABLE profiles ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;' in your Supabase SQL Editor.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Action failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  const updateFeedbackStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("feedback")
        .update({ status })
        .eq("id", id);
      if (error) throw error;

      if (status === "resolved") {
        await createActivityLog({
          type: "log_feedback_resolved",
          actorId: profile!.id,
          actorName: profile!.full_name || "System Admin",
          details: `Marked feedback #${id.slice(0, 8)} as resolved`
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast({ title: "Feedback status updated" });
    },
  });

  const deleteFeedback = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete — move to trash
      const { error } = await supabase.from("feedback").update({ status: "deleted" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["admin-trashed-feedbacks"] });
      toast({ title: "Feedback moved to Trash" });
    },
  });

  const restoreFeedback = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feedback").update({ status: "pending" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["admin-trashed-feedbacks"] });
      toast({ title: "Feedback restored successfully" });
    },
  });

  const permanentDeleteFeedback = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feedback").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trashed-feedbacks"] });
      toast({ title: "Feedback permanently deleted" });
    },
  });

  const updateReportStatus = useMutation({
    mutationFn: async ({ id, status, logDetails }: { id: string; status: string; logDetails?: { type: string; details: string; jobId?: string; jobTitle?: string } }) => {
      const { error } = await supabase.from("feedback").update({ status }).eq("id", id);
      if (error) throw error;

      if (logDetails) {
        await createActivityLog({
          type: logDetails.type,
          actorId: profile!.id,
          actorName: profile!.full_name || "System Admin",
          jobId: logDetails.jobId,
          jobTitle: logDetails.jobTitle,
          details: logDetails.details
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast({ title: `Report updated to ${variables.status}` });
    },
    onError: (err: any) => {
      toast({ title: "Error updating report", description: err.message, variant: "destructive" });
    }
  });

  const removeReportedJob = useMutation({
    mutationFn: async ({ reportId, jobId, jobTitle }: { reportId: string; jobId: string; jobTitle: string }) => {
      const { error: jError } = await supabase.from("jobs").update({ status: "deleted" }).eq("id", jobId);
      if (jError) throw jError;

      const { error: rError } = await supabase.from("feedback").update({ status: "resolved" }).eq("id", reportId);
      if (rError) throw rError;

      await createActivityLog({
        type: "log_job_deleted",
        actorId: profile!.id,
        actorName: profile!.full_name || "System Admin",
        jobId,
        jobTitle,
        details: `Removed reported job: "${jobTitle}"`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-trashed-jobs"] });
      toast({ title: "Job removed and report resolved" });
      setConfirmRemoveReportJob(null);
    },
    onError: (err: any) => {
      toast({ title: "Error removing job", description: err.message, variant: "destructive" });
    }
  });

  const warnEmployerMutation = useMutation({
    mutationFn: async ({
      reportId,
      employerId,
      employerName,
      message
    }: {
      reportId: string;
      employerId: string;
      employerName: string;
      message: string;
    }) => {
      const { error: rError } = await supabase.from("feedback").update({ status: "resolved" }).eq("id", reportId);
      if (rError) throw rError;

      await createActivityLog({
        type: "log_user_blocked",
        actorId: profile!.id,
        actorName: profile!.full_name || "System Admin",
        targetId: employerId,
        targetName: employerName,
        details: `Sent warning to employer "${employerName}": "${message}"`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast({ title: "Warning sent and report resolved" });
      setConfirmWarnReport(null);
      setWarnMessage("");
    },
    onError: (err: any) => {
      toast({ title: "Error warning employer", description: err.message, variant: "destructive" });
    }
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
    } else if (userFilter === "verified") {
      matchesFilter = u.role === "employer" && !!u.is_verified;
    } else if (userFilter === "unverified") {
      matchesFilter = u.role === "employer" && !u.is_verified;
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
    if (f.type?.startsWith("log_") || f.type === "report_job") return false;

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

  // Reports processing
  const allReports = (feedbacks || [])
    .filter((f) => f.type === "report_job")
    .map((f) => {
      try {
        const payload = JSON.parse(f.message || "{}");
        return {
          ...f,
          payload,
        };
      } catch (err) {
        return {
          ...f,
          payload: { jobTitle: "Unknown Job", reason: "Other", description: f.message },
        };
      }
    });

  const filteredReports = allReports.filter((r) => {
    const s = reportSearch.toLowerCase().trim();
    const reasonMatch = r.payload.reason?.toLowerCase().includes(s) ?? false;
    const descMatch = r.payload.description?.toLowerCase().includes(s) ?? false;
    const jobMatch = r.payload.jobTitle?.toLowerCase().includes(s) ?? false;
    const workerMatch = r.payload.workerName?.toLowerCase().includes(s) ?? false;
    const employerMatch = r.payload.employerName?.toLowerCase().includes(s) ?? false;
    const matchesSearch = s === "" || reasonMatch || descMatch || jobMatch || workerMatch || employerMatch;

    let matchesFilter = true;
    if (reportFilter === "pending") {
      matchesFilter = r.status === "pending";
    } else if (reportFilter === "resolved") {
      matchesFilter = r.status === "resolved";
    } else if (reportFilter === "ignored") {
      matchesFilter = r.status === "ignored";
    }

    return matchesSearch && matchesFilter;
  });

  const totalReportPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startReportIndex = (reportPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startReportIndex, startReportIndex + itemsPerPage);
  const pendingReports = (feedbacks || []).filter((f) => f.type === "report_job" && f.status === "pending").length;

  const formatFeedbackDate = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    
    // Check if Today
    const isToday = d.getDate() === now.getDate() &&
                    d.getMonth() === now.getMonth() &&
                    d.getFullYear() === now.getFullYear();
                    
    // Check if Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.getDate() === yesterday.getDate() &&
                        d.getMonth() === yesterday.getMonth() &&
                        d.getFullYear() === yesterday.getFullYear();

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    };
    const timeStr = d.toLocaleTimeString("en-US", timeOptions);

    if (isToday) {
      return `Today, ${timeStr}`;
    }
    if (isYesterday) {
      return `Yesterday, ${timeStr}`;
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric"
    };
    const dateStr = d.toLocaleDateString("en-US", dateOptions);
    return `${dateStr} • ${timeStr}`;
  };

  const getWorkerName = (workerId: string) => {
    const matchedUser = (users || []).find((u: any) => u.id === workerId);
    return matchedUser?.full_name || `Worker (${workerId.slice(0, 8)})`;
  };

  const filteredApplications = (applications || []).filter((a: any) => {
    const s = appSearch.toLowerCase().trim();
    const titleMatch = a.jobs?.title?.toLowerCase().includes(s) ?? false;
    const workerName = getWorkerName(a.worker_id).toLowerCase();
    const workerMatch = workerName.includes(s);
    const matchesSearch = s === "" || titleMatch || workerMatch;

    let matchesFilter = true;
    if (appFilter !== "all") {
      matchesFilter = a.status === appFilter;
    }

    return matchesSearch && matchesFilter;
  });

  const totalAppPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startAppIndex = (appPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startAppIndex, startAppIndex + itemsPerPage);

  const totalUsers = users?.length || 0;
  const newUsersCount = (users || []).filter((u: any) => {
    if (!u.created_at) return false;
    return new Date(u.created_at).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000;
  }).length;
  const employersCount = (users || []).filter((u: any) => u.role === "employer").length;
  const workersCount = (users || []).filter((u: any) => u.role === "worker").length;

  const totalJobs = jobs?.length || 0;
  const activeJobsCount = (jobs || []).filter((j: any) => j.status === "open" || j.status === "filled").length;
  const closedJobsCount = (jobs || []).filter((j: any) => j.status === "closed").length;

  const totalApplications = applications?.length || 0;

  const openFeedback = feedbacks?.filter((f) => f.status !== "resolved" && f.type !== "report_job" && !f.type?.startsWith("log_")).length || 0;
  const resolvedFeedbackCount = (feedbacks || []).filter((f: any) => f.status === "resolved" && f.type !== "report_job" && !f.type?.startsWith("log_")).length;
  
  const blockedUsersCount = (users || []).filter((u: any) => u.is_blocked).length;
  const verifiedEmployersCount = (users || []).filter((u: any) => u.role === "employer" && u.full_name).length;
  const todaysApplicationsCount = (applications || []).filter((a: any) => {
    if (!a.created_at) return false;
    const d = new Date(a.created_at);
    const now = new Date();
    return d.getDate() === now.getDate() &&
           d.getMonth() === now.getMonth() &&
           d.getFullYear() === now.getFullYear();
  }).length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur border border-slate-200/80 p-3 rounded-xl shadow-lg font-sans">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{payload[0].payload.date}</p>
          <p className="text-sm font-black text-slate-800 mt-1">
            Count: <span className="text-amber-600 font-extrabold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const ChartSkeleton = () => (
    <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-6 space-y-4 animate-pulse">
      <div className="h-5 bg-slate-100 rounded-md w-1/3" />
      <div className="h-[250px] bg-slate-50 rounded-xl animate-pulse" />
    </div>
  );

  const userChartData = prepareChartData(users);
  const jobChartData = prepareChartData(jobs);
  const appChartData = prepareChartData(applications);

  const isUsersDataEmpty = userChartData.length === 0 || userChartData.every(d => d.count === 0);
  const isJobsDataEmpty = jobChartData.length === 0 || jobChartData.every(d => d.count === 0);
  const isAppsDataEmpty = appChartData.length === 0 || appChartData.every(d => d.count === 0);

  const isLoadingCharts = !users || !jobs || !applications;

  // Process activity logs from feedback
  const activityLogs = (feedbacks || [])
    .filter((f) => f.type?.startsWith("log_"))
    .map((f) => {
      let payload = { actorName: "Unknown", details: "" } as any;
      try {
        payload = JSON.parse(f.message || "{}");
      } catch (e) {
        payload.details = f.message;
      }
      return {
        id: f.id,
        type: f.type,
        actorName: payload.actorName,
        targetId: payload.targetId,
        targetName: payload.targetName,
        jobId: payload.jobId,
        jobTitle: payload.jobTitle,
        details: payload.details,
        createdAt: f.created_at,
        raw: f
      };
    });

  const latestActivityWidgetLogs = activityLogs.slice(0, 10);

  const getLogMeta = (type: string) => {
    switch (type) {
      case "log_user_blocked":
        return { label: "User Blocked", icon: Ban, color: "text-rose-600 bg-rose-50 border-rose-100" };
      case "log_user_unblocked":
        return { label: "User Unblocked", icon: Check, color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
      case "log_job_posted":
        return { label: "Job Posted", icon: Briefcase, color: "text-amber-600 bg-amber-50 border-amber-100" };
      case "log_job_edited":
        return { label: "Job Edited", icon: Briefcase, color: "text-indigo-600 bg-indigo-50 border-indigo-100" };
      case "log_job_closed":
        return { label: "Job Closed", icon: X, color: "text-slate-600 bg-slate-50 border-slate-100" };
      case "log_job_reopened":
        return { label: "Job Reopened", icon: Briefcase, color: "text-sky-600 bg-sky-50 border-sky-100" };
      case "log_job_deleted":
        return { label: "Job Deleted", icon: Trash2, color: "text-rose-600 bg-rose-50 border-rose-100" };
      case "log_job_restored":
        return { label: "Job Restored", icon: Briefcase, color: "text-teal-600 bg-teal-50 border-teal-100" };
      case "log_feedback_resolved":
        return { label: "Feedback Resolved", icon: Check, color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
      case "log_employer_verified":
        return { label: "Employer Verified", icon: ShieldCheck, color: "text-blue-600 bg-blue-50 border-blue-100" };
      default:
        return { label: "System Action", icon: ShieldCheck, color: "text-slate-600 bg-slate-50 border-slate-100" };
    }
  };

  const formatLogTimestamp = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const formatLogDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  const filteredLogs = activityLogs.filter((log) => {
    const s = activitySearch.toLowerCase().trim();
    const meta = getLogMeta(log.type || "");
    
    const matchesSearch = s === "" ||
      log.details?.toLowerCase().includes(s) ||
      log.actorName?.toLowerCase().includes(s) ||
      log.targetName?.toLowerCase().includes(s) ||
      log.jobTitle?.toLowerCase().includes(s) ||
      meta.label.toLowerCase().includes(s);

    let matchesFilter = true;
    const logDate = new Date(log.createdAt);
    const now = new Date();
    
    if (activityFilter === "today") {
      matchesFilter = logDate.getDate() === now.getDate() &&
                      logDate.getMonth() === now.getMonth() &&
                      logDate.getFullYear() === now.getFullYear();
    } else if (activityFilter === "this_week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      matchesFilter = logDate >= oneWeekAgo;
    }

    return matchesSearch && matchesFilter;
  });

  const totalLogPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startLogIndex = (activityPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startLogIndex, startLogIndex + itemsPerPage);

  // Trash computed values
  const allTrashedItems = [
    ...(trashedJobs || []).map((j: any) => ({ ...j, _trashType: "job" })),
    ...(trashedFeedbacks || [])
      .filter((f: any) => !f.type?.startsWith("log_"))
      .map((f: any) => ({ ...f, _trashType: "feedback" })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredTrashItems = allTrashedItems.filter((item) => {
    const s = trashSearch.toLowerCase().trim();
    let matchesSearch = true;
    if (s) {
      if (item._trashType === "job") {
        matchesSearch = item.title?.toLowerCase().includes(s) || getEmployerName(item.employer_id).toLowerCase().includes(s);
      } else {
        matchesSearch = item.message?.toLowerCase().includes(s) || item.type?.toLowerCase().includes(s);
      }
    }
    let matchesFilter = true;
    if (trashFilter === "jobs") matchesFilter = item._trashType === "job";
    if (trashFilter === "feedback") matchesFilter = item._trashType === "feedback";
    return matchesSearch && matchesFilter;
  });

  const totalTrashPages = Math.ceil(filteredTrashItems.length / itemsPerPage);
  const startTrashIndex = (trashPage - 1) * itemsPerPage;
  const paginatedTrashItems = filteredTrashItems.slice(startTrashIndex, startTrashIndex + itemsPerPage);
  const totalTrashedCount = allTrashedItems.length;

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          
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

          {/* Recent Activity Ticker / Compact Widget */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Activity size={12} />
                </div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Platform Activity</h3>
              </div>
              <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
                Latest 10 Events
              </span>
            </div>
            {latestActivityWidgetLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-semibold">
                No recent activity events recorded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {latestActivityWidgetLogs.map((log, idx) => {
                  const meta = getLogMeta(log.type || "");
                  const IconComp = meta.icon;
                  return (
                    <div 
                      key={log.id || idx}
                      className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100/50 rounded-xl p-3 flex flex-col justify-between transition-all duration-200"
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border mt-0.5 ${meta.color}`}>
                          <IconComp size={11} />
                        </div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                          {log.details}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2.5 text-[9px] text-slate-400 font-semibold border-t border-slate-100/65 pt-2">
                        <Clock size={9} className="text-slate-300" />
                        <span>{formatLogTimestamp(log.createdAt)}</span>
                        <span>·</span>
                        <span className="truncate">{log.actorName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            {/* New Users */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider">New Users</span>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <Users size={14} />
                </div>
              </div>
              <div>
                <p className="margin-0 text-xl font-black text-slate-800 tracking-tight leading-none mt-1">{newUsersCount}</p>
                <p className="text-[9px] text-slate-400 mt-1 font-semibold">Last 7 Days</p>
              </div>
            </div>

            {/* Employers */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider">Employers</span>
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                  <ShieldCheck size={14} />
                </div>
              </div>
              <div>
                <p className="margin-0 text-xl font-black text-slate-800 tracking-tight leading-none mt-1">{employersCount}</p>
                <p className="text-[9px] text-slate-400 mt-1 font-semibold">Total Profiles</p>
              </div>
            </div>

            {/* Workers */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider">Workers</span>
                <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg shrink-0">
                  <User size={14} />
                </div>
              </div>
              <div>
                <p className="margin-0 text-xl font-black text-slate-800 tracking-tight leading-none mt-1">{workersCount}</p>
                <p className="text-[9px] text-slate-400 mt-1 font-semibold">Total Profiles</p>
              </div>
            </div>

            {/* Active Jobs */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider">Active Jobs</span>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                  <Briefcase size={14} />
                </div>
              </div>
              <div>
                <p className="margin-0 text-xl font-black text-slate-800 tracking-tight leading-none mt-1">{activeJobsCount}</p>
                <p className="text-[9px] text-slate-400 mt-1 font-semibold">Open & Filled</p>
              </div>
            </div>

            {/* Closed Jobs */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider">Closed Jobs</span>
                <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                  <Archive size={14} />
                </div>
              </div>
              <div>
                <p className="margin-0 text-xl font-black text-slate-800 tracking-tight leading-none mt-1">{closedJobsCount}</p>
                <p className="text-[9px] text-slate-400 mt-1 font-semibold">Inactive listings</p>
              </div>
            </div>

            {/* Applications */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider">Applications</span>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                  <FileCheck size={14} />
                </div>
              </div>
              <div>
                <p className="margin-0 text-xl font-black text-slate-800 tracking-tight leading-none mt-1">{totalApplications}</p>
                <p className="text-[9px] text-slate-400 mt-1 font-semibold">Total submissions</p>
              </div>
            </div>

            {/* Pending Reports */}
            <div 
              className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              style={{ borderLeft: pendingReports > 0 ? "3px solid #EF4444" : undefined }}
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider">Reports</span>
                <div className={`p-1.5 rounded-lg shrink-0 ${pendingReports > 0 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-50 text-slate-500"}`}>
                  <Flag size={14} />
                </div>
              </div>
              <div>
                <p className={`margin-0 text-xl font-black tracking-tight leading-none mt-1 ${pendingReports > 0 ? "text-rose-600" : "text-slate-800"}`}>
                  {pendingReports}
                </p>
                <p className="text-[9px] text-slate-400 mt-1 font-semibold">Pending action</p>
              </div>
            </div>

            {/* Resolved Feedback */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider">Resolved</span>
                <div className="p-1.5 bg-green-50 text-green-600 rounded-lg shrink-0">
                  <MessageSquare size={14} />
                </div>
              </div>
              <div>
                <p className="margin-0 text-xl font-black text-slate-800 tracking-tight leading-none mt-1">{resolvedFeedbackCount}</p>
                <p className="text-[9px] text-slate-400 mt-1 font-semibold">Feedbacks resolved</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList
              className="flex overflow-x-auto scrollbar-none gap-1 h-auto p-1 bg-slate-100/80 rounded-xl mb-6 w-full justify-start md:justify-between"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <TabsTrigger value="overview" className="jl-tab-trigger shrink-0 md:flex-1 h-9 flex items-center justify-center gap-1.5 px-4 md:px-0">
                <TrendingUp size={14} />
                Overview
              </TabsTrigger>
              <TabsTrigger value="health" className="jl-tab-trigger shrink-0 md:flex-1 h-9 flex items-center justify-center gap-1.5 px-4 md:px-0">
                <HeartPulse size={14} />
                Health
              </TabsTrigger>
              <TabsTrigger value="users" className="jl-tab-trigger shrink-0 md:flex-1 h-9 flex items-center justify-center gap-1.5 px-4 md:px-0">
                <Users size={14} />
                Users ({users?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="jobs" className="jl-tab-trigger shrink-0 md:flex-1 h-9 flex items-center justify-center gap-1.5 px-4 md:px-0">
                <Briefcase size={14} />
                Jobs ({jobs?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="applications" className="jl-tab-trigger shrink-0 md:flex-1 h-9 flex items-center justify-center gap-1.5 px-4 md:px-0">
                <FileCheck size={14} />
                Applications ({applications?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="feedback" className="jl-tab-trigger shrink-0 md:flex-1 h-9 flex items-center justify-center gap-1.5 px-4 md:px-0">
                <MessageSquare size={14} />
                Feedback
                {openFeedback > 0 && (
                  <span className="bg-rose-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold ml-1 animate-pulse">
                    {openFeedback}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="reports" className="jl-tab-trigger shrink-0 md:flex-1 h-9 flex items-center justify-center gap-1.5 px-4 md:px-0">
                <Flag size={14} />
                Reports
                {pendingReports > 0 && (
                  <span className="bg-rose-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold ml-1 animate-pulse">
                    {pendingReports}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="activity" className="jl-tab-trigger shrink-0 md:flex-1 h-9 flex items-center justify-center gap-1.5 px-4 md:px-0">
                <Activity size={14} />
                Activity Log
              </TabsTrigger>
              <TabsTrigger value="trash" className="jl-tab-trigger shrink-0 md:flex-1 h-9 flex items-center justify-center gap-1.5 px-4 md:px-0">
                <Archive size={14} />
                Trash
                {totalTrashedCount > 0 && (
                  <span className="bg-rose-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold ml-1">
                    {totalTrashedCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <ErrorBoundary fallbackTitle="Overview dashboard failed to render">
              {isLoadingCharts ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartSkeleton />
                  <ChartSkeleton />
                  <div className="lg:col-span-2">
                    <ChartSkeleton />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Registrations Chart */}
                  <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 tracking-tight">User Registrations</h3>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Last 7 Days</p>
                      </div>
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <Users size={16} />
                      </div>
                    </div>
                    {isUsersDataEmpty ? (
                      <div className="h-[250px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <TrendingUp size={20} className="mb-2 text-slate-300" />
                        <p className="text-xs font-semibold">No registrations in the last 7 days</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={userChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,10,30,0.03)" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                          <ChartTooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorBlue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Jobs Created Chart */}
                  <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Jobs Created</h3>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Last 7 Days</p>
                      </div>
                      <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                        <Briefcase size={16} />
                      </div>
                    </div>
                    {isJobsDataEmpty ? (
                      <div className="h-[250px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <TrendingUp size={20} className="mb-2 text-slate-300" />
                        <p className="text-xs font-semibold">No jobs created in the last 7 days</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={jobChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorAmber" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,10,30,0.03)" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                          <ChartTooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorAmber)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Applications Chart */}
                  <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-6 flex flex-col justify-between lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Applications Submitted</h3>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Last 7 Days</p>
                      </div>
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <FileCheck size={16} />
                      </div>
                    </div>
                    {isAppsDataEmpty ? (
                      <div className="h-[250px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <TrendingUp size={20} className="mb-2 text-slate-300" />
                        <p className="text-xs font-semibold">No applications submitted in the last 7 days</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={appChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,10,30,0.03)" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                          <ChartTooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorEmerald)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              )}
              </ErrorBoundary>
            </TabsContent>

            {/* PLATFORM HEALTH TAB */}
            <TabsContent value="health" className="space-y-6">
              <ErrorBoundary fallbackTitle="Platform Health failed to render">
                {/* Health Header Status */}
                <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        pendingReports > 0 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-emerald-50 text-emerald-600"
                      }`}>
                        <Activity size={24} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-snug">System Status</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            pendingReports > 0 ? "bg-rose-500 animate-ping" : "bg-emerald-500"
                          }`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            pendingReports > 0 ? "text-rose-600" : "text-emerald-600"
                          }`}>
                            {pendingReports > 0 ? "Attention Required" : "System Operational"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium max-w-sm">
                      {pendingReports > 0 
                        ? `There are ${pendingReports} pending job reports that require moderation.`
                        : "All systems are running smoothly. Platform health metrics are optimal."}
                    </p>
                  </div>
                </div>

                {/* Health Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Active Jobs Card */}
                  <div className="bg-white rounded-2xl border border-slate-100/80 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex items-center justify-between text-slate-400 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Active Jobs</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Healthy</span>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-slate-800 tracking-tight leading-none">{activeJobsCount}</p>
                      <p className="text-xs text-slate-400 font-semibold mt-2">Accepting worker applications</p>
                    </div>
                  </div>

                  {/* Closed Jobs Card */}
                  <div className="bg-white rounded-2xl border border-slate-100/80 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex items-center justify-between text-slate-400 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Closed Jobs</span>
                      <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">Archived</span>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-slate-800 tracking-tight leading-none">{closedJobsCount}</p>
                      <p className="text-xs text-slate-400 font-semibold mt-2">Inactive listing count</p>
                    </div>
                  </div>

                  {/* Blocked Users Card */}
                  <div className="bg-white rounded-2xl border border-slate-100/80 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex items-center justify-between text-slate-400 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Blocked Users</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        blockedUsersCount > 0 ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50"
                      }`}>
                        {blockedUsersCount > 0 ? "Action Taken" : "Operational"}
                      </span>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-slate-800 tracking-tight leading-none">{blockedUsersCount}</p>
                      <p className="text-xs text-slate-400 font-semibold mt-2">Suspended platform access</p>
                    </div>
                  </div>

                  {/* Verified Employers Card */}
                  <div className="bg-white rounded-2xl border border-slate-100/80 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex items-center justify-between text-slate-400 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Verified Employers</span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-semibold">Active</span>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-slate-800 tracking-tight leading-none">{verifiedEmployersCount}</p>
                      <p className="text-xs text-slate-400 font-semibold mt-2">Employers with complete profiles</p>
                    </div>
                  </div>

                  {/* Pending Reports Card */}
                  <div className={`bg-white rounded-2xl border p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                    pendingReports > 0 ? "border-rose-100" : "border-slate-100/80"
                  }`}>
                    <div className="flex items-center justify-between text-slate-400 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Pending Reports</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        pendingReports > 0 ? "text-rose-600 bg-rose-50 animate-pulse font-extrabold" : "text-slate-500 bg-slate-50"
                      }`}>
                        {pendingReports > 0 ? "Needs Review" : "Clear"}
                      </span>
                    </div>
                    <div>
                      <p className={`text-3xl font-black tracking-tight leading-none ${
                        pendingReports > 0 ? "text-rose-600" : "text-slate-800"
                      }`}>{pendingReports}</p>
                      <p className="text-xs text-slate-400 font-semibold mt-2">Requires admin review</p>
                    </div>
                  </div>

                  {/* Feedback Waiting Card */}
                  <div className="bg-white rounded-2xl border border-slate-100/80 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex items-center justify-between text-slate-400 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Feedback Waiting</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        openFeedback > 0 ? "text-sky-600 bg-sky-50 font-semibold" : "text-slate-500 bg-slate-50"
                      }`}>
                        {openFeedback > 0 ? "Action Required" : "Clear"}
                      </span>
                    </div>
                    <div>
                      <p className={`text-3xl font-black tracking-tight leading-none ${
                        openFeedback > 0 ? "text-sky-600" : "text-slate-800"
                      }`}>{openFeedback}</p>
                      <p className="text-xs text-slate-400 font-semibold mt-2">Unresolved worker feedback</p>
                    </div>
                  </div>

                  {/* Today's Applications Card */}
                  <div className="bg-white rounded-2xl border border-slate-100/80 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex items-center justify-between text-slate-400 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Today's Applications</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        todaysApplicationsCount > 0 ? "text-emerald-600 bg-emerald-50" : "text-slate-500 bg-slate-50"
                      }`}>
                        {todaysApplicationsCount > 0 ? "Active Today" : "Quiet"}
                      </span>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-slate-800 tracking-tight leading-none">{todaysApplicationsCount}</p>
                      <p className="text-xs text-slate-400 font-semibold mt-2">Submissions since midnight</p>
                    </div>
                  </div>
                </div>
              </ErrorBoundary>
            </TabsContent>

            {/* USERS TAB */}
            <TabsContent value="users" className="space-y-4">
              <ErrorBoundary fallbackTitle="Users list failed to render">
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
                  <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl z-[100]">
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="worker">Workers</SelectItem>
                    <SelectItem value="employer">Employers</SelectItem>
                    <SelectItem value="blocked">Blocked Users</SelectItem>
                    <SelectItem value="verified">Verified Employers</SelectItem>
                    <SelectItem value="unverified">Unverified Employers</SelectItem>
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
                              {u.role === "employer" && u.is_verified && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                                  ✓ Verified
                                </span>
                              )}
                              {u.role === "employer" && !u.is_verified && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200/60 flex items-center gap-1">
                                  Unverified
                                </span>
                              )}
                              {u.is_blocked && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-1">
                                  <Ban size={10} /> Blocked
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Block / Unblock & Verify Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center sm:justify-end shrink-0 gap-2 w-full sm:w-auto">
                          {u.role === "employer" && (
                            <Button
                              size="sm"
                              variant={u.is_verified ? "default" : "outline"}
                              style={{
                                borderRadius: 10,
                                fontSize: 12.5,
                                fontWeight: 600,
                                height: 36,
                                borderColor: u.is_verified ? undefined : "rgba(16,185,129,0.2)",
                                color: u.is_verified ? undefined : "#10B981",
                                background: u.is_verified ? undefined : "rgba(16,185,129,0.02)",
                              }}
                              className={u.is_verified ? "bg-slate-600 hover:bg-slate-700 text-white shadow-sm border-0 w-full sm:w-auto" : "hover:bg-emerald-50/50 w-full sm:w-auto"}
                              onClick={() => toggleVerificationMutation.mutate({ userId: u.id, verified: !u.is_verified })}
                              disabled={toggleVerificationMutation.isPending}
                            >
                              <ShieldCheck size={13} className="mr-1.5" />
                              {u.is_verified ? "Remove Verification" : "Verify Employer"}
                            </Button>
                          )}
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
              </ErrorBoundary>
            </TabsContent>

            {/* JOBS TAB */}
            <TabsContent value="jobs" className="space-y-4">
              <ErrorBoundary fallbackTitle="Jobs listing failed to render">
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
                  <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl z-[100]">
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
              </ErrorBoundary>
            </TabsContent>

            {/* APPLICATIONS TAB */}
            <TabsContent value="applications" className="space-y-4">
              <ErrorBoundary fallbackTitle="Applications list failed to render">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    placeholder="Search by job title or worker name..."
                    value={appSearch}
                    onChange={(e) => {
                      setAppSearch(e.target.value);
                      setAppPage(1);
                    }}
                    className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-amber-500 bg-white"
                  />
                </div>

                <Select
                  value={appFilter}
                  onValueChange={(val) => {
                    setAppFilter(val);
                    setAppPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl border-slate-200 bg-white text-slate-700 font-medium">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl z-[100]">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paginatedApplications.length === 0 ? (
                <EmptyState
                  icon={FileCheck}
                  title="No applications found"
                  description={
                    appSearch || appFilter !== "all"
                      ? "Try adjusting your search query or status filter."
                      : "No job applications have been submitted yet."
                  }
                />
              ) : (
                <div className="space-y-4">
                  {paginatedApplications.map((a: any) => (
                    <div
                      key={a.id}
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
                      {/* Top Info Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="shrink-0 flex items-center justify-center"
                            style={{
                              height: 40,
                              width: 40,
                              borderRadius: 12,
                              background: "rgba(16,185,129,0.08)",
                              color: "#10B981",
                              border: "1px solid rgba(16,185,129,0.15)",
                            }}
                          >
                            <FileCheck size={18} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 truncate m-0 font-sans tracking-tight">
                              {a.jobs?.title || "Unknown Job"}
                            </h3>
                            <p className="m-0 text-xs font-semibold text-slate-500 mt-1">
                              Applied by <span className="text-slate-800">{getWorkerName(a.worker_id)}</span>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center shrink-0">
                          <StatusBadge status={a.status} />
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ height: 1, background: "rgba(15,10,30,0.04)", width: "100%" }} />

                      {/* Bottom Grid Detail elements */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-500">
                        <div className="flex items-center gap-2 min-w-0">
                          <Calendar size={13.5} className="text-slate-400 shrink-0" />
                          <span className="truncate">
                            Date Applied: {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <User size={13.5} className="text-slate-400 shrink-0" />
                          <span className="truncate" title={a.worker_id}>
                            Worker ID: {a.worker_id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination Section */}
                  {totalAppPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 order-2 sm:order-1 text-center sm:text-left">
                        Showing {startAppIndex + 1}–{Math.min(startAppIndex + itemsPerPage, filteredApplications.length)} of {filteredApplications.length} applications
                      </span>
                      
                      <div className="flex items-center gap-1.5 order-1 sm:order-2">
                        <Button
                          disabled={appPage === 1}
                          onClick={() => setAppPage((prev) => Math.max(prev - 1, 1))}
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
                            cursor: appPage === 1 ? "not-allowed" : "pointer",
                            opacity: appPage === 1 ? 0.4 : 1,
                            boxShadow: "0 2px 6px rgba(15,10,30,0.02)",
                          }}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        
                        {Array.from({ length: totalAppPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            onClick={() => setAppPage(page)}
                            style={{
                              background: appPage === page ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" : "#ffffff",
                              border: appPage === page ? "none" : "1px solid rgba(15,10,30,0.08)",
                              borderRadius: 10,
                              height: 36,
                              width: 36,
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: appPage === page ? "#ffffff" : "#0d0a1e",
                              fontWeight: 600,
                              fontSize: 13,
                              cursor: "pointer",
                              boxShadow: appPage === page ? "0 2px 8px rgba(245,158,11,0.24)" : "0 2px 6px rgba(15,10,30,0.02)",
                            }}
                          >
                            {page}
                          </Button>
                        ))}

                        <Button
                          disabled={appPage === totalAppPages}
                          onClick={() => setAppPage((prev) => Math.min(prev + 1, totalAppPages))}
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
                            cursor: appPage === totalAppPages ? "not-allowed" : "pointer",
                            opacity: appPage === totalAppPages ? 0.4 : 1,
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
              </ErrorBoundary>
            </TabsContent>

            {/* FEEDBACK TAB */}
            <TabsContent value="feedback" className="space-y-4">
              <ErrorBoundary fallbackTitle="Feedback list failed to render">
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
                  <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl z-[100]">
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
                            {formatFeedbackDate(f.created_at)}
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
              </ErrorBoundary>
            </TabsContent>

            {/* ACTIVITY LOG TAB */}
            <TabsContent value="activity" className="space-y-4">
              <ErrorBoundary fallbackTitle="Activity log failed to render">
              {/* Header */}
              <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 tracking-tight">Activity Log</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {filteredLogs.length} event{filteredLogs.length !== 1 ? "s" : ""} recorded
                    </p>
                  </div>

                  {/* Search */}
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="activity-search"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                      placeholder="Search events…"
                      value={activitySearch}
                      onChange={(e) => { setActivitySearch(e.target.value); setActivityPage(1); }}
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    { value: "all", label: "All Time" },
                    { value: "today", label: "Today" },
                    { value: "this_week", label: "This Week" },
                  ].map((f) => (
                    <button
                      key={f.value}
                      id={`activity-filter-${f.value}`}
                      onClick={() => { setActivityFilter(f.value); setActivityPage(1); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                        activityFilter === f.value
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Log List */}
              {!feedbacks ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100/80 p-4 animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-100 rounded-md w-2/3" />
                          <div className="h-3 bg-slate-50 rounded-md w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : paginatedLogs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                    <Activity size={24} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1">No activity found</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    {activitySearch || activityFilter !== "all"
                      ? "Try adjusting your search or filter."
                      : "Activity events will appear here as admins and employers take actions on the platform."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedLogs.map((log, idx) => {
                    const meta = getLogMeta(log.type || "");
                    const IconComp = meta.icon;
                    return (
                      <div
                        key={log.id || idx}
                        className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-4 flex gap-3 items-start hover:shadow-md transition-all duration-200 jl-admin-card"
                      >
                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${meta.color}`}>
                          <IconComp size={15} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.color}`}>
                                {meta.label}
                              </span>
                              <span className="text-xs font-semibold text-slate-700 truncate">
                                {log.actorName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Calendar size={11} className="text-slate-300" />
                              <span className="text-[11px] text-slate-400 font-medium">
                                {formatLogDate(log.createdAt)}
                              </span>
                              <span className="text-[11px] text-slate-300">·</span>
                              <Clock size={11} className="text-slate-300" />
                              <span className="text-[11px] text-slate-400 font-medium">
                                {formatLogTimestamp(log.createdAt)}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            {log.details}
                          </p>

                          {log.jobTitle && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Briefcase size={11} className="text-amber-500 shrink-0" />
                              <span className="text-[11px] text-amber-700 font-semibold truncate">
                                {log.jobTitle}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {totalLogPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 order-2 sm:order-1 text-center sm:text-left">
                        Showing {startLogIndex + 1}–{Math.min(startLogIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} events
                      </span>
                      <div className="flex items-center gap-1.5 order-1 sm:order-2">
                        <Button
                          disabled={activityPage === 1}
                          onClick={() => setActivityPage((p) => Math.max(p - 1, 1))}
                          style={{
                            background: "#ffffff", border: "1px solid rgba(15,10,30,0.08)",
                            borderRadius: 10, height: 36, width: 36, padding: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#0d0a1e", cursor: activityPage === 1 ? "not-allowed" : "pointer",
                            opacity: activityPage === 1 ? 0.4 : 1, boxShadow: "0 2px 6px rgba(15,10,30,0.02)",
                          }}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        {Array.from({ length: totalLogPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            onClick={() => setActivityPage(page)}
                            style={{
                              background: activityPage === page ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" : "#ffffff",
                              border: activityPage === page ? "none" : "1px solid rgba(15,10,30,0.08)",
                              borderRadius: 10, height: 36, width: 36, padding: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: activityPage === page ? "#ffffff" : "#0d0a1e",
                              fontWeight: 600, fontSize: 13, cursor: "pointer",
                              boxShadow: activityPage === page ? "0 2px 8px rgba(245,158,11,0.24)" : "0 2px 6px rgba(15,10,30,0.02)",
                            }}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          disabled={activityPage === totalLogPages}
                          onClick={() => setActivityPage((p) => Math.min(p + 1, totalLogPages))}
                          style={{
                            background: "#ffffff", border: "1px solid rgba(15,10,30,0.08)",
                            borderRadius: 10, height: 36, width: 36, padding: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#0d0a1e", cursor: activityPage === totalLogPages ? "not-allowed" : "pointer",
                            opacity: activityPage === totalLogPages ? 0.4 : 1, boxShadow: "0 2px 6px rgba(15,10,30,0.02)",
                          }}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              </ErrorBoundary>
            </TabsContent>

            {/* REPORTS TAB */}
            <TabsContent value="reports" className="space-y-4">
              <ErrorBoundary fallbackTitle="Reports moderation failed to render">
              {/* Header */}
              <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Flag size={16} className="text-rose-500" />
                      <h2 className="text-base font-bold text-slate-800 tracking-tight">Reports</h2>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""} found
                    </p>
                  </div>
                  {/* Search */}
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="report-search"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 transition-all"
                      placeholder="Search reports…"
                      value={reportSearch}
                      onChange={(e) => { setReportSearch(e.target.value); setReportPage(1); }}
                    />
                  </div>
                </div>
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    { value: "all", label: "All Reports" },
                    { value: "pending", label: "Pending" },
                    { value: "resolved", label: "Resolved" },
                    { value: "ignored", label: "Ignored" },
                  ].map((f) => (
                    <button
                      key={f.value}
                      id={`report-filter-${f.value}`}
                      onClick={() => { setReportFilter(f.value); setReportPage(1); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                        reportFilter === f.value
                          ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reports List */}
              {!feedbacks ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100/80 p-4 animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-100 rounded-md w-2/3" />
                          <div className="h-3 bg-slate-50 rounded-md w-1/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : paginatedReports.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-14 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                    <Flag size={28} className="text-slate-200" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1">No reports found</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    {reportSearch || reportFilter !== "all"
                      ? "No reports match your search or filter."
                      : "Job reports submitted by workers will appear here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedReports.map((report, idx) => {
                    const job = (jobs || []).find((j: any) => j.id === report.payload.jobId) ||
                                (trashedJobs || []).find((j: any) => j.id === report.payload.jobId);
                    
                    return (
                      <div
                        key={report.id || idx}
                        className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-5 hover:shadow-md transition-all duration-200 jl-admin-card"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-2.5 flex-1 min-w-0">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 font-extrabold">
                                {report.payload.reason}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                report.status === "pending"
                                  ? "bg-amber-50 border-amber-100 text-amber-600 animate-pulse"
                                  : report.status === "resolved"
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                  : "bg-slate-50 border-slate-200 text-slate-500"
                              }`}>
                                {report.status}
                              </span>
                              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 ml-auto md:ml-0">
                                <Calendar size={11} />
                                {formatFeedbackDate(report.created_at)}
                              </span>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 text-xs">
                              <div>
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Reported Job</span>
                                <span className="font-semibold text-slate-700 truncate block mt-0.5">
                                  {report.payload.jobTitle}
                                </span>
                              </div>
                              <div>
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Employer</span>
                                <span className="font-semibold text-slate-700 truncate block mt-0.5">
                                  {report.payload.employerName}
                                </span>
                              </div>
                              <div>
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Worker (Reporter)</span>
                                <span className="font-semibold text-slate-700 truncate block mt-0.5">
                                  {report.payload.workerName}
                                </span>
                              </div>
                            </div>

                            {report.payload.description && (
                              <div className="text-xs text-slate-600 bg-rose-50/30 border border-rose-100/40 p-3 rounded-xl leading-relaxed">
                                <span className="font-bold text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Reporter Comment</span>
                                "{report.payload.description}"
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-row md:flex-col gap-2 shrink-0 flex-wrap md:flex-nowrap">
                            {job && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-xl text-xs font-semibold flex-1 md:flex-none border-slate-200 hover:bg-slate-50 text-slate-700 gap-1.5"
                                onClick={() => setViewJob(job)}
                              >
                                <Briefcase size={12} />
                                View Job
                              </Button>
                            )}

                            {report.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-8 rounded-xl text-xs font-semibold flex-1 md:flex-none bg-rose-500 hover:bg-rose-600 text-white border-0 shadow-sm gap-1.5"
                                  onClick={() => setConfirmRemoveReportJob({
                                    reportId: report.id,
                                    jobId: report.payload.jobId,
                                    jobTitle: report.payload.jobTitle
                                  })}
                                  disabled={removeReportedJob.isPending}
                                >
                                  <Trash2 size={12} />
                                  Remove Job
                                </Button>

                                <Button
                                  size="sm"
                                  className="h-8 rounded-xl text-xs font-semibold flex-1 md:flex-none bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm gap-1.5"
                                  onClick={() => setConfirmWarnReport(report)}
                                  disabled={warnEmployerMutation.isPending}
                                >
                                  <AlertTriangle size={12} />
                                  Warn Employer
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 rounded-xl text-xs font-semibold flex-1 md:flex-none border-slate-200 hover:bg-slate-50 text-slate-600 gap-1.5"
                                  onClick={() => setConfirmIgnoreReportId(report.id)}
                                  disabled={updateReportStatus.isPending}
                                >
                                  <Ban size={12} />
                                  Ignore
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 rounded-xl text-xs font-semibold flex-1 md:flex-none border-emerald-200 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 gap-1.5"
                                  onClick={() => setConfirmResolveReportId(report.id)}
                                  disabled={updateReportStatus.isPending}
                                >
                                  <Check size={12} />
                                  Resolve
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Reports Pagination */}
                  {totalReportPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 order-2 sm:order-1">
                        Showing {startReportIndex + 1}–{Math.min(startReportIndex + itemsPerPage, filteredReports.length)} of {filteredReports.length} reports
                      </span>
                      <div className="flex items-center gap-1.5 order-1 sm:order-2">
                        <Button
                          disabled={reportPage === 1}
                          onClick={() => setReportPage((p) => Math.max(p - 1, 1))}
                          style={{ background: "#ffffff", border: "1px solid rgba(15,10,30,0.08)", borderRadius: 10, height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#0d0a1e", cursor: reportPage === 1 ? "not-allowed" : "pointer", opacity: reportPage === 1 ? 0.4 : 1, boxShadow: "0 2px 6px rgba(15,10,30,0.02)" }}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        {Array.from({ length: totalReportPages }, (_, i) => i + 1).map((page) => (
                          <Button key={page} onClick={() => setReportPage(page)}
                            style={{ background: reportPage === page ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" : "#ffffff", border: reportPage === page ? "none" : "1px solid rgba(15,10,30,0.08)", borderRadius: 10, height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", color: reportPage === page ? "#ffffff" : "#0d0a1e", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: reportPage === page ? "0 2px 8px rgba(239,68,68,0.24)" : "0 2px 6px rgba(15,10,30,0.02)" }}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          disabled={reportPage === totalReportPages}
                          onClick={() => setReportPage((p) => Math.min(p + 1, totalReportPages))}
                          style={{ background: "#ffffff", border: "1px solid rgba(15,10,30,0.08)", borderRadius: 10, height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#0d0a1e", cursor: reportPage === totalReportPages ? "not-allowed" : "pointer", opacity: reportPage === totalReportPages ? 0.4 : 1, boxShadow: "0 2px 6px rgba(15,10,30,0.02)" }}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              </ErrorBoundary>
            </TabsContent>

            {/* TRASH TAB */}
            <TabsContent value="trash" className="space-y-4">
              <ErrorBoundary fallbackTitle="Trash content failed to render">
              {/* Header */}
              <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Archive size={16} className="text-rose-500" />
                      <h2 className="text-base font-bold text-slate-800 tracking-tight">Trash</h2>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      {filteredTrashItems.length} item{filteredTrashItems.length !== 1 ? "s" : ""} in trash — restore or permanently delete
                    </p>
                  </div>
                  {/* Search */}
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="trash-search"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 transition-all"
                      placeholder="Search trash…"
                      value={trashSearch}
                      onChange={(e) => { setTrashSearch(e.target.value); setTrashPage(1); }}
                    />
                  </div>
                </div>
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    { value: "all", label: `All (${allTrashedItems.length})` },
                    { value: "jobs", label: `Jobs (${(trashedJobs || []).length})` },
                    { value: "feedback", label: `Feedback (${(trashedFeedbacks || []).filter((f: any) => !f.type?.startsWith("log_")).length})` },
                  ].map((f) => (
                    <button
                      key={f.value}
                      id={`trash-filter-${f.value}`}
                      onClick={() => { setTrashFilter(f.value); setTrashPage(1); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                        trashFilter === f.value
                          ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trash Items */}
              {(!trashedJobs && !trashedFeedbacks) ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100/80 p-4 animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-100 rounded-md w-2/3" />
                          <div className="h-3 bg-slate-50 rounded-md w-1/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : paginatedTrashItems.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-14 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                    <Archive size={28} className="text-slate-200" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1">Trash is empty</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    {trashSearch || trashFilter !== "all"
                      ? "No items match your search or filter."
                      : "Deleted jobs and feedback will appear here. You can restore or permanently remove them."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedTrashItems.map((item, idx) => {
                    const isJob = item._trashType === "job";
                    return (
                      <div
                        key={item.id || idx}
                        className="bg-white rounded-2xl border border-rose-100/60 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-4 flex flex-col sm:flex-row sm:items-start gap-4 transition-all duration-200 hover:shadow-md jl-admin-card"
                      >
                        {/* Type Icon */}
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                          isJob ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-slate-50 border-slate-100 text-slate-500"
                        }`}>
                          {isJob ? <Briefcase size={16} /> : <MessageSquare size={16} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                  isJob
                                    ? "text-amber-700 bg-amber-50 border-amber-100"
                                    : "text-slate-600 bg-slate-50 border-slate-200"
                                }`}>
                                  {isJob ? "Job" : "Feedback"}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border text-rose-600 bg-rose-50 border-rose-100">
                                  Deleted
                                </span>
                              </div>
                              <p className="text-sm font-bold text-slate-800 truncate">
                                {isJob ? item.title : (item.type || "Feedback")}
                              </p>
                              {isJob && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {getEmployerName(item.employer_id)} · {decodeLocation(item.location)?.city || "Unknown city"}
                                </p>
                              )}
                              {!isJob && item.message && (
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                  {item.message.length > 120 ? `${item.message.slice(0, 120)}…` : item.message}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Calendar size={11} className="text-slate-300" />
                              <span className="text-[11px] text-slate-400 font-medium">
                                {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Button
                              size="sm"
                              id={`restore-${item._trashType}-${item.id}`}
                              className="h-8 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm gap-1.5"
                              onClick={() => {
                                if (isJob) setConfirmRestoreJob(item.id);
                                else setConfirmRestoreFeedback(item.id);
                              }}
                              disabled={isJob ? restoreJob.isPending : restoreFeedback.isPending}
                            >
                              <RotateCcw size={12} />
                              Restore
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              id={`perm-delete-${item._trashType}-${item.id}`}
                              className="h-8 text-xs font-semibold rounded-xl border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 gap-1.5"
                              onClick={() => {
                                if (isJob) setConfirmPermDeleteJob(item.id);
                                else setConfirmPermDeleteFeedback(item.id);
                              }}
                              disabled={isJob ? permanentDeleteJob.isPending : permanentDeleteFeedback.isPending}
                            >
                              <Trash2 size={12} />
                              Delete Forever
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {totalTrashPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 order-2 sm:order-1">
                        Showing {startTrashIndex + 1}–{Math.min(startTrashIndex + itemsPerPage, filteredTrashItems.length)} of {filteredTrashItems.length} items
                      </span>
                      <div className="flex items-center gap-1.5 order-1 sm:order-2">
                        <Button
                          disabled={trashPage === 1}
                          onClick={() => setTrashPage((p) => Math.max(p - 1, 1))}
                          style={{ background: "#ffffff", border: "1px solid rgba(15,10,30,0.08)", borderRadius: 10, height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#0d0a1e", cursor: trashPage === 1 ? "not-allowed" : "pointer", opacity: trashPage === 1 ? 0.4 : 1, boxShadow: "0 2px 6px rgba(15,10,30,0.02)" }}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        {Array.from({ length: totalTrashPages }, (_, i) => i + 1).map((page) => (
                          <Button key={page} onClick={() => setTrashPage(page)}
                            style={{ background: trashPage === page ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" : "#ffffff", border: trashPage === page ? "none" : "1px solid rgba(15,10,30,0.08)", borderRadius: 10, height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", color: trashPage === page ? "#ffffff" : "#0d0a1e", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: trashPage === page ? "0 2px 8px rgba(239,68,68,0.24)" : "0 2px 6px rgba(15,10,30,0.02)" }}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          disabled={trashPage === totalTrashPages}
                          onClick={() => setTrashPage((p) => Math.min(p + 1, totalTrashPages))}
                          style={{ background: "#ffffff", border: "1px solid rgba(15,10,30,0.08)", borderRadius: 10, height: 36, width: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#0d0a1e", cursor: trashPage === totalTrashPages ? "not-allowed" : "pointer", opacity: trashPage === totalTrashPages ? 0.4 : 1, boxShadow: "0 2px 6px rgba(15,10,30,0.02)" }}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              </ErrorBoundary>
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
        title="Move Job to Trash"
        description="This job listing will be moved to Trash. You can restore it later from the Trash tab."
        confirmText="Move to Trash"
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

      {/* Trash: Restore Job */}
      <BrandedConfirmDialog
        isOpen={!!confirmRestoreJob}
        onClose={() => setConfirmRestoreJob(null)}
        onConfirm={() => {
          if (confirmRestoreJob) {
            restoreJob.mutate(confirmRestoreJob);
            setConfirmRestoreJob(null);
          }
        }}
        title="Restore Job Listing"
        description="This job will be restored and set back to Open status. Employers and workers will be able to see it again."
        confirmText="Restore"
        isLoading={restoreJob.isPending}
      />

      {/* Trash: Permanently Delete Job */}
      <BrandedConfirmDialog
        isOpen={!!confirmPermDeleteJob}
        onClose={() => setConfirmPermDeleteJob(null)}
        onConfirm={() => {
          if (confirmPermDeleteJob) {
            permanentDeleteJob.mutate(confirmPermDeleteJob);
            setConfirmPermDeleteJob(null);
          }
        }}
        title="Permanently Delete Job"
        description="This job listing will be permanently removed from the database. This action cannot be undone."
        confirmText="Delete Forever"
        isDestructive
        isLoading={permanentDeleteJob.isPending}
      />

      {/* Trash: Restore Feedback */}
      <BrandedConfirmDialog
        isOpen={!!confirmRestoreFeedback}
        onClose={() => setConfirmRestoreFeedback(null)}
        onConfirm={() => {
          if (confirmRestoreFeedback) {
            restoreFeedback.mutate(confirmRestoreFeedback);
            setConfirmRestoreFeedback(null);
          }
        }}
        title="Restore Feedback"
        description="This feedback will be restored to Pending status and will appear in the Feedback tab again."
        confirmText="Restore"
        isLoading={restoreFeedback.isPending}
      />

      {/* Trash: Permanently Delete Feedback */}
      <BrandedConfirmDialog
        isOpen={!!confirmPermDeleteFeedback}
        onClose={() => setConfirmPermDeleteFeedback(null)}
        onConfirm={() => {
          if (confirmPermDeleteFeedback) {
            permanentDeleteFeedback.mutate(confirmPermDeleteFeedback);
            setConfirmPermDeleteFeedback(null);
          }
        }}
        title="Permanently Delete Feedback"
        description="This feedback will be permanently removed from the database. This action cannot be undone."
        confirmText="Delete Forever"
        isDestructive
        isLoading={permanentDeleteFeedback.isPending}
      />

      {/* Reports Ignore Confirm Dialog */}
      <BrandedConfirmDialog
        isOpen={!!confirmIgnoreReportId}
        onClose={() => setConfirmIgnoreReportId(null)}
        onConfirm={() => {
          if (confirmIgnoreReportId) {
            updateReportStatus.mutate({
              id: confirmIgnoreReportId,
              status: "ignored",
              logDetails: {
                type: "log_feedback_resolved",
                details: `Ignored report #${confirmIgnoreReportId.slice(0, 8)}`
              }
            });
            setConfirmIgnoreReportId(null);
          }
        }}
        title="Ignore Report"
        description="Are you sure you want to ignore this report? The listing status will remain unchanged."
        confirmText="Ignore"
        isLoading={updateReportStatus.isPending}
      />

      {/* Reports Resolve Confirm Dialog */}
      <BrandedConfirmDialog
        isOpen={!!confirmResolveReportId}
        onClose={() => setConfirmResolveReportId(null)}
        onConfirm={() => {
          if (confirmResolveReportId) {
            updateReportStatus.mutate({
              id: confirmResolveReportId,
              status: "resolved",
              logDetails: {
                type: "log_feedback_resolved",
                details: `Resolved report #${confirmResolveReportId.slice(0, 8)}`
              }
            });
            setConfirmResolveReportId(null);
          }
        }}
        title="Resolve Report"
        description="Are you sure you want to mark this report as resolved? This indicates you have addressed the issue."
        confirmText="Resolve"
        isLoading={updateReportStatus.isPending}
      />

      {/* Reports Remove Job Confirm Dialog */}
      <BrandedConfirmDialog
        isOpen={!!confirmRemoveReportJob}
        onClose={() => setConfirmRemoveReportJob(null)}
        onConfirm={() => {
          if (confirmRemoveReportJob) {
            removeReportedJob.mutate({
              reportId: confirmRemoveReportJob.reportId,
              jobId: confirmRemoveReportJob.jobId,
              jobTitle: confirmRemoveReportJob.jobTitle
            });
          }
        }}
        title="Remove Reported Job"
        description={`Are you sure you want to remove the job listing "${confirmRemoveReportJob?.jobTitle}"? This will move the job listing to the Trash and mark the report as resolved.`}
        confirmText="Remove Job"
        isDestructive
        isLoading={removeReportedJob.isPending}
      />

      {/* Reports Warn Employer Modal */}
      <Dialog open={!!confirmWarnReport} onOpenChange={(open) => !open && setConfirmWarnReport(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white border border-slate-100 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle size={18} />
              Warn Employer
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Send an official warning to the employer: <strong>{confirmWarnReport?.payload?.employerName}</strong> regarding job listing: <strong>{confirmWarnReport?.payload?.jobTitle}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <label htmlFor="warn-msg" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Warning Message *
            </label>
            <textarea
              id="warn-msg"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all min-h-[100px] resize-y font-medium text-slate-700"
              placeholder="e.g. Please update the salary information on your job posting to comply with our guidelines..."
              value={warnMessage}
              onChange={(e) => setWarnMessage(e.target.value)}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmWarnReport(null);
                setWarnMessage("");
              }}
              className="rounded-xl h-10 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!warnMessage.trim()) {
                  toast({
                    title: "Message Required",
                    description: "Please enter a warning message.",
                    variant: "destructive"
                  });
                  return;
                }
                warnEmployerMutation.mutate({
                  reportId: confirmWarnReport.id,
                  employerId: confirmWarnReport.payload.employerId,
                  employerName: confirmWarnReport.payload.employerName,
                  message: warnMessage.trim()
                });
              }}
              disabled={warnEmployerMutation.isPending}
              className="rounded-xl h-10 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm"
            >
              {warnEmployerMutation.isPending ? "Sending..." : "Send Warning"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    {formatFeedbackDate(viewFeedback.created_at)}
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

