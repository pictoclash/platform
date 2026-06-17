import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveEvent } from "@/lib/cache";
import { getTeamColors } from "@/components/picto";
import { UserContent } from "./user-content";
import type { SocialLink } from "@/lib/schema";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  pronouns: string | null;
  bio: string | null;
  profile_image_url: string | null;
  social_links: SocialLink[];
  team: "a" | "b" | null;
  guild:
    | "pixelweavers"
    | "traditionalists"
    | "wordwrights"
    | "hybridisers"
    | "sculptors"
    | null;
  is_admin: boolean;
  is_moderator: boolean;
  created_at: string;
};

type Character = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  reference_image_url: string;
};

export default async function PublicUserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  // Batch 1: Get auth, profile, and cached event in parallel
  const [{ data: { user: currentUser } }, { data: profile }, activeEvent] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("profiles")
      .select("id, username, display_name, pronouns, bio, profile_image_url, social_links, team, guild, is_admin, is_moderator, created_at")
      .eq("username", username)
      .single<Profile>(),
    getActiveEvent(),
  ]);

  if (!profile) {
    notFound();
  }

  // Redirect to own profile if viewing self
  if (currentUser?.id === profile.id) {
    redirect("/profile");
  }

  // Batch 2: Get characters and strikes in parallel
  const [{ data: characters }, { data: strikes }, { data: strikeData }] = await Promise.all([
    supabase
      .from("characters")
      .select("id, name, slug, description, reference_image_url")
      .eq("owner_id", profile.id)
      .eq("is_inactive", false)
      .order("display_order", { ascending: true }),
    supabase
      .from("strikes")
      .select("final_score")
      .eq("creator_id", profile.id),
    supabase
      .from("strikes")
      .select(`
        id,
        strike_type,
        image_url,
        final_score,
        created_at,
        strike_targets (
          characters (
            id,
            name,
            reference_image_url,
            profiles:owner_id (
              username
            )
          )
        )
      `)
      .eq("creator_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  // Calculate strike stats
  const strikeStats = {
    totalPoints: strikes?.reduce((sum, s) => sum + (s.final_score || 0), 0) || 0,
    strikeCount: strikes?.length || 0,
    avgScore:
      strikes && strikes.length > 0
        ? Math.round(
            strikes.reduce((sum, s) => sum + (s.final_score || 0), 0) / strikes.length
          )
        : 0,
  };

  // Transform strikes data
  const sentStrikes = (strikeData || []).map((strike) => ({
    id: strike.id,
    strike_type: strike.strike_type as "visual" | "writing" | "sculpture",
    image_url: strike.image_url,
    final_score: strike.final_score,
    created_at: strike.created_at,
    characters: (strike.strike_targets || []).map((target) => {
      const char = target.characters as unknown as {
        id: string;
        name: string;
        reference_image_url: string;
        profiles: { username: string } | { username: string }[];
      };
      const profiles = char.profiles;
      const ownerUsername = Array.isArray(profiles)
        ? profiles[0]?.username
        : profiles?.username;
      return {
        id: char.id,
        name: char.name,
        reference_image_url: char.reference_image_url,
        owner_username: ownerUsername || "unknown",
      };
    }),
  }));

  const getTeamDisplay = () => {
    if (!profile.team) return { name: "No Team", color: undefined };
    if (!activeEvent)
      return { name: `Team ${profile.team.toUpperCase()}`, color: undefined };
    return profile.team === "a"
      ? { name: activeEvent.team_a_name, color: activeEvent.team_a_color }
      : { name: activeEvent.team_b_name, color: activeEvent.team_b_color };
  };

  const colors = getTeamColors(activeEvent);

  return (
    <UserContent
      profile={{
        ...profile,
        social_links: (profile.social_links as SocialLink[]) || [],
      }}
      characters={(characters as Character[]) || []}
      strikeStats={strikeStats}
      teamDisplay={getTeamDisplay()}
      colors={colors}
      sentStrikes={sentStrikes}
      isOwnProfile={false}
    />
  );
}
