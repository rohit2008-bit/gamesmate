import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/lib/supabase";
import { db, JoinRequest } from "@/lib/supabase-db";
import { Trophy, Check, X, ShieldAlert, Users, Calendar, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/approve-requests")({
  component: ApproveRequests,
});

function ApproveRequests() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [fetching, setFetching] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setFetching(true);
    const data = await db.getJoinRequests();
    setRequests(data);
    setFetching(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/auth" });
      } else {
        setUser(session.user);
        fetchRequests();
      }
      setLoading(false);
    });
  }, []);

  const handleAction = async (id: string, requesterId: string, type: "match" | "tournament", title: string, status: "approved" | "rejected") => {
    setActioningId(id);
    try {
      await db.updateJoinRequestStatus(id, status);
      
      // Notify the requester
      const msg = status === "approved" 
        ? `Your request to join ${type === "match" ? "match" : "tournament"} "${title}" was approved!`
        : `Your request to join ${type === "match" ? "match" : "tournament"} "${title}" was rejected.`;
        
      await db.addNotification(requesterId, type, msg);

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
  const incomingRequests = requests.filter((r) => r.status === "pending");
  // Outgoing (your sent ones): requests sent by current user
  const outgoingRequests = requests.filter((r) => r.requester_id === user?.id);

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
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white border border-[var(--gold)] ${req.color} mr-2`}>
                          {req.sport}
                        </span>
                        <span className="badge-game !py-0.5 !px-1.5 !text-[0.65rem]">
                          {req.type === "match" ? "Match" : "Tournament"}
                        </span>
                        <h3 className="text-xl font-bold mt-2 text-[color:var(--card-foreground)]">{req.title}</h3>
                        <p className="text-sm text-[color:var(--card-foreground)]/70 mt-1">
                          Requested by: <span className="font-semibold text-white">{req.requester_name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-2.5 text-xs text-[color:var(--card-foreground)]/80 border-t border-white/10 pt-3">
                      <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {req.city} ({req.venue})</div>
                      <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {req.date}</div>
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
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white border border-[var(--gold)] ${req.color} mr-2`}>
                          {req.sport}
                        </span>
                        <span className="badge-game !py-0.5 !px-1.5 !text-[0.65rem]">
                          {req.type === "match" ? "Match" : "Tournament"}
                        </span>
                        <h3 className="text-lg font-bold mt-2 text-[color:var(--card-foreground)]">{req.title}</h3>
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
                      <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {req.city} ({req.venue})</div>
                      <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {req.date}</div>
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
