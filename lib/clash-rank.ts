/**
 * Clash Rank calculation logic
 *
 * Determines a player's letter grade based on their average score per strike.
 * TODO: This will need refinement later - consider factors like:
 * - Strike volume bonuses
 * - Consistency multipliers
 * - Guild-specific adjustments
 * - Time-based decay/freshness
 */

export type ClashGrade = "S" | "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";

/**
 * Grade thresholds based on average score per strike
 */
export const GRADE_THRESHOLDS = {
  S: 90,
  "A+": 80,
  A: 70,
  "B+": 60,
  B: 50,
  "C+": 40,
  C: 30,
  D: 20,
  F: 0,
} as const;

/**
 * Calculate letter grade based on average score
 */
export function getGrade(avgScore: number): ClashGrade {
  if (avgScore >= GRADE_THRESHOLDS.S) return "S";
  if (avgScore >= GRADE_THRESHOLDS["A+"]) return "A+";
  if (avgScore >= GRADE_THRESHOLDS.A) return "A";
  if (avgScore >= GRADE_THRESHOLDS["B+"]) return "B+";
  if (avgScore >= GRADE_THRESHOLDS.B) return "B";
  if (avgScore >= GRADE_THRESHOLDS["C+"]) return "C+";
  if (avgScore >= GRADE_THRESHOLDS.C) return "C";
  if (avgScore >= GRADE_THRESHOLDS.D) return "D";
  return "F";
}

/**
 * Get a user's clash grade, or a placeholder if they have no strikes
 */
export function getUserGrade(strikesSubmitted: number, avgScore: number): ClashGrade | "—" {
  return strikesSubmitted > 0 ? getGrade(avgScore) : "—";
}
