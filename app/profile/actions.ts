"use server";

import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import type { SocialLink } from "@/lib/schema";

export type SentStrike = {
  id: string;
  strike_type: "visual" | "writing" | "sculpture";
  image_url: string | null;
  final_score: number;
  created_at: string;
  characters: {
    id: string;
    name: string;
    reference_image_url: string;
    owner_username: string;
  }[];
};

export type ReceivedStrike = {
  id: string;
  strike_type: "visual" | "writing" | "sculpture";
  image_url: string | null;
  final_score: number;
  created_at: string;
  message: string | null;
  creator: {
    username: string;
    display_name: string | null;
  };
  character: {
    id: string;
    name: string;
  };
};

export async function getSentStrikes(): Promise<{ strikes: SentStrike[]; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { strikes: [], error: "Not authenticated" };
  }

  // Get strikes created by this user with their target characters
  const { data: strikes, error } = await supabase
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
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch sent strikes:", error);
    return { strikes: [], error: "Failed to fetch strikes" };
  }

  // Transform the data to flatten the structure
  const transformedStrikes: SentStrike[] = (strikes || []).map((strike) => ({
    id: strike.id,
    strike_type: strike.strike_type,
    image_url: strike.image_url,
    final_score: strike.final_score,
    created_at: strike.created_at,
    characters: (strike.strike_targets || []).map((target) => {
      const char = target.characters as unknown as { id: string; name: string; reference_image_url: string; profiles: { username: string } | { username: string }[] };
      const profiles = char.profiles;
      const username = Array.isArray(profiles) ? profiles[0]?.username : profiles?.username;
      return {
        id: char.id,
        name: char.name,
        reference_image_url: char.reference_image_url,
        owner_username: username || "unknown",
      };
    }),
  }));

  return { strikes: transformedStrikes };
}

export async function getReceivedStrikes(): Promise<{ strikes: ReceivedStrike[]; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { strikes: [], error: "Not authenticated" };
  }

  // First get all of the user's character IDs
  const { data: characters } = await supabase
    .from("characters")
    .select("id")
    .eq("owner_id", user.id);

  if (!characters || characters.length === 0) {
    return { strikes: [] };
  }

  const characterIds = characters.map((c) => c.id);

  // Get strikes that target any of the user's characters
  const { data: strikeTargets, error } = await supabase
    .from("strike_targets")
    .select(`
      character_id,
      characters (
        id,
        name
      ),
      strikes (
        id,
        strike_type,
        image_url,
        final_score,
        created_at,
        message,
        profiles:creator_id (
          username,
          display_name
        )
      )
    `)
    .in("character_id", characterIds)
    .order("strikes(created_at)", { ascending: false });

  if (error) {
    console.error("Failed to fetch received strikes:", error);
    return { strikes: [], error: "Failed to fetch strikes" };
  }

  // Transform and deduplicate (a strike might target multiple of user's characters)
  const seenStrikes = new Set<string>();
  const transformedStrikes: ReceivedStrike[] = [];

  for (const target of strikeTargets || []) {
    const strike = target.strikes as unknown as {
      id: string;
      strike_type: "visual" | "writing" | "sculpture";
      image_url: string | null;
      final_score: number;
      created_at: string;
      message: string | null;
      profiles: { username: string; display_name: string | null };
    };

    if (!strike || seenStrikes.has(strike.id)) continue;
    seenStrikes.add(strike.id);

    const character = target.characters as unknown as { id: string; name: string };

    transformedStrikes.push({
      id: strike.id,
      strike_type: strike.strike_type,
      image_url: strike.image_url,
      final_score: strike.final_score,
      created_at: strike.created_at,
      message: strike.message,
      creator: {
        username: strike.profiles?.username || "unknown",
        display_name: strike.profiles?.display_name || null,
      },
      character: {
        id: character.id,
        name: character.name,
      },
    });
  }

  // Sort by created_at descending
  transformedStrikes.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return { strikes: transformedStrikes };
}

export async function updateProfile(
  data: ProfileUpdateInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate input
  const result = profileUpdateSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message || "Invalid input" };
  }

  const { display_name, pronouns, bio, social_links } = result.data;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: display_name || null,
      pronouns: pronouns || null,
      bio: bio || null,
      social_links: social_links || [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function uploadProfileImage(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "Invalid file type. Use JPEG, PNG, WebP, or GIF" };
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { success: false, error: "File too large. Maximum 5MB" };
  }

  // Use consistent filename so we always overwrite the previous profile image
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `profile-images/${user.id}.${ext}`;

  // Delete existing profile image first (ignore errors if it doesn't exist)
  await supabase.storage.from("pictoclash").remove([filename]);

  // Upload new image
  const { error: uploadError } = await supabase.storage
    .from("pictoclash")
    .upload(filename, file, {
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error("Failed to upload image:", uploadError);
    return { success: false, error: "Failed to upload image" };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("pictoclash")
    .getPublicUrl(filename);

  const publicUrl = urlData.publicUrl;

  // Update profile with new image URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      profile_image_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Failed to update profile image URL:", updateError);
    return { success: false, error: "Failed to update profile" };
  }

  revalidatePath("/profile");
  return { success: true, url: publicUrl };
}

export async function getClashStats(): Promise<{
  totalPoints: number;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { totalPoints: 0, error: "Not authenticated" };
  }

  // Get strikes for current checkpoint period
  const { data: strikes, error } = await supabase
    .from("strikes")
    .select("final_score")
    .eq("creator_id", user.id);

  if (error) {
    console.error("Failed to fetch clash stats:", error);
    return { totalPoints: 0, error: "Failed to fetch stats" };
  }

  const totalPoints = strikes?.reduce((sum, s) => sum + (s.final_score || 0), 0) || 0;
  return { totalPoints };
}

export async function leaveClash(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Remove team assignment and set inactive
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      team: null,
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    console.error("Failed to leave clash:", profileError);
    return { success: false, error: "Failed to leave clash" };
  }

  // Remove from event participants
  const { error: participantError } = await supabase
    .from("event_participants")
    .delete()
    .eq("user_id", user.id);

  if (participantError) {
    console.error("Failed to remove from event:", participantError);
    // Non-critical - continue anyway
  }

  revalidatePath("/profile");
  revalidatePath("/event");
  return { success: true };
}

export async function deleteAccount(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify email matches
  if (user.email?.toLowerCase() !== email.toLowerCase()) {
    return { success: false, error: "Email does not match" };
  }

  // Salt the username so it can't be reused
  const saltedUsername = `deleted_${Date.now()}_${user.id.slice(0, 8)}`;

  // Update profile to mark as deleted and salt username
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      username: saltedUsername,
      display_name: "[Deleted User]",
      bio: null,
      pronouns: null,
      profile_image_url: null,
      social_links: [],
      team: null,
      guild: null,
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    console.error("Failed to update profile:", profileError);
    return { success: false, error: "Failed to delete account" };
  }

  // Delete all characters
  const { error: charactersError } = await supabase
    .from("characters")
    .delete()
    .eq("owner_id", user.id);

  if (charactersError) {
    console.error("Failed to delete characters:", charactersError);
    // Non-critical - continue
  }

  // Delete all strikes created by user
  const { error: strikesError } = await supabase
    .from("strikes")
    .delete()
    .eq("creator_id", user.id);

  if (strikesError) {
    console.error("Failed to delete strikes:", strikesError);
    // Non-critical - continue
  }

  // Remove from event participants
  const { error: participantError } = await supabase
    .from("event_participants")
    .delete()
    .eq("user_id", user.id);

  if (participantError) {
    console.error("Failed to remove from events:", participantError);
    // Non-critical - continue
  }

  // Delete notifications
  const { error: notificationsError } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id);

  if (notificationsError) {
    console.error("Failed to delete notifications:", notificationsError);
    // Non-critical - continue
  }

  // Sign out the user (this will effectively "delete" their session)
  await supabase.auth.signOut();

  return { success: true };
}

export async function getProfile(): Promise<{
  profile: {
    display_name: string | null;
    pronouns: string | null;
    bio: string | null;
    profile_image_url: string | null;
    social_links: SocialLink[];
  } | null;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null, error: "Not authenticated" };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, pronouns, bio, profile_image_url, social_links")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Failed to fetch profile:", error);
    return { profile: null, error: "Failed to fetch profile" };
  }

  return {
    profile: {
      ...profile,
      social_links: (profile.social_links as SocialLink[]) || [],
    },
  };
}
