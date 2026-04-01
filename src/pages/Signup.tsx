import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Briefcase } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"worker" | "employer">("worker");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  // 1️⃣ Create auth user
 const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      display_name: fullName,
      phone: phone,
    },
  },
});

  if (error) {
    setLoading(false);
    toast({
      title: "Signup failed",
      description: error.message,
      variant: "destructive",
    });
    return;
  }

  const userId = data.user?.id;

  // 2️⃣ Insert profile data (VERY IMPORTANT)
  if (userId) {
    const { error: profileError } = await supabase.from("profiles").insert({
  id: userId,
  email,
  full_name: fullName,
  phone,
  role,
} as any);

    if (profileError) {
      console.log("PROFILE INSERT ERROR:", profileError);
    }
  }

  setLoading(false);

  toast({
    title: "Account created",
    description: "You can login now",
  });

  navigate("/login");
};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm p-2">
        <CardHeader className="text-center space-y-2 pb-4">
  <div className="flex justify-center mb-2">
    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
      <Briefcase className="h-6 w-6 text-slate-900" />
    </div>
  </div>

  <CardTitle className="text-xl font-semibold text-slate-900 tracking-tight">
    Create account
  </CardTitle>

  <p className="text-sm text-slate-500">
    Join and start finding jobs
  </p>
</CardHeader>
        <CardContent className="space-y-4 pt-2">
          <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
  <Label htmlFor="fullName">Full Name</Label>
  <Input
    id="fullName"
    required
    value={fullName}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
      setFullName(e.target.value)
    }
  />
</div>

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    required
    value={email}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
      setEmail(e.target.value)
    }
  />
</div>

<div className="space-y-2">
  <Label htmlFor="phone">Phone</Label>
  <Input
    id="phone"
    type="tel"
    value={phone}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
      setPhone(e.target.value)
    }
  />
</div>

<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <Input
    id="password"
    type="password"
    required
    minLength={6}
    value={password}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
      setPassword(e.target.value)
    }
  />
</div>
            <div className="space-y-2">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={role === "worker" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setRole("worker")}
                >
                  Worker
                </Button>
                <Button
                  type="button"
                  variant={role === "employer" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setRole("employer")}
                >
                  Employer
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all" disabled={loading}>
              {loading ? "Creating account…" : "Sign Up"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
