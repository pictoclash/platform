"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidateInspirationCharacters } from "@/lib/cache";
import { characterSchema } from "@/lib/validation";
import { uploadImage } from "@/lib/storage";
import type { CharacterPermissions, PermissionStatus, PermissionType } from "@/lib/schema";
import { PERMISSION_TYPES } from "@/lib/permissions";

export type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createCharacter(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    design_notes: (formData.get("design_notes") as string) || undefined,
    content_tags: formData.get("content_tags")
      ? (formData.get("content_tags") as string).split(",").map((t) => t.trim()).filter(Boolean)
      : undefined,
    permission_tags: formData.get("permission_tags")
      ? (formData.get("permission_tags") as string).split(",").map((t) => t.trim()).filter(Boolean)
      : undefined,
  };

  // Build permissions object from form data
  const permissions: CharacterPermissions = {};
  for (const { key } of PERMISSION_TYPES) {
    const value = formData.get(`permission_${key}`) as PermissionStatus | null;
    if (value && ["please", "ok", "ask", "no"].includes(value)) {
      permissions[key] = value;
    }
  }

  const parsed = characterSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Handle image upload
  const imageFile = formData.get("reference_image") as File | null;
  let referenceImageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    try {
      referenceImageUrl = await uploadImage(imageFile, "characters");
    } catch (error) {
      console.error("Failed to upload image:", error);
      return { success: false, error: "Failed to upload image" };
    }
  }

  if (!referenceImageUrl) {
    return { success: false, error: "Reference image is required" };
  }

  // Get username for slug
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  // Slug is just the character name - username is in the URL path
  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const { error } = await supabase.from("characters").insert({
    owner_id: user.id,
    name: parsed.data.name,
    slug,
    description: parsed.data.description || null,
    design_notes: parsed.data.design_notes || null,
    content_tags: parsed.data.content_tags || null,
    permission_tags: parsed.data.permission_tags || null,
    permissions,
    reference_image_url: referenceImageUrl,
  });

  if (error) {
    console.error("Failed to create character:", error);
    return { success: false, error: "Failed to create character" };
  }

  revalidateInspirationCharacters();
  revalidatePath("/profile");
  revalidatePath(`/characters/${profile.username}/${slug}`);
  redirect(`/characters/${profile.username}/${slug}`);
}

export async function updateCharacter(
  characterId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  // Verify ownership and get character info for redirect
  const [{ data: existing }, { data: profile }] = await Promise.all([
    supabase
      .from("characters")
      .select("owner_id, slug, reference_image_url")
      .eq("id", characterId)
      .single(),
    supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single(),
  ]);

  if (!existing || existing.owner_id !== user.id) {
    return { success: false, error: "Character not found" };
  }

  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    design_notes: (formData.get("design_notes") as string) || undefined,
    content_tags: formData.get("content_tags")
      ? (formData.get("content_tags") as string).split(",").map((t) => t.trim()).filter(Boolean)
      : undefined,
    permission_tags: formData.get("permission_tags")
      ? (formData.get("permission_tags") as string).split(",").map((t) => t.trim()).filter(Boolean)
      : undefined,
  };

  // Build permissions object from form data
  const permissions: CharacterPermissions = {};
  for (const { key } of PERMISSION_TYPES) {
    const value = formData.get(`permission_${key}`) as PermissionStatus | null;
    if (value && ["please", "ok", "ask", "no"].includes(value)) {
      permissions[key] = value;
    }
  }

  const parsed = characterSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Generate new slug from the name
  const newSlug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Handle image upload
  const imageFile = formData.get("reference_image") as File | null;
  let referenceImageUrl = existing.reference_image_url;

  if (imageFile && imageFile.size > 0) {
    try {
      referenceImageUrl = await uploadImage(imageFile, "characters");
    } catch (error) {
      console.error("Failed to upload image:", error);
      return { success: false, error: "Failed to upload image" };
    }
  }

  const { error } = await supabase
    .from("characters")
    .update({
      name: parsed.data.name,
      slug: newSlug,
      description: parsed.data.description || null,
      design_notes: parsed.data.design_notes || null,
      content_tags: parsed.data.content_tags || null,
      permission_tags: parsed.data.permission_tags || null,
      permissions,
      reference_image_url: referenceImageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", characterId);

  if (error) {
    console.error("Failed to update character:", error);
    return { success: false, error: "Failed to update character" };
  }

  revalidatePath("/profile");
  // Revalidate both old and new paths in case of cached pages
  if (existing.slug !== newSlug) {
    revalidatePath(`/characters/${profile.username}/${existing.slug}`);
  }
  revalidatePath(`/characters/${profile.username}/${newSlug}`);
  redirect(`/characters/${profile.username}/${newSlug}`);
}

export async function deleteCharacter(characterId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("characters")
    .select("owner_id")
    .eq("id", characterId)
    .single();

  if (!existing || existing.owner_id !== user.id) {
    return { success: false, error: "Character not found" };
  }

  const { error } = await supabase
    .from("characters")
    .delete()
    .eq("id", characterId);

  if (error) {
    console.error("Failed to delete character:", error);
    return { success: false, error: "Failed to delete character" };
  }

  revalidatePath("/profile");
  redirect("/profile");
}

export async function reorderCharacters(
  characterOrders: { id: string; order: number }[]
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  // Verify all characters belong to the user and update in sequence
  for (const { id, order } of characterOrders) {
    const { error } = await supabase
      .from("characters")
      .update({ display_order: order, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("owner_id", user.id);

    if (error) {
      console.error("Failed to update character order:", error);
      return { success: false, error: "Failed to update character order" };
    }
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function deleteCharacterInline(characterId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("characters")
    .select("owner_id")
    .eq("id", characterId)
    .single();

  if (!existing || existing.owner_id !== user.id) {
    return { success: false, error: "Character not found" };
  }

  const { error } = await supabase
    .from("characters")
    .delete()
    .eq("id", characterId);

  if (error) {
    console.error("Failed to delete character:", error);
    return { success: false, error: "Failed to delete character" };
  }

  revalidateInspirationCharacters();
  revalidatePath("/profile");
  return { success: true };
}

export async function toggleCharacterActive(
  characterId: string,
  isInactive: boolean
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  const { error } = await supabase
    .from("characters")
    .update({ is_inactive: isInactive, updated_at: new Date().toISOString() })
    .eq("id", characterId)
    .eq("owner_id", user.id);

  if (error) {
    return { success: false, error: "Failed to update character" };
  }

  revalidatePath("/profile");
  revalidatePath(`/characters/${characterId}`);
  return { success: true };
}

export async function addCharacterImage(
  characterId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("characters")
    .select("owner_id")
    .eq("id", characterId)
    .single();

  if (!existing || existing.owner_id !== user.id) {
    return { success: false, error: "Character not found" };
  }

  const imageFile = formData.get("image") as File | null;
  if (!imageFile || imageFile.size === 0) {
    return { success: false, error: "No image provided" };
  }

  let imageUrl: string;
  try {
    imageUrl = await uploadImage(imageFile, "characters");
  } catch (error) {
    console.error("Failed to upload image:", error);
    return { success: false, error: "Failed to upload image" };
  }

  // Get max display order
  const { data: images } = await supabase
    .from("character_images")
    .select("display_order")
    .eq("character_id", characterId)
    .order("display_order", { ascending: false })
    .limit(1);

  const nextOrder = images && images.length > 0 ? images[0].display_order + 1 : 0;

  const { error } = await supabase.from("character_images").insert({
    character_id: characterId,
    image_url: imageUrl,
    display_order: nextOrder,
  });

  if (error) {
    console.error("Failed to add character image:", error);
    return { success: false, error: "Failed to add image" };
  }

  // If this is the first image (nextOrder === 0), sync to reference_image_url
  if (nextOrder === 0) {
    await supabase
      .from("characters")
      .update({ reference_image_url: imageUrl })
      .eq("id", characterId);
  }

  revalidatePath(`/characters/${characterId}`);
  revalidatePath(`/characters/${characterId}/edit`);
  return { success: true };
}

export async function reorderCharacterImages(
  characterId: string,
  imageOrders: { id: string; order: number }[]
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("characters")
    .select("owner_id")
    .eq("id", characterId)
    .single();

  if (!existing || existing.owner_id !== user.id) {
    return { success: false, error: "Character not found" };
  }

  // Update all image orders
  for (const { id, order } of imageOrders) {
    const { error } = await supabase
      .from("character_images")
      .update({ display_order: order })
      .eq("id", id)
      .eq("character_id", characterId);

    if (error) {
      console.error("Failed to update image order:", error);
      return { success: false, error: "Failed to reorder images" };
    }
  }

  // Sync reference_image_url with the new first image
  const { data: firstImage } = await supabase
    .from("character_images")
    .select("image_url")
    .eq("character_id", characterId)
    .order("display_order", { ascending: true })
    .limit(1)
    .single();

  if (firstImage) {
    await supabase
      .from("characters")
      .update({ reference_image_url: firstImage.image_url })
      .eq("id", characterId);
  }

  revalidatePath(`/characters/${characterId}`);
  revalidatePath(`/characters/${characterId}/edit`);
  return { success: true };
}

export async function deleteCharacterImage(
  characterId: string,
  imageId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("characters")
    .select("owner_id")
    .eq("id", characterId)
    .single();

  if (!existing || existing.owner_id !== user.id) {
    return { success: false, error: "Character not found" };
  }

  // Check how many images exist - don't allow deleting the last one
  const { data: imageCount } = await supabase
    .from("character_images")
    .select("id")
    .eq("character_id", characterId);

  if (!imageCount || imageCount.length <= 1) {
    return { success: false, error: "Cannot delete the last image" };
  }

  const { error } = await supabase
    .from("character_images")
    .delete()
    .eq("id", imageId)
    .eq("character_id", characterId);

  if (error) {
    console.error("Failed to delete character image:", error);
    return { success: false, error: "Failed to delete image" };
  }

  // Sync reference_image_url with the first remaining image
  const { data: firstImage } = await supabase
    .from("character_images")
    .select("image_url")
    .eq("character_id", characterId)
    .order("display_order", { ascending: true })
    .limit(1)
    .single();

  if (firstImage) {
    await supabase
      .from("characters")
      .update({ reference_image_url: firstImage.image_url })
      .eq("id", characterId);
  }

  revalidatePath(`/characters/${characterId}`);
  revalidatePath(`/characters/${characterId}/edit`);
  return { success: true };
}
