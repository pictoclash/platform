"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, is_moderator")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin && !profile?.is_moderator) {
    return { supabase: null, isAdmin: false };
  }

  return { supabase, isAdmin: profile.is_admin, userId: user.id };
}

export async function setUserRole(
  userId: string,
  role: "user" | "moderator" | "admin"
) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Unauthorized" };

  const updates = {
    is_admin: role === "admin",
    is_moderator: role === "moderator",
  };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

export async function adjustPictoCash(userId: string, amount: number) {
  const { supabase } = await requireAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("pictocash")
    .eq("id", userId)
    .single();

  if (!profile) return { error: "User not found" };

  const newAmount = Math.max(0, profile.pictocash + amount);

  const { error } = await supabase
    .from("profiles")
    .update({ pictocash: newAmount })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

export async function setUserTeam(userId: string, team: "a" | "b" | null) {
  const { supabase } = await requireAdmin();
  if (!supabase) return { error: "Unauthorized" };

  // Update profile team
  const { error } = await supabase
    .from("profiles")
    .update({ team })
    .eq("id", userId);

  if (error) return { error: error.message };

  // Also update event_participants for the active event
  const { data: activeEvent } = await supabase
    .from("events")
    .select("id")
    .eq("is_active", true)
    .single();

  if (activeEvent) {
    if (team === null) {
      // Remove from event
      await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", activeEvent.id)
        .eq("user_id", userId);
    } else {
      // Update or insert into event_participants
      await supabase.from("event_participants").upsert(
        {
          event_id: activeEvent.id,
          user_id: userId,
          team,
        },
        { onConflict: "event_id,user_id" }
      );
    }
  }

  revalidatePath("/admin/users");
  revalidatePath("/event");
  return { success: true };
}

export async function banUser(userId: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", userId);

  if (error) return { error: error.message };

  // Send notification to user about being banned
  await supabase.from("notifications").insert({
    user_id: userId,
    type: "system",
    message: "Your account has been suspended. Please contact support if you believe this is an error.",
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function unbanUser(userId: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: true })
    .eq("id", userId);

  if (error) return { error: error.message };

  // Notify user their account is restored
  await supabase.from("notifications").insert({
    user_id: userId,
    type: "system",
    message: "Your account has been restored. Welcome back!",
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const { supabase, isAdmin, userId: adminId } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  // Prevent self-deletion
  if (userId === adminId) {
    return { error: "Cannot delete your own account" };
  }

  // Delete user's characters first (to handle foreign key constraints)
  await supabase.from("characters").delete().eq("owner_id", userId);

  // Delete user's notifications
  await supabase.from("notifications").delete().eq("user_id", userId);

  // Delete profile (strikes will remain for historical purposes)
  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

export async function sendNotification(
  userId: string,
  message: string,
  type: "system" | "admin" | "info" = "admin"
) {
  const { supabase } = await requireAdmin();
  if (!supabase) return { error: "Unauthorized" };

  if (!message.trim()) return { error: "Message is required" };

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    message: message.trim(),
  });

  if (error) return { error: error.message };

  return { success: true };
}

export async function sendBroadcastNotification(
  message: string,
  type: "system" | "admin" | "info" = "admin"
) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  if (!message.trim()) return { error: "Message is required" };

  // Get all user IDs
  const { data: users } = await supabase.from("profiles").select("id");

  if (!users || users.length === 0) return { error: "No users found" };

  // Create notifications for all users
  const notifications = users.map((u) => ({
    user_id: u.id,
    type,
    message: message.trim(),
  }));

  const { error } = await supabase.from("notifications").insert(notifications);

  if (error) return { error: error.message };

  return { success: true, count: users.length };
}

export async function resetUserStats(userId: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return { error: "Admin required" };

  const { error } = await supabase
    .from("profiles")
    .update({ pictocash: 0 })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}
