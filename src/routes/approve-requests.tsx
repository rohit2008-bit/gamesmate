import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/lib/supabase";
import { db, JoinRequest, FriendRequest, UnifiedRequest } from "@/lib/supabase-db";
import { Trophy, Check, X, ShieldAlert, Users, Calendar, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/approve-requests")({
  component: ApproveRequests,
});

function ApproveRequests() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [requests, setRequests] = useState<UnifiedRequest[]>([]);
  const [fetching, setFetching] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!user) return;
    setFetching(true);
    
    const [joinData, friendData] = await Promise.all([
      db.getJoinRequests(),
      db.getFriendRequests(user.id)
    ]);
    
    const unifiedJoinRequests: UnifiedRequest[] = joinData.map(r => ({
      id: r.id,
      type: r.type,
      title: r.title,
      subtitle: `${r.sport} • ${r.city} (${r.venue}) • ${r.date}`,
      status: r.status,
      requester_id: r.requester_id,
      requester_name: r.requester_name,
      created_at: r.created_at || new Date().toISOString(),
      isIncoming: r.requester_id !== user.id // Mock join requests act like incoming unless user is requester
    }));

    const unifiedFriendRequests: UnifiedRequest[] = friendData.map(r => {
      const isIncoming = r.receiver_id === user.id;
      return {
        id: r.id,
        type: "friend",
        title: isIncoming ? "Friend Request" : "Request Sent",
        subtitle: isIncoming ? "Wants to connect" : "Awaiting response",
        status: r.status === "accepted" ? "approved" : r.status as "pending" | "approved" | "rejected",
        requester_id: isIncoming ? r.sender_id : r.receiver_id,
        requester_name: isIncoming ? r.sender_profile?.name || "Player" : r.receiver_profile?.name || "Player",
        created_at: r.created_at,
        isIncoming: isIncoming
      };
    });

    const combined = [...unifiedJoinRequests, ...unifiedFriendRequests].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setRequests(combined);
    setFetching(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/auth" });
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const handleAction = async (id: string, requesterId: string, type: "match" | "tournament" | "friend", title: string, status: "approved" | "rejected") => {
    setActioningId(id);
    try {
      if (type === "friend") {
        const friendStatus = status === "approved" ? "accepted" : "rejected";
        await db.respondToFriendRequest(id, friendStatus);
        
        const msg = status === "approved" 
          ? `${user.user_metadata?.name || "A user"} accepted your friend request!`
          : `${user.user_metadata?.name || "A user"} rejected your friend request.`;
        
        await db.addNotification(requesterId, "community", msg);
      } else {
        await db.updateJoinRequestStatus(id, status);
        
        const msg = status === "approved" 
          ? `Your request to join ${type === "match" ? "match" : "tournament"} "${title}" was approved!`
          : `Your request to join ${type === "match" ? "match" : "tournament"} "${title}" was rejected.`;
          
        await db.addNotification(requesterId, type, msg);
      }

      toast.success(`Request ${status} successfully!`, {
        style: {
          background: "var(--brand-green)",
          color: "var(--violet-deep)",
          border: "2px solid var(--gold)",
          fontWeight: "bold",
        },
      });

      await fetchRequests();
    } catch (error) {
      toast.error("Failed to update request. Please try again.");
    } finally {
      setActioningId(null);
    }
  };

  if (loading || fetching) {
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

  // Filter requests
  // For incoming (to approve): either it's a mock request (system-seeded, requester_id='00000000...') OR it's a request sent to test.
  // To allow testing, any pending requests can be approved/rejected.
  const incomingRequests = requests.filter((r) => r.status === "pending" && r.isIncoming);
  // Outgoing (your sent ones): requests sent by current user
  const outgoingRequests = requests.filter((r) => !r.isIncoming);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-grow px-4 pt-10 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <span className="badge-game mb-3"><Users className="w-3.5 h-3.5" /> Request Manager</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2">Approve Requests</h1>
            <p className="mt-1 text-white/75">
              Review and manage incoming joining requests for matches and tournaments.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Incoming Requests Column */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-[var(--brand-yellow)]" />
                Incoming Requests ({incomingRequests.length})
              </h2>
              {incomingRequests.length === 0 ? (
                <div className="panel-game p-10 text-center text-[color:var(--card-foreground)]/60">
                  <Check className="w-12 h-12 mx-auto mb-3 opacity-40 text-[var(--brand-green)]" />
                  <p className="text-lg font-semibold text-[color:var(--card-foreground)]">All caught up!</p>
                  <p className="text-sm mt-1">No pending join requests to approve right now.</p>
                </div>
              ) : (
                incomingRequests.map((req) => (
                  <div key={req.id} className="panel-game p-5 flex flex-col justify-between gap-4">
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white border border-[var(--gold)] ${req.type === 'friend' ? 'bg-[var(--brand-yellow)] text-black' : req.type === 'match' ? 'bg-[var(--brand-green)]' : 'bg-[var(--brand-blue)]'} mr-2`}>
                          {req.type.toUpperCase()}
                        </span>
                        <h3 className="text-xl font-bold mt-2 text-[color:var(--card-foreground)]">{req.type === "friend" ? `Friend Request from ${req.requester_name}` : req.title}</h3>
                        <p className="text-sm text-[color:var(--card-foreground)]/70 mt-1">
                          {req.type === "friend" ? `User: ${req.requester_name}` : `Requested by: ${req.requester_name}`}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-2.5 text-xs text-[color:var(--card-foreground)]/80 border-t border-white/10 pt-3">
                      <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {req.subtitle}</div>
                    </div>

                    <div className="relative z-10 flex gap-2 border-t border-white/10 pt-3">
                      <button
                        onClick={() => handleAction(req.id, req.requester_id, req.type, req.title, "approved")}
                        disabled={actioningId !== null}
                        className="btn-game btn-game-green flex-1 flex items-center justify-center gap-1.5 !py-2 !text-sm"
                      >
                        {actioningId === req.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(req.id, req.requester_id, req.type, req.title, "rejected")}
                        disabled={actioningId !== null}
                        className="btn-game btn-game-violet flex-1 flex items-center justify-center gap-1.5 !py-2 !text-sm"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Outgoing/My Requests Column */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-[var(--brand-blue)]" />
                Sent Requests ({outgoingRequests.length})
              </h2>
              {outgoingRequests.length === 0 ? (
                <div className="panel-game p-10 text-center text-[color:var(--card-foreground)]/60">
                  <p className="text-lg font-semibold text-[color:var(--card-foreground)]">No requests sent yet.</p>
                  <p className="text-sm mt-1">Go to Discover page and request to join matches/tournaments.</p>
                </div>
              ) : (
                outgoingRequests.map((req) => (
                  <div key={req.id} className="panel-game p-5 flex flex-col gap-3">
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white border border-[var(--gold)] ${req.type === 'friend' ? 'bg-[var(--brand-yellow)] text-black' : req.type === 'match' ? 'bg-[var(--brand-green)]' : 'bg-[var(--brand-blue)]'} mr-2`}>
                          {req.type.toUpperCase()}
                        </span>
                        <h3 className="text-lg font-bold mt-2 text-[color:var(--card-foreground)]">{req.type === "friend" ? `Friend Request to ${req.title}` : req.title}</h3>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                          req.status === "pending"
                            ? "bg-[var(--brand-yellow)]/20 text-[var(--brand-yellow)] border-[var(--brand-yellow)]"
                            : req.status === "approved"
                            ? "bg-[var(--brand-green)]/20 text-[var(--brand-green)] border-[var(--brand-green)]"
                            : "bg-[var(--brand-red)]/20 text-[var(--brand-red)] border-[var(--brand-red)]"
                        }`}
                      >
                        {req.status === "pending"
                          ? "Pending"
                          : req.status === "approved"
                          ? "Approved"
                          : "Rejected"}
                      </span>
                    </div>

                    <div className="relative z-10 flex items-center gap-2 text-xs text-[color:var(--card-foreground)]/80 border-t border-white/10 pt-3">
                      <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {req.subtitle}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
