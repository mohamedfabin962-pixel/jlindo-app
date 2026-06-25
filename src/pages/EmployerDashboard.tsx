import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Users, MapPin, DollarSign, Calendar, ArrowRight, PenSquare, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EmployerDashboard() {
  const { user } = useAuth();

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
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
            
            <Button className="jl-btn-primary shadow-sm rounded-xl h-11 px-5 font-medium flex items-center gap-2 border-0" asChild>
              <Link to="/employer/post-job">
                <Plus className="h-4.5 w-4.5" /> Post Job
              </Link>
            </Button>
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
              {jobs?.map((job, idx) => (
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

                  <div style={{ padding: "20px 20px 20px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0d0a1e", letterSpacing: "-0.01em" }}>
                          {job.title}
                        </h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: 8, fontSize: 13, color: "rgba(15,10,30,0.48)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <MapPin size={14} style={{ opacity: 0.7 }} /> {job.location}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#EA580C", fontWeight: 600 }}>
                            <DollarSign size={14} style={{ opacity: 0.7 }} /> {job.salary}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Calendar size={14} style={{ opacity: 0.7 }} /> {job.working_hours}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>

                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(15,10,30,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Link
                        to={`/employer/job/${job.id}`}
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#F59E0B", textDecoration: "none" }}
                      >
                        <Users size={16} />
                        <span>{appCounts?.[job.id] || 0} Applicants</span>
                        <ArrowRight size={14} />
                      </Link>

                      <div style={{ display: "flex", gap: 8 }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          style={{ color: "rgba(15,10,30,0.6)", borderRadius: 10 }}
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
                            style={{ borderColor: "rgba(15,10,30,0.08)", color: "#EF4444", background: "transparent", borderRadius: 10 }}
                            onClick={async (e) => {
                              e.preventDefault();
                              await supabase
                                .from("jobs")
                                .update({ status: "closed" })
                                .eq("id", job.id);

                              window.location.reload();
                            }}
                          >
                            <Lock size={14} className="mr-1.5" /> Close Job
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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
    </>
  );
}

