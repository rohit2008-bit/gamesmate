import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Check, Crown, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — GamesMate" },
      { name: "description", content: "GamesMate Pro, Team Owner Plan, and pay-per-listing pricing." },
    ],
  }),
  component: Pricing,
});

const plans = [
  {
    name: "Free Player",
    price: "₹0",
    period: "forever",
    perks: ["Create profile", "Join matches & tournaments", "First 3 matches free", "First 1 tournament free"],
    cta: "Get Started",
    color: "btn-game-violet",
  },
  {
    name: "GamesMate Pro",
    price: "₹99",
    period: "/month",
    perks: ["Unlimited match creation", "Unlimited tournament creation", "Premium badge", "Featured listings"],
    cta: "Go Pro",
    color: "btn-game-green",
    featured: true,
  },
  {
    name: "Team Owner",
    price: "₹49",
    period: "/month",
    trial: "₹10 trial",
    perks: ["Create your team", "Team branding & logo", "Member management", "Team chat & standings"],
    cta: "Start ₹10 Trial",
    color: "btn-game-blue",
  },
];

function Pricing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="px-4 pt-10 pb-6 text-center">
        <span className="badge-game"><Sparkles className="w-3.5 h-3.5" /> Simple Pricing</span>
        <h1 className="mt-4 text-4xl md:text-5xl font-bold">Pick your <span className="text-[var(--brand-yellow)]">plan</span></h1>
        <p className="mt-3 text-white/75 max-w-xl mx-auto">Play free, or unlock unlimited hosting, branded teams, and featured listings.</p>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl grid md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div key={p.name} className={`panel-game p-7 flex flex-col ${p.featured ? "md:-translate-y-3 ring-4 ring-[var(--brand-yellow)]/40" : ""}`}>
              <div className="relative z-10 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-[color:var(--card-foreground)]">{p.name}</h3>
                {p.featured && <span className="badge-game !text-[0.7rem]"><Crown className="w-3.5 h-3.5" /> Popular</span>}
              </div>
              <div className="relative z-10 mt-3 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-[color:var(--card-foreground)]">{p.price}</span>
                <span className="text-[color:var(--card-foreground)]/70">{p.period}</span>
              </div>
              {p.trial && <p className="relative z-10 text-sm text-[color:var(--brand-blue)] font-semibold mt-1">{p.trial}</p>}
              <ul className="relative z-10 mt-5 space-y-2 flex-1">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm text-[color:var(--card-foreground)]/85">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[var(--brand-green)] border-2 border-[var(--gold)] grid place-items-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
              <Link to="/discover" className={`btn-game ${p.color} mt-6`}>{p.cta}</Link>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-6xl mt-10 panel-violet p-6">
          <div className="relative z-10 grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-2xl font-bold">Pay-per-listing</h3>
              <p className="text-white/75 mt-1 text-sm">No subscription? No problem. Host occasionally.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <div className="chip-sport !text-base">Match · ₹20</div>
              <div className="chip-sport !text-base">Tournament · ₹30</div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
