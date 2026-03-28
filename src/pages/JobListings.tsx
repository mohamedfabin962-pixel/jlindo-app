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
    <div className="container py-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Find Work Near You</h1>
      <p className="text-muted-foreground text-sm mb-4">Browse open jobs in your area</p>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title or location…"
          className="pl-9"
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
                className="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => setSelectedJob(job.id)}
              >
                <div className="space-y-3">

  {/* Title + status */}
  <div className="flex justify-between items-start">
    <h3 className="text-base font-semibold leading-tight">
      {job.title}
    </h3>
    <StatusBadge status="open" />
  </div>

  {/* Location */}
  <div className="text-sm text-muted-foreground flex items-center gap-1">
    <MapPin size={14} />
    {job.location}
  </div>

  {/* Salary highlight */}
  <div className="text-lg font-bold text-primary">
    {job.salary}
  </div>

  {/* Extra info */}
  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
    <span className="flex items-center gap-1">
      <Clock size={14} /> {job.working_hours}
    </span>

    {job.workers_required && (
      <span className="flex items-center gap-1">
        <Users size={14} />
        {job.workers_required - (job.applications?.filter((a:any) => a.status === "accepted").length || 0)} spots left
      </span>
    )}
  </div>

  {/* Applied badge */}
  {applied && (
    <div className="text-xs font-medium text-success">
      Applied ✓
    </div>
  )}

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
  <div className="text-sm leading-relaxed text-muted-foreground">
    {jobDetail.description}
  </div>

  {/* Apply section */}
  {jobDetail?.status !== "open" ? (
    <Button disabled className="w-full">
      Job Closed
    </Button>
  ) : myApplications?.includes(jobDetail?.id) ? (
    <Button disabled className="w-full bg-success text-success-foreground">
      Application Sent ✓
    </Button>
  ) : (
    <Button
      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
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
  );
}
