import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";

export default function JobListings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

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
  if (err.message?.toLowerCase().includes("duplicate")) {
    toast({
      title: "Already Applied",
      description: "You have already applied for this job.",
    });
  } else {
    toast({
      title: "Error",
      description: err.message,
      variant: "destructive",
    });
  }
}
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
  const alreadyApplied = selectedJob && myApplications?.includes(selectedJob.id);
const isClosed = selectedJob && selectedJob.status !== "open";
return (
  <div className="min-h-screen bg-slate-50">
    <div className="container max-w-2xl py-6 space-y-5">

      <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
        Find Work Near You
      </h1>

      <p className="text-sm text-slate-500">
        Browse open jobs in your area
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by title or location…"
          className="pl-9 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-0 focus:border-slate-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {/* Job List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered?.map((job) => {
            const applied = myApplications?.includes(job.id);

            return (
              <motion.button
                type="button"
                key={job.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => setSelectedJob(job)}  // ✅ FIXED
                className="relative w-full text-left bg-white rounded-2xl border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
              >

                {/* Applied ribbon */}
                {applied && (
                  <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                    <div className="absolute transform translate-x-4 -translate-y-4 rotate-45 bg-green-500 text-white text-[10px] font-bold py-1 w-24 text-center shadow-sm">
                      Applied
                    </div>
                  </div>
                )}

                {/* Top */}
                <div className="flex items-start gap-4 p-4">

                  <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/50 shadow-sm">
                    <span className="text-xl font-bold uppercase">
                      {job.title.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-900 text-base truncate">
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

                {/* Bottom */}
                <div className="flex border-t border-slate-100 px-4 pb-4 pt-3 items-center justify-between">

                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{job.working_hours}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {job.salary}
                      </p>
                      <p className="text-slate-400 text-[11px] uppercase">
                        per day
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 transition-all" />
                  </div>

                </div>

              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

<Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
  <DialogContent className="w-[95%] max-w-lg rounded-3xl p-0 bg-white shadow-2xl overflow-hidden">

    {selectedJob && (
      <div className="flex flex-col max-h-[85vh] overflow-y-auto">

        {/* HEADER */}
        <div className="bg-slate-900 p-5 space-y-3">

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white leading-tight">
              {selectedJob.title}
            </h2>

            <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-white font-medium">
              {selectedJob.status || "open"}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-white/80">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {selectedJob.location}
            </span>

            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {selectedJob.working_hours}
            </span>
          </div>

        </div>

        {/* BODY */}
        <div className="p-5 space-y-5">

          {/* SALARY CARD */}
          <div className="bg-slate-100 rounded-2xl p-4 flex justify-between items-center border border-slate-200">
            <div>
              <p className="text-xs text-slate-500 uppercase">Daily Pay</p>
              <p className="text-xl font-bold text-slate-900">
                {selectedJob.salary}
              </p>
            </div>
            <span className="text-xs text-slate-500">per day</span>
          </div>

          {/* DETAILS GRID */}
          <div className="grid grid-cols-2 gap-3">

            <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm">
              <p className="text-slate-400 text-xs">Location</p>
              <p className="font-medium text-slate-900 mt-1">
                {selectedJob.location}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm">
              <p className="text-slate-400 text-xs">Working Hours</p>
              <p className="font-medium text-slate-900 mt-1">
                {selectedJob.working_hours}
              </p>
            </div>

            {selectedJob.workers_required && (
              <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm col-span-2">
                <p className="text-slate-400 text-xs">Workers Needed</p>
                <p className="font-medium text-slate-900 mt-1">
                  {selectedJob.workers_required}
                </p>
              </div>
            )}

          </div>

          {/* 🔥 DESCRIPTION BOX (MAIN UPGRADE) */}
          {selectedJob.description && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Job Description
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                {selectedJob.description}
              </p>
            </div>
          )}

        </div>

        {/* ACTION */}
       <div className="p-5 border-t border-slate-100 bg-white space-y-3">

  {alreadyApplied && (
    <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 text-center">
      ✅ You already applied
    </div>
  )}

  {isClosed && (
    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 text-center">
      ❌ This job is no longer available
    </div>
  )}

  <Button
    className="w-full h-12 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all disabled:bg-slate-300 disabled:text-slate-500"
    onClick={() => applyMutation.mutate(selectedJob.id)}
    disabled={applyMutation.isPending || alreadyApplied || isClosed}
  >
    {isClosed
      ? "Job Closed"
      : alreadyApplied
      ? "Already Applied"
      : applyMutation.isPending
      ? "Applying..."
      : "Apply for this job"}
  </Button>

</div>
      </div>
    )}

  </DialogContent>
</Dialog>
    

    </div>
  </div>
);
}
