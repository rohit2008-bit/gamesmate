import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trophy, Mail, User, MapPin, Shield, Star, Medal, Award, LogOut, Save, RefreshCw, Settings } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — GamesMate" },
      { name: "description", content: "Manage your GamesMate player profile, view your Mate Score, and track your stats." },
    ],
  }),
  component: Profile,
});

interface UserMetadata {
  name?: string;
  city?: string;
  preferred_sport?: string;
  current_team?: string;
  matches_played?: number;
  tournaments_played?: number;
  wins?: number;
  mate_score?: number;
}

function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [sport, setSport] = useState("Cricket");
  const [currentTeam, setCurrentTeam] = useState("");
  
  // Game stats states
  const [matchesPlayed, setMatchesPlayed] = useState(130);
  const [tournamentsPlayed, setTournamentsPlayed] = useState(15);
  const [wins, setWins] = useState(100);
  const [mateScore, setMateScore] = useState(1780);

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please sign in to view your profile", {
          style: { background: "var(--brand-red)", color: "white", border: "2px solid var(--gold)" }
        });
        navigate({ to: "/auth" });
      } else {
        setUser(session.user);
        
        // Load user metadata with defaults from PRD
        const meta: UserMetadata = session.user.user_metadata || {};
        setName(meta.name || session.user.email?.split("@")[0] || "Player One");
        setCity(meta.city || "Bhuj");
        setSport(meta.preferred_sport || "Cricket");
        setCurrentTeam(meta.current_team || "Bhuj Warriors");
        setMatchesPlayed(meta.matches_played !== undefined ? meta.matches_played : 130);
        setTournamentsPlayed(meta.tournaments_played !== undefined ? meta.tournaments_played : 15);
        setWins(meta.wins !== undefined ? meta.wins : 100);
        setMateScore(meta.mate_score !== undefined ? meta.mate_score : 1780);
        
        setLoading(false);
      }
    });
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name,
          city,
          preferred_sport: sport,
          current_team: currentTeam,
          matches_played: matchesPlayed,
          tournaments_played: tournamentsPlayed,
          wins,
          mate_score: mateScore
        }
      });

      if (error) throw error;

      toast.success("Profile saved to the cloud! ☁️", {
        style: {
          background: "var(--brand-green)",
          color: "var(--violet-deep)",
          border: "2px solid var(--gold)",
          fontWeight: "bold",
        }
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile", {
        style: { background: "var(--brand-red)", color: "white", border: "2px solid var(--gold)" }
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully!", {
      style: { background: "var(--brand-green)", color: "var(--violet-deep)", border: "2px solid var(--gold)" }
    });
    navigate({ to: "/" });
  };

  // Calculate skill rank based on Mate Score
  const getRankDetails = (score: number) => {
    if (score >= 2000) return { name: "Legend", color: "from-[var(--brand-red)] to-rose-700", min: 2000, max: 3000 };
    if (score >= 1800) return { name: "Champion", color: "from-[var(--brand-yellow)] to-orange-600", min: 1800, max: 1999 };
    if (score >= 1600) return { name: "Elite", color: "from-fuchsia-400 to-violet-700", min: 1600, max: 1799 };
    if (score >= 1400) return { name: "Competitor", color: "from-[var(--brand-blue)] to-sky-700", min: 1400, max: 1599 };
    if (score >= 1200) return { name: "Challenger", color: "from-[var(--brand-green)] to-emerald-700", min: 1200, max: 1399 };
    return { name: "Rookie", color: "from-zinc-400 to-zinc-600", min: 1000, max: 1199 };
  };

  const rank = getRankDetails(mateScore);
  const initials = name.substring(0, 2).toUpperCase();
  const losses = Math.max(0, matchesPlayed - wins);
  const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <SiteHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-10 h-10 text-[var(--brand-yellow)] animate-spin" />
            <span className="font-bold text-lg text-white">Loading Player Profile...</span>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 relative">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Player Card & Stats */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Skeuomorphic Player Avatar Card */}
            <div className="panel-game p-6 text-center">
              <div className="relative z-10">
                <span className={`badge-game absolute -top-10 left-1/2 -translate-x-1/2`}>
                  <Award className="w-4 h-4" /> Active Member
                </span>

                {/* Profile Photo */}
                <div className="relative w-28 h-28 mx-auto mt-4 mb-4 rounded-3xl bg-[var(--gradient-gold)] border-4 border-[var(--gold)] shadow-[var(--shadow-game-sm)] grid place-items-center">
                  <span className="text-4xl font-extrabold text-[var(--primary-foreground)] drop-shadow">
                    {initials}
                  </span>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[var(--brand-green)] border-2 border-[var(--gold)] grid place-items-center shadow-md">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                </div>

                <h2 className="text-2xl font-black text-[color:var(--card-foreground)] truncate">{name}</h2>
                <div className="flex items-center justify-center gap-1.5 text-xs text-[color:var(--card-foreground)]/70 mt-1 font-bold">
                  <MapPin className="w-3.5 h-3.5" /> {city}
                </div>

                {/* Team Tag */}
                <div className="mt-4 px-4 py-2 rounded-2xl bg-[var(--violet-deep)]/10 border border-[var(--gold)]/20 inline-block">
                  <span className="text-xs font-bold text-[color:var(--card-foreground)]/60 block uppercase">Team</span>
                  <span className="text-sm font-black text-[color:var(--card-foreground)]">{currentTeam}</span>
                </div>
              </div>
            </div>

            {/* Rank Card */}
            <div className="panel-violet p-6 text-center">
              <div className="relative z-10 space-y-3">
                <span className="badge-game">
                  <Medal className="w-3.5 h-3.5" /> Skill Rating
                </span>
                
                <div>
                  <div className="text-sm font-bold text-white/60">MATE SCORE</div>
                  <div className="text-4xl font-black text-white text-stroke-gold drop-shadow-md">{mateScore}</div>
                </div>

                {/* Badge Visual */}
                <div className={`mx-auto w-32 py-1.5 px-4 rounded-full border-2 border-[var(--gold)] bg-gradient-to-r ${rank.color} text-sm font-black text-white drop-shadow-sm`}>
                  {rank.name}
                </div>

                {/* Rank progress bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-white/70 font-semibold mb-1">
                    <span>Min: {rank.min}</span>
                    <span>Max: {rank.max}</span>
                  </div>
                  <div className="w-full h-4 bg-black/30 rounded-full overflow-hidden border-2 border-white/10 p-0.5">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${rank.color}`} 
                      style={{ width: `${Math.min(100, Math.max(10, ((mateScore - rank.min) / (rank.max - rank.min)) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Editable Profile Details & Stats */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Dashboard */}
            <div className="grid grid-cols-3 gap-4">
              <div className="panel-game p-4 text-center">
                <div className="relative z-10">
                  <div className="text-xs font-bold text-[color:var(--card-foreground)]/60">MATCHES PLAYED</div>
                  <div className="text-2xl font-black text-[color:var(--card-foreground)] mt-1">{matchesPlayed}</div>
                  <div className="text-[10px] font-bold text-[color:var(--card-foreground)]/45">Career Total</div>
                </div>
              </div>
              <div className="panel-game p-4 text-center">
                <div className="relative z-10">
                  <div className="text-xs font-bold text-[color:var(--card-foreground)]/60">WINS</div>
                  <div className="text-2xl font-black text-[color:var(--brand-green)] mt-1">{wins}</div>
                  <div className="text-[10px] font-bold text-[color:var(--card-foreground)]/45">{winRate}% Win Rate</div>
                </div>
              </div>
              <div className="panel-game p-4 text-center">
                <div className="relative z-10">
                  <div className="text-xs font-bold text-[color:var(--card-foreground)]/60">LOSSES</div>
                  <div className="text-2xl font-black text-[color:var(--brand-red)] mt-1">{losses}</div>
                  <div className="text-[10px] font-bold text-[color:var(--card-foreground)]/45">Competed Hard</div>
                </div>
              </div>
            </div>

            {/* Profile Settings Panel */}
            <div className="panel-game p-6">
              <div className="relative z-10">
                <h3 className="text-xl font-black text-[color:var(--card-foreground)] mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Edit Player Profile
                </h3>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[color:var(--card-foreground)] mb-1">
                        Player Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border-2 border-[var(--gold)] bg-white/95 px-4 py-2.5 text-sm text-[color:var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[color:var(--card-foreground)] mb-1">
                        Home City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border-2 border-[var(--gold)] bg-white/95 px-4 py-2.5 text-sm text-[color:var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[color:var(--card-foreground)] mb-1">
                        Main Sport
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
                    <div>
                      <label className="block text-xs font-bold text-[color:var(--card-foreground)] mb-1">
                        Current Team Name
                      </label>
                      <input
                        type="text"
                        value={currentTeam}
                        onChange={(e) => setCurrentTeam(e.target.value)}
                        className="w-full rounded-xl border-2 border-[var(--gold)] bg-white/95 px-4 py-2.5 text-sm text-[color:var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
                      />
                    </div>
                  </div>

                  {/* Sandbox Stats Adjuster (Skeuomorphic Fun Element) */}
                  <div className="p-4 rounded-2xl bg-[var(--violet-deep)]/10 border border-[var(--gold)]/20 mt-4 space-y-3">
                    <span className="badge-game !text-[10px]">
                      <Star className="w-3 h-3" /> Sandbox Stat Editor
                    </span>
                    <p className="text-[10px] font-bold text-[color:var(--card-foreground)]/60">
                      Since you are in sandbox mode, feel free to edit your live stats to see your Mate Score rank calculate in real time!
                    </p>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-[color:var(--card-foreground)] mb-1">
                          Matches Played
                        </label>
                        <input
                          type="number"
                          value={matchesPlayed}
                          onChange={(e) => setMatchesPlayed(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full rounded-lg border-2 border-[var(--gold)] bg-white/95 px-3 py-1.5 text-xs text-[color:var(--card-foreground)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-[color:var(--card-foreground)] mb-1">
                          Wins
                        </label>
                        <input
                          type="number"
                          value={wins}
                          onChange={(e) => setWins(Math.min(matchesPlayed, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-full rounded-lg border-2 border-[var(--gold)] bg-white/95 px-3 py-1.5 text-xs text-[color:var(--card-foreground)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-[color:var(--card-foreground)] mb-1">
                          Tournaments
                        </label>
                        <input
                          type="number"
                          value={tournamentsPlayed}
                          onChange={(e) => setTournamentsPlayed(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full rounded-lg border-2 border-[var(--gold)] bg-white/95 px-3 py-1.5 text-xs text-[color:var(--card-foreground)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-[color:var(--card-foreground)] mb-1">
                          Mate Score
                        </label>
                        <input
                          type="number"
                          value={mateScore}
                          onChange={(e) => setMateScore(Math.max(1000, parseInt(e.target.value) || 1000))}
                          className="w-full rounded-lg border-2 border-[var(--gold)] bg-white/95 px-3 py-1.5 text-xs text-[color:var(--card-foreground)]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="btn-game btn-game-red !py-2.5 !px-5 !text-sm flex items-center gap-1.5"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                    
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-game btn-game-green !py-2.5 !px-6 !text-sm flex items-center gap-1.5"
                    >
                      {saving ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Save Profile
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </div>

          </div>
          
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
