import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, UserPlus, Loader2, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/supabase-db";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const Route = createFileRoute("/search-users")({
  head: () => ({
    meta: [
      { title: "Search Users — GamesMate" },
      { name: "description", content: "Search for users by name or UID and send friend requests." },
    ],
  }),
  component: SearchUsers,
});

function SearchUsers() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
      }
    });
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      const results = await db.searchUsers(query.trim(), currentUser.id);
      setUsers(results);
      setLoading(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, currentUser]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
  };

  const handleSendRequest = async (receiverId: string, receiverName: string) => {
    if (!currentUser) return;
    
    await db.sendFriendRequest(currentUser.id, receiverId);
    
    setSentRequests((prev) => {
      const newSet = new Set(prev);
      newSet.add(receiverId);
      return newSet;
    });

    toast.success(`Friend request sent to ${receiverName}!`, {
      style: {
        background: "var(--brand-green)",
        color: "var(--violet-deep)",
        border: "2px solid var(--gold)",
        fontWeight: "bold",
      },
    });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="px-4 pt-10 pb-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold mb-6">Find Friends</h1>
          
          <form onSubmit={handleSearch} className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/50" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or UID (e.g. MATE-XXXXXX)..."
              className="w-full rounded-2xl border-2 border-[var(--gold)] bg-[var(--violet-deep)] py-4 pl-12 pr-24 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] shadow-[var(--shadow-inner-glow)] placeholder:text-white/40"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 bg-[var(--brand-yellow)] text-[var(--violet-deep)] font-bold rounded-xl px-4 hover:bg-yellow-400 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </button>
          </form>

          <div className="space-y-4">
            {!loading && query.trim() && users.length === 0 && (
              <div className="text-center py-10 text-white/60">
                No users found matching "{query}"
              </div>
            )}

            {users.map((u) => (
              <div key={u.id} className="panel-violet p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--brand-blue)] border-2 border-[var(--gold)] flex items-center justify-center overflow-hidden">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{u.name || "Player"}</h3>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <span className="bg-white/10 px-2 py-0.5 rounded font-mono text-xs">{u.game_uid || "No UID"}</span>
                      {u.city && <span>• {u.city}</span>}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleSendRequest(u.id, u.name || "Player")}
                  disabled={sentRequests.has(u.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition ${
                    sentRequests.has(u.id)
                      ? "bg-white/10 text-white/50 cursor-not-allowed"
                      : "bg-[var(--brand-yellow)] text-[var(--violet-deep)] hover:bg-yellow-400"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  {sentRequests.has(u.id) ? "Sent" : "Add Friend"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
