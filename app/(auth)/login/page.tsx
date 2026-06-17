"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthResult } from "../actions";
import { PictoModule, PictoText } from "@/components/picto";
import { PictoButton } from "@/components/picto/primitives/picto-button";

const initialState: AuthResult = { success: false };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_prevState: AuthResult, formData: FormData) => {
      return await login(formData);
    },
    initialState
  );

  return (
    <div className="min-h-screen bg-[#c5c5c5] flex items-center justify-center px-4 py-8 sm:py-12">
      <PictoModule className="w-full max-w-md p-5 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <PictoText size="xl" weight="bold" color="white" className="block sm:hidden">
            WELCOME BACK
          </PictoText>
          <PictoText size="2xl" weight="bold" color="white" className="hidden sm:block">
            WELCOME BACK
          </PictoText>
          <PictoText size="xs" muted className="mt-2 sm:hidden">
            SIGN IN TO YOUR PICTOCLASH ACCOUNT
          </PictoText>
          <PictoText size="sm" muted className="mt-2 hidden sm:block">
            SIGN IN TO YOUR PICTOCLASH ACCOUNT
          </PictoText>
        </div>

        <form action={formAction} className="space-y-6">
          {state.error && (
            <div className="p-3 bg-[#ff3b30]/20 border border-[#ff3b30]/50">
              <PictoText size="sm" color="#ff3b30">
                {state.error}
              </PictoText>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="identifier" className="block font-mono text-sm font-bold text-white uppercase">
              USERNAME OR EMAIL
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              required
              placeholder="coolartist42 or you@example.com"
              className="w-full bg-[#333] text-white font-mono text-base p-3 outline-none border border-white/20 focus:border-white/50 transition-colors placeholder:text-white/30"
            />
            {state.fieldErrors?.identifier && (
              <PictoText size="sm" color="#ff3b30">
                {state.fieldErrors.identifier[0]}
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
              autoComplete="current-password"
              required
              placeholder="Your password"
              className="w-full bg-[#333] text-white font-mono text-base p-3 outline-none border border-white/20 focus:border-white/50 transition-colors placeholder:text-white/30"
            />
            {state.fieldErrors?.password && (
              <PictoText size="sm" color="#ff3b30">
                {state.fieldErrors.password[0]}
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
            {pending ? "SIGNING IN..." : "SIGN IN"}
          </PictoButton>

          <div className="text-center pt-2">
            <PictoText size="sm" muted>
              DON&apos;T HAVE AN ACCOUNT?{" "}
              <Link href="/register" className="text-white hover:underline">
                CREATE ONE
              </Link>
            </PictoText>
          </div>
        </form>
      </PictoModule>
    </div>
  );
}
