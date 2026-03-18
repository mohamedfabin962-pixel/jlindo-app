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
        user_id: user!.id,
        feedback_type: type,
        message: message.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      setMessage("");
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="container py-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Report Issue / Suggest Feature</CardTitle>
          <p className="text-sm text-muted-foreground">Help us improve JobConnect</p>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                <p className="font-semibold">Thanks for your feedback!</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Feedback Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="general">General Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Describe the issue or suggestion…" />
                </div>
                <Button type="submit" className="w-full" disabled={mutation.isPending || !message.trim()}>
                  {mutation.isPending ? "Sending…" : "Submit Feedback"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
