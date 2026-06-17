"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { PictoText, PictoArrayText } from "@/components/picto";
import { ContentWarningCurtain } from "@/components/content-warning-curtain";
import { STRIKE_TYPES } from "@/lib/constants";

export type StrikeGalleryCharacter = {
  name: string;
  slug?: string;
  ownerUsername: string;
  ownerTeamColor?: string;
};

export type StrikeGalleryScoreDetail = {
  category: string;
  label: string;
};

export type StrikeGalleryViewProps = {
  // Strike data
  strikeType: "visual" | "writing" | "sculpture";
  imageUrl?: string | null;
  imagePreview?: string | null;
  markdownContent?: string | null;
  contentWarning?: string | null;
  message?: string | null;
  baseScore: number;
  bonusMultiplier: number;
  finalScore: number;
  createdAt?: string;

  // Creator info
  creatorUsername: string;
  teamColor?: string;

  // Target characters
  characters: StrikeGalleryCharacter[];

  // Scoring breakdown
  scoreDetails?: StrikeGalleryScoreDetail[];
  isPolished?: boolean;
  isFriendlyFire?: boolean;
  isRevenge?: boolean;
  avengesStrikeId?: string | null;
  avengesUsername?: string | null;

  // Mode
  mode: "confirmation" | "view";

  // Actions (confirmation mode)
  onEdit?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;

  // Actions (view mode)
  avengeHref?: string;
  canAvenge?: boolean;
  canReport?: boolean;
  strikeId?: string;
  creatorDisplayName?: string;
};

export function StrikeGalleryView({
  strikeType,
  imageUrl,
  imagePreview,
  markdownContent,
  contentWarning,
  message,
  baseScore,
  bonusMultiplier,
  finalScore,
  createdAt,
  creatorUsername,
  teamColor = "#00ff47",
  characters,
  scoreDetails = [],
  isPolished = false,
  isFriendlyFire = false,
  isRevenge = false,
  avengesStrikeId,
  avengesUsername,
  mode,
  onEdit,
  onSubmit,
  isSubmitting,
  avengeHref,
  canAvenge,
}: StrikeGalleryViewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [curtainRevealed, setCurtainRevealed] = useState(false);
  const displayImage = imagePreview || imageUrl;
  const hasCurtain = !!contentWarning;
  const curtainClosed = hasCurtain && !curtainRevealed;
  const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  const strikeTypeName = STRIKE_TYPES[strikeType]?.name || strikeType;

  return (
    <>
      {/* Lightbox */}
      {lightboxOpen && displayImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image
              src={displayImage}
              alt="Strike artwork"
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl mx-auto">
        {/* Main Container */}
        <div className="bg-[#2d2d2d] p-3 sm:p-6">
          {/* Header - only show in confirmation mode */}
          {mode === "confirmation" && (
            <PictoText size="sm" muted className="mb-3 sm:mb-4 text-center block text-xs sm:text-sm">
              DOUBLE-CHECK YOUR WORK
            </PictoText>
          )}

          {/* Content Area - Frame + Plaque stacked on mobile, side by side on desktop */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 sm:justify-center">
            {/* Left: Framed Artwork */}
            <div className="flex-shrink-0 flex justify-center">
              {strikeType === "writing" ? (
                // Writing display
                <div
                  className="w-full sm:w-[480px] aspect-square sm:h-[480px] p-3 sm:p-5 overflow-auto bg-[#1a1a1a]"
                  style={{
                    boxShadow: "inset 0 0 0 8px #e8e8e8, 0 4px 20px rgba(0,0,0,0.4)",
                  }}
                >
                  <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-white/90 leading-relaxed">
                    {markdownContent}
                  </pre>
                </div>
              ) : (
                // Visual/Sculpture display with picture frame
                <div
                  className="relative cursor-pointer group w-full sm:w-auto"
                  onClick={() => {
                    if (curtainClosed) {
                      setCurtainRevealed(true);
                    } else if (displayImage) {
                      setLightboxOpen(true);
                    }
                  }}
                  style={{
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                  }}
                >
                  {/* Picture frame */}
                  <div
                    className="p-2 sm:p-3 bg-[#e8e8e8]"
                    style={{
                      boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="relative w-full aspect-square sm:w-[454px] sm:h-[454px] bg-[#1a1a1a] overflow-hidden">
                      {displayImage ? (
                        <>
                          <Image
                            src={displayImage}
                            alt="Strike artwork"
                            fill
                            className="object-contain transition-transform group-hover:scale-105"
                          />
                          {/* Content Warning Curtain */}
                          {contentWarning && (
                            <ContentWarningCurtain
                              warning={contentWarning}
                              revealed={curtainRevealed}
                              onReveal={() => setCurtainRevealed(true)}
                            />
                          )}
                          {/* Normal hover overlay (only when curtain is open or no curtain) */}
                          {!curtainClosed && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <PictoText
                                size="sm"
                                color="white"
                                className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"
                              >
                                Click to view
                              </PictoText>
                              <PictoText
                                size="sm"
                                color="white"
                                className="opacity-0 group-hover:opacity-100 transition-opacity sm:hidden"
                              >
                                Tap to view
                              </PictoText>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PictoText muted>No image</PictoText>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Metadata Plaque */}
            <div
              className="sm:flex-1 sm:min-w-[200px] sm:max-w-[260px] relative flex flex-col justify-end"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {/* Decorative corner dots */}
              <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-white/30" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/30" />
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-white/30" />
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-white/30" />

              {/* Content - anchored to bottom */}
              <div className="p-3 sm:p-4 pb-4 sm:pb-6">
                {/* Title & Creator */}
                <div className="mb-3 sm:mb-4">
                  <PictoText size="base" weight="bold" color="white" className="text-sm sm:text-base">
                    STRIKE
                  </PictoText>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <PictoText size="xs" muted className="text-[10px] sm:text-xs">BY</PictoText>
                    <Link
                      href={`/user/${creatorUsername}`}
                      className="hover:underline"
                    >
                      <PictoText
                        size="xs"
                        weight="bold"
                        style={{ color: teamColor }}
                        className="text-[10px] sm:text-xs"
                      >
                        {creatorUsername.toUpperCase()}
                      </PictoText>
                    </Link>
                  </div>
                </div>

                {/* Featuring */}
                {characters.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <PictoText size="xs" muted className="mb-1 text-[10px] sm:text-xs">
                      FEATURING
                    </PictoText>
                    <div className="flex flex-col gap-1">
                      {characters.map((char, i) => (
                        <div key={i}>
                          {char.slug ? (
                            <Link
                              href={`/characters/${char.ownerUsername}/${char.slug}`}
                              className="hover:underline"
                            >
                              <PictoText size="xs" weight="bold" color="white" className="text-[10px] sm:text-xs">
                                {char.name.toUpperCase()}
                              </PictoText>
                            </Link>
                          ) : (
                            <PictoText size="xs" weight="bold" color="white" className="text-[10px] sm:text-xs">
                              {char.name.toUpperCase()}
                            </PictoText>
                          )}
                          <div className="flex items-baseline gap-1">
                            <PictoText size="xs" muted className="text-[10px] sm:text-xs">BY</PictoText>
                            <Link
                              href={`/user/${char.ownerUsername}`}
                              className="hover:underline"
                            >
                              <PictoText
                                size="xs"
                                weight="bold"
                                style={{ color: char.ownerTeamColor }}
                                className="text-[10px] sm:text-xs"
                              >
                                {char.ownerUsername.toUpperCase()}
                              </PictoText>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Warning */}
                {contentWarning && (
                  <div className="mb-2 sm:mb-3">
                    <PictoText size="xs" muted className="text-[10px] sm:text-xs">
                      CW: {contentWarning.toUpperCase()}
                    </PictoText>
                  </div>
                )}

                {/* Technical Details */}
                <div className="mb-2 sm:mb-3">
                  <PictoText size="xs" muted className="block text-[10px] sm:text-xs">
                    {strikeTypeName.toUpperCase()}, {year}
                  </PictoText>
                  {scoreDetails.length > 0 && (
                    <PictoText size="xs" muted className="block mt-1 text-[10px] sm:text-xs">
                      {scoreDetails.map((d) => d.label.toUpperCase()).join(", ")}
                    </PictoText>
                  )}
                  {isPolished && (
                    <PictoText size="xs" muted className="block mt-1 text-[10px] sm:text-xs">
                      POLISHED
                    </PictoText>
                  )}
                  {isRevenge && (
                    <PictoText size="xs" className="block mt-1 text-orange-400 text-[10px] sm:text-xs">
                      REVENGE (+25%)
                    </PictoText>
                  )}
                  {avengesStrikeId && avengesUsername && !isRevenge && (
                    <PictoText size="xs" muted className="block mt-1 text-[10px] sm:text-xs">
                      AVENGING{" "}
                      <Link
                        href={`/user/${avengesUsername}`}
                        className="hover:underline"
                      >
                        @{avengesUsername.toUpperCase()}
                      </Link>
                    </PictoText>
                  )}
                  {isFriendlyFire && (
                    <PictoText size="xs" className="block mt-1 text-yellow-500 text-[10px] sm:text-xs">
                      FRIENDLY FIRE (-20%)
                    </PictoText>
                  )}
                </div>

                {/* Message */}
                {message && (
                  <div className="mb-2 sm:mb-3 pt-2 border-t border-white/10">
                    <PictoText size="xs" muted className="italic text-[10px] sm:text-xs">
                      &ldquo;{message}&rdquo;
                    </PictoText>
                  </div>
                )}

                {/* Score Display */}
                <div className="pt-2 sm:pt-3 border-t border-white/10">
                  <div className="flex items-baseline gap-2">
                    <PictoArrayText
                      size="4xl"
                      color={teamColor}
                      glow
                      glowIntensity={60}
                      tabularNums
                      className="text-3xl sm:text-4xl"
                    >
                      {finalScore}
                    </PictoArrayText>
                    <PictoText size="xs" muted className="uppercase text-[10px] sm:text-xs">
                      Points
                    </PictoText>
                  </div>
                  <PictoText size="xs" muted className="mt-0.5 text-[10px] sm:text-xs">
                    {baseScore} × {bonusMultiplier}%
                  </PictoText>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
            {mode === "confirmation" ? (
              <>
                <button
                  type="button"
                  onClick={onEdit}
                  className="px-4 sm:px-8 h-10 sm:h-12 bg-white font-mono font-bold text-xs sm:text-sm text-black uppercase hover:bg-gray-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="flex-1 h-10 sm:h-12 font-mono font-bold text-xs sm:text-sm text-black uppercase transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: teamColor,
                    boxShadow: `0 0 20px ${teamColor}50`,
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </>
            ) : (
              <>
                {canAvenge && avengeHref && (
                  <Link
                    href={avengeHref}
                    className="flex-1 h-10 sm:h-12 flex items-center justify-center font-mono font-bold text-xs sm:text-sm text-black uppercase transition-all"
                    style={{
                      backgroundColor: teamColor,
                      boxShadow: `0 0 16px ${teamColor}40`,
                    }}
                  >
                    Avenge!
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="px-4 sm:px-8 h-10 sm:h-12 flex items-center justify-center bg-white/10 font-mono font-bold text-xs sm:text-sm text-white uppercase hover:bg-white/20 transition-colors"
                >
                  Back
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
