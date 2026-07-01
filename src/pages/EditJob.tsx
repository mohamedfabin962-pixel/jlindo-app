import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { createActivityLog } from "@/utils/activityLogger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit3, MapPin, Navigation, Link as LinkIcon, Clock, ChevronDown, X, Search, Check, Users, DollarSign } from "lucide-react";
import { JOB_CATEGORIES } from "@/utils/jobCategories";
import {
  INDIAN_CITIES, encodeLocation, decodeLocation,
  encodeWorkingHours, decodeWorkingHours,
  type Period,
} from "@/utils/locationUtils";
import { PremiumTimePicker } from "@/components/PremiumTimePicker";

// ─── City Combobox ────────────────────────────────────────────────────────────

function CityCombobox({
  value, onChange,
}: { value: string; onChange: (city: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? INDIAN_CITIES.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : INDIAN_CITIES;

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between h-11 px-3.5 rounded-xl border text-sm font-medium transition-all duration-200 bg-white
          ${open ? "border-amber-500 ring-4 ring-amber-500/10" : "border-slate-200 hover:border-slate-300"}
          ${value ? "text-slate-800" : "text-slate-400"}`}
      >
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {value || "Select a city…"}
        </span>
        <span className="flex items-center gap-1">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onChange(""))}
              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[40]" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-[41] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search city…"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 rounded-xl border-0 outline-none focus:ring-2 focus:ring-amber-500/20 font-medium text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>
            <ul className="max-h-52 overflow-y-auto py-1" style={{ scrollbarWidth: "thin" }}>
              {filtered.length > 0 ? (
                filtered.map((city) => (
                  <li key={city}>
                    <button
                      type="button"
                      onClick={() => { onChange(city); setOpen(false); setQuery(""); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2.5
                        ${value === city ? "bg-amber-50 text-amber-700" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {value === city && <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                      <span className={value === city ? "ml-0" : "ml-6"}>{city}</span>
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center text-sm text-slate-400 font-medium">
                  No cities matching "{query}"
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────

export default function EditJob() {
  const { jobId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    salary: "",
    description: "",
    requirements: "",
    workers_required: "",
    status: "open",
    category: "",
    // location sub-fields
    city: "",
    exactLocation: "",
    mapsUrl: "",
    // working hours sub-fields
    startTime: { hour: "9", minute: "00", period: "AM" as Period },
    endTime:   { hour: "5", minute: "00", period: "PM" as Period },
  });

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) {
        setError("Missing Job ID in URL parameter.");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .single();

        if (fetchError) {
          setError(`Failed to retrieve job details: ${fetchError.message}`);
          setLoading(false);
          return;
        }

        if (!data) {
          setError("No job listing found with the specified ID.");
          setLoading(false);
          return;
        }

        // Verify ownership
        if (data.employer_id !== user?.id) {
          setError("Access Denied: You do not have permission to modify this listing.");
          setLoading(false);
          return;
        }

        // Decode stored location
        const loc = decodeLocation(data.location);
        // Decode stored working hours
        const wh = decodeWorkingHours(data.working_hours);

        const parseDescription = (rawDescription: string) => {
          if (!rawDescription) return { description: "", requirements: "" };
          const parts = rawDescription.split("---REQUIREMENTS---");
          return {
            description: parts[0]?.trim() || "",
            requirements: parts[1]?.trim() || "",
          };
        };

        const parsedDesc = parseDescription(data.description || "");

        setForm({
          title: data.title || "",
          salary: data.salary || "",
          description: parsedDesc.description,
          requirements: parsedDesc.requirements,
          workers_required: String(data.workers_required || 1),
          status: data.status || "open",
          category: data.category || "Other",
          city: loc.city,
          exactLocation: loc.exactLocation,
          mapsUrl: loc.mapsUrl,
          startTime: wh.start,
          endTime:   wh.end,
        });
      } catch (err: any) {
        setError(`An unexpected error occurred: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      loadJob();
    } else {
      setError("No Job ID provided.");
      setLoading(false);
    }
  }, [jobId, user]);

  const update = (field: string) => (e: any) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.city.trim() || !form.exactLocation.trim()) {
      toast({ title: "Missing fields", description: "Please fill city and exact location.", variant: "destructive" });
      return;
    }

    setSaving(true);

    const locationEncoded = encodeLocation(form.city, form.exactLocation, form.mapsUrl);
    const workingHoursEncoded = encodeWorkingHours(form.startTime, form.endTime);

    const fullDescription = form.requirements.trim()
      ? `${form.description.trim()}\n\n---REQUIREMENTS---\n${form.requirements.trim()}`
      : form.description.trim();

    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        title: form.title,
        location: locationEncoded,
        salary: form.salary,
        working_hours: workingHoursEncoded,
        description: fullDescription,
        workers_required: Number(form.workers_required),
        status: form.status,
        category: form.category,
      })
      .eq("id", jobId)
      .eq("employer_id", user!.id);

    setSaving(false);

    if (updateError) {
      toast({ title: "Update failed", description: updateError.message, variant: "destructive" });
    } else {
      await createActivityLog({
        type: "log_job_edited",
        actorId: user!.id,
        actorName: profile?.full_name || user!.email || "Employer",
        jobId,
        jobTitle: form.title,
        details: `Edited job listing: "${form.title}"`
      });
      toast({ title: "Job updated successfully" });
      navigate("/employer/dashboard");
    }
  };

  const workingHoursPreview =
    `${String(form.startTime.hour).padStart(2, "0")}:${form.startTime.minute} ${form.startTime.period} – ` +
    `${String(form.endTime.hour).padStart(2, "0")}:${form.endTime.minute} ${form.endTime.period}`;

  if (loading) {
    return (
      <div
        className="min-h-screen bg-slate-50/50 pb-20 flex items-center justify-center"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div style={{ maxWidth: 640, width: "100%", margin: "0 auto", padding: "32px 16px 60px" }} className="animate-pulse space-y-6">
          <div className="h-5 w-32 bg-slate-200 rounded-full" />
          <Card style={{ background: "#fff", borderRadius: 24, border: "1px solid rgba(15,10,30,0.07)", boxShadow: "0 4px 20px rgba(15,10,30,0.04)" }} className="overflow-hidden">
            <CardHeader style={{ borderBottom: "1px solid rgba(15,10,30,0.06)", padding: "24px 28px" }} className="flex flex-row items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 rounded-xl" />
              <div className="h-6 w-44 bg-slate-200 rounded-full" />
            </CardHeader>
            <CardContent style={{ padding: "28px" }} className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4.5 w-24 bg-slate-200 rounded-full" />
                  <div className="h-11 w-full bg-slate-100 rounded-xl" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4.5 w-24 bg-slate-200 rounded-full" />
                  <div className="h-11 w-full bg-slate-100 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="h-4.5 w-24 bg-slate-200 rounded-full" />
                  <div className="h-11 w-full bg-slate-100 rounded-xl" />
                </div>
              </div>
              <div className="h-12 w-full bg-slate-200 rounded-xl mt-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Card style={{ background: "#fff", borderRadius: 24, border: "1px solid rgba(15,10,30,0.07)", boxShadow: "0 4px 20px rgba(15,10,30,0.04)" }} className="max-w-md w-full p-8 text-center space-y-5">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <X className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">Unable to Load Job</h2>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            {error}
          </p>
          <Button
            className="w-full jl-btn-primary h-12 rounded-xl text-sm font-bold shadow-sm border-0"
            onClick={() => navigate("/employer/dashboard")}
          >
            Return to Dashboard
          </Button>
        </Card>
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
        className="min-h-screen"
        style={{
          background: "linear-gradient(160deg, #F8FAFC 0%, #FFF7ED 55%, #F8FAFC 100%)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 16px 60px" }}>

          <Link
            to="/employer/dashboard"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "rgba(15,10,30,0.5)", textDecoration: "none", marginBottom: 20, transition: "color 0.2s" }}
            className="hover:text-amber-500"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <Card style={{ background: "#fff", borderRadius: 24, border: "1px solid rgba(15,10,30,0.07)", boxShadow: "0 4px 20px rgba(15,10,30,0.04)", overflow: "hidden" }}>
            <CardHeader style={{ borderBottom: "1px solid rgba(15,10,30,0.06)", padding: "24px 28px" }}>
              <CardTitle style={{ fontSize: 20, fontWeight: 800, color: "#0d0a1e", display: "flex", alignItems: "center", gap: 10 }}>
                <Edit3 className="text-amber-500" size={22} />
                Edit Job Details
              </CardTitle>
            </CardHeader>

            <CardContent style={{ padding: "28px" }}>
              <form onSubmit={handleSave} className="space-y-6">

                {/* Job Title */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Job Title <span className="text-amber-500">*</span></Label>
                  <Input value={form.title} onChange={update("title")} required className="jl-input h-11 rounded-xl border-slate-200" />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    Job Category <span className="text-amber-500">*</span>
                  </Label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all jl-input"
                  >
                    <option value="" disabled>Select a category</option>
                    {JOB_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">City <span className="text-amber-500">*</span></Label>
                  <CityCombobox value={form.city} onChange={(c) => setForm((f) => ({ ...f, city: c }))} />
                </div>

                {/* Exact Location */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Exact Location / Landmark <span className="text-amber-500">*</span></Label>
                  <div className="relative">
                    <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <Input
                      required
                      value={form.exactLocation}
                      onChange={update("exactLocation")}
                      placeholder="e.g. Near Lulu Mall, Edappally"
                      className="jl-input pl-10 h-11 rounded-xl border-slate-200"
                    />
                  </div>
                  <span className="text-xs text-slate-400">Help workers find the job site easily.</span>
                </div>

                {/* Google Maps Link */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Google Maps Link <span className="text-xs text-slate-400 font-normal ml-1">(optional)</span>
                  </Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <Input
                      value={form.mapsUrl}
                      onChange={update("mapsUrl")}
                      type="url"
                      placeholder="https://maps.google.com/..."
                      className="jl-input pl-10 h-11 rounded-xl border-slate-200"
                    />
                  </div>
                </div>

                {/* Salary */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Salary / Rate <span className="text-amber-500">*</span></Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <Input value={form.salary} onChange={update("salary")} required className="jl-input pl-10 h-11 rounded-xl border-slate-200" placeholder="e.g. ₹600/day" />
                  </div>
                </div>

                {/* Working Hours */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 block">Working Hours <span className="text-amber-500">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PremiumTimePicker label="Start Time" value={form.startTime} onChange={(v) => setForm((f) => ({ ...f, startTime: v }))} />
                    <PremiumTimePicker label="End Time" value={form.endTime} onChange={(v) => setForm((f) => ({ ...f, endTime: v }))} />
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-600">Hours: </span>
                    <span className="text-xs font-black text-slate-800">{workingHoursPreview}</span>
                  </div>
                </div>

                {/* Workers Required */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Workers Needed</Label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <Input type="number" min="1" value={form.workers_required} onChange={update("workers_required")} className="jl-input pl-10 h-11 rounded-xl border-slate-200" />
                    </div>
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
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Description <span className="text-amber-500">*</span></Label>
                  <Textarea rows={4} value={form.description} onChange={update("description")} required className="jl-input rounded-xl border-slate-200 resize-none p-3" />
                </div>

                {/* Requirements & Rules */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Requirements & Rules <span className="text-xs text-slate-400 font-normal ml-1">(optional)</span></Label>
                  <Textarea
                    rows={4}
                    value={form.requirements}
                    onChange={update("requirements")}
                    placeholder={"• Must arrive on time\n• Previous experience preferred\n• Must speak Malayalam\n• Uniform mandatory"}
                    className="jl-input rounded-xl border-slate-200 resize-none p-3"
                  />
                  <span className="text-xs text-slate-400">List specific rules, dress codes, language criteria, or guidelines (one per line).</span>
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