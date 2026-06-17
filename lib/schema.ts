/**
 * Database Schema Reference
 * Extracted from Supabase - source of truth for data structure
 * Last updated: 2025-01-24
 */

// ============================================================================
// ENUMS
// ============================================================================

export type Team = "a" | "b";

export type Guild =
  | "pixelweavers"
  | "traditionalists"
  | "wordwrights"
  | "hybridisers"
  | "sculptors";

export type StrikeType = "visual" | "writing" | "sculpture";

export type ReportStatus = "pending" | "resolved" | "dismissed";

export type PermissionStatus = "please" | "ok" | "ask" | "no";

export type PermissionType =
  // Content
  | "shipping"
  | "suggestive"
  | "gore"
  | "candy-gore"
  | "gender-bending"
  | "nsfw"
  // Accessibility
  | "eye-strain"
  | "trypophobia"
  | "body-horror"
  // Character Changes
  | "species-swap"
  | "outfit-change"
  | "alternate-universe";

export type PermissionCategory = "content" | "accessibility" | "character-changes";

export interface CharacterPermissions {
  // Content
  shipping?: PermissionStatus;
  suggestive?: PermissionStatus;
  gore?: PermissionStatus;
  "candy-gore"?: PermissionStatus;
  "gender-bending"?: PermissionStatus;
  nsfw?: PermissionStatus;
  // Accessibility
  "eye-strain"?: PermissionStatus;
  trypophobia?: PermissionStatus;
  "body-horror"?: PermissionStatus;
  // Character Changes
  "species-swap"?: PermissionStatus;
  "outfit-change"?: PermissionStatus;
  "alternate-universe"?: PermissionStatus;
}

// Known social platforms with icon support
export type SocialPlatform =
  | "twitter"
  | "instagram"
  | "bluesky"
  | "tumblr"
  | "deviantart"
  | "website";

export interface SocialLink {
  platform: SocialPlatform | string; // Allow custom platforms too
  url: string;
}

// ============================================================================
// TABLE SCHEMAS
// ============================================================================

export interface Profile {
  id: string; // uuid, references auth.users
  username: string; // varchar, unique
  display_name: string | null; // varchar
  pronouns: string | null; // varchar
  bio: string | null; // text, max 500 chars
  profile_image_url: string | null; // text
  social_links: SocialLink[]; // jsonb, default: []
  team: Team | null;
  guild: Guild | null;
  pictocash: number; // default: 0
  is_active: boolean; // default: true
  is_admin: boolean; // default: false
  is_moderator: boolean; // default: false
  created_at: string; // timestamp, default: now()
  updated_at: string; // timestamp, default: now()
}

export interface Character {
  id: string; // uuid, auto-generated
  owner_id: string; // uuid, references profiles.id
  name: string; // varchar
  slug: string | null; // varchar
  reference_image_url: string; // text (main reference image)
  description: string | null; // text
  design_notes: string | null; // text
  content_tags: string[] | null; // text[]
  permission_tags: string[] | null; // text[] (deprecated, use permissions)
  permissions: CharacterPermissions; // jsonb, structured permissions
  is_inactive: boolean; // default: false
  created_at: string; // timestamp, default: now()
  updated_at: string; // timestamp, default: now()
}

export interface CharacterImage {
  id: string; // uuid, auto-generated
  character_id: string; // uuid, references characters.id
  image_url: string; // text
  display_order: number; // int, default: 0
  created_at: string; // timestamp, default: now()
}

export interface Event {
  id: string; // uuid, auto-generated
  name: string; // varchar
  description: string | null; // text
  team_a_name: string; // varchar
  team_a_color: string; // varchar (hex color)
  team_b_name: string; // varchar
  team_b_color: string; // varchar (hex color)
  starts_at: string; // timestamp
  ends_at: string; // timestamp
  is_active: boolean; // default: false, only one active at a time
  created_at: string; // timestamp, default: now()
}

export interface EventParticipant {
  id: string; // uuid, auto-generated
  event_id: string; // uuid, references events.id
  user_id: string; // uuid, references profiles.id
  team: Team;
  joined_at: string | null; // timestamp, default: now()
}

export interface Checkpoint {
  id: string; // uuid, auto-generated
  event_id: string; // uuid, references events.id
  name: string | null; // varchar
  scheduled_at: string; // timestamp
  triggered_at: string | null; // timestamp
  team_a_score: number | null; // int
  team_b_score: number | null; // int
  winning_team: Team | null;
  margin_percentage: number | null; // int
  is_revealed: boolean; // default: false
  is_auto: boolean; // default: false
}

export interface Strike {
  id: string; // uuid, auto-generated
  creator_id: string; // uuid, references profiles.id
  strike_type: StrikeType;
  image_url: string | null; // text, for visual/sculpture
  markdown_content: string | null; // text, for writing
  message: string | null; // text, optional message to recipient
  base_score: number; // int, default: 0
  bonus_multiplier: number; // int, default: 100 (represents 1.0x)
  final_score: number; // int, default: 0
  checkpoint_id: string | null; // uuid, references checkpoints.id
  avenges_strike_id: string | null; // uuid, references strikes.id
  created_at: string; // timestamp, default: now()
}

export interface StrikeTarget {
  id: string; // uuid, auto-generated
  strike_id: string; // uuid, references strikes.id
  character_id: string; // uuid, references characters.id
  portrait_type: string | null; // varchar
}

export interface Report {
  id: string; // uuid, auto-generated
  reporter_id: string; // uuid, references profiles.id
  strike_id: string | null; // uuid, references strikes.id
  character_id: string | null; // uuid, references characters.id
  user_id: string | null; // uuid, references profiles.id
  reason: string; // varchar
  description: string | null; // text
  status: ReportStatus; // default: 'pending'
  resolved_by_id: string | null; // uuid, references profiles.id
  resolution_note: string | null; // text
  created_at: string; // timestamp, default: now()
  resolved_at: string | null; // timestamp
}

export interface Transaction {
  id: string; // uuid, auto-generated
  user_id: string; // uuid, references profiles.id
  amount: number; // int (can be negative for spending)
  reason: string; // varchar
  related_strike_id: string | null; // uuid, references strikes.id
  related_checkpoint_id: string | null; // uuid, references checkpoints.id
  created_at: string; // timestamp, default: now()
}

export interface Notification {
  id: string; // uuid, auto-generated
  user_id: string; // uuid, references profiles.id
  type: string; // varchar
  message: string; // text
  link: string | null; // text
  is_read: boolean; // default: false
  created_at: string; // timestamp, default: now()
}

// ============================================================================
// FOREIGN KEY RELATIONSHIPS
// ============================================================================

/**
 * profiles.id <- characters.owner_id
 * profiles.id <- event_participants.user_id
 * profiles.id <- strikes.creator_id
 * profiles.id <- reports.reporter_id
 * profiles.id <- reports.user_id
 * profiles.id <- reports.resolved_by_id
 * profiles.id <- transactions.user_id
 * profiles.id <- notifications.user_id
 *
 * events.id <- event_participants.event_id
 * events.id <- checkpoints.event_id
 *
 * checkpoints.id <- strikes.checkpoint_id
 * checkpoints.id <- transactions.related_checkpoint_id
 *
 * strikes.id <- strike_targets.strike_id
 * strikes.id <- reports.strike_id
 * strikes.id <- transactions.related_strike_id
 *
 * characters.id <- strike_targets.character_id
 * characters.id <- reports.character_id
 * characters.id <- character_images.character_id
 */
