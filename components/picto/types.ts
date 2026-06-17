// Shared types for PictoClash themed components

export interface TeamColors {
  teamA: string;
  teamB: string;
  teamAGlow?: string;
  teamBGlow?: string;
}

export interface ActiveEventColors {
  team_a_color: string;
  team_b_color: string;
  team_a_name?: string;
  team_b_name?: string;
}

// Default/fallback colors when no event is active
export const DEFAULT_COLORS: TeamColors = {
  teamA: "#00ff47",
  teamB: "#ff668b",
  teamAGlow: "#00ff4780",
  teamBGlow: "#ff668b80",
};

export function getTeamColors(event: ActiveEventColors | null): TeamColors {
  if (!event) return DEFAULT_COLORS;
  return {
    teamA: event.team_a_color,
    teamB: event.team_b_color,
    teamAGlow: `${event.team_a_color}80`,
    teamBGlow: `${event.team_b_color}80`,
  };
}
