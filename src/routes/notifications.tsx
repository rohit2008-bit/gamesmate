import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/lib/supabase";
import { db, DbNotification } from "@/lib/supabase-db";
import { Bell, Trophy, Calendar, Sparkles, CheckCheck, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — GamesMate" },
      { name: "description", content: "View notifications related to matches, tournaments, and community events." },
    ],
  }),
  component: Notifications,
});

type TabType = "match" | "tournament" | "community";

function Notifications() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("match");
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [fetching, setFetching] = useState(true);

  const fetchNotifications = async (userId: string) => {
    setFetching(true);
    const data = await db.getNotifications(userId);
    setNotifications(data);
    setFetching(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/auth" });
      } else {
        setUser(session.user);
        fetchNotifications(session.user.id);
      }
      setLoading(false);
    });
  }, []);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await db.markAllNotificationsRead(user.id);
    toast.success("All notifications marked as read", {
      style: {
        background: "var(--brand-green)",
        color: "var(--violet-deep)",
        border: "2px solid var(--gold)",
        fontWeight: "bold",
      },
    });
    fetchNotifications(user.id);
  };

  const filteredNotifications = notifications.filter((n) => {
    const limit = Date.now() - 24 * 60 * 60 * 1000;
    const isWithin24Hours = new Date(n.created_at).getTime() >= limit;
    return n.type === activeTab && isWithin24Hours;
  });

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case "match":
        return <Calendar className="w-4 h-4" />;
      case "tournament":
        return <Trophy className="w-4 h-4" />;
      case "community":
        return <Sparkles className="w-4 h-4" />;
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gold)]" />
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-grow px-4 pt-10 pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="badge-game mb-3"><Bell className="w-3.5 h-3.5" /> Stay Updated</span>
              <h1 className="text-4xl md:text-5xl font-bold mt-2">Notifications</h1>
              <p className="mt-1 text-white/75">Manage your matches, tournament activities, and community updates.</p>
            </div>
            {notifications.some((n) => !n.is_read) && (
              <button
                onClick={handleMarkAllRead}
                className="btn-game btn-game-green self-start md:self-center flex items-center gap-2 !py-2 !px-4 !text-sm"
              >
                <CheckCheck className="w-4 h-4" /> Mark all as read
              </button>
            )}
          </div>

          {/* Tab Selection */}
          <div className="panel-violet p-2 mb-6 flex flex-wrap gap-2 relative z-10">
            {(["match", "tournament", "community"] as TabType[]).map((tab) => {
              const count = notifications.filter((n) => n.type === tab && !n.is_read).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`chip-sport flex items-center gap-2 capitalize relative ${
                    activeTab === tab
                      ? "!bg-[var(--brand-yellow)] !text-[color:var(--primary-foreground)] !border-[var(--gold)]"
                      : ""
                  }`}
                >
                  {getTabIcon(tab)}
                  {tab === "match" ? "matches" : tab === "tournament" ? "tournament" : "community"}
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[var(--brand-red)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="panel-game p-10 text-center text-white/60">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40 text-[var(--brand-yellow)]" />
              <p className="text-lg font-semibold">No notifications yet.</p>
              <p className="text-sm mt-1">Notifications about your selected category will show up here.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`panel-game p-5 flex items-start gap-4 transition-all duration-200 ${
                    !notif.is_read ? "border-l-4 border-l-[var(--brand-yellow)] bg-white/5" : ""
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl border-2 border-[var(--gold)] ${
                      notif.type === "match"
                        ? "bg-[var(--brand-green)]"
                        : notif.type === "tournament"
                        ? "bg-[var(--brand-blue)]"
                        : "bg-[var(--brand-yellow)] text-[color:var(--primary-foreground)]"
                    }`}
                  >
                    {notif.type === "match" ? (
                      <Calendar className="w-5 h-5 text-white" />
                    ) : notif.type === "tournament" ? (
                      <Trophy className="w-5 h-5 text-white" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-[color:var(--card-foreground)] font-medium leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-xs text-[color:var(--card-foreground)]/50 mt-1 block">
                      {new Date(notif.created_at).toLocaleDateString()} at{" "}
                      {new Date(notif.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
