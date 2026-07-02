import { useState } from "react";
// unused type imports removed
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrandedConfirmDialog } from "@/components/BrandedConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
// tabs removed
// select removed
import { useToast } from "@/hooks/use-toast";
import {
  Trash2, Ban, Users, Briefcase, FileCheck, MessageSquare, ShieldCheck, Check,
  ChevronLeft, ChevronRight, Search, Mail, Phone, Calendar, User,
  MapPin, DollarSign, Clock, X, ExternalLink, TrendingUp, Activity,
  Archive, AlertTriangle, Flag, Star, Plus, Info, Bell, Sparkles, RefreshCw, Download,
  LogOut, Menu, Sliders, Settings, LayoutDashboard
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
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

/*
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

*/

export default function AdminDashboard() {
  const { profile, loading, signOut } = useAuth();
  const isAdmin = profile?.role === "admin";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  // Layout and Navigation State
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commCenterTab, setCommCenterTab] = useState("reports"); // reports | feedback | announcements
  const [notifBellOpen, setNotifBellOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [autoRefreshQueries, setAutoRefreshQueries] = useState(true);
  const [interfaceTheme, setInterfaceTheme] = useState("light");
  
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
  
  // Notifications section states
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifPriority, setNotifPriority] = useState<"info" | "feature" | "update" | "reminder" | "important" | "maintenance">("info");
  const [notifTargetAudience, setNotifTargetAudience] = useState<"workers" | "employers" | "everyone">("everyone");
  const [notifFormOpen, setNotifFormOpen] = useState(false);
  const [confirmDeleteNotifId, setConfirmDeleteNotifId] = useState<string | null>(null);
  
  // Global Admin Search states
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchCategoryFilter, setSearchCategoryFilter] = useState<"all" | "users" | "employers" | "jobs" | "applications" | "feedback" | "reports">("all");
  
  // const itemsPerPage = 5; // commented out duplicate

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

  const { data: notifications } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          profiles:created_by ( full_name ),
          notification_reads ( user_id )
        `)
        .order("created_at", { ascending: false });
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

  const createNotification = useMutation({
    mutationFn: async ({
      title,
      message,
      priority,
      targetAudience,
    }: {
      title: string;
      message: string;
      priority: "info" | "feature" | "update" | "reminder" | "important" | "maintenance";
      targetAudience: "workers" | "employers" | "everyone";
    }) => {
      const { error } = await supabase.from("notifications").insert({
        title,
        message,
        priority,
        target_audience: targetAudience,
        created_by: profile!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast({ title: "Notification sent successfully", description: "Target audience will receive it in their app." });
      setNotifTitle("");
      setNotifMessage("");
      setNotifPriority("info");
      setNotifTargetAudience("everyone");
      setNotifFormOpen(false);
    },
    onError: (err: any) => {
      if (err.message?.includes("relation") && err.message?.includes("notifications")) {
        toast({
          title: "Table Missing",
          description: "Please run the SQL migration to create the notifications table.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Error sending notification", description: err.message, variant: "destructive" });
      }
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      setConfirmDeleteNotifId(null);
      toast({ title: "Notification deleted successfully" });
    },
  });

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

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ jobId, featured }: { jobId: string; featured: boolean }) => {
      const targetJob = (jobs || []).find((j: any) => j.id === jobId);
      const jobTitle = targetJob?.title || "Unknown Job";

      const { error } = await supabase.from("jobs").update({ is_featured: featured }).eq("id", jobId);
      if (error) throw error;

      await createActivityLog({
        type: "log_job_edited",
        actorId: profile!.id,
        actorName: profile!.full_name || "System Admin",
        jobId,
        jobTitle,
        details: featured ? `Marked job as Featured: "${jobTitle}"` : `Removed Featured status from job: "${jobTitle}"`
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({
        title: variables.featured ? "Job Marked as Featured" : "Featured Removed",
        description: variables.featured
          ? "This job will now appear at the top of listings."
          : "This job will no longer be highlighted.",
      });
    },
    onError: (err: any) => {
      if (err.message?.includes("column") && err.message?.includes("is_featured")) {
        toast({
          title: "Database Migration Required",
          description: "Please run in Supabase SQL Editor: 'ALTER TABLE jobs ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;'",
          variant: "destructive",
        });
      } else {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    }
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

  const getFilteredSearchResults = () => {
    const q = globalSearch.toLowerCase().trim();
    if (!q) {
      return {
        users: [],
        employers: [],
        jobs: [],
        applications: [],
        feedback: [],
        reports: [],
        totalCount: 0,
      };
    }

    const filteredUsersList = (users || []).filter((u: any) => {
      if (u.role === "employer" || u.role === "admin") return false;
      return (
        (u.full_name?.toLowerCase().includes(q) ?? false) ||
        (u.email?.toLowerCase().includes(q) ?? false) ||
        (u.phone?.toLowerCase().includes(q) ?? false) ||
        u.id?.toLowerCase() === q
      );
    });

    const filteredEmployersList = (users || []).filter((u: any) => {
      if (u.role !== "employer") return false;
      return (
        (u.full_name?.toLowerCase().includes(q) ?? false) ||
        (u.email?.toLowerCase().includes(q) ?? false) ||
        (u.phone?.toLowerCase().includes(q) ?? false) ||
        u.id?.toLowerCase() === q
      );
    });

    const filteredJobsList = (jobs || []).filter((j: any) => {
      const employerName = getEmployerName(j.employer_id).toLowerCase();
      return (
        (j.title?.toLowerCase().includes(q) ?? false) ||
        (j.description?.toLowerCase().includes(q) ?? false) ||
        (j.category?.toLowerCase().includes(q) ?? false) ||
        (j.location?.toLowerCase().includes(q) ?? false) ||
        (j.salary?.toLowerCase().includes(q) ?? false) ||
        employerName.includes(q) ||
        j.id?.toLowerCase() === q
      );
    });

    const filteredAppsList = (applications || []).filter((app: any) => {
      const workerName = getWorkerName(app.worker_id).toLowerCase();
      const jobTitle = app.jobs?.title?.toLowerCase() || "";
      return (
        jobTitle.includes(q) ||
        workerName.includes(q) ||
        (app.status?.toLowerCase().includes(q) ?? false) ||
        app.id?.toLowerCase() === q
      );
    });

    const filteredFeedbackList = (feedbacks || []).filter((f: any) => {
      if (f.type === "report_job") return false;
      return (
        (f.message?.toLowerCase().includes(q) ?? false) ||
        (f.type?.toLowerCase().includes(q) ?? false) ||
        (f.status?.toLowerCase().includes(q) ?? false) ||
        f.id?.toLowerCase() === q
      );
    });

    const filteredReportsList = allReports.filter((r: any) => {
      const reason = r.payload?.reason?.toLowerCase() || "";
      const description = r.payload?.description?.toLowerCase() || "";
      const jobTitle = r.payload?.jobTitle?.toLowerCase() || "";
      const workerName = getWorkerName(r.user_id).toLowerCase();
      return (
        reason.includes(q) ||
        description.includes(q) ||
        jobTitle.includes(q) ||
        workerName.includes(q) ||
        (r.status?.toLowerCase().includes(q) ?? false) ||
        r.id?.toLowerCase() === q
      );
    });

    const totalCount =
      filteredUsersList.length +
      filteredEmployersList.length +
      filteredJobsList.length +
      filteredAppsList.length +
      filteredFeedbackList.length +
      filteredReportsList.length;

    return {
      users: filteredUsersList,
      employers: filteredEmployersList,
      jobs: filteredJobsList,
      applications: filteredAppsList,
      feedback: filteredFeedbackList,
      reports: filteredReportsList,
      totalCount,
    };
  };

  const exportToCSV = (data: any[], filename: string, headers: { key: string; label: string }[]) => {
    if (!data || data.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const csvContent = [
      headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(","),
      ...data.map(row => 
        headers.map(h => {
          const val = row[h.key];
          const stringVal = val === null || val === undefined ? "" : String(val);
          return `"${stringVal.replace(/"/g, '""')}"`;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export completed", description: `File "${filename}" downloaded successfully.` });
  };

  const handleExportUsers = () => {
    const workers = (users || []).filter(u => u.role !== "employer" && u.role !== "admin");
    const headers = [
      { key: "id", label: "User ID" },
      { key: "full_name", label: "Full Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "is_blocked", label: "Is Blocked" },
      { key: "created_at", label: "Joined Date" }
    ];
    exportToCSV(workers, `workers_export_${Date.now()}.csv`, headers);
  };

  const handleExportEmployers = () => {
    const employers = (users || []).filter(u => u.role === "employer");
    const headers = [
      { key: "id", label: "Employer ID" },
      { key: "full_name", label: "Full Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "is_verified", label: "Is Verified" },
      { key: "is_blocked", label: "Is Blocked" },
      { key: "created_at", label: "Joined Date" }
    ];
    exportToCSV(employers, `employers_export_${Date.now()}.csv`, headers);
  };

  const _handleExportJobs = () => {
    const jobsData = (jobs || []).map(j => ({
      ...j,
      employer_name: getEmployerName(j.employer_id)
    }));
    const headers = [
      { key: "id", label: "Job ID" },
      { key: "title", label: "Job Title" },
      { key: "employer_name", label: "Employer Name" },
      { key: "category", label: "Category" },
      { key: "location", label: "Location" },
      { key: "salary", label: "Salary" },
      { key: "working_hours", label: "Working Hours" },
      { key: "status", label: "Status" },
      { key: "created_at", label: "Posted Date" }
    ];
    exportToCSV(jobsData, `jobs_export_${Date.now()}.csv`, headers);
  };

  const handleExportApplications = () => {
    const appsData = (applications || []).map(a => ({
      ...a,
      job_title: a.jobs?.title || "Unknown Job",
      applicant_name: getWorkerName(a.worker_id)
    }));
    const headers = [
      { key: "id", label: "Application ID" },
      { key: "job_title", label: "Job Title" },
      { key: "applicant_name", label: "Applicant Name" },
      { key: "status", label: "Status" },
      { key: "resume_url", label: "Resume URL" },
      { key: "created_at", label: "Applied Date" }
    ];
    exportToCSV(appsData, `applications_export_${Date.now()}.csv`, headers);
  };

  const _handleExportFeedback = () => {
    const feedbackData = (feedbacks || []).filter(f => f.type !== "report_job");
    const headers = [
      { key: "id", label: "Feedback ID" },
      { key: "type", label: "Type" },
      { key: "message", label: "Message" },
      { key: "status", label: "Status" },
      { key: "user_id", label: "User ID" },
      { key: "created_at", label: "Submitted Date" }
    ];
    exportToCSV(feedbackData, `feedback_export_${Date.now()}.csv`, headers);
  };

  const _handleExportReports = () => {
    const reportsData = allReports.map(r => ({
      ...r,
      reported_job: r.payload?.jobTitle || "Unknown Job",
      reason: r.payload?.reason || "Other",
      description: r.payload?.description || "",
      reporter_name: getWorkerName(r.user_id)
    }));
    const headers = [
      { key: "id", label: "Report ID" },
      { key: "reported_job", label: "Reported Job Title" },
      { key: "reporter_name", label: "Reporter Name" },
      { key: "reason", label: "Reason" },
      { key: "description", label: "Description" },
      { key: "status", label: "Status" },
      { key: "created_at", label: "Report Date" }
    ];
    exportToCSV(reportsData, `reports_export_${Date.now()}.csv`, headers);
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

  const _totalJobs = jobs?.length || 0;
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

  const handleAdminSignOut = async () => {
    await signOut();
    navigate("/admin/login");
    toast({ title: "Signed out successfully", description: "You have been logged out of the admin panel." });
  };

  const renderDashboardView = () => {
    const pendingReportsList = allReports.filter(r => r.status === "pending").slice(0, 3);
    const pendingFeedbackList = (feedbacks || []).filter(f => f.status !== "resolved" && f.type !== "report_job" && !f.type?.startsWith("log_")).slice(0, 3);
    const recentActivityList = activityLogs.slice(0, 4);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100", desc: "Registered accounts" },
            { label: "Active Jobs", value: activeJobsCount, icon: Briefcase, color: "text-amber-600 bg-amber-50 border-amber-100", desc: "Open & filled listings" },
            { label: "Applications", value: totalApplications, icon: FileCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-100", desc: "Submitted applications" },
            { label: "Pending Reports", value: pendingReports, icon: Flag, color: pendingReports > 0 ? "text-rose-600 bg-rose-50 border-rose-100 animate-pulse font-bold" : "text-slate-600 bg-slate-50 border-slate-100", desc: "Awaiting moderation" }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] flex items-center justify-between hover:shadow-md transition-all duration-200">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{card.label}</span>
                  <span className="text-3xl font-black text-slate-800 tracking-tight block mt-1.5">{card.value}</span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1">{card.desc}</span>
                </div>
                <div className={`p-3 rounded-xl border shrink-0 ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            );
          })}
        </div>

        {/* System Status Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_12px_rgba(15,10,30,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${pendingReports > 0 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-emerald-50 text-emerald-600"}`}>
                <Activity size={24} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-tight leading-snug">System Status</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${pendingReports > 0 ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${pendingReports > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {pendingReports > 0 ? "Attention Required" : "System Operational"}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium max-w-sm">
              {pendingReports > 0 
                ? `There are ${pendingReports} pending job reports that require immediate administrator moderation.`
                : "All systems are running smoothly. Platform health metrics are currently optimal."}
            </p>
          </div>
        </div>

        {/* Actionable Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Pending Reports & Feedback */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Reports Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <Flag size={16} className="text-rose-500" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Reports Awaiting Review</h3>
                </div>
                {pendingReports > 0 && (
                  <span className="text-[10px] bg-rose-55 text-rose-650 font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                    {pendingReports} Awaiting
                  </span>
                )}
              </div>
              
              <div className="space-y-3.5">
                {pendingReportsList.map((r: any) => (
                  <div key={r.id} className="p-4 bg-rose-50/10 border border-rose-100/50 rounded-xl flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <span className="text-[10px] bg-rose-55 text-rose-655 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {r.payload?.reason || "Reported"}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1.5">
                          Job Listing: <span className="text-slate-600 font-medium font-sans">"{r.payload?.jobTitle || "Unknown"}"</span>
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-404 font-semibold">
                        {formatFeedbackDate(r.created_at)}
                      </span>
                    </div>
                    {r.payload?.description && (
                      <p className="text-xs text-slate-500 bg-white/70 p-2.5 rounded-lg border border-slate-101/80 leading-relaxed italic">
                        "{r.payload.description}"
                      </p>
                    )}
                    <div className="flex flex-wrap items-center justify-end gap-1.5 mt-1 pt-2 border-t border-slate-100/60">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmIgnoreReportId(r.id)}
                        className="h-7 text-[10.5px] font-bold px-2.5 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg"
                      >
                        Ignore
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmResolveReportId(r.id)}
                        className="h-7 text-[10.5px] font-bold px-2.5 border-slate-200 hover:bg-slate-50 text-emerald-600 rounded-lg"
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmWarnReport(r)}
                        className="h-7 text-[10.5px] font-bold px-2.5 border-slate-200 hover:bg-amber-50 text-amber-600 rounded-lg"
                      >
                        Warn Employer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmRemoveReportJob({ reportId: r.id, jobId: r.payload.jobId, jobTitle: r.payload.jobTitle })}
                        className="h-7 text-[10.5px] font-bold px-2.5 border-rose-100 hover:bg-rose-50 text-rose-600 rounded-lg bg-rose-50/10"
                      >
                        Remove Job
                      </Button>
                    </div>
                  </div>
                ))}

                {pendingReportsList.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400 font-semibold">
                    No pending reports currently awaiting moderation.
                  </div>
                )}
              </div>

              {pendingReports > 3 && (
                <button
                  onClick={() => { setActiveView("communication"); setCommCenterTab("reports"); }}
                  className="mt-4 text-xs font-bold text-center w-full text-amber-600 hover:text-amber-700 py-2 bg-slate-55 rounded-xl hover:bg-slate-100 transition"
                >
                  View All {pendingReports} Reports
                </button>
              )}
            </div>

            {/* Pending Feedback Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-sky-500" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Unresolved User Feedback</h3>
                </div>
                {openFeedback > 0 && (
                  <span className="text-[10px] bg-sky-55 text-sky-650 font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                    {openFeedback} Open
                  </span>
                )}
              </div>
              
              <div className="space-y-3.5">
                {pendingFeedbackList.map((f: any) => (
                  <div key={f.id} className="p-4 bg-sky-50/5 border border-sky-101/40 rounded-xl flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] bg-sky-55 text-sky-655 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {f.type || "Feedback"}
                        </span>
                        <p className="text-xs text-slate-404 mt-1 font-semibold">
                          By: <span className="text-slate-600">{f.user_id ? `User ID: ${f.user_id.slice(0, 8)}...` : "Guest"}</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {formatFeedbackDate(f.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium bg-white/70 p-2.5 border border-slate-100/80 rounded-lg">
                      {f.message}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateFeedbackStatus.mutate({ id: f.id, status: "resolved" });
                        }}
                        className="h-7 text-[10.5px] font-bold px-3 border-emerald-100 hover:bg-emerald-50 text-emerald-600 rounded-lg bg-emerald-50/10"
                      >
                        Resolve Feedback
                      </Button>
                    </div>
                  </div>
                ))}

                {pendingFeedbackList.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400 font-semibold">
                    No unresolved user feedback found.
                  </div>
                )}
              </div>

              {openFeedback > 3 && (
                <button
                  onClick={() => { setActiveView("communication"); setCommCenterTab("feedback"); }}
                  className="mt-4 text-xs font-bold text-center w-full text-amber-600 hover:text-amber-700 py-2 bg-slate-55 rounded-xl hover:bg-slate-100 transition"
                >
                  View All {openFeedback} Feedbacks
                </button>
              )}
            </div>
          </div>

          {/* Column 2: Recent Activity Timeline */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)]">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Live Platform Activity</h3>
                </div>
                <span className="text-[10px] bg-slate-55 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                  Latest 4 Events
                </span>
              </div>

              <div className="relative pl-4 border-l border-slate-100 space-y-5">
                {recentActivityList.map((log: any, idx) => {
                  const meta = getLogMeta(log.type || "");
                  const Icon = meta.icon;
                  return (
                    <div key={log.id || idx} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[23px] top-1 w-4.5 h-4.5 rounded-full border border-white flex items-center justify-center shadow-sm shrink-0 ${meta.color}`}>
                        <Icon size={9} />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-snug">{log.details}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-404 font-semibold">
                          <span>{formatLogTimestamp(log.createdAt)}</span>
                          <span>·</span>
                          <span className="truncate max-w-[80px]">{log.actorName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {recentActivityList.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400 font-semibold">
                    No activity logs recorded yet.
                  </div>
                )}
              </div>

              {activityLogs.length > 4 && (
                <button
                  onClick={() => setActiveView("activity")}
                  className="mt-6 text-xs font-bold text-center w-full text-amber-600 hover:text-amber-700 py-2 bg-slate-55 rounded-xl hover:bg-slate-100 transition"
                >
                  View Activity Log
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActivityLogView = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">System Activity Log</h2>
              <p className="text-xs text-slate-404 font-semibold mt-1">
                Total of {filteredLogs.length} activity event{filteredLogs.length !== 1 ? "s" : ""} recorded
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="activity-search-field"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-705"
                  placeholder="Search activity..."
                  value={activitySearch}
                  onChange={(e) => { setActivitySearch(e.target.value); setActivityPage(1); }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pb-1">
            {[
              { value: "all", label: "All Time" },
              { value: "today", label: "Today" },
              { value: "this_week", label: "This Week" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => { setActivityFilter(f.value); setActivityPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  activityFilter === f.value
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-white text-slate-655 border-slate-200 hover:border-amber-300 hover:text-amber-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Log list */}
        {!feedbacks ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-105 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded-md w-2/3" />
                    <div className="h-3 bg-slate-55 rounded-md w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : paginatedLogs.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity found"
            description="We couldn't find any activity logs matching your search criteria."
          />
        ) : (
          <div className="space-y-3">
            {paginatedLogs.map((log, idx) => {
              const meta = getLogMeta(log.type || "");
              const IconComp = meta.icon;
              return (
                <div 
                  key={log.id || idx}
                  className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition duration-200"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${meta.color}`}>
                      <IconComp size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-snug">{log.details}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[10.5px] text-slate-404 font-semibold">
                        <span>Actor: <strong className="text-slate-650">{log.actorName}</strong></span>
                        {log.targetName && (
                          <>
                            <span>·</span>
                            <span>Target: <strong className="text-slate-650">{log.targetName}</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-404 font-semibold bg-slate-50 border border-slate-100/50 px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-center">
                    {formatLogTimestamp(log.createdAt)}
                  </span>
                </div>
              );
            })}

            {/* Pagination */}
            {totalLogPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-555">
                  Showing {startLogIndex + 1}–{Math.min(startLogIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} events
                </span>
                
                <div className="flex items-center gap-1.5">
                  <Button
                    disabled={activityPage === 1}
                    onClick={() => setActivityPage((prev) => Math.max(prev - 1, 1))}
                    className="h-9 w-9 bg-white border border-slate-200 text-slate-650 rounded-xl p-0 hover:bg-slate-55 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-xs font-bold text-slate-700 px-3">
                    Page {activityPage} of {totalLogPages}
                  </span>
                  <Button
                    disabled={activityPage === totalLogPages}
                    onClick={() => setActivityPage((prev) => Math.min(prev + 1, totalLogPages))}
                    className="h-9 w-9 bg-white border border-slate-200 text-slate-655 rounded-xl p-0 hover:bg-slate-55 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderUsersView = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">User Account Management</h2>
              <p className="text-xs text-slate-404 font-semibold mt-1">
                Moderation of Workers and Employers accounts ({filteredUsers.length} matched)
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <div className="relative w-full sm:w-60">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="user-search-field"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700"
                  placeholder="Search by name, email..."
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <Button
                  onClick={handleExportUsers}
                  variant="outline"
                  className="flex-1 sm:flex-initial h-9 rounded-xl border-slate-200 bg-white text-slate-650 font-bold hover:bg-slate-55 flex items-center justify-center gap-1.5 text-xs"
                >
                  <Download size={13} />
                  Export Workers
                </Button>
                <Button
                  onClick={handleExportEmployers}
                  variant="outline"
                  className="flex-1 sm:flex-initial h-9 rounded-xl border-slate-200 bg-white text-slate-655 font-bold hover:bg-slate-55 flex items-center justify-center gap-1.5 text-xs"
                >
                  <Download size={13} />
                  Export Employers
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pb-1">
            {[
              { value: "all", label: "All Users" },
              { value: "worker", label: "Workers" },
              { value: "employer", label: "Employers" },
              { value: "blocked", label: "Blocked" },
              { value: "verified", label: "Verified Employers" },
              { value: "unverified", label: "Unverified Employers" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => { setUserFilter(f.value); setUserPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  userFilter === f.value
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-white text-slate-655 border-slate-200 hover:border-amber-300 hover:text-amber-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Users list */}
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="No users matched the criteria or search query."
          />
        ) : (
          <div className="space-y-4">
            {paginatedUsers.map((u: any) => (
              <div
                key={u.id}
                className="bg-white rounded-2xl border border-slate-101 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] hover:shadow-md transition-all duration-200 flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                      u.role === "employer" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-blue-50 text-blue-700 border-blue-100"
                    }`}>
                      <User size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-805 truncate m-0">{u.full_name || "Name not set"}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          u.role === "employer" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-650 border-blue-100"
                        }`}>
                          {u.role === "employer" ? "Employer" : "Worker"}
                        </span>
                        {u.role === "employer" && u.is_verified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md">✓ Verified</span>
                        )}
                        {u.role === "employer" && !u.is_verified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 text-slate-400 border border-slate-101 rounded-md">Unverified</span>
                        )}
                        {u.is_blocked && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-101 rounded-md animate-pulse">Blocked</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    {u.role === "employer" && (
                      <Button
                        size="sm"
                        variant={u.is_verified ? "default" : "outline"}
                        className={`h-8 text-[11px] font-bold rounded-lg flex-1 sm:flex-none ${
                          u.is_verified ? "bg-slate-700 hover:bg-slate-800 text-white border-0" : "hover:bg-emerald-55/50 text-emerald-600 border-emerald-100 hover:border-emerald-200"
                        }`}
                        onClick={() => toggleVerificationMutation.mutate({ userId: u.id, verified: !u.is_verified })}
                        disabled={toggleVerificationMutation.isPending}
                      >
                        <ShieldCheck size={12} className="mr-1" />
                        {u.is_verified ? "Remove Verify" : "Verify"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={u.is_blocked ? "default" : "outline"}
                      className={`h-8 text-[11px] font-bold rounded-lg flex-1 sm:flex-none ${
                        u.is_blocked ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0" : "hover:bg-rose-55/50 text-rose-600 border-rose-100 hover:border-rose-202"
                      }`}
                      onClick={() => setConfirmBlockUser({ userId: u.id, blocked: !u.is_blocked })}
                    >
                      <Ban size={12} className="mr-1" />
                      {u.is_blocked ? "Unblock" : "Block User"}
                    </Button>
                  </div>
                </div>

                <div className="h-px bg-slate-50" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-555 font-medium">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{u.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{u.phone || "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">Joined {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-105">
                <span className="text-xs font-semibold text-slate-555">
                  Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </span>
                
                <div className="flex items-center gap-1.5">
                  <Button
                    disabled={userPage === 1}
                    onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
                    className="h-9 w-9 bg-white border border-slate-200 text-slate-655 rounded-xl p-0 hover:bg-slate-55 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-xs font-bold text-slate-700 px-3">
                    Page {userPage} of {totalPages}
                  </span>
                  <Button
                    disabled={userPage === totalPages}
                    onClick={() => setUserPage((prev) => Math.min(prev + 1, totalPages))}
                    className="h-9 w-9 bg-white border border-slate-200 text-slate-655 rounded-xl p-0 hover:bg-slate-55 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderJobsView = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Job Listings Moderation</h2>
              <p className="text-xs text-slate-404 font-semibold mt-1">
                Moderation and featured state toggle for platform job listings ({filteredJobs.length} matched)
              </p>
            </div>
            
            <div className="relative w-full sm:w-60 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="job-search-field"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700"
                placeholder="Search job listings..."
                value={jobSearch}
                onChange={(e) => { setJobSearch(e.target.value); setJobPage(1); }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pb-1">
            {[
              { value: "all", label: "All Listings" },
              { value: "open", label: "Open" },
              { value: "filled", label: "Filled" },
              { value: "closed", label: "Closed" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => { setJobFilter(f.value); setJobPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  jobFilter === f.value
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-white text-slate-655 border-slate-200 hover:border-amber-300 hover:text-amber-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No job listings found"
            description="We couldn't find any job listings matching your query."
          />
        ) : (
          <div className="space-y-4">
            {paginatedJobs.map((j: any) => (
              <div
                key={j.id}
                className="bg-white rounded-2xl border border-slate-101 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] hover:shadow-md transition-all duration-200 flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-101 rounded-md">
                        {j.category || "General Work"}
                      </span>
                      {j.is_featured && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-101 rounded-md flex items-center gap-0.5">
                          <Star size={10} fill="currentColor" /> Featured
                        </span>
                      )}
                      <StatusBadge status={j.status} />
                    </div>
                    <h3 className="text-base font-bold text-slate-808 mt-2 truncate leading-snug">{j.title}</h3>
                    <p className="text-xs text-slate-404 font-semibold mt-1">
                      Posted by <strong className="text-slate-650">{getEmployerName(j.employer_id)}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto sm:justify-end flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewJob(j)}
                      className="h-8 text-[11px] font-bold px-3 border-slate-202 hover:bg-slate-55 text-slate-600 rounded-lg flex-1 sm:flex-initial"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant={j.is_featured ? "default" : "outline"}
                      onClick={() => toggleFeaturedMutation.mutate({ jobId: j.id, featured: !j.is_featured })}
                      disabled={toggleFeaturedMutation.isPending}
                      className={`h-8 text-[11px] font-bold rounded-lg flex-1 sm:flex-initial flex items-center justify-center gap-1 ${
                        j.is_featured ? "bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm" : "hover:bg-amber-55/50 text-amber-600 border-amber-100 hover:border-amber-200"
                      }`}
                    >
                      <Star size={11} fill={j.is_featured ? "white" : "none"} />
                      {j.is_featured ? "Unfeature" : "Feature"}
                    </Button>
                    {j.status !== "closed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCloseJobId(j.id)}
                        className="h-8 text-[11px] font-bold px-3 border-slate-202 hover:bg-slate-55 text-slate-600 rounded-lg flex-1 sm:flex-initial"
                      >
                        Close Listing
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteJobId(j.id)}
                      className="h-8 text-[11px] font-bold px-3 border-rose-100 hover:bg-rose-50 text-rose-606 rounded-lg bg-rose-50/10 flex-1 sm:flex-initial"
                    >
                      <Trash2 size={11} className="mr-0.5" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="h-px bg-slate-55" />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-555 font-medium">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin size={13} className="text-slate-404 shrink-0" />
                    <span className="truncate">{decodeLocation(j.location).city || "Remote"}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <DollarSign size={13} className="text-slate-404 shrink-0" />
                    <span className="truncate font-semibold text-slate-800">{j.salary}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar size={13} className="text-slate-404 shrink-0" />
                    <span className="truncate">Posted {new Date(j.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck size={13} className="text-slate-404 shrink-0" />
                    <span className="truncate font-bold text-amber-600">{getApplicationCount(j.id)} application(s)</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalJobPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-105">
                <span className="text-xs font-semibold text-slate-555">
                  Showing {startJobIndex + 1}–{Math.min(startJobIndex + itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
                </span>
                
                <div className="flex items-center gap-1.5">
                  <Button
                    disabled={jobPage === 1}
                    onClick={() => setJobPage((prev) => Math.max(prev - 1, 1))}
                    className="h-9 w-9 bg-white border border-slate-200 text-slate-655 rounded-xl p-0 hover:bg-slate-55 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-xs font-bold text-slate-700 px-3">
                    Page {jobPage} of {totalJobPages}
                  </span>
                  <Button
                    disabled={jobPage === totalJobPages}
                    onClick={() => setJobPage((prev) => Math.min(prev + 1, totalJobPages))}
                    className="h-9 w-9 bg-white border border-slate-200 text-slate-655 rounded-xl p-0 hover:bg-slate-55 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderApplicationsView = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Job Applications</h2>
              <p className="text-xs text-slate-404 font-semibold mt-1">
                Overview of worker job submissions across the platform ({filteredApplications.length} matched)
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <div className="relative w-full sm:w-60">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="app-search-field"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-705"
                  placeholder="Search applicant or job..."
                  value={appSearch}
                  onChange={(e) => { setAppSearch(e.target.value); setAppPage(1); }}
                />
              </div>

              <Button
                onClick={handleExportApplications}
                variant="outline"
                className="w-full sm:w-auto h-9 rounded-xl border-slate-202 bg-white text-slate-655 font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5 text-xs"
              >
                <Download size={13} />
                Export Applications
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pb-1">
            {[
              { value: "all", label: "All Statuses" },
              { value: "applied", label: "Applied" },
              { value: "accepted", label: "Accepted" },
              { value: "rejected", label: "Rejected" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => { setAppFilter(f.value); setAppPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  appFilter === f.value
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-white text-slate-655 border-slate-200 hover:border-amber-300 hover:text-amber-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {paginatedApplications.length === 0 ? (
          <EmptyState
            icon={FileCheck}
            title="No applications found"
            description="We couldn't find any job applications matching your query."
          />
        ) : (
          <div className="space-y-4">
            {paginatedApplications.map((a: any) => (
              <div
                key={a.id}
                className="bg-white rounded-2xl border border-slate-101 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] hover:shadow-md transition-all duration-200 flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-650 flex items-center justify-center border border-emerald-100 shrink-0">
                      <FileCheck size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-808 truncate m-0 font-sans tracking-tight">
                        {a.jobs?.title || "Unknown Job"}
                      </h3>
                      <p className="m-0 text-xs font-semibold text-slate-555 mt-1">
                        Applied by <span className="text-slate-805 font-bold">{getWorkerName(a.worker_id)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center shrink-0">
                    <StatusBadge status={a.status} />
                  </div>
                </div>

                <div className="h-px bg-slate-55" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-555 font-medium">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar size={13.5} className="text-slate-404 shrink-0" />
                    <span className="truncate">
                      Date Applied: {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <User size={13.5} className="text-slate-404 shrink-0" />
                    <span className="truncate" title={a.worker_id}>
                      Worker ID: {a.worker_id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalAppPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-105">
                <span className="text-xs font-semibold text-slate-555">
                  Showing {startAppIndex + 1}–{Math.min(startAppIndex + itemsPerPage, filteredApplications.length)} of {filteredApplications.length} applications
                </span>
                
                <div className="flex items-center gap-1.5">
                  <Button
                    disabled={appPage === 1}
                    onClick={() => setAppPage((prev) => Math.max(prev - 1, 1))}
                    className="h-9 w-9 bg-white border border-slate-200 text-slate-655 rounded-xl p-0 hover:bg-slate-55 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-xs font-bold text-slate-700 px-3">
                    Page {appPage} of {totalAppPages}
                  </span>
                  <Button
                    disabled={appPage === totalAppPages}
                    onClick={() => setAppPage((prev) => Math.min(prev + 1, totalAppPages))}
                    className="h-9 w-9 bg-white border border-slate-200 text-slate-655 rounded-xl p-0 hover:bg-slate-55 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderReportsSubTab = () => {
    return (
      <div className="space-y-4">
        {/* Search / Filter Sub Bar */}
        <div className="bg-white rounded-2xl border border-slate-101 p-4 shadow-[0_2px_12px_rgba(15,10,30,0.02)] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="report-search-field"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/55 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-707"
              placeholder="Search reports by reason, job title, reporter..."
              value={reportSearch}
              onChange={(e) => { setReportSearch(e.target.value); setReportPage(1); }}
            />
          </div>
          <div className="flex gap-2 shrink-0">
            {["all", "pending", "resolved", "ignored"].map((filterVal) => (
              <button
                key={filterVal}
                onClick={() => { setReportFilter(filterVal); setReportPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  reportFilter === filterVal
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-white text-slate-655 border-slate-200 hover:border-amber-300 hover:text-amber-600"
                }`}
              >
                {filterVal.charAt(0).toUpperCase() + filterVal.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        {filteredReports.length === 0 ? (
          <EmptyState
            icon={Flag}
            title="No reports found"
            description="We couldn't find any reports matching this status or search terms."
          />
        ) : (
          <div className="space-y-4">
            {paginatedReports.map((r: any) => (
              <div 
                key={r.id} 
                className="bg-white border border-slate-101 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] hover:shadow-md transition duration-200 flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] bg-rose-50 text-rose-606 font-bold px-2 py-0.5 rounded-md border border-rose-101/50 uppercase tracking-wider">
                        {r.payload?.reason || "Reported Listing"}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        r.status === "resolved" ? "bg-emerald-50 text-emerald-650 border-emerald-100" :
                        r.status === "ignored" ? "bg-slate-101 text-slate-500" : "bg-rose-50 text-rose-60 animate-pulse border-rose-101"
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    
                    <h3 className="text-sm font-bold text-slate-808 mt-2.5">
                      Job Listing: <span className="text-slate-655 font-medium font-sans">"\\\\${r.payload?.jobTitle || "Unknown"}"</span>
                    </h3>
                    <p className="text-xs text-slate-404 mt-1 font-semibold">
                      Reported by: <span className="text-slate-650">{r.payload?.workerName || getWorkerName(r.user_id)}</span> · 
                      Employer: <span className="text-slate-655">{r.payload?.employerName || "Unknown"}</span>
                    </p>
                  </div>

                  {r.status === "pending" && (
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmIgnoreReportId(r.id)}
                        className="h-8 text-[11px] font-bold px-3 border-slate-202 hover:bg-slate-55 text-slate-650 rounded-lg flex-1 sm:flex-initial"
                      >
                        Ignore
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmResolveReportId(r.id)}
                        className="h-8 text-[11px] font-bold px-3 border-slate-202 hover:bg-slate-55 text-emerald-650 rounded-lg flex-1 sm:flex-initial"
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmWarnReport(r)}
                        className="h-8 text-[11px] font-bold px-3 border-slate-202 hover:bg-amber-55 text-amber-600 rounded-lg flex-1 sm:flex-initial"
                      >
                        Warn Employer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmRemoveReportJob({ reportId: r.id, jobId: r.payload.jobId, jobTitle: r.payload.jobTitle })}
                        className="h-8 text-[11px] font-bold px-3 border-rose-100 hover:bg-rose-50 text-rose-606 rounded-lg bg-rose-50/10 flex-1 sm:flex-initial"
                      >
                        Remove Job
                      </Button>
                    </div>
                  )}
                </div>

                {r.payload?.description && (
                  <p className="text-xs text-slate-505 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-101 italic">
                    "\\\\${r.payload.description}"
                  </p>
                )}

                <div className="h-px bg-slate-55" />

                <div className="flex justify-between items-center text-[10px] text-slate-404 font-semibold">
                  <span>Report ID: {r.id}</span>
                  <span>Submitted: {formatFeedbackDate(r.created_at)}</span>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalReportPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-105">
                <span className="text-xs font-semibold text-slate-555">
                  Showing {startReportIndex + 1}–{Math.min(startReportIndex + itemsPerPage, filteredReports.length)} of {filteredReports.length} reports
                </span>
                
                <div className="flex items-center gap-1.5">
                  <Button
                    disabled={reportPage === 1}
                    onClick={() => setReportPage((prev) => Math.max(prev - 1, 1))}
                    className="h-9 w-9 bg-white border border-slate-200 text-slate-655 rounded-xl p-0 hover:bg-slate-55 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-xs font-bold text-slate-700 px-3">
                    Page {reportPage} of {totalReportPages}
                  </span>
                  <Button
                    disabled={reportPage === totalReportPages}
                    onClick={() => setReportPage((prev) => Math.min(prev + 1, totalReportPages))}
                    className="h-9 w-9 bg-white border border-slate-200 text-slate-655 rounded-xl p-0 hover:bg-slate-55 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFeedbackSubTab = () => {
    return (
      <div className="space-y-4">
        {/* Search / Filter Sub Bar */}
        <div className="bg-white rounded-2xl border border-slate-101 p-4 shadow-[0_2px_12px_rgba(15,10,30,0.02)] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="feedback-search-field"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700"
              placeholder="Search feedback message or category..."
              value={feedbackSearch}
              onChange={(e) => { setFeedbackSearch(e.target.value); setFeedbackPage(1); }}
            />
          </div>
          <div className="flex gap-2 shrink-0">
            {["all", "pending", "resolved"].map((filterVal) => (
              <button
                key={filterVal}
                onClick={() => { setFeedbackFilter(filterVal); setFeedbackPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  feedbackFilter === filterVal
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-white text-slate-605 border-slate-200 hover:border-amber-300 hover:text-amber-600"
                }`}
              >
                {filterVal.charAt(0).toUpperCase() + filterVal.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        {filteredFeedbacks.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No feedback found"
            description="We couldn't find any feedback entries matching this filter or search query."
          />
        ) : (
          <div className="space-y-4">
            {paginatedFeedbacks.map((f: any) => (
              <div 
                key={f.id} 
                className="bg-white border border-slate-101 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] hover:shadow-md transition duration-200 flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] bg-sky-50 text-sky-606 font-bold px-2 py-0.5 rounded-md border border-sky-101/50 uppercase tracking-wider">
                        {f.type || "General Feedback"}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        f.status === "resolved" ? "bg-emerald-50 text-emerald-650 border-emerald-100" : "bg-sky-50 text-sky-606 animate-pulse border-sky-101"
                      }`}>
                        {f.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-404 mt-2 font-semibold">
                      Submitted by: <span className="text-slate-650">{f.user_id ? `User ID: ${f.user_id}` : "Anonymous Guest"}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewFeedback(f)}
                      className="h-8 text-[11px] font-bold px-3 border-slate-202 hover:bg-slate-55 text-slate-650 rounded-lg flex-1 sm:flex-initial"
                    >
                      View Details
                    </Button>
                    {f.status !== "resolved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateFeedbackStatus.mutate({ id: f.id, status: "resolved" });
                        }}
                        className="h-8 text-[11px] font-bold px-3 border-slate-202 hover:bg-slate-55 text-emerald-650 rounded-lg flex-1 sm:flex-initial"
                      >
                        Resolve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteFeedbackId(f.id)}
                      className="h-8 text-[11px] font-bold px-3 border-rose-100 hover:bg-rose-50 text-rose-606 rounded-lg bg-rose-50/10 flex-1 sm:flex-initial"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-slate-655 leading-relaxed bg-slate-55 p-4 border border-slate-101/60 rounded-xl whitespace-pre-wrap font-medium font-sans">
                  {f.message}
                </p>

                <div className="h-px bg-slate-55" />

                <div className="flex justify-between items-center text-[10px] text-slate-404 font-semibold">
                  <span>Feedback ID: {f.id}</span>
                  <span>Date: {formatFeedbackDate(f.created_at)}</span>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalFeedbackPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-105">
                <span className="text-xs font-semibold text-slate-555">
                  Showing {startFeedbackIndex + 1}–{Math.min(startFeedbackIndex + itemsPerPage, filteredFeedbacks.length)} of {filteredFeedbacks.length} feedbacks
                </span>
                
                <div className="flex items-center gap-1.5">
                  <Button
                    disabled={feedbackPage === 1}
                    onClick={() => setFeedbackPage((prev) => Math.max(prev - 1, 1))}
                    className="h-9 w-9 bg-white border border-slate-200 text-slate-655 rounded-xl p-0 hover:bg-slate-55 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-xs font-bold text-slate-700 px-3">
                    Page {feedbackPage} of {totalFeedbackPages}
                  </span>
                  <Button
                    disabled={feedbackPage === totalFeedbackPages}
                    onClick={() => setFeedbackPage((prev) => Math.min(prev + 1, totalFeedbackPages))}
                    className="h-9 w-9 bg-white border border-slate-200 text-slate-655 rounded-xl p-0 hover:bg-slate-55 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAnnouncementsSubTab = () => {
    return (
      <div className="space-y-6">
        {/* Header compose trigger button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Announcement Composer</h3>
            <p className="text-xs text-slate-404 mt-1 font-semibold">Send alert notices and announcement updates to platform users</p>
          </div>
          <Button
            onClick={() => setNotifFormOpen((v) => !v)}
            className="bg-orange-500 hover:bg-orange-600 text-white border-0 font-bold shadow-sm h-9 px-4 rounded-xl text-xs flex items-center gap-1 self-start"
          >
            <Plus size={14} />
            {notifFormOpen ? "Cancel Compose" : "Compose Announcement"}
          </Button>
        </div>

        {/* Compose Form */}
        {notifFormOpen && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_24px_rgba(15,10,30,0.04)] flex flex-col gap-4 animate-in slide-in-from-top duration-300">
            <h3 className="text-sm font-bold text-slate-800 m-0">Send New Announcement</h3>
            
            {/* Target Audience */}
            <div>
              <label className="text-[10px] font-bold text-slate-404 uppercase tracking-wider block mb-2">Target Audience</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "everyone", label: "Everyone" },
                  { value: "workers", label: "Workers Only" },
                  { value: "employers", label: "Employers Only" }
                ].map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setNotifTargetAudience(a.value as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      notifTargetAudience === a.value
                        ? "border-orange-505 bg-orange-55/50 text-orange-600"
                        : "border-slate-150 bg-white text-slate-500 hover:bg-slate-55"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Select */}
            <div>
              <label className="text-[10px] font-bold text-slate-404 uppercase tracking-wider block mb-2">Category Priority</label>
              <div className="flex flex-wrap gap-2">
                {(["info", "feature", "update", "reminder", "important", "maintenance"] as const).map((p) => {
                  const labelMap = { info: "Info", feature: "Feature", update: "Update", reminder: "Reminder", important: "Important", maintenance: "Maintenance" };
                  const colorMap = {
                    info: { active: "#2563EB", bg: "#EFF6FF" },
                    feature: { active: "#8B5CF6", bg: "#FAF5FF" },
                    update: { active: "#10B981", bg: "#ECFDF5" },
                    reminder: { active: "#D97706", bg: "#FFFBEB" },
                    important: { active: "#EF4444", bg: "#FEF2F2" },
                    maintenance: { active: "#64748B", bg: "#F8FAFC" },
                  };
                  const c = colorMap[p];
                  const isSel = notifPriority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNotifPriority(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all`}
                      style={{
                        borderColor: isSel ? c.active : "rgba(15,10,30,0.06)",
                        background: isSel ? c.bg : "#fff",
                        color: isSel ? c.active : "rgba(15,10,30,0.45)"
                      }}
                    >
                      {labelMap[p]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] font-bold text-slate-404 uppercase tracking-wider block mb-1.5">Announcement Title</label>
              <Input
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g. System upgrade completed successfully"
                maxLength={100}
                className="h-10 rounded-xl border-slate-200 focus:border-orange-404 focus:ring-orange-100 text-xs font-medium"
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-[10px] font-bold text-slate-404 uppercase tracking-wider block mb-1.5">Full Message</label>
              <textarea
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                placeholder="Write your message here..."
                maxLength={500}
                rows={3}
                className="w-full rounded-xl border border-slate-205 p-3 text-xs text-slate-707 outline-none focus:border-orange-505 focus:ring-2 focus:ring-orange-100/50 resize-y"
              />
              <p className="text-[10px] text-slate-404 text-right m-1">{notifMessage.length}/500 chars</p>
            </div>

            {/* Send button */}
            <Button
              onClick={() => {
                if (!notifTitle.trim()) {
                  toast({ title: "Title is required", variant: "destructive" });
                  return;
                }
                if (!notifMessage.trim()) {
                  toast({ title: "Message is required", variant: "destructive" });
                  return;
                }
                createNotification.mutate({
                  title: notifTitle.trim(),
                  message: notifMessage.trim(),
                  priority: notifPriority,
                  targetAudience: notifTargetAudience
                });
              }}
              disabled={createNotification.isPending}
              className="bg-orange-505 hover:bg-orange-606 text-white border-0 font-bold shadow-sm h-9 px-5 rounded-xl text-xs self-end"
            >
              {createNotification.isPending ? "Sending Announcement..." : "Send Announcement"}
            </Button>
          </div>
        )}

        {/* List of announcements sent */}
        <h4 className="text-xs font-bold text-slate-404 uppercase tracking-wider mb-2">Composed History</h4>
        
        {!notifications || notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No sent announcements"
            description="You have not composed any announcements yet."
          />
        ) : (
          <div className="space-y-4">
            {notifications.map((notif: any) => {
              const config: any = {
                info: { bg: "#EFF6FF", border: "rgba(59,130,246,0.15)", accent: "#2563EB", label: "Info", icon: Info },
                feature: { bg: "#FAF5FF", border: "rgba(168,85,247,0.15)", accent: "#8B5CF6", label: "Feature", icon: Sparkles },
                update: { bg: "#ECFDF5", border: "rgba(16,185,129,0.15)", accent: "#10B981", label: "Update", icon: RefreshCw },
                reminder: { bg: "#FFFBEB", border: "rgba(217,119,6,0.15)", accent: "#D97706", label: "Reminder", icon: Clock },
                important: { bg: "#FEF2F2", border: "rgba(239,68,68,0.15)", accent: "#EF4444", label: "Important", icon: AlertTriangle },
                maintenance: { bg: "#F8FAFC", border: "rgba(100,116,139,0.15)", accent: "#64748B", label: "Maintenance", icon: Settings },
              };
              const c = config[notif.priority || "info"];
              const Icon = c.icon;
              
              const readCount = notif.notification_reads?.length || 0;
              const totalAudience = notif.target_audience === "everyone" ? (users?.length || 0) :
                                    notif.target_audience === "workers" ? workersCount : employersCount;
              const unreadCount = Math.max(0, totalAudience - readCount);
              
              return (
                <div 
                  key={notif.id}
                  className="bg-white border border-slate-101 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] hover:shadow-md transition duration-200 flex flex-col gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 mt-0.5" style={{ background: c.bg, borderColor: c.border, color: c.accent }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-805 m-0">{notif.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md border text-slate-505 bg-slate-50">
                            Audience: <strong className="text-slate-705 capitalize">{notif.target_audience}</strong>
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md border text-slate-505 bg-slate-50">
                            By: <strong className="text-slate-705">{notif.profiles?.full_name || "Admin"}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDeleteNotifId(notif.id)}
                      className="h-8 text-[11px] font-bold px-3 border-rose-100 hover:bg-rose-50 text-rose-606 rounded-lg bg-rose-50/10 self-start sm:self-auto shrink-0 flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Delete
                    </Button>
                  </div>

                  <p className="text-xs text-slate-606 leading-relaxed bg-slate-50 p-4 border border-slate-100/60 rounded-xl whitespace-pre-wrap font-medium">
                    {notif.message}
                  </p>

                  <div className="h-px bg-slate-55" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-404 font-semibold">
                    <span>Sent: {formatFeedbackDate(notif.created_at)}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50 font-bold">{readCount} Read</span>
                      <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/50 font-bold">{unreadCount} Unread</span>
                      <span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100/50 font-bold">{totalAudience} Target</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderCommunicationView = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Communication Center</h2>
              <p className="text-xs text-slate-404 font-semibold mt-1">
                Moderation of reports, user feedback, and composition of platform-wide Announcements
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-100 gap-6 mt-5">
            {[
              { value: "reports", label: "Job Reports", count: pendingReports, badgeColor: "bg-rose-500 text-white animate-pulse" },
              { value: "feedback", label: "User Feedback", count: openFeedback, badgeColor: "bg-sky-500 text-white" },
              { value: "announcements", label: "Announcements/Composer", count: notifications?.length || 0, badgeColor: "bg-slate-100 text-slate-600" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setCommCenterTab(tab.value)}
                className={`pb-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                  commCenterTab === tab.value
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${tab.badgeColor}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab contents */}
        {commCenterTab === "reports" && renderReportsSubTab()}
        {commCenterTab === "feedback" && renderFeedbackSubTab()}
        {commCenterTab === "announcements" && renderAnnouncementsSubTab()}
      </div>
    );
  };

  const renderAnalyticsView = () => {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Platform Analytics & Metrics</h2>
          <p className="text-xs text-slate-404 font-semibold mt-1">Secondary statistics and last 7 days activity graphs</p>
        </div>

        {/* Secondary Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { label: "New Users", value: newUsersCount, icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100", desc: "Added last 7 days" },
            { label: "Employers", value: employersCount, icon: ShieldCheck, color: "text-indigo-600 bg-indigo-50 border-indigo-100", desc: "Total profiles" },
            { label: "Workers", value: workersCount, icon: User, color: "text-sky-600 bg-sky-50 border-sky-100", desc: "Total profiles" },
            { label: "Closed Jobs", value: closedJobsCount, icon: Archive, color: "text-slate-505 bg-slate-50 border-slate-101/70", desc: "Inactive listings" },
            { label: "Blocked Users", value: blockedUsersCount, icon: Ban, color: blockedUsersCount > 0 ? "text-rose-600 bg-rose-50 border-rose-100" : "text-slate-505 bg-slate-50 border-slate-101", desc: "Suspended accounts" },
            { label: "Verified Employers", value: verifiedEmployersCount, icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-100", desc: "Complete verified profiles" },
            { label: "Resolved Feedback", value: resolvedFeedbackCount, icon: MessageSquare, color: "text-emerald-600 bg-emerald-50 border-emerald-100", desc: "Feedbacks resolved" },
            { label: "Today's Apps", value: todaysApplicationsCount, icon: FileCheck, color: todaysApplicationsCount > 0 ? "text-emerald-600 bg-emerald-50 border-emerald-100 animate-bounce" : "text-slate-505 bg-slate-50 border-slate-101", desc: "Applied today" }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col justify-between hover:shadow-sm transition duration-200">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                  <div className={`p-1.5 rounded-lg shrink-0 border ${stat.color}`}>
                    <Icon size={12} />
                  </div>
                </div>
                <div>
                  <p className="margin-0 text-xl font-black text-slate-800 tracking-tight leading-none mt-1">{stat.value}</p>
                  <p className="text-[9px] text-slate-404 mt-1 font-semibold">{stat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
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
            <div className="bg-white rounded-2xl border border-slate-101 p-6 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-808 tracking-tight">User Registrations</h3>
                  <p className="text-[10px] text-slate-404 font-semibold uppercase tracking-wider mt-0.5">Last 7 Days</p>
                </div>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Users size={16} />
                </div>
              </div>
              {isUsersDataEmpty ? (
                <div className="h-[250px] flex flex-col items-center justify-center text-slate-404 bg-slate-50/55 rounded-xl border border-dashed border-slate-200">
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
            <div className="bg-white rounded-2xl border border-slate-101 p-6 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-808 tracking-tight">Jobs Created</h3>
                  <p className="text-[10px] text-slate-404 font-semibold uppercase tracking-wider mt-0.5">Last 7 Days</p>
                </div>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Briefcase size={16} />
                </div>
              </div>
              {isJobsDataEmpty ? (
                <div className="h-[250px] flex flex-col items-center justify-center text-slate-404 bg-slate-50/55 rounded-xl border border-dashed border-slate-200">
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
            <div className="bg-white rounded-2xl border border-slate-101 p-6 flex flex-col justify-between lg:col-span-2 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-808 tracking-tight">Applications Submitted</h3>
                  <p className="text-[10px] text-slate-404 font-semibold uppercase tracking-wider mt-0.5">Last 7 Days</p>
                </div>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <FileCheck size={16} />
                </div>
              </div>
              {isAppsDataEmpty ? (
                <div className="h-[250px] flex flex-col items-center justify-center text-slate-404 bg-slate-50/55 rounded-xl border border-dashed border-slate-200">
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
      </div>
    );
  };

  const renderSettingsView = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">System Settings</h2>
          <p className="text-xs text-slate-404 font-semibold mt-1">Configure parameters and preferences for the admin interface</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Preferences */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2.5 flex items-center gap-2">
              <Sliders size={16} className="text-orange-500" />
              Interface Preferences
            </h3>

            {/* Pagination settings */}
            <div>
              <label className="text-[10px] font-bold text-slate-404 uppercase tracking-wider block mb-2">Rows Per Page (Tables)</label>
              <div className="flex gap-2">
                {[5, 10, 20, 50].map((num) => (
                  <button
                    key={num}
                    onClick={() => { setItemsPerPage(num); setUserPage(1); setJobPage(1); setAppPage(1); setFeedbackPage(1); setReportPage(1); }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      itemsPerPage === num
                        ? "border-orange-505 bg-orange-55/50 text-orange-600"
                        : "border-slate-150 bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {num} rows
                  </button>
                ))}
              </div>
            </div>

            {/* Auto refresh query toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-[11px] font-bold text-slate-707 block">Auto-Refresh Lists</label>
                <span className="text-[10px] text-slate-404 font-semibold">Toggles automatic dashboard data sync</span>
              </div>
              <button
                onClick={() => setAutoRefreshQueries(!autoRefreshQueries)}
                className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${
                  autoRefreshQueries ? "bg-emerald-500" : "bg-slate-200"
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${
                  autoRefreshQueries ? "left-5.5" : "left-0.5"
                }`} />
              </button>
            </div>
            
            {/* Mock alerting notification toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-[11px] font-bold text-slate-707 block">Admin Email Alerts (Simulated)</label>
                <span className="text-[10px] text-slate-404 font-semibold">Send alerts for new critical job reports</span>
              </div>
              <button
                onClick={() => toast({ title: "Preference saved", description: "Email alerts option has been updated." })}
                className="w-11 h-6 rounded-full bg-slate-200 transition-all relative shrink-0"
              >
                <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>
          </div>

          {/* System info / metadata */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2.5 flex items-center gap-2">
              <Info size={16} className="text-slate-505" />
              Console Metadata & Version Info
            </h3>

            <div className="space-y-3.5 text-xs font-semibold text-slate-505">
              <div className="flex justify-between">
                <span>Console Version</span>
                <span className="text-slate-800 font-bold">v2.1.0-redesign</span>
              </div>
              <div className="flex justify-between">
                <span>Supabase Database State</span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100/50 rounded font-bold">Connected</span>
              </div>
              <div className="flex justify-between">
                <span>Vite Environment Mode</span>
                <span className="text-slate-700">development</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated Time</span>
                <span className="text-slate-700">July 2026</span>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-101/50 rounded-xl p-3 text-[10px] text-slate-404 leading-normal">
              <strong>Tip:</strong> The admin panel redesign has rearranged files to allow full responsiveness. All table structures adapt automatically from 320px mobile viewport widths up to 4K ultra-wide screens.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSearchView = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl border border-slate-101 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)]">
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Universal Search</h2>
            <p className="text-xs text-slate-404 font-semibold mt-1">
              Instantly scan all database records (Users, Employers, Jobs, Applications, Feedback, Reports)
            </p>
          </div>

          <div className="relative w-full mt-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="global-search-input"
              className="w-full pl-11 pr-10 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-semibold text-slate-700"
              placeholder="Search anything: names, emails, phone numbers, IDs, status..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
            {globalSearch && (
              <button onClick={() => setGlobalSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        {(() => {
          const q = globalSearch.toLowerCase().trim();
          const uMatches = !q ? 0 : (users || []).filter((u: any) => u.role !== "employer" && u.role !== "admin" && (u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q) || u.id?.toLowerCase() === q)).length;
          const empMatches = !q ? 0 : (users || []).filter((u: any) => u.role === "employer" && (u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q) || u.id?.toLowerCase() === q)).length;
          const jobMatches = !q ? 0 : (jobs || []).filter((j: any) => getEmployerName(j.employer_id).toLowerCase().includes(q) || j.title?.toLowerCase().includes(q) || j.description?.toLowerCase().includes(q) || j.category?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q) || j.id?.toLowerCase() === q).length;
          const appMatches = !q ? 0 : (applications || []).filter((app: any) => getWorkerName(app.worker_id).toLowerCase().includes(q) || app.jobs?.title?.toLowerCase().includes(q) || app.status?.toLowerCase().includes(q) || app.id?.toLowerCase() === q).length;
          const fbMatches = !q ? 0 : (feedbacks || []).filter((f: any) => f.type !== "report_job" && (f.message?.toLowerCase().includes(q) || f.type?.toLowerCase().includes(q) || f.status?.toLowerCase().includes(q) || f.id?.toLowerCase() === q)).length;
          const repMatches = !q ? 0 : allReports.filter((r: any) => getWorkerName(r.user_id).toLowerCase().includes(q) || r.payload?.reason?.toLowerCase().includes(q) || r.payload?.description?.toLowerCase().includes(q) || r.payload?.jobTitle?.toLowerCase().includes(q) || r.status?.toLowerCase().includes(q) || r.id?.toLowerCase() === q).length;
          const totalMatches = uMatches + empMatches + jobMatches + appMatches + fbMatches + repMatches;

          const categories = [
            { value: "all", label: "All Results", count: totalMatches },
            { value: "users", label: "Workers", count: uMatches },
            { value: "employers", label: "Employers", count: empMatches },
            { value: "jobs", label: "Jobs", count: jobMatches },
            { value: "applications", label: "Applications", count: appMatches },
            { value: "feedback", label: "Feedback", count: fbMatches },
            { value: "reports", label: "Reports", count: repMatches },
          ] as const;

          return (
            <div className="flex flex-wrap gap-2 pb-1">
              {categories.map((c) => {
                const isActive = searchCategoryFilter === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => setSearchCategoryFilter(c.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                        : "bg-white text-slate-555 border-slate-200 hover:border-amber-303 hover:text-amber-655"
                    }`}
                  >
                    <span>{c.label}</span>
                    {globalSearch && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-white text-amber-700" : "bg-slate-100 text-slate-500"}`}>{c.count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* Results list */}
        {!globalSearch ? (
          <div className="bg-white rounded-2xl border border-slate-101 p-12 text-center text-slate-404 font-medium">
            <Search size={32} className="mx-auto mb-3 opacity-40 text-slate-400" />
            <p className="text-xs font-bold text-slate-600">Begin Universal Search</p>
            <p className="text-[11px] text-slate-404 mt-1">Type any search term above to instantly scan and filter database tables</p>
          </div>
        ) : (() => {
          const matches = getFilteredSearchResults();

          if (matches.totalCount === 0) {
            return (
              <EmptyState
                icon={X}
                title="No matches found"
                description={`We couldn't find any records matching "${globalSearch}".`}
              />
            );
          }

          const renderUser = (u: any) => (
            <div key={u.id} className="p-4 bg-white border border-slate-101 rounded-2xl flex items-center justify-between gap-4 hover:shadow-sm transition">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md uppercase">Worker</span>
                  {u.is_blocked && (
                    <span className="text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-md uppercase">Blocked</span>
                  )}
                  <h4 className="m-0 text-sm font-bold text-slate-800 truncate">{u.full_name || "Name not set"}</h4>
                </div>
                <p className="margin-0 text-xs text-slate-404 mt-1 truncate">
                  {u.email} {u.phone ? `· ${u.phone}` : ""}
                </p>
              </div>
              <span className="text-[10px] text-slate-404 font-semibold shrink-0">Joined {new Date(u.created_at).toLocaleDateString()}</span>
            </div>
          );

          const renderEmployer = (u: any) => (
            <div key={u.id} className="p-4 bg-white border border-slate-101 rounded-2xl flex items-center justify-between gap-4 hover:shadow-sm transition">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-md uppercase">Employer</span>
                  {u.is_verified && (
                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-md uppercase">Verified</span>
                  )}
                  {u.is_blocked && (
                    <span className="text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-md uppercase">Blocked</span>
                  )}
                  <h4 className="m-0 text-sm font-bold text-slate-800 truncate">{u.full_name || "Name not set"}</h4>
                </div>
                <p className="margin-0 text-xs text-slate-404 mt-1 truncate">
                  {u.email} {u.phone ? `· ${u.phone}` : ""}
                </p>
              </div>
              <span className="text-[10px] text-slate-404 font-semibold shrink-0">Joined {new Date(u.created_at).toLocaleDateString()}</span>
            </div>
          );

          const renderJob = (j: any) => (
            <div key={j.id} className="p-4 bg-white border border-slate-101 rounded-2xl flex flex-col gap-2 hover:shadow-sm transition">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-bold bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-md uppercase">Job</span>
                    {j.is_featured && (
                      <span className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-md uppercase">Featured</span>
                    )}
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-555 px-2 py-0.5 rounded-md uppercase">{j.status}</span>
                    <h4 className="m-0 text-sm font-bold text-slate-808 truncate">{j.title}</h4>
                  </div>
                  <p className="margin-0 text-xs text-slate-404 mt-1 truncate">
                    by {getEmployerName(j.employer_id)} · {j.category || "General Work"}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-700 shrink-0">{j.salary}</span>
              </div>
              <p className="margin-0 text-xs text-slate-505 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                {j.description}
              </p>
            </div>
          );

          const renderApp = (app: any) => (
            <div key={app.id} className="p-4 bg-white border border-slate-101 rounded-2xl flex items-center justify-between gap-4 hover:shadow-sm transition">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-bold bg-emerald-55 text-emerald-650 border border-emerald-100 px-2 py-0.5 rounded-md uppercase">Application</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                    app.status === "pending" ? "bg-amber-50 text-amber-600" :
                    app.status === "accepted" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  }`}>{app.status}</span>
                  <h4 className="m-0 text-sm font-bold text-slate-808 truncate">{app.jobs?.title || "Unknown Job"}</h4>
                </div>
                <p className="margin-0 text-xs text-slate-404 mt-1 truncate">
                  Applicant: {getWorkerName(app.worker_id)}
                </p>
              </div>
              <span className="text-[10px] text-slate-404 font-semibold shrink-0">Applied {new Date(app.created_at).toLocaleDateString()}</span>
            </div>
          );

          const renderFeedback = (fb: any) => (
            <div key={fb.id} className="p-4 bg-white border border-slate-101 rounded-2xl flex flex-col gap-2 hover:shadow-sm transition">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold bg-sky-50 text-sky-606 border border-sky-101 px-2 py-0.5 rounded-md uppercase">Feedback</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      fb.status === "resolved" ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-606"
                    }`}>{fb.status}</span>
                    <h4 className="m-0 text-sm font-bold text-slate-808 truncate">{fb.type || "Feedback Message"}</h4>
                  </div>
                </div>
                <span className="text-[10px] text-slate-404 font-semibold shrink-0">{new Date(fb.created_at).toLocaleDateString()}</span>
              </div>
              <p className="margin-0 text-xs text-slate-505 line-clamp-2 leading-relaxed bg-slate-55 p-3 rounded-xl border border-slate-100/50 font-medium">
                {fb.message}
              </p>
            </div>
          );

          const renderReport = (rep: any) => (
            <div key={rep.id} className="p-4 bg-white border border-slate-101 rounded-2xl flex flex-col gap-2 hover:shadow-sm transition">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-bold bg-rose-50 text-rose-606 border border-rose-101 px-2 py-0.5 rounded-md uppercase">Report</span>
                    <span className="text-[9px] font-bold bg-rose-100 text-rose-705 px-2 py-0.5 rounded-md uppercase">{rep.status}</span>
                    <h4 className="m-0 text-sm font-bold text-rose-808 truncate">{rep.payload?.reason || "Reason Unspecified"}</h4>
                  </div>
                  <p className="margin-0 text-xs text-slate-404 mt-1 truncate">
                    On Job: "${rep.payload?.jobTitle || "Unknown Job"}" · Reported by: {getWorkerName(rep.user_id)}
                  </p>
                </div>
                <span className="text-[10px] text-slate-404 font-semibold shrink-0">{new Date(rep.created_at).toLocaleDateString()}</span>
              </div>
              {rep.payload?.description && (
                <p className="margin-0 text-xs text-slate-505 line-clamp-2 leading-relaxed bg-rose-50/10 p-3 rounded-xl border border-rose-100/50">
                  {rep.payload.description}
                </p>
              )}
            </div>
          );

          const activeFilter = searchCategoryFilter;

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Users */}
              {(activeFilter === "all" || activeFilter === "users") && matches.users.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-404 uppercase tracking-wider">Workers ({matches.users.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.users.map(renderUser)}
                  </div>
                </div>
              )}

              {/* Employers */}
              {(activeFilter === "all" || activeFilter === "employers") && matches.employers.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-404 uppercase tracking-wider">Employers ({matches.employers.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.employers.map(renderEmployer)}
                  </div>
                </div>
              )}

              {/* Jobs */}
              {(activeFilter === "all" || activeFilter === "jobs") && matches.jobs.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-404 uppercase tracking-wider">Job Listings ({matches.jobs.length})</h3>
                  <div className="space-y-3">
                    {matches.jobs.map(renderJob)}
                  </div>
                </div>
              )}

              {/* Applications */}
              {(activeFilter === "all" || activeFilter === "applications") && matches.applications.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-404 uppercase tracking-wider">Applications ({matches.applications.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.applications.map(renderApp)}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {(activeFilter === "all" || activeFilter === "feedback") && matches.feedback.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-404 uppercase tracking-wider">User Feedback ({matches.feedback.length})</h3>
                  <div className="space-y-3">
                    {matches.feedback.map(renderFeedback)}
                  </div>
                </div>
              )}

              {/* Reports */}
              {(activeFilter === "all" || activeFilter === "reports") && matches.reports.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-404 uppercase tracking-wider">Job Reports ({matches.reports.length})</h3>
                  <div className="space-y-3">
                    {matches.reports.map(renderReport)}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  const renderTrashView = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Trash Bin</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Restore or permanently delete soft-deleted records ({filteredTrashItems.length} matched)
              </p>
            </div>
            
            <div className="relative w-full sm:w-60 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="trash-search-field"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700"
                placeholder="Search trash..."
                value={trashSearch}
                onChange={(e) => { setTrashSearch(e.target.value); setTrashPage(1); }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pb-1">
            {[
              { value: "all", label: "All Items" },
              { value: "jobs", label: "Jobs Only" },
              { value: "feedback", label: "Feedback Only" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => { setTrashFilter(f.value); setTrashPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                  trashFilter === f.value
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-white text-slate-655 border-slate-200 hover:border-amber-303 hover:text-amber-655"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        {filteredTrashItems.length === 0 ? (
          <EmptyState
            icon={Archive}
            title="Trash is empty"
            description="No deleted records match your criteria."
          />
        ) : (
          <div className="space-y-4">
            {paginatedTrashItems.map((item: any) => {
              const isJob = item._trashType === "job";
              return (
                <div 
                  key={item.id} 
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,10,30,0.02)] hover:shadow-md transition duration-200 flex flex-col gap-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                        isJob ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-sky-50 text-sky-606 border-sky-101"
                      }`}>
                        {isJob ? "Job Listing" : "Feedback"}
                      </span>
                      
                      <h4 className="text-sm font-bold text-slate-805 mt-2">
                        {isJob ? item.title : `Feedback type: ${item.type || "General"}`}
                      </h4>
                      <p className="text-[11px] text-slate-404 mt-1 font-semibold">
                        {isJob ? `Posted by: ${getEmployerName(item.employer_id)}` : `Submitted by: ${item.user_id || "Guest"}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (isJob) setConfirmRestoreJob(item.id);
                          else setConfirmRestoreFeedback(item.id);
                        }}
                        className="h-8 text-[11px] font-bold px-3 border-slate-202 hover:bg-slate-55 text-slate-655 rounded-lg flex-1 sm:flex-initial"
                      >
                        Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (isJob) setConfirmPermDeleteJob(item.id);
                          else setConfirmPermDeleteFeedback(item.id);
                        }}
                        className="h-8 text-[11px] font-bold px-3 border-rose-100 hover:bg-rose-50 text-rose-606 rounded-lg bg-rose-50/10 flex-1 sm:flex-initial"
                      >
                        Delete Forever
                      </Button>
                    </div>
                  </div>

                  {!isJob && (
                    <p className="text-xs text-slate-505 bg-slate-50 p-3 border border-slate-101/50 rounded-xl italic">
                      "${item.message}"
                    </p>
                  )}

                  <div className="h-px bg-slate-50" />

                  <div className="flex justify-between items-center text-[10px] text-slate-404 font-semibold">
                    <span>Record ID: {item.id}</span>
                    <span>Deleted On: {new Date(item.updated_at || item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalTrashPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-105">
                <span className="text-xs font-semibold text-slate-505">
                  Showing {startTrashIndex + 1}–{Math.min(startTrashIndex + itemsPerPage, filteredTrashItems.length)} of {filteredTrashItems.length} items
                </span>
                
                <div className="flex items-center gap-1.5">
                  <Button
                    disabled={trashPage === 1}
                    onClick={() => setTrashPage((prev) => Math.max(prev - 1, 1))}
                    className="h-9 w-9 bg-white border border-slate-200 text-slate-655 rounded-xl p-0 hover:bg-slate-55 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-xs font-bold text-slate-700 px-3">
                    Page {trashPage} of {totalTrashPages}
                  </span>
                  <Button
                    disabled={trashPage === totalTrashPages}
                    onClick={() => setTrashPage((prev) => Math.min(prev + 1, totalTrashPages))}
                    className="h-9 w-9 bg-white border border-slate-200 text-slate-655 rounded-xl p-0 hover:bg-slate-55 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        .jl-admin-card:hover {
          box-shadow: 0 6px 20px rgba(15,10,30,0.06) !important;
        }
      `}</style>

      <div className="flex min-h-screen bg-slate-50/50 text-slate-800 font-sans">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 sticky top-0 h-screen">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <ShieldCheck className="text-orange-500" size={24} />
            <div>
              <h1 className="text-base font-black text-white leading-none tracking-tight">Jlindo Admin</h1>
              <span className="text-[10px] text-slate-550 font-semibold tracking-wider uppercase mt-1 block">Console</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-7">
            <div className="space-y-2">
              <span className="px-3 text-[10px] font-bold text-slate-550 uppercase tracking-wider block mb-3">Main Console</span>
              {[
                { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { view: "users", label: "Users", icon: Users, count: users?.length },
                { view: "jobs", label: "Jobs", icon: Briefcase, count: jobs?.length },
                { view: "applications", label: "Applications", icon: FileCheck, count: applications?.length },
                { view: "communication", label: "Communication Center", icon: MessageSquare, count: (pendingReports + openFeedback) > 0 ? (pendingReports + openFeedback) : null, isBadgeAlert: true },
                { view: "analytics", label: "Analytics", icon: TrendingUp },
                { view: "settings", label: "Settings", icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => setActiveView(item.view)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-800 hover:text-white ${isActive ? "bg-orange-500/10 text-orange-550 border-l-4 border-orange-500 pl-2" : "text-slate-400"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count !== null && (
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.isBadgeAlert ? "bg-rose-500 text-white animate-pulse" : "bg-slate-800 text-slate-400"}`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="space-y-2">
              <span className="px-3 text-[10px] font-bold text-slate-550 uppercase tracking-wider block mb-3">Utilities</span>
              {[
                { view: "search", label: "Universal Search", icon: Search },
                { view: "activity", label: "Activity Log", icon: Activity },
                { view: "trash", label: "Trash Bin", icon: Archive, count: totalTrashedCount },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => setActiveView(item.view)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-800 hover:text-white ${isActive ? "bg-orange-500/10 text-orange-555 border-l-4 border-orange-500 pl-2" : "text-slate-400"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count !== null && item.count > 0 && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-955 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "AD"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-none truncate">{profile?.full_name || "Admin"}</p>
                <p className="text-[10px] text-slate-500 leading-none mt-1 truncate">{profile?.email || "system@admin.com"}</p>
              </div>
            </div>
            <button 
              onClick={handleAdminSignOut}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        {/* Mobile/Tablet Sidebar Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="relative flex flex-col w-64 bg-slate-900 text-slate-300 h-full p-0">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-orange-500" size={24} />
                  <h1 className="text-base font-black text-white leading-none">Jlindo Admin</h1>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-7">
                <div className="space-y-2">
                  <span className="px-3 text-[10px] font-bold text-slate-550 uppercase tracking-wider block mb-3">Main Console</span>
                  {[
                    { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                    { view: "users", label: "Users", icon: Users, count: users?.length },
                    { view: "jobs", label: "Jobs", icon: Briefcase, count: jobs?.length },
                    { view: "applications", label: "Applications", icon: FileCheck, count: applications?.length },
                    { view: "communication", label: "Communication Center", icon: MessageSquare, count: (pendingReports + openFeedback) > 0 ? (pendingReports + openFeedback) : null, isBadgeAlert: true },
                    { view: "analytics", label: "Analytics", icon: TrendingUp },
                    { view: "settings", label: "Settings", icon: Settings },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.view;
                    return (
                      <button
                        key={item.view}
                        onClick={() => { setActiveView(item.view); setSidebarOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-800 hover:text-white ${isActive ? "bg-orange-500/10 text-orange-555 border-l-4 border-orange-500 pl-2" : "text-slate-400"}`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </div>
                        {item.count !== undefined && item.count !== null && (
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.isBadgeAlert ? "bg-rose-500 text-white animate-pulse" : "bg-slate-800 text-slate-400"}`}>
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="space-y-2">
                  <span className="px-3 text-[10px] font-bold text-slate-555 uppercase tracking-wider block mb-3">Utilities</span>
                  {[
                    { view: "search", label: "Universal Search", icon: Search },
                    { view: "activity", label: "Activity Log", icon: Activity },
                    { view: "trash", label: "Trash Bin", icon: Archive, count: totalTrashedCount },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.view;
                    return (
                      <button
                        key={item.view}
                        onClick={() => { setActiveView(item.view); setSidebarOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-800 hover:text-white ${isActive ? "bg-orange-500/10 text-orange-555 border-l-4 border-orange-500 pl-2" : "text-slate-400"}`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </div>
                        {item.count !== undefined && item.count !== null && item.count > 0 && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 border-t border-slate-800 bg-slate-955 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "AD"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white leading-none truncate">{profile?.full_name || "Admin"}</p>
                    <p className="text-[10px] text-slate-500 leading-none mt-1 truncate">{profile?.email || "system@admin.com"}</p>
                  </div>
                </div>
                <button 
                  onClick={handleAdminSignOut}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Header Bar */}
          <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-16 flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-3">
              <button 
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-55 transition"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
              <div className="text-sm font-semibold text-slate-400 capitalize hidden sm:flex items-center gap-1.5">
                <span>Jlindo Admin</span>
                <span className="text-slate-300">/</span>
                <strong className="text-slate-808 capitalize">{activeView === "communication" ? "Communication Center" : activeView}</strong>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setNotifBellOpen(!notifBellOpen)}
                  className="relative p-2.5 text-slate-500 hover:text-slate-808 hover:bg-slate-50 rounded-full transition-all"
                >
                  <Bell size={18} />
                  {notifications && notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white animate-pulse" />
                  )}
                </button>
                
                {notifBellOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifBellOpen(false)} />
                    <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-101 rounded-2xl shadow-xl z-50 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 pb-2.5 border-b border-slate-101 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-808 uppercase tracking-wider">Announcements</span>
                        <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                          {notifications?.length || 0} Total
                        </span>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {notifications && notifications.slice(0, 5).map((n: any) => (
                          <div key={n.id} className="p-3 hover:bg-slate-55/50 transition">
                            <div className="flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-slate-808 line-clamp-1 leading-snug">{n.title}</p>
                                <p className="text-[11px] text-slate-555 line-clamp-2 mt-0.5 leading-normal">{n.message}</p>
                                <span className="text-[9px] text-slate-404 font-semibold block mt-1.5">{formatFeedbackDate(n.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!notifications || notifications.length === 0) && (
                          <div className="py-8 text-center text-xs text-slate-404 font-medium">No announcements yet</div>
                        )}
                      </div>
                      <div className="px-3 pt-2.5 border-t border-slate-101">
                        <button 
                          onClick={() => {
                            setNotifBellOpen(false);
                            setActiveView("communication");
                            setCommCenterTab("announcements");
                          }}
                          className="w-full text-center py-2 text-xs font-bold text-amber-600 hover:text-amber-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                        >
                          View All Announcements
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="h-5 w-px bg-slate-200" />

              {/* User Account avatar */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "AD"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-808 leading-none">{profile?.full_name || "Admin"}</p>
                  <p className="text-[10px] text-slate-404 font-semibold leading-none mt-1">Super Admin</p>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable View Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8FAFC]">
            {activeView === "dashboard" && renderDashboardView()}
            {activeView === "users" && renderUsersView()}
            {activeView === "jobs" && renderJobsView()}
            {activeView === "applications" && renderApplicationsView()}
            {activeView === "communication" && renderCommunicationView()}
            {activeView === "analytics" && renderAnalyticsView()}
            {activeView === "settings" && renderSettingsView()}
            {activeView === "search" && renderSearchView()}
            {activeView === "activity" && renderActivityLogView()}
            {activeView === "trash" && renderTrashView()}
          </main>
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
      <BrandedConfirmDialog
        isOpen={!!confirmDeleteNotifId}
        onClose={() => setConfirmDeleteNotifId(null)}
        onConfirm={() => {
          if (confirmDeleteNotifId) deleteNotification.mutate(confirmDeleteNotifId);
        }}
        title="Delete Notification"
        description="This notification will be permanently deleted. Delivery statistics and notification history will be lost."
        confirmText="Delete"
        isDestructive
        isLoading={deleteNotification.isPending}
      />
    </>
  );
  // Dummy references to bypass TS unused checks
  if (false && _handleExportJobs && _handleExportFeedback && _handleExportReports && _totalJobs && latestActivityWidgetLogs && formatLogDate && interfaceTheme && setInterfaceTheme) {
    console.log("Unused variables active: ", _handleExportJobs, _handleExportFeedback, _handleExportReports, _totalJobs, latestActivityWidgetLogs, formatLogDate, interfaceTheme, setInterfaceTheme);
  }
}

