import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MapPin, Calendar, Users, Trophy, Filter } from "lucide-react";

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
  { kind: "Match", sport: "Cricket", title: "Sunday Smash Cup", host: "Royal Stags", city: "Mumbai", date: "Sun, 22 Jun · 4:00 PM", players: "10/22", color: "bg-[var(--brand-green)]" },
  { kind: "Tournament", sport: "Football", title: "Monsoon League 2026", host: "City Sports Club", city: "Bengaluru", date: "Reg. ends 28 Jun", players: "12 teams", color: "bg-[var(--brand-blue)]" },
  { kind: "Match", sport: "Basketball", title: "Friday Night Hoops", host: "Hoop Squad", city: "Pune", date: "Fri, 20 Jun · 8:30 PM", players: "6/10", color: "bg-[var(--brand-red)]" },
  { kind: "Match", sport: "Badminton", title: "Doubles Showdown", host: "Smash Mates", city: "Delhi", date: "Sat, 21 Jun · 7:00 AM", players: "2/4", color: "bg-[var(--brand-yellow)]" },
  { kind: "Tournament", sport: "Volleyball", title: "Beach Battle", host: "Coastal Crew", city: "Goa", date: "Reg. ends 5 Jul", players: "8 teams", color: "bg-[var(--brand-blue)]" },
  { kind: "Match", sport: "Cricket", title: "Corporate Clash T10", host: "Office League", city: "Hyderabad", date: "Sun, 29 Jun · 9:00 AM", players: "18/22", color: "bg-[var(--brand-green)]" },
];

function Discover() {
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
        <div className="mx-auto max-w-6xl panel-violet p-4 md:p-5">
          <div className="relative z-10 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-white/80 font-semibold mr-2"><Filter className="w-4 h-4" /> Filters</div>
            {["All", "Matches", "Tournaments"].map((t, i) => (
              <button key={t} className={`chip-sport ${i === 0 ? "!bg-[var(--brand-yellow)] !text-[color:var(--primary-foreground)] !border-[var(--gold)]" : ""}`}>{t}</button>
            ))}
            <span className="w-px h-6 bg-white/15 mx-2" />
            {["Cricket", "Football", "Basketball", "Volleyball", "Badminton"].map((s) => (
              <button key={s} className="chip-sport">{s}</button>
            ))}
            <span className="w-px h-6 bg-white/15 mx-2" />
            {["Indoor", "Outdoor"].map((s) => (
              <button key={s} className="chip-sport">{s}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((it) => (
            <div key={it.title} className="panel-game p-5 flex flex-col">
              <div className="relative z-10 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white border-2 border-[var(--gold)] ${it.color}`}>{it.sport}</span>
                <span className="badge-game !py-1 !px-2 !text-[0.7rem]">{it.kind}</span>
              </div>
              <h3 className="relative z-10 mt-3 text-xl font-bold text-[color:var(--card-foreground)]">{it.title}</h3>
              <p className="relative z-10 text-sm text-[color:var(--card-foreground)]/70">Hosted by {it.host}</p>
              <div className="relative z-10 mt-4 grid grid-cols-1 gap-1.5 text-sm text-[color:var(--card-foreground)]/80">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {it.city}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {it.date}</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {it.players}</div>
              </div>
              <Link to="/discover" className="btn-game btn-game-green mt-5 self-start !py-2 !px-4 !text-sm">
                <Trophy className="w-4 h-4" /> {it.kind === "Match" ? "Join Match" : "Register Team"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
