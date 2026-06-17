import { z } from "zod";

// Strike schemas
export const strikeSchema = z.object({
  strike_type: z.enum(["visual", "writing", "sculpture"]),
  target_character_ids: z.array(z.string().uuid()).min(1, "Select at least one character"),
  message: z.string().max(500).optional(),
  // Visual scoring (1-50 each)
  score_lineart: z.number().min(1).max(50).optional(),
  score_colour: z.number().min(1).max(50).optional(),
  score_shading: z.number().min(1).max(50).optional(),
  score_background: z.number().min(1).max(50).optional(),
  // Writing scoring
  score_structure: z.number().min(1).max(50).optional(),
  score_character_voice: z.number().min(1).max(50).optional(),
  score_scene_setting: z.number().min(1).max(50).optional(),
  score_plot: z.number().min(1).max(50).optional(),
  word_count: z.number().min(0).optional(),
  // 3D scoring
  score_modelling: z.number().min(1).max(50).optional(),
  score_texturing: z.number().min(1).max(50).optional(),
  score_materials: z.number().min(1).max(50).optional(),
  score_lighting: z.number().min(1).max(50).optional(),
  // Multipliers
  is_finished: z.boolean().optional(),
});

export type StrikeInput = z.infer<typeof strikeSchema>;

// Character schemas
export const characterSchema = z.object({
  name: z
    .string()
    .min(1, "Character name is required")
    .max(50, "Character name must be at most 50 characters"),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional(),
  design_notes: z
    .string()
    .max(2000, "Design notes must be at most 2000 characters")
    .optional(),
  content_tags: z.array(z.string()).optional(),
  permission_tags: z.array(z.string()).optional(),
});

export type CharacterInput = z.infer<typeof characterSchema>;

// Auth schemas
export const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens"
      ),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      message: "You must accept the terms of conduct",
    }),
    acceptEmail: z.literal(true, {
      message: "You must accept the email storage policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Profile schemas
const socialPlatforms = [
  "twitter",
  "instagram",
  "bluesky",
  "tumblr",
  "deviantart",
  "website",
] as const;

export const socialLinkSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().url("Please enter a valid URL"),
});

export const profileUpdateSchema = z.object({
  display_name: z
    .string()
    .max(50, "Display name must be at most 50 characters")
    .optional()
    .nullable(),
  pronouns: z
    .string()
    .max(30, "Pronouns must be at most 30 characters")
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .nullable(),
  social_links: z.array(socialLinkSchema).max(10, "Maximum 10 social links").optional(),
});

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export { socialPlatforms };
