import { createClient } from "@/lib/supabase/server";
import { getActiveEvent } from "@/lib/cache";
import { PictoHeader, getTeamColors } from "@/components/picto";

export async function Header() {
  const supabase = await createClient();

  const [{ data: { user } }, activeEvent] = await Promise.all([
    supabase.auth.getUser(),
    getActiveEvent(),
  ]);

  let profile: { id: string; username: string; team: "a" | "b" | null; profile_image_url: string | null } | null = null;
  let notificationCount = 0;
  let isStaff = false;

  if (user) {
    const [{ data }, { count }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, team, profile_image_url, is_admin, is_moderator")
        .eq("id", user.id)
        .single(),
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false),
    ]);
    profile = data;
    notificationCount = count || 0;
    isStaff = data?.is_admin || data?.is_moderator || false;
  }

  const colors = getTeamColors(activeEvent);

  return (
    <PictoHeader
      colors={colors}
      profile={profile}
      activeEvent={activeEvent}
      notificationCount={notificationCount}
      isStaff={isStaff}
    />
  );
}
