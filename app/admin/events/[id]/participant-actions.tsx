"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { assignUserToTeam, removeUserFromEvent } from "../actions";

type Participant = {
  id: string;
  user_id: string;
  team: "a" | "b";
};

export function ParticipantActions({
  eventId,
  participant,
  teamAName,
  teamBName,
}: {
  eventId: string;
  participant: Participant;
  teamAName: string;
  teamBName: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSwapTeam = () => {
    const newTeam = participant.team === "a" ? "b" : "a";
    startTransition(async () => {
      await assignUserToTeam(eventId, participant.user_id, newTeam);
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeUserFromEvent(eventId, participant.user_id);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending}>
          {isPending ? "..." : "..."}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleSwapTeam}>
          Move to {participant.team === "a" ? teamBName : teamAName}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRemove} className="text-red-600">
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
