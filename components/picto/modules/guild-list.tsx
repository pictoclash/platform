import { cn } from "@/lib/utils";
import { TeamColors } from "../types";

interface Guild {
  name: string;
  description: string;
}

const GUILDS: Guild[] = [
  { name: "Pixelweavers", description: "Digital Artists" },
  { name: "Traditionalists", description: "Physical Media" },
  { name: "Wordwrights", description: "Writers" },
  { name: "Hybridisers", description: "Mixed Media" },
  { name: "Sculptors", description: "3D Artists" },
];

interface GuildItemProps {
  guild: Guild;
  color: string;
  className?: string;
}

/**
 * Individual guild display with colored name
 */
export function GuildItem({ guild, color, className }: GuildItemProps) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <h4
        className="font-mono text-sm font-bold"
        style={{ color }}
      >
        {guild.name}
      </h4>
      <p
        className="font-mono text-xs text-white/50"
      >
        {guild.description}
      </p>
    </div>
  );
}

interface GuildListProps {
  colors: TeamColors;
  className?: string;
}

/**
 * List of all five guilds with alternating team colors
 */
export function GuildList({ colors, className }: GuildListProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-8 gap-y-5", className)}>
      {GUILDS.map((guild, index) => (
        <GuildItem
          key={guild.name}
          guild={guild}
          color={index % 2 === 0 ? colors.teamA : colors.teamB}
        />
      ))}
    </div>
  );
}

/**
 * Get the list of guilds for custom rendering
 */
export function getGuilds(): Guild[] {
  return GUILDS;
}
