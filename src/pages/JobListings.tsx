import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Users, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";

export default function JobListings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

//   const { data: jobs, isLoading } = useQuery({
//     queryKey: ["jobs"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("jobs")
//         .select("*")
//         // .eq("status", "open")
//         .order("created_at", { ascending: false });
// console.log("JOBS DATA →", data);
// console.log("JOBS ERROR →", error);

//       if (error) throw error;
//       return data;
//     },
//   });
const [jobs, setJobs] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadJobs = async () => {
    const { data, error } = await supabase
  .from("jobs")
  .select(`
    *,
    applications!applications_job_id_fkey(status)
  `);

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
      toast({ title: "Error", description: err.message, variant: "destructive" });
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

  const jobDetail = jobs?.find((j) => j.id === selectedJob);

return (
  <div className="min-h-screen bg-slate-50">
    <div className="container max-w-2xl py-6 space-y-5">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Find Work Near You</h1>
      <p className="text-gray-600 text-sm mb-4">Browse open jobs in your area</p>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title or location…"
          className="pl-9 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {filtered?.map((job) => {
            const applied = myApplications?.includes(job.id);
            return (
              <motion.div
  key={job.id}
  layout
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => setSelectedJob(job.id)}
className="relative w-full text-left bg-white rounded-2xl border-l-4 border-l-primary shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer group">
  {applied && (
  <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
    <div className="absolute transform translate-x-4 -translate-y-4 rotate-45 bg-green-500 text-white text-[10px] font-bold py-1 w-24 text-center right-0 top-0 shadow-sm">
      Applied
    </div>
  </div>
)}
  <div className="flex items-start gap-4">
  <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/50 shadow-sm group-hover:bg-primary/10 group-hover:text-primary transition-colors">
    <span className="text-xl font-bold uppercase">
      {job.title.charAt(0)}
    </span>
  </div>

  <div className="flex-1 min-w-0 pt-0.5 space-y-1">
    <div className="flex items-start justify-between gap-3">
      <h3 className="font-semibold text-slate-900 text-lg leading-tight truncate group-hover:text-primary transition-colors">
        {job.title}
      </h3>
      <StatusBadge status={job.status || "open"} />
    </div>

    <div className="flex items-center gap-1.5 text-sm text-slate-500">
      <MapPin className="h-3.5 w-3.5" />
      <span className="truncate">{job.location}</span>
    </div>
  </div>
</div>
<div className="flex border-t border-slate-100 pt-4 mt-3 items-center justify-between">

  <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
    <div className="flex items-center gap-1.5">
      <Clock className="h-4 w-4 text-slate-400" />
      <span>{job.working_hours}</span>
    </div>
  </div>

  <div className="flex items-center gap-2">
    <div className="text-right">
      <p className="font-bold text-[17px] tracking-tight text-slate-900">
        {job.salary}
      </p>
      <p className="text-slate-400 text-[11px] font-medium uppercase mt-1">
        per day
      </p>
    </div>

    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all ml-1" />
  </div>

</div>
</motion.div>
            );
          })}
        </AnimatePresence>

        {filtered?.length === 0 && !isLoading && (
  <div className="text-center py-12 space-y-3">
    <div className="text-4xl">🔍</div>
    <p className="font-semibold">No jobs available right now</p>
    <p className="text-sm text-muted-foreground">
      Try searching another location or check back later.
    </p>
    <Button
      variant="outline"
      onClick={() => setSearch("")}
    >
      Clear Search
    </Button>
  </div>
)}
      </div>

      {/* Job detail modal */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
<DialogContent className="w-[95%] max-w-md rounded-3xl p-0 bg-white shadow-2xl border-0 overflow-hidden">        
          {jobDetail && (
            <>
              <div className="h-28 bg-slate-900 relative flex items-end p-4">

  {/* Status badge */}
  <div className="absolute top-3 right-3 bg-white/10 backdrop-blur px-2.5 py-1 rounded-full text-white text-xs font-semibold">
    {jobDetail.status || "open"}
  </div>

  {/* Logo circle */}
  <div className="h-14 w-14 rounded-xl bg-white flex items-center justify-center shadow-md absolute -bottom-6 left-4">
    <span className="text-xl font-bold text-slate-900">
      {jobDetail.title.charAt(0)}
    </span>
  </div>

</div>
<div className="max-h-[85vh] overflow-y-auto bg-white">

  {/* TOP CONTENT */}
  <div className="px-6 pt-10 pb-6 space-y-6">

    {/* Title */}
    <h2 className="text-2xl font-semibold text-slate-900 leading-tight tracking-tight">
      {jobDetail.title}
    </h2>

    {/* Meta info */}
    <div className="flex flex-wrap gap-2 text-sm">

      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
        <MapPin className="h-4 w-4 opacity-70" />
        {jobDetail.location}
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
        <Clock className="h-4 w-4 opacity-70" />
        {jobDetail.working_hours}
      </div>

      {jobDetail.workers_required && (
        <div className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
          {jobDetail.workers_required} needed
        </div>
      )}
    </div>

    {/* Salary (FOCUS ELEMENT) */}
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 shadow-lg">

      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white to-transparent" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/60 mb-1">
            Earnings
          </p>
          <p className="text-3xl font-bold text-white">
            {jobDetail.salary}
          </p>
        </div>

        <span className="text-xs uppercase text-white/60 font-medium">
          per day
        </span>
      </div>
    </div>

    {/* Divider */}
    <div className="border-t border-slate-100" />

    {/* Description */}
    {jobDetail.description && (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 tracking-wide">
          Role Details
        </h3>

        <p className="text-[15px] leading-relaxed text-slate-600">
          {jobDetail.description}
        </p>
      </div>
    )}

  </div>

  {/* ACTION AREA */}
  <div className="p-6 border-t border-slate-100 bg-white">

    {jobDetail?.status !== "open" ? (
      <button className="w-full h-12 rounded-xl bg-slate-200 text-slate-500 font-medium">
        Position Closed
      </button>
    ) : myApplications?.includes(jobDetail?.id) ? (
      <button className="w-full h-12 rounded-xl bg-emerald-50 text-emerald-600 font-medium border border-emerald-200">
        Application Sent ✓
      </button>
    ) : (
      <button
        className="w-full h-12 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
        onClick={() => applyMutation.mutate(jobDetail.id)}
        disabled={applyMutation.isPending}
      >
        {applyMutation.isPending ? "Submitting…" : "Apply for this job"}
      </button>
    )}

  </div>

</div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
