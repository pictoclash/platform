"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function joinEvent(eventId: string, preferredTeam?: "a" | "b") {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Must be logged in" };
  }

  // Check if user is already a participant
  const { data: existing } = await supabase
    .from("event_participants")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return { error: "Already joined this event" };
  }

  // Get current team counts for balancing
  const { count: teamACount } = await supabase
    .from("event_participants")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("team", "a");

  const { count: teamBCount } = await supabase
    .from("event_participants")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("team", "b");

  // Determine team assignment
  let team: "a" | "b";

  if (preferredTeam) {
    // If user has preference and teams are balanced (within 2), honor it
    const diff = Math.abs((teamACount || 0) - (teamBCount || 0));
    if (diff <= 2) {
      team = preferredTeam;
    } else {
      // Assign to smaller team
      team = (teamACount || 0) <= (teamBCount || 0) ? "a" : "b";
    }
  } else {
    // Random assignment, weighted toward smaller team
    team = (teamACount || 0) <= (teamBCount || 0) ? "a" : "b";
  }

  // Insert participant
  const { error } = await supabase.from("event_participants").insert({
    event_id: eventId,
    user_id: user.id,
    team,
  });

  if (error) return { error: error.message };

  // Update user's profile team
  await supabase.from("profiles").update({ team }).eq("id", user.id);

  revalidatePath("/event");
  revalidatePath("/profile");
  return { success: true, team };
}

export async function leaveEvent(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Must be logged in" };
  }

  // Check if event is active - can't leave active events
  const { data: event } = await supabase
    .from("events")
    .select("is_active")
    .eq("id", eventId)
    .single();

  if (event?.is_active) {
    return { error: "Cannot leave an active event" };
  }

  const { error } = await supabase
    .from("event_participants")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  // Clear user's profile team
  await supabase.from("profiles").update({ team: null }).eq("id", user.id);

  revalidatePath("/event");
  revalidatePath("/profile");
  return { success: true };
}
