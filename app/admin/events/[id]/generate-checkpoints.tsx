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
import { generateCheckpoints } from "../actions";

export function GenerateCheckpoints({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(3);
  const [isAuto, setIsAuto] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (count < 1 || count > 20) {
      setError("Count must be between 1 and 20");
      return;
    }

    startTransition(async () => {
      const result = await generateCheckpoints(eventId, count, isAuto);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(`Created ${result.count} checkpoints!`);
        setTimeout(() => {
          setOpen(false);
          setSuccess(null);
        }, 1500);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Auto-Generate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Generate Checkpoints</DialogTitle>
            <DialogDescription>
              Automatically create evenly-spaced checkpoints throughout the
              event duration.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="count">Number of Checkpoints</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                Checkpoints will be evenly spaced from start to end of the
                event.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_auto"
                checked={isAuto}
                onCheckedChange={(checked) => setIsAuto(checked === true)}
              />
              <Label htmlFor="is_auto" className="text-sm font-normal">
                Auto-trigger at scheduled times
              </Label>
            </div>
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
              {isPending ? "Generating..." : `Generate ${count} Checkpoints`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
