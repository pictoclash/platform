"use client";

import { useActionState, useState, useRef } from "react";
import Image from "next/image";
import { createCharacter, type ActionResult } from "../actions";
import { PictoModule, PictoText } from "@/components/picto";
import { PictoMenuButton } from "@/components/picto/primitives/picto-menu-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleHelp, Upload } from "lucide-react";
import type { PermissionStatus } from "@/lib/schema";
import { getPermissionsByCategory, PERMISSION_STATUSES } from "@/lib/permissions";

const initialState: ActionResult = { success: false };

export default function NewCharacterPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prevState: ActionResult, formData: FormData) => {
      return await createCharacter(formData);
    },
    initialState
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
      <form action={formAction}>
        {/* Character Header */}
        <PictoModule className="p-4 sm:p-6 text-center mb-3 sm:mb-4">
          <PictoText size="sm" muted className="block text-xs sm:text-sm">
            New Character
          </PictoText>
          <input
            type="text"
            name="name"
            placeholder="CHARACTER NAME"
            className="mt-2 bg-transparent text-center font-mono text-2xl sm:text-4xl font-bold text-white uppercase w-full outline-none border-b-2 border-transparent focus:border-white/50 transition-colors placeholder:text-white/30"
            required
          />
          {state.fieldErrors?.name && (
            <PictoText size="sm" color="#ff3b30" className="mt-2 text-xs sm:text-sm">
              {state.fieldErrors.name[0]}
            </PictoText>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button
              type="submit"
              disabled={pending}
              className="px-3 sm:px-4 py-2 font-mono font-bold text-xs sm:text-sm uppercase transition-colors bg-white text-[#202020] hover:bg-[#202020] hover:text-white disabled:opacity-50"
            >
              {pending ? "Creating..." : "Create"}
            </button>
            <PictoMenuButton href="/profile">
              Cancel
            </PictoMenuButton>
          </div>

          {state.error && (
            <div className="mt-4 p-3 bg-[#ff3b30]/20 text-[#ff3b30]">
              <PictoText size="sm" className="text-xs sm:text-sm">{state.error}</PictoText>
            </div>
          )}
        </PictoModule>

        {/* Main Image */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3 sm:mb-4">
          <PictoModule noPadding className="flex-1 overflow-hidden relative group">
            <div className="aspect-square bg-[#333] border-[3px] border-white/50 flex items-center justify-center">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={800}
                  height={800}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="text-center p-4 sm:p-8">
                  <Upload size={36} className="sm:w-12 sm:h-12 text-white/30 mx-auto mb-3 sm:mb-4" />
                  <PictoText size="base" muted className="text-sm sm:text-base">
                    Tap to upload reference image
                  </PictoText>
                  <PictoText size="xs" muted className="mt-2 text-[10px] sm:text-xs">
                    PNG, JPG, max 5MB
                  </PictoText>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              name="reference_image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              required
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 sm:transition-opacity"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload size={32} className="text-white" />
                <PictoText size="sm" color="white">
                  {previewUrl ? "Change Image" : "Upload Image"}
                </PictoText>
              </div>
            </button>
          </PictoModule>

          {/* Placeholder for film strip - hidden on mobile, shown on desktop */}
          <PictoModule className="hidden sm:block w-[184px] flex-shrink-0 p-6">
            <div className="flex flex-col gap-4">
              <div className="aspect-square bg-[#333] border border-dashed border-white/20 flex items-center justify-center">
                <PictoText size="xs" muted className="text-center px-2">
                  Additional images can be added after creation
                </PictoText>
              </div>
            </div>
          </PictoModule>
        </div>

        {/* Bottom Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          {/* Left Column: Character Details */}
          <div className="flex-1 space-y-3 sm:space-y-4">
            <PictoModule className="p-4 sm:p-6">
              <PictoText size="lg" weight="bold" color="white" className="block mb-3 sm:mb-4 text-base sm:text-lg">
                Character Details
              </PictoText>
              <textarea
                name="description"
                placeholder="Describe your character's personality, backstory, etc."
                rows={4}
                className="w-full bg-[#333] text-white font-mono text-sm sm:text-base p-3 outline-none border border-white/20 focus:border-white/50 transition-colors resize-none"
              />
              {state.fieldErrors?.description && (
                <PictoText size="sm" color="#ff3b30" className="mt-2 text-xs sm:text-sm">
                  {state.fieldErrors.description[0]}
                </PictoText>
              )}

              {/* Content Tags */}
              <PictoText size="sm" weight="bold" color="white" className="block mt-4 sm:mt-6 mb-2 text-xs sm:text-sm">
                Content Tags
              </PictoText>
              <input
                type="text"
                name="content_tags"
                placeholder="fantasy, sci-fi, anthro (comma-separated)"
                className="w-full bg-[#333] text-white font-mono text-xs sm:text-sm p-3 outline-none border border-white/20 focus:border-white/50 transition-colors"
              />

              {/* Design Notes */}
              <PictoText size="sm" weight="bold" color="white" className="block mt-4 sm:mt-6 mb-2 text-xs sm:text-sm">
                Design Notes
              </PictoText>
              <textarea
                name="design_notes"
                placeholder="Notes for artists: colors, proportions, important details..."
                rows={3}
                className="w-full bg-[#333] text-white font-mono text-sm sm:text-base p-3 outline-none border border-white/20 focus:border-white/50 transition-colors resize-none"
              />
              {state.fieldErrors?.design_notes && (
                <PictoText size="sm" color="#ff3b30" className="mt-2 text-xs sm:text-sm">
                  {state.fieldErrors.design_notes[0]}
                </PictoText>
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
                        {category.permissions.map(({ key, label, description }) => (
                          <div key={key} className="flex items-center gap-2 sm:gap-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="p-1 text-white/50 hover:bg-white hover:text-[#202020] transition-colors flex-shrink-0"
                                >
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
                            <select
                              name={`permission_${key}`}
                              defaultValue="ask"
                              className="bg-[#333] text-white font-mono text-[10px] sm:text-xs font-bold uppercase px-2 py-1 outline-none border border-white/20 focus:border-white/50 transition-colors min-w-[70px] sm:min-w-[80px]"
                            >
                              {(Object.keys(PERMISSION_STATUSES) as PermissionStatus[]).map((status) => (
                                <option key={status} value={status}>
                                  {PERMISSION_STATUSES[status].label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </PictoModule>
          </div>
        </div>
      </form>
    </div>
  );
}
