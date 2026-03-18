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
      .select("*");

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
    const q = search.toLowerCase();
    return j.title.toLowerCase().includes(q) || j.location.toLowerCase().includes(q);
  });

  const jobDetail = jobs?.find((j) => j.id === selectedJob);

  return (
    <div className="container py-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Find a shift</h1>
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
                className="border p-4 rounded-xl bg-card hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedJob(job.id)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold tracking-tight">{job.title}</h3>
                  <span className="font-mono-tabular text-primary font-semibold">{job.salary}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {job.working_hours}</span>
                  {job.workers_required && (
                    <span className="flex items-center gap-1"><Users size={14} /> {job.workers_required} needed</span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge status={job.status} />
                  {applied && (
                    <span className="text-xs font-medium text-success">Applied ✓</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered?.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-8">No jobs found. Try a different search.</p>
        )}
      </div>

      {/* Job detail modal */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-lg">
          {jobDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{jobDetail.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {jobDetail.location}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {jobDetail.working_hours}</span>
                </div>
                <div className="font-mono-tabular text-primary text-lg font-semibold">{jobDetail.salary}</div>
                {jobDetail.workers_required && (
                  <p className="text-sm text-muted-foreground">{jobDetail.workers_required} workers needed</p>
                )}
                <p className="text-sm leading-relaxed">{jobDetail.description}</p>
                <p className="text-xs text-muted-foreground">
                  Posted {new Date(jobDetail.created_at).toLocaleDateString()}
                </p>
                {myApplications?.includes(jobDetail.id) ? (
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
