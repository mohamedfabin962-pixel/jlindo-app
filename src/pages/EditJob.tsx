import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function EditJob() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    location: "",
    salary: "",
    working_hours: "",
    description: "",
    workers_required: "",
    status: "open",
  });

  useEffect(() => {
    const loadJob = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error) {
        toast({ title: "Error loading job", description: error.message, variant: "destructive" });
        navigate("/employer/dashboard");
        return;
      }

      setForm({
        title: data.title,
        location: data.location,
        salary: data.salary,
        working_hours: data.working_hours,
        description: data.description,
        workers_required: String(data.workers_required || 1),
        status: data.status || "open",
      });

      setLoading(false);
    };

    if (jobId) loadJob();
  }, [jobId]);

  const update = (field: string) => (e: any) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("jobs")
      .update({
        title: form.title,
        location: form.location,
        salary: form.salary,
        working_hours: form.working_hours,
        description: form.description,
        workers_required: Number(form.workers_required),
        status: form.status,
      })
      .eq("id", jobId)
      .eq("employer_id", user!.id);

    setSaving(false);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job updated successfully" });
      navigate("/employer/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading job…</div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Edit Job</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">

            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={update("title")} required />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={update("location")} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salary</Label>
                <Input value={form.salary} onChange={update("salary")} required />
              </div>

              <div className="space-y-2">
                <Label>Workers Needed</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.workers_required}
                  onChange={update("workers_required")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Working Hours</Label>
              <Input value={form.working_hours} onChange={update("working_hours")} required />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={update("description")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="w-full border rounded-md h-10 px-2"
                value={form.status}
                onChange={update("status")}
              >
                <option value="open">Open</option>
                <option value="filled">Filled</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <Button className="w-full" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}