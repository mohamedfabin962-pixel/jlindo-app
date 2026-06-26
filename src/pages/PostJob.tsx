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
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, FileText, Users, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { JOB_CATEGORIES } from "@/utils/jobCategories";

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
    category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.category || !form.location.trim() || !form.salary.trim() || !form.working_hours.trim() || !form.description.trim()) {
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
      category: form.category,
      workers_required: form.workers_required ? parseInt(form.workers_required) : 1,
      status: "open",
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
                <Briefcase className="text-amber-500" size={22} />
                Post a New Job
              </CardTitle>
            </CardHeader>
            
            <CardContent style={{ padding: "28px" }}>
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    Job Title <span className="text-amber-500">*</span>
                  </Label>
                  <Input
                    required
                    value={form.title}
                    onChange={update("title")}
                    placeholder="e.g. Electrician Helper"
                    className="jl-input h-11 rounded-xl border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    Job Category <span className="text-amber-500">*</span>
                  </Label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all jl-input"
                  >
                    <option value="" disabled>Select a category</option>
                    {JOB_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    Location / Area <span className="text-amber-500">*</span>
                  </Label>
                  <Input
                    required
                    value={form.location}
                    onChange={update("location")}
                    placeholder="e.g. Downtown"
                    className="jl-input h-11 rounded-xl border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      Salary <span className="text-amber-500">*</span>
                    </Label>
                    <Input
                      required
                      value={form.salary}
                      onChange={update("salary")}
                      placeholder="e.g. $25/hr"
                      className="jl-input h-11 rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      Working Hours <span className="text-amber-500">*</span>
                    </Label>
                    <Input
                      required
                      value={form.working_hours}
                      onChange={update("working_hours")}
                      placeholder="e.g. 08:00 - 17:00"
                      className="jl-input h-11 rounded-xl border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    Description <span className="text-amber-500">*</span>
                  </Label>
                  <Textarea
                    required
                    value={form.description}
                    onChange={update("description")}
                    rows={4}
                    placeholder="Describe the job requirements, responsibilities, and qualifications…"
                    className="jl-input rounded-xl border-slate-200 resize-none p-3"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    Workers Required
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.workers_required}
                    onChange={update("workers_required")}
                    placeholder="1"
                    className="jl-input h-11 rounded-xl border-slate-200"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full jl-btn-primary h-12 rounded-xl text-base font-bold shadow-md border-0 mt-2"
                  disabled={loading}
                >
                  {loading ? "Posting Job Listing…" : "Post Job Listing"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

