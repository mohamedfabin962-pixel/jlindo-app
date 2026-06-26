import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, Clock, Search, ArrowRight, Loader2, CheckCircle2, XCircle, ChevronRight, Zap,
  Briefcase, Wrench, Truck, ShoppingBag, Laptop, HardHat, Utensils, Sparkles, HelpCircle, ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { JobCardSkeleton } from "@/components/BrandedLoading";
import { EmptyState } from "@/components/EmptyState";

const getCategoryDetails = (title: string = "", description: string = "") => {
  const t = title.toLowerCase();
  const d = description.toLowerCase();
  
  if (t.includes("clean") || t.includes("maid") || t.includes("housekeep") || d.includes("clean") || t.includes("dust")) {
    return {
      icon: Sparkles,
      color: "#059669",
      bgColor: "rgba(16,185,129,0.08)",
      borderColor: "rgba(16,185,129,0.15)",
      label: "Cleaning",
    };
  }
  if (t.includes("deliver") || t.includes("driver") || t.includes("truck") || t.includes("courier") || t.includes("transport") || d.includes("deliver")) {
    return {
      icon: Truck,
      color: "#2563EB",
      bgColor: "rgba(37,99,235,0.08)",
      borderColor: "rgba(37,99,235,0.15)",
      label: "Delivery",
    };
  }
  if (t.includes("construct") || t.includes("build") || t.includes("labor") || t.includes("paint") || t.includes("mason") || t.includes("carpenter") || d.includes("construction")) {
    return {
      icon: HardHat,
      color: "#D97706",
      bgColor: "rgba(245,158,11,0.08)",
      borderColor: "rgba(245,158,11,0.15)",
      label: "Construction",
    };
  }
  if (t.includes("kitchen") || t.includes("cook") || t.includes("chef") || t.includes("wait") || t.includes("food") || t.includes("dish") || t.includes("restaurant") || t.includes("cafe")) {
    return {
      icon: Utensils,
      color: "#E11D48",
      bgColor: "rgba(225,29,72,0.08)",
      borderColor: "rgba(225,29,72,0.15)",
      label: "Food Service",
    };
  }
  if (t.includes("repair") || t.includes("plumb") || t.includes("electr") || t.includes("fix") || t.includes("wrench") || t.includes("technician")) {
    return {
      icon: Wrench,
      color: "#4F46E5",
      bgColor: "rgba(79,70,229,0.08)",
      borderColor: "rgba(79,70,229,0.15)",
      label: "Maintenance",
    };
  }
  if (t.includes("retail") || t.includes("store") || t.includes("shop") || t.includes("cashier") || t.includes("sales") || t.includes("merchandis")) {
    return {
      icon: ShoppingBag,
      color: "#7C3AED",
      bgColor: "rgba(124,58,237,0.08)",
      borderColor: "rgba(124,58,237,0.15)",
      label: "Retail",
    };
  }
  if (t.includes("office") || t.includes("admin") || t.includes("tech") || t.includes("comput") || t.includes("design") || t.includes("writ") || t.includes("assist")) {
    return {
      icon: Laptop,
      color: "#475569",
      bgColor: "rgba(71,85,105,0.08)",
      borderColor: "rgba(71,85,105,0.15)",
      label: "Office",
    };
  }
  
  return {
    icon: Briefcase,
    color: "#EA580C",
    bgColor: "rgba(234,88,12,0.08)",
    borderColor: "rgba(234,88,12,0.15)",
    label: "General Work",
  };
};

const isWeeklyPayout = (title: string = "", description: string = "") => {
  const text = (title + " " + description).toLowerCase();
  return text.includes("weekly") || text.includes("week");
};

/* ─── main component ─── */
export default function JobListings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset pagination to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const drawerVariants = {
    hidden: isMobile ? { y: "100%", x: 0 } : { x: "100%", y: 0 },
    visible: { 
      y: 0, 
      x: 0,
      transition: { type: "spring", damping: 28, stiffness: 220 }
    },
    exit: isMobile ? { y: "100%", x: 0 } : { x: "100%", y: 0 }
  };

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
            <EmptyState
              icon={Search}
              title="No jobs found"
              description="Try a different search term or check back later."
            />
          )}

          {/* ── JOB CARDS ───────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <AnimatePresence mode="popLayout">
              {(() => {
                const paginatedJobs = filtered?.slice((currentPage - 1) * 5, currentPage * 5) || [];
                const totalPages = Math.ceil((filtered?.length || 0) / 5);

                return (
                  <>
                    {paginatedJobs.map((job, idx) => {
                      const applied = myApplications?.includes(job.id);
                      const closed = job.status !== "open";
                      const category = getCategoryDetails(job.title, job.description);
                      const CategoryIcon = category.icon;
                      const hasWeeklyPayout = isWeeklyPayout(job.title, job.description);

                      return (
                        <motion.button
                          type="button"
                          key={job.id}
                          layout
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.03 } }}
                          exit={{ opacity: 0, y: -8 }}
                          whileTap={{ scale: 0.995 }}
                          onClick={() => setSelectedJob(job)}
                          className="jl-job-card-airbnb group"
                          style={{
                            width: "100%",
                            textAlign: "left",
                            background: "#ffffff",
                            borderRadius: 18,
                            border: "1px solid rgba(15,10,30,0.06)",
                            boxShadow: "0 4px 18px rgba(15,10,30,0.015)",
                            cursor: "pointer",
                            padding: "20px 24px",
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          {/* Top: Category Icon + Job Title & status */}
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, width: "100%" }}>
                            <div 
                              style={{ 
                                height: 40, 
                                width: 40, 
                                borderRadius: 12, 
                                background: category.bgColor, 
                                border: `1px solid ${category.borderColor}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                marginTop: 2,
                              }}
                            >
                              <CategoryIcon size={18} style={{ color: category.color }} />
                            </div>
                            
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, width: "100%" }}>
                                <h3 style={{
                                  margin: 0,
                                  fontSize: 16.5,
                                  fontWeight: 700,
                                  color: "#0f172a",
                                  letterSpacing: "-0.015em",
                                  lineHeight: 1.3,
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

                              {/* Middle: Location & Hours Row with Icons */}
                              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginTop: 6, fontSize: 13, color: "rgba(15,10,30,0.45)", fontWeight: 500 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <MapPin size={13} style={{ color: "rgba(15,10,30,0.35)" }} />
                                  <span>{job.location}</span>
                                </div>
                                <span style={{ color: "rgba(15,10,30,0.15)" }}>•</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <Clock size={13} style={{ color: "rgba(15,10,30,0.35)" }} />
                                  <span>{job.working_hours}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Description: 2 lines maximum */}
                          {job.description && (
                            <p style={{
                              margin: "2px 0 0",
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

                          {/* Bottom: Salary + Weekly Payout + Subtle Arrow CTA */}
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            marginTop: 2,
                            paddingTop: 14,
                            borderTop: "1px solid rgba(15,10,30,0.05)"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                                <span style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
                                  {job.salary}
                                </span>
                                <span style={{ fontSize: 12, color: "rgba(15,10,30,0.38)" }}>
                                  / day
                                </span>
                              </div>
                              {hasWeeklyPayout && (
                                <span style={{ 
                                  fontSize: 11, 
                                  fontWeight: 600, 
                                  color: "#D97706", 
                                  background: "rgba(245,158,11,0.06)", 
                                  border: "1px solid rgba(245,158,11,0.12)",
                                  padding: "2px 6px", 
                                  borderRadius: 5 
                                }}>
                                  Weekly Payout
                                </span>
                              )}
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "#EA580C" }}>
                              <span>Explore</span>
                              <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 24 }}>
                        <Button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            opacity: currentPage === 1 ? 0.4 : 1,
                            boxShadow: "0 2px 6px rgba(15,10,30,0.02)",
                          }}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            style={{
                              background: currentPage === page ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" : "#ffffff",
                              border: currentPage === page ? "none" : "1px solid rgba(15,10,30,0.08)",
                              borderRadius: 10,
                              height: 36,
                              width: 36,
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: currentPage === page ? "#ffffff" : "#0d0a1e",
                              fontWeight: 600,
                              fontSize: 13,
                              cursor: "pointer",
                              boxShadow: currentPage === page ? "0 2px 8px rgba(245,158,11,0.24)" : "0 2px 6px rgba(15,10,30,0.02)",
                            }}
                          >
                            {page}
                          </Button>
                        ))}

                        <Button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                            opacity: currentPage === totalPages ? 0.4 : 1,
                            boxShadow: "0 2px 6px rgba(15,10,30,0.02)",
                          }}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    )}
                  </>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ══ JOB DETAIL SLIDING DRAWER ══════════════════════════ */}
      <AnimatePresence>
        {selectedJob && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setSelectedJob(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.3)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                zIndex: 100,
              }}
            />

            {/* Sliding Panel */}
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: "fixed",
                background: "#ffffff",
                zIndex: 101,
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                flexDirection: "column",
                boxShadow: isMobile 
                  ? "0 -10px 40px rgba(15, 10, 30, 0.08)"
                  : "-10px 0 40px rgba(15, 10, 30, 0.08)",
                ...(isMobile ? {
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "85vh",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                } : {
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 480,
                  height: "100vh",
                  borderTopLeftRadius: 24,
                  borderBottomLeftRadius: 24,
                })
              }}
            >
              {/* Drawer Container (Scrollable) */}
              <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                
                {/* Close Button Header */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "20px 24px 10px",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(15,10,30,0.38)" }}>
                    Job Details
                  </span>
                  <button
                    onClick={() => setSelectedJob(null)}
                    style={{
                      height: 32,
                      width: 32,
                      borderRadius: "50%",
                      background: "rgba(15,10,30,0.05)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "rgba(15,10,30,0.6)",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(15,10,30,0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(15,10,30,0.05)"}
                  >
                    <XCircle size={18} />
                  </button>
                </div>

                {/* Content Area (Scrollable) */}
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                  {/* Hero Header Section */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "16px 24px 24px", borderBottom: "1px solid rgba(15,10,30,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.025em", lineHeight: 1.25 }}>
                        {selectedJob.title}
                      </h2>
                      <div style={{ flexShrink: 0, marginTop: 4 }}>
                        <StatusBadge status={alreadyApplied ? "applied" : selectedJob.status} />
                      </div>
                    </div>

                    {/* Premium Salary Card */}
                    <div style={{
                      background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
                      border: "1px solid rgba(245,158,11,0.15)",
                      borderRadius: 14,
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 4,
                    }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(180,83,9,0.7)", display: "block", marginBottom: 2 }}>
                          Daily Est. Earnings
                        </span>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                          <span style={{ fontSize: 22, fontWeight: 800, color: "#92400E", letterSpacing: "-0.02em" }}>
                            {selectedJob.salary}
                          </span>
                          <span style={{ fontSize: 13, color: "rgba(146,64,14,0.7)", fontWeight: 600 }}>
                            / day
                          </span>
                        </div>
                      </div>
                      {isWeeklyPayout(selectedJob.title, selectedJob.description) && (
                        <span style={{ 
                          fontSize: 11.5, 
                          fontWeight: 700, 
                          color: "#92400E", 
                          background: "#FEF3C7", 
                          border: "1px solid rgba(217,119,6,0.25)",
                          padding: "4px 10px", 
                          borderRadius: 8,
                          boxShadow: "0 2px 4px rgba(217,119,6,0.04)"
                        }}>
                          Weekly Payout
                        </span>
                      )}
                    </div>

                    {/* Location & Hours Meta */}
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, fontSize: 13.5, color: "rgba(15,10,30,0.5)", fontWeight: 500, marginTop: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <MapPin size={14} style={{ color: "rgba(15,10,30,0.35)" }} />
                        <span>{selectedJob.location}</span>
                      </div>
                      <span style={{ color: "rgba(15,10,30,0.15)" }}>•</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Clock size={14} style={{ color: "rgba(15,10,30,0.35)" }} />
                        <span>{selectedJob.working_hours}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content Section (clean spacing) */}
                  <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
                    
                    {/* Description */}
                    {selectedJob.description && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.38)" }}>
                          About this opportunity
                        </h3>
                        <p style={{ margin: 0, fontSize: 14.5, color: "rgba(15,10,30,0.65)", lineHeight: 1.65, letterSpacing: "-0.005em" }}>
                          {selectedJob.description}
                        </p>
                      </div>
                    )}

                    {/* Detail Grid */}
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 1fr", 
                      gap: "20px 24px", 
                      padding: "20px 0", 
                      borderTop: "1px solid rgba(15,10,30,0.06)", 
                      borderBottom: "1px solid rgba(15,10,30,0.06)" 
                    }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(15,10,30,0.35)", display: "block", marginBottom: 4 }}>
                          Location
                        </span>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{selectedJob.location}</p>
                      </div>

                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(15,10,30,0.35)", display: "block", marginBottom: 4 }}>
                          Working Hours
                        </span>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{selectedJob.working_hours}</p>
                      </div>

                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(15,10,30,0.35)", display: "block", marginBottom: 4 }}>
                          Pay Rate
                        </span>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                          {selectedJob.salary} / working day
                        </p>
                      </div>

                      {selectedJob.workers_required && (
                        <div>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(15,10,30,0.35)", display: "block", marginBottom: 4 }}>
                            Openings
                          </span>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                            {selectedJob.workers_required} workers required
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Highlights List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(15,10,30,0.38)" }}>
                        Highlights
                      </h3>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                        {[
                          "Immediate hiring opportunity",
                          "Flexible working environment",
                          "Weekly payout direct deposits available",
                          "Hyperlocal job opening"
                        ].map((item) => (
                          <li key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "rgba(15,10,30,0.6)" }}>
                            <span style={{ color: "#EA580C", fontWeight: 700 }}>✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Sticky Drawer Actions Footer */}
                <div
                  style={{
                    padding: "16px 24px 24px",
                    borderTop: "1px solid rgba(15,10,30,0.06)",
                    background: "#ffffff",
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
                        borderRadius: 12, padding: "10px 14px",
                        fontSize: 13, fontWeight: 600, color: "#059669",
                      }}
                    >
                      <CheckCircle2 style={{ height: 14, width: 14, flexShrink: 0 }} />
                      You have already submitted an application
                    </div>
                  )}

                  {isClosed && (
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)",
                        borderRadius: 12, padding: "10px 14px",
                        fontSize: 13, fontWeight: 600, color: "#DC2626",
                      }}
                    >
                      <XCircle style={{ height: 14, width: 14, flexShrink: 0 }} />
                      This job opportunity is closed
                    </div>
                  )}

                  <Button
                    onClick={() => applyMutation.mutate(selectedJob.id)}
                    disabled={applyMutation.isPending || alreadyApplied || isClosed}
                    className="jl-apply-btn-airbnb"
                    style={{
                      width: "100%", 
                      height: 48, 
                      borderRadius: 12,
                      fontSize: 14.5, 
                      fontWeight: 600, 
                      border: "none",
                      background:
                        alreadyApplied || isClosed
                          ? "#F1F5F9"
                          : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                      color:
                        alreadyApplied || isClosed ? "#94A3B8" : "#ffffff",
                      cursor: alreadyApplied || isClosed ? "not-allowed" : "pointer",
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      gap: 8,
                      boxShadow: alreadyApplied || isClosed ? "none" : "0 4px 12px rgba(245,158,11,0.2)",
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
