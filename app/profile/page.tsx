import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveEvent } from "@/lib/cache";
import { getTeamColors } from "@/components/picto";
import { ProfileContent } from "./profile-content";
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
  pictocash: number;
  is_active: boolean;
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
  is_inactive: boolean;
  display_order: number;
};

export default async function ProfilePage() {
  const supabase = await createClient();

  // Batch 1: Get auth user and cached event in parallel
  const [{ data: { user } }, activeEvent] = await Promise.all([
    supabase.auth.getUser(),
    getActiveEvent(),
  ]);

  if (!user) {
    redirect("/login");
  }

  // Batch 2: Fetch all user-dependent data in parallel
  const [{ data: profile }, { data: characters }, { data: strikes }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
      supabase
        .from("characters")
        .select("id, name, slug, description, reference_image_url, is_inactive, display_order")
        .eq("owner_id", user.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("strikes")
        .select("final_score")
        .eq("creator_id", user.id),
    ]);

  if (!profile) {
    redirect("/login");
  }

  // Calculate strike stats
  const strikeStats = {
    totalPoints: strikes?.reduce((sum, s) => sum + (s.final_score || 0), 0) || 0,
    strikeCount: strikes?.length || 0,
    avgScore: strikes && strikes.length > 0
      ? Math.round(strikes.reduce((sum, s) => sum + (s.final_score || 0), 0) / strikes.length)
      : 0,
  };

  const getTeamDisplay = () => {
    if (!profile.team) return { name: "No Team", color: undefined };
    if (!activeEvent) return { name: `Team ${profile.team.toUpperCase()}`, color: undefined };
    return profile.team === "a"
      ? { name: activeEvent.team_a_name, color: activeEvent.team_a_color }
      : { name: activeEvent.team_b_name, color: activeEvent.team_b_color };
  };

  const colors = getTeamColors(activeEvent);

  return (
    <ProfileContent
      profile={profile}
      characters={(characters as Character[]) || []}
      strikeStats={strikeStats}
      teamDisplay={getTeamDisplay()}
      colors={colors}
    />
  );
}
