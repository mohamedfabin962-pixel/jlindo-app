import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Ban } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: jobs } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: applications } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*, jobs(title)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: feedbacks } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const updateJobStatus = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      const { error } = await supabase.from("jobs").update({ status }).eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({ title: "Job status updated" });
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({ title: "Job deleted" });
    },
  });

  const toggleBlockUser = useMutation({
    mutationFn: async ({ userId, blocked }: { userId: string; blocked: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_blocked: blocked }).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User updated" });
    },
  });

  const updateFeedbackStatus = useMutation({
  mutationFn: async ({ id, status }: { id: string; status: string }) => {
    const { error } = await supabase
      .from("feedback")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
    toast({ title: "Feedback status updated" });
  },
});

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-pulse">Loading…</div></div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users ({users?.length || 0})</TabsTrigger>
          <TabsTrigger value="jobs">Jobs ({jobs?.length || 0})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications?.length || 0})</TabsTrigger>
          <TabsTrigger value="feedback">Feedback ({feedbacks?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="space-y-2">
            {users?.map((u) => (
              <div key={u.id} className="border p-3 rounded-lg bg-card flex items-center justify-between">
                <div>
                  <p className="font-medium">{u.full_name || "No name"}</p>
                  <p className="text-xs text-muted-foreground">{u.role} • {u.phone || "No phone"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.is_blocked && <StatusBadge status="blocked" />}
                  <Button
                    size="sm"
                    variant={u.is_blocked ? "default" : "outline"}
                    onClick={() => toggleBlockUser.mutate({ userId: u.user_id, blocked: !u.is_blocked })}
                  >
                    <Ban size={14} className="mr-1" /> {u.is_blocked ? "Unblock" : "Block"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="jobs">
          <div className="space-y-2">
            {jobs?.map((j) => (
              <div key={j.id} className="border p-3 rounded-lg bg-card flex items-center justify-between">
                <div>
                  <p className="font-medium">{j.title}</p>
                  <p className="text-xs text-muted-foreground">{j.location} • {j.salary}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={j.status} onValueChange={(s) => updateJobStatus.mutate({ jobId: j.id, status: s })}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="filled">Filled</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => deleteJob.mutate(j.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <div className="space-y-2">
            {applications?.map((a: any) => (
              <div key={a.id} className="border p-3 rounded-lg bg-card flex items-center justify-between">
                <div>
                  <p className="font-medium">{a.jobs?.title || "Unknown Job"}</p>
                  <p className="text-xs text-muted-foreground">Worker: {a.worker_id.slice(0, 8)}…</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="space-y-2">
            {feedbacks?.map((f) => (
  <div key={f.id} className="border p-3 rounded-lg bg-card">
    <div className="flex items-center gap-2 mb-2">
      <StatusBadge status={f.status === "resolved" ? "success" : "pending"} />

      <span className="text-xs font-bold uppercase">
        {f.type}
      </span>

      <span className="text-xs text-muted-foreground ml-auto">
        {new Date(f.created_at).toLocaleDateString()}
      </span>
    </div>

    <p className="text-sm mb-3">{f.message}</p>

    {f.status !== "resolved" && (
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          updateFeedbackStatus.mutate({
            id: f.id,
            status: "resolved",
          })
        }
      >
        Mark Resolved
      </Button>
    )}
  </div>
))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
