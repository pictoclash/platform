import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveEvent, getCheckpoints } from "@/lib/cache";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BroadcastNotification } from "./broadcast-notification";

type ActiveEvent = {
  id: string;
  name: string;
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
  scheduled_at: string;
  triggered_at: string | null;
  team_a_score: number | null;
  team_b_score: number | null;
  winning_team: "a" | "b" | null;
  is_revealed: boolean;
};

export default async function AdminPage() {
  const supabase = await createClient();

  // Batch 1: Get auth user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Batch 2: Get profile and all counts in parallel
  const [
    { data: profile },
    { count: userCount },
    { count: characterCount },
    { count: strikeCount },
    { count: reportCount },
    { count: bannedCount },
    activeEvent,
  ] = await Promise.all([
    supabase.from("profiles").select("is_admin, is_moderator").eq("id", user.id).single(),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("characters").select("*", { count: "exact", head: true }),
    supabase.from("strikes").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", false),
    getActiveEvent(), // Use cached query
  ]);

  if (!profile?.is_admin && !profile?.is_moderator) {
    redirect("/");
  }

  let teamAScore = 0;
  let teamBScore = 0;
  let teamAStrikes = 0;
  let teamBStrikes = 0;
  let teamAFighters = 0;
  let teamBFighters = 0;
  let checkpoints: Checkpoint[] = [];
  let teamAWins = 0;
  let teamBWins = 0;

  if (activeEvent) {
    // Batch 3: Get fighter counts, unclaimed strikes, and checkpoints in parallel
    const [{ count: aCount }, { count: bCount }, { data: strikes }, cpData] = await Promise.all([
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
      supabase.from("strikes").select("final_score, creator_id").is("checkpoint_id", null),
      getCheckpoints(activeEvent.id), // Use cached query
    ]);

    teamAFighters = aCount || 0;
    teamBFighters = bCount || 0;
    checkpoints = cpData as Checkpoint[];
    teamAWins = checkpoints.filter((cp) => cp.winning_team === "a").length;
    teamBWins = checkpoints.filter((cp) => cp.winning_team === "b").length;

    // Get participant team mapping for unclaimed strikes (only if there are strikes)
    const creatorIds = [...new Set(strikes?.map((s) => s.creator_id) || [])];
    if (creatorIds.length > 0) {
      const { data: participants } = await supabase
        .from("event_participants")
        .select("user_id, team")
        .eq("event_id", activeEvent.id)
        .in("user_id", creatorIds);

      const teamMap = new Map(participants?.map((p) => [p.user_id, p.team]) || []);

      for (const strike of strikes || []) {
        const team = teamMap.get(strike.creator_id);
        if (team === "a") {
          teamAScore += strike.final_score;
          teamAStrikes++;
        } else if (team === "b") {
          teamBScore += strike.final_score;
          teamBStrikes++;
        }
      }
    }
  }

  // Calculate total points (tallied + unclaimed)
  const teamATallied = checkpoints.reduce((sum, cp) => sum + (cp.team_a_score || 0), 0);
  const teamBTallied = checkpoints.reduce((sum, cp) => sum + (cp.team_b_score || 0), 0);
  const teamATotal = teamATallied + teamAScore;
  const teamBTotal = teamBTallied + teamBScore;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            {profile.is_admin ? "Administrator" : "Moderator"} access
          </p>
        </div>
        {profile.is_admin && <BroadcastNotification />}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Users</CardDescription>
            <CardTitle className="text-3xl">{userCount || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Banned</CardDescription>
            <CardTitle className="text-3xl">
              {bannedCount && bannedCount > 0 ? (
                <span className="text-red-600">{bannedCount}</span>
              ) : (
                <span className="text-muted-foreground">0</span>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Characters</CardDescription>
            <CardTitle className="text-3xl">{characterCount || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Strikes</CardDescription>
            <CardTitle className="text-3xl">{strikeCount || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Reports</CardDescription>
            <CardTitle className="text-3xl">
              {reportCount && reportCount > 0 ? (
                <Badge variant="destructive" className="text-lg">{reportCount}</Badge>
              ) : (
                <span className="text-muted-foreground">0</span>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Active Event */}
      {activeEvent ? (
        <Card className="mt-8">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600">Active Event</Badge>
                  <CardTitle>{activeEvent.name}</CardTitle>
                </div>
                <CardDescription className="mt-1">
                  {new Date(activeEvent.starts_at).toLocaleDateString()} - {new Date(activeEvent.ends_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/events/${activeEvent.id}`}>Manage</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Teams with scores */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: `${activeEvent.team_a_color}15` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: activeEvent.team_a_color }}
                  />
                  <span className="font-semibold" style={{ color: activeEvent.team_a_color }}>
                    {activeEvent.team_a_name}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-bold">{teamAWins}</p>
                    <p className="text-xs text-muted-foreground">Wins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{teamATotal}</p>
                    <p className="text-xs text-muted-foreground">Total Pts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{teamAFighters}</p>
                    <p className="text-xs text-muted-foreground">Fighters</p>
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {teamATallied} tallied + {teamAScore} pending
                </p>
              </div>

              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: `${activeEvent.team_b_color}15` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: activeEvent.team_b_color }}
                  />
                  <span className="font-semibold" style={{ color: activeEvent.team_b_color }}>
                    {activeEvent.team_b_name}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-bold">{teamBWins}</p>
                    <p className="text-xs text-muted-foreground">Wins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{teamBTotal}</p>
                    <p className="text-xs text-muted-foreground">Total Pts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{teamBFighters}</p>
                    <p className="text-xs text-muted-foreground">Fighters</p>
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {teamBTallied} tallied + {teamBScore} pending
                </p>
              </div>
            </div>

            {/* Checkpoints */}
            {checkpoints.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Checkpoints</p>
                <div className="flex flex-wrap gap-2">
                  {checkpoints.map((cp, i) => (
                    <div
                      key={cp.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
                    >
                      <span className="font-medium">{cp.name || `CP${i + 1}`}</span>
                      {cp.triggered_at ? (
                        cp.winning_team ? (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: cp.winning_team === "a" ? activeEvent.team_a_color : activeEvent.team_b_color,
                              color: cp.winning_team === "a" ? activeEvent.team_a_color : activeEvent.team_b_color,
                            }}
                          >
                            {cp.winning_team === "a" ? activeEvent.team_a_name : activeEvent.team_b_name}
                            {cp.is_revealed ? "" : " (hidden)"}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Tie</Badge>
                        )
                      ) : new Date(cp.scheduled_at) <= new Date() ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : (
                        <Badge variant="outline">
                          {new Date(cp.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-8 border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No active event</p>
            {profile.is_admin && (
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/admin/events">Manage Events</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/admin/users">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage users, roles, PictoCash</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/reports">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Review and resolve reports</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        {profile.is_admin && (
          <Link href="/admin/events">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>Events</CardTitle>
                <CardDescription>Create and manage events</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
