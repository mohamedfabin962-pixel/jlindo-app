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
import { CheckCircle } from "lucide-react";

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
  <div className="min-h-screen bg-slate-50">
    <div className="container max-w-2xl py-6 space-y-5">

      <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2">

        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold text-slate-900 tracking-tight">
            Report Issue / Suggest Feature
          </CardTitle>
          <p className="text-sm text-slate-500">
            Help us improve Jlindo
          </p>
        </CardHeader>

        <CardContent className="space-y-4">

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 space-y-2"
              >
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-900">
                  Thanks for your feedback!
                </p>
                <p className="text-sm text-slate-500">
                  We appreciate your input 🙌
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
                className="space-y-4"
              >

                {/* Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Feedback Type
                  </Label>

                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-xl">
                      <SelectItem  className="hover:bg-slate-100 focus:bg-slate-100 rounded-md" value="bug">Bug Report</SelectItem>
                      <SelectItem  className="hover:bg-slate-100 focus:bg-slate-100 rounded-md" value="feature">Feature Request</SelectItem>
                      <SelectItem  className="hover:bg-slate-100 focus:bg-slate-100 rounded-md" value="general">General Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Message
                  </Label>

                  <Textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Describe the issue or suggestion…"
                    className="rounded-xl border-slate-200 focus:border-slate-400 resize-none"
                  />
                </div>

                {/* Button */}
                <Button
                  type="submit"
                 className="w-full h-12 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
                  disabled={mutation.isPending || !message.trim()}
                >
                  {mutation.isPending ? "Sending…" : "Submit Feedback"}
                </Button>

              </motion.form>
            )}
          </AnimatePresence>

        </CardContent>
      </Card>

    </div>
  </div>
);
}
