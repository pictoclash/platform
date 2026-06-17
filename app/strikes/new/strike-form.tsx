"use client";

import { useActionState, useState, useRef, useCallback, useEffect, useTransition } from "react";
import { Upload, Plus, X, Loader2, AlertCircle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import Image from "next/image";
import { createStrike, lookupCharacter, type ActionResult } from "../actions";
import type { AvengeStrikeInfo, UnavengedStrike } from "./types";
import {
  PictoModule,
  PictoModuleTitle,
  PictoText,
} from "@/components/picto";
import { Switch } from "@/components/ui/switch";
import {
  StrikeGalleryView,
  type StrikeGalleryCharacter,
  type StrikeGalleryScoreDetail,
} from "@/components/strike-gallery-view";
import {
  VISUAL_SCORING,
  WRITING_SCORING,
  SCULPTURE_SCORING,
  WORDS_PER_POINT,
  MULTIPLIERS,
  type ScoringCategory,
} from "@/lib/constants";

/** Character data stored in state after lookup */
type SelectedCharacter = {
  id: string;
  name: string;
  slug: string | null;
  reference_image_url: string;
  owner_username: string;
  owner_team: "a" | "b" | null;
};

/** Team colors passed from parent */
type TeamColors = {
  teamA: string;
  teamB: string;
};

const initialState: ActionResult = { success: false };

type StrikeType = "visual" | "writing" | "sculpture";

// Helper to get Lucide icon component by name
type IconProps = { size?: number; className?: string; strokeWidth?: number };
function getIcon(name: string): React.ComponentType<IconProps> {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<IconProps>>;
  return icons[name] || LucideIcons.Circle;
}

export function StrikeForm({
  preselectedTarget,
  avengeInfo: initialAvengeInfo,
  unavengedStrikes = [],
  teamColor = "#00ff47",
  teamColors = { teamA: "#00ff47", teamB: "#ff4777" },
  userId,
  userTeam,
  username,
}: {
  preselectedTarget?: string;
  avengeInfo?: AvengeStrikeInfo | null;
  unavengedStrikes?: UnavengedStrike[];
  teamColor?: string;
  teamColors?: TeamColors;
  userId: string;
  userTeam: "a" | "b" | null;
  username: string;
}) {
  // Avenge state - can be set from URL or selected during character selection
  const [avengeInfo, setAvengeInfo] = useState<AvengeStrikeInfo | null>(initialAvengeInfo || null);
  const [strikeType, setStrikeType] = useState<StrikeType>("visual");
  const [selectedCharacters, setSelectedCharacters] = useState<SelectedCharacter[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [hasContentWarning, setHasContentWarning] = useState(false);
  const [contentWarningText, setContentWarningText] = useState("");
  const [isPictoquestDone, setIsPictoquestDone] = useState(false);
  const [characterInput, setCharacterInput] = useState("");
  const [characterLookupError, setCharacterLookupError] = useState<string | null>(null);
  const [showErrorInButton, setShowErrorInButton] = useState(false);
  const [isLookingUp, startLookupTransition] = useTransition();
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const characterInputRef = useRef<HTMLInputElement>(null);

  // Look up preselected target on mount
  useEffect(() => {
    if (preselectedTarget) {
      startLookupTransition(async () => {
        const result = await lookupCharacter(preselectedTarget);
        if (result.success && result.character) {
          setSelectedCharacters([result.character]);
        }
      });
    }
  }, [preselectedTarget]);

  // Get scoring categories based on strike type
  const getScoringCategories = (): ScoringCategory[] => {
    switch (strikeType) {
      case "visual":
        return VISUAL_SCORING;
      case "writing":
        return WRITING_SCORING;
      case "sculpture":
        return SCULPTURE_SCORING;
    }
  };

  // Check for friendly fire (>50% same team as user)
  const isFriendlyFire = (): boolean => {
    if (!userTeam || selectedCharacters.length === 0) return false;
    const sameTeamCount = selectedCharacters.filter(
      (c) => c.owner_team === userTeam
    ).length;
    return sameTeamCount > selectedCharacters.length / 2;
  };

  // Check if this is a valid revenge (avenging and targeting original striker)
  const isRevenge = (): boolean => {
    if (!avengeInfo || selectedCharacters.length === 0) return false;
    // Check if any selected character belongs to the original striker
    // We match by username since we don't have owner_id in SelectedCharacter
    return selectedCharacters.some(
      (c) => c.owner_username.toLowerCase() === avengeInfo.creatorUsername.toLowerCase()
    );
  };

  // Find avenge opportunity for a specific character
  const getAvengeOpportunityForCharacter = (char: SelectedCharacter): UnavengedStrike | null => {
    return unavengedStrikes.find(
      (s) => s.creatorUsername.toLowerCase() === char.owner_username.toLowerCase()
    ) || null;
  };

  // Check if this character is the one being avenged (its owner matches the avengeInfo creator)
  const isCharacterBeingAvenged = (char: SelectedCharacter): boolean => {
    if (!avengeInfo) return false;
    return char.owner_username.toLowerCase() === avengeInfo.creatorUsername.toLowerCase();
  };

  // Get team color for a character's owner
  const getOwnerTeamColor = (team: "a" | "b" | null): string => {
    if (team === "a") return teamColors.teamA;
    if (team === "b") return teamColors.teamB;
    return "#888";
  };

  const [state, formAction, pending] = useActionState(
    async (_prevState: ActionResult, formData: FormData) => {
      // Add selected targets to form data
      selectedCharacters.forEach((char) => {
        formData.append("target_character_ids", char.id);
      });

      // Calculate base score from selections
      const categories = getScoringCategories();
      let baseScore = 0;
      categories.forEach((cat) => {
        baseScore += scores[cat.id] || 0;
      });
      if (strikeType === "writing") {
        baseScore += Math.floor(wordCount / WORDS_PER_POINT);
      }

      let bonusMultiplier = 100;
      if (isFinished) {
        bonusMultiplier += MULTIPLIERS.FINISH_BONUS;
      }
      // Apply revenge bonus
      if (isRevenge()) {
        bonusMultiplier += MULTIPLIERS.REVENGE_BONUS;
      }
      // Apply friendly fire penalty
      if (isFriendlyFire()) {
        bonusMultiplier = Math.floor(bonusMultiplier * MULTIPLIERS.FRIENDLY_FIRE_MULTIPLIER);
      }

      formData.set("base_score", String(baseScore));
      formData.set("bonus_multiplier", String(bonusMultiplier));

      // Add other fields
      formData.set("strike_type", strikeType);
      if (imageFile) {
        formData.set("image", imageFile);
      }
      if (strikeType === "writing") {
        formData.set("markdown_content", markdownContent);
      }
      if (hasContentWarning && contentWarningText.trim()) {
        formData.set("content_warning", contentWarningText.trim());
      }
      return await createStrike(formData);
    },
    initialState
  );

  // Calculate base score (before multiplier)
  const calculateBaseScore = () => {
    const categories = getScoringCategories();
    let base = 0;
    categories.forEach((cat) => {
      base += scores[cat.id] || 0;
    });
    if (strikeType === "writing") {
      base += Math.floor(wordCount / WORDS_PER_POINT);
    }
    return base;
  };

  // Calculate multiplier (as percentage, e.g., 120 = 1.2x)
  const calculateMultiplier = () => {
    let multiplier = 100;
    if (isFinished) multiplier += MULTIPLIERS.FINISH_BONUS;
    // Apply revenge bonus
    if (isRevenge()) {
      multiplier += MULTIPLIERS.REVENGE_BONUS;
    }
    // Apply friendly fire penalty
    if (isFriendlyFire()) {
      multiplier = Math.floor(multiplier * MULTIPLIERS.FRIENDLY_FIRE_MULTIPLIER);
    }
    return multiplier;
  };

  // Calculate total score
  const calculateTotalScore = () => {
    const base = calculateBaseScore();
    const multiplier = calculateMultiplier();
    return Math.floor((base * multiplier) / 100);
  };

  // Check if all required scores are filled
  const allScoresFilled = () => {
    const categories = getScoringCategories();
    return categories.every((cat) => scores[cat.id] !== undefined);
  };

  // Handle image drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  // Handle paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
            }
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Handle file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Clear image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Update word count when markdown changes
  useEffect(() => {
    const words = markdownContent.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [markdownContent]);

  // Show error inline with timer
  const showError = (message: string) => {
    // Clear any existing timer
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setCharacterLookupError(message);
    setShowErrorInButton(true);
    // Clear error after 3 seconds
    errorTimeoutRef.current = setTimeout(() => {
      setShowErrorInButton(false);
      setCharacterLookupError(null);
    }, 3000);
  };

  // Handle character lookup
  const handleCharacterLookup = () => {
    if (!characterInput.trim()) return;

    setCharacterLookupError(null);
    setShowErrorInButton(false);
    startLookupTransition(async () => {
      const result = await lookupCharacter(characterInput.trim());
      if (result.success && result.character) {
        // Check if already selected
        if (selectedCharacters.some((c) => c.id === result.character!.id)) {
          showError("Already added");
          return;
        }
        setSelectedCharacters([...selectedCharacters, result.character]);
        setCharacterInput("");
      } else {
        showError(result.error || "Not found");
      }
    });
  };

  // Handle Enter key in character input
  const handleCharacterInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCharacterLookup();
    }
  };

  // Remove character target
  const removeCharacter = (charId: string) => {
    setSelectedCharacters(selectedCharacters.filter((c) => c.id !== charId));
  };

  // Update score for a category
  const setScore = (categoryId: string, points: number) => {
    setScores({ ...scores, [categoryId]: points });
  };

  // Reset scores when strike type changes
  useEffect(() => {
    setScores({});
  }, [strikeType]);

  const canSubmit =
    selectedCharacters.length > 0 &&
    allScoresFilled() &&
    (strikeType === "writing" ? markdownContent.trim().length > 0 : !!imageFile);


  const formContent = (
    <form action={formAction}>
      {(state.error || submitError) && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 font-mono text-xs sm:text-sm text-red-400">
          {state.error || submitError}
        </div>
      )}


      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        {/* Left Column - Upload Area */}
        <div className="lg:w-[400px] flex-shrink-0">
          {strikeType === "writing" ? (
            // Writing textarea
            <PictoModule className="h-[300px] sm:h-[400px] lg:h-[560px] flex flex-col">
              <textarea
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                placeholder="Write your story here..."
                className="flex-1 w-full bg-transparent text-white font-mono text-sm resize-none outline-none placeholder:text-white/30"
              />
              <div className="mt-3 sm:mt-4 flex justify-between items-center border-t border-white/10 pt-3 sm:pt-4">
                <PictoText size="xs" muted>
                  {wordCount} words (+{Math.floor(wordCount / WORDS_PER_POINT)} pts)
                </PictoText>
              </div>
            </PictoModule>
          ) : (
            // Image upload area
            <PictoModule
              className={`h-[280px] sm:h-[350px] lg:h-[560px] flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging ? "ring-2 ring-white" : ""
              }`}
              onDragOver={(e: React.DragEvent) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImage();
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/80 hover:bg-black transition-colors"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload
                    size={80}
                    className="sm:w-[120px] sm:h-[120px] text-white opacity-20 mx-auto mb-4 sm:mb-6"
                    strokeWidth={1}
                  />
                  <PictoText
                    as="p"
                    size="sm"
                    muted
                    className="leading-relaxed text-xs sm:text-sm"
                  >
                    Drag to upload
                    <br />
                    Paste to upload
                    <br />
                    Tap to select files
                  </PictoText>
                </div>
              )}
            </PictoModule>
          )}
        </div>

        {/* Right Column - Strike Details */}
        <div className="flex-1">
          <PictoModule className="lg:min-h-[560px]">
            {/* Strike Type Tabs */}
            <PictoModuleTitle className="mb-3 sm:mb-4 text-sm sm:text-base">Strike Details</PictoModuleTitle>

            {/* Strike Type Selector - Full Width */}
            <div className="flex mb-4 sm:mb-6">
              {(["visual", "sculpture", "writing"] as const).map((type) => {
                const isActive = strikeType === type;
                const labels = { visual: "2D", sculpture: "3D", writing: "Writing" };
                const labelsLong = { visual: "Art (2D)", sculpture: "Art (3D)", writing: "Writing" };
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setStrikeType(type)}
                    className="flex-1 py-2 sm:py-3 font-mono font-bold text-xs sm:text-sm uppercase transition-colors"
                    style={{
                      backgroundColor: isActive ? teamColor : "#3a3a3a",
                      color: isActive ? "#000" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    <span className="sm:hidden">{labels[type]}</span>
                    <span className="hidden sm:inline">{labelsLong[type]}</span>
                  </button>
                );
              })}
            </div>

            {/* Character Selection */}
            <div className="mb-4 sm:mb-6">
              <PictoText size="xs" muted className="mb-2 block text-[10px] sm:text-xs">
                Enter character UUID or slug:username (e.g., coral:delphi)
              </PictoText>
              <div className="flex gap-2">
                <div
                  className="flex-1 h-[33px] relative transition-colors"
                  style={{
                    backgroundColor: showErrorInButton ? "#4a2020" : "#4d4d4d",
                  }}
                >
                  {showErrorInButton && characterLookupError ? (
                    // Error message displayed inline
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="font-mono text-xs sm:text-sm text-red-400">
                        {characterLookupError}
                      </span>
                    </div>
                  ) : (
                    <input
                      ref={characterInputRef}
                      type="text"
                      value={characterInput}
                      onChange={(e) => {
                        setCharacterInput(e.target.value);
                        if (errorTimeoutRef.current) {
                          clearTimeout(errorTimeoutRef.current);
                        }
                        setCharacterLookupError(null);
                        setShowErrorInButton(false);
                      }}
                      onKeyDown={handleCharacterInputKeyDown}
                      placeholder="UUID or slug:username"
                      className="w-full h-full px-3 bg-transparent text-white font-mono text-xs sm:text-sm placeholder:text-white/50 outline-none"
                      disabled={isLookingUp}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (showErrorInButton) {
                      // Clicking when error shown clears it
                      if (errorTimeoutRef.current) {
                        clearTimeout(errorTimeoutRef.current);
                      }
                      setCharacterLookupError(null);
                      setShowErrorInButton(false);
                      characterInputRef.current?.focus();
                    } else {
                      handleCharacterLookup();
                    }
                  }}
                  disabled={isLookingUp || (!characterInput.trim() && !showErrorInButton)}
                  className="w-[33px] h-[33px] flex items-center justify-center disabled:opacity-50 transition-all"
                  style={{
                    backgroundColor: showErrorInButton ? "#ef4444" : "#d9d9d9",
                  }}
                >
                  {isLookingUp ? (
                    <Loader2 size={16} className="text-[#202020] animate-spin" />
                  ) : showErrorInButton ? (
                    <AlertCircle size={16} className="text-white" />
                  ) : (
                    <Plus size={16} className="text-[#202020]" />
                  )}
                </button>
              </div>
              {/* Selected Characters - styled like input bars */}
              {selectedCharacters.length > 0 && (
                <div className="flex flex-col gap-2 mt-3">
                  {selectedCharacters.map((char) => {
                    const ownerColor = getOwnerTeamColor(char.owner_team);
                    const isSameTeam = userTeam && char.owner_team === userTeam;
                    const avengeOpportunity = getAvengeOpportunityForCharacter(char);
                    const isBeingAvenged = isCharacterBeingAvenged(char);
                    const showAvengeButton = avengeOpportunity && !avengeInfo;
                    const showAvengeChip = isBeingAvenged;

                    return (
                      <div
                        key={char.id}
                        className="flex gap-2 h-[33px] transition-all"
                        style={{
                          // Glow effect when this character is being avenged
                          boxShadow: showAvengeChip
                            ? `0 0 12px ${teamColor}60, 0 0 24px ${teamColor}30`
                            : undefined,
                        }}
                      >
                        {/* Character bar with gradient overlay */}
                        <div
                          className="flex-1 flex items-center px-2 sm:px-3 relative overflow-hidden"
                          style={{
                            backgroundColor: showAvengeChip ? `${teamColor}15` : "#4d4d4d",
                            border: showAvengeChip ? `1px solid ${teamColor}50` : "1px solid transparent",
                          }}
                        >
                          {/* Subtle team color gradient */}
                          <div
                            className="absolute inset-0 opacity-20"
                            style={{
                              background: `linear-gradient(90deg, ${ownerColor}40 0%, transparent 60%)`,
                            }}
                          />
                          <span className="relative z-10 font-mono text-xs sm:text-sm text-white truncate">
                            {char.name}
                          </span>
                          <span className="relative z-10 font-mono text-xs sm:text-sm ml-1 text-white/50">
                            @
                          </span>
                          <span
                            className="relative z-10 font-mono text-xs sm:text-sm font-semibold truncate"
                            style={{ color: ownerColor }}
                          >
                            {char.owner_username}
                          </span>
                          {isSameTeam && (
                            <span className="relative z-10 ml-1 sm:ml-2 px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-mono font-bold uppercase bg-yellow-500/20 text-yellow-400 rounded flex-shrink-0">
                              Ally
                            </span>
                          )}

                          {/* Avenge Button - shown when opportunity exists but not yet avenging */}
                          {showAvengeButton && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAvengeInfo(avengeOpportunity);
                              }}
                              className="relative z-10 ml-auto px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-mono font-bold uppercase transition-all hover:scale-105 flex-shrink-0"
                              style={{
                                backgroundColor: teamColor,
                                color: "#000",
                                boxShadow: `0 0 8px ${teamColor}60`,
                              }}
                            >
                              Avenge
                            </button>
                          )}

                          {/* Avenge Chip - shown when this character is being avenged */}
                          {showAvengeChip && (
                            <span
                              className="relative z-10 ml-auto px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-mono font-bold uppercase flex-shrink-0"
                              style={{
                                backgroundColor: teamColor,
                                color: "#000",
                                boxShadow: `0 0 12px ${teamColor}80`,
                              }}
                            >
                              <span className="hidden sm:inline">Avenge! </span>+{MULTIPLIERS.REVENGE_BONUS}%
                            </span>
                          )}
                        </div>
                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => removeCharacter(char.id)}
                          className="w-[33px] h-[33px] bg-[#d9d9d9] flex items-center justify-center hover:bg-red-400 transition-colors group flex-shrink-0"
                        >
                          <X size={16} className="text-[#202020] group-hover:text-white" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Friendly Fire Warning */}
              {isFriendlyFire() && (
                <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2">
                  <AlertCircle size={14} className="text-yellow-400 shrink-0" />
                  <PictoText size="xs" className="text-yellow-400 text-[10px] sm:text-xs">
                    Friendly Fire! Striking mostly allies applies a 20% score penalty.
                  </PictoText>
                </div>
              )}

              <PictoText size="xs" muted className="mt-2 block text-[10px] sm:text-xs">
                All character owners will be notified.
              </PictoText>
            </div>

            {/* Rating & Pictoquests */}
            <div className="mb-4 sm:mb-6">
              <PictoModuleTitle className="mb-3 sm:mb-4 text-sm sm:text-base">
                Rating & Pictoquests
              </PictoModuleTitle>

              <div className="space-y-2 sm:space-y-3">
                {/* Content Warning Switch */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <PictoText size="sm" color="white" className="text-xs sm:text-sm">
                      Content Warning?
                    </PictoText>
                    <Switch
                      checked={hasContentWarning}
                      onCheckedChange={setHasContentWarning}
                      className="data-[state=checked]:bg-[#ff668b]"
                    />
                  </div>
                  {hasContentWarning && (
                    <input
                      type="text"
                      value={contentWarningText}
                      onChange={(e) => setContentWarningText(e.target.value)}
                      placeholder="Describe the content warning..."
                      className="w-full h-[33px] px-3 bg-[#4d4d4d] text-white font-mono text-xs sm:text-sm placeholder:text-white/50 outline-none"
                    />
                  )}
                </div>

                {/* Pictoquest Done Switch */}
                <div className="flex items-center justify-between opacity-50">
                  <PictoText size="sm" color="white" className="text-xs sm:text-sm">
                    Pictoquest Done?
                  </PictoText>
                  <Switch
                    checked={isPictoquestDone}
                    onCheckedChange={setIsPictoquestDone}
                    disabled
                    className="data-[state=checked]:bg-[#ff668b]"
                  />
                </div>
              </div>
            </div>

            {/* Fit and Finish - Scoring Grid */}
            <div>
              <PictoModuleTitle className="mb-3 sm:mb-4 text-sm sm:text-base">
                Fit and Finish
              </PictoModuleTitle>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                {getScoringCategories().map((category) => (
                  <ScorePickerCell
                    key={category.id}
                    category={category}
                    value={scores[category.id]}
                    onChange={(points) => setScore(category.id, points)}
                    teamColor={teamColor}
                  />
                ))}
              </div>

              {/* Finish Toggle */}
              <div className="mt-3 sm:mt-4 flex items-center justify-between p-2 sm:p-3 bg-[#3a3a3a]">
                <div>
                  <PictoText size="sm" color="white" weight="bold" className="text-xs sm:text-sm">
                    Extra effort
                  </PictoText>
                  <PictoText size="xs" muted className="px-1 sm:px-2 text-[10px] sm:text-xs">
                    (+20% bonus)
                  </PictoText>
                </div>
                <Switch
                  checked={isFinished}
                  onCheckedChange={setIsFinished}
                  className="data-[state=checked]:bg-[var(--team-color)]"
                  style={{ "--team-color": teamColor } as React.CSSProperties}
                />
              </div>

            </div>
          </PictoModule>

          {/* Combined Score & Submit Button */}
          <button
            type="button"
            onClick={() => setShowConfirmation(true)}
            disabled={!canSubmit}
            className="w-full mt-3 sm:mt-4 h-12 sm:h-16 font-mono font-bold text-sm sm:text-lg uppercase transition-all relative overflow-hidden group"
            style={{
              backgroundColor: canSubmit
                ? isFriendlyFire()
                  ? "#d97706"
                  : teamColor
                : "#3a3a3a",
              color: canSubmit ? "#000" : "rgba(255,255,255,0.5)",
              boxShadow: canSubmit
                ? `0 0 20px ${isFriendlyFire() ? "#d97706" : teamColor}80, 0 0 40px ${isFriendlyFire() ? "#d97706" : teamColor}40`
                : "none",
            }}
          >
            {/* Animated glow pulse when ready */}
            {canSubmit && (
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity"
                style={{
                  background: `radial-gradient(circle at center, white 0%, transparent 70%)`,
                }}
              />
            )}

            <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
              {canSubmit ? (
                <>
                  <span>Preview Strike</span>
                  <span className="text-xs sm:text-sm opacity-70">
                    {calculateTotalScore()} pts
                    {isFriendlyFire() && " (FF -20%)"}
                  </span>
                </>
              ) : (
                <span className="text-xs sm:text-sm normal-case">
                  {selectedCharacters.length === 0
                    ? "Add a character to strike"
                    : strikeType === "writing" && !markdownContent.trim()
                      ? "Write your story"
                      : !imageFile && strikeType !== "writing"
                        ? "Upload your artwork"
                        : "Fill out scoring"}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </form>
  );

  // Build score details for gallery view
  // Uses plaqueLabel if available for clearer display (e.g., "Detailed BG" instead of "Detailed")
  const getScoreDetails = (): StrikeGalleryScoreDetail[] => {
    const categories = getScoringCategories();
    return categories
      .filter((cat) => scores[cat.id] !== undefined)
      .map((cat) => {
        const option = cat.options.find((o) => o.points === scores[cat.id]);
        return {
          category: cat.name,
          label: option?.plaqueLabel || option?.label || "",
        };
      })
      .filter((d) => d.label && d.label.toLowerCase() !== "none");
  };

  // Build characters for gallery view
  const getGalleryCharacters = (): StrikeGalleryCharacter[] => {
    return selectedCharacters.map((char) => ({
      name: char.name,
      slug: char.slug || undefined,
      ownerUsername: char.owner_username,
      ownerTeamColor: getOwnerTeamColor(char.owner_team),
    }));
  };

  // Handle confirmation submit
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();

    // Add all form fields
    formData.set("strike_type", strikeType);
    formData.set("base_score", String(calculateBaseScore()));
    formData.set("bonus_multiplier", String(calculateMultiplier()));

    selectedCharacters.forEach((char) => {
      formData.append("target_character_ids", char.id);
    });

    if (avengeInfo) {
      formData.set("avenges_strike_id", avengeInfo.id);
    }

    if (hasContentWarning && contentWarningText.trim()) {
      formData.set("content_warning", contentWarningText.trim());
    }

    if (strikeType === "writing") {
      formData.set("markdown_content", markdownContent);
    } else if (imageFile) {
      formData.set("image", imageFile);
    }

    // Add scoring details as JSON
    const scoreDetails = getScoreDetails();
    if (scoreDetails.length > 0) {
      formData.set("scoring_details", JSON.stringify(scoreDetails));
    }

    try {
      // Trigger the form action - this will redirect on success
      const result = await createStrike(formData);
      if (!result.success && result.error) {
        // Show error - go back to edit mode
        setSubmitError(result.error);
        setShowConfirmation(false);
        setIsSubmitting(false);
      }
      // On success, createStrike redirects so we won't reach here
    } catch {
      setSubmitError("Failed to submit strike");
      setShowConfirmation(false);
      setIsSubmitting(false);
    }
  };

  // Confirmation view
  if (showConfirmation) {
    return (
      <div className="min-h-[600px]">
        <StrikeGalleryView
          strikeType={strikeType}
          imagePreview={imagePreview}
          markdownContent={markdownContent}
          contentWarning={hasContentWarning ? contentWarningText : null}
          message={null}
          baseScore={calculateBaseScore()}
          bonusMultiplier={calculateMultiplier()}
          finalScore={calculateTotalScore()}
          creatorUsername={username}
          teamColor={teamColor}
          characters={getGalleryCharacters()}
          scoreDetails={getScoreDetails()}
          isPolished={isFinished}
          isFriendlyFire={isFriendlyFire()}
          isRevenge={isRevenge()}
          avengesStrikeId={avengeInfo?.id}
          avengesUsername={avengeInfo?.creatorUsername}
          mode="confirmation"
          onEdit={() => setShowConfirmation(false)}
          onSubmit={handleConfirmSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  return formContent;
}

// Score picker cell with icon grid
interface ScorePickerCellProps {
  category: ScoringCategory;
  value?: number;
  onChange: (points: number) => void;
  teamColor: string;
}

function ScorePickerCell({ category, value, onChange, teamColor }: ScorePickerCellProps) {
  const selectedOption = category.options.find((opt) => opt.points === value);
  const selectedIndex = selectedOption ? category.options.indexOf(selectedOption) : -1;

  return (
    <div className="bg-[#353535] p-2 sm:p-3 flex flex-col border border-[#4a4a4a]">
      {/* Category name */}
      <PictoText size="xs" className="mb-2 sm:mb-3 text-center text-white/70 font-semibold tracking-wide text-[10px] sm:text-xs">
        {category.name}
      </PictoText>

      {/* Icon grid */}
      <div className="flex justify-center gap-0">
        {category.options.map((option, index) => {
          const Icon = getIcon(option.icon);
          const isPastSelected = selectedIndex >= 0 && index <= selectedIndex;

          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onChange(option.points)}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center transition-all hover:scale-110 hover:bg-white/5"
              style={{
                color: isPastSelected ? teamColor : "rgba(255,255,255,0.25)",
                filter: isPastSelected ? "drop-shadow(0 0 4px currentColor)" : "none",
              }}
              title={option.label}
            >
              <Icon
                size={16}
                strokeWidth={isPastSelected ? 2.5 : 1.5}
                className="transition-all sm:w-5 sm:h-5"
              />
            </button>
          );
        })}
      </div>

      {/* Selected label */}
      <PictoText
        size="xs"
        style={{ color: selectedOption ? teamColor : undefined }}
        muted={!selectedOption}
        className="mt-2 sm:mt-3 text-center font-medium text-[10px] sm:text-xs"
      >
        {selectedOption?.label || "Select"}
      </PictoText>
    </div>
  );
}
