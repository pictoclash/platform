import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EventActions } from "./event-actions";
import { ParticipantActions } from "./participant-actions";
import { CheckpointForm } from "./checkpoint-form";
import { CheckpointActions } from "./checkpoint-actions";
import { GenerateCheckpoints } from "./generate-checkpoints";

type Event = {
  id: string;
  name: string;
  description: string | null;
  team_a_name: string;
  team_a_color: string;
  team_b_name: string;
  team_b_color: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

type Participant = {
  id: string;
  user_id: string;
  team: "a" | "b";
  joined_at: string;
  profile: {
    username: string;
    display_name: string | null;
  } | null;
};

type Checkpoint = {
  id: string;
  name: string | null;
  scheduled_at: string;
  triggered_at: string | null;
  team_a_score: number | null;
  team_b_score: number | null;
  winning_team: "a" | "b" | null;
  margin_percentage: number | null;
  is_revealed: boolean;
  is_auto: boolean;
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/admin");
  }

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single<Event>();

  if (!event) {
    notFound();
  }

  // Get participants with their profiles
  const { data: participantsRaw } = await supabase
    .from("event_participants")
    .select("id, user_id, team, joined_at")
    .eq("event_id", id)
    .order("joined_at", { ascending: true });

  // Get profile info for participants
  const userIds = participantsRaw?.map((p) => p.user_id) || [];
  const { data: profiles } = userIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", userIds)
    : { data: [] };

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

  const participants: Participant[] = (participantsRaw || []).map((p) => ({
    ...p,
    profile: profileMap.get(p.user_id) || null,
  }));

  const teamA = participants.filter((p) => p.team === "a");
  const teamB = participants.filter((p) => p.team === "b");

  // Get checkpoints
  const { data: checkpoints } = await supabase
    .from("checkpoints")
    .select("*")
    .eq("event_id", id)
    .order("scheduled_at", { ascending: true }) as { data: Checkpoint[] | null };

  // Calculate current unclaimed scores (for admin view)
  const { data: strikes } = await supabase
    .from("strikes")
    .select("final_score, creator_id")
    .is("checkpoint_id", null);

  const creatorIds = [...new Set(strikes?.map((s) => s.creator_id) || [])];
  const { data: strikeParticipants } = creatorIds.length > 0
    ? await supabase
        .from("event_participants")
        .select("user_id, team")
        .eq("event_id", id)
        .in("user_id", creatorIds)
    : { data: [] };

  const teamScoreMap = new Map(strikeParticipants?.map((p) => [p.user_id, p.team]) || []);

  let currentTeamAScore = 0;
  let currentTeamBScore = 0;
  let currentTeamAStrikes = 0;
  let currentTeamBStrikes = 0;

  for (const strike of strikes || []) {
    const team = teamScoreMap.get(strike.creator_id);
    if (team === "a") {
      currentTeamAScore += strike.final_score;
      currentTeamAStrikes++;
    } else if (team === "b") {
      currentTeamBScore += strike.final_score;
      currentTeamBStrikes++;
    }
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <div className="mb-6">
        <Link
          href="/admin/events"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Events
        </Link>
      </div>

      {/* Event Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{event.name}</CardTitle>
                {event.is_active ? (
                  <Badge className="bg-green-600">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              {event.description && (
                <CardDescription className="mt-2">
                  {event.description}
                </CardDescription>
              )}
            </div>
            <EventActions event={event} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Teams</p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="inline-block h-4 w-4 rounded-full"
                  style={{ backgroundColor: event.team_a_color }}
                />
                <span className="font-medium">{event.team_a_name}</span>
                <span className="text-muted-foreground">vs</span>
                <span
                  className="inline-block h-4 w-4 rounded-full"
                  style={{ backgroundColor: event.team_b_color }}
                />
                <span className="font-medium">{event.team_b_name}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="mt-1 font-medium">
                {new Date(event.starts_at).toLocaleDateString()} -{" "}
                {new Date(event.ends_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="mt-1 font-medium">
                {participants.length} total ({teamA.length} vs {teamB.length})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Scores (Admin Only) */}
      <Card className="mb-6 border-dashed">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Current Scores</CardTitle>
            <Badge variant="outline" className="text-xs">Admin Only</Badge>
          </div>
          <CardDescription>
            Live scores from unclaimed strikes (not yet assigned to a checkpoint)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div
              className="rounded-lg p-4 text-center"
              style={{ backgroundColor: `${event.team_a_color}15` }}
            >
              <div className="flex items-center justify-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: event.team_a_color }}
                />
                <span className="font-medium" style={{ color: event.team_a_color }}>
                  {event.team_a_name}
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold">{currentTeamAScore}</p>
              <p className="text-sm text-muted-foreground">
                {currentTeamAStrikes} strike{currentTeamAStrikes !== 1 ? "s" : ""}
              </p>
            </div>
            <div
              className="rounded-lg p-4 text-center"
              style={{ backgroundColor: `${event.team_b_color}15` }}
            >
              <div className="flex items-center justify-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: event.team_b_color }}
                />
                <span className="font-medium" style={{ color: event.team_b_color }}>
                  {event.team_b_name}
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold">{currentTeamBScore}</p>
              <p className="text-sm text-muted-foreground">
                {currentTeamBStrikes} strike{currentTeamBStrikes !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {currentTeamAScore === 0 && currentTeamBScore === 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              No unclaimed strikes yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Teams */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Team A */}
        <Card>
          <CardHeader
            className="border-b"
            style={{ backgroundColor: `${event.team_a_color}15` }}
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-4 rounded-full"
                style={{ backgroundColor: event.team_a_color }}
              />
              <CardTitle>{event.team_a_name}</CardTitle>
              <Badge variant="outline">{teamA.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableBody>
                {teamA.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {p.profile?.display_name || p.profile?.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{p.profile?.username}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <ParticipantActions
                        eventId={id}
                        participant={p}
                        teamAName={event.team_a_name}
                        teamBName={event.team_b_name}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {teamA.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground py-8"
                    >
                      No participants yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Team B */}
        <Card>
          <CardHeader
            className="border-b"
            style={{ backgroundColor: `${event.team_b_color}15` }}
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-4 rounded-full"
                style={{ backgroundColor: event.team_b_color }}
              />
              <CardTitle>{event.team_b_name}</CardTitle>
              <Badge variant="outline">{teamB.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableBody>
                {teamB.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {p.profile?.display_name || p.profile?.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{p.profile?.username}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <ParticipantActions
                        eventId={id}
                        participant={p}
                        teamAName={event.team_a_name}
                        teamBName={event.team_b_name}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {teamB.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground py-8"
                    >
                      No participants yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Checkpoints Section */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Checkpoints</CardTitle>
              <CardDescription>
                Checkpoints tally scores and determine round winners. The team with the most checkpoint wins at the end wins the event.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <GenerateCheckpoints eventId={id} />
              <CheckpointForm eventId={id} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Checkpoint</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkpoints?.map((cp, index) => (
                <TableRow key={cp.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {cp.name || `Checkpoint ${index + 1}`}
                      </p>
                      {cp.is_auto && (
                        <span className="text-xs text-muted-foreground">Auto-trigger</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(cp.scheduled_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    {cp.triggered_at ? (
                      cp.is_revealed ? (
                        <Badge className="bg-green-600">Revealed</Badge>
                      ) : (
                        <Badge variant="secondary">Triggered</Badge>
                      )
                    ) : new Date(cp.scheduled_at) <= new Date() ? (
                      <Badge variant="destructive">Overdue</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {cp.triggered_at ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: event.team_a_color }}
                        />
                        <span className="font-mono text-sm">{cp.team_a_score}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-mono text-sm">{cp.team_b_score}</span>
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: event.team_b_color }}
                        />
                        {cp.winning_team && (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: cp.winning_team === "a" ? event.team_a_color : event.team_b_color,
                              color: cp.winning_team === "a" ? event.team_a_color : event.team_b_color,
                            }}
                          >
                            {cp.winning_team === "a" ? event.team_a_name : event.team_b_name} +{cp.margin_percentage}%
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <CheckpointActions checkpoint={cp} eventId={id} />
                  </TableCell>
                </TableRow>
              ))}
              {(!checkpoints || checkpoints.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No checkpoints yet. Add checkpoints to track scoring periods.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
