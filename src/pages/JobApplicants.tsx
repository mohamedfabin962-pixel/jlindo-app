import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Phone, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function JobApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  const { data: applications, isLoading } = useQuery({
    queryKey: ["job-applications", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, profiles!applications_worker_id_fkey(full_name, phone)")
        .eq("job_id", jobId!)
        .order("created_at", { ascending: false });
      if (error) {
        // Fallback without join
        const { data: apps, error: err2 } = await supabase
          .from("applications")
          .select("*")
          .eq("job_id", jobId!)
          .order("created_at", { ascending: false });
        if (err2) throw err2;
        // Fetch profiles separately
        const workerIds = apps.map(a => a.worker_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, phone")
          .in("user_id", workerIds);
        return apps.map(a => ({
          ...a,
          profile: profiles?.find(p => p.user_id === a.worker_id),
        }));
      }
      return data.map((a: any) => ({
        ...a,
        profile: a.profiles,
      }));
    },
    enabled: !!jobId,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ appId, status }: { appId: string; status: string }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", appId);
      if (error) throw error;

      // Check if job should be marked as filled
      if (status === "accepted" && job?.workers_required) {
        const { data: accepted } = await supabase
          .from("applications")
          .select("id")
          .eq("job_id", jobId!)
          .eq("status", "accepted");
        if (accepted && accepted.length >= job.workers_required) {
          await supabase.from("jobs").update({ status: "filled" }).eq("id", jobId!);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications", jobId] });
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      toast({ title: "Application updated" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="container py-6 max-w-2xl">
      {job && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-sm text-muted-foreground">{job.location} • {job.salary} • {job.working_hours}</p>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4">Applicants</h2>
      <Button
  variant="destructive"
  onClick={async () => {
    await supabase.from("jobs").update({ status: "closed" }).eq("id", jobId);
    window.location.reload();
  }}
>
  Close Job
</Button>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {applications?.map((app: any) => (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border p-4 rounded-xl bg-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{app.profile?.full_name || "Worker"}</p>
                  <p className="text-xs text-muted-foreground">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>

              {app.status === "accepted" && app.profile?.phone && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 p-3 rounded-lg bg-success/10 border border-success/20"
                >
                  <a href={`tel:${app.profile.phone}`} className="flex items-center gap-2 text-success font-medium">
                    <Phone size={16} /> {app.profile.phone}
                  </a>
                </motion.div>
              )}

              {app.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    className="bg-success text-success-foreground hover:bg-success/90"
                    onClick={() => updateStatus.mutate({ appId: app.id, status: "accepted" })}
                    disabled={updateStatus.isPending}
                  >
                    <Check size={14} className="mr-1" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus.mutate({ appId: app.id, status: "rejected" })}
                    disabled={updateStatus.isPending}
                  >
                    <X size={14} className="mr-1" /> Reject
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {applications?.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-8">No applicants yet.</p>
        )}
      </div>
    </div>
  );
}
