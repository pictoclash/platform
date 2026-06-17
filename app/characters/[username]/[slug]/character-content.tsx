"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PictoModule,
  PictoText,
  PictoArrayText,
} from "@/components/picto";
import { PictoMenuButton } from "@/components/picto/primitives/picto-menu-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Flag, CircleHelp, Pencil, Copy, Check } from "lucide-react";
import type { CharacterPermissions, PermissionType, PermissionStatus } from "@/lib/schema";
import { getPermissionsByCategory, PERMISSION_STATUSES } from "@/lib/permissions";

type Character = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  reference_image_url: string;
  description: string | null;
  design_notes: string | null;
  content_tags: string[] | null;
  permission_tags: string[] | null;
  permissions: CharacterPermissions | null;
  is_inactive: boolean;
  created_at: string;
};

type Owner = {
  username: string;
  display_name: string | null;
};

type CharacterImage = {
  id: string;
  image_url: string;
  display_order: number;
};

type Strike = {
  id: string;
  strike_type: string;
  image_url: string | null;
  final_score: number;
  created_at: string;
  creator_username: string | null;
};

interface CharacterContentProps {
  character: Character;
  owner: Owner | null;
  additionalImages: CharacterImage[];
  strikes: Strike[];
  isOwner: boolean;
  isLoggedIn: boolean;
  teamColor: string;
}

function getPermissionStatus(
  permissions: CharacterPermissions | null,
  permissionTags: string[] | null,
  key: PermissionType
): PermissionStatus {
  // First check structured permissions
  if (permissions && permissions[key]) {
    return permissions[key]!;
  }
  // Fallback to legacy permission_tags
  if (!permissionTags) return "ask";
  const tag = permissionTags.find((t) => t.toLowerCase().includes(key));
  if (!tag) return "ask";
  if (tag.startsWith("please-") || tag.includes("please")) return "please";
  if (tag.startsWith("ok-") || tag.includes("ok")) return "ok";
  if (tag.startsWith("no-") || tag.includes("no")) return "no";
  return "ask";
}

export function CharacterContent({
  character,
  owner,
  additionalImages,
  strikes,
  isOwner,
  isLoggedIn,
  teamColor,
}: CharacterContentProps) {
  // Use character_images as source of truth, fallback to reference_image_url for legacy
  const allImages = additionalImages.length > 0
    ? additionalImages
    : [{ id: "main", image_url: character.reference_image_url, display_order: 0 }];
  const mainImageUrl = allImages[0]?.image_url || character.reference_image_url;
  const [selectedImageUrl, setSelectedImageUrl] = useState(mainImageUrl);
  const [copied, setCopied] = useState(false);

  const copyId = async () => {
    await navigator.clipboard.writeText(character.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
      {/* Character Header */}
      <PictoModule className="p-4 sm:p-6 text-center relative">
        {/* Edit button in corner for owner */}
        {isOwner && (
          <Link
            href={`/characters/${owner?.username}/${character.slug}/edit`}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-white/50 hover:bg-white hover:text-[#202020] transition-colors"
          >
            <Pencil size={18} />
          </Link>
        )}

        <div className="flex items-center justify-center gap-2">
          <PictoText size="sm" muted className="text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">
            {character.id}
          </PictoText>
          <button
            type="button"
            onClick={copyId}
            className="p-1 text-white/50 hover:bg-white hover:text-[#202020] transition-colors flex-shrink-0"
            title="Copy UUID"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <PictoText as="h1" size="4xl" weight="bold" color="white" className="mt-2 text-2xl sm:text-4xl">
          {character.name}
        </PictoText>
        {owner && (
          <Link href={`/user/${owner.username}`} className="inline-block mt-2 hover:opacity-80">
            <PictoText size="base" color="white" className="text-sm sm:text-base">
              by{" "}
              <span className="font-bold" style={{ color: teamColor }}>
                @{owner.username.toUpperCase()}
              </span>
            </PictoText>
          </Link>
        )}

        {/* Action Buttons */}
        {!isOwner && isLoggedIn && (
          <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
            <Link
              href={`/strikes/new?target=${character.id}`}
              className="px-3 sm:px-4 py-2 font-mono font-bold text-xs sm:text-sm uppercase transition-colors hover:opacity-80"
              style={{ backgroundColor: teamColor, color: "#202020" }}
            >
              Strike!
            </Link>
            <PictoMenuButton variant="danger">
              <Flag size={14} />
              <span className="hidden sm:inline">Report</span>
            </PictoMenuButton>
          </div>
        )}
      </PictoModule>

      {/* Main Image + Film Strip */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Main Image */}
        <PictoModule noPadding className="flex-1 overflow-hidden">
          <div
            className="aspect-square bg-[#1a1a1a] border-[3px] flex items-center justify-center"
            style={{ borderColor: teamColor }}
          >
            <Image
              src={selectedImageUrl}
              alt={character.name}
              width={800}
              height={800}
              className="object-contain max-w-full max-h-full"
            />
          </div>
        </PictoModule>

        {/* Film Strip - All Images */}
        {allImages.length > 1 && (
          <PictoModule className="sm:w-[184px] flex-shrink-0 p-3 sm:p-6">
            <div className="flex flex-row sm:flex-col gap-2 sm:gap-4 overflow-x-auto sm:overflow-visible">
              {allImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageUrl(img.image_url)}
                  className="w-16 h-16 sm:w-auto sm:h-auto sm:aspect-square flex-shrink-0 bg-[#333] border-[3px] transition-colors"
                  style={{
                    borderColor: selectedImageUrl === img.image_url ? teamColor : "transparent",
                  }}
                >
                  <Image
                    src={img.image_url}
                    alt={`${character.name} reference`}
                    width={136}
                    height={136}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          </PictoModule>
        )}
      </div>

      {/* Bottom Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        {/* Left Column: Character Details + Strikes */}
        <div className="flex-1 space-y-3 sm:space-y-4">
          {/* Character Details */}
          <PictoModule className="p-4 sm:p-6">
            <PictoText size="lg" weight="bold" color="white" className="block mb-3 sm:mb-4 text-base sm:text-lg">
              Character Details
            </PictoText>
            {character.description ? (
              <PictoText size="base" color="white" uppercase={false} className="opacity-90 text-sm sm:text-base">
                {character.description}
              </PictoText>
            ) : (
              <PictoText size="base" muted uppercase={false} className="text-sm sm:text-base">
                No description provided.
              </PictoText>
            )}

            {/* Design Notes */}
            {character.design_notes && (
              <div className="mt-4 sm:mt-6">
                <PictoText size="sm" weight="bold" color="white" className="block mb-2 text-xs sm:text-sm">
                  Design Notes
                </PictoText>
                <PictoText size="base" color="white" uppercase={false} className="opacity-90 text-sm sm:text-base">
                  {character.design_notes}
                </PictoText>
              </div>
            )}
          {/* Content Tags */}
          {character.content_tags && character.content_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 sm:mt-6">
              {character.content_tags.map((tag) => (
                <div
                  key={tag}
                  className="px-3 py-1.5 sm:px-4 sm:py-2"
                  style={{ backgroundColor: teamColor }}
                >
                  <PictoText size="sm" weight="bold" color="#202020" className="text-xs sm:text-sm">
                    {tag}
                  </PictoText>
                </div>
              ))}
            </div>
          )}
          </PictoModule>


          {/* Strikes Involving This Character */}
          <PictoModule className="p-4 sm:p-6">
            <PictoText size="lg" weight="bold" color="white" className="block mb-4 sm:mb-6 text-base sm:text-lg">
              Strikes Involving {character.name}
            </PictoText>
            {strikes.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {strikes.slice(0, 3).map((strike) => (
                  <Link
                    key={strike.id}
                    href={`/strikes/${strike.id}`}
                    className="flex items-center gap-3 sm:gap-4 group"
                  >
                    {/* Strike Thumbnail */}
                    <div className="w-14 h-14 sm:w-[73px] sm:h-[73px] bg-[#333] flex-shrink-0">
                      {strike.image_url && (
                        <Image
                          src={strike.image_url}
                          alt="Strike"
                          width={73}
                          height={73}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>

                    {/* Strike Info */}
                    <div className="flex-1 min-w-0">
                      <PictoText size="base" color="white" className="text-sm sm:text-base truncate">
                        from{" "}
                        <span className="font-bold">@{strike.creator_username?.toUpperCase()}</span>
                      </PictoText>
                      <PictoText size="sm" muted className="block text-xs sm:text-sm">
                        {new Date(strike.created_at).toLocaleDateString()}
                      </PictoText>
                    </div>

                    {/* Score */}
                    <PictoArrayText size="4xl" color={teamColor} className="text-2xl sm:text-4xl">
                      {strike.final_score}
                    </PictoArrayText>
                  </Link>
                ))}
                {strikes.length > 3 && (
                  <PictoText size="sm" muted className="text-center pt-2 text-xs sm:text-sm">
                    +{strikes.length - 3} more strikes
                  </PictoText>
                )}
              </div>
            ) : (
              <div className="text-center py-4 sm:py-6">
                <PictoText size="base" muted className="text-sm sm:text-base">
                  No strikes yet. Be the first to create one!
                </PictoText>
                {isLoggedIn && !isOwner && (
                  <Link
                    href={`/strikes/new?target=${character.id}`}
                    className="inline-block mt-4 px-4 sm:px-6 py-2 font-mono font-bold uppercase text-xs sm:text-sm"
                    style={{ backgroundColor: teamColor, color: "#202020" }}
                  >
                    Create Strike
                  </Link>
                )}
              </div>
            )}
          </PictoModule>
        </div>

        {/* Right Column: Permissions */}
        <div className="lg:w-[388px] flex-shrink-0">
          <PictoModule className="p-4 sm:p-6 h-full">
            {/* Permissions */}
            <PictoText size="lg" weight="bold" color="white" className="block mb-3 sm:mb-4 text-base sm:text-lg">
              Permissions
            </PictoText>
            <TooltipProvider>
              <div className="space-y-4 sm:space-y-6">
                {getPermissionsByCategory().map((category) => (
                  <div key={category.key}>
                    <PictoText size="sm" weight="bold" muted className="block mb-2 text-xs sm:text-sm">
                      {category.label}
                    </PictoText>
                    <div className="space-y-2 sm:space-y-3">
                      {category.permissions.map(({ key, label, description }) => {
                        const status = getPermissionStatus(character.permissions, character.permission_tags, key);
                        const { bg, label: statusLabel } = PERMISSION_STATUSES[status];
                        return (
                          <div key={key} className="flex items-center gap-2 sm:gap-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="p-1 text-white/50 hover:bg-white hover:text-[#202020] transition-colors flex-shrink-0">
                                  <CircleHelp size={16} className="sm:w-[18px] sm:h-[18px]" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-[200px]">
                                <p>{description}</p>
                              </TooltipContent>
                            </Tooltip>
                            <PictoText size="base" color="white" uppercase={false} className="flex-1 text-sm sm:text-base">
                              {label}
                            </PictoText>
                            <div
                              className="px-2 sm:px-3 py-1 text-center min-w-[60px] sm:min-w-[70px]"
                              style={{ backgroundColor: bg }}
                            >
                              <PictoText size="xs" weight="bold" color="white" className="text-[10px] sm:text-xs">
                                {statusLabel}
                              </PictoText>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </PictoModule>
        </div>
      </div>
    </div>
  );
}
