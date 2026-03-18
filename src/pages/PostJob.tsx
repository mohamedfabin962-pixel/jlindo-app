import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    location: "",
    salary: "",
    working_hours: "",
    description: "",
    workers_required: "",
  });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     const { error } = await supabase.from("jobs").insert({
//       employer_id: user!.id,
//       title: form.title.trim(),
//       location: form.location.trim(),
//       salary: form.salary.trim(),
//       working_hours: form.working_hours.trim(),
//       description: form.description.trim(),
//       workers_required: form.workers_required ? parseInt(form.workers_required) : 1,
//     });
//     setLoading(false);
//     if (error) {
//       toast({ title: "Error", description: error.message, variant: "destructive" });
//     } else {
//       toast({ title: "Job posted!" });
//       navigate("/employer/dashboard");
//     }
//   };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.title.trim() || !form.location.trim() || !form.salary.trim() || !form.working_hours.trim() || !form.description.trim()) {
    toast({
      title: "Missing fields",
      description: "Please fill all required job details.",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);

  const { error } = await supabase.from("jobs").insert({
    employer_id: user!.id,
    title: form.title.trim(),
    location: form.location.trim(),
    salary: form.salary.trim(),
    working_hours: form.working_hours.trim(),
    description: form.description.trim(),
    workers_required: form.workers_required ? parseInt(form.workers_required) : 1,
  });

  setLoading(false);

  if (error) {
    toast({ title: "Job post failed", description: error.message, variant: "destructive" });
  } else {
    toast({
      title: "Job Posted Successfully",
      description: "Workers can now see and apply for this job.",
    });

    navigate("/jobs");   // ⭐ better UX
  }
};


  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="container py-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Post a New Job</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input required value={form.title} onChange={update("title")} placeholder="e.g. Electrician Helper" />
            </div>
            <div className="space-y-2">
              <Label>Location / Area *</Label>
              <Input required value={form.location} onChange={update("location")} placeholder="e.g. Downtown" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salary *</Label>
                <Input required value={form.salary} onChange={update("salary")} placeholder="e.g. $25/hr" />
              </div>
              <div className="space-y-2">
                <Label>Working Hours *</Label>
                <Input required value={form.working_hours} onChange={update("working_hours")} placeholder="e.g. 08:00 - 17:00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea required value={form.description} onChange={update("description")} rows={4} placeholder="Describe the job requirements…" />
            </div>
            <div className="space-y-2">
              <Label>Workers Required</Label>
              <Input type="number" min="1" value={form.workers_required} onChange={update("workers_required")} placeholder="1" />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
              {loading ? "Posting…" : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
