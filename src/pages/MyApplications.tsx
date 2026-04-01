import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Phone } from "lucide-react";

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
  <div className="min-h-screen bg-slate-50">
    <div className="container max-w-2xl py-6 space-y-5">
      <h1 className="text-xl font-semibold text-slate-900 tracking-tight">My Applications</h1>
      <p className="text-sm text-slate-500">Track your job applications</p>

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
    <div key={app.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-slate-900 text-base">{job?.title ?? "Unknown Job"}</h3>
        <StatusBadge status={app.status} />
      </div>

      {job && (
        <div className="flex flex-wrap gap-3 text-sm text-slate-600">

  <span>{job.location}</span>

  <span>{job.working_hours}</span>

  <span className="font-semibold text-slate-900">
    {job.salary}
  </span>

</div>
      )}

      {app.status === "accepted" && (
  <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 space-y-1">
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

      <p className="text-xs text-slate-400">
        Applied {new Date(app.created_at).toLocaleDateString()}
      </p>
    </div>
  );
})}
        {applications?.length === 0 && !isLoading && (
          <div className="text-center py-16 px-4 space-y-4">
  
  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
    <span className="text-2xl">📄</span>
  </div>

  <div className="space-y-1">
    <h3 className="text-base font-semibold text-slate-900">
      No applications yet
    </h3>
    <p className="text-sm text-slate-500">
      Start applying for jobs to see them here
    </p>
  </div>

</div>
        )}
      </div>
    </div>
    </div>
  );
}
