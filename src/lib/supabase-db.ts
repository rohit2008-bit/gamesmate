import { supabase } from "./supabase";

export interface JoinRequest {
  id: string;
  type: "match" | "tournament";
  title: string;
  sport: string;
  city: string;
  venue: string;
  color: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  requester_id: string;
  requester_name: string;
  created_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  type: "match" | "tournament" | "community";
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  sender_profile?: any;
  receiver_profile?: any;
}

export interface UnifiedRequest {
  id: string;
  type: "match" | "tournament" | "friend";
  title: string;
  subtitle: string;
  status: "pending" | "approved" | "rejected";
  requester_id: string;
  requester_name: string;
  created_at: string;
  isIncoming: boolean;
}

export const db = {
  // Notifications
  async getNotifications(userId: string): Promise<DbNotification[]> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Delete notifications older than 24 hours for the current user
    const { error: deleteError } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId)
      .lt("created_at", cutoff);

    if (deleteError) {
      console.error("Error deleting old notifications from database:", deleteError);
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    // If notifications are empty, seed some default/mock ones for better UX, but only once
    const isBrowser = typeof window !== "undefined";
    const seedKey = `seeded_notifs_${userId}`;
    const alreadySeeded = isBrowser ? window.localStorage.getItem(seedKey) : null;

    if ((!data || data.length === 0) && !alreadySeeded) {
      if (isBrowser) {
        window.localStorage.setItem(seedKey, "true");
      }
      const initialSeed: Omit<DbNotification, "id" | "created_at">[] = [
        {
          user_id: userId,
          type: "community",
          message: "Welcome to GamesMate! Setup your player profile and start ranking up.",
          is_read: false,
        },
        {
          user_id: userId,
          type: "tournament",
          message: "Registration for the Bangalore Football Championship 2026 is now open!",
          is_read: false,
        },
        {
          user_id: userId,
          type: "match",
          message: "Create a match or head to the Discover page to join games happening around you.",
          is_read: false,
        },
      ];

      const { data: inserted, error: seedError } = await supabase
        .from("notifications")
        .insert(initialSeed)
        .select();

      if (!seedError && inserted) {
        return inserted as DbNotification[];
      }
    }

    return data as DbNotification[];
  },

  async addNotification(userId: string, type: "match" | "tournament" | "community", message: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .insert([{ user_id: userId, type, message, is_read: false }]);

    if (error) {
      console.error("Error adding notification:", error);
    }
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Error marking notifications as read:", error);
    }
  },

  // Join Requests
  async getJoinRequests(): Promise<JoinRequest[]> {
    const { data, error } = await supabase
      .from("join_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching join requests:", error);
      return [];
    }

    // Seed some mock requests on first check if there are absolutely none, to populate the "Approve Requests" page
    if (!data || data.length === 0) {
      // Find current user session to get ID
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const initialRequests = [
          {
            type: "match" as const,
            title: "Sunday Smash Cup",
            sport: "Cricket",
            city: "Mumbai",
            venue: "Outdoor",
            color: "bg-[var(--brand-green)]",
            date: "Sun, 22 Jun · 4:00 PM",
            status: "pending" as const,
            requester_id: "00000000-0000-0000-0000-000000000000", // system mock
            requester_name: "Rohan Sharma",
          },
          {
            type: "tournament" as const,
            title: "Monsoon League 2026",
            sport: "Football",
            city: "Bengaluru",
            venue: "Outdoor",
            color: "bg-[var(--brand-blue)]",
            date: "Reg. ends 28 Jun",
            status: "pending" as const,
            requester_id: "00000000-0000-0000-0000-000000000000",
            requester_name: "FC Thunder (Team)",
          },
        ];

        const { data: inserted, error: seedError } = await supabase
          .from("join_requests")
          .insert(initialRequests)
          .select();

        if (!seedError && inserted) {
          return inserted as JoinRequest[];
        }
      }
    }

    return data as JoinRequest[];
  },

  async createJoinRequest(
    userId: string,
    userName: string,
    type: "match" | "tournament",
    title: string,
    sport: string,
    city: string,
    venue: string,
    color: string,
    date: string
  ): Promise<void> {
    const { error } = await supabase.from("join_requests").insert([
      {
        type,
        title,
        sport,
        city,
        venue,
        color,
        date,
        requester_id: userId,
        requester_name: userName,
        status: "pending",
      },
    ]);

    if (error) {
      console.error("Error creating join request:", error);
    }
  },

  async updateJoinRequestStatus(id: string, status: "approved" | "rejected"): Promise<void> {
    const { error } = await supabase
      .from("join_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Error updating join request status:", error);
    }
  },

  // Friends System
  async searchUsers(query: string, currentUserId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", currentUserId)
      .or(`name.ilike.%${query}%,game_uid.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error("Error searching users:", error);
      return [];
    }
    return data || [];
  },

  async sendFriendRequest(senderId: string, receiverId: string): Promise<void> {
    const { error } = await supabase.from("friend_requests").insert([
      {
        sender_id: senderId,
        receiver_id: receiverId,
        status: "pending",
      },
    ]);

    if (error) {
      console.error("Error sending friend request:", error);
    }
  },

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    // Fetch requests where user is either sender or receiver
    const { data, error } = await supabase
      .from("friend_requests")
      .select(`
        *,
        sender:sender_id(*),
        receiver:receiver_id(*)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching friend requests:", error);
      return [];
    }
    
    // Map the joined data
    return (data || []).map(req => ({
      ...req,
      sender_profile: req.sender,
      receiver_profile: req.receiver
    }));
  },

  async respondToFriendRequest(requestId: string, status: "accepted" | "rejected"): Promise<void> {
    const { error } = await supabase
      .from("friend_requests")
      .update({ status })
      .eq("id", requestId);

    if (error) {
      console.error("Error responding to friend request:", error);
    }
  }
};
