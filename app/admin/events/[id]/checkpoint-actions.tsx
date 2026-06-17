"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  triggerCheckpoint,
  revealCheckpoint,
  deleteCheckpoint,
} from "../actions";

type Checkpoint = {
  id: string;
  name: string | null;
  scheduled_at: string;
  triggered_at: string | null;
  is_revealed: boolean;
  is_auto: boolean;
};

export function CheckpointActions({
  checkpoint,
  eventId,
}: {
  checkpoint: Checkpoint;
  eventId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleTrigger = () => {
    startTransition(async () => {
      await triggerCheckpoint(checkpoint.id, eventId);
    });
  };

  const handleReveal = () => {
    startTransition(async () => {
      await revealCheckpoint(checkpoint.id, eventId);
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this checkpoint?")) return;
    startTransition(async () => {
      await deleteCheckpoint(checkpoint.id, eventId);
    });
  };

  const canTrigger = !checkpoint.triggered_at;
  const canReveal = checkpoint.triggered_at && !checkpoint.is_revealed;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending}>
          {isPending ? "..." : "Actions"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canTrigger && (
          <DropdownMenuItem onClick={handleTrigger}>
            Trigger Now
          </DropdownMenuItem>
        )}
        {canReveal && (
          <DropdownMenuItem onClick={handleReveal}>
            Reveal Results
          </DropdownMenuItem>
        )}
        {canTrigger && (
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            Delete
          </DropdownMenuItem>
        )}
        {!canTrigger && !canReveal && (
          <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
