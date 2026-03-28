import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { MapPin, Clock, Phone } from "lucide-react";

export default function MyApplications() {
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications-detail"],
    queryFn: async () => {
      const { data, error } = await supabase
  .from("applications")
  .select("*, jobs(*)")
  .eq("worker_id", user!.id)
  .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });


const [employers, setEmployers] = useState<Record<string, any>>({});
useEffect(() => {
  const fetchEmployers = async () => {
    if (!applications) return;

    const ids = applications
      .map((a: any) => a.jobs?.employer_id)
      .filter(Boolean);

    if (ids.length === 0) return;

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", ids);

    const map: any = {};
    data?.forEach((e) => {
      map[e.id] = e;
    });

    setEmployers(map);
  };

  fetchEmployers();
}, [applications]);

  return (
    <div className="container py-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight mb-1">My Applications</h1>
      <p className="text-muted-foreground text-sm mb-6">Track your job applications</p>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
        </div>
      )}

      <div className="space-y-3">
        {applications?.map((app) => {
  const job = app.jobs as any;
  const employer = employers[job?.employer_id];

  return (
    <div key={app.id} className="border p-4 rounded-xl bg-card">
      <div className="flex justify-between items-start">
        <h3 className="font-bold">{job?.title ?? "Unknown Job"}</h3>
        <StatusBadge status={app.status} />
      </div>

      {job && (
        <div className="mt-2 flex flex-wrap gap-3 text-muted-foreground text-sm">
          <span>{job.location}</span>
          <span>{job.working_hours}</span>
          <span className="text-primary font-semibold">{job.salary}</span>
        </div>
      )}

      {app.status === "accepted" && (
  <div className="mt-3 p-3 rounded-lg bg-success/10 border border-success/20 space-y-1">
    <p className="text-sm font-semibold text-success">
      ✅ You are selected for this job
    </p>

    <p className="text-sm">
      Employer: <span className="font-medium">
        {employer?.full_name || "Employer"}
      </span>
    </p>

    <p className="text-sm flex items-center gap-1">
      <Phone size={14} />
      {employer?.phone || "Phone not available"}
    </p>
  </div>
)}

      <p className="mt-2 text-xs text-muted-foreground">
        Applied {new Date(app.created_at).toLocaleDateString()}
      </p>
    </div>
  );
})}
        {applications?.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-8">No applications yet. Start browsing jobs!</p>
        )}
      </div>
    </div>
  );
}
