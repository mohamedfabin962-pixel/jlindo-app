import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";

export default function WorkerProfile() {
  const { user, profile } = useAuth();

  const { data: applications } = useQuery({
    queryKey: ["worker-profile-apps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("status")
        .eq("worker_id", user!.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const total = applications?.length || 0;
  const accepted = applications?.filter((a) => a.status === "accepted").length || 0;
  const rejected = applications?.filter((a) => a.status === "rejected").length || 0;
  const pending = applications?.filter((a) => a.status === "pending").length || 0;

  return (
    <div className="container max-w-2xl py-6 space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Worker Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Name:</strong> {profile?.full_name || "No Name"}</p>
          <p><strong>Phone:</strong> {profile?.phone || "No Phone"}</p>
          <p><strong>Role:</strong> {profile?.role}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Application Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Total Applications: <strong>{total}</strong></p>
          <p className="flex items-center gap-2">Accepted <StatusBadge status="accepted" /> {accepted}</p>
          <p className="flex items-center gap-2">Rejected <StatusBadge status="rejected" /> {rejected}</p>
          <p className="flex items-center gap-2">Pending <StatusBadge status="pending" /> {pending}</p>
        </CardContent>
      </Card>
    </div>
  );
}