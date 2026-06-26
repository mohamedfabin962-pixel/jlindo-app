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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, FileText, Users, Tag, Search, Check, Plus, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { JOB_CATEGORIES, getCategoryIllustration } from "@/utils/jobCategories";
import { motion } from "framer-motion";

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
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

    setLoading(true); // Keep spinner briefly during navigate state transition
    setLoading(false);

    if (error) {
      toast({ title: "Job post failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Job Posted Successfully",
        description: "Workers can now see and apply for this job.",
      });

      navigate("/jobs");
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const filteredCategories = JOB_CATEGORIES.filter(cat => 
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 110,
        damping: 14
      }
    }
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
        .jl-btn-primary:active:not(:disabled) {
          transform: translateY(0px) !important;
        }
        .jl-input:focus {
          border-color: #F59E0B !important;
          box-shadow: 0 0 0 4px rgba(245,158,11,0.1) !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>

      <div
        className="relative min-h-screen bg-slate-50/50 pb-20 overflow-x-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Decorative background glow elements for premium startup feel */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-200/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-orange-100/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-amber-100/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/employer/dashboard"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-white hover:text-amber-600 hover:border-amber-200 border border-slate-200/80 rounded-full transition-all duration-300 shadow-sm hover:shadow"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Employer Portal
            </div>
          </div>

          {/* Title & Introduction Section */}
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Create a <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Job Listing</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-xl">
              Fill out the details below to publish your opening. Verified local workers will see and apply for this job instantly.
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
                
                {/* SECTION 1: Job Identity */}
                <motion.div variants={itemVariants}>
                  <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/20 px-6 py-4 flex flex-row items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex-shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-800">Job Identity</CardTitle>
                        <p className="text-xs text-slate-400 font-medium">Define the core title and category of the position</p>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-6">
                      
                      {/* Job Title Input */}
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
                            className="jl-input pl-10 h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all font-medium text-slate-800"
                          />
                        </div>
                        <span className="text-xs text-slate-400 block pl-1">Keep it clear and specific to attract the right candidates.</span>
                      </div>

                      {/* Job Category Input */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          Job Category <span className="text-amber-500">*</span>
                        </Label>
                        
                        {form.category ? (
                          <div className="flex items-center justify-between p-4 rounded-xl border border-amber-100 bg-amber-50/30 shadow-sm transition-all duration-300 animate-fadeIn">
                            <div className="flex items-center gap-4">
                              <div className="scale-90 origin-left">
                                {getCategoryIllustration(form.category)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{form.category}</p>
                                <p className="text-xs text-slate-400 font-medium">Selected Category</p>
                              </div>
                            </div>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-lg border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-200 transition-colors shadow-sm hover:bg-slate-50 text-xs font-semibold"
                              >
                                Change Category
                              </Button>
                            </DialogTrigger>
                          </div>
                        ) : (
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="w-full flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-500/40 bg-slate-50/50 hover:bg-amber-50/5 transition-all duration-300 group"
                            >
                              <div className="p-3 rounded-full bg-slate-100 group-hover:bg-amber-100 transition-colors duration-300">
                                <Tag className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                              </div>
                              <span className="mt-2.5 text-sm font-bold text-slate-600 group-hover:text-amber-700 transition-colors">
                                Choose a job category
                              </span>
                              <span className="text-xs text-slate-400 mt-1 max-w-[280px] text-center">
                                Workers filter jobs by category. Selecting a clear category ensures matching skills.
                              </span>
                            </button>
                          </DialogTrigger>
                        )}
                        <input type="hidden" required value={form.category} />
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>

                {/* SECTION 2: Location & Compensation */}
                <motion.div variants={itemVariants}>
                  <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/20 px-6 py-4 flex flex-row items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-800">Location & Compensation</CardTitle>
                        <p className="text-xs text-slate-400 font-medium">Define job site parameters, rate of pay, and working schedule</p>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-6">
                      
                      {/* Location Input */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          Location / Area <span className="text-amber-500">*</span>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <Input
                            required
                            value={form.location}
                            onChange={update("location")}
                            placeholder="e.g. Downtown Area, Green Heights"
                            className="jl-input pl-10 h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all font-medium text-slate-800"
                          />
                        </div>
                        <span className="text-xs text-slate-400 block pl-1">Specify a recognizable area or neighborhood of the job site.</span>
                      </div>

                      {/* Salary and Working Hours Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
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
                              placeholder="e.g. $25/hr or $200/day"
                              className="jl-input pl-10 h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all font-medium text-slate-800"
                            />
                          </div>
                          <span className="text-xs text-slate-400 block pl-1">E.g., hourly rate or flat daily fee.</span>
                        </div>

                        {/* Working Hours */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                            Working Hours <span className="text-amber-500">*</span>
                          </Label>
                          <div className="relative">
                            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <Input
                              required
                              value={form.working_hours}
                              onChange={update("working_hours")}
                              placeholder="e.g. 08:00 - 17:00, Mon-Fri"
                              className="jl-input pl-10 h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all font-medium text-slate-800"
                            />
                          </div>
                          <span className="text-xs text-slate-400 block pl-1">Help workers understand the shift duration.</span>
                        </div>

                      </div>

                    </CardContent>
                  </Card>
                </motion.div>

                {/* SECTION 3: Description & Openings */}
                <motion.div variants={itemVariants}>
                  <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/20 px-6 py-4 flex flex-row items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex-shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-800">Description & Openings</CardTitle>
                        <p className="text-xs text-slate-400 font-medium">Outline responsibilities, prerequisites, and needed headcount</p>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-6">
                      
                      {/* Description Input */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          Job Description <span className="text-amber-500">*</span>
                        </Label>
                        <Textarea
                          required
                          value={form.description}
                          onChange={update("description")}
                          rows={5}
                          placeholder="Please supply detailed notes of the job requirements, responsibilities, specific tasks, or any gear/tools the worker needs to carry."
                          className="jl-input rounded-xl border-slate-200 text-sm focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all font-medium text-slate-800 resize-none p-3.5 leading-relaxed"
                        />
                        <span className="text-xs text-slate-400 block pl-1">Be descriptive! Clear roles help candidates understand expectations immediately.</span>
                      </div>

                      {/* Workers Required Input */}
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
                            className="jl-input pl-10 h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all font-medium text-slate-800"
                          />
                        </div>
                        <span className="text-xs text-slate-400 block pl-1">Specify how many workers you need. Defaults to 1.</span>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>

                {/* Submitting Block */}
                <motion.div variants={itemVariants} className="pt-2">
                  <div className="p-4 rounded-xl border border-slate-100 bg-white/70 backdrop-blur-sm shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <div className="flex items-start gap-2.5 max-w-md">
                      <HelpCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs font-semibold text-slate-500 leading-normal">
                        Posting this listing immediately publishes it to the feed. Ensure details are correct; you can pause or modify listings directly from the dashboard.
                      </p>
                    </div>
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
                    ) : (
                      "Post Job Listing"
                    )}
                  </Button>
                </motion.div>

              </motion.div>

            {/* Category Dialog Picker Popup */}
            <DialogContent className="max-w-xl w-[92vw] rounded-2xl p-5 bg-white border border-slate-100 shadow-2xl focus:outline-none flex flex-col gap-0 select-none">
              <DialogHeader className="pb-3 border-b border-slate-50">
                <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-500" />
                  Select Job Category
                </DialogTitle>
                <p className="text-xs text-slate-400 font-medium">Choose the category that fits best to receive optimal applicant matches.</p>
              </DialogHeader>

              {/* Search Category Filter */}
              <div className="relative mt-4 mb-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search categories..."
                  className="pl-10 h-10 rounded-xl border-slate-200 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 bg-slate-50/50 text-sm font-semibold"
                />
              </div>

              {/* Category Options List Grid */}
              <div className="overflow-y-auto max-h-[320px] custom-scrollbar pr-1 py-1">
                {filteredCategories.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-0.5">
                    {filteredCategories.map((cat) => {
                      const isSelected = form.category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, category: cat }));
                            setDialogOpen(false);
                          }}
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
                          }`}>
                            {cat}
                          </span>

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


