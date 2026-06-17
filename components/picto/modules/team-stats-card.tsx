import { PictoModule } from "../primitives/picto-module";
import { PictoText } from "../primitives/picto-text";
import { PictoArrayText } from "../primitives/picto-array-text";

interface TeamStatsCardProps {
  teamName: string;
  color: string;
  glowColor: string;
  wins: number;
  fighters: number;
  isUserTeam?: boolean;
}

/**
 * Team statistics card showing checkpoint wins and fighter count.
 * Highlights if it's the current user's team.
 */
export function TeamStatsCard({
  teamName,
  color,
  glowColor,
  wins,
  fighters,
  isUserTeam = false,
}: TeamStatsCardProps) {
  return (
    <PictoModule
      noPadding
      className="overflow-hidden"
      style={{ border: isUserTeam ? `2px solid ${color}` : undefined }}
    >
      <div
        className="px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10"
        style={{ background: `linear-gradient(135deg, ${color}20 0%, transparent 60%)` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: color, boxShadow: `0 0 10px ${glowColor}` }}
            />
            <PictoText size="base" weight="bold" style={{ color }} className="sm:text-lg truncate">
              {teamName.toUpperCase()}
            </PictoText>
          </div>
          {isUserTeam && (
            <PictoText size="xs" color={color} weight="bold" className="flex-shrink-0 ml-2">
              YOUR TEAM
            </PictoText>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-white/10">
        <div className="px-3 py-4 sm:px-6 sm:py-6 text-center">
          <PictoArrayText size="3xl" color={color} glow tabularNums className="sm:text-4xl">
            {wins}
          </PictoArrayText>
          <PictoText size="xs" muted className="block mt-1.5 sm:mt-2 text-[10px] sm:text-xs">
            CHECKPOINT WINS
          </PictoText>
        </div>
        <div className="px-3 py-4 sm:px-6 sm:py-6 text-center">
          <PictoArrayText size="3xl" narrow color="white" tabularNums className="sm:text-4xl">
            {fighters}
          </PictoArrayText>
          <PictoText size="xs" muted className="block mt-1.5 sm:mt-2 text-[10px] sm:text-xs">
            FIGHTERS
          </PictoText>
        </div>
      </div>
    </PictoModule>
  );
}
