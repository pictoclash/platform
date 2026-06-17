import { PictoModule } from "../primitives/picto-module";
import { TeamColors } from "../types";

type ActiveEvent = {
  id: string;
  name: string;
  description: string | null;
  team_a_name: string;
  team_a_color: string;
  team_b_name: string;
  team_b_color: string;
  starts_at: string;
  ends_at: string;
};

type Checkpoint = {
  id: string;
  name: string | null;
  is_revealed: boolean;
  scheduled_at: string;
  triggered_at: string | null;
  winning_team: string | null;
  winner_percentage: number | null;
};

interface StandingsModuleProps {
  colors: TeamColors;
  activeEvent: ActiveEvent;
  checkpoints: Checkpoint[];
  teamAWins: number;
  teamBWins: number;
  /** Hide the checkpoint details bar at the bottom */
  compact?: boolean;
}

/**
 * Stadium jumbotron-style standings display showing team scores and checkpoint progress.
 * Reusable across home page, event page, etc.
 */
export function StandingsModule({
  colors,
  activeEvent,
  checkpoints,
  teamAWins,
  teamBWins,
  compact = false,
}: StandingsModuleProps) {
  const nextCheckpoint = checkpoints.find((c) => !c.triggered_at);
  const totalCheckpoints = checkpoints.length || 7;

  let nextCheckpointTime = "No upcoming";
  if (nextCheckpoint) {
    const now = new Date();
    const scheduledAt = new Date(nextCheckpoint.scheduled_at);
    const diffMs = scheduledAt.getTime() - now.getTime();

    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      nextCheckpointTime = parts.join(" ") || "Soon";
    } else {
      nextCheckpointTime = "Processing...";
    }
  }

  return (
    <PictoModule noPadding>
      <section aria-labelledby="standings-title">
        {/* Jumbotron Header */}
        <div className="bg-black/30 border-b border-white/10 px-6 py-3">
          <p
            id="standings-title"
            className="font-mono text-sm text-white/70 uppercase text-center tracking-widest"
          >
            Current Clash Standings
          </p>
        </div>

        {/* Main Scoreboard */}
        <div
          className="flex items-stretch"
          role="img"
          aria-label={`${activeEvent.team_b_name}: ${teamBWins} checkpoint wins, ${activeEvent.team_a_name}: ${teamAWins} checkpoint wins`}
        >
          {/* Team B Side */}
          <div
            className="flex-1 py-4 px-3 sm:py-8 sm:px-6 flex flex-col items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.teamB}15 0%, transparent 60%)`,
            }}
          >
            <p
              className="font-mono text-sm sm:text-lg font-bold uppercase mb-1 sm:mb-2 truncate max-w-full"
              style={{ color: colors.teamB }}
            >
              {activeEvent.team_b_name}
            </p>
            <span
              className="font-array text-6xl sm:text-8xl md:text-9xl font-bold tabular-nums leading-none"
              style={{ color: colors.teamB, textShadow: `0 0 30px ${colors.teamBGlow}` }}
            >
              {teamBWins}
            </span>
            {/* Team B checkpoint dots */}
            <div className="flex gap-1 sm:gap-1.5 mt-2 sm:mt-4" aria-hidden="true">
              {Array.from({ length: totalCheckpoints }).map((_, i) => {
                const checkpoint = checkpoints[i];
                const isWin = checkpoint?.is_revealed && checkpoint?.winning_team === "b";
                return (
                  <div
                    key={i}
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm border sm:border-2 transition-all"
                    style={{
                      borderColor: colors.teamB,
                      backgroundColor: isWin ? colors.teamB : "transparent",
                      boxShadow: isWin ? `0 0 8px ${colors.teamBGlow}` : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Center Divider */}
          <div className="flex flex-col items-center justify-center px-2 sm:px-4 pt-12 sm:pt-20 py-4 sm:py-8">
            <span className="font-array text-4xl sm:text-6xl font-bold text-white/50" aria-hidden="true">
              VS
            </span>
            <div className="mt-2 sm:mt-4 text-center">
              <p className="font-mono text-[10px] sm:text-xs text-white/50 uppercase">Next</p>
              <p className="font-mono text-xs sm:text-sm text-white font-bold uppercase">
                {nextCheckpointTime}
              </p>
            </div>
          </div>

          {/* Team A Side */}
          <div
            className="flex-1 py-4 px-3 sm:py-8 sm:px-6 flex flex-col items-center justify-center"
            style={{
              background: `linear-gradient(225deg, ${colors.teamA}15 0%, transparent 60%)`,
            }}
          >
            <p
              className="font-mono text-sm sm:text-lg font-bold uppercase mb-1 sm:mb-2 truncate max-w-full"
              style={{ color: colors.teamA }}
            >
              {activeEvent.team_a_name}
            </p>
            <span
              className="font-array text-6xl sm:text-8xl md:text-9xl font-bold tabular-nums leading-none"
              style={{ color: colors.teamA, textShadow: `0 0 30px ${colors.teamAGlow}` }}
            >
              {teamAWins}
            </span>
            {/* Team A checkpoint dots */}
            <div className="flex gap-1 sm:gap-1.5 mt-2 sm:mt-4" aria-hidden="true">
              {Array.from({ length: totalCheckpoints }).map((_, i) => {
                const checkpoint = checkpoints[i];
                const isWin = checkpoint?.is_revealed && checkpoint?.winning_team === "a";
                return (
                  <div
                    key={i}
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm border sm:border-2 transition-all"
                    style={{
                      borderColor: colors.teamA,
                      backgroundColor: isWin ? colors.teamA : "transparent",
                      boxShadow: isWin ? `0 0 8px ${colors.teamAGlow}` : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Checkpoint Details Bar */}
        {!compact && (
          <div className="bg-black/30 border-t border-white/10 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-center gap-3 sm:gap-6 flex-wrap">
              {checkpoints.map((checkpoint, index) => {
                const num = index + 1;
                const isRevealed = checkpoint.is_revealed;
                const winner = checkpoint.winning_team;
                const winnerColor = winner === "a" ? colors.teamA : colors.teamB;

                return (
                  <div key={checkpoint.id} className="text-center min-w-0">
                    <p className="font-mono text-[10px] sm:text-xs text-white/50 uppercase">
                      {checkpoint.name || `CP${num}`}
                    </p>
                    {isRevealed ? (
                      <p className="font-mono text-xs sm:text-sm font-bold truncate" style={{ color: winnerColor }}>
                        {checkpoint.winner_percentage}%{" "}
                        <span className="hidden sm:inline">
                          {winner === "a" ? activeEvent.team_a_name : activeEvent.team_b_name}
                        </span>
                      </p>
                    ) : (
                      <p className="font-mono text-xs sm:text-sm text-white/30">—</p>
                    )}
                  </div>
                );
              })}
              {checkpoints.length === 0 && (
                <p className="font-mono text-xs sm:text-sm text-white/50 uppercase">
                  No checkpoints scheduled
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </PictoModule>
  );
}
