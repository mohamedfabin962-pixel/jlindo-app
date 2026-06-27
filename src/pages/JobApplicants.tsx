import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrandedConfirmDialog } from "@/components/BrandedConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Phone, Check, X, ArrowLeft, Users, MapPin, DollarSign, Clock, ShieldAlert, ExternalLink } from "lucide-react";
import { decodeLocation } from "@/utils/locationUtils";
import { motion, AnimatePresence } from "framer-motion";

export default function JobApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closingJob, setClosingJob] = useState(false);

  const handleCloseListing = async () => {
    setClosingJob(true);
    const { error } = await supabase
      .from("jobs")
      .update({ status: "closed" })
      .eq("id", jobId!);
    setClosingJob(false);
    setShowCloseConfirm(false);
    if (!error) {
      window.location.reload();
    }
  };

  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  const { data: applications, isLoading } = useQuery({
    queryKey: ["job-applications", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, profiles!applications_worker_id_fkey(full_name, phone)")
        .eq("job_id", jobId!)
        .order("created_at", { ascending: false });
      if (error) {
        // Fallback without join
        const { data: apps, error: err2 } = await supabase
          .from("applications")
          .select("*")
          .eq("job_id", jobId!)
          .order("created_at", { ascending: false });
        if (err2) throw err2;
        // Fetch profiles separately
        const workerIds = apps.map(a => a.worker_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, phone")
          .in("user_id", workerIds);
        return apps.map(a => ({
          ...a,
          profile: profiles?.find(p => p.user_id === a.worker_id),
        }));
      }
      return data.map((a: any) => ({
        ...a,
        profile: a.profiles,
      }));
    },
    enabled: !!jobId,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ appId, status }: { appId: string; status: string }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", appId);
      if (error) throw error;

      // Check if job should be marked as filled
      if (status === "accepted" && job?.workers_required) {
        const { data: accepted } = await supabase
          .from("applications")
          .select("id")
          .eq("job_id", jobId!)
          .eq("status", "accepted");
        if (accepted && accepted.length >= job.workers_required) {
          await supabase.from("jobs").update({ status: "filled" }).eq("id", jobId!);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications", jobId] });
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      toast({ title: "Application updated" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <>
      <style>{`
        .jl-applicant-card:hover {
          box-shadow: 0 8px 32px rgba(15,10,30,0.08) !important;
        }
        .jl-btn-success {
          background: #10B981 !important;
          color: white !important;
        }
        .jl-btn-success:hover {
          background: #059669 !important;
          box-shadow: 0 4px 14px rgba(16,185,129,0.3) !important;
        }
        .jl-btn-danger {
          color: #EF4444 !important;
          border-color: rgba(239,68,68,0.2) !important;
        }
        .jl-btn-danger:hover {
          background: rgba(239,68,68,0.05) !important;
          border-color: #EF4444 !important;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #F8FAFC 0%, #FFF7ED 55%, #F8FAFC 100%)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px 60px" }}>
          
          <Link
            to="/employer/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(15,10,30,0.5)",
              textDecoration: "none",
              marginBottom: 20,
              transition: "color 0.2s"
            }}
            className="hover:text-amber-500"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          {/* Job Details Card */}
          {job && (() => {
            const loc = decodeLocation(job.location);
            return (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  border: "1px solid rgba(15,10,30,0.07)",
                  boxShadow: "0 2px 12px rgba(15,10,30,0.04)",
                  padding: "24px 28px",
                  marginBottom: 28,
                }}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div className="min-w-0">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(15,10,30,0.4)" }}>
                        Job Listing
                      </span>
                    </div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0d0a1e", letterSpacing: "-0.02em" }} className="break-words">
                      {job.title}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mt-2 text-xs sm:text-[13px] text-slate-500 font-medium">
                      <span className="flex flex-col sm:flex-row sm:items-center gap-1 min-w-0">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{loc.city}</span>
                        </span>
                        {loc.exactLocation && (
                          <span className="text-slate-400 truncate sm:pl-1">
                            ({loc.exactLocation})
                          </span>
                        )}
                        {loc.mapsUrl && (
                          <a
                            href={loc.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100/80 px-2 py-0.5 rounded-md transition-colors w-fit sm:ml-1 mt-1 sm:mt-0"
                          >
                            <ExternalLink size={10} /> Open in Maps
                          </a>
                        )}
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                        <DollarSign size={14} className="flex-shrink-0" /> {job.salary}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock size={14} className="flex-shrink-0" /> {job.working_hours}
                      </span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-3 mt-3 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <StatusBadge status={job.status} />
                    
                    {job.status === "open" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="jl-btn-danger h-8 text-xs font-semibold rounded-lg"
                        onClick={() => setShowCloseConfirm(true)}
                      >
                        <ShieldAlert size={12} className="mr-1" /> Close Listing
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Applicants Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Users size={18} className="text-amber-500" />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0d0a1e", margin: 0 }}>
              Applicants List
            </h2>
          </div>

          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2].map((i) => (
                <div key={i} style={{ height: 100, background: "#fff", borderRadius: 20, border: "1px solid rgba(15,10,30,0.07)" }} className="animate-pulse" />
              ))}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <AnimatePresence>
              {applications?.map((app: any, idx: number) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.04 } }}
                  className="jl-applicant-card"
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    border: "1px solid rgba(15,10,30,0.07)",
                    boxShadow: "0 2px 12px rgba(15,10,30,0.04)",
                    padding: "20px 20px 20px 24px",
                    position: "relative",
                    transition: "all .3s ease",
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

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0d0a1e" }}>
                        {app.profile?.full_name || "Worker"}
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(15,10,30,0.4)" }}>
                        Applied {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  {app.status === "accepted" && app.profile?.phone && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      style={{
                        marginTop: 14,
                        padding: 12,
                        borderRadius: 12,
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.15)",
                      }}
                    >
                      <a href={`tel:${app.profile.phone}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "#059669", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                        <Phone size={14} /> Contact: {app.profile.phone}
                      </a>
                    </motion.div>
                  )}

                  {app.status === "pending" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="jl-btn-success h-9 px-4 rounded-xl text-xs font-bold border-0 flex-1 sm:flex-initial justify-center"
                        onClick={() => updateStatus.mutate({ appId: app.id, status: "accepted" })}
                        disabled={updateStatus.isPending}
                      >
                        <Check size={14} className="mr-1" /> Accept Application
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="jl-btn-danger h-9 px-4 rounded-xl text-xs font-bold flex-1 sm:flex-initial justify-center"
                        onClick={() => updateStatus.mutate({ appId: app.id, status: "rejected" })}
                        disabled={updateStatus.isPending}
                      >
                        <X size={14} className="mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {applications?.length === 0 && !isLoading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 20px",
                  background: "#fff",
                  borderRadius: 20,
                  border: "1px solid rgba(15,10,30,0.07)",
                  color: "rgba(15,10,30,0.4)"
                }}
              >
                No applicants have applied to this job listing yet.
              </div>
            )}
          </div>
        </div>
      </div>
      <BrandedConfirmDialog
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={handleCloseListing}
        title="Close Job Listing"
        description="Are you sure you want to close this job listing? This action cannot be undone."
        confirmText="Close Listing"
        isDestructive
        isLoading={closingJob}
      />
    </>
  );
}

