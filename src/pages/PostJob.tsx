import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Users, Tag,
  Search, Check, HelpCircle, ChevronDown, X, Link as LinkIcon,
  Navigation,
} from "lucide-react";
import { Link } from "react-router-dom";
import { JOB_CATEGORIES, getCategoryIllustration } from "@/utils/jobCategories";
import {
  INDIAN_CITIES, encodeLocation, encodeWorkingHours,
  type Period,
} from "@/utils/locationUtils";
import { PremiumTimePicker } from "@/components/PremiumTimePicker";
import { motion } from "framer-motion";

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
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between h-11 px-3.5 rounded-xl border text-sm font-medium transition-all duration-200 bg-white
          ${open
            ? "border-amber-500 ring-4 ring-amber-500/10"
            : "border-slate-200 hover:border-slate-300"
          }
          ${value ? "text-slate-800" : "text-slate-400"}
        `}
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

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-[40]" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-[41] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Search */}
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

            {/* List */}
            <ul className="max-h-52 overflow-y-auto py-1 custom-scrollbar">
              {filtered.length > 0 ? (
                filtered.map((city) => (
                  <li key={city}>
                    <button
                      type="button"
                      onClick={() => { onChange(city); setOpen(false); setQuery(""); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2.5
                        ${value === city
                          ? "bg-amber-50 text-amber-700"
                          : "text-slate-700 hover:bg-slate-50"
                        }
                      `}
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

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    salary: "",
    description: "",
    requirements: "",
    workers_required: "",
    category: "",
    // location sub-fields
    city: "",
    exactLocation: "",
    mapsUrl: "",
    // working hours sub-fields
    startTime: { hour: "9", minute: "00", period: "AM" as Period },
    endTime:   { hour: "5", minute: "00", period: "PM" as Period },
  });

  const workingHoursPreview =
    `${String(form.startTime.hour).padStart(2,"0")}:${form.startTime.minute} ${form.startTime.period} – ` +
    `${String(form.endTime.hour).padStart(2,"0")}:${form.endTime.minute} ${form.endTime.period}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.category || !form.city.trim() || !form.exactLocation.trim() || !form.salary.trim() || !form.description.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill all required job details.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const locationEncoded = encodeLocation(form.city, form.exactLocation, form.mapsUrl);
    const workingHoursEncoded = encodeWorkingHours(form.startTime, form.endTime);

    const fullDescription = form.requirements.trim()
      ? `${form.description.trim()}\n\n---REQUIREMENTS---\n${form.requirements.trim()}`
      : form.description.trim();

    const { error } = await supabase.from("jobs").insert({
      employer_id: user!.id,
      title: form.title.trim(),
      location: locationEncoded,
      salary: form.salary.trim(),
      working_hours: workingHoursEncoded,
      description: fullDescription,
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
      navigate("/employer/dashboard");
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const filteredCategories = JOB_CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 110, damping: 14 } },
  };

  return (
    <>
      <style>{`
        .jl-btn-primary {
          background: linear-gradient(135deg, #F59E0B, #EA580C) !important;
          color: white !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .jl-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #FBBF24, #F59E0B) !important;
          box-shadow: 0 10px 25px rgba(245,158,11,0.35) !important;
          transform: translateY(-1px) !important;
        }
        .jl-btn-primary:active:not(:disabled) { transform: translateY(0px) !important; }
        .jl-input:focus {
          border-color: #F59E0B !important;
          box-shadow: 0 0 0 4px rgba(245,158,11,0.1) !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.3); border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(156,163,175,0.5); }
      `}</style>

      <div
        className="relative min-h-screen bg-slate-50/50 pb-20 overflow-x-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Glow accents */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-200/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-orange-100/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">

          {/* ── Header Bar ───────────────────────────────────── */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/employer/dashboard"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-white hover:text-amber-600 hover:border-amber-200 border border-slate-200/80 rounded-full transition-all duration-300 shadow-sm hover:shadow"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Employer Portal
            </div>
          </div>

          {/* ── Page Title ───────────────────────────────────── */}
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Create a{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                Job Listing
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-xl">
              Fill out the details below to publish your opening. Verified local workers will see and apply instantly.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >

                {/* ══ SECTION 1: Job Identity ═══════════════════ */}
                <motion.div variants={itemVariants}>
                  <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/20 px-6 py-4 flex flex-row items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex-shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-800">Job Identity</CardTitle>
                        <p className="text-xs text-slate-400 font-medium">Define the core title and category</p>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      {/* Job Title */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          Job Title <span className="text-amber-500">*</span>
                        </Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <Input
                            required
                            value={form.title}
                            onChange={update("title")}
                            placeholder="e.g. Electrician Helper, Store Assistant"
                            className="jl-input pl-10 h-11 rounded-xl border-slate-200 text-sm font-medium text-slate-800"
                          />
                        </div>
                        <span className="text-xs text-slate-400 pl-1">Keep it clear and specific to attract the right candidates.</span>
                      </div>

                      {/* Job Category */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          Job Category <span className="text-amber-500">*</span>
                        </Label>

                        {form.category ? (
                          <div className="flex items-center justify-between p-4 rounded-xl border border-amber-100 bg-amber-50/30 shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="scale-90 origin-left">{getCategoryIllustration(form.category)}</div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{form.category}</p>
                                <p className="text-xs text-slate-400 font-medium">Selected Category</p>
                              </div>
                            </div>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline" size="sm"
                                className="h-9 rounded-lg border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-200 transition-colors shadow-sm text-xs font-semibold">
                                Change
                              </Button>
                            </DialogTrigger>
                          </div>
                        ) : (
                          <DialogTrigger asChild>
                            <button type="button"
                              className="w-full flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-500/40 bg-slate-50/50 hover:bg-amber-50/5 transition-all duration-300 group">
                              <div className="p-3 rounded-full bg-slate-100 group-hover:bg-amber-100 transition-colors">
                                <Tag className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                              </div>
                              <span className="mt-2.5 text-sm font-bold text-slate-600 group-hover:text-amber-700 transition-colors">
                                Choose a job category
                              </span>
                              <span className="text-xs text-slate-400 mt-1 max-w-[280px] text-center">
                                Workers filter jobs by category — picking the right one improves applicant quality.
                              </span>
                            </button>
                          </DialogTrigger>
                        )}
                        <input type="hidden" required value={form.category} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* ══ SECTION 2: Location & Compensation ═══════ */}
                <motion.div variants={itemVariants}>
                  <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/20 px-6 py-4 flex flex-row items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-800">Location & Compensation</CardTitle>
                        <p className="text-xs text-slate-400 font-medium">Where is the job, and what does it pay?</p>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">

                      {/* City Selector */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          City <span className="text-amber-500">*</span>
                        </Label>
                        <CityCombobox value={form.city} onChange={(c) => setForm((f) => ({ ...f, city: c }))} />
                        <span className="text-xs text-slate-400 pl-1">Select the city where the job is located.</span>
                      </div>

                      {/* Exact Location */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          Exact Location / Landmark <span className="text-amber-500">*</span>
                        </Label>
                        <div className="relative">
                          <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <Input
                            required
                            value={form.exactLocation}
                            onChange={update("exactLocation")}
                            placeholder="e.g. Near Lulu Mall, Edappally"
                            className="jl-input pl-10 h-11 rounded-xl border-slate-200 text-sm font-medium text-slate-800"
                          />
                        </div>
                        <span className="text-xs text-slate-400 pl-1">
                          Help workers find you — include a well-known landmark or street name.
                        </span>
                      </div>

                      {/* Google Maps Link (optional) */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          Google Maps Link
                          <span className="text-xs text-slate-400 font-normal ml-1">(optional)</span>
                        </Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <Input
                            value={form.mapsUrl}
                            onChange={update("mapsUrl")}
                            type="url"
                            placeholder="https://maps.google.com/..."
                            className="jl-input pl-10 h-11 rounded-xl border-slate-200 text-sm font-medium text-slate-800"
                          />
                        </div>
                        <span className="text-xs text-slate-400 pl-1">
                          Workers can tap "Open in Google Maps" in the job details if you provide this link.
                        </span>
                      </div>

                      {/* Salary */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          Salary / Rate <span className="text-amber-500">*</span>
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <Input
                            required
                            value={form.salary}
                            onChange={update("salary")}
                            placeholder="e.g. ₹600/day or ₹8000/month"
                            className="jl-input pl-10 h-11 rounded-xl border-slate-200 text-sm font-medium text-slate-800"
                          />
                        </div>
                        <span className="text-xs text-slate-400 pl-1">E.g., daily rate or monthly salary.</span>
                      </div>

                      {/* Working Hours — dual premium time picker */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <PremiumTimePicker
                            label="Start Time"
                            value={form.startTime}
                            onChange={(v) => setForm((f) => ({ ...f, startTime: v }))}
                          />
                          <PremiumTimePicker
                            label="End Time"
                            value={form.endTime}
                            onChange={(v) => setForm((f) => ({ ...f, endTime: v }))}
                          />
                        </div>

                        {/* Live preview */}
                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span className="text-xs font-bold text-slate-600">Working hours: </span>
                          <span className="text-xs font-black text-slate-800">{workingHoursPreview}</span>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>

                {/* ══ SECTION 3: Description & Openings ════════ */}
                <motion.div variants={itemVariants}>
                  <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/20 px-6 py-4 flex flex-row items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex-shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-800">Description & Openings</CardTitle>
                        <p className="text-xs text-slate-400 font-medium">Outline responsibilities and needed headcount</p>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      {/* Description */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          Job Description <span className="text-amber-500">*</span>
                        </Label>
                        <Textarea
                          required
                          value={form.description}
                          onChange={update("description")}
                          rows={5}
                          placeholder="Describe the job requirements, daily responsibilities, specific tasks, and any tools or gear the worker must carry."
                          className="jl-input rounded-xl border-slate-200 text-sm font-medium text-slate-800 resize-none p-3.5 leading-relaxed"
                        />
                        <span className="text-xs text-slate-400 pl-1">
                          Be descriptive — clear roles attract better-matched applicants.
                        </span>
                      </div>

                      {/* Requirements & Rules */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          Requirements & Rules <span className="text-slate-400 font-normal">(Optional)</span>
                        </Label>
                        <Textarea
                          value={form.requirements}
                          onChange={update("requirements")}
                          rows={4}
                          placeholder={"• Must arrive on time\n• Previous experience preferred\n• Must speak Malayalam\n• Uniform mandatory"}
                          className="jl-input rounded-xl border-slate-200 text-sm font-medium text-slate-800 resize-none p-3.5 leading-relaxed"
                        />
                        <span className="text-xs text-slate-400 pl-1">
                          List specific rules, dress codes, language criteria, or guidelines (one per line).
                        </span>
                      </div>

                      {/* Workers Required */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          Workers Needed
                        </Label>
                        <div className="relative">
                          <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <Input
                            type="number"
                            min="1"
                            value={form.workers_required}
                            onChange={update("workers_required")}
                            placeholder="1"
                            className="jl-input pl-10 h-11 rounded-xl border-slate-200 text-sm font-medium text-slate-800"
                          />
                        </div>
                        <span className="text-xs text-slate-400 pl-1">Specify how many workers you need. Defaults to 1.</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* ══ Submit ════════════════════════════════════ */}
                <motion.div variants={itemVariants} className="pt-2">
                  <div className="p-4 rounded-xl border border-slate-100 bg-white/70 backdrop-blur-sm shadow-sm flex items-start gap-2.5 mb-4">
                    <HelpCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-semibold text-slate-500 leading-normal">
                      Posting this listing immediately publishes it to the feed. You can pause or modify it from the dashboard at any time.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full jl-btn-primary h-12 rounded-xl text-base font-black shadow-md border-0"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Posting Job Listing…
                      </span>
                    ) : "Post Job Listing"}
                  </Button>
                </motion.div>

              </motion.div>

              {/* ══ Category Dialog ═══════════════════════════ */}
              <DialogContent className="max-w-xl w-[92vw] rounded-2xl p-5 bg-white border border-slate-100 shadow-2xl focus:outline-none flex flex-col gap-0 select-none">
                <DialogHeader className="pb-3 border-b border-slate-50">
                  <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-500" />
                    Select Job Category
                  </DialogTitle>
                  <p className="text-xs text-slate-400 font-medium">
                    Choose the category that fits best to receive optimal applicant matches.
                  </p>
                </DialogHeader>

                <div className="relative mt-4 mb-3">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                    className="pl-10 h-10 rounded-xl border-slate-200 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 bg-slate-50/50 text-sm font-semibold"
                  />
                </div>

                <div className="overflow-y-auto max-h-[320px] custom-scrollbar pr-1 py-1">
                  {filteredCategories.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-0.5">
                      {filteredCategories.map((cat) => {
                        const isSelected = form.category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => { setForm((f) => ({ ...f, category: cat })); setDialogOpen(false); }}
                            className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 group text-center h-28 cursor-pointer ${
                              isSelected
                                ? "border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20 shadow-sm"
                                : "border-slate-100 bg-slate-50/30 hover:bg-slate-50/80 hover:border-slate-200 hover:shadow-sm"
                            }`}
                          >
                            <div className="scale-[0.7] origin-center -mb-1 transition-transform duration-300 group-hover:scale-[0.75]">
                              {getCategoryIllustration(cat)}
                            </div>
                            <span className={`text-[11px] sm:text-xs font-bold leading-tight transition-colors ${
                              isSelected ? "text-amber-700" : "text-slate-600 group-hover:text-slate-800"
                            }`}>{cat}</span>
                            {isSelected && (
                              <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center shadow">
                                <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-400">
                      <p className="text-sm font-medium">No categories matching "{categorySearch}"</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </form>

        </div>
      </div>
    </>
  );
}
