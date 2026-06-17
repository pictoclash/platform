import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveEvent } from "@/lib/cache";
import { getTeamColors } from "@/components/picto";
import { CharacterContent } from "./character-content";

import type { CharacterPermissions } from "@/lib/schema";

type Character = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  reference_image_url: string;
  description: string | null;
  design_notes: string | null;
  content_tags: string[] | null;
  permission_tags: string[] | null;
  permissions: CharacterPermissions | null;
  is_inactive: boolean;
  created_at: string;
};

type CharacterImage = {
  id: string;
  image_url: string;
  display_order: number;
};

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  team: "a" | "b" | null;
};

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const supabase = await createClient();

  // Batch 1: Fetch user, owner profile, and active event in parallel
  const [{ data: { user } }, { data: owner }, activeEvent] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("id, username, display_name, team").eq("username", username).single<Profile>(),
    getActiveEvent(),
  ]);

  if (!owner) {
    notFound();
  }

  // Batch 2: Fetch character by owner_id and slug
  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("owner_id", owner.id)
    .eq("slug", slug)
    .single<Character>();

  if (!character) {
    notFound();
  }

  // Batch 3: Fetch strike targets and additional images in parallel
  const [{ data: strikeTargets }, { data: additionalImages }] = await Promise.all([
    supabase.from("strike_targets").select("strike_id").eq("character_id", character.id),
    supabase.from("character_images").select("id, image_url, display_order").eq("character_id", character.id).order("display_order", { ascending: true }),
  ]);

  const isOwner = user?.id === character.owner_id;
  const strikeIds = strikeTargets?.map((t) => t.strike_id) || [];

  let strikes: Array<{
    id: string;
    strike_type: string;
    image_url: string | null;
    final_score: number;
    created_at: string;
    creator_username: string | null;
  }> = [];

  if (strikeIds.length > 0) {
    const { data: strikeData } = await supabase
      .from("strikes")
      .select("id, strike_type, image_url, final_score, created_at, creator_id")
      .in("id", strikeIds)
      .order("created_at", { ascending: false });

    if (strikeData) {
      const creatorIds = [...new Set(strikeData.map((s) => s.creator_id))];
      const { data: creators } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", creatorIds);

      const creatorMap = new Map(creators?.map((c) => [c.id, c.username]) || []);

      strikes = strikeData.map((s) => ({
        id: s.id,
        strike_type: s.strike_type,
        image_url: s.image_url,
        final_score: s.final_score,
        created_at: s.created_at,
        creator_username: creatorMap.get(s.creator_id) || null,
      }));
    }
  }

  // Get team color based on owner's team
  const colors = getTeamColors(activeEvent);
  const teamColor = owner?.team === "a"
    ? colors.teamA
    : owner?.team === "b"
      ? colors.teamB
      : colors.teamA;

  return (
    <CharacterContent
      character={character}
      owner={owner}
      additionalImages={additionalImages || []}
      strikes={strikes}
      isOwner={isOwner}
      isLoggedIn={!!user}
      teamColor={teamColor}
    />
  );
}
