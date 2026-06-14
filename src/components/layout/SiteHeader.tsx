import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto max-w-6xl panel-violet flex items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="grid place-items-center w-10 h-10 rounded-2xl bg-[var(--gradient-gold)] border-2 border-[var(--gold)] shadow-[var(--shadow-inner-glow)]">
            <Trophy className="w-5 h-5 text-[var(--primary-foreground)]" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            GAMES<span className="text-[var(--brand-yellow)]">MATE</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 relative z-10">
          {[
            { to: "/", label: "Home" },
            { to: "/discover", label: "Discover" },
            { to: "/pricing", label: "Pricing" },
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-4 py-2 rounded-full text-sm font-semibold text-white/85 hover:text-white hover:bg-white/10 transition"
              activeProps={{ className: "px-4 py-2 rounded-full text-sm font-semibold text-[var(--brand-yellow)] bg-white/10" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link to="/discover" className="btn-game btn-game-green relative z-10 !py-2 !px-5 !text-sm">
          Play Now
        </Link>
      </div>
    </header>
  );
}
