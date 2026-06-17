import { Trophy, Clock } from "lucide-react";
import { PictoModule } from "../primitives/picto-module";
import { PictoText } from "../primitives/picto-text";
import { PictoArrayText } from "../primitives/picto-array-text";
import { TeamColors } from "../types";

interface Checkpoint {
  id: string;
  name: string | null;
  is_revealed: boolean;
  scheduled_at: string;
  triggered_at: string | null;
  winning_team: string | null;
  winner_percentage: number | null;
  team_a_score?: number | null;
  team_b_score?: number | null;
}

interface CheckpointTimelineProps {
  checkpoints: Checkpoint[];
  teamAName: string;
  teamBName: string;
  colors: TeamColors;
}

/**
 * Timeline display of all checkpoints with results.
 * Shows winner, scores, and scheduled/pending states.
 */
export function CheckpointTimeline({
  checkpoints,
  teamAName,
  teamBName,
  colors,
}: CheckpointTimelineProps) {
  if (checkpoints.length === 0) return null;

  return (
    <PictoModule noPadding>
      <div className="bg-black/30 border-b border-white/10 px-4 py-2.5 sm:px-6 sm:py-3">
        <PictoText size="xs" color="white" weight="bold" className="sm:text-sm">
          CHECKPOINT TIMELINE
        </PictoText>
      </div>
      <div className="divide-y divide-white/5">
        {checkpoints.map((checkpoint, index) => (
          <CheckpointRow
            key={checkpoint.id}
            checkpoint={checkpoint}
            index={index}
            teamAName={teamAName}
            teamBName={teamBName}
            colors={colors}
          />
        ))}
      </div>
    </PictoModule>
  );
}

function CheckpointRow({
  checkpoint,
  index,
  teamAName,
  teamBName,
  colors,
}: {
  checkpoint: Checkpoint;
  index: number;
  teamAName: string;
  teamBName: string;
  colors: TeamColors;
}) {
  const isRevealed = checkpoint.is_revealed;
  const isPending = !checkpoint.triggered_at;
  const winnerColor = checkpoint.winning_team === "a" ? colors.teamA : colors.teamB;
  const winnerName = checkpoint.winning_team === "a" ? teamAName : teamBName;

  const scheduledDate = new Date(checkpoint.scheduled_at);
  const now = new Date();
  const isUpcoming = scheduledDate > now;

  return (
    <div className={`flex items-center gap-3 sm:gap-4 px-4 py-4 sm:px-6 sm:py-5 ${!isRevealed && !isPending ? "opacity-50" : ""}`}>
      {/* Checkpoint Number */}
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg flex-shrink-0"
        style={{
          backgroundColor: isRevealed ? `${winnerColor}20` : "#333",
          border: isRevealed ? `2px solid ${winnerColor}` : "2px solid #444",
        }}
      >
        <PictoArrayText
          size="3xl"
          color={isRevealed ? winnerColor : "#666"}
          tabularNums glow
          className="-translate-x-0.5 -translate-y-0.5 sm:text-4xl"
        >
          {index + 1}
        </PictoArrayText>
      </div>

      {/* Checkpoint Info */}
      <div className="flex-1 min-w-0">
        <PictoText size="sm" weight="bold" color="white" className="sm:text-base truncate">
          {checkpoint.name || `CHECKPOINT ${index + 1}`}
        </PictoText>
        <PictoText size="xs" muted className="block mt-0.5 sm:mt-1 text-[10px] sm:text-xs">
          {checkpoint.triggered_at
            ? new Date(checkpoint.triggered_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              }).toUpperCase()
            : isUpcoming
              ? `SCHEDULED: ${scheduledDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }).toUpperCase()}`
              : "PROCESSING..."}
        </PictoText>
      </div>

      {/* Result */}
      {isRevealed ? (
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
            <Trophy size={14} className="sm:w-4 sm:h-4" style={{ color: winnerColor }} />
            <PictoText size="xs" weight="bold" style={{ color: winnerColor }} className="sm:text-sm">
              {winnerName.toUpperCase()}
            </PictoText>
          </div>
          <PictoText size="xs" muted className="block mt-0.5 sm:mt-1 text-[10px] sm:text-xs">
            {checkpoint.winner_percentage}%
            <span className="hidden sm:inline">
              {checkpoint.team_a_score != null && checkpoint.team_b_score != null && ` • ${checkpoint.team_a_score} - ${checkpoint.team_b_score}`}
            </span>
          </PictoText>
        </div>
      ) : isPending ? (
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Clock size={14} className="sm:w-4 sm:h-4 text-white/30" />
          <PictoText size="xs" muted className="sm:text-sm">
            PENDING
          </PictoText>
        </div>
      ) : (
        <PictoText size="xs" muted className="sm:text-sm flex-shrink-0">
          AWAITING
        </PictoText>
      )}
    </div>
  );
}
