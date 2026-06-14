import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trophy, Mail, Lock, User, Sparkles, ArrowRight, Shield } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Join GamesMate — Account Sign In / Sign Up" },
      { name: "description", content: "Sign in or create your GamesMate account to start hosting matches, building your score, and climbing the ranks." },
    ],
  }),
  component: Auth,
});

type AuthMode = "signin" | "signup";

function Auth() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [sport, setSport] = useState("Cricket");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if user is already signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: "/discover" });
      }
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all required fields!", {
        style: {
          background: "var(--brand-red)",
          color: "white",
          border: "2px solid var(--gold)",
        },
      });
      return;
    }

    if (mode === "signup" && !name) {
      toast.error("Please provide your name to register!", {
        style: {
          background: "var(--brand-red)",
          color: "white",
          border: "2px solid var(--gold)",
        },
      });
      return;
    }

    setLoading(true);
    toast.info(mode === "signin" ? "Signing you in..." : "Creating your profile...", {
      style: {
        background: "var(--violet-mid)",
        color: "white",
        border: "2px solid var(--gold)",
      },
    });

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("Welcome back to GamesMate! 🏆", {
          style: {
            background: "var(--brand-green)",
            color: "var(--violet-deep)",
            border: "2px solid var(--gold)",
            fontWeight: "bold",
          },
        });
        navigate({ to: "/discover" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              preferred_sport: sport,
            },
          },
        });

        if (error) throw error;

        toast.success("Account created successfully! Check your email to confirm or start playing! 🎉", {
          style: {
            background: "var(--brand-green)",
            color: "var(--violet-deep)",
            border: "2px solid var(--gold)",
            fontWeight: "bold",
          },
        });
        navigate({ to: "/discover" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed", {
        style: {
          background: "var(--brand-red)",
          color: "white",
          border: "2px solid var(--gold)",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "Google" | "Apple") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider.toLowerCase() as "google" | "apple",
        options: {
          redirectTo: `${window.location.origin}/discover`,
        },
      });

      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Connection to ${provider} failed`, {
        style: {
          background: "var(--brand-red)",
          color: "white",
          border: "2px solid var(--gold)",
        },
      });
    }
  };

  const sportsOptions = ["Cricket", "Football", "Basketball", "Volleyball", "Badminton"];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Playful background glows */}
        <div className="absolute top-1/4 left-1/4 -z-10 w-96 h-96 blur-3xl opacity-30 rounded-full bg-[var(--brand-yellow)]" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 w-96 h-96 blur-3xl opacity-30 rounded-full bg-[var(--brand-blue)]" />

        <div className="w-full max-w-md animate-bounce-in relative z-10">
          
          {/* Main Card */}
          <div className="panel-game p-8">
            <div className="relative z-10">
              
              {/* Header Title */}
              <div className="text-center mb-6">
                <span className="badge-game mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Welcome Player
                </span>
                <h1 className="text-3xl font-extrabold text-[color:var(--card-foreground)]">
                  {mode === "signin" ? "Sign In" : "Create Account"}
                </h1>
                <p className="text-xs text-[color:var(--card-foreground)]/70 mt-1">
                  {mode === "signin" 
                    ? "Welcome back! Ready to find your mates?" 
                    : "Join the ultimate gamified sports platform."}
                </p>
              </div>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1.5 bg-[var(--violet-deep)]/10 rounded-2xl border-2 border-[var(--gold)]/35 mb-6">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`py-2 text-sm font-bold rounded-xl transition-all duration-250 ${
                    mode === "signin"
                      ? "bg-[var(--gradient-gold)] border border-[var(--gold)] text-[color:var(--primary-foreground)] shadow-sm"
                      : "text-[color:var(--card-foreground)]/60 hover:text-[color:var(--card-foreground)]"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`py-2 text-sm font-bold rounded-xl transition-all duration-250 ${
                    mode === "signup"
                      ? "bg-[var(--gradient-gold)] border border-[var(--gold)] text-[color:var(--primary-foreground)] shadow-sm"
                      : "text-[color:var(--card-foreground)]/60 hover:text-[color:var(--card-foreground)]"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="block text-xs font-bold text-[color:var(--card-foreground)] mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your game name"
                      className="w-full rounded-xl border-2 border-[var(--gold)] bg-white/95 px-4 py-2.5 text-sm text-[color:var(--card-foreground)] placeholder-[color:var(--card-foreground)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[color:var(--card-foreground)] mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full rounded-xl border-2 border-[var(--gold)] bg-white/95 px-4 py-2.5 text-sm text-[color:var(--card-foreground)] placeholder-[color:var(--card-foreground)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[color:var(--card-foreground)] mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border-2 border-[var(--gold)] bg-white/95 px-4 py-2.5 text-sm text-[color:var(--card-foreground)] placeholder-[color:var(--card-foreground)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
                  />
                </div>

                {mode === "signup" && (
                  <div>
                    <label className="block text-xs font-bold text-[color:var(--card-foreground)] mb-1 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" /> Preferred Sport
                    </label>
                    <select
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                      className="w-full rounded-xl border-2 border-[var(--gold)] bg-white/95 px-4 py-2.5 text-sm text-[color:var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
                    >
                      {sportsOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-game btn-game-green w-full mt-4 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Please wait..."
                  ) : (
                    <>
                      {mode === "signin" ? "Enter Arena" : "Join Arena"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-[var(--gold)]/20" />
                </div>
                <div className="relative flex justify-center text-xs font-bold uppercase">
                  <span className="bg-[var(--cream)] px-3 text-[color:var(--card-foreground)]/50">
                    Or Connect With
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSocialAuth("Google")}
                  className="px-4 py-2.5 rounded-xl border-2 border-[var(--gold)] bg-white hover:bg-neutral-50 text-xs font-bold text-[color:var(--card-foreground)] shadow-sm hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.68 1.41 7.59l3.89 3.02C6.22 7.57 8.87 5.04 12 5.04z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.58l3.71 2.88c2.16-1.99 3.42-4.93 3.42-8.61z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 10.61c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.41 3.01C.51 4.81 0 6.85 0 9s.51 4.19 1.41 5.99l3.89-3.38z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.71-2.88c-1.1.74-2.51 1.18-4.25 1.18-3.13 0-5.78-2.53-6.7-5.57L1.41 16.2C3.37 20.12 7.35 23 12 23z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => handleSocialAuth("Apple")}
                  className="px-4 py-2.5 rounded-xl border-2 border-[var(--gold)] bg-white hover:bg-neutral-50 text-xs font-bold text-[color:var(--card-foreground)] shadow-sm hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.11.09 2.26-.54 2.95-1.39z" />
                  </svg>
                  Apple
                </button>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[color:var(--card-foreground)]/50 font-semibold">
                <Shield className="w-3.5 h-3.5" /> Secure connections by GamesMate Security
              </div>

            </div>
          </div>

          {/* Prompt Toggle */}
          <div className="text-center mt-4 text-sm font-semibold">
            {mode === "signin" ? (
              <p>
                New player?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-[var(--brand-yellow)] hover:underline font-bold"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already registered?{" "}
                <button
                  onClick={() => setMode("signin")}
                  className="text-[var(--brand-yellow)] hover:underline font-bold"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
