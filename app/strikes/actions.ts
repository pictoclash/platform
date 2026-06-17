"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidateUserStrikes } from "@/lib/cache";
import { uploadImage } from "@/lib/storage";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export type CharacterLookupResult = {
  success: boolean;
  error?: string;
  character?: {
    id: string;
    name: string;
    slug: string | null;
    reference_image_url: string;
    owner_username: string;
    owner_team: "a" | "b" | null;
  };
};

/**
 * Look up a character by UUID or by slug:username format
 */
export async function lookupCharacter(input: string): Promise<CharacterLookupResult> {
  const supabase = await createClient();
  const trimmed = input.trim();

  // Check if it's a UUID (simple regex check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = uuidRegex.test(trimmed);

  if (isUuid) {
    // Look up by UUID
    const { data: character } = await supabase
      .from("characters")
      .select("id, name, slug, reference_image_url, owner_id")
      .eq("id", trimmed)
      .eq("is_inactive", false)
      .single();

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    // Get owner username and team
    const { data: owner } = await supabase
      .from("profiles")
      .select("username, team")
      .eq("id", character.owner_id)
      .single();

    return {
      success: true,
      character: {
        id: character.id,
        name: character.name,
        slug: character.slug,
        reference_image_url: character.reference_image_url,
        owner_username: owner?.username || "unknown",
        owner_team: (owner?.team as "a" | "b" | null) || null,
      },
    };
  }

  // Try slug:username or username/slug format
  let slug: string;
  let username: string;

  if (trimmed.includes(":")) {
    [slug, username] = trimmed.split(":");
  } else if (trimmed.includes("/")) {
    [username, slug] = trimmed.split("/");
  } else {
    return { success: false, error: "Enter UUID or slug:username (e.g., coral:delphi)" };
  }

  if (!slug || !username) {
    return { success: false, error: "Invalid format. Use slug:username or username/slug" };
  }

  // Look up the owner first
  const { data: owner } = await supabase
    .from("profiles")
    .select("id, username, team")
    .eq("username", username.toLowerCase())
    .single();

  if (!owner) {
    return { success: false, error: `User @${username} not found` };
  }

  // Look up the character by slug and owner
  const { data: character } = await supabase
    .from("characters")
    .select("id, name, slug, reference_image_url")
    .eq("owner_id", owner.id)
    .eq("slug", slug.toLowerCase())
    .eq("is_inactive", false)
    .single();

  if (!character) {
    return { success: false, error: `Character "${slug}" not found for @${username}` };
  }

  return {
    success: true,
    character: {
      id: character.id,
      name: character.name,
      slug: character.slug,
      reference_image_url: character.reference_image_url,
      owner_username: owner.username,
      owner_team: (owner.team as "a" | "b" | null) || null,
    },
  };
}

export async function createStrike(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  const strikeType = formData.get("strike_type") as string;
  const targetIds = formData.getAll("target_character_ids") as string[];
  const message = formData.get("message") as string;
  const avengesStrikeId = formData.get("avenges_strike_id") as string | null;
  const contentWarning = formData.get("content_warning") as string | null;

  if (!strikeType || !["visual", "writing", "sculpture"].includes(strikeType)) {
    return { success: false, error: "Invalid strike type" };
  }

  if (targetIds.length === 0) {
    return { success: false, error: "Select at least one target character" };
  }

  // Handle content based on type
  let imageUrl: string | null = null;
  let markdownContent: string | null = null;

  if (strikeType === "visual" || strikeType === "sculpture") {
    const imageFile = formData.get("image") as File | null;
    if (!imageFile || imageFile.size === 0) {
      return { success: false, error: "Image is required" };
    }
    try {
      imageUrl = await uploadImage(imageFile, "strikes");
    } catch (error) {
      console.error("Failed to upload image:", error);
      return { success: false, error: "Failed to upload image" };
    }
  } else if (strikeType === "writing") {
    markdownContent = formData.get("markdown_content") as string;
    if (!markdownContent?.trim()) {
      return { success: false, error: "Writing content is required" };
    }
  }

  // Scores are calculated client-side and passed in
  const base = Number(formData.get("base_score")) || 0;
  const multiplier = Number(formData.get("bonus_multiplier")) || 100;
  const finalScore = Math.floor((base * multiplier) / 100);

  // Parse scoring details (JSON string)
  const scoringDetailsStr = formData.get("scoring_details") as string | null;
  let scoringDetails = null;
  if (scoringDetailsStr) {
    try {
      scoringDetails = JSON.parse(scoringDetailsStr);
    } catch {
      // Invalid JSON, ignore
    }
  }

  // Create strike
  const { data: strike, error: strikeError } = await supabase
    .from("strikes")
    .insert({
      creator_id: user.id,
      strike_type: strikeType,
      image_url: imageUrl,
      markdown_content: markdownContent,
      message: message || null,
      content_warning: contentWarning || null,
      base_score: base,
      bonus_multiplier: multiplier,
      final_score: finalScore,
      avenges_strike_id: avengesStrikeId || null,
      scoring_details: scoringDetails,
    })
    .select("id")
    .single();

  if (strikeError || !strike) {
    console.error("Failed to create strike:", strikeError);
    return { success: false, error: "Failed to create strike" };
  }

  // Create strike targets
  const targets = targetIds.map((characterId) => ({
    strike_id: strike.id,
    character_id: characterId,
  }));

  const { error: targetsError } = await supabase.from("strike_targets").insert(targets);

  if (targetsError) {
    console.error("Failed to create strike targets:", targetsError);
    // Clean up the strike
    await supabase.from("strikes").delete().eq("id", strike.id);
    return { success: false, error: "Failed to create strike" };
  }

  // Get creator username and character owners for notifications
  const { data: creator } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const { data: targetCharacters } = await supabase
    .from("characters")
    .select("id, name, owner_id")
    .in("id", targetIds);

  // Create notifications for each unique owner
  if (targetCharacters) {
    const ownerIds = [...new Set(targetCharacters.map((c) => c.owner_id))];
    const notifications = ownerIds
      .filter((ownerId) => ownerId !== user.id) // Don't notify yourself
      .map((ownerId) => {
        const chars = targetCharacters.filter((c) => c.owner_id === ownerId);
        const charNames = chars.map((c) => c.name).join(", ");
        return {
          user_id: ownerId,
          type: "strike_received",
          message: `@${creator?.username} struck your character${chars.length > 1 ? "s" : ""}: ${charNames}`,
          link: `/strikes/${strike.id}`,
        };
      });

    if (notifications.length > 0) {
      await supabase.from("notifications").insert(notifications);
    }
  }

  revalidateUserStrikes(user.id);
  revalidatePath("/profile");
  revalidatePath("/strikes");
  redirect(`/strikes/${strike.id}`);
}
