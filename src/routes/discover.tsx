import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MapPin, Calendar, Users, Trophy, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { db, JoinRequest } from "@/lib/supabase-db";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover Matches & Tournaments — GamesMate" },
      { name: "description", content: "Browse and filter sports matches and tournaments by sport, location, and date." },
    ],
  }),
  component: Discover,
});

const items = [
  { kind: "Match", sport: "Cricket", title: "Sunday Smash Cup", host: "Royal Stags", city: "Mumbai", date: "Sun, 22 Jun · 4:00 PM", players: "10/22", venue: "Outdoor", color: "bg-[var(--brand-green)]" },
  { kind: "Tournament", sport: "Football", title: "Monsoon League 2026", host: "City Sports Club", city: "Bengaluru", date: "Reg. ends 28 Jun", players: "12 teams", venue: "Outdoor", color: "bg-[var(--brand-blue)]" },
  { kind: "Match", sport: "Basketball", title: "Friday Night Hoops", host: "Hoop Squad", city: "Pune", date: "Fri, 20 Jun · 8:30 PM", players: "6/10", venue: "Outdoor", color: "bg-[var(--brand-red)]" },
  { kind: "Match", sport: "Badminton", title: "Doubles Showdown", host: "Smash Mates", city: "Delhi", date: "Sat, 21 Jun · 7:00 AM", players: "2/4", venue: "Outdoor", color: "bg-[var(--brand-yellow)]" },
  { kind: "Tournament", sport: "Volleyball", title: "Beach Battle", host: "Coastal Crew", city: "Goa", date: "Reg. ends 5 Jul", players: "8 teams", venue: "Outdoor", color: "bg-[var(--brand-blue)]" },
  { kind: "Match", sport: "Cricket", title: "Corporate Clash T10", host: "Office League", city: "Hyderabad", date: "Sun, 29 Jun · 9:00 AM", players: "18/22", venue: "Outdoor", color: "bg-[var(--brand-green)]" },
  { kind: "Tournament", sport: "Table Tennis", title: "Spin Masters", host: "TT Club", city: "Chennai", date: "Sat, 28 Jun · 10:00 AM", players: "16 players", venue: "Indoor", color: "bg-[var(--brand-blue)]" },
  { kind: "Match", sport: "Chess", title: "Grandmaster Challenge", host: "Checkmate Lounge", city: "Pune", date: "Sun, 29 Jun · 4:00 PM", players: "2/2", venue: "Indoor", color: "bg-[var(--violet-mid)]" },
  { kind: "Match", sport: "Carrom", title: "Board Strikers", host: "Local Hub", city: "Mumbai", date: "Fri, 27 Jun · 7:30 PM", players: "4/4", venue: "Indoor", color: "bg-[var(--brand-yellow)]" },
];

function Discover() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [filterKind, setFilterKind] = useState("All");
  const [filterSport, setFilterSport] = useState("All");
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    const data = await db.getJoinRequests();
    setJoinRequests(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    fetchRequests();
  }, []);

  const handleJoin = async (item: typeof items[0]) => {
    if (!user) {
      toast.error("Please sign in or sign up to join a match or tournament!", {
        style: {
          background: "var(--brand-red)",
          color: "white",
          border: "2px solid var(--gold)",
        },
      });
      navigate({ to: "/auth" });
      return;
    }

    setSubmittingId(item.title);
    try {
      const type = item.kind === "Match" ? "match" as const : "tournament" as const;
      const userName = user.user_metadata?.name || user.email?.split("@")[0] || "Player";
      
      await db.createJoinRequest(
        user.id,
        userName,
        type,
        item.title,
        item.sport,
        item.city,
        item.venue,
        item.color,
        item.date
      );

      await db.addNotification(
        user.id,
        type,
        `Sent request to join ${item.kind.toLowerCase()}: "${item.title}"`
      );

      toast.success(`${item.kind} request sent successfully!`, {
        style: {
          background: "var(--brand-green)",
          color: "var(--violet-deep)",
          border: "2px solid var(--gold)",
          fontWeight: "bold",
        },
      });
      
      await fetchRequests();
    } catch (error) {
      toast.error("Failed to send join request. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterKind !== "All") {
      if (filterKind === "Matches" && item.kind !== "Match") return false;
      if (filterKind === "Tournaments" && item.kind !== "Tournament") return false;
    }
    if (filterSport !== "All" && item.sport !== filterSport) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="px-4 pt-10 pb-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold">Discover</h1>
          <p className="mt-2 text-white/75">Find matches and tournaments near you.</p>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="mx-auto max-w-6xl panel-violet p-5 md:p-6">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[var(--brand-yellow)] font-bold text-lg">
                <Filter className="w-5 h-5" /> 
                Refine Search
              </div>
              {(filterKind !== "All" || filterSport !== "All") && (
                <button
                  onClick={() => {
                    setFilterKind("All");
                    setFilterSport("All");
                  }}
                  className="text-xs font-bold text-white/60 hover:text-white underline decoration-dashed underline-offset-4"
                >
                  Clear Filters
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Event Type Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/80 uppercase tracking-wider">Event Type</label>
                <Select value={filterKind} onValueChange={setFilterKind}>
                  <SelectTrigger className="w-full rounded-xl border-2 border-[var(--gold)] bg-[var(--violet-deep)] px-4 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] shadow-[var(--shadow-inner-glow)] cursor-pointer h-auto">
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--violet-deep)] border-2 border-[var(--gold)] text-white rounded-xl shadow-[var(--shadow-game)] z-50">
                    <SelectItem value="All" className="focus:bg-[var(--brand-yellow)] focus:text-[var(--violet-deep)] cursor-pointer py-2 rounded-md font-semibold">All Events</SelectItem>
                    <SelectItem value="Matches" className="focus:bg-[var(--brand-yellow)] focus:text-[var(--violet-deep)] cursor-pointer py-2 rounded-md font-semibold">Matches Only</SelectItem>
                    <SelectItem value="Tournaments" className="focus:bg-[var(--brand-yellow)] focus:text-[var(--violet-deep)] cursor-pointer py-2 rounded-md font-semibold">Tournaments Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sport Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/80 uppercase tracking-wider">Sport</label>
                <Select value={filterSport} onValueChange={setFilterSport}>
                  <SelectTrigger className="w-full rounded-xl border-2 border-[var(--gold)] bg-[var(--violet-deep)] px-4 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] shadow-[var(--shadow-inner-glow)] cursor-pointer h-auto">
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--violet-deep)] border-2 border-[var(--gold)] text-white rounded-xl shadow-[var(--shadow-game)] z-50">
                    <SelectItem value="All" className="focus:bg-[var(--brand-yellow)] focus:text-[var(--violet-deep)] cursor-pointer py-2 rounded-md font-semibold">All Sports</SelectItem>
                    {["Cricket", "Football", "Basketball", "Volleyball", "Badminton", "Table Tennis", "Chess", "Carrom"].map((s) => (
                      <SelectItem key={s} value={s} className="focus:bg-[var(--brand-yellow)] focus:text-[var(--violet-deep)] cursor-pointer py-2 rounded-md font-semibold">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.length === 0 ? (
            <div className="col-span-full py-10 text-center text-white/60">
              No matches or tournaments found matching your filters.
            </div>
          ) : (
            filteredItems.map((it) => {
              // Check if user has an existing request for this item
              const existingRequest = user
                ? joinRequests.find(
                    (r) =>
                      r.requester_id === user.id &&
                      r.title === it.title &&
                      r.type === (it.kind === "Match" ? "match" : "tournament")
                  )
                : null;

              const isPending = existingRequest?.status === "pending";
              const isApproved = existingRequest?.status === "approved";
              const isRejected = existingRequest?.status === "rejected";

              let buttonLabel = it.kind === "Match" ? "Join Match" : "Register Team";
              let buttonStyle = "btn-game btn-game-green";
              let isButtonDisabled = false;

              if (submittingId === it.title) {
                buttonLabel = "Sending...";
                isButtonDisabled = true;
              } else if (isPending) {
                buttonLabel = "Pending Approval";
                buttonStyle = "btn-game btn-game-violet opacity-75 !cursor-not-allowed";
                isButtonDisabled = true;
              } else if (isApproved) {
                buttonLabel = it.kind === "Match" ? "Joined" : "Registered";
                buttonStyle = "btn-game btn-game-blue opacity-75 !cursor-not-allowed";
                isButtonDisabled = true;
              }

              return (
                <div key={it.title} className="panel-game p-5 flex flex-col">
                  <div className="relative z-10 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white border-2 border-[var(--gold)] ${it.color}`}>{it.sport}</span>
                    <span className="badge-game !py-1 !px-2 !text-[0.7rem]">{it.kind}</span>
                  </div>
                  <h3 className="relative z-10 mt-3 text-xl font-bold text-[color:var(--card-foreground)]">{it.title}</h3>
                  <p className="relative z-10 text-sm text-[color:var(--card-foreground)]/70">Hosted by {it.host}</p>
                  <div className="relative z-10 mt-4 grid grid-cols-1 gap-1.5 text-sm text-[color:var(--card-foreground)]/80">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {it.city} ({it.venue})</div>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {it.date}</div>
                    <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {it.players}</div>
                  </div>
                  <button
                    onClick={() => handleJoin(it)}
                    disabled={isButtonDisabled}
                    className={`${buttonStyle} mt-5 self-start !py-2 !px-4 !text-sm flex items-center gap-2`}
                  >
                    {submittingId === it.title ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trophy className="w-4 h-4" />
                    )}
                    {buttonLabel}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
