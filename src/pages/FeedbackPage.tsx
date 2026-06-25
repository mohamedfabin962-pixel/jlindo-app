import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, MessageSquarePlus } from "lucide-react";

export default function FeedbackPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [type, setType] = useState("general");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("feedback").insert({
        user_id: user?.id,
        type,
        message: message.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      setMessage("");
      toast({
        title: "Feedback sent",
        description: "Thanks for helping improve the product 🚀",
      });
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

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
        <div style={{ maxWidth: 580, margin: "0 auto", padding: "32px 16px 60px" }}>
          
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
                <MessageSquarePlus className="text-amber-500" size={22} />
                Send us Feedback
              </CardTitle>
            </CardHeader>

            <CardContent style={{ padding: "28px" }}>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ textAlign: "center", padding: "32px 0" }}
                    className="space-y-2"
                  >
                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-2 animate-bounce" />
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0d0a1e" }}>
                      Thanks for your feedback!
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(15,10,30,0.45)" }}>
                      We appreciate your input to improve Jlindo 🙌
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      mutation.mutate();
                    }}
                    className="space-y-5"
                  >
                    {/* Type */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Feedback Type
                      </Label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-xl">
                          <SelectItem className="hover:bg-slate-100 focus:bg-slate-100 rounded-md" value="bug">Bug Report</SelectItem>
                          <SelectItem className="hover:bg-slate-100 focus:bg-slate-100 rounded-md" value="feature">Feature Request</SelectItem>
                          <SelectItem className="hover:bg-slate-100 focus:bg-slate-100 rounded-md" value="general">General Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Message
                      </Label>
                      <Textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        placeholder="Please describe the issue or suggestion in detail…"
                        className="jl-input rounded-xl border-slate-200 resize-none p-3"
                      />
                    </div>

                    {/* Button */}
                    <Button
                      type="submit"
                      className="w-full h-12 jl-btn-primary rounded-xl font-bold shadow-md border-0 mt-2"
                      disabled={mutation.isPending || !message.trim()}
                    >
                      {mutation.isPending ? "Sending Feedback…" : "Submit Feedback"}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

