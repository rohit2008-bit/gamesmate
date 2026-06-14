import { Link } from "@tanstack/react-router";
import { Trophy, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { db } from "@/lib/supabase-db";

export function SiteHeader() {
  const { user, loading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      db.getNotifications(user.id).then((notifs) => {
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
      });
    }
  }, [user]);

  // Extract initials or name
  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Player";
  const userInitials = displayName.substring(0, 2).toUpperCase();

  // Define navigation links based on authentication state
  const baseLinks = [
    { to: "/", label: "Home" },
    { to: "/discover", label: "Discover" },
    { to: "/pricing", label: "Pricing" },
  ];
  const authLinks = user
    ? [
        { to: "/my-sports", label: "My Sports" },
        { to: "/approve-requests", label: "Approve Requests" },
      ]
    : [
        { to: "/about", label: "About" },
        { to: "/contact", label: "Contact" },
      ];
  const navLinks = [...baseLinks, ...authLinks];

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto max-w-6xl panel-violet flex items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="flex items-center justify-center w-10 h-10 overflow-hidden">
            <img src="/logo.png" alt="GamesMate Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            GAMES<span className="text-[var(--brand-yellow)]">MATE</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-1 relative z-10">
          {navLinks.map((l) => (
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

        <div className="flex items-center gap-2 relative z-10">
          {loading ? (
            <div className="h-9 w-20 animate-pulse bg-white/10 rounded-full" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/notifications"
                className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition border border-white/15"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--brand-red)] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-[var(--violet-deep)]">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="btn-game btn-game-blue !py-2 !px-5 !text-sm">
                My Profile
              </Link>
            </div>
          ) : (
            <Link to="/auth" className="btn-game btn-game-green !py-2 !px-5 !text-sm">
              Play Now
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
