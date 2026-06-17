"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidateActiveEvent, revalidateCheckpoints } from "@/lib/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { supabase: null, isAdmin: false };
  }

  return { supabase, isAdmin: true };
}

export type EventInput = {
  name: string;
  description?: string;
  team_a_name: string;
  team_a_color: string;
  team_b_name: string;
  team_b_color: string;
  starts_at: string;
  ends_at: string;
};

export async function createEvent(data: EventInput) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      name: data.name,
      description: data.description || null,
      team_a_name: data.team_a_name,
      team_a_color: data.team_a_color,
      team_b_name: data.team_b_name,
      team_b_color: data.team_b_color,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      is_active: false,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/events");
  return { success: true, eventId: event.id };
}

export async function updateEvent(eventId: string, data: Partial<EventInput>) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  const { error } = await supabase
    .from("events")
    .update(data)
    .eq("id", eventId);

  if (error) return { error: error.message };

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) return { error: error.message };

  revalidatePath("/admin/events");
  return { success: true };
}

export async function activateEvent(eventId: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  // Deactivate all other events first
  await supabase.from("events").update({ is_active: false }).neq("id", eventId);

  // Activate this event
  const { error } = await supabase
    .from("events")
    .update({ is_active: true })
    .eq("id", eventId);

  if (error) return { error: error.message };

  revalidateActiveEvent();
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function deactivateEvent(eventId: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  const { error } = await supabase
    .from("events")
    .update({ is_active: false })
    .eq("id", eventId);

  if (error) return { error: error.message };

  revalidateActiveEvent();
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function assignUserToTeam(
  eventId: string,
  userId: string,
  team: "a" | "b"
) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  const { error } = await supabase.from("event_participants").upsert(
    {
      event_id: eventId,
      user_id: userId,
      team,
    },
    { onConflict: "event_id,user_id" }
  );

  if (error) return { error: error.message };

  // Also update the user's profile team for display purposes
  await supabase.from("profiles").update({ team }).eq("id", userId);

  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function removeUserFromEvent(eventId: string, userId: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  const { error } = await supabase
    .from("event_participants")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  // Clear the user's profile team
  await supabase.from("profiles").update({ team: null }).eq("id", userId);

  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function randomizeTeams(eventId: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  // Get all participants
  const { data: participants } = await supabase
    .from("event_participants")
    .select("id, user_id")
    .eq("event_id", eventId);

  if (!participants || participants.length === 0) {
    return { error: "No participants to randomize" };
  }

  // Shuffle and assign teams evenly
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  const half = Math.ceil(shuffled.length / 2);

  for (let i = 0; i < shuffled.length; i++) {
    const team = i < half ? "a" : "b";
    await supabase
      .from("event_participants")
      .update({ team })
      .eq("id", shuffled[i].id);

    // Also update profile
    await supabase
      .from("profiles")
      .update({ team })
      .eq("id", shuffled[i].user_id);
  }

  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function addAllUsersToEvent(eventId: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  // Get all active users not already in the event
  const { data: existingParticipants } = await supabase
    .from("event_participants")
    .select("user_id")
    .eq("event_id", eventId);

  const existingIds = existingParticipants?.map((p) => p.user_id) || [];

  const { data: users } = await supabase
    .from("profiles")
    .select("id")
    .eq("is_active", true);

  if (!users) return { error: "No users found" };

  const newUsers = users.filter((u) => !existingIds.includes(u.id));

  if (newUsers.length === 0) {
    return { error: "All users are already participants" };
  }

  // Add users with alternating teams for balance
  const inserts = newUsers.map((u, i) => ({
    event_id: eventId,
    user_id: u.id,
    team: i % 2 === 0 ? "a" : "b",
  }));

  const { error } = await supabase.from("event_participants").insert(inserts);

  if (error) return { error: error.message };

  // Update profiles
  for (const insert of inserts) {
    await supabase
      .from("profiles")
      .update({ team: insert.team })
      .eq("id", insert.user_id);
  }

  revalidatePath(`/admin/events/${eventId}`);
  return { success: true, count: newUsers.length };
}

// ============ CHECKPOINT ACTIONS ============

export type CheckpointInput = {
  name?: string;
  scheduled_at: string;
  is_auto: boolean;
};

export async function createCheckpoint(eventId: string, data: CheckpointInput) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  const { error } = await supabase.from("checkpoints").insert({
    event_id: eventId,
    name: data.name || null,
    scheduled_at: data.scheduled_at,
    is_auto: data.is_auto,
  });

  if (error) return { error: error.message };

  revalidateCheckpoints(eventId);
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function updateCheckpoint(
  checkpointId: string,
  eventId: string,
  data: Partial<CheckpointInput>
) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  const { error } = await supabase
    .from("checkpoints")
    .update(data)
    .eq("id", checkpointId);

  if (error) return { error: error.message };

  revalidateCheckpoints(eventId);
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function deleteCheckpoint(checkpointId: string, eventId: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  const { error } = await supabase
    .from("checkpoints")
    .delete()
    .eq("id", checkpointId);

  if (error) return { error: error.message };

  revalidateCheckpoints(eventId);
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function triggerCheckpoint(checkpointId: string, eventId: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  // Get the checkpoint to check if already triggered
  const { data: checkpoint } = await supabase
    .from("checkpoints")
    .select("*")
    .eq("id", checkpointId)
    .single();

  if (!checkpoint) return { error: "Checkpoint not found" };
  if (checkpoint.triggered_at) return { error: "Checkpoint already triggered" };

  // Get ALL unclaimed strikes - simpler and more robust than time-based filtering
  // Any strike without a checkpoint_id belongs to the next triggered checkpoint
  const { data: strikes } = await supabase
    .from("strikes")
    .select("id, final_score, creator_id")
    .is("checkpoint_id", null);

  // Get creator teams from event_participants
  const creatorIds = [...new Set(strikes?.map((s) => s.creator_id) || [])];
  const { data: participants } = creatorIds.length > 0
    ? await supabase
        .from("event_participants")
        .select("user_id, team")
        .eq("event_id", eventId)
        .in("user_id", creatorIds)
    : { data: [] };

  const teamMap = new Map(participants?.map((p) => [p.user_id, p.team]) || []);

  let teamAScore = 0;
  let teamBScore = 0;

  for (const strike of strikes || []) {
    const team = teamMap.get(strike.creator_id);
    if (team === "a") teamAScore += strike.final_score;
    else if (team === "b") teamBScore += strike.final_score;
  }

  // Determine winner
  const winningTeam = teamAScore > teamBScore ? "a" : teamBScore > teamAScore ? "b" : null;
  const totalScore = teamAScore + teamBScore;
  const marginPercentage = totalScore > 0
    ? Math.round((Math.abs(teamAScore - teamBScore) / totalScore) * 100)
    : 0;

  // Update checkpoint with results
  const { error: updateError } = await supabase
    .from("checkpoints")
    .update({
      triggered_at: new Date().toISOString(),
      team_a_score: teamAScore,
      team_b_score: teamBScore,
      winning_team: winningTeam,
      margin_percentage: marginPercentage,
    })
    .eq("id", checkpointId);

  if (updateError) return { error: updateError.message };

  // Assign strikes to this checkpoint
  if (strikes && strikes.length > 0) {
    for (const strike of strikes) {
      await supabase
        .from("strikes")
        .update({ checkpoint_id: checkpointId })
        .eq("id", strike.id);
    }
  }

  // Award PictoCash to winning team members
  if (winningTeam) {
    const { data: winners } = await supabase
      .from("event_participants")
      .select("user_id")
      .eq("event_id", eventId)
      .eq("team", winningTeam);

    const cashReward = 50; // Checkpoint win reward

    for (const winner of winners || []) {
      // Update pictocash
      const { data: profile } = await supabase
        .from("profiles")
        .select("pictocash")
        .eq("id", winner.user_id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ pictocash: profile.pictocash + cashReward })
          .eq("id", winner.user_id);
      }

      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: winner.user_id,
        amount: cashReward,
        reason: "checkpoint_win",
        related_checkpoint_id: checkpointId,
      });
    }
  }

  revalidateCheckpoints(eventId);
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true, teamAScore, teamBScore, winningTeam };
}

export async function revealCheckpoint(checkpointId: string, eventId: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  const { data: checkpoint } = await supabase
    .from("checkpoints")
    .select("*")
    .eq("id", checkpointId)
    .single();

  if (!checkpoint) return { error: "Checkpoint not found" };
  if (!checkpoint.triggered_at) return { error: "Checkpoint not yet triggered" };

  const { error } = await supabase
    .from("checkpoints")
    .update({ is_revealed: true })
    .eq("id", checkpointId);

  if (error) return { error: error.message };

  // Get event for team names
  const { data: event } = await supabase
    .from("events")
    .select("team_a_name, team_b_name")
    .eq("id", eventId)
    .single();

  // Notify all participants
  const { data: participants } = await supabase
    .from("event_participants")
    .select("user_id")
    .eq("event_id", eventId);

  const winnerName = checkpoint.winning_team === "a"
    ? event?.team_a_name
    : checkpoint.winning_team === "b"
    ? event?.team_b_name
    : null;

  const message = winnerName
    ? `Checkpoint results are in! ${winnerName} wins this round with a ${checkpoint.margin_percentage}% margin!`
    : `Checkpoint results are in! It's a tie between both teams!`;

  const notifications = (participants || []).map((p) => ({
    user_id: p.user_id,
    type: "checkpoint",
    message,
    link: "/",
  }));

  if (notifications.length > 0) {
    await supabase.from("notifications").insert(notifications);
  }

  revalidateCheckpoints(eventId);
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function generateCheckpoints(
  eventId: string,
  count: number,
  isAuto: boolean = true
) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  if (count < 1 || count > 20) {
    return { error: "Count must be between 1 and 20" };
  }

  // Get event dates
  const { data: event } = await supabase
    .from("events")
    .select("starts_at, ends_at")
    .eq("id", eventId)
    .single();

  if (!event) return { error: "Event not found" };

  const startTime = new Date(event.starts_at).getTime();
  const endTime = new Date(event.ends_at).getTime();
  const duration = endTime - startTime;

  // Calculate evenly spaced checkpoint times
  // Place checkpoints at equal intervals, with the last one before the end
  const interval = duration / (count + 1);

  const checkpoints = [];
  for (let i = 1; i <= count; i++) {
    const scheduledAt = new Date(startTime + interval * i);
    checkpoints.push({
      event_id: eventId,
      name: count <= 3
        ? ["First", "Second", "Third"][i - 1] + " Checkpoint"
        : `Checkpoint ${i}`,
      scheduled_at: scheduledAt.toISOString(),
      is_auto: isAuto,
    });
  }

  const { error } = await supabase.from("checkpoints").insert(checkpoints);

  if (error) return { error: error.message };

  revalidateCheckpoints(eventId);
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true, count: checkpoints.length };
}

export async function processAutoCheckpoints() {
  const supabase = await createClient();

  // Find checkpoints that are due (scheduled_at <= now, not triggered, is_auto = true)
  const { data: dueCheckpoints } = await supabase
    .from("checkpoints")
    .select("id, event_id")
    .eq("is_auto", true)
    .is("triggered_at", null)
    .lte("scheduled_at", new Date().toISOString());

  if (!dueCheckpoints || dueCheckpoints.length === 0) {
    return { processed: 0 };
  }

  let processed = 0;
  for (const cp of dueCheckpoints) {
    // Get ALL unclaimed strikes
    const { data: strikes } = await supabase
      .from("strikes")
      .select("id, final_score, creator_id")
      .is("checkpoint_id", null);

    const creatorIds = [...new Set(strikes?.map((s) => s.creator_id) || [])];
    const { data: participants } = creatorIds.length > 0
      ? await supabase
          .from("event_participants")
          .select("user_id, team")
          .eq("event_id", cp.event_id)
          .in("user_id", creatorIds)
      : { data: [] };

    const teamMap = new Map(participants?.map((p) => [p.user_id, p.team]) || []);

    let teamAScore = 0;
    let teamBScore = 0;

    for (const strike of strikes || []) {
      const team = teamMap.get(strike.creator_id);
      if (team === "a") teamAScore += strike.final_score;
      else if (team === "b") teamBScore += strike.final_score;
    }

    const winningTeam = teamAScore > teamBScore ? "a" : teamBScore > teamAScore ? "b" : null;
    const totalScore = teamAScore + teamBScore;
    const marginPercentage = totalScore > 0
      ? Math.round((Math.abs(teamAScore - teamBScore) / totalScore) * 100)
      : 0;

    await supabase
      .from("checkpoints")
      .update({
        triggered_at: new Date().toISOString(),
        team_a_score: teamAScore,
        team_b_score: teamBScore,
        winning_team: winningTeam,
        margin_percentage: marginPercentage,
      })
      .eq("id", cp.id);

    // Assign strikes to checkpoint
    if (strikes && strikes.length > 0) {
      for (const strike of strikes) {
        await supabase
          .from("strikes")
          .update({ checkpoint_id: cp.id })
          .eq("id", strike.id);
      }
    }

    processed++;
  }

  return { processed };
}
