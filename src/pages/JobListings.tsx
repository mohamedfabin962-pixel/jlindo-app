import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, Clock, Search, ArrowRight, Loader2, CheckCircle2, XCircle, ChevronRight, Zap,
  ChevronLeft, Navigation, ExternalLink,
  SlidersHorizontal, FileText, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JobCardSkeleton } from "@/components/BrandedLoading";
import { EmptyState } from "@/components/EmptyState";
import { getCategoryIllustration, inferCategoryFromText, JOB_CATEGORIES } from "@/utils/jobCategories";
import { decodeLocation, decodeWorkingHours } from "@/utils/locationUtils";

// We now use getCategoryIllustration and inferCategoryFromText from jobCategories.tsx

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

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSalary, setFilterSalary] = useState("All");
  const [filterHours, setFilterHours] = useState("All");

  const activeFilterCount = [
    filterCategory !== "All",
    filterStatus !== "All",
    filterSalary !== "All",
    filterHours !== "All"
  ].filter(Boolean).length;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset pagination to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const overlayVariants: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const drawerVariants: any = {
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
    const matchesSearch =
      j.title.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      (j.description && j.description.toLowerCase().includes(q));

    const jCat = j.category || inferCategoryFromText(j.title, j.description);
    const matchesCategory = filterCategory === "All" || jCat === filterCategory;
    
    const matchesStatus = filterStatus === "All" || 
      (filterStatus === "Open" ? j.status === "open" : j.status !== "open");
      
    let matchesSalary = true;
    if (filterSalary !== "All" && j.salary) {
      const s = j.salary.toLowerCase();
      const num = parseInt(s.replace(/[^0-9]/g, '')) || 0;
      if (filterSalary === "Under ₹500") matchesSalary = num > 0 && num < 500;
      if (filterSalary === "₹500 - ₹1000") matchesSalary = num >= 500 && num <= 1000;
      if (filterSalary === "₹1000+") matchesSalary = num > 1000;
    } else if (filterSalary !== "All") {
      matchesSalary = false;
    }

    let matchesHours = true;
    if (filterHours !== "All" && j.working_hours) {
      const h = j.working_hours.toLowerCase();
      if (filterHours === "Morning") matchesHours = h.includes("am") || h.includes("morning");
      if (filterHours === "Evening") matchesHours = h.includes("pm") || h.includes("evening");
      if (filterHours === "Night") matchesHours = h.includes("night") || h.includes("pm");
      if (filterHours === "Full Time") matchesHours = h.includes("full") || h.includes("9") || h.includes("8") || h.includes("10");
      if (filterHours === "Part Time") matchesHours = h.includes("part") || h.includes("4") || h.includes("5") || h.includes("6");
    } else if (filterHours !== "All") {
      matchesHours = false;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesSalary && matchesHours;
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

          {/* ── SEARCH BAR & FILTERS ────────────────────── */}
          <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  height: 17, width: 17, color: "rgba(15,10,30,0.30)",
                }}
              />
              <Input
                placeholder="Search jobs or keywords…"
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
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              style={{
                height: 50,
                padding: "0 20px",
                borderRadius: 14,
                border: activeFilterCount > 0 ? "1px solid #F59E0B" : "1px solid rgba(15,10,30,0.10)",
                background: activeFilterCount > 0 ? "#FFFBEB" : "#ffffff",
                color: activeFilterCount > 0 ? "#D97706" : "#334155",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 2px 12px rgba(15,10,30,0.03)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (activeFilterCount === 0) {
                  e.currentTarget.style.background = "#F8FAFC";
                  e.currentTarget.style.borderColor = "rgba(15,10,30,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilterCount === 0) {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor = "rgba(15,10,30,0.10)";
                }
              }}
            >
              <SlidersHorizontal size={16} />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>
          </div>

          {/* ══ FILTER SLIDING DRAWER ══════════════════════════ */}
          <AnimatePresence>
            {isFilterOpen && (
              <>
                <motion.div
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => setIsFilterOpen(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(15, 23, 42, 0.3)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    zIndex: 100,
                  }}
                />
                <motion.div
                  variants={drawerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="fixed bottom-0 left-0 right-0 h-[85vh] md:top-0 md:left-auto md:right-0 md:bottom-0 md:h-screen w-full md:max-w-md bg-white z-[101] shadow-2xl flex flex-col rounded-t-3xl md:rounded-t-none md:rounded-l-3xl overflow-hidden border-t md:border-t-0 md:border-l border-slate-100"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 m-0 tracking-tight">Filters</h2>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors border border-slate-200"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
                    
                    {/* Category */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Job Category</h3>
                      <div className="flex flex-wrap gap-2">
                        {["All", ...JOB_CATEGORIES].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border ${filterCategory === cat ? "bg-amber-100 text-amber-700 border-amber-200 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Status</h3>
                      <div className="flex flex-wrap gap-2">
                        {["All", "Open", "Closed"].map(st => (
                          <button
                            key={st}
                            onClick={() => setFilterStatus(st)}
                            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border ${filterStatus === st ? "bg-amber-100 text-amber-700 border-amber-200 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Salary */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Salary Range</h3>
                      <div className="flex flex-wrap gap-2">
                        {["All", "Under ₹500", "₹500 - ₹1000", "₹1000+"].map(sal => (
                          <button
                            key={sal}
                            onClick={() => setFilterSalary(sal)}
                            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border ${filterSalary === sal ? "bg-amber-100 text-amber-700 border-amber-200 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
                          >
                            {sal}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hours */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Working Hours</h3>
                      <div className="flex flex-wrap gap-2">
                        {["All", "Full Time", "Part Time", "Morning", "Evening", "Night"].map(hr => (
                          <button
                            key={hr}
                            onClick={() => setFilterHours(hr)}
                            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border ${filterHours === hr ? "bg-amber-100 text-amber-700 border-amber-200 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
                          >
                            {hr}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Footer */}
                  <div className="p-5 border-t border-slate-100 flex gap-3 bg-white shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                    <button
                      onClick={() => {
                        setFilterCategory("All");
                        setFilterStatus("All");
                        setFilterSalary("All");
                        setFilterHours("All");
                      }}
                      className="flex-1 px-4 py-3.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="flex-1 px-4 py-3.5 rounded-xl font-bold text-[#1c0e00] shadow-[0_4px_16px_rgba(245,158,11,0.28)] hover:-translate-y-0.5 transition-transform"
                      style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" }}
                    >
                      Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

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
              title={search.trim() ? "Empty search results" : "No jobs found"}
              description="We couldn't find any jobs matching your search. Try different keywords."
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
                      const categoryValue = job.category || inferCategoryFromText(job.title, job.description);
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
                          onClick={() => {
                            setSelectedJob(job);
                          }}
                          className="jl-job-card-airbnb group"
                          style={{
                            width: "100%",
                            textAlign: "left",
                            background: "#ffffff",
                            borderRadius: 20,
                            border: selectedJob?.id === job.id 
                              ? "2px solid #F59E0B" 
                              : "1px solid rgba(15,10,30,0.06)",
                            boxShadow: selectedJob?.id === job.id
                              ? "0 8px 30px rgba(245,158,11,0.08)"
                              : "0 4px 18px rgba(15,10,30,0.015)",
                            cursor: "pointer",
                            padding: "24px",
                            position: "relative",
                            display: "flex",
                            gap: 16,
                            transition: "all 0.2s ease",
                          }}
                        >
                          {/* Left Column: Core Info */}
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                            
                            {/* Top Badge Row */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                              <div>
                                {applied ? (
                                  <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981", background: "#ECFDF5", padding: "4px 10px", borderRadius: 8, letterSpacing: "0.03em", textTransform: "uppercase" }}>
                                    Applied
                                  </span>
                                ) : closed ? (
                                  <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", background: "#F1F5F9", padding: "4px 10px", borderRadius: 8, letterSpacing: "0.03em", textTransform: "uppercase" }}>
                                    Closed
                                  </span>
                                ) : (
                                  <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", background: "#F1F5F9", padding: "4px 10px", borderRadius: 8, letterSpacing: "0.03em", textTransform: "uppercase" }}>
                                    Open
                                  </span>
                                )}
                              </div>
                              
                              {hasWeeklyPayout && (
                                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#D97706", fontSize: 12, fontWeight: 700 }}>
                                  <Zap size={12} fill="#D97706" stroke="none" />
                                  <span>Weekly Payout</span>
                                </div>
                              )}
                            </div>

                            {/* Job Title */}
                            <h3 style={{
                              margin: "4px 0 0",
                              fontSize: 20,
                              fontWeight: 800,
                              color: "#0f172a",
                              letterSpacing: "-0.025em",
                              lineHeight: 1.25,
                            }}>
                              {job.title}
                            </h3>

                            {/* Location & Hours Row with Icons */}
                             {(() => {
                               const loc = decodeLocation(job.location);
                               const displayCity = loc.city || job.location;
                               return (
                                 <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", margin: "2px 0 4px", fontSize: 13.5, color: "#64748B", fontWeight: 500 }}>
                                   <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                     <MapPin size={14} style={{ color: "#94A3B8" }} />
                                     <span>{displayCity}</span>
                                   </div>
                                   <span style={{ color: "#CBD5E1" }}>·</span>
                                   <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                     <Clock size={14} style={{ color: "#94A3B8" }} />
                                     <span>{job.working_hours}</span>
                                   </div>
                                 </div>
                               );
                             })()}

                            {/* Description: 2 lines maximum */}
                            {job.description && (
                              <p style={{
                                margin: 0,
                                fontSize: 13.5,
                                color: "#475569",
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

                            {/* Salary Highlight Badges */}
                            <div style={{ marginTop: 8 }}>
                              <div style={{
                                background: "#FFF7ED",
                                border: "1px solid rgba(245,158,11,0.12)",
                                borderRadius: 10,
                                padding: "6px 12px",
                                display: "inline-flex",
                                alignItems: "baseline",
                                gap: 3
                              }}>
                                <span style={{ fontSize: 16, fontWeight: 800, color: "#EA580C", letterSpacing: "-0.02em" }}>
                                  {job.salary}
                                </span>
                                <span style={{ fontSize: 12, color: "#9A3412", fontWeight: 600 }}>
                                  /day
                                </span>
                              </div>
                            </div>

                          </div>

                          {/* Right Column: Category Box & Arrow button */}
                          <div style={{ 
                            width: 68, 
                            display: "flex", 
                            flexDirection: "column", 
                            justifyContent: "space-between", 
                            alignItems: "flex-end",
                            alignSelf: "stretch",
                            flexShrink: 0
                          }}>
                            {/* Category Illustration container */}
                            {getCategoryIllustration(categoryValue)}

                            {/* Circle Arrow CTA */}
                            <div 
                              className="group-hover:translate-x-0.5 transition-transform"
                              style={{ 
                                width: 30, 
                                height: 30, 
                                borderRadius: "50%", 
                                background: "#FFF7ED", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <ArrowRight size={14} style={{ color: "#EA580C" }} />
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
              className="fixed bottom-0 left-0 right-0 h-[85vh] md:top-0 md:right-0 md:left-auto md:bottom-0 md:h-screen w-full md:max-w-lg lg:max-w-xl bg-white z-[101] shadow-2xl flex flex-col rounded-t-3xl md:rounded-t-none md:rounded-l-3xl overflow-hidden border-t md:border-t-0 md:border-l border-slate-100"
              style={{
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {/* Drawer Container */}
              <div className="flex flex-col h-full overflow-hidden relative">
                
                {/* Close Button absolute inside Hero */}
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white border-none cursor-pointer flex items-center justify-center text-slate-900 shadow-md hover:scale-105 transition-transform z-10"
                >
                  <XCircle size={18} />
                </button>

                {/* Content Area (Scrollable) */}
                <div className="flex-1 overflow-y-auto flex flex-col">
                  
                  {/* Hero Header Section */}
                  <div 
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 md:p-8 pt-10 md:pt-8"
                    style={{ 
                      background: "linear-gradient(135deg, #0b081b 0%, #15102a 60%, #43210d 100%)",
                    }}
                  >
                    {/* Left content */}
                    <div className="flex-1 flex flex-col gap-3 w-full">
                      <div>
                        {alreadyApplied ? (
                          <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/15 px-2.5 py-1 rounded-md tracking-wider uppercase">
                            Applied
                          </span>
                        ) : isClosed ? (
                          <span className="text-[11px] font-bold text-slate-400 bg-slate-400/15 px-2.5 py-1 rounded-md tracking-wider uppercase">
                            Closed
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/15 px-2.5 py-1 rounded-md tracking-wider uppercase">
                            Open
                          </span>
                        )}
                      </div>

                      <h2 className="m-0 text-xl md:text-2xl font-extrabold text-white tracking-tight leading-snug">
                        {selectedJob.title}
                      </h2>

                      {selectedJob.description && (
                        <p className="m-0 text-sm md:text-base text-slate-300 leading-relaxed opacity-95">
                          {selectedJob.description}
                        </p>
                      )}

                      {/* Location & Hours Meta */}
                      {(() => {
                        const loc = decodeLocation(selectedJob.location);
                        const displayCity = loc.city || selectedJob.location;
                        return (
                          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-200 font-medium mt-1">
                            <div className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-amber-500" />
                              <span>{displayCity}</span>
                            </div>
                            <span className="text-slate-500">•</span>
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-amber-500" />
                              <span>{selectedJob.working_hours}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Right side: Floating Salary Card */}
                    <div className="bg-white p-5 rounded-2xl shadow-xl w-full md:w-48 lg:w-52 shrink-0 flex flex-col gap-2.5 border border-slate-100">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-orange-600 tracking-tight">
                            {selectedJob.salary}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">
                            /day
                          </span>
                        </div>
                      </div>
                      
                      {isWeeklyPayout(selectedJob.title, selectedJob.description) && (
                        <div className="flex items-center gap-1.5 text-orange-600 text-xs font-bold border-t border-slate-100 pt-2.5 mt-1">
                          <Zap size={13} fill="#EA580C" stroke="none" />
                          <span>Weekly Payout</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content Section */}
                  <div className="p-6 md:p-8 flex flex-col gap-6 md:gap-8">
                    
                    {/* About This Opportunity */}
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-orange-600" />
                        <h3 className="m-0 text-base md:text-lg font-bold text-slate-900">
                          About This Opportunity
                        </h3>
                      </div>
                      <p className="m-0 text-sm md:text-base text-slate-600 leading-relaxed">
                        We are looking for a reliable and active worker to assist in daily operations. Responsibilities include assisting customers, arranging items, maintaining cleanliness, and other general tasks.
                      </p>
                    </div>

                    {/* Information Grid */}
                    {(() => {
                      const loc = decodeLocation(selectedJob.location);
                      const displayCity = loc.city || selectedJob.location;
                      return (
                        <div className="py-6 border-y border-slate-100 flex flex-col gap-4">
                          {/* City */}
                          <div className="flex gap-2.5 items-start">
                            <MapPin size={16} className="text-orange-600 mt-1 flex-shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-slate-900 block mb-0.5">City</span>
                              <p className="m-0 text-sm text-slate-600 font-medium">{displayCity}</p>
                            </div>
                          </div>

                          {/* Exact Location — only when new format */}
                          {loc.exactLocation && (
                            <div className="flex gap-2.5 items-start">
                              <Navigation size={16} className="text-orange-600 mt-1 flex-shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-slate-900 block mb-0.5">Exact Location</span>
                                <p className="m-0 text-sm text-slate-600 font-medium">{loc.exactLocation}</p>
                              </div>
                            </div>
                          )}

                          {/* Google Maps link */}
                          {loc.mapsUrl && (
                            <div className="flex gap-2.5 items-start">
                              <ExternalLink size={16} className="text-orange-600 mt-1 flex-shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-slate-900 block mb-0.5">Directions</span>
                                <a
                                  href={loc.mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                                >
                                  Open in Google Maps
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Working Hours */}
                          <div className="flex gap-2.5 items-start">
                            <Clock size={16} className="text-orange-600 mt-1 flex-shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-slate-900 block mb-0.5">Working Hours</span>
                              <p className="m-0 text-sm text-slate-600 font-medium">{selectedJob.working_hours}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Job Highlights */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Star size={18} className="text-orange-600" />
                        <h3 className="m-0 text-base md:text-lg font-bold text-slate-900">
                          Job Highlights
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs md:text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-xl">
                          Immediate hiring
                        </span>
                        <span className="text-xs md:text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-3.5 py-1.5 rounded-xl">
                          Flexible working
                        </span>
                        {isWeeklyPayout(selectedJob.title, selectedJob.description) && (
                          <span className="text-xs md:text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-xl">
                            Weekly payout
                          </span>
                        )}
                        <span className="text-xs md:text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-3.5 py-1.5 rounded-xl">
                          Local opportunity
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Drawer Actions Footer */}
                <div className="p-6 md:p-8 border-t border-slate-100 bg-white flex flex-col gap-3">
                  {alreadyApplied && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-xs md:text-sm font-semibold text-emerald-800">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span>You already applied for this job on Mar 17, 2025.</span>
                    </div>
                  )}

                  {isClosed && (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl p-3.5 text-xs md:text-sm font-semibold text-rose-800">
                      <XCircle size={16} className="text-rose-500 shrink-0" />
                      <span>This job opportunity is closed</span>
                    </div>
                  )}

                  <Button
                    onClick={() => applyMutation.mutate(selectedJob.id)}
                    disabled={applyMutation.isPending || alreadyApplied || isClosed}
                    className="jl-apply-btn-airbnb"
                    style={{
                      width: "100%", 
                      height: 50, 
                      borderRadius: 12,
                      fontSize: 14.5, 
                      fontWeight: 700, 
                      background:
                        alreadyApplied || isClosed
                          ? "#FFF7ED"
                          : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                      color:
                        alreadyApplied || isClosed ? "#EA580C" : "#ffffff",
                      border: alreadyApplied || isClosed ? "1px solid rgba(245,158,11,0.15)" : "none",
                      cursor: applyMutation.isPending || alreadyApplied || isClosed ? "not-allowed" : "pointer",
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
                      <><CheckCircle2 size={16} style={{ color: "#EA580C" }} /> Already Applied</>
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
