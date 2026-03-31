import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Briefcase } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  setLoading(false);

  if (error) {
    toast({
      title: "Login failed",
      description: error.message,
      variant: "destructive",
    });
  } else {
    toast({
      title: "Login successful",
      description: "Redirecting...",
    });

    window.location.href = "/";   // ⭐ ONLY THIS
  }
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
    Welcome back
  </CardTitle>

  <p className="text-sm text-slate-500">
    Sign in to your account
  </p>
</CardHeader>
        <CardContent className="space-y-4 pt-2">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
    Email
  </Label>
  <Input
    id="email"
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="h-11 rounded-xl border-slate-200 bg-white focus:border-slate-400 focus:ring-0"
  />
</div>

<div className="space-y-2">
  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
    Password
  </Label>
  <Input
    id="password"
    type="password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="h-11 rounded-xl border-slate-200 bg-white focus:border-slate-400 focus:ring-0"
  />
</div>
          <Button type="submit" className="w-full bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all" disabled={loading}>
  {loading ? "Signing in..." : "Sign In"}
</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
