"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { PictoLogomark, PictoP } from "../elements";
import { PictoButton } from "../primitives/picto-button";
import { PictoMenuOverlay } from "./picto-menu-overlay";
import { TeamColors } from "../types";

interface UserProfile {
  id: string;
  username: string;
  team: "a" | "b" | null;
  profile_image_url?: string | null;
}

interface ActiveEvent {
  team_a_name: string;
  team_b_name: string;
}

interface PictoHeaderProps {
  colors: TeamColors;
  profile?: UserProfile | null;
  activeEvent?: ActiveEvent | null;
  notificationCount?: number;
  isStaff?: boolean;
  className?: string;
}

/**
 * Main PictoClash header with gradient accents from team colors.
 * Shows user profile info when logged in, login/join buttons when logged out.
 */
export function PictoHeader({
  colors,
  profile,
  activeEvent,
  notificationCount = 0,
  isStaff = false,
  className,
}: PictoHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = !!profile;

  const teamName =
    profile?.team === "a"
      ? activeEvent?.team_a_name
      : profile?.team === "b"
        ? activeEvent?.team_b_name
        : null;

  const teamColor =
    profile?.team === "a"
      ? colors.teamA
      : profile?.team === "b"
        ? colors.teamB
        : "#ffffff";

  return (
    <header
      className={cn(
        "relative h-[70px] md:h-[90px] bg-[#202020] border-b border-[#202020] overflow-hidden",
        className
      )}
    >
      {/* Left gradient (Team B color) - shown when logged out */}
      {!isLoggedIn && (
        <div
          className="absolute inset-y-0 left-0 w-1/2 pointer-events-none"
          style={{
            background: `linear-gradient(to right, ${colors.teamB}, transparent)`,
            opacity: 0.3,
          }}
          aria-hidden="true"
        />
      )}
      {/* Right gradient (Team A color) */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 pointer-events-none"
        style={{
          background: `linear-gradient(to left, ${colors.teamA}, transparent)`,
          opacity: 0.3,
        }}
        aria-hidden="true"
      />

      <nav className="relative h-full max-w-[1024px] mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo - P icon on mobile, full logomark on desktop */}
        <Link href="/" aria-label="Home">
          <PictoP color="white" height={40} className="md:hidden" />
          <PictoLogomark color="white" height={50} className="hidden md:block" />
        </Link>

        {isLoggedIn ? (
          <>
            {/* Clickable area to open menu - fills space between logo and user info (desktop only) */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="hidden md:flex flex-1 h-full cursor-pointer items-center justify-center group relative overflow-visible"
              aria-label="Open menu"
            >
              {/* Peeking menu pills on hover */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-2 pointer-events-none">
                {/* STRIKE pill */}
                <div
                  className="font-mono text-[10px] font-bold px-3 py-1 rounded-full transition-all duration-300 ease-out opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-1/2"
                  style={{
                    backgroundColor: colors.teamA,
                    color: colors.teamB,
                    transitionDelay: "0ms",
                    transform: "rotate(-5deg)",
                  }}
                >
                  STRIKE!
                </div>
                {/* PROFILE pill */}
                <div
                  className="font-mono text-[10px] font-bold px-3 py-1 rounded-full transition-all duration-300 ease-out opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-1/3"
                  style={{
                    backgroundColor: "#d9d9d9",
                    color: colors.teamB,
                    transitionDelay: "50ms",
                    transform: "rotate(3deg)",
                  }}
                >
                  PROFILE
                </div>
                {/* NOTIFICATIONS pill */}
                <div
                  className="font-mono text-[10px] font-bold px-3 py-1 rounded-full transition-all duration-300 ease-out opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-2/3"
                  style={{
                    backgroundColor: colors.teamB,
                    color: "#ffffff",
                    transitionDelay: "100ms",
                    transform: "rotate(-2deg)",
                  }}
                >
                  MORE...
                </div>
              </div>

              {/* Hint text */}
              <span className="font-mono text-xs text-white/0 group-hover:text-white/40 transition-all duration-300 uppercase tracking-wide">
                click to open menu
              </span>
            </button>

            {/* Menu overlay */}
            <PictoMenuOverlay
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              colors={colors}
              notificationCount={notificationCount}
              isStaff={isStaff}
            />

            {/* User info - desktop shows username + avatar link, mobile shows avatar as menu button */}
            <div className="flex items-center gap-3">
              {/* Username and team - hidden on mobile */}
              <div className="hidden md:block text-right">
                <Link
                  href="/profile"
                  className="font-mono text-xl font-bold text-white uppercase block hover:opacity-80 transition-opacity"
                >
                  @{profile.username}
                </Link>
                {teamName && (
                  <p
                    className="font-mono text-xs uppercase"
                    style={{ color: teamColor }}
                  >
                    Team {teamName}
                  </p>
                )}
              </div>

              {/* Desktop: Avatar links to profile */}
              <Link href="/profile" aria-label="View profile" className="relative hidden md:block">
                <div
                  className="w-16 h-16 bg-[#333] border-[3px] hover:opacity-80 transition-opacity overflow-hidden"
                  style={{ borderColor: teamColor }}
                >
                  {profile.profile_image_url ? (
                    <Image
                      src={profile.profile_image_url}
                      alt={profile.username}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 font-mono font-bold text-xl">
                      {profile.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Notification badge */}
                {notificationCount > 0 && (
                  <div
                    className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center font-mono text-xs font-bold text-white"
                    style={{ backgroundColor: colors.teamB }}
                  >
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </div>
                )}
              </Link>

              {/* Mobile: MENU button */}
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="relative md:hidden flex items-center gap-2 px-3 py-2 border-2 hover:opacity-80 transition-opacity"
                style={{ borderColor: teamColor }}
              >
                <span className="font-mono text-sm font-bold text-white uppercase">Menu</span>
                {/* Notification badge */}
                {notificationCount > 0 && (
                  <div
                    className="min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center font-mono text-[10px] font-bold text-white"
                    style={{ backgroundColor: colors.teamB }}
                  >
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </div>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Auth buttons for logged out users */
          <div className="flex items-center gap-2 md:gap-3">
            <PictoButton href="/login" color={colors.teamA} size="sm">
              Login
            </PictoButton>
            <PictoButton href="/register" color={colors.teamB} size="sm">
              Join
            </PictoButton>
          </div>
        )}
      </nav>
    </header>
  );
}

interface PictoLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Standalone PictoClash logo text
 */
export function PictoLogo({ className, size = "md" }: PictoLogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <span
      className={cn(
        "font-mono font-bold text-white uppercase tracking-wide",
        sizeClasses[size],
        className
      )}
    >
      PICTOCLASH
    </span>
  );
}
