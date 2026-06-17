import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveEvent } from "@/lib/cache";
import { getTeamColors } from "@/components/picto";
import { StrikeForm } from "./strike-form";
import type { AvengeStrikeInfo, UnavengedStrike } from "./types";

export default async function NewStrikePage({
  searchParams,
}: {
  searchParams: Promise<{ target?: string; avenge?: string }>;
}) {
  const { target, avenge } = await searchParams;
  const supabase = await createClient();

  // Batch 1: Get auth user and active event in parallel
  const [{ data: { user } }, activeEvent] = await Promise.all([
    supabase.auth.getUser(),
    getActiveEvent(),
  ]);

  if (!user) {
    redirect("/login");
  }

  // Batch 2: Get user profile, avenge strike info, and user's characters in parallel
  const [{ data: profile }, avengeResult, { data: userCharacters }] = await Promise.all([
    supabase.from("profiles").select("team, username").eq("id", user.id).single(),
    avenge
      ? supabase.from("strikes")
          .select("id, creator_id, profiles!strikes_creator_id_profiles_id_fk(username)")
          .eq("id", avenge)
          .single()
      : Promise.resolve({ data: null }),
    supabase.from("characters").select("id").eq("owner_id", user.id),
  ]);

  // Build avenge info if avenging
  let avengeInfo: AvengeStrikeInfo | null = null;
  if (avengeResult.data) {
    const strike = avengeResult.data as unknown as {
      id: string;
      creator_id: string;
      profiles: { username: string } | null;
    };
    avengeInfo = {
      id: strike.id,
      creatorId: strike.creator_id,
      creatorUsername: strike.profiles?.username || "unknown",
    };
  }

  // Batch 3: Get strikes that targeted user's characters (for smart avenge detection)
  const userCharacterIds = userCharacters?.map((c) => c.id) || [];
  let unavengedStrikes: UnavengedStrike[] = [];

  if (userCharacterIds.length > 0) {
    // Get strike IDs targeting user's characters
    const { data: strikeTargets } = await supabase
      .from("strike_targets")
      .select("strike_id")
      .in("character_id", userCharacterIds);

    if (strikeTargets && strikeTargets.length > 0) {
      const targetStrikeIds = strikeTargets.map((t) => t.strike_id);

      // Get those strikes with creator info, excluding self-strikes
      const { data: strikesAgainstMe } = await supabase
        .from("strikes")
        .select("id, creator_id, profiles!strikes_creator_id_profiles_id_fk(username)")
        .in("id", targetStrikeIds)
        .neq("creator_id", user.id);

      if (strikesAgainstMe && strikesAgainstMe.length > 0) {
        // Get strikes that have already been avenged by this user
        const strikeIds = strikesAgainstMe.map((s) => s.id);
        const { data: avengedStrikes } = await supabase
          .from("strikes")
          .select("avenges_strike_id")
          .in("avenges_strike_id", strikeIds)
          .eq("creator_id", user.id);

        const avengedIds = new Set(avengedStrikes?.map((s) => s.avenges_strike_id) || []);

        // Filter to unavenged strikes and dedupe by creator
        const seenCreators = new Set<string>();
        unavengedStrikes = strikesAgainstMe
          .filter((s) => !avengedIds.has(s.id))
          .map((s) => {
            const profiles = s.profiles as unknown as { username: string } | null;
            return {
              id: s.id,
              creatorId: s.creator_id,
              creatorUsername: profiles?.username || "unknown",
            };
          })
          .filter((s) => {
            if (seenCreators.has(s.creatorId)) return false;
            seenCreators.add(s.creatorId);
            return true;
          });
      }
    }
  }

  // Get team color
  const colors = getTeamColors(activeEvent);
  const teamColor = profile?.team === "a"
    ? colors.teamA
    : profile?.team === "b"
      ? colors.teamB
      : colors.teamA;

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <StrikeForm
        preselectedTarget={target}
        avengeInfo={avengeInfo}
        unavengedStrikes={unavengedStrikes}
        teamColor={teamColor}
        teamColors={colors}
        userId={user.id}
        userTeam={(profile?.team as "a" | "b" | null) || null}
        username={profile?.username || "unknown"}
      />
    </div>
  );
}
