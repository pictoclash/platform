"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReportTarget =
  | { type: "strike"; id: string }
  | { type: "character"; id: string }
  | { type: "user"; id: string };

export async function submitReport(
  target: ReportTarget,
  reason: string,
  description?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Must be logged in to report" };
  }

  // Check for duplicate report
  let duplicateQuery = supabase
    .from("reports")
    .select("id")
    .eq("reporter_id", user.id)
    .eq("status", "pending");

  if (target.type === "strike") {
    duplicateQuery = duplicateQuery.eq("strike_id", target.id);
  } else if (target.type === "character") {
    duplicateQuery = duplicateQuery.eq("character_id", target.id);
  } else {
    duplicateQuery = duplicateQuery.eq("user_id", target.id);
  }

  const { data: existing } = await duplicateQuery.single();

  if (existing) {
    return { error: "You already have a pending report for this" };
  }

  // Create report
  const reportData: Record<string, unknown> = {
    reporter_id: user.id,
    reason,
    description: description?.trim() || null,
  };

  if (target.type === "strike") {
    reportData.strike_id = target.id;
  } else if (target.type === "character") {
    reportData.character_id = target.id;
  } else {
    reportData.user_id = target.id;
  }

  const { error } = await supabase.from("reports").insert(reportData);

  if (error) return { error: error.message };

  return { success: true };
}

export async function resolveReport(
  reportId: string,
  resolution: "resolved" | "dismissed",
  note?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, is_moderator")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin && !profile?.is_moderator) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("reports")
    .update({
      status: resolution,
      resolved_by_id: user.id,
      resolution_note: note?.trim() || null,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) return { error: error.message };

  revalidatePath("/admin/reports");
  return { success: true };
}
