import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit3 } from "lucide-react";

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-semibold">Loading job details…</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .jl-btn-primary {
          background: linear-gradient(135deg, #F59E0B, #EA580C) !important;
          color: white !important;
          transition: all 0.3s ease !important;
        }
        .jl-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #FBBF24, #F59E0B) !important;
          box-shadow: 0 4px 18px rgba(245,158,11,0.35) !important;
        }
        .jl-input:focus {
          border-color: #F59E0B !important;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.12) !important;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #F8FAFC 0%, #FFF7ED 55%, #F8FAFC 100%)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px 60px" }}>
          
          <Link
            to="/employer/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(15,10,30,0.5)",
              textDecoration: "none",
              marginBottom: 20,
              transition: "color 0.2s"
            }}
            className="hover:text-amber-500"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <Card
            style={{
              background: "#fff",
              borderRadius: 24,
              border: "1px solid rgba(15,10,30,0.07)",
              boxShadow: "0 4px 20px rgba(15,10,30,0.04)",
              overflow: "hidden",
            }}
          >
            <CardHeader style={{ borderBottom: "1px solid rgba(15,10,30,0.06)", padding: "24px 28px" }}>
              <CardTitle style={{ fontSize: 20, fontWeight: 800, color: "#0d0a1e", display: "flex", alignItems: "center", gap: 10 }}>
                <Edit3 className="text-amber-500" size={22} />
                Edit Job Details
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: "28px" }}>
              <form onSubmit={handleSave} className="space-y-5">

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Job Title</Label>
                  <Input
                    value={form.title}
                    onChange={update("title")}
                    required
                    className="jl-input h-11 rounded-xl border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Location</Label>
                  <Input
                    value={form.location}
                    onChange={update("location")}
                    required
                    className="jl-input h-11 rounded-xl border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Salary</Label>
                    <Input
                      value={form.salary}
                      onChange={update("salary")}
                      required
                      className="jl-input h-11 rounded-xl border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Workers Needed</Label>
                    <Input
                      type="number"
                      min="1"
                      value={form.workers_required}
                      onChange={update("workers_required")}
                      className="jl-input h-11 rounded-xl border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Working Hours</Label>
                  <Input
                    value={form.working_hours}
                    onChange={update("working_hours")}
                    required
                    className="jl-input h-11 rounded-xl border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Description</Label>
                  <Textarea
                    rows={4}
                    value={form.description}
                    onChange={update("description")}
                    required
                    className="jl-input rounded-xl border-slate-200 resize-none p-3"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Status</Label>
                  <select
                    className="w-full border border-slate-200 rounded-xl h-11 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium"
                    value={form.status}
                    onChange={update("status")}
                  >
                    <option value="open">Open</option>
                    <option value="filled">Filled</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <Button className="w-full jl-btn-primary h-12 rounded-xl text-base font-bold shadow-md border-0 mt-2" disabled={saving}>
                  {saving ? "Saving Changes…" : "Save Changes"}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}