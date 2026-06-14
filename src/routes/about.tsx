import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Heart, Users, Zap } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — GamesMate" },
      { name: "description", content: "GamesMate is a community-driven sports platform built on a simple idea: every game needs a mate." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="px-4 pt-10 pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="badge-game"><Heart className="w-3.5 h-3.5" /> Our Story</span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold">Every Game Needs A <span className="text-[var(--brand-yellow)]">Mate</span></h1>
          <p className="mt-5 text-white/80 text-lg">
            GamesMate exists to make grassroots sports more fun, social, and competitive.
            We connect players, teams, hosts, and tournament organizers in one gamified ecosystem —
            powered by rankings, team management, and live scoring.
          </p>
        </div>

        <div className="mx-auto max-w-5xl mt-12 grid md:grid-cols-3 gap-5">
          {[
            { icon: Users, title: "Community-first", desc: "Built around teams, mates, and local sport." },
            { icon: Zap, title: "Gamified", desc: "Mate Score, badges, and ranks make every match matter." },
            { icon: Heart, title: "For every player", desc: "From Sunday cricket to weekly hoops, all sports welcome." },
          ].map((c) => (
            <div key={c.title} className="panel-game p-6">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[var(--brand-blue)] border-2 border-[var(--gold)] grid place-items-center mb-3">
                  <c.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[color:var(--card-foreground)]">{c.title}</h3>
                <p className="text-sm text-[color:var(--card-foreground)]/75 mt-1">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
