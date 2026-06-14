import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Trophy, Mail, User, MapPin, Shield, Star, Medal, Award, LogOut, Save, RefreshCw, Settings, Activity, Trash2, AlertTriangle, Plus, Copy, Edit2, X } from "lucide-react";
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
  pro_subscription?: boolean;
  avatar_url?: string;
  uid?: string;
}

const sportsOptions = [
  "Cricket",
  "Football",
  "Basketball",
  "Tennis",
  "Badminton",
  "Table Tennis",
  "Volleyball",
  "Other"
];

function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showAvatarSelect, setShowAvatarSelect] = useState(false);
  const [uid, setUid] = useState("");
  const initializingUid = useRef(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [sport, setSport] = useState("Cricket");
  const [currentTeam, setCurrentTeam] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Game stats states
  const [matchesPlayed, setMatchesPlayed] = useState(0);
  const [tournamentsPlayed, setTournamentsPlayed] = useState(0);
  const [wins, setWins] = useState(0);
  const [mateScore, setMateScore] = useState(1000);

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
        
        // Load user from public.profiles
        const loadProfile = async () => {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          
          if (profile) {
            setName(profile.name || session.user.email?.split("@")[0] || "Player One");
            setCity(profile.city || "");
            setSport(profile.preferred_sport || "Cricket");
            setCurrentTeam(profile.current_team || "");
            setMatchesPlayed(profile.matches_played || 0);
            setTournamentsPlayed(profile.tournaments_played || 0);
            setWins(profile.wins || 0);
            setMateScore(profile.mate_score || 1000);
            setIsPro(profile.pro_subscription || false);
            setAvatarUrl(profile.avatar_url || "");
            
            let gameUid = profile.game_uid;
            if (!gameUid && !initializingUid.current) {
              initializingUid.current = true;
              gameUid = "MATE-" + Math.random().toString(36).substring(2, 8).toUpperCase();
              await supabase.from('profiles').update({ game_uid: gameUid }).eq('id', session.user.id);
              await supabase.auth.updateUser({ data: { uid: gameUid } });
            }
            setUid(gameUid || "");
          } else {
            // Fallback for new signups where trigger might be slightly delayed
            const meta: UserMetadata = session.user.user_metadata || {};
            setName(meta.name || session.user.email?.split("@")[0] || "Player One");
            setCity(meta.city || "");
          }
          setLoading(false);
        };
        
        loadProfile();
      }
    });
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase.from('profiles').update({
        name,
        city,
        preferred_sport: sport
      }).eq('id', user.id);

      if (error) throw error;

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name,
          city,
          preferred_sport: sport
        }
      });

      if (authError) throw authError;

      toast.success("Profile saved to the cloud! ☁️", {
        style: {
          background: "var(--brand-green)",
          color: "var(--violet-deep)",
          border: "2px solid var(--gold)",
          fontWeight: "bold",
        }
      });
      setIsEditing(false);
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

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;
      
      await supabase.auth.signOut();
      toast.success("Account permanently deleted", {
        style: { background: "var(--brand-green)", color: "var(--violet-deep)", border: "2px solid var(--gold)" }
      });
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account", {
        style: { background: "var(--brand-red)", color: "white", border: "2px solid var(--gold)" }
      });
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const deletePreviousStorageAvatar = async (url: string) => {
    if (!url) return;
    const bucketMarker = "/storage/v1/object/public/avatars/";
    if (url.includes(bucketMarker)) {
      const fileName = url.split(bucketMarker).pop();
      if (fileName) {
        try {
          await supabase.storage.from('avatars').remove([fileName]);
        } catch (err) {
          console.error("Failed to delete previous avatar file:", err);
        }
      }
    }
  };

  const handleUpdateAvatar = async (url: string) => {
    const oldAvatarUrl = avatarUrl;
    setAvatarUrl(url);
    setShowAvatarSelect(false);
    toast.success("Avatar updated!", {
      style: { background: "var(--brand-green)", color: "var(--violet-deep)", border: "2px solid var(--gold)" }
    });
    
    try {
      const { error } = await supabase.from('profiles').update({
        avatar_url: url
      }).eq('id', user.id);
      if (error) throw error;

      await supabase.auth.updateUser({
        data: {
          avatar_url: url
        }
      });

      // If the save was successful, check and delete the old file from storage
      if (oldAvatarUrl && oldAvatarUrl !== url) {
        await deletePreviousStorageAvatar(oldAvatarUrl);
      }
    } catch (err) {
      toast.error("Failed to save avatar to cloud");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];

    // Check file size (3MB limit)
    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("File is too large! Maximum size allowed is 3MB.", {
        style: { background: "var(--brand-red)", color: "white", border: "2px solid var(--gold)" }
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await handleUpdateAvatar(publicUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image", {
        style: { background: "var(--brand-red)", color: "white", border: "2px solid var(--gold)" }
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const availableAvatars = [
    "/avatars/cricket.png",
    "/avatars/football.png",
    "/avatars/basketball.png",
    "/avatars/tennis.png",
    "/avatars/chess.png",
    "/avatars/volleyball.png",
    "/avatars/badminton.png",
    "/avatars/all_rounder.png",
    "/avatars/lion.png",
    "/avatars/fox.png",
    "/avatars/bear.png",
    "/avatars/eagle.png"
  ];

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
                {isPro && (
                  <span className={`badge-game absolute -top-10 left-1/2 -translate-x-1/2 !bg-gradient-to-r !from-purple-500 !to-indigo-500 !border-[var(--gold)]`}>
                    <Award className="w-4 h-4 text-yellow-300" /> PRO
                  </span>
                )}

                {/* Profile Photo */}
                <div className="relative w-28 h-28 mx-auto mt-4 mb-4 rounded-3xl bg-[var(--gradient-gold)] border-4 border-[var(--gold)] shadow-[var(--shadow-game-sm)] grid place-items-center group">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <span className="text-4xl font-extrabold text-[var(--primary-foreground)] drop-shadow">
                      {initials}
                    </span>
                  )}
                  <button 
                    type="button"
                    title="Change Profile Picture"
                    onClick={() => setShowAvatarSelect(true)}
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[var(--brand-green)] hover:bg-[#a6e622] border-2 border-[var(--gold)] grid place-items-center shadow-md transition-transform group-hover:scale-110 active:scale-95"
                  >
                    <Plus className="w-4 h-4 text-[var(--violet-deep)]" strokeWidth={3} />
                  </button>
                </div>

                <h2 className="text-2xl font-black text-[color:var(--card-foreground)] truncate">{name}</h2>
                <div className="text-[10px] font-extrabold text-[color:var(--card-foreground)]/40 mt-0.5 tracking-wider inline-flex items-center gap-1 justify-center">
                  UID : #{uid}
                  <button
                    type="button"
                    title="Copy UID"
                    onClick={() => { navigator.clipboard.writeText(uid); toast.success("UID copied!", { style: { background: "var(--brand-green)", color: "var(--violet-deep)", border: "2px solid var(--gold)" } }); }}
                    className="hover:text-[color:var(--card-foreground)]/70 active:scale-90 transition-transform"
                  >
                    <Copy className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-[color:var(--card-foreground)]/70 mt-1 font-bold">
                  <MapPin className="w-3.5 h-3.5" /> {city}
                </div>

                {/* Team Tag */}
                {currentTeam && (
                  <div className="mt-4 px-4 py-2 rounded-2xl bg-[var(--violet-deep)]/10 border border-[var(--gold)]/20 inline-block">
                    <span className="text-xs font-bold text-[color:var(--card-foreground)]/60 block uppercase">Team</span>
                    <span className="text-sm font-black text-[color:var(--card-foreground)]">{currentTeam}</span>
                  </div>
                )}
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
            {!isEditing ? (
              <div className="panel-game p-6">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-[color:var(--card-foreground)] flex items-center gap-2">
                      <User className="w-5 h-5" /> Player Credentials
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      title="Edit Profile"
                      className="w-9 h-9 rounded-xl bg-[var(--brand-yellow)] hover:bg-[#ffea30] border-2 border-[var(--gold)] grid place-items-center shadow-[var(--shadow-game-sm)] transition-transform hover:scale-105 active:scale-95"
                    >
                      <Edit2 className="w-4 h-4 text-[var(--violet-deep)]" strokeWidth={2.5} />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[var(--violet-deep)]/5 border-2 border-[var(--gold)]/20 rounded-2xl p-4">
                      <span className="block text-[10px] font-extrabold text-[color:var(--card-foreground)]/50 uppercase tracking-wider mb-1">
                        Player Name
                      </span>
                      <span className="text-base font-black text-[color:var(--card-foreground)] block truncate">
                        {name || "Not Set"}
                      </span>
                    </div>

                    <div className="bg-[var(--violet-deep)]/5 border-2 border-[var(--gold)]/20 rounded-2xl p-4">
                      <span className="block text-[10px] font-extrabold text-[color:var(--card-foreground)]/50 uppercase tracking-wider mb-1">
                        Email Address
                      </span>
                      <span className="text-base font-black text-[color:var(--card-foreground)] block truncate">
                        {user?.email || "Not Set"}
                      </span>
                    </div>

                    <div className="bg-[var(--violet-deep)]/5 border-2 border-[var(--gold)]/20 rounded-2xl p-4">
                      <span className="block text-[10px] font-extrabold text-[color:var(--card-foreground)]/50 uppercase tracking-wider mb-1">
                        Home City
                      </span>
                      <span className="text-base font-black text-[color:var(--card-foreground)] block truncate">
                        {city || "Not Set"}
                      </span>
                    </div>

                    <div className="bg-[var(--violet-deep)]/5 border-2 border-[var(--gold)]/20 rounded-2xl p-4">
                      <span className="block text-[10px] font-extrabold text-[color:var(--card-foreground)]/50 uppercase tracking-wider mb-1">
                        Main Sport
                      </span>
                      <span className="text-base font-black text-[color:var(--card-foreground)] block truncate">
                        {sport || "Not Set"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="panel-game p-6">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-[color:var(--card-foreground)] flex items-center gap-2">
                      <Settings className="w-5 h-5" /> Edit Player Profile
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      title="Cancel Edit"
                      className="w-9 h-9 rounded-xl bg-zinc-200 hover:bg-zinc-300 border-2 border-zinc-400/40 grid place-items-center shadow-[var(--shadow-game-sm)] transition-transform hover:scale-105 active:scale-95"
                    >
                      <X className="w-4 h-4 text-zinc-700" strokeWidth={2.5} />
                    </button>
                  </div>

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
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="btn-game btn-game-red !py-2.5 !px-5 !text-sm flex items-center gap-1.5"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 py-2.5 rounded-xl border-2 border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Account
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="btn-game !bg-zinc-200 !text-zinc-800 !border-zinc-300 !py-2.5 !px-5 !text-sm flex items-center gap-1.5"
                        >
                          <X className="w-4 h-4" /> Cancel
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
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
          
        </div>
      </main>

      <SiteFooter />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="panel-game max-w-sm w-full p-6 text-center animate-bounce-in relative z-10">
            <div className="mx-auto w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-[color:var(--card-foreground)] mb-2">Delete Account?</h3>
            <p className="text-sm text-[color:var(--card-foreground)]/70 mb-6 font-semibold">
              This action cannot be undone. All your stats, matches, and profile data will be permanently removed.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="btn-game !bg-zinc-200 !text-zinc-800 !border-zinc-300 !py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="btn-game btn-game-red !py-2 flex items-center justify-center gap-2"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Selection Modal */}
      {showAvatarSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="panel-game max-w-md w-full p-6 text-center animate-bounce-in relative z-10">
            <h3 className="text-xl font-black text-[color:var(--card-foreground)] mb-4">Choose Your Avatar</h3>
            <div className="max-h-[320px] overflow-y-auto pr-2 mb-6 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                {availableAvatars.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleUpdateAvatar(url)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-transform hover:scale-105 active:scale-95 ${avatarUrl === url ? 'border-[var(--brand-green)]' : 'border-[var(--gold)]/50'}`}
                  >
                    <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="btn-game btn-game-blue !py-2 w-full mb-3 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Upload Custom Picture
                </>
              )}
            </button>
            <div className="text-[11px] font-black text-red-500/85 mb-4 uppercase tracking-wider flex items-center justify-center gap-1.5 bg-red-500/5 py-1.5 px-3 rounded-xl border border-red-500/15">
              ⚠️ Warning: Max image size is 3MB
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => setShowAvatarSelect(false)}
              disabled={uploading}
              className="btn-game !bg-zinc-200 !text-zinc-800 !border-zinc-300 !py-2 w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
