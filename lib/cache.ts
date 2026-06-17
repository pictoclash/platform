/**
 * Caching layer for Supabase queries
 *
 * Uses Next.js unstable_cache with tags for on-demand revalidation.
 * Call revalidate functions in server actions when data changes.
 */

import { unstable_cache, revalidateTag } from "next/cache";
import { createAnonClient } from "@/lib/supabase/server";

// =============================================================================
// CACHE TAGS
// =============================================================================

export const CACHE_TAGS = {
  activeEvent: "active-event",
  checkpoints: (eventId: string) => `checkpoints-${eventId}`,
  inspirationCharacters: "inspiration-characters",
  userProfile: (userId: string) => `user-profile-${userId}`,
  userStrikes: (userId: string) => `user-strikes-${userId}`,
} as const;

// =============================================================================
// REVALIDATION HELPERS
// =============================================================================

export function revalidateActiveEvent() {
  revalidateTag(CACHE_TAGS.activeEvent, { expire: 0 });
}

export function revalidateCheckpoints(eventId: string) {
  revalidateTag(CACHE_TAGS.checkpoints(eventId), { expire: 0 });
}

export function revalidateInspirationCharacters() {
  revalidateTag(CACHE_TAGS.inspirationCharacters, { expire: 0 });
}

export function revalidateUserProfile(userId: string) {
  revalidateTag(CACHE_TAGS.userProfile(userId), { expire: 0 });
}

export function revalidateUserStrikes(userId: string) {
  revalidateTag(CACHE_TAGS.userStrikes(userId), { expire: 0 });
}

// =============================================================================
// CACHED QUERIES
// =============================================================================

/**
 * Get active event - cached for 5 minutes, or until revalidated
 */
export const getActiveEvent = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("events")
      .select(
        "id, name, description, team_a_name, team_a_color, team_b_name, team_b_color, starts_at, ends_at"
      )
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching active event:", error);
    }
    return data;
  },
  ["active-event"],
  {
    tags: [CACHE_TAGS.activeEvent],
    revalidate: 300, // 5 minutes fallback
  }
);

/**
 * Get checkpoints for an event - cached for 2 minutes, or until revalidated
 */
export const getCheckpoints = (eventId: string) =>
  unstable_cache(
    async () => {
      const supabase = createAnonClient();
      const { data, error } = await supabase
        .from("checkpoints")
        .select(
          "id, name, is_revealed, winning_team, team_a_score, team_b_score, scheduled_at, triggered_at"
        )
        .eq("event_id", eventId)
        .order("scheduled_at", { ascending: true });

      if (error) {
        console.error("Error fetching checkpoints:", error);
        return [];
      }
      return data || [];
    },
    [`checkpoints-${eventId}`],
    {
      tags: [CACHE_TAGS.checkpoints(eventId)],
      revalidate: 120, // 2 minutes fallback
    }
  )();

/**
 * Get inspiration characters (recent characters from other users)
 * Cached for 10 minutes
 */
export const getInspirationCharacters = (excludeUserId: string) =>
  unstable_cache(
    async () => {
      const supabase = createAnonClient();

      const { data: rawCharacters } = await supabase
        .from("characters")
        .select("id, name, slug, reference_image_url, owner_id")
        .eq("is_inactive", false)
        .neq("owner_id", excludeUserId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!rawCharacters || rawCharacters.length === 0) {
        return [];
      }

      // Get owner info
      const ownerIds = [...new Set(rawCharacters.map((c: { owner_id: string }) => c.owner_id))];
      const { data: owners } = await supabase
        .from("profiles")
        .select("id, username, team")
        .in("id", ownerIds);

      const ownerMap = new Map<string, { username: string; team: "a" | "b" | null }>(
        owners?.map((o: { id: string; username: string; team: "a" | "b" | null }) => [
          o.id,
          { username: o.username, team: o.team },
        ]) || []
      );

      return rawCharacters.map((c: { id: string; name: string; slug: string; reference_image_url: string; owner_id: string }) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        reference_image_url: c.reference_image_url,
        owner_username: ownerMap.get(c.owner_id)?.username || null,
        owner_team: ownerMap.get(c.owner_id)?.team || null,
      }));
    },
    [`inspiration-characters-${excludeUserId}`],
    {
      tags: [CACHE_TAGS.inspirationCharacters],
      revalidate: 600, // 10 minutes fallback
    }
  )();

/**
 * Get user's strike stats - cached for 1 minute per user
 */
export const getUserStrikeStats = (userId: string) =>
  unstable_cache(
    async () => {
      const supabase = createAnonClient();
      const { data: strikes } = await supabase
        .from("strikes")
        .select("final_score")
        .eq("creator_id", userId);

      if (!strikes || strikes.length === 0) {
        return { pointsScored: 0, strikesSubmitted: 0, avgScore: 0 };
      }

      const totalPoints = strikes.reduce((sum: number, s: { final_score: number | null }) => sum + (s.final_score || 0), 0);
      return {
        pointsScored: totalPoints,
        strikesSubmitted: strikes.length,
        avgScore: Math.round(totalPoints / strikes.length),
      };
    },
    [`user-strikes-${userId}`],
    {
      tags: [CACHE_TAGS.userStrikes(userId)],
      revalidate: 60, // 1 minute fallback
    }
  )();

/**
 * Get user profile - cached for 30 seconds per user
 */
export const getUserProfile = (userId: string) =>
  unstable_cache(
    async () => {
      const supabase = createAnonClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, username, team, pictocash")
        .eq("id", userId)
        .single();

      return data;
    },
    [`user-profile-${userId}`],
    {
      tags: [CACHE_TAGS.userProfile(userId)],
      revalidate: 30, // 30 seconds fallback
    }
  )();
