import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/lib/supabase";
import { db, JoinRequest } from "@/lib/supabase-db";
import { Trophy, Calendar, MapPin, Users, Zap } from "lucide-react";

export const Route = createFileRoute("/my-sports")({
  head: () => ({
    meta: [
      { title: "My Sports — GamesMate" },
      { name: "description", content: "Your personal sports dashboard — matches, teams, and events." },
    ],
  }),
  component: MySports,
});

function MySports() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [approvedSports, setApprovedSports] = useState<JoinRequest[]>([]);
  const [fetching, setFetching] = useState(true);

  const fetchJoinedSports = async (userId: string) => {
    setFetching(true);
    const requests = await db.getJoinRequests();
    // Filter approved requests sent by the current user
    const joined = requests.filter(
      (r) => r.status === "approved" && r.requester_id === userId
    );
    setApprovedSports(joined);
    setFetching(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/auth" });
      } else {
        setUser(session.user);
        fetchJoinedSports(session.user.id);
      }
      setLoading(false);
    });
  }, []);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gold)]" />
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <section className="px-4 pt-10 pb-6">
        <div className="mx-auto max-w-6xl">
          <span className="badge-game mb-5"><Zap className="w-3.5 h-3.5" /> My Sports</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4">
            Your <span className="text-[var(--brand-yellow)]">Sports Hub</span>
          </h1>
          <p className="mt-2 text-white/75">All your matches, teams, and upcoming events in one place.</p>
        </div>
      </section>

      <section className="px-4 pb-16 flex-grow">
        <div className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {approvedSports.length === 0 ? (
            <div className="panel-game p-6 col-span-full">
              <div className="relative z-10 text-center py-10 text-white/50">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-semibold">No joined matches or tournaments yet.</p>
                <p className="text-sm mt-1">Join a match or register for a tournament to see it here.</p>
                <Link to="/discover" className="btn-game btn-game-green mt-5 inline-flex">
                  <Calendar className="w-4 h-4" /> Discover Matches
                </Link>
              </div>
            </div>
          ) : (
            approvedSports.map((it) => (
              <div key={it.id} className="panel-game p-5 flex flex-col">
                <div className="relative z-10 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white border-2 border-[var(--gold)] ${it.color}`}>{it.sport}</span>
                  <span className="badge-game !py-1 !px-2 !text-[0.7rem]">{it.type === "match" ? "Match" : "Tournament"}</span>
                </div>
                <h3 className="relative z-10 mt-3 text-xl font-bold text-[color:var(--card-foreground)]">{it.title}</h3>
                <p className="relative z-10 text-sm text-[color:var(--card-foreground)]/70">Joined successfully</p>
                <div className="relative z-10 mt-4 grid grid-cols-1 gap-1.5 text-sm text-[color:var(--card-foreground)]/80">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {it.city} ({it.venue})</div>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {it.date}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
