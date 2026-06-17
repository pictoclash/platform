import { PictoArrayText } from "../primitives/picto-array-text";
import { PictoModule } from "../primitives/picto-module";

export interface ClashRankStats {
  pointsScored: number;
  strikesSubmitted: number;
  avgScore: number;
}

interface ClashRankModuleProps {
  username: string;
  grade: string;
  stats: ClashRankStats;
  teamColor: string;
}

/**
 * Clash Rank Module - displays user's grade and strike statistics
 * Used on the main page dashboard and profile page
 */
export function ClashRankModule({
  username,
  grade,
  stats,
  teamColor,
}: ClashRankModuleProps) {
  return (
    <PictoModule>
      <section aria-labelledby="rank-title">
        {/* Grade Display */}
        <div className="flex justify-center mb-4">
          <PictoArrayText
            size="8xl"
            color={teamColor}
            glow
            aria-label={`Grade: ${grade}`}
          >
            {grade}
          </PictoArrayText>
        </div>

        <h2 id="rank-title" className="font-mono text-lg font-bold text-white uppercase text-center">
          {username}&apos;s Clash Rank
        </h2>

        {/* Stats */}
        <dl className="mt-6 space-y-2">
          <div className="flex justify-between items-center">
            <dt className="font-mono text-base text-white uppercase">Points Scored</dt>
            <dd className="font-mono text-base tabular-nums" style={{ color: teamColor }}>{stats.pointsScored}</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-mono text-base text-white uppercase">Strikes Submitted</dt>
            <dd className="font-mono text-base tabular-nums" style={{ color: teamColor }}>{stats.strikesSubmitted}</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-mono text-base text-white uppercase">Avg Score per Strike</dt>
            <dd className="font-mono text-base tabular-nums" style={{ color: teamColor }}>{stats.avgScore}</dd>
          </div>
        </dl>
      </section>
    </PictoModule>
  );
}
