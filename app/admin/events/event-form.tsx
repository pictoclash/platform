"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createEvent, updateEvent, type EventInput } from "./actions";

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
};

export function EventForm({ event }: { event?: Event }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [teamAColor, setTeamAColor] = useState(event?.team_a_color || "#3B82F6");
  const [teamBColor, setTeamBColor] = useState(event?.team_b_color || "#EF4444");

  const isEditing = !!event;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: EventInput = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      team_a_name: formData.get("team_a_name") as string,
      team_a_color: formData.get("team_a_color") as string,
      team_b_name: formData.get("team_b_name") as string,
      team_b_color: formData.get("team_b_color") as string,
      starts_at: formData.get("starts_at") as string,
      ends_at: formData.get("ends_at") as string,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateEvent(event.id, data)
        : await createEvent(data);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/events");
      }
    });
  };

  // Format dates for datetime-local input
  const formatDateForInput = (date: string) => {
    return new Date(date).toISOString().slice(0, 16);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Event" : "Create Event"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the event details"
            : "Set up a new game event with custom teams"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={event?.name}
              placeholder="Winter Clash 2024"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={event?.description || ""}
              placeholder="A festive art battle..."
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Team A */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Team A</h3>
              <div className="space-y-2">
                <Label htmlFor="team_a_name">Team Name</Label>
                <Input
                  id="team_a_name"
                  name="team_a_name"
                  required
                  defaultValue={event?.team_a_name || ""}
                  placeholder="Snowflakes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team_a_color">Team Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="team_a_color"
                    name="team_a_color"
                    type="color"
                    required
                    value={teamAColor}
                    onChange={(e) => setTeamAColor(e.target.value)}
                    className="h-10 w-20 p-1"
                  />
                  <Input
                    type="text"
                    value={teamAColor}
                    onChange={(e) => setTeamAColor(e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Team B */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Team B</h3>
              <div className="space-y-2">
                <Label htmlFor="team_b_name">Team Name</Label>
                <Input
                  id="team_b_name"
                  name="team_b_name"
                  required
                  defaultValue={event?.team_b_name || ""}
                  placeholder="Embers"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team_b_color">Team Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="team_b_color"
                    name="team_b_color"
                    type="color"
                    required
                    value={teamBColor}
                    onChange={(e) => setTeamBColor(e.target.value)}
                    className="h-10 w-20 p-1"
                  />
                  <Input
                    type="text"
                    value={teamBColor}
                    onChange={(e) => setTeamBColor(e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Start Date & Time</Label>
              <Input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                required
                defaultValue={
                  event?.starts_at ? formatDateForInput(event.starts_at) : ""
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">End Date & Time</Label>
              <Input
                id="ends_at"
                name="ends_at"
                type="datetime-local"
                required
                defaultValue={
                  event?.ends_at ? formatDateForInput(event.ends_at) : ""
                }
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Event"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/events">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
