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

/* ─── colour palette for job-category avatars ─── */
const AVATAR_COLORS = [
  ["#FEF3C7", "#D97706"],
  ["#EDE9FE", "#7C3AED"],
  ["#DCFCE7", "#16A34A"],
  ["#DBEAFE", "#2563EB"],
  ["#FCE7F3", "#DB2777"],
  ["#FFF7ED", "#EA580C"],
];

function getAvatarColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ─── skeleton card ─── */
function SkeletonCard() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "20px 20px",
        border: "1px solid rgba(15,10,30,0.07)",
        display: "flex", flexDirection: "column", gap: 14,
      }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ height: 52, width: 52, borderRadius: 14, background: "#F1F5F9", flexShrink: 0 }} className="animate-pulse" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 16, width: "55%", borderRadius: 6, background: "#F1F5F9" }} className="animate-pulse" />
          <div style={{ height: 13, width: "35%", borderRadius: 6, background: "#F1F5F9" }} className="animate-pulse" />
        </div>
      </div>
      <div style={{ height: 1, background: "#F1F5F9" }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ height: 13, width: "25%", borderRadius: 6, background: "#F1F5F9" }} className="animate-pulse" />
        <div style={{ height: 18, width: "18%", borderRadius: 6, background: "#F1F5F9" }} className="animate-pulse" />
      </div>
    </div>
  );
}

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
        .jl-job-card:hover { box-shadow: 0 8px 32px rgba(15,10,30,0.10) !important; }
        .jl-search-input:focus-visible {
          outline: none !important;
          border-color: #F59E0B !important;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.14) !important;
        }
        .jl-apply-btn:not(:disabled):hover {
          background: linear-gradient(135deg, #FBBF24, #F59E0B) !important;
          box-shadow: 0 6px 24px rgba(245,158,11,0.42) !important;
        }
        .jl-apply-btn:not(:disabled):active { transform: scale(0.97); }
        .jl-close-btn:hover { background: rgba(15,10,30,0.06) !important; }
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
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
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
                const [avatarBg, avatarText] = getAvatarColor(job.title);

                return (
                  <motion.button
                    type="button"
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.04 } }}
                    exit={{ opacity: 0, y: -8 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => setSelectedJob(job)}
                    className="jl-job-card"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "#fff",
                      borderRadius: 20,
                      border: "1px solid rgba(15,10,30,0.07)",
                      boxShadow: "0 2px 12px rgba(15,10,30,0.05)",
                      cursor: "pointer",
                      overflow: "hidden",
                      transition: "box-shadow .2s",
                      padding: 0,
                      position: "relative",
                    }}
                  >
                    {/* Amber left accent */}
                    <div
                      style={{
                        position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
                        background: applied
                          ? "linear-gradient(180deg, #10B981, #059669)"
                          : closed
                          ? "#94A3B8"
                          : "linear-gradient(180deg, #F59E0B, #D97706)",
                        borderRadius: "20px 0 0 20px",
                      }}
                    />

                    {/* Applied badge */}
                    {applied && (
                      <div
                        style={{
                          position: "absolute", top: 14, right: 14,
                          display: "flex", alignItems: "center", gap: 5,
                          background: "#DCFCE7", border: "1px solid #BBF7D0",
                          borderRadius: 999, padding: "3px 10px",
                          fontSize: 11, fontWeight: 700, color: "#16A34A",
                        }}
                      >
                        <CheckCircle2 style={{ height: 11, width: 11 }} />
                        Applied
                      </div>
                    )}

                    {/* Card content */}
                    <div style={{ padding: "18px 18px 0 22px" }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>

                        {/* Avatar */}
                        <div
                          style={{
                            height: 50, width: 50, borderRadius: 14, flexShrink: 0,
                            background: avatarBg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <span style={{ fontSize: 20, fontWeight: 800, color: avatarText }}>
                            {job.title.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Title + location */}
                        <div style={{ flex: 1, minWidth: 0, paddingRight: applied ? 70 : 8 }}>
                          <h3
                            style={{
                              margin: 0, fontSize: 15, fontWeight: 700,
                              color: "#0d0a1e", letterSpacing: "-0.01em",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}
                          >
                            {job.title}
                          </h3>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                            <MapPin style={{ height: 12, width: 12, color: "rgba(15,10,30,0.30)", flexShrink: 0 }} />
                            <span
                              style={{
                                fontSize: 13, color: "rgba(15,10,30,0.42)",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                              }}
                            >
                              {job.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 18px 18px 22px",
                        marginTop: 14,
                        borderTop: "1px solid rgba(15,10,30,0.05)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock style={{ height: 13, width: 13, color: "rgba(15,10,30,0.28)" }} />
                        <span style={{ fontSize: 12, color: "rgba(15,10,30,0.42)" }}>{job.working_hours}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0d0a1e", letterSpacing: "-0.02em" }}>
                            {job.salary}
                          </p>
                          <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "rgba(15,10,30,0.30)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            per day
                          </p>
                        </div>
                        <div
                          style={{
                            height: 30, width: 30, borderRadius: 8,
                            background: "rgba(245,158,11,0.10)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <ChevronRight style={{ height: 15, width: 15, color: "#D97706" }} />
                        </div>
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
            borderRadius: 28,
            border: "none",
            boxShadow: "0 32px 80px rgba(15,10,30,0.22)",
            background: "#fff",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {selectedJob && (
            <div style={{ display: "flex", flexDirection: "column", maxHeight: "88vh", overflowY: "auto" }}>

              {/* DIALOG HEADER */}
              <div
                style={{
                  padding: "24px 24px 20px",
                  background: "linear-gradient(135deg, #0d0a1e 0%, #1e1040 100%)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Amber glow */}
                <div
                  style={{
                    position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                    <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.25 }}>
                      {selectedJob.title}
                    </h2>
                    <StatusBadge status={selectedJob.status || "open"} />
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.60)" }}>
                      <MapPin style={{ height: 13, width: 13, color: "#F59E0B" }} />
                      {selectedJob.location}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.60)" }}>
                      <Clock style={{ height: 13, width: 13, color: "#F59E0B" }} />
                      {selectedJob.working_hours}
                    </span>
                  </div>
                </div>
              </div>

              {/* DIALOG BODY */}
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>

                {/* Salary hero */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #FEF3C7 0%, #FFF7ED 100%)",
                    border: "1px solid rgba(245,158,11,0.20)",
                    borderRadius: 18,
                    padding: "16px 20px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(217,119,6,0.70)" }}>
                      Daily Pay
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 800, color: "#0d0a1e", letterSpacing: "-0.03em" }}>
                      {selectedJob.salary}
                    </p>
                  </div>
                  <div
                    style={{
                      height: 44, width: 44, borderRadius: 12,
                      background: "rgba(245,158,11,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Zap style={{ height: 20, width: 20, color: "#D97706" }} strokeWidth={2.5} />
                  </div>
                </div>

                {/* Details grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Location", value: selectedJob.location },
                    { label: "Working Hours", value: selectedJob.working_hours },
                    ...(selectedJob.workers_required
                      ? [{ label: "Workers Needed", value: selectedJob.workers_required, full: true }]
                      : []),
                  ].map(({ label, value, full }) => (
                    <div
                      key={label}
                      style={{
                        gridColumn: full ? "1 / -1" : undefined,
                        background: "#F8FAFC",
                        border: "1px solid rgba(15,10,30,0.07)",
                        borderRadius: 14,
                        padding: "12px 14px",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(15,10,30,0.35)" }}>
                        {label}
                      </p>
                      <p style={{ margin: "5px 0 0", fontSize: 14, fontWeight: 600, color: "#0d0a1e" }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {selectedJob.description && (
                  <div
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid rgba(15,10,30,0.07)",
                      borderRadius: 14,
                      padding: "14px 16px",
                    }}
                  >
                    <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(15,10,30,0.35)" }}>
                      About this Job
                    </p>
                    <p style={{ margin: 0, fontSize: 14, color: "rgba(15,10,30,0.62)", lineHeight: 1.65 }}>
                      {selectedJob.description}
                    </p>
                  </div>
                )}
              </div>

              {/* DIALOG ACTIONS */}
              <div
                style={{
                  padding: "16px 24px 24px",
                  borderTop: "1px solid rgba(15,10,30,0.07)",
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {alreadyApplied && (
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: "#F0FDF4", border: "1px solid #BBF7D0",
                      borderRadius: 12, padding: "10px 14px",
                      fontSize: 13, fontWeight: 600, color: "#16A34A",
                    }}
                  >
                    <CheckCircle2 style={{ height: 16, width: 16 }} />
                    You already applied for this job
                  </div>
                )}

                {isClosed && (
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: "#FEF2F2", border: "1px solid #FECACA",
                      borderRadius: 12, padding: "10px 14px",
                      fontSize: 13, fontWeight: 600, color: "#DC2626",
                    }}
                  >
                    <XCircle style={{ height: 16, width: 16 }} />
                    This position is no longer available
                  </div>
                )}

                <Button
                  onClick={() => applyMutation.mutate(selectedJob.id)}
                  disabled={applyMutation.isPending || alreadyApplied || isClosed}
                  className="jl-apply-btn"
                  style={{
                    width: "100%", height: 50, borderRadius: 14,
                    fontSize: 15, fontWeight: 700, border: "none",
                    background:
                      alreadyApplied || isClosed
                        ? "#E2E8F0"
                        : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    color:
                      alreadyApplied || isClosed ? "#94A3B8" : "#1c0e00",
                    boxShadow:
                      alreadyApplied || isClosed
                        ? "none"
                        : "0 4px 18px rgba(245,158,11,0.32)",
                    cursor: alreadyApplied || isClosed ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all .18s",
                  }}
                >
                  {applyMutation.isPending ? (
                    <><Loader2 style={{ height: 16, width: 16 }} className="animate-spin" /> Applying…</>
                  ) : isClosed ? (
                    "Position Closed"
                  ) : alreadyApplied ? (
                    <><CheckCircle2 style={{ height: 16, width: 16 }} /> Already Applied</>
                  ) : (
                    <>Apply for this Job <ArrowRight style={{ height: 16, width: 16 }} strokeWidth={2.5} /></>
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
