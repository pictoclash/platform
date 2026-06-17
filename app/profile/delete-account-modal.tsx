"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PictoModule, PictoText, PictoArrayText } from "@/components/picto";
import { deleteAccount } from "./actions";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPoints: number;
  teamColor: string;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  totalPoints,
  teamColor,
}: DeleteAccountModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteAccount(email);
      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "Failed to delete account");
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <PictoModule className="p-8 max-w-lg w-full">
        <PictoArrayText size="4xl" color="white" className="block mb-6">
          Delete Your Account?
        </PictoArrayText>

        <PictoText as="p" size="base" color="white" uppercase={false} className="mb-4">
          If you delete your account, the following things will happen:
        </PictoText>

        <ul className="space-y-3 mb-6">
          <li className="flex gap-2">
            <span className="text-white/60">•</span>
            <PictoText as="span" size="sm" color="white" uppercase={false}>
              Your account will be removed, and a notice will be shown to anyone trying to
              access it through a link.
            </PictoText>
          </li>
          <li className="flex gap-2">
            <span className="text-white/60">•</span>
            <PictoText as="span" size="sm" color="white" uppercase={false}>
              All your strikes and characters will be deleted.
            </PictoText>
          </li>
          <li className="flex gap-2">
            <span className="text-white/60">•</span>
            <PictoText as="span" size="sm" color="white" uppercase={false}>
              Points scored this checkpoint will be removed. Points made in previous
              checkpoints or clashes will however remain, as those can't be changed.
            </PictoText>
          </li>
          <li className="flex gap-2">
            <span className="text-white/60">•</span>
            <PictoText as="span" size="sm" color="white" uppercase={false}>
              Your username will be salted, meaning nobody else will be able to create an
              account with that name.
            </PictoText>
          </li>
        </ul>

        <PictoText as="p" size="sm" color="white" uppercase={false} className="mb-4 opacity-80">
          We're sorry to see you go and hope you had a nice time. If you'd like to delete
          your account, please type in your email below.
        </PictoText>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Type your email here..."
          className="w-full px-4 py-3 bg-[#333] border border-white/20 text-white font-mono placeholder:text-white/40 focus:outline-none focus:border-white/40 mb-4"
          disabled={isPending}
        />

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
            onClick={handleDelete}
            disabled={isPending || !email.trim()}
            className="flex-1 px-6 py-3 font-mono font-bold uppercase text-sm transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "#e91e63",
              color: "white",
            }}
          >
            {isPending ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </PictoModule>
    </div>
  );
}
