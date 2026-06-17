import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveEvent } from "@/lib/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserActions } from "./user-actions";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  team: "a" | "b" | null;
  pictocash: number;
  is_admin: boolean;
  is_moderator: boolean;
  is_active: boolean;
  created_at: string;
};

type ActiveEvent = {
  team_a_name: string;
  team_a_color: string;
  team_b_name: string;
  team_b_color: string;
} | null;

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Batch 1: Get auth user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Batch 2: Get profile, users, and active event in parallel
  const [{ data: profile }, { data: users }, activeEvent] = await Promise.all([
    supabase.from("profiles").select("is_admin, is_moderator").eq("id", user.id).single(),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    getActiveEvent(), // Use cached query
  ]);

  if (!profile?.is_admin && !profile?.is_moderator) {
    redirect("/");
  }

  const getTeamDisplay = (team: "a" | "b" | null) => {
    if (!team) return null;
    if (!activeEvent) return { name: `Team ${team.toUpperCase()}`, color: undefined };
    return team === "a"
      ? { name: activeEvent.team_a_name, color: activeEvent.team_a_color }
      : { name: activeEvent.team_b_name, color: activeEvent.team_b_color };
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>PictoCash</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u: Profile) => (
                <TableRow key={u.id} className={!u.is_active ? "opacity-50" : ""}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{u.display_name || u.username}</p>
                        {!u.is_active && (
                          <Badge variant="destructive" className="text-xs">Banned</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const teamDisplay = getTeamDisplay(u.team);
                      if (!teamDisplay) return <span className="text-muted-foreground">none</span>;
                      return (
                        <div className="flex items-center gap-2">
                          {teamDisplay.color && (
                            <span
                              className="inline-block h-3 w-3 rounded-full"
                              style={{ backgroundColor: teamDisplay.color }}
                            />
                          )}
                          <span>{teamDisplay.name}</span>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="font-mono">{u.pictocash}</TableCell>
                  <TableCell>
                    {u.is_admin ? (
                      <Badge className="bg-purple-600">Admin</Badge>
                    ) : u.is_moderator ? (
                      <Badge variant="outline">Mod</Badge>
                    ) : (
                      <span className="text-muted-foreground">User</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <UserActions
                      userId={u.id}
                      username={u.username}
                      isAdmin={u.is_admin}
                      isModerator={u.is_moderator}
                      isActive={u.is_active}
                      currentUserIsAdmin={profile.is_admin}
                      teamAName={activeEvent?.team_a_name}
                      teamAColor={activeEvent?.team_a_color}
                      teamBName={activeEvent?.team_b_name}
                      teamBColor={activeEvent?.team_b_color}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
