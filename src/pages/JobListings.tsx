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
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
    <div className="container py-6 max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold tracking-tight mb-1 text-gray-900">Find Work Near You</h1>
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
  className="w-full text-left bg-white rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] border border-border/60 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] hover:border-border transition-all duration-300 cursor-pointer group"
>
  {/* Top section */}
  <div className="p-4 space-y-3">
    <div className="flex items-start gap-3.5">
      
      {/* Logo placeholder */}
      <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
        <span className="text-lg font-bold text-muted-foreground">
          {job.title.charAt(0)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          
          <div className="min-w-0">
            <h3 className="font-semibold text-card-foreground text-[15px] leading-snug truncate group-hover:text-foreground transition-colors">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {job.location}
            </p>
          </div>

          <StatusBadge status={job.status || "open"} />
        </div>
      </div>
    </div>
  </div>

  {/* Salary highlight */}
  <div className="px-4 pb-4">
    <div className="flex items-center justify-between bg-primary/10 rounded-xl px-4 py-3">
      <div>
        <p className="text-primary font-bold text-xl tracking-tight">
          {job.salary}
        </p>
        <p className="text-muted-foreground text-xs mt-0.5">
          per day
        </p>
      </div>

      <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
    </div>
  </div>

  {/* Bottom info */}
  <div className="px-4 pb-4 flex items-center gap-4 text-sm text-muted-foreground">
    <div className="flex items-center gap-1.5">
      <MapPin className="h-3.5 w-3.5" />
      <span className="truncate">{job.location}</span>
    </div>

    <span className="text-border">|</span>

    <div className="flex items-center gap-1.5">
      <Clock className="h-3.5 w-3.5" />
      <span>{job.working_hours}</span>
    </div>
  </div>

  {/* Applied badge */}
  {applied && (
    <div className="px-4 pb-3 text-xs font-medium text-success">
      Applied ✓
    </div>
  )}
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
 <DialogContent className="w-[95%] max-w-md rounded-2xl p-5 bg-white shadow-2xl border mx-auto backdrop-blur-none">
        
          {jobDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{jobDetail.title}</DialogTitle>
              </DialogHeader>
              <div className="max-h-[80vh] overflow-y-auto space-y-4 pb-2 bg-white">

  {/* Title */}
  <h2 className="text-lg font-bold leading-tight">
    {jobDetail.title}
  </h2>

  {/* Location */}
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <MapPin size={16} />
    {jobDetail.location}
  </div>

  {/* Salary */}
  <div className="text-xl font-bold text-primary">
    {jobDetail.salary}
  </div>

  {/* Working hours */}
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Clock size={16} />
    {jobDetail.working_hours}
  </div>

  {/* Workers needed */}
  {jobDetail.workers_required && (
    <div className="text-sm text-muted-foreground">
      Workers needed: {jobDetail.workers_required}
    </div>
  )}

{/* Description */}
<div className="bg-muted/40 rounded-xl p-3 text-sm leading-relaxed">
  {jobDetail.description}
</div>

  {/* Apply section */}
  {jobDetail?.status !== "open" ? (
    <Button disabled className="w-full">
      Job Closed
    </Button>
  ) : myApplications?.includes(jobDetail?.id) ? (
    <Button disabled className="w-full bg-green-500 text-white rounded-xl">
      Application Sent ✓
    </Button>
  ) : (
    <Button
  className="w-full bg-primary text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
      onClick={() => applyMutation.mutate(jobDetail.id)}
      disabled={applyMutation.isPending}
    >
      {applyMutation.isPending ? "Applying…" : "Apply Now"}
    </Button>
  )}

</div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
