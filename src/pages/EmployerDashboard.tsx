import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Users, MapPin, DollarSign, Calendar, ArrowRight, PenSquare, Lock, Briefcase, Activity, XCircle, ExternalLink } from "lucide-react";
import { decodeLocation } from "@/utils/locationUtils";
import { motion, AnimatePresence } from "framer-motion";
import { BrandedConfirmDialog } from "@/components/BrandedConfirmDialog";

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [closeJobId, setCloseJobId] = useState<string | null>(null);
  const [closingJob, setClosingJob] = useState(false);

  const handleCloseJob = async () => {
    if (!closeJobId) return;
    setClosingJob(true);
    const { error } = await supabase
      .from("jobs")
      .update({ status: "closed" })
      .eq("id", closeJobId);
    setClosingJob(false);
    setCloseJobId(null);
    if (!error) {
      window.location.reload();
    }
  };
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["employer-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get application counts per job
  const { data: appCounts } = useQuery({
    queryKey: ["employer-app-counts"],
    queryFn: async () => {
      if (!jobs) return {};
      const jobIds = jobs.map((j) => j.id);
      const { data, error } = await supabase
        .from("applications")
        .select("job_id")
        .in("job_id", jobIds);
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((a) => {
        counts[a.job_id] = (counts[a.job_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!jobs && jobs.length > 0,
  });

  const totalJobs = jobs?.length || 0;
  const activeJobs = jobs?.filter((j) => j.status === "open").length || 0;
  const closedJobs = jobs?.filter((j) => j.status === "closed").length || 0;
  const totalApps = Object.values(appCounts || {}).reduce((sum, count) => sum + count, 0);

  const renderStatVal = (val: number | string) => {
    if (isLoading) {
      return <div className="h-7 w-12 bg-slate-100 rounded-md animate-pulse mt-0.5" />;
    }
    return <span className="text-2xl font-black text-slate-800 tracking-tight leading-none">{val}</span>;
  };

  return (
    <>
      <style>{`
        .jl-employer-card:hover {
          box-shadow: 0 8px 32px rgba(15,10,30,0.08) !important;
          transform: translateY(-2px);
        }
        .jl-btn-primary {
          background: linear-gradient(135deg, #F59E0B, #EA580C) !important;
          color: white !important;
          transition: all 0.3s ease !important;
        }
        .jl-btn-primary:hover {
          background: linear-gradient(135deg, #FBBF24, #F59E0B) !important;
          box-shadow: 0 4px 18px rgba(245,158,11,0.35) !important;
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
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-5 mb-7">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div
                  style={{
                    height: 7, width: 7, borderRadius: "50%",
                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                  }}
                />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(245,158,11,0.85)" }}>
                  Employer Portal
                </span>
              </div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0d0a1e", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                Your Jobs
              </h1>
              <p style={{ margin: "6px 0 0", fontSize: 14, color: "rgba(15,10,30,0.45)" }}>
                Manage and monitor your job listings
              </p>
            </div>
            
            <Button className="jl-btn-primary shadow-sm rounded-xl h-11 px-5 font-medium flex items-center gap-2 border-0 w-full sm:w-auto justify-center" asChild>
              <Link to="/employer/post-job">
                <Plus className="h-4.5 w-4.5" /> Post Job
              </Link>
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {/* Total Jobs */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Jobs</span>
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <Briefcase size={16} />
                </div>
              </div>
              <div className="mt-4">
                {renderStatVal(totalJobs)}
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Posted all-time</p>
              </div>
            </div>

            {/* Active Jobs */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Jobs</span>
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <Activity size={16} />
                </div>
              </div>
              <div className="mt-4">
                {renderStatVal(activeJobs)}
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Open listings</p>
              </div>
            </div>

            {/* Closed Jobs */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Closed Jobs</span>
                <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                  <XCircle size={16} />
                </div>
              </div>
              <div className="mt-4">
                {renderStatVal(closedJobs)}
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Archived jobs</p>
              </div>
            </div>

            {/* Total Applications */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_rgba(15,10,30,0.02)] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applications</span>
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <Users size={16} />
                </div>
              </div>
              <div className="mt-4">
                {renderStatVal(totalApps)}
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Total responses</p>
              </div>
            </div>
          </div>

          {/* Skeleton Loaders */}
          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 140, background: "#fff", borderRadius: 20, border: "1px solid rgba(15,10,30,0.07)" }} className="animate-pulse" />
              ))}
            </div>
          )}

          {/* Jobs List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <AnimatePresence>
              {jobs?.map((job, idx) => {
                const loc = decodeLocation(job.location);
                return (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.04 } }}
                    className="jl-employer-card"
                    style={{
                      background: "#fff",
                      borderRadius: 20,
                      border: "1px solid rgba(15,10,30,0.07)",
                      boxShadow: "0 2px 12px rgba(15,10,30,0.04)",
                      overflow: "hidden",
                      transition: "all .3s ease",
                      position: "relative",
                    }}
                  >
                    {/* Left status accent line */}
                    <div
                      style={{
                        position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
                        background: job.status === "open" ? "#10B981" : 
                                    job.status === "filled" ? "#6B7280" : 
                                    "#EF4444",
                      }}
                    />

                    <div className="p-5 pl-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                        <div className="min-w-0">
                          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0d0a1e", letterSpacing: "-0.01em" }} className="break-words">
                            {job.title}
                          </h3>
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
                              <Calendar size={14} className="flex-shrink-0" /> {job.working_hours}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 self-start sm:self-auto shrink-0">
                          <StatusBadge status={job.status} />
                          <div className="text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Users size={10} className="text-amber-600" />
                            <span>{appCounts?.[job.id] || 0} Applicants</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3.5">
                        <Link
                          to={`/employer/job/${job.id}`}
                          className="flex items-center gap-1.5 text-[13px] font-bold text-amber-500 hover:text-amber-600 w-fit"
                        >
                          <Users size={16} />
                          <span>{appCounts?.[job.id] || 0} Applicants</span>
                          <ArrowRight size={14} />
                        </Link>

                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-600 hover:text-slate-800 rounded-xl flex-1 sm:flex-initial justify-center"
                            asChild
                          >
                            <Link to={`/employer/edit-job/${job.id}`}>
                              <PenSquare size={14} className="mr-1.5" /> Edit
                            </Link>
                          </Button>

                          {job.status === "open" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-100 text-rose-500 hover:bg-rose-50/50 hover:text-rose-600 rounded-xl flex-1 sm:flex-initial justify-center bg-transparent"
                              onClick={(e) => {
                                e.preventDefault();
                                setCloseJobId(job.id);
                              }}
                            >
                              <Lock size={14} className="mr-1.5" /> Close Job
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {jobs?.length === 0 && !isLoading && (
              <div
                style={{
                  textAlign: "center", padding: "60px 20px",
                  background: "#fff", borderRadius: 24,
                  border: "1px solid rgba(15,10,30,0.07)",
                  boxShadow: "0 2px 12px rgba(15,10,30,0.04)"
                }}
              >
                <div
                  style={{
                    height: 56, width: 56, borderRadius: 16, margin: "0 auto 16px",
                    background: "rgba(245,158,11,0.10)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Plus style={{ height: 24, width: 24, color: "#F59E0B" }} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#0d0a1e", margin: 0 }}>You haven't posted any jobs yet</p>
                <p style={{ fontSize: 13, color: "rgba(15,10,30,0.42)", marginTop: 6 }}>
                  Start by posting your first job to find workers.
                </p>
                <Button
                  className="jl-btn-primary mt-5 px-5 rounded-xl border-0"
                  asChild
                >
                  <Link to="/employer/post-job">Post First Job</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <BrandedConfirmDialog
        isOpen={!!closeJobId}
        onClose={() => setCloseJobId(null)}
        onConfirm={handleCloseJob}
        title="Close Job Listing"
        description="Are you sure you want to close this job listing? This action cannot be undone."
        confirmText="Close Job"
        isDestructive
        isLoading={closingJob}
      />
    </>
  );
}

