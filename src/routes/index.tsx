import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trophy, Users, Calendar, Zap, Crown, Activity, Target, Medal, ShieldCheck } from "lucide-react";
import hero from "@/assets/hero.png";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GamesMate — Every Game Needs A Mate" },
      { name: "description", content: "Community-driven sports platform to host matches, run tournaments, manage teams, and climb the Mate Score ranks." },
      { property: "og:title", content: "GamesMate — Every Game Needs A Mate" },
      { property: "og:description", content: "Host matches, build teams, run tournaments, track live scores, and rank up your Mate Score." },
    ],
  }),
  component: Landing,
});

const sports = ["Cricket", "Football", "Basketball", "Volleyball", "Badminton"];

const features = [
  { icon: Users, color: "bg-[var(--brand-blue)]", title: "Team Management", desc: "Create teams, approve members, run team chat, and track team stats." },
  { icon: Calendar, color: "bg-[var(--brand-green)]", title: "Match Hosting", desc: "Public or private rooms, password-protected matches, up to two teams." },
  { icon: Trophy, color: "bg-[var(--brand-yellow)]", title: "Tournaments", desc: "Set rules, approve teams, schedule rounds, and track standings live." },
  { icon: Activity, color: "bg-[var(--brand-red)]", title: "Live Scoreboards", desc: "Manual live scoring for cricket, football, basketball, volleyball, badminton." },
  { icon: Medal, color: "bg-[var(--brand-blue)]", title: "Mate Score Ranks", desc: "Win +10 / Lose -10. Climb from Rookie to Legend." },
  { icon: Crown, color: "bg-[var(--brand-yellow)]", title: "Premium Perks", desc: "Unlimited hosting, premium badge, featured listings with GamesMate Pro." },
];

const ranks = [
  { name: "Rookie", range: "1000–1199", color: "from-zinc-400 to-zinc-600" },
  { name: "Challenger", range: "1200–1399", color: "from-[var(--brand-green)] to-emerald-700" },
  { name: "Competitor", range: "1400–1599", color: "from-[var(--brand-blue)] to-sky-700" },
  { name: "Elite", range: "1600–1799", color: "from-fuchsia-400 to-violet-700" },
  { name: "Champion", range: "1800–1999", color: "from-[var(--brand-yellow)] to-orange-600" },
  { name: "Legend", range: "2000+", color: "from-[var(--brand-red)] to-rose-700" },
];

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: "/discover" });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="px-4 pt-10 pb-16">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
          <div className="animate-bounce-in">
            <span className="badge-game mb-5"><Zap className="w-3.5 h-3.5" /> Every Game Needs A Mate</span>
            <h1 className="heading-hero">
              Host. Play. <span className="text-[var(--brand-yellow)]">Rank Up.</span>
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-xl">
              GamesMate is the gamified sports platform for players, teams, hosts, and organizers.
              Create matches, run tournaments, track live scores, and earn your Mate Score.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/auth" className="btn-game btn-game-green"><Trophy className="w-5 h-5" /> Start Playing</Link>
              <Link to="/pricing" className="btn-game btn-game-violet"><Crown className="w-5 h-5" /> Go Pro</Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {sports.map((s) => (
                <span key={s} className="chip-sport">{s}</span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 -z-10 blur-3xl opacity-60 bg-[radial-gradient(ellipse_at_center,_var(--brand-yellow),_transparent_60%)]" />
            <img src={hero} alt="GamesMate sports heroes celebrating with a trophy" width={1024} height={1024} className="w-full max-w-lg mx-auto animate-float drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <span className="badge-game"><Target className="w-3.5 h-3.5" /> Built for Players</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold">Everything you need to <span className="text-[var(--brand-green)]">compete</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="panel-game p-6">
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl ${f.color} grid place-items-center border-2 border-[var(--gold)] shadow-[var(--shadow-inner-glow)] mb-4`}>
                    <f.icon className="w-6 h-6 text-white drop-shadow" />
                  </div>
                  <h3 className="text-xl font-bold text-[color:var(--card-foreground)]">{f.title}</h3>
                  <p className="mt-2 text-sm text-[color:var(--card-foreground)]/75">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RANKS */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl panel-violet p-8 md:p-12">
          <div className="relative z-10 text-center mb-8">
            <span className="badge-game"><Medal className="w-3.5 h-3.5" /> Mate Score</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold">Climb from <span className="text-[var(--brand-yellow)]">Rookie</span> to <span className="text-[var(--brand-red)]">Legend</span></h2>
            <p className="mt-3 text-white/75 max-w-2xl mx-auto">Start at 1000. Win matches +10, lose -10. Earn badges and unlock featured listings as you rise.</p>
          </div>
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {ranks.map((r, i) => (
              <div key={r.name} className={`rounded-2xl p-4 text-center border-2 border-[var(--gold)] bg-gradient-to-b ${r.color} shadow-[var(--shadow-inner-glow)]`}>
                <div className="text-xs font-bold text-white/80">Rank {i + 1}</div>
                <div className="text-lg font-bold text-white drop-shadow">{r.name}</div>
                <div className="text-xs text-white/85 mt-1">{r.range}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold">How it works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { n: 1, t: "Create Profile", d: "Pick your main sport and city." },
              { n: 2, t: "Join or Create Team", d: "Build your squad or request to join one." },
              { n: 3, t: "Host or Join Matches", d: "Discover events near you, or host your own." },
              { n: 4, t: "Earn Mate Score", d: "Compete, win, and rank up." },
            ].map((s) => (
              <div key={s.n} className="panel-game p-5">
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-full bg-[var(--gradient-gold)] border-2 border-[var(--gold)] grid place-items-center font-bold text-[color:var(--primary-foreground)]">{s.n}</div>
                  <h3 className="mt-3 text-lg font-bold text-[color:var(--card-foreground)]">{s.t}</h3>
                  <p className="text-sm text-[color:var(--card-foreground)]/75 mt-1">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl panel-game p-10 text-center">
          <div className="relative z-10">
            <div className="inline-grid place-items-center w-16 h-16 rounded-3xl bg-[var(--gradient-gold)] border-2 border-[var(--gold)] mb-4">
              <ShieldCheck className="w-8 h-8 text-[color:var(--primary-foreground)]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[color:var(--card-foreground)]">Ready to find your mates?</h2>
            <p className="mt-2 text-[color:var(--card-foreground)]/75">First 3 matches and 1 tournament are free for every new player.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/discover" className="btn-game btn-game-green">Discover Events</Link>
              <Link to="/pricing" className="btn-game btn-game-blue">See Pricing</Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
