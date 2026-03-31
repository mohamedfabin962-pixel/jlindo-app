import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone,
      })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your details saved successfully",
      });
    }
  };

return (
  <div className="min-h-screen bg-slate-50">
    <div className="container max-w-2xl py-6 space-y-5">

      <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2">

        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold text-slate-900 tracking-tight">
            My Profile
          </CardTitle>
          <p className="text-sm text-slate-500">
            Manage your account details
          </p>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Email</Label>
            <Input
              value={user?.email}
              disabled
              className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-500"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11 rounded-xl border-slate-200 focus:border-slate-400"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 rounded-xl border-slate-200 focus:border-slate-400"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Role</Label>
            <Input
              value={profile?.role}
              disabled
              className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-500"
            />
          </div>

          {/* Button */}
          <Button
           className="w-full h-12 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Profile"}
          </Button>

        </CardContent>
      </Card>

    </div>
  </div>
);
}