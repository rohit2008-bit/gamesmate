import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/lib/supabase";
import { db, FriendRequest } from "@/lib/supabase-db";
import { Users, User, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/friends")({
  head: () => ({
    meta: [
      { title: "My Friends — GamesMate" },
      { name: "description", content: "View your friends list on GamesMate." },
    ],
  }),
  component: Friends,
});

function Friends() {
  const [user, setUser] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        const requests = await db.getFriendRequests(session.user.id);
        const acceptedFriends = requests
          .filter((req) => req.status === "accepted")
          .map((req) => {
            const isIncoming = req.receiver_id === session.user.id;
            return isIncoming ? req.sender_profile : req.receiver_profile;
          })
          .filter(Boolean); // remove any nulls
          
        setFriends(acceptedFriends);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <Users className="w-16 h-16 opacity-30 mb-4 text-[var(--brand-yellow)]" />
          <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
          <p className="text-white/60 max-w-sm">Sign in to view your friends and connect with other players.</p>
          <Link to="/auth" className="btn-game btn-game-green mt-6">Sign In</Link>
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
          <div className="mb-8 flex justify-between items-end">
            <div>
              <span className="badge-game mb-3"><Users className="w-3.5 h-3.5" /> Social</span>
              <h1 className="text-4xl md:text-5xl font-bold mt-2">My Friends</h1>
              <p className="mt-1 text-white/75">
                People you have connected with on GamesMate.
              </p>
            </div>
            <Link to="/search-users" className="btn-game btn-game-violet !py-2 !text-sm">
              Find Friends
            </Link>
          </div>

          {friends.length === 0 ? (
            <div className="panel-game p-10 text-center text-[color:var(--card-foreground)]/60">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40 text-[var(--brand-yellow)]" />
              <p className="text-lg font-semibold text-[color:var(--card-foreground)]">No friends yet.</p>
              <p className="text-sm mt-1 mb-4">Start connecting with other players!</p>
              <Link to="/search-users" className="btn-game btn-game-green inline-block">Search Users</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {friends.map((friend, index) => (
                <div key={index} className="panel-violet p-4 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-[var(--brand-blue)] border-4 border-[var(--gold)] flex items-center justify-center overflow-hidden mb-3">
                    {friend.avatar_url ? (
                      <img src={friend.avatar_url} alt={friend.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{friend.name || "Player"}</h3>
                  <div className="bg-white/10 px-2 py-0.5 rounded font-mono text-xs mt-1 mb-2">
                    {friend.game_uid || "No UID"}
                  </div>
                  {friend.city && (
                    <div className="flex items-center gap-1 text-xs text-white/70">
                      <MapPin className="w-3 h-3" /> {friend.city}
                    </div>
                  )}
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
