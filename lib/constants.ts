/**
 * Centralized constants for PICTOCLASH
 * Scoring values, limits, and enums
 */

// ============================================================================
// SCORING
// ============================================================================

/** Words required per bonus point for writing strikes */
export const WORDS_PER_POINT = 50;

/** Scoring option with label, point value, and icon */
export type ScoringOption = {
  label: string;
  points: number;
  icon: string; // Lucide icon name
  /** Optional display label for the strike plaque (defaults to label if not set) */
  plaqueLabel?: string;
};

/** Scoring category with name and available options */
export type ScoringCategory = {
  id: string;
  name: string;
  options: ScoringOption[];
};

/** Visual art (2D) scoring categories */
export const VISUAL_SCORING: ScoringCategory[] = [
  {
    id: "lineart",
    name: "Lineart",
    options: [
      { label: "None", points: 0, icon: "Circle" },
      { label: "Rough Sketch", points: 10, icon: "Pencil" },
      { label: "Clean Sketch", points: 20, icon: "PenLine" },
      { label: "Lined", points: 35, icon: "Pen" },
      { label: "Detailed Lines", points: 50, icon: "PenTool" },
    ],
  },
  {
    id: "colour",
    name: "Colour",
    options: [
      { label: "None", points: 0, icon: "Circle" },
      { label: "Spot Colours", points: 15, icon: "Droplet" },
      { label: "Simple Colours", points: 25, icon: "Palette" },
      { label: "Fully Coloured", points: 40, icon: "Paintbrush" },
      { label: "Painted", points: 50, icon: "Brush" },
    ],
  },
  {
    id: "shading",
    name: "Shading",
    options: [
      { label: "None", points: 0, icon: "Circle" },
      { label: "Minimal", points: 10, icon: "CircleHalf" },
      { label: "Cel-Shaded", points: 25, icon: "Contrast" },
      { label: "Soft Shaded", points: 40, icon: "SunMedium" },
      { label: "Fully Rendered", points: 50, icon: "Sparkles" },
    ],
  },
  {
    id: "background",
    name: "Background",
    options: [
      { label: "None", points: 0, icon: "Circle" },
      { label: "Simple/Abstract", points: 10, icon: "Square", plaqueLabel: "Simple BG" },
      { label: "Basic Scene", points: 25, icon: "Image", plaqueLabel: "Basic BG" },
      { label: "Detailed", points: 40, icon: "Mountain", plaqueLabel: "Detailed BG" },
      { label: "Full Environment", points: 50, icon: "Landmark", plaqueLabel: "Full BG" },
    ],
  },
  {
    id: "complexity",
    name: "Complexity",
    options: [
      { label: "Simple", points: 5, icon: "Minus", plaqueLabel: "Simple Comp" },
      { label: "Standard", points: 15, icon: "Equal", plaqueLabel: "Standard Comp" },
      { label: "Detailed", points: 30, icon: "Plus", plaqueLabel: "Detailed Comp" },
      { label: "Complex", points: 45, icon: "Layers", plaqueLabel: "Complex Comp" },
      { label: "Highly Detailed", points: 50, icon: "Layers3", plaqueLabel: "Highly Detailed" },
    ],
  },
  {
    id: "characters",
    name: "Characters",
    options: [
      { label: "One Character", points: 0, icon: "User" },
      { label: "Two Characters", points: 15, icon: "Users" },
      { label: "Group (3+)", points: 30, icon: "UsersRound" },
      { label: "Crowd Scene", points: 50, icon: "Network" },
    ],
  },
];

/** Writing scoring categories */
export const WRITING_SCORING: ScoringCategory[] = [
  {
    id: "structure",
    name: "Structure",
    options: [
      { label: "Basic", points: 10, icon: "FileText", plaqueLabel: "Basic Structure" },
      { label: "Clear", points: 25, icon: "AlignLeft", plaqueLabel: "Clear Structure" },
      { label: "Well-Crafted", points: 40, icon: "LayoutList" },
      { label: "Complex", points: 50, icon: "Network", plaqueLabel: "Complex Structure" },
    ],
  },
  {
    id: "voice",
    name: "Character Voice",
    options: [
      { label: "Basic", points: 10, icon: "MessageCircle", plaqueLabel: "Basic Voice" },
      { label: "Consistent", points: 25, icon: "MessageSquare", plaqueLabel: "Consistent Voice" },
      { label: "Distinct", points: 40, icon: "Quote", plaqueLabel: "Distinct Voice" },
      { label: "Exceptional", points: 50, icon: "Sparkles", plaqueLabel: "Exceptional Voice" },
    ],
  },
  {
    id: "setting",
    name: "Scene Setting",
    options: [
      { label: "Minimal", points: 5, icon: "Circle", plaqueLabel: "Minimal Setting" },
      { label: "Basic", points: 15, icon: "Square", plaqueLabel: "Basic Setting" },
      { label: "Detailed", points: 30, icon: "Mountain", plaqueLabel: "Detailed Setting" },
      { label: "Immersive", points: 50, icon: "Landmark", plaqueLabel: "Immersive Setting" },
    ],
  },
  {
    id: "plot",
    name: "Plot",
    options: [
      { label: "Simple", points: 10, icon: "ArrowRight", plaqueLabel: "Simple Plot" },
      { label: "Clear Arc", points: 25, icon: "TrendingUp" },
      { label: "Engaging", points: 40, icon: "Zap", plaqueLabel: "Engaging Plot" },
      { label: "Complex", points: 50, icon: "GitBranch", plaqueLabel: "Complex Plot" },
    ],
  },
  {
    id: "dialogue",
    name: "Dialogue",
    options: [
      { label: "None", points: 0, icon: "Circle" },
      { label: "Basic", points: 15, icon: "MessageCircle", plaqueLabel: "Basic Dialogue" },
      { label: "Natural", points: 30, icon: "MessagesSquare", plaqueLabel: "Natural Dialogue" },
      { label: "Exceptional", points: 50, icon: "AudioLines", plaqueLabel: "Exceptional Dialogue" },
    ],
  },
  {
    id: "emotion",
    name: "Emotion",
    options: [
      { label: "Light", points: 10, icon: "Smile", plaqueLabel: "Light Emotion" },
      { label: "Present", points: 25, icon: "Heart", plaqueLabel: "Emotional" },
      { label: "Impactful", points: 40, icon: "HeartPulse" },
      { label: "Moving", points: 50, icon: "Sparkles" },
    ],
  },
];

/** 3D/Sculpture scoring categories */
export const SCULPTURE_SCORING: ScoringCategory[] = [
  {
    id: "modelling",
    name: "Modelling",
    options: [
      { label: "Basic Shape", points: 10, icon: "Box" },
      { label: "Simple Model", points: 25, icon: "Boxes" },
      { label: "Detailed", points: 40, icon: "Shapes", plaqueLabel: "Detailed Model" },
      { label: "Complex", points: 50, icon: "Gem", plaqueLabel: "Complex Model" },
    ],
  },
  {
    id: "texturing",
    name: "Texturing",
    options: [
      { label: "None", points: 0, icon: "Circle" },
      { label: "Basic", points: 15, icon: "Grid3x3", plaqueLabel: "Basic Textures" },
      { label: "Detailed", points: 35, icon: "Scan", plaqueLabel: "Detailed Textures" },
      { label: "High Quality", points: 50, icon: "Sparkles", plaqueLabel: "HQ Textures" },
    ],
  },
  {
    id: "materials",
    name: "Materials",
    options: [
      { label: "Basic", points: 10, icon: "Square", plaqueLabel: "Basic Materials" },
      { label: "Standard", points: 25, icon: "Layers", plaqueLabel: "Standard Materials" },
      { label: "Quality", points: 40, icon: "Orbit", plaqueLabel: "Quality Materials" },
      { label: "Premium", points: 50, icon: "Gem", plaqueLabel: "Premium Materials" },
    ],
  },
  {
    id: "lighting",
    name: "Lighting",
    options: [
      { label: "Default", points: 5, icon: "Circle", plaqueLabel: "Default Lighting" },
      { label: "Basic Setup", points: 20, icon: "Sun", plaqueLabel: "Basic Lighting" },
      { label: "Good Lighting", points: 35, icon: "SunMedium" },
      { label: "Professional", points: 50, icon: "Lightbulb", plaqueLabel: "Pro Lighting" },
    ],
  },
  {
    id: "composition",
    name: "Composition",
    options: [
      { label: "Simple", points: 10, icon: "Square", plaqueLabel: "Simple Comp" },
      { label: "Balanced", points: 25, icon: "LayoutGrid", plaqueLabel: "Balanced Comp" },
      { label: "Dynamic", points: 40, icon: "Move3d", plaqueLabel: "Dynamic Comp" },
      { label: "Exceptional", points: 50, icon: "Sparkles", plaqueLabel: "Exceptional Comp" },
    ],
  },
  {
    id: "detail",
    name: "Detail Level",
    options: [
      { label: "Basic", points: 10, icon: "Minus", plaqueLabel: "Basic Detail" },
      { label: "Standard", points: 25, icon: "Equal", plaqueLabel: "Standard Detail" },
      { label: "High Detail", points: 40, icon: "Plus" },
      { label: "Extremely Detailed", points: 50, icon: "Layers3" },
    ],
  },
];

// ============================================================================
// MULTIPLIERS
// ============================================================================

/**
 * Multipliers stored as integers (100 = 1.0x)
 * Applied to base score: final = base * (multiplier / 100)
 */
export const MULTIPLIERS = {
  /** Base multiplier (1.0x) */
  BASE: 100,
  /** "Finish" checkbox bonus (+0.2x) */
  FINISH_BONUS: 20,
  /** First strike of the day bonus (+0.5x) */
  FIRST_STRIKE_OF_DAY_BONUS: 50,
  /** Guild challenge completion bonus (+0.3x) */
  GUILD_CHALLENGE_BONUS: 30,
  /** Penalty for majority own-team characters (reduces to 80% of score) */
  FRIENDLY_FIRE_MULTIPLIER: 0.8,
  /** Revenge bonus when avenging a strike (+0.25x) */
  REVENGE_BONUS: 25,
} as const;

// ============================================================================
// PICTOCASH
// ============================================================================

/** Available tip amounts in PictoCash */
export const TIP_AMOUNTS = [10, 25, 50, 100] as const;

/** PictoCash rewards for various actions */
export const PICTOCASH_REWARDS = {
  /** Base reward for submitting a strike */
  STRIKE_SUBMITTED: 10,
  /** Reward for receiving a strike */
  STRIKE_RECEIVED: 5,
  /** Reward for winning a checkpoint */
  CHECKPOINT_WIN: 50,
} as const;

// ============================================================================
// CONTENT LIMITS
// ============================================================================

export const LIMITS = {
  /** Max image dimension after client-side processing */
  IMAGE_MAX_DIMENSION: 1200,
  /** JPEG quality for processed images (0-100) */
  IMAGE_QUALITY: 80,
  /** Max length for strike messages */
  STRIKE_MESSAGE_MAX: 500,
  /** Max length for character name */
  CHARACTER_NAME_MAX: 50,
  /** Max length for character description */
  CHARACTER_DESCRIPTION_MAX: 2000,
  /** Max length for character design notes */
  CHARACTER_DESIGN_NOTES_MAX: 2000,
  /** Min length for username */
  USERNAME_MIN: 3,
  /** Max length for username */
  USERNAME_MAX: 20,
} as const;

// ============================================================================
// EVENT SETTINGS
// ============================================================================

/** Number of checkpoints for MVP (spec says 7 total, 3 for MVP) */
export const MVP_CHECKPOINT_COUNT = 3;

// ============================================================================
// GUILDS
// ============================================================================

export const GUILDS = {
  pixelweavers: {
    name: "Pixelweavers",
    description: "Digital artists",
  },
  traditionalists: {
    name: "Traditionalists",
    description: "Physical/traditional media artists",
  },
  wordwrights: {
    name: "Wordwrights",
    description: "Writers",
  },
  hybridisers: {
    name: "Hybridisers",
    description: "Mixed media artists",
  },
  sculptors: {
    name: "Sculptors",
    description: "3D artists",
  },
} as const;

// ============================================================================
// STRIKE TYPES
// ============================================================================

export const STRIKE_TYPES = {
  visual: {
    name: "Visual Art",
    description: "Digital or traditional 2D artwork",
  },
  writing: {
    name: "Writing",
    description: "Written fiction featuring characters",
  },
  sculpture: {
    name: "3D/Sculpture",
    description: "3D models, sculptures, or crafts",
  },
} as const;

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export const NOTIFICATION_TYPES = {
  STRIKE_RECEIVED: "strike_received",
  TIP_RECEIVED: "tip_received",
  CHECKPOINT_RESULT: "checkpoint_result",
  REPORT_RESOLVED: "report_resolved",
  ADMIN_BROADCAST: "admin_broadcast",
  ADMIN_MESSAGE: "admin_message",
} as const;
