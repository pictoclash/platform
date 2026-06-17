"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PictoModule, PictoText } from "@/components/picto";
import { PictoButton, PictoArrayText } from "@/components/picto/primitives";
import { joinEvent } from "./actions";
import { Sparkles } from "lucide-react";

export function JoinEventButton({
  eventId,
  teamAName,
  teamAColor,
  teamBName,
  teamBColor,
}: {
  eventId: string;
  teamAName: string;
  teamAColor: string;
  teamBName: string;
  teamBColor: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success?: boolean;
    team?: "a" | "b";
    error?: string;
  } | null>(null);

  const handleJoin = (preferredTeam?: "a" | "b") => {
    startTransition(async () => {
      const res = await joinEvent(eventId, preferredTeam);
      if (res.success) {
        setResult({ success: true, team: res.team });
      } else {
        setResult({ error: res.error });
      }
    });
  };

  const handleClose = () => {
    setResult(null);
    if (result?.success) {
      router.refresh();
    }
  };

  // Show result modal
  if (result || isPending) {
    const teamColor = result?.team === "a" ? teamAColor : teamBColor;
    const teamName = result?.team === "a" ? teamAName : teamBName;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
        <PictoModule className="w-full max-w-md p-8 text-center">
          {isPending && (
            <>
              <div className="text-4xl mb-4 animate-bounce">🎲</div>
              <PictoText size="lg" weight="bold" color="white" className="block">
                FINDING YOUR TEAM...
              </PictoText>
            </>
          )}

          {result?.success && (
            <>
              <div className="mb-6">
                <Sparkles size={48} style={{ color: teamColor }} className="mx-auto" />
              </div>
              <PictoText size="sm" muted className="block">
                WELCOME TO
              </PictoText>
              <PictoArrayText size="4xl" color={teamColor} glow className="block mt-2">
                {teamName.toUpperCase()}
              </PictoArrayText>
              <PictoText size="sm" muted className="mt-6 block">
                CREATE STRIKES TO EARN POINTS FOR YOUR TEAM. GOOD LUCK!
              </PictoText>
              <div className="mt-8">
                <PictoButton onClick={handleClose} color={teamColor} size="md">
                  LET&apos;S GO!
                </PictoButton>
              </div>
            </>
          )}

          {result?.error && (
            <>
              <div className="text-4xl mb-4">😬</div>
              <PictoText size="lg" weight="bold" color="white" className="block">
                OOPS!
              </PictoText>
              <PictoText size="sm" color="#ff3b30" className="mt-4 block">
                {result.error}
              </PictoText>
              <div className="mt-8">
                <PictoButton onClick={handleClose} color="#ffffff" size="md">
                  CLOSE
                </PictoButton>
              </div>
            </>
          )}
        </PictoModule>
      </div>
    );
  }

  return (
    <>
      <PictoButton
        onClick={() => handleJoin("a")}
        disabled={isPending}
        color={teamAColor}
        variant="outline"
        size="md"
      >
        JOIN {teamAName.toUpperCase()}
      </PictoButton>
      <PictoButton
        onClick={() => handleJoin("b")}
        disabled={isPending}
        color={teamBColor}
        variant="outline"
        size="md"
      >
        JOIN {teamBName.toUpperCase()}
      </PictoButton>
      <PictoButton
        onClick={() => handleJoin()}
        disabled={isPending}
        color="#ffffff"
        size="md"
      >
        ASSIGN ME
      </PictoButton>
    </>
  );
}
