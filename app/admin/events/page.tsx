import { redirect } from "next/navigation";
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
  created_at: string;
};

export default async function AdminEventsPage() {
  const supabase = await createClient();

  // Batch 1: Get auth user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Batch 2: Get profile and events in parallel
  const [{ data: profile }, { data: events }] = await Promise.all([
    supabase.from("profiles").select("is_admin").eq("id", user.id).single(),
    supabase.from("events").select("*").order("created_at", { ascending: false }),
  ]);

  if (!profile?.is_admin) {
    redirect("/admin");
  }

  // Batch 3: Get participant counts for all events
  const eventIds = events?.map((e) => e.id) || [];
  const { data: participantCounts } = eventIds.length > 0
    ? await supabase.from("event_participants").select("event_id").in("event_id", eventIds)
    : { data: [] };

  const countMap = new Map<string, number>();
  participantCounts?.forEach((p) => {
    countMap.set(p.event_id, (countMap.get(p.event_id) || 0) + 1);
  });

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">Manage game events and teams</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">Create Event</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.map((event: Event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{event.name}</p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: event.team_a_color }}
                      />
                      <span className="text-sm">{event.team_a_name}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: event.team_b_color }}
                      />
                      <span className="text-sm">{event.team_b_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(event.starts_at).toLocaleDateString()}</p>
                      <p className="text-muted-foreground">
                        to {new Date(event.ends_at).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">{countMap.get(event.id) || 0}</span>
                  </TableCell>
                  <TableCell>
                    {event.is_active ? (
                      <Badge className="bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/events/${event.id}`}>Manage</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!events || events.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No events yet. Create your first event to get started.
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
