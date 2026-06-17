"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCheckpoint } from "../actions";

export function CheckpointForm({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isAuto, setIsAuto] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!scheduledAt) {
      setError("Scheduled time is required");
      return;
    }

    startTransition(async () => {
      const result = await createCheckpoint(eventId, {
        name: name || undefined,
        scheduled_at: scheduledAt,
        is_auto: isAuto,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setName("");
        setScheduledAt("");
        setIsAuto(true);
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">+ Add Checkpoint</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Checkpoint</DialogTitle>
            <DialogDescription>
              Create a new checkpoint for this event. Checkpoints tally scores
              and determine round winners.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Midweek Check-in, Final Showdown"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Scheduled Time</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_auto"
                checked={isAuto}
                onCheckedChange={(checked) => setIsAuto(checked === true)}
              />
              <Label htmlFor="is_auto" className="text-sm font-normal">
                Auto-trigger at scheduled time
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              If disabled, you&apos;ll need to manually trigger this checkpoint.
            </p>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Checkpoint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
