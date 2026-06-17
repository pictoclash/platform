import type { PermissionType, PermissionStatus, PermissionCategory } from "./schema";

/**
 * Permission category definitions
 */
export const PERMISSION_CATEGORIES: {
  key: PermissionCategory;
  label: string;
  description: string;
}[] = [
  {
    key: "content",
    label: "Content",
    description: "What types of content can be depicted",
  },
  {
    key: "accessibility",
    label: "Accessibility",
    description: "Sensory and accessibility considerations",
  },
  {
    key: "character-changes",
    label: "Character Changes",
    description: "How the character can be modified or reimagined",
  },
];

/**
 * Permission type definitions with labels, descriptions, and categories
 */
export const PERMISSION_TYPES: {
  key: PermissionType;
  label: string;
  description: string;
  category: PermissionCategory;
}[] = [
  // Content permissions
  {
    key: "shipping",
    label: "Shipping",
    description: "Romantic or relationship content with other characters",
    category: "content",
  },
  {
    key: "suggestive",
    label: "Suggestive",
    description: "Mildly suggestive or flirtatious content",
    category: "content",
  },
  {
    key: "gore",
    label: "Gore",
    description: "Blood, injuries, or graphic violence",
    category: "content",
  },
  {
    key: "candy-gore",
    label: "Candy Gore",
    description: "Stylized gore with candy, pastel, or surreal elements",
    category: "content",
  },
  {
    key: "gender-bending",
    label: "Gender Bending",
    description: "Depicting the character as a different gender",
    category: "character-changes",
  },
  {
    key: "nsfw",
    label: "NSFW / Smut",
    description: "Explicit adult content (18+ only)",
    category: "content",
  },
  // Accessibility permissions
  {
    key: "eye-strain",
    label: "Eye Strain",
    description: "Extremely bright colors or high-contrast patterns that may cause discomfort",
    category: "accessibility",
  },
  {
    key: "trypophobia",
    label: "Trypophobia",
    description: "Clusters of holes or bumps that may trigger phobia responses",
    category: "accessibility",
  },
  {
    key: "body-horror",
    label: "Body Horror",
    description: "Distorted anatomy, extra limbs, melting, or unnatural body modifications",
    category: "accessibility",
  },
  // Character Changes permissions
  {
    key: "species-swap",
    label: "Species Swap",
    description: "Depicting the character as a different species",
    category: "character-changes",
  },
  {
    key: "outfit-change",
    label: "Outfit Change",
    description: "Different clothing or accessories than their reference",
    category: "character-changes",
  },
  {
    key: "alternate-universe",
    label: "Alternate Universe",
    description: "Placing the character in alternate settings or scenarios",
    category: "character-changes",
  },
];

/**
 * Get permissions grouped by category
 */
export function getPermissionsByCategory() {
  return PERMISSION_CATEGORIES.map((category) => ({
    ...category,
    permissions: PERMISSION_TYPES.filter((p) => p.category === category.key),
  }));
}

/**
 * Permission status colors and labels
 */
export const PERMISSION_STATUSES: Record<
  PermissionStatus,
  { bg: string; label: string; description: string }
> = {
  please: {
    bg: "#009329",
    label: "PLEASE",
    description: "Encouraged! The owner would love to see this.",
  },
  ok: {
    bg: "#b28000",
    label: "OK",
    description: "Allowed. Go ahead without asking.",
  },
  ask: {
    bg: "#454545",
    label: "ASK",
    description: "Ask the owner for permission first.",
  },
  no: {
    bg: "#ff3b30",
    label: "NO",
    description: "Not allowed. Please respect this boundary.",
  },
};
