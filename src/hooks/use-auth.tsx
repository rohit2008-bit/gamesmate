import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully!", {
        style: {
          background: "var(--brand-green)",
          color: "var(--violet-deep)",
          border: "2px solid var(--gold)",
          fontWeight: "bold",
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error signing out", {
        style: {
          background: "var(--brand-red)",
          color: "white",
          border: "2px solid var(--gold)",
        },
      });
    }
  };

  return { user, loading, signOut };
}
