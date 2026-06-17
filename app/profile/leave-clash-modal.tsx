"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PictoModule, PictoText, PictoArrayText } from "@/components/picto";
import { leaveClash } from "./actions";

interface LeaveClashModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPoints: number;
  teamColor: string;
}

export function LeaveClashModal({
  isOpen,
  onClose,
  totalPoints,
  teamColor,
}: LeaveClashModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLeave = () => {
    setError(null);
    startTransition(async () => {
      const result = await leaveClash();
      if (result.success) {
        router.refresh();
        router.push("/");
      } else {
        setError(result.error || "Failed to leave the clash");
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <PictoModule className="p-8 max-w-lg w-full">
        <PictoArrayText size="4xl" color="white" className="block mb-6">
          Leave the Clash?
        </PictoArrayText>

        <PictoText as="p" size="base" color="white" uppercase={false} className="mb-4">
          If you leave the current clash, the following things will happen:
        </PictoText>

        <ul className="space-y-3 mb-6">
          <li className="flex gap-2">
            <span className="text-white/60">•</span>
            <PictoText as="span" size="sm" color="white" uppercase={false}>
              All your strikes made this checkpoint will be set to teamless. They won't be
              deleted, but won't count towards your team's strikes.
            </PictoText>
          </li>
          <li className="flex gap-2">
            <span className="text-white/60">•</span>
            <PictoText as="span" size="sm" color="white" uppercase={false}>
              All points earned this checkpoint and won't count towards your current team.
              In your case, that's {totalPoints.toLocaleString()} points.
            </PictoText>
          </li>
          <li className="flex gap-2">
            <span className="text-white/60">•</span>
            <PictoText as="span" size="sm" color="white" uppercase={false}>
              You will be able to edit your characters' details and add new ones. You'll
              also be able to switch guilds.
            </PictoText>
          </li>
          <li className="flex gap-2">
            <span className="text-white/60">•</span>
            <PictoText as="span" size="sm" color="white" uppercase={false}>
              You can rejoin the clash at any time, on any team you'd like. If you rejoin
              the same team, you won't get your points or strikes back.
            </PictoText>
          </li>
        </ul>

        {error && (
          <PictoText size="sm" color="#ef4444" className="block mb-4">
            {error}
          </PictoText>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-6 py-3 font-mono font-bold uppercase text-sm bg-white text-[#202020] hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            Stay in the Clash
          </button>
          <button
            onClick={handleLeave}
            disabled={isPending}
            className="flex-1 px-6 py-3 font-mono font-bold uppercase text-sm transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "#e91e63",
              color: "white",
            }}
          >
            {isPending ? "Leaving..." : "Leave the Clash"}
          </button>
        </div>
      </PictoModule>
    </div>
  );
}
