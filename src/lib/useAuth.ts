import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  email: string;
  role: "owner" | "admin";
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProfile = async (userId: string | undefined) => {
      if (!userId) {
        if (active) setProfile(null);
        return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (active) setProfile((data as Profile) ?? null);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setTimeout(() => void loadProfile(s?.user?.id), 0);
    });

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadProfile(data.session?.user?.id);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isApproved = profile?.status === "approved";

  return {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    canEdit: !!session && isApproved,
    isOwner: !!session && profile?.role === "owner" && isApproved,
  };
}