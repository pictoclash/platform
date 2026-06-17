"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register, type AuthResult } from "../actions";
import { PictoModule, PictoText } from "@/components/picto";
import { PictoButton } from "@/components/picto/primitives/picto-button";

const initialState: AuthResult = { success: false };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(
    async (_prevState: AuthResult, formData: FormData) => {
      return await register(formData);
    },
    initialState
  );

  return (
    <div className="min-h-screen bg-[#c5c5c5] flex items-center justify-center px-4 py-8 sm:py-12">
      <PictoModule className="w-full max-w-md p-5 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <PictoText size="xl" weight="bold" color="white" className="block sm:hidden">
            JOIN THE CLASH
          </PictoText>
          <PictoText size="2xl" weight="bold" color="white" className="hidden sm:block">
            JOIN THE CLASH
          </PictoText>
          <PictoText size="xs" muted className="mt-2 sm:hidden">
            CREATE YOUR PICTOCLASH ACCOUNT
          </PictoText>
          <PictoText size="sm" muted className="mt-2 hidden sm:block">
            CREATE YOUR PICTOCLASH ACCOUNT
          </PictoText>
        </div>

        <form action={formAction} className="space-y-5">
          {state.error && (
            <div className="p-3 bg-[#ff3b30]/20 border border-[#ff3b30]/50">
              <PictoText size="sm" color="#ff3b30">
                {state.error}
              </PictoText>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block font-mono text-sm font-bold text-white uppercase">
              EMAIL
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full bg-[#333] text-white font-mono text-base p-3 outline-none border border-white/20 focus:border-white/50 transition-colors placeholder:text-white/30"
            />
            {state.fieldErrors?.email && (
              <PictoText size="sm" color="#ff3b30">
                {state.fieldErrors.email[0]}
              </PictoText>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="block font-mono text-sm font-bold text-white uppercase">
              USERNAME
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              placeholder="coolartist42"
              className="w-full bg-[#333] text-white font-mono text-base p-3 outline-none border border-white/20 focus:border-white/50 transition-colors placeholder:text-white/30"
            />
            <PictoText size="xs" muted className="block">
              3-20 CHARACTERS. LETTERS, NUMBERS, UNDERSCORES, HYPHENS.
            </PictoText>
            {state.fieldErrors?.username && (
              <PictoText size="sm" color="#ff3b30">
                {state.fieldErrors.username[0]}
              </PictoText>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block font-mono text-sm font-bold text-white uppercase">
              PASSWORD
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Enter a password"
              className="w-full bg-[#333] text-white font-mono text-base p-3 outline-none border border-white/20 focus:border-white/50 transition-colors placeholder:text-white/30"
            />
            {state.fieldErrors?.password && (
              <PictoText size="sm" color="#ff3b30">
                {state.fieldErrors.password[0]}
              </PictoText>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block font-mono text-sm font-bold text-white uppercase">
              CONFIRM PASSWORD
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Repeat your password"
              className="w-full bg-[#333] text-white font-mono text-base p-3 outline-none border border-white/20 focus:border-white/50 transition-colors placeholder:text-white/30"
            />
            {state.fieldErrors?.confirmPassword && (
              <PictoText size="sm" color="#ff3b30">
                {state.fieldErrors.confirmPassword[0]}
              </PictoText>
            )}
          </div>

          {/* Required checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="acceptTerms"
                required
                className="mt-1 w-5 h-5 bg-[#333] border border-white/20 checked:bg-[#00ff47] checked:border-[#00ff47] cursor-pointer accent-[#00ff47]"
              />
              <span className="font-mono text-sm text-white/70 group-hover:text-white transition-colors">
                I&apos;LL ADHERE TO THE TERMS OF CONDUCT
              </span>
            </label>
            {state.fieldErrors?.acceptTerms && (
              <PictoText size="sm" color="#ff3b30">
                {state.fieldErrors.acceptTerms[0]}
              </PictoText>
            )}

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="acceptEmail"
                required
                className="mt-1 w-5 h-5 bg-[#333] border border-white/20 checked:bg-[#00ff47] checked:border-[#00ff47] cursor-pointer accent-[#00ff47]"
              />
              <span className="font-mono text-sm text-white/70 group-hover:text-white transition-colors">
                I&apos;M OKAY WITH MY EMAIL ADDRESS BEING SAVED
              </span>
            </label>
            {state.fieldErrors?.acceptEmail && (
              <PictoText size="sm" color="#ff3b30">
                {state.fieldErrors.acceptEmail[0]}
              </PictoText>
            )}
          </div>

          <PictoButton
            type="submit"
            disabled={pending}
            color="#00ff47"
            size="md"
            className="w-full"
          >
            {pending ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </PictoButton>

          <div className="text-center pt-2">
            <PictoText size="sm" muted>
              ALREADY HAVE AN ACCOUNT?{" "}
              <Link href="/login" className="text-white hover:underline">
                SIGN IN
              </Link>
            </PictoText>
          </div>
        </form>
      </PictoModule>
    </div>
  );
}
