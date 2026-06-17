"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  activateEvent,
  deactivateEvent,
  deleteEvent,
  randomizeTeams,
  addAllUsersToEvent,
} from "../actions";

type Event = {
  id: string;
  name: string;
  is_active: boolean;
};

export function EventActions({ event }: { event: Event }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleActivate = () => {
    startTransition(async () => {
      await activateEvent(event.id);
    });
  };

  const handleDeactivate = () => {
    startTransition(async () => {
      await deactivateEvent(event.id);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteEvent(event.id);
      router.push("/admin/events");
    });
  };

  const handleRandomize = () => {
    startTransition(async () => {
      const result = await randomizeTeams(event.id);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage("Teams randomized!");
      }
      setTimeout(() => setMessage(null), 3000);
    });
  };

  const handleAddAll = () => {
    startTransition(async () => {
      const result = await addAllUsersToEvent(event.id);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage(`Added ${result.count} users!`);
      }
      setTimeout(() => setMessage(null), 3000);
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {message && (
          <span className="text-sm text-muted-foreground">{message}</span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isPending}>
              {isPending ? "..." : "Actions"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Event</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/admin/events/${event.id}/edit`}>Edit Event</Link>
            </DropdownMenuItem>
            {event.is_active ? (
              <DropdownMenuItem onClick={handleDeactivate}>
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={handleActivate} className="text-green-600">
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />

            <DropdownMenuLabel>Participants</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleAddAll}>
              Add All Users
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRandomize}>
              Randomize Teams
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="text-red-600"
            >
              Delete Event
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{event.name}&quot;? This will
              also remove all participant assignments. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
