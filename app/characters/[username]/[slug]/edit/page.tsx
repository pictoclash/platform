"use client";

import { useActionState, use, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  updateCharacter,
  addCharacterImage,
  deleteCharacterImage,
  reorderCharacterImages,
  type ActionResult,
} from "../../../actions";
import { createClient } from "@/lib/supabase/client";
import { PictoModule, PictoText } from "@/components/picto";
import { PictoMenuButton } from "@/components/picto/primitives/picto-menu-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleHelp, X, Plus, Upload } from "lucide-react";
import type { CharacterPermissions, PermissionStatus, PermissionType } from "@/lib/schema";
import { getPermissionsByCategory, PERMISSION_STATUSES } from "@/lib/permissions";

const initialState: ActionResult = { success: false };

// Sortable image component for drag-and-drop
function SortableImage({
  img,
  isSelected,
  canDelete,
  characterName,
  onSelect,
  onDelete,
}: {
  img: { id: string; image_url: string };
  isSelected: boolean;
  canDelete: boolean;
  characterName: string;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="aspect-square bg-[#333] relative group"
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full h-full border-[3px] transition-colors cursor-grab active:cursor-grabbing"
        style={{
          borderColor: isSelected ? "#ffffff" : "transparent",
        }}
        {...attributes}
        {...listeners}
      >
        <Image
          src={img.image_url}
          alt={`${characterName} reference`}
          width={136}
          height={136}
          className="object-cover w-full h-full pointer-events-none"
        />
      </button>
      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="absolute top-1 right-1 p-1 bg-[#ff3b30] text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

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
};

type CharacterImage = {
  id: string;
  image_url: string;
  display_order: number;
};

function getPermissionStatus(
  permissions: CharacterPermissions | null,
  permissionTags: string[] | null,
  key: PermissionType
): PermissionStatus {
  if (permissions && permissions[key]) {
    return permissions[key]!;
  }
  if (!permissionTags) return "ask";
  const tag = permissionTags.find((t) => t.toLowerCase().includes(key));
  if (!tag) return "ask";
  if (tag.startsWith("please-") || tag.includes("please")) return "please";
  if (tag.startsWith("ok-") || tag.includes("ok")) return "ok";
  if (tag.startsWith("no-") || tag.includes("no")) return "no";
  return "ask";
}

export default function EditCharacterPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = use(params);
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [additionalImages, setAdditionalImages] = useState<CharacterImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalImageInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    async function loadCharacter() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // First get the owner by username
      const { data: owner } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", username)
        .single();

      if (!owner) {
        router.push("/profile");
        return;
      }

      // Then get the character by owner and slug
      const [{ data: charData }, { data: imagesData }] = await Promise.all([
        supabase
          .from("characters")
          .select("id, owner_id, name, slug, reference_image_url, description, design_notes, content_tags, permission_tags, permissions")
          .eq("owner_id", owner.id)
          .eq("slug", slug)
          .single<Character>(),
        supabase
          .from("character_images")
          .select("id, image_url, display_order")
          .eq("character_id", (await supabase
            .from("characters")
            .select("id")
            .eq("owner_id", owner.id)
            .eq("slug", slug)
            .single()).data?.id || "")
          .order("display_order", { ascending: true }),
      ]);

      if (!charData || charData.owner_id !== user.id) {
        router.push("/profile");
        return;
      }

      // Re-fetch images with correct character ID
      const { data: correctImages } = await supabase
        .from("character_images")
        .select("id, image_url, display_order")
        .eq("character_id", charData.id)
        .order("display_order", { ascending: true });

      setCharacter(charData);
      setAdditionalImages(correctImages || []);
      setSelectedImageUrl(charData.reference_image_url);
      setLoading(false);
    }

    loadCharacter();
  }, [username, slug, router]);

  const [state, formAction, pending] = useActionState(
    async (_prevState: ActionResult, formData: FormData) => {
      if (!character) return { success: false, error: "Character not found" };
      return await updateCharacter(character.id, formData);
    },
    initialState
  );

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedImageUrl(url);
    }
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !character) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    const result = await addCharacterImage(character.id, formData);
    if (result.success) {
      // Reload images
      const supabase = createClient();
      const { data } = await supabase
        .from("character_images")
        .select("id, image_url, display_order")
        .eq("character_id", character.id)
        .order("display_order", { ascending: true });
      setAdditionalImages(data || []);
    }
    setUploadingImage(false);
    if (additionalImageInputRef.current) {
      additionalImageInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!character) return;
    const imageToDelete = additionalImages.find((img) => img.id === imageId);
    const result = await deleteCharacterImage(character.id, imageId);
    if (result.success) {
      const newImages = additionalImages.filter((img) => img.id !== imageId);
      setAdditionalImages(newImages);
      // If we deleted the selected image, select the first remaining one
      if (imageToDelete && selectedImageUrl === imageToDelete.image_url && newImages.length > 0) {
        setSelectedImageUrl(newImages[0].image_url);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!character) return;
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = additionalImages.findIndex((img) => img.id === active.id);
      const newIndex = additionalImages.findIndex((img) => img.id === over.id);

      const newImages = arrayMove(additionalImages, oldIndex, newIndex);
      setAdditionalImages(newImages);

      // Save the new order to the database
      const imageOrders = newImages.map((img, index) => ({
        id: img.id,
        order: index,
      }));
      await reorderCharacterImages(character.id, imageOrders);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PictoText size="base" muted>Loading...</PictoText>
      </div>
    );
  }

  if (!character) {
    return null;
  }

  // Use character_images as source of truth, fallback to reference_image_url for legacy
  const allImages = additionalImages.length > 0
    ? additionalImages
    : [{ id: "legacy", image_url: character.reference_image_url, display_order: 0 }];
  const mainImageUrl = previewUrl || allImages[0]?.image_url || character.reference_image_url;
  const displayImageUrl = selectedImageUrl || mainImageUrl;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
      <form action={formAction}>
        {/* Character Header */}
        <PictoModule className="p-4 sm:p-6 text-center mb-3 sm:mb-4">
          <PictoText size="sm" muted className="block text-xs sm:text-sm truncate">
            {character.id}
          </PictoText>
          <input
            type="text"
            name="name"
            defaultValue={character.name}
            className="mt-2 bg-transparent text-center font-mono text-2xl sm:text-4xl font-bold text-white uppercase w-full outline-none border-b-2 border-transparent focus:border-white/50 transition-colors"
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
              {pending ? "Saving..." : "Save"}
            </button>
            <PictoMenuButton href={`/characters/${username}/${character.slug}`}>
              Cancel
            </PictoMenuButton>
          </div>

          {state.error && (
            <div className="mt-4 p-3 bg-[#ff3b30]/20 text-[#ff3b30]">
              <PictoText size="sm" className="text-xs sm:text-sm">{state.error}</PictoText>
            </div>
          )}
        </PictoModule>

        {/* Main Image + Film Strip */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3 sm:mb-4">
          {/* Main Image */}
          <PictoModule noPadding className="flex-1 overflow-hidden relative group">
            <div className="aspect-square bg-[#333] border-[3px] border-white/50">
              <Image
                src={displayImageUrl}
                alt={character.name}
                width={800}
                height={800}
                className="object-cover w-full h-full"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              name="reference_image"
              accept="image/*"
              onChange={handleMainImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 sm:transition-opacity"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload size={32} className="text-white" />
                <PictoText size="sm" color="white">Change Main Image</PictoText>
              </div>
            </button>
          </PictoModule>

          {/* Film Strip - All Images (Sortable) */}
          <PictoModule className="sm:w-[184px] flex-shrink-0 p-3 sm:p-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={allImages.map((img) => img.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-row sm:flex-col gap-2 sm:gap-4 overflow-x-auto sm:overflow-visible">
                  {allImages.map((img) => (
                    <SortableImage
                      key={img.id}
                      img={img}
                      isSelected={displayImageUrl === img.image_url}
                      canDelete={allImages.length > 1 && img.id !== "legacy"}
                      characterName={character.name}
                      onSelect={() => setSelectedImageUrl(img.image_url)}
                      onDelete={() => handleDeleteImage(img.id)}
                    />
                  ))}

                  {/* Add Image Button */}
                  <input
                    ref={additionalImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAddImage}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => additionalImageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-16 h-16 sm:w-auto sm:h-auto sm:aspect-square flex-shrink-0 bg-[#333] border border-dashed border-white/30 flex items-center justify-center hover:border-white/60 transition-colors disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <PictoText size="xs" muted>...</PictoText>
                    ) : (
                      <Plus size={20} className="sm:w-6 sm:h-6 text-white/50" />
                    )}
                  </button>
                </div>
              </SortableContext>
            </DndContext>
          </PictoModule>
        </div>

        {/* Bottom Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          {/* Left Column: Character Details */}
          <div className="flex-1 space-y-3 sm:space-y-4">
            {/* Character Details */}
            <PictoModule className="p-4 sm:p-6">
              <PictoText size="lg" weight="bold" color="white" className="block mb-3 sm:mb-4 text-base sm:text-lg">
                Character Details
              </PictoText>
              <textarea
                name="description"
                defaultValue={character.description || ""}
                placeholder="Describe your character's personality, backstory, etc."
                rows={4}
                className="w-full bg-[#333] text-white font-mono text-sm sm:text-base p-3 outline-none border border-white/20 focus:border-white/50 transition-colors resize-none"
              />



              {/* Design Notes */}
              <PictoText size="sm" weight="bold" color="white" className="block mt-4 sm:mt-6 mb-2 text-xs sm:text-sm">
                Design Notes
              </PictoText>
              <textarea
                name="design_notes"
                defaultValue={character.design_notes || ""}
                placeholder="Notes for artists: colors, proportions, important details..."
                rows={3}
                className="w-full bg-[#333] text-white font-mono text-sm sm:text-base p-3 outline-none border border-white/20 focus:border-white/50 transition-colors resize-none"
              />

              {/* Content Tags */}
              <PictoText size="sm" weight="bold" color="white" className="block mt-4 sm:mt-6 mb-2 text-xs sm:text-sm">
                Content Tags (Comma-separated)
              </PictoText>
              <input
                type="text"
                name="content_tags"
                defaultValue={character.content_tags?.join(", ") || ""}
                placeholder="fantasy, sci-fi, anthro (comma-separated)"
                className="w-full bg-[#333] text-white font-mono text-xs sm:text-sm p-3 outline-none border border-white/20 focus:border-white/50 transition-colors"
              />
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
                          const currentStatus = getPermissionStatus(
                            character.permissions,
                            character.permission_tags,
                            key
                          );
                          return (
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
                                defaultValue={currentStatus}
                                className="bg-[#333] text-white font-mono text-[10px] sm:text-xs font-bold uppercase px-2 py-1 outline-none border border-white/20 focus:border-white/50 transition-colors min-w-[70px] sm:min-w-[80px]"
                              >
                                {(Object.keys(PERMISSION_STATUSES) as PermissionStatus[]).map((status) => (
                                  <option key={status} value={status}>
                                    {PERMISSION_STATUSES[status].label}
                                  </option>
                                ))}
                              </select>
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
      </form>
    </div>
  );
}
