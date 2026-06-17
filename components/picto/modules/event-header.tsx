import { Calendar, Timer, Users, Trophy } from "lucide-react";
import { PictoModule } from "../primitives/picto-module";
import { PictoText } from "../primitives/picto-text";
import { StatBox } from "./stat-box";

interface EventHeaderProps {
  name: string;
  description?: string | null;
  startsAt: Date;
  endsAt: Date;
  totalFighters: number;
  checkpointsRevealed: number;
  checkpointsTotal: number;
}

/**
 * Event header with name, status, and key stats.
 * Shows live indicator when event is active.
 */
export function EventHeader({
  name,
  description,
  startsAt,
  endsAt,
  totalFighters,
  checkpointsRevealed,
  checkpointsTotal,
}: EventHeaderProps) {
  const now = new Date();
  const hasStarted = now >= startsAt;
  const hasEnded = now >= endsAt;

  const getTimeDisplay = () => {
    if (hasEnded) {
      return { label: "EVENT ENDED", value: "COMPLETE" };
    }
    if (!hasStarted) {
      const diffMs = startsAt.getTime() - now.getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) return { label: "STARTS IN", value: `${days}D ${hours}H` };
      return { label: "STARTS IN", value: `${hours}H` };
    }
    const diffMs = endsAt.getTime() - now.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return { label: "TIME LEFT", value: `${days}D ${hours}H` };
    return { label: "TIME LEFT", value: `${hours}H` };
  };

  const timeDisplay = getTimeDisplay();
  const isLive = hasStarted && !hasEnded;

  return (
    <PictoModule noPadding>
      <div className="bg-black/30 border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <PictoText size="xs" muted className="block">
              {hasEnded ? "PAST EVENT" : hasStarted ? "LIVE EVENT" : "UPCOMING EVENT"}
            </PictoText>
            <PictoText size="lg" weight="bold" color="white" className="block mt-1 sm:hidden truncate">
              {name.toUpperCase()}
            </PictoText>
            <PictoText size="2xl" weight="bold" color="white" className="hidden sm:block mt-1">
              {name.toUpperCase()}
            </PictoText>
          </div>
          {isLive && (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-3">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#00ff47] rounded-full animate-pulse" />
              <PictoText size="xs" color="#00ff47" weight="bold" className="sm:hidden">
                LIVE
              </PictoText>
              <PictoText size="sm" color="#00ff47" weight="bold" className="hidden sm:block">
                LIVE
              </PictoText>
            </div>
          )}
        </div>
        {description && (
          <PictoText size="xs" muted className="mt-2 block sm:hidden" uppercase={false}>
            {description}
          </PictoText>
        )}
        {description && (
          <PictoText size="sm" muted className="mt-2 hidden sm:block" uppercase={false}>
            {description}
          </PictoText>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10">
        <StatBox
          icon={<Calendar size={18} />}
          label="STARTED"
          value={startsAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}
        />
        <StatBox
          icon={<Timer size={18} />}
          label={timeDisplay.label}
          value={timeDisplay.value}
          highlight={isLive}
        />
        <StatBox
          icon={<Users size={18} />}
          label="FIGHTERS"
          value={totalFighters.toString()}
        />
        <StatBox
          icon={<Trophy size={18} />}
          label="CHECKPOINTS"
          value={`${checkpointsRevealed}/${checkpointsTotal}`}
        />
      </div>
    </PictoModule>
  );
}
