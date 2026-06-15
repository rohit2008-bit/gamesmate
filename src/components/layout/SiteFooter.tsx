import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="px-4 pb-6 pt-16">
      <div className="mx-auto max-w-6xl panel-violet px-6 py-8">
        <div className="relative z-10 grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-10 h-10 overflow-hidden">
                <img src="/logo.png" alt="GamesMate Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-bold text-xl">
                GAMES<span className="text-[var(--brand-yellow)]">MATE</span>
              </span>
            </div>
            <p className="text-white/70 text-sm max-w-sm">
              Every Game Needs A Mate. Create teams, host matches, run tournaments, and climb the Mate Score ranks.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-[var(--brand-yellow)]">Play</h4>
            <ul className="space-y-1 text-sm text-white/75">
              <li><Link to="/discover">Discover</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-[var(--brand-yellow)]">Company</h4>
            <ul className="space-y-1 text-sm text-white/75">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="relative z-10 mt-8 pt-4 border-t border-white/10 text-xs text-white/50">
          © {new Date().getFullYear()} GamesMate. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
