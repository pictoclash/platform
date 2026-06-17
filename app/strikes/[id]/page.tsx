import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveEvent } from "@/lib/cache";
import { getTeamColors } from "@/components/picto";
import { StrikeGalleryView, type StrikeGalleryCharacter, type StrikeGalleryScoreDetail } from "@/components/strike-gallery-view";
import { ReportButton } from "@/components/report-button";

type Strike = {
  id: string;
  creator_id: string;
  strike_type: "visual" | "writing" | "sculpture";
  image_url: string | null;
  markdown_content: string | null;
  message: string | null;
  content_warning: string | null;
  base_score: number;
  bonus_multiplier: number;
  final_score: number;
  created_at: string;
  avenges_strike_id: string | null;
  scoring_details: StrikeGalleryScoreDetail[] | null;
};

type StrikeTarget = {
  character_id: string;
  characters: {
    id: string;
    name: string;
    slug: string;
    owner_id: string;
    profiles: { username: string; id: string; team: string | null } | null;
  } | null;
};

export default async function StrikePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Batch 1: Get auth, strike, and active event in parallel
  const [{ data: { user } }, { data: strike }, activeEvent] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("strikes").select("*").eq("id", id).single<Strike>(),
    getActiveEvent(),
  ]);

  if (!strike) {
    notFound();
  }

  // Get team colors
  const colors = getTeamColors(activeEvent);

  // Batch 2: Get creator, targets, and avenged strike info in parallel
  const [{ data: creator }, { data: targets }, avengedStrikeResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, display_name, team")
      .eq("id", strike.creator_id)
      .single(),
    supabase
      .from("strike_targets")
      .select("character_id, characters(id, name, slug, owner_id, profiles(username, id, team))")
      .eq("strike_id", id),
    strike.avenges_strike_id
      ? supabase
          .from("strikes")
          .select("id, creator_id, profiles!strikes_creator_id_profiles_id_fk(username)")
          .eq("id", strike.avenges_strike_id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  // Get avenged strike creator info
  const avengedStrike = avengedStrikeResult.data as {
    id: string;
    creator_id: string;
    profiles: { username: string } | null;
  } | null;

  // Check if current user owns any of the targeted characters (for avenge button)
  const canAvenge =
    user &&
    user.id !== strike.creator_id &&
    (targets as StrikeTarget[] | null)?.some(
      (t) => t.characters?.profiles?.id === user.id
    );

  // Get creator's team color
  const creatorTeamColor = creator?.team === "a"
    ? colors.teamA
    : creator?.team === "b"
      ? colors.teamB
      : colors.teamA;

  // Build character list with team colors
  const characters: StrikeGalleryCharacter[] = (targets as StrikeTarget[] | null)?.map((t) => ({
    name: t.characters?.name || "Unknown",
    slug: t.characters?.slug,
    ownerUsername: t.characters?.profiles?.username || "unknown",
    ownerTeamColor: t.characters?.profiles?.team === "a"
      ? colors.teamA
      : t.characters?.profiles?.team === "b"
        ? colors.teamB
        : undefined,
  })) || [];

  // Check for friendly fire (creator struck mostly allies)
  const creatorTeam = creator?.team;
  const allyCount = characters.filter(
    (c) => c.ownerTeamColor === creatorTeamColor
  ).length;
  const isFriendlyFire = creatorTeam && allyCount > characters.length / 2;

  // Check if this is a revenge strike (avenging and targeting the original striker)
  const avengesUsername = avengedStrike?.profiles?.username;
  const isRevenge = avengesUsername && characters.some(
    (c) => c.ownerUsername.toLowerCase() === avengesUsername.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-4 sm:py-8 px-3 sm:px-4">
      <StrikeGalleryView
        strikeType={strike.strike_type}
        imageUrl={strike.image_url}
        markdownContent={strike.markdown_content}
        contentWarning={strike.content_warning}
        message={strike.message}
        baseScore={strike.base_score}
        bonusMultiplier={strike.bonus_multiplier}
        finalScore={strike.final_score}
        createdAt={strike.created_at}
        creatorUsername={creator?.username || "unknown"}
        teamColor={creatorTeamColor}
        characters={characters}
        scoreDetails={strike.scoring_details || []}
        isPolished={strike.bonus_multiplier >= 120}
        isFriendlyFire={!!isFriendlyFire}
        isRevenge={!!isRevenge}
        avengesStrikeId={strike.avenges_strike_id}
        avengesUsername={avengesUsername}
        mode="view"
        avengeHref={`/strikes/new?avenge=${strike.id}`}
        canAvenge={!!canAvenge}
        strikeId={strike.id}
        creatorDisplayName={creator?.display_name || creator?.username}
      />

      {/* Report Button - positioned below gallery */}
      {user && user.id !== strike.creator_id && (
        <div className="max-w-4xl mx-auto mt-4 flex justify-end">
          <ReportButton
            target={{ type: "strike", id: strike.id }}
            targetName={`Strike by ${creator?.display_name || creator?.username}`}
          />
        </div>
      )}
    </div>
  );
}
