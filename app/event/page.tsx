import { createClient } from "@/lib/supabase/server";
import { getActiveEvent, getCheckpoints } from "@/lib/cache";
import {
  PictoModule,
  PictoText,
  StandingsModule,
  EventHeader,
  TeamStatsCard,
  CheckpointTimeline,
  JoinSection,
  getTeamColors,
} from "@/components/picto";
import { PictoButton } from "@/components/picto/primitives";
import { JoinEventButton } from "./join-button";
import { processAutoCheckpoints } from "@/app/admin/events/actions";

type CachedCheckpoint = {
  id: string;
  name: string | null;
  is_revealed: boolean;
  winning_team: string | null;
  team_a_score: number | null;
  team_b_score: number | null;
  scheduled_at: string;
  triggered_at: string | null;
};

type ProcessedCheckpoint = {
  id: string;
  name: string | null;
  is_revealed: boolean;
  scheduled_at: string;
  triggered_at: string | null;
  winning_team: string | null;
  winner_percentage: number | null;
  team_a_score?: number | null;
  team_b_score?: number | null;
};

export default async function EventPage() {
  const supabase = await createClient();

  // Process any due auto-checkpoints
  await processAutoCheckpoints();

  // Batch 1: Get auth and active event in parallel
  const [{ data: { user } }, activeEvent] = await Promise.all([
    supabase.auth.getUser(),
    getActiveEvent(),
  ]);

  const colors = getTeamColors(activeEvent);

  if (!activeEvent) {
    return (
      <div className="min-h-screen bg-[#c5c5c5]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <PictoModule className="p-12 text-center">
            <div className="text-6xl mb-4">💤</div>
            <PictoText size="2xl" weight="bold" color="white" className="block">
              NO ACTIVE EVENT
            </PictoText>
            <PictoText size="sm" muted className="mt-2 block">
              CHECK BACK SOON FOR THE NEXT CLASH!
            </PictoText>
            <div className="mt-8">
              <PictoButton href="/" color="#ffffff" size="md">
                BACK TO HOME
              </PictoButton>
            </div>
          </PictoModule>
        </div>
      </div>
    );
  }

  // Batch 2: Get team counts, user participation, and checkpoints in parallel
  const [
    { count: teamACount },
    { count: teamBCount },
    userParticipationResult,
    allCheckpoints,
  ] = await Promise.all([
    supabase
      .from("event_participants")
      .select("*", { count: "exact", head: true })
      .eq("event_id", activeEvent.id)
      .eq("team", "a"),
    supabase
      .from("event_participants")
      .select("*", { count: "exact", head: true })
      .eq("event_id", activeEvent.id)
      .eq("team", "b"),
    user
      ? supabase
          .from("event_participants")
          .select("team")
          .eq("event_id", activeEvent.id)
          .eq("user_id", user.id)
          .single()
      : Promise.resolve({ data: null }),
    getCheckpoints(activeEvent.id),
  ]);

  const userParticipation = userParticipationResult.data as { team: "a" | "b" } | null;

  // Process checkpoints
  const checkpoints: ProcessedCheckpoint[] = (allCheckpoints as CachedCheckpoint[]).map((cp) => {
    let winner_percentage: number | null = null;
    if (cp.is_revealed && cp.team_a_score !== null && cp.team_b_score !== null) {
      const total = cp.team_a_score + cp.team_b_score;
      if (total > 0 && cp.winning_team) {
        const winnerScore = cp.winning_team === "a" ? cp.team_a_score : cp.team_b_score;
        winner_percentage = Math.round((winnerScore / total) * 100);
      }
    }
    return {
      id: cp.id,
      name: cp.name,
      is_revealed: cp.is_revealed,
      scheduled_at: cp.scheduled_at,
      triggered_at: cp.triggered_at,
      winning_team: cp.is_revealed ? cp.winning_team : null,
      winner_percentage,
      team_a_score: cp.is_revealed ? cp.team_a_score : null,
      team_b_score: cp.is_revealed ? cp.team_b_score : null,
    };
  });

  // For StandingsModule - sanitized version
  const standingsCheckpoints = checkpoints.map((cp) => ({
    id: cp.id,
    name: cp.name,
    is_revealed: cp.is_revealed,
    scheduled_at: cp.scheduled_at,
    triggered_at: cp.triggered_at,
    winning_team: cp.winning_team,
    winner_percentage: cp.winner_percentage,
  }));

  const teamAWins = checkpoints.filter((cp) => cp.is_revealed && cp.winning_team === "a").length;
  const teamBWins = checkpoints.filter((cp) => cp.is_revealed && cp.winning_team === "b").length;

  const startsAt = new Date(activeEvent.starts_at);
  const endsAt = new Date(activeEvent.ends_at);
  const now = new Date();
  const hasEnded = now >= endsAt;
  const totalFighters = (teamACount || 0) + (teamBCount || 0);
  const checkpointsRevealed = checkpoints.filter((c) => c.is_revealed).length;

  return (
    <div className="min-h-screen bg-[#c5c5c5]">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Event Header */}
        <EventHeader
          name={activeEvent.name}
          description={activeEvent.description}
          startsAt={startsAt}
          endsAt={endsAt}
          totalFighters={totalFighters}
          checkpointsRevealed={checkpointsRevealed}
          checkpointsTotal={checkpoints.length}
        />

        {/* Standings */}
        <StandingsModule
          colors={colors}
          activeEvent={activeEvent}
          checkpoints={standingsCheckpoints}
          teamAWins={teamAWins}
          teamBWins={teamBWins}
          compact
        />

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TeamStatsCard
            teamName={activeEvent.team_a_name}
            color={colors.teamA}
            glowColor={colors.teamAGlow || `${colors.teamA}80`}
            wins={teamAWins}
            fighters={teamACount || 0}
            isUserTeam={userParticipation?.team === "a"}
          />
          <TeamStatsCard
            teamName={activeEvent.team_b_name}
            color={colors.teamB}
            glowColor={colors.teamBGlow || `${colors.teamB}80`}
            wins={teamBWins}
            fighters={teamBCount || 0}
            isUserTeam={userParticipation?.team === "b"}
          />
        </div>

        {/* Checkpoint Timeline */}
        <CheckpointTimeline
          checkpoints={checkpoints}
          teamAName={activeEvent.team_a_name}
          teamBName={activeEvent.team_b_name}
          colors={colors}
        />
        
        {/* Join Section */}
        <JoinSection
          user={user}
          userTeam={userParticipation?.team || null}
          eventId={activeEvent.id}
          teamAName={activeEvent.team_a_name}
          teamBName={activeEvent.team_b_name}
          colors={colors}
          hasEnded={hasEnded}
          JoinButton={JoinEventButton}
        />

      </div>
    </div>
  );
}
