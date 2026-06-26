import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Search, ArrowRight, Loader2, CheckCircle2, XCircle, ChevronRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { JobCardSkeleton } from "@/components/BrandedLoading";

/* ─── main component ─── */
export default function JobListings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`*, applications!applications_job_id_fkey(status)`);

      console.log("DATA", data);
      console.log("ERROR", error);

      setJobs(data || []);
      setIsLoading(false);
    };
    loadJobs();
  }, []);

  const { data: myApplications } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("job_id")
        .eq("worker_id", user!.id);
      if (error) throw error;
      return data.map((a) => a.job_id);
    },
    enabled: !!user,
  });

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.from("applications").insert({
        job_id: jobId,
        worker_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      toast({ title: "Application sent!", description: "The employer will review your application." });
      setSelectedJob(null);
    },
    onError: (err: any) => {
      if (err.message?.toLowerCase().includes("duplicate")) {
        toast({ title: "Already Applied", description: "You have already applied for this job." });
      } else {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    },
  });

  const filtered = jobs?.filter((j) => {
    const q = search.trim().toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      (j.description && j.description.toLowerCase().includes(q))
    );
  });

  const alreadyApplied = selectedJob && myApplications?.includes(selectedJob.id);
  const isClosed = selectedJob && selectedJob.status !== "open";

  return (
    <>
      <style>{`
        .jl-job-card-airbnb:hover {
          border-color: rgba(15,10,30,0.12) !important;
          box-shadow: 0 10px 30px rgba(15,10,30,0.05) !important;
          transform: translateY(-2px);
        }
        .jl-apply-btn-airbnb:not(:disabled):hover {
          background: #1e293b !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15,10,30,0.08) !important;
        }
        .jl-search-input:focus-visible {
          outline: none !important;
          border-color: #F59E0B !important;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.14) !important;
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
                Live Listings
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0d0a1e", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              Find Work Near You
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "rgba(15,10,30,0.45)" }}>
              Browse open jobs and apply in one tap
            </p>
          </div>

          {/* ── SEARCH BAR ──────────────────────────────── */}
          <div style={{ position: "relative", marginBottom: 28 }}>
            <Search
              style={{
                position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                height: 17, width: 17, color: "rgba(15,10,30,0.30)",
              }}
            />
            <Input
              placeholder="Search by title, location, or keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="jl-search-input"
              style={{
                height: 50, paddingLeft: 46, paddingRight: 16, fontSize: 14,
                borderRadius: 14, border: "1px solid rgba(15,10,30,0.10)",
                background: "#fff", color: "#0d0a1e",
                boxShadow: "0 2px 12px rgba(15,10,30,0.05)",
                transition: "border-color .2s, box-shadow .2s",
              }}
            />
          </div>

          {/* ── LOADING SKELETONS ───────────────────────── */}
          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1, 2, 3].map((i) => <JobCardSkeleton key={i} />)}
            </div>
          )}

          {/* ── EMPTY STATE ─────────────────────────────── */}
          {!isLoading && filtered?.length === 0 && (
            <div
              style={{
                textAlign: "center", padding: "60px 20px",
                background: "#fff", borderRadius: 24,
                border: "1px solid rgba(15,10,30,0.07)",
              }}
            >
              <div
                style={{
                  height: 56, width: 56, borderRadius: 16, margin: "0 auto 16px",
                  background: "rgba(245,158,11,0.10)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Search style={{ height: 24, width: 24, color: "#F59E0B" }} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#0d0a1e", margin: 0 }}>No jobs found</p>
              <p style={{ fontSize: 13, color: "rgba(15,10,30,0.42)", marginTop: 6 }}>
                Try a different search term or check back later
              </p>
            </div>
          )}

          {/* ── JOB CARDS ───────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <AnimatePresence>
              {filtered?.map((job, idx) => {
                const applied = myApplications?.includes(job.id);
                const closed = job.status !== "open";

                return (
                  <motion.button
                    type="button"
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.04 } }}
                    exit={{ opacity: 0, y: -8 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedJob(job)}
                    className="jl-job-card-airbnb group"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "#ffffff",
                      borderRadius: 20,
                      border: "1px solid rgba(15,10,30,0.06)",
                      boxShadow: "0 4px 18px rgba(15,10,30,0.02)",
                      cursor: "pointer",
                      padding: 24,
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {/* Top: Job Title & status */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, width: "100%" }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#0f172a",
                        letterSpacing: "-0.015em",
                        lineHeight: 1.3,
                        flex: 1,
                      }}>
                        {job.title}
                      </h3>
                      
                      <div style={{ flexShrink: 0 }}>
                        {applied ? (
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#10B981", background: "rgba(16,185,129,0.08)", padding: "3px 8px", borderRadius: 6 }}>
                            Applied
                          </span>
                        ) : closed ? (
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", background: "rgba(148,163,184,0.08)", padding: "3px 8px", borderRadius: 6 }}>
                            Closed
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#EA580C", background: "rgba(234,88,12,0.06)", padding: "3px 8px", borderRadius: 6 }}>
                            Open
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Location & Hours Row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(15,10,30,0.42)", fontWeight: 500 }}>
                      <span>{job.location}</span>
                      <span style={{ color: "rgba(15,10,30,0.2)" }}>•</span>
                      <span>{job.working_hours}</span>
                    </div>

                    {/* Description: 2 lines maximum */}
                    {job.description && (
                      <p style={{
                        margin: 0,
                        fontSize: 13.5,
                        color: "rgba(15,10,30,0.52)",
                        lineHeight: 1.55,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        letterSpacing: "-0.005em",
                      }}>
                        {job.description}
                      </p>
                    )}

                    {/* Bottom: Salary + Subtle Arrow CTA */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      marginTop: 4,
                      paddingTop: 16,
                      borderTop: "1px solid rgba(15,10,30,0.05)"
                    }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                        <span style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
                          {job.salary}
                        </span>
                        <span style={{ fontSize: 12, color: "rgba(15,10,30,0.38)" }}>
                          / day
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "#EA580C" }}>
                        <span>Explore</span>
                        <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ══ JOB DETAIL DIALOG ══════════════════════════════════ */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent
          className="w-[95%] max-w-lg p-0 overflow-hidden"
          style={{
            borderRadius: 24,
            border: "none",
            boxShadow: "0 32px 80px rgba(15,10,30,0.18)",
            background: "#fff",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {selectedJob && (
            <div style={{ display: "flex", flexDirection: "column", maxHeight: "88vh", overflowY: "auto" }}>

              {/* HEADER HERO SECTION */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "32px 32px 24px", borderBottom: "1px solid rgba(15,10,30,0.06)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.25 }}>
                    {selectedJob.title}
                  </h2>
                  <div style={{ flexShrink: 0 }}>
                    <StatusBadge status={alreadyApplied ? "applied" : selectedJob.status} />
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(15,10,30,0.45)", fontWeight: 500 }}>
                  <span>{selectedJob.location}</span>
                  <span style={{ color: "rgba(15,10,30,0.2)" }}>•</span>
                  <span>{selectedJob.working_hours}</span>
                  <span style={{ color: "rgba(15,10,30,0.2)" }}>•</span>
                  <span style={{ color: "#EA580C", fontWeight: 700 }}>{selectedJob.salary} / day</span>
                </div>
              </div>

              {/* BODY SECTION (Clean Layout, no excessive boxes) */}
              <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
                
                {/* Description */}
                {selectedJob.description && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.38)" }}>
                      About this opportunity
                    </h3>
                    <p style={{ margin: 0, fontSize: 14.5, color: "rgba(15,10,30,0.65)", lineHeight: 1.65, letterSpacing: "-0.005em" }}>
                      {selectedJob.description}
                    </p>
                  </div>
                )}

                {/* Details Section */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 32px", padding: "16px 0", borderTop: "1px solid rgba(15,10,30,0.06)", borderBottom: "1px solid rgba(15,10,30,0.06)" }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(15,10,30,0.35)", display: "block", marginBottom: 6 }}>
                      Location
                    </span>
                    <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: "#0f172a" }}>{selectedJob.location}</p>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(15,10,30,0.35)", display: "block", marginBottom: 6 }}>
                      Working Hours
                    </span>
                    <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: "#0f172a" }}>{selectedJob.working_hours}</p>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(15,10,30,0.35)", display: "block", marginBottom: 6 }}>
                      Pay Details
                    </span>
                    <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: "#0f172a" }}>
                      {selectedJob.salary} per working day
                    </p>
                  </div>

                  {selectedJob.workers_required && (
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(15,10,30,0.35)", display: "block", marginBottom: 6 }}>
                        Openings
                      </span>
                      <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: "#0f172a" }}>
                        {selectedJob.workers_required} workers required
                      </p>
                    </div>
                  )}
                </div>

                {/* Highlights List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.38)" }}>
                    Highlights
                  </h3>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      "Immediate hiring opportunity",
                      "Flexible working environment",
                      "Weekly payout direct deposits available",
                      "Hyperlocal job opening"
                    ].map((item) => (
                      <li key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(15,10,30,0.6)" }}>
                        <span style={{ color: "#EA580C", fontWeight: 700 }}>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* DIALOG ACTIONS (CTA Section) */}
              <div
                style={{
                  padding: "16px 32px 32px",
                  borderTop: "1px solid rgba(15,10,30,0.06)",
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {alreadyApplied && (
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)",
                      borderRadius: 12, padding: "12px 16px",
                      fontSize: 13.5, fontWeight: 600, color: "#059669",
                    }}
                  >
                    <CheckCircle2 style={{ height: 15, width: 15 }} />
                    You have already submitted an application for this position
                  </div>
                )}

                {isClosed && (
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)",
                      borderRadius: 12, padding: "12px 16px",
                      fontSize: 13.5, fontWeight: 600, color: "#DC2626",
                    }}
                  >
                    <XCircle style={{ height: 15, width: 15 }} />
                    This job opportunity is closed
                  </div>
                )}

                <Button
                  onClick={() => applyMutation.mutate(selectedJob.id)}
                  disabled={applyMutation.isPending || alreadyApplied || isClosed}
                  className="jl-apply-btn-airbnb"
                  style={{
                    width: "100%", height: 50, borderRadius: 12,
                    fontSize: 15, fontWeight: 600, border: "none",
                    background:
                      alreadyApplied || isClosed
                        ? "#F1F5F9"
                        : "#0f172a",
                    color:
                      alreadyApplied || isClosed ? "#94A3B8" : "#ffffff",
                    cursor: alreadyApplied || isClosed ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s ease",
                  }}
                >
                  {applyMutation.isPending ? (
                    <><Loader2 style={{ height: 16, width: 16 }} className="animate-spin" /> Submitting application…</>
                  ) : isClosed ? (
                    "Position Closed"
                  ) : alreadyApplied ? (
                    "Already Applied"
                  ) : (
                    <>Secure This Opportunity <ArrowRight style={{ height: 15, width: 15 }} /></>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
