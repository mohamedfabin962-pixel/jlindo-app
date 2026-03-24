import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Users } from "lucide-react";

export default function EmployerDashboard() {
  const { user } = useAuth();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["employer-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get application counts per job
  const { data: appCounts } = useQuery({
    queryKey: ["employer-app-counts"],
    queryFn: async () => {
      if (!jobs) return {};
      const jobIds = jobs.map((j) => j.id);
      const { data, error } = await supabase
        .from("applications")
        .select("job_id")
        .in("job_id", jobIds);
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((a) => {
        counts[a.job_id] = (counts[a.job_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!jobs && jobs.length > 0,
  });

  return (
    <div className="container py-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Jobs</h1>
          <p className="text-muted-foreground text-sm">Manage your posted jobs</p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
          <Link to="/employer/post-job"><Plus className="h-4 w-4 mr-1" /> Post Job</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
        </div>
      )}

      <div className="space-y-3">
{jobs?.map((job) => (
  <div key={job.id} className="border p-4 rounded-xl bg-card space-y-2">

    <Link
      to={`/employer/job/${job.id}`}
      className="block hover:border-primary/50 transition-colors"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold">{job.title}</h3>
        <StatusBadge status={job.status} />
      </div>

      <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
        <span>{job.location}</span>
        <span className="font-mono-tabular text-primary">{job.salary}</span>
      </div>

      <div className="mt-2 flex items-center gap-1 text-sm">
        <Users size={14} className="text-muted-foreground" />
        <span className="font-medium">{appCounts?.[job.id] || 0} applicants</span>
      </div>

      <div className="mt-3 flex gap-2">
  <Button
    size="sm"
    variant="outline"
    asChild
  >
    <Link to={`/employer/edit-job/${job.id}`}>
      Edit
    </Link>
  </Button>
</div>
    </Link>

    {job.status === "open" && (
      <Button
        size="sm"
        variant="outline"
        onClick={async () => {
          await supabase
            .from("jobs")
            .update({ status: "closed" })
            .eq("id", job.id);

          window.location.reload();
        }}
      >
        Close Job
      </Button>
    )}
  </div>
))}
        {jobs?.length === 0 && !isLoading && (
  <div className="text-center py-12 space-y-3">
    <div className="text-4xl">📢</div>
    <p className="font-semibold">You haven't posted any jobs yet</p>
    <p className="text-sm text-muted-foreground">
      Start by posting your first job to find workers.
    </p>
    <Button
      className="bg-accent text-accent-foreground hover:bg-accent/90"
      asChild
    >
      <Link to="/employer/post-job">Post Job</Link>
    </Button>
  </div>
)}
      </div>
    </div>
  );
}
