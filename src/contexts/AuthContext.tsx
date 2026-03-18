import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const getSession = async () => {
    console.log("STEP 1 → Getting session");

    const { data, error } = await supabase.auth.getSession();

    console.log("SESSION RESULT:", data, error);

    const sessionUser = data.session?.user ?? null;
    setUser(sessionUser);

    if (sessionUser) {
      console.log("STEP 2 → Fetching profile");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle();

      console.log("PROFILE RESULT:", profileData, profileError);

      setProfile(profileData);
    }

    console.log("STEP 3 → Setting loading false");
    setLoading(false);
  };

  getSession();
}, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}