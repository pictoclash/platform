"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markAllRead() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  revalidatePath("/notifications");
  revalidatePath("/profile");
}

export async function markRead(notificationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/notifications");
  revalidatePath("/profile");
}

export async function clearNotification(notificationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/notifications");
  revalidatePath("/profile");
}

export async function clearAllNotifications() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id);

  revalidatePath("/notifications");
  revalidatePath("/profile");
}
