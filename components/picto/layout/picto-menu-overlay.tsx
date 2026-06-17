"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { TeamColors } from "../types";
import { BlobE } from "../elements/blobs";
import { PictoLogomark } from "../elements";

interface PictoMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  colors: TeamColors;
  notificationCount?: number;
  isStaff?: boolean;
}

/**
 * Full-screen chaotic menu overlay with scattered, rotated pill buttons.
 * Each button has a unique rotation and position for a playful, piled-up look.
 */
export function PictoMenuOverlay({
  isOpen,
  onClose,
  colors,
  notificationCount = 0,
  isStaff = false,
}: PictoMenuOverlayProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll when menu is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  // Menu items with their chaotic positioning
  // Positions in pixels from center, rotations in degrees
  const menuItems = [
    {
      label: "STRIKE!",
      href: "/strikes/new",
      bg: colors.teamA,
      textColor: colors.teamB,
      rotation: -10,
      x: 30,
      y: 20,
      size: "xl" as const,
      fontWeight: "700",
      zIndex: 10,
      delay: 0,
    },
    {
      label: "NOTIFICATIONS",
      href: "/notifications",
      bg: colors.teamB,
      textColor: "#ffffff",
      rotation: -17.4,
      x: -160,
      y: -80,
      size: "lg" as const,
      fontWeight: "700",
      zIndex: 20,
      showBadge: notificationCount > 0,
      badgeCount: notificationCount,
      delay: 30,
    },
    {
      label: "PROFILE",
      href: "/profile",
      bg: "#d9d9d9",
      textColor: colors.teamB,
      rotation: 11.9,
      x: 220,
      y: -130,
      size: "md" as const,
      fontWeight: "600",
      zIndex: 2,
      delay: 60,
    },
    {
      label: "CHARACTERS",
      href: "/profile",
      bg: colors.teamB,
      textColor: "#ffffff",
      rotation: 11.6,
      x: -150,
      y: 180,
      size: "lg" as const,
      fontWeight: "700",
      zIndex: 5,
      delay: 90,
    },
    {
      label: "NEW",
      href: "/characters/new",
      bg: "#009329",
      textColor: "#ffffff",
      rotation: -15.2,
      x: -320,
      y: 80,
      size: "md" as const,
      fontWeight: "100",
      zIndex: 25,
      delay: 120,
    },
    {
      label: "standings",
      href: "/event",
      bg: "#d9d9d9",
      textColor: colors.teamB,
      rotation: -21.1,
      x: 150,
      y: 140,
      size: "md" as const,
      fontWeight: "500",
      fontStyle: "italic" as const,
      zIndex: 8,
      delay: 150,
    },
    {
      label: "PICTOSTORE",
      href: "#",
      bg: "#ffb800",
      textColor: "#ffffff",
      rotation: 75.4,
      x: 340,
      y: 100,
      size: "lg" as const,
      fontWeight: "700",
      zIndex: 1,
      disabled: true,
      delay: 180,
    },
    // Admin pill - only shown to staff
    ...(isStaff
      ? [
          {
            label: "ADMIN",
            href: "/admin",
            bg: "#ff3b30",
            textColor: "#ffffff",
            rotation: -8.5,
            x: -300,
            y: -150,
            size: "md" as const,
            fontWeight: "700",
            zIndex: 30,
            delay: 210,
          },
        ]
      : []),
    // Logout pill
    {
      label: "logout",
      href: "#",
      bg: "#666666",
      textColor: "#ffffff",
      rotation: 5.3,
      x: 200,
      y: 230,
      size: "sm" as const,
      fontWeight: "400",
      zIndex: 1,
      isLogout: true,
      delay: 240,
    },
  ];

  // Desktop sizes for scattered layout
  const sizeStyles = {
    sm: { padding: "12px 24px", fontSize: "28px", borderRadius: "48px" },
    md: { padding: "16px 32px", fontSize: "36px", borderRadius: "60px" },
    lg: { padding: "20px 40px", fontSize: "48px", borderRadius: "90px" },
    xl: { padding: "24px 48px", fontSize: "96px", borderRadius: "100px" },
  };

  // Mobile vertical menu items (reordered for better UX)
  // Characters + New are grouped together, handled separately
  const mobileMenuItems = [
    { label: "STRIKE!", href: "/strikes/new", bg: colors.teamA, textColor: colors.teamB, rotation: -6, fontWeight: "700", size: "xl" as const },
    { label: "PROFILE", href: "/profile", bg: "#d9d9d9", textColor: colors.teamB, rotation: 4, fontWeight: "600", size: "lg" as const },
    { label: "NOTIFICATIONS", href: "/notifications", bg: colors.teamB, textColor: "#ffffff", rotation: -3, fontWeight: "700", size: "lg" as const, showBadge: notificationCount > 0, badgeCount: notificationCount },
    { type: "characters-group" as const }, // Placeholder for the grouped characters + new
    { label: "standings", href: "/event", bg: "#d9d9d9", textColor: colors.teamB, rotation: -5, fontWeight: "500", fontStyle: "italic" as const, size: "md" as const },
    { label: "PICTOSTORE", href: "#", bg: "#ffb800", textColor: "#ffffff", rotation: 3, fontWeight: "700", size: "md" as const, disabled: true },
    ...(isStaff ? [{ label: "ADMIN", href: "/admin", bg: "#ff3b30", textColor: "#ffffff", rotation: -2, fontWeight: "700", size: "md" as const }] : []),
    { label: "logout", href: "#", bg: "#666666", textColor: "#ffffff", rotation: 2, fontWeight: "400", size: "sm" as const, isLogout: true },
  ];

  const mobileSizeStyles = {
    sm: { padding: "10px 24px", fontSize: "20px" },
    md: { padding: "12px 28px", fontSize: "26px" },
    lg: { padding: "14px 32px", fontSize: "32px" },
    xl: { padding: "16px 36px", fontSize: "40px" },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer overflow-hidden"
      style={{
        backgroundColor: isAnimating ? "rgba(32, 32, 32, 0.95)" : "rgba(32, 32, 32, 0)",
        transition: "background-color 300ms ease-out",
      }}
      onClick={onClose}
    >
      {/* Click anywhere hint - top */}
      <div
        className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 font-mono text-xs md:text-sm text-white/40 transition-opacity duration-300"
        style={{ opacity: isAnimating ? 1 : 0, transitionDelay: "200ms" }}
      >
        tap anywhere to close
      </div>

      {/* Logo and version - bottom */}
      <div
        className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 md:gap-2 transition-opacity duration-300"
        style={{ opacity: isAnimating ? 1 : 0, transitionDelay: "250ms" }}
      >
        <PictoLogomark color="white" height={30} className="md:hidden" style={{ opacity: 0.4 }} />
        <PictoLogomark color="white" height={40} className="hidden md:block" style={{ opacity: 0.4 }} />
        <span className="font-mono text-[10px] md:text-xs text-white/30">v0.1.0</span>
      </div>

      {/* MOBILE: Vertical stacked menu with slight rotations for energy */}
      <div className="md:hidden flex flex-col items-center gap-3 py-12 px-4 max-h-full overflow-y-auto">
        {mobileMenuItems.map((item, index) => {
          // Special grouped item for Characters + New
          if (item.type === "characters-group") {
            return (
              <div
                key={index}
                className="flex items-center gap-0 transition-all duration-300 ease-out"
                style={{
                  transform: isAnimating ? `rotate(5deg) scale(1)` : `rotate(15deg) scale(0)`,
                  opacity: isAnimating ? 1 : 0,
                  transitionDelay: isAnimating ? `${index * 40}ms` : "0ms",
                }}
              >
                <Link
                  href="/profile"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="block cursor-pointer active:scale-95 transition-transform"
                >
                  <div
                    className="font-mono whitespace-nowrap rounded-l-full"
                    style={{
                      backgroundColor: colors.teamB,
                      color: "#ffffff",
                      padding: mobileSizeStyles.lg.padding,
                      fontSize: mobileSizeStyles.lg.fontSize,
                      fontWeight: "700",
                    }}
                  >
                    CHARACTERS
                  </div>
                </Link>
                <Link
                  href="/characters/new"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="block cursor-pointer active:scale-95 transition-transform"
                >
                  <div
                    className="font-mono whitespace-nowrap rounded-r-full border-l-2 border-white/20"
                    style={{
                      backgroundColor: "#009329",
                      color: "#ffffff",
                      padding: mobileSizeStyles.lg.padding,
                      fontSize: mobileSizeStyles.lg.fontSize,
                      fontWeight: "700",
                    }}
                  >
                    + NEW
                  </div>
                </Link>
              </div>
            );
          }

          const styles = mobileSizeStyles[item.size as keyof typeof mobileSizeStyles] || mobileSizeStyles.md;
          return (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              onClick={async (e) => {
                e.stopPropagation();
                if (item.disabled) {
                  e.preventDefault();
                  return;
                }
                if (item.isLogout) {
                  e.preventDefault();
                  onClose();
                  await logout();
                  return;
                }
                onClose();
              }}
              className="block cursor-pointer transition-all duration-300 ease-out active:scale-95"
              style={{
                transform: isAnimating
                  ? `rotate(${item.rotation}deg) scale(1)`
                  : `rotate(${item.rotation + 10}deg) scale(0)`,
                opacity: isAnimating ? (item.disabled ? 0.5 : 1) : 0,
                cursor: item.disabled ? "not-allowed" : "pointer",
                transitionDelay: isAnimating ? `${index * 40}ms` : "0ms",
              }}
            >
              <div
                className="relative font-mono whitespace-nowrap rounded-full"
                style={{
                  backgroundColor: item.bg,
                  color: item.textColor,
                  padding: styles.padding,
                  fontSize: styles.fontSize,
                  fontWeight: item.fontWeight,
                  fontStyle: item.fontStyle || "normal",
                }}
              >
                {item.label}
                {/* Notification badge */}
                {item.showBadge && (
                  <span
                    className="absolute -top-4 -right-4 min-w-[36px] h-[36px] px-2 rounded-full flex items-center justify-center font-mono text-xl font-bold border-2"
                    style={{
                      backgroundColor: colors.teamA,
                      color: colors.teamB,
                      borderColor: colors.teamB,
                    }}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* DESKTOP: Scattered chaotic layout */}
      <div className="hidden md:block relative w-full max-w-4xl h-[500px] origin-center md:scale-[0.8] lg:scale-100">
        {menuItems.map((item, index) => {
          const styles = sizeStyles[item.size];

          return (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              onClick={async (e) => {
                e.stopPropagation();
                if (item.disabled) {
                  e.preventDefault();
                  return;
                }
                if (item.isLogout) {
                  e.preventDefault();
                  onClose();
                  await logout();
                  return;
                }
                onClose();
              }}
              className="absolute left-1/2 top-1/2 block cursor-pointer transition-all duration-300 ease-out group"
              style={{
                transform: isAnimating
                  ? `translate(-50%, -50%) translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg) scale(1)`
                  : `translate(-50%, -50%) translate(${item.x}px, ${item.y}px) rotate(${item.rotation + 8}deg) scale(0)`,
                opacity: isAnimating ? (item.disabled ? 0.5 : 1) : 0,
                zIndex: item.zIndex,
                cursor: item.disabled ? "not-allowed" : "pointer",
                transitionDelay: isAnimating ? `${item.delay}ms` : "0ms",
              }}
            >
              <div
                className="relative font-mono whitespace-nowrap transition-transform duration-200 ease-out group-hover:scale-110 group-hover:rotate-3"
                style={{
                  backgroundColor: item.bg,
                  color: item.textColor,
                  padding: styles.padding,
                  fontSize: styles.fontSize,
                  borderRadius: styles.borderRadius,
                  fontWeight: item.fontWeight,
                  fontStyle: item.fontStyle || "normal",
                }}
              >
                {item.label}

                {/* Notification badge */}
                {item.showBadge && (
                  <div
                    className="absolute -top-8 -right-10"
                    style={{
                      transform: "rotate(18deg)",
                    }}
                  >
                    <div className="relative">
                      <BlobE
                        color={colors.teamA}
                        width={100}
                        height={100}
                      />
                      <span
                        className="absolute inset-0 flex items-center -translate-y-1 justify-center font-mono font-bold"
                        style={{ fontSize: "52px", color: colors.teamB }}
                      >
                        {item.badgeCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
