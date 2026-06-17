"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
  PictoModule,
  PictoText,
  TeamColors,
  ClashRankModule,
  PictoLoader,
  StrikeCard,
  CharacterCard,
  PictoArrayText,
  PictoTab,
  PictoTabGroup,
  PictoMenuButton,
  PictoIconButton,
} from "@/components/picto";
import { getUserGrade } from "@/lib/clash-rank";
import { Pencil, GripVertical, Trash2, Globe, ArrowDownToLine, ArrowUpFromLine, X } from "lucide-react";
import { reorderCharacters, deleteCharacterInline } from "@/app/characters/actions";
import { getSentStrikes, getReceivedStrikes, SentStrike, ReceivedStrike } from "./actions";
import { EditProfileModal, platformIcons } from "./edit-profile-modal";
import type { SocialLink } from "@/lib/schema";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  pronouns: string | null;
  bio: string | null;
  profile_image_url: string | null;
  social_links: SocialLink[];
  team: "a" | "b" | null;
  guild:
    | "pixelweavers"
    | "traditionalists"
    | "wordwrights"
    | "hybridisers"
    | "sculptors"
    | null;
  pictocash: number;
  is_active: boolean;
  is_admin: boolean;
  is_moderator: boolean;
  created_at: string;
};

type Character = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  reference_image_url: string;
  is_inactive: boolean;
  display_order: number;
};

type StrikeStats = {
  totalPoints: number;
  strikeCount: number;
  avgScore: number;
};

type TeamDisplay = {
  name: string;
  color: string | undefined;
};

interface ProfileContentProps {
  profile: Profile;
  characters: Character[];
  strikeStats: StrikeStats;
  teamDisplay: TeamDisplay;
  colors: TeamColors;
}

type Tab = "characters" | "strikes";
type StrikesSubTab = "sent" | "received";
type MobileSection = "profile" | "activity";

export function ProfileContent({
  profile,
  characters: initialCharacters,
  strikeStats,
  teamDisplay,
  colors,
}: ProfileContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("characters");
  const [strikesSubTab, setStrikesSubTab] = useState<StrikesSubTab>("sent");
  const [editMode, setEditMode] = useState(false);
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [characters, setCharacters] = useState(initialCharacters);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Mobile section toggle
  const [mobileSection, setMobileSection] = useState<MobileSection>("profile");

  // Lazy-loaded strikes data
  const [sentStrikes, setSentStrikes] = useState<SentStrike[] | null>(null);
  const [receivedStrikes, setReceivedStrikes] = useState<ReceivedStrike[] | null>(null);
  const [loadingSent, setLoadingSent] = useState(false);
  const [loadingReceived, setLoadingReceived] = useState(false);

  // Edit profile modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const teamColor = profile.team === "a" ? colors.teamA : profile.team === "b" ? colors.teamB : colors.teamA;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = characters.findIndex((item) => item.id === active.id);
      const newIndex = characters.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(characters, oldIndex, newIndex);

      setCharacters(newItems);
      setHasOrderChanges(true);
    }
  };

  const handleToggleEditMode = () => {
    if (editMode && hasOrderChanges) {
      // Save the order when exiting edit mode
      startTransition(async () => {
        const orders = characters.map((item, index) => ({
          id: item.id,
          order: index + 1,
        }));
        await reorderCharacters(orders);
        setHasOrderChanges(false);
      });
    }
    setEditMode(!editMode);
  };

  const handleDelete = (characterId: string) => {
    startTransition(async () => {
      const result = await deleteCharacterInline(characterId);
      if (result.success) {
        setCharacters((items) => items.filter((item) => item.id !== characterId));
        setDeleteConfirmId(null);
        router.refresh();
      }
    });
  };

  const handleTabChange = async (tab: Tab) => {
    setActiveTab(tab);

    // When switching to strikes, load the current sub-tab data
    if (tab === "strikes") {
      if (strikesSubTab === "sent" && sentStrikes === null && !loadingSent) {
        setLoadingSent(true);
        const result = await getSentStrikes();
        setSentStrikes(result.strikes);
        setLoadingSent(false);
      } else if (strikesSubTab === "received" && receivedStrikes === null && !loadingReceived) {
        setLoadingReceived(true);
        const result = await getReceivedStrikes();
        setReceivedStrikes(result.strikes);
        setLoadingReceived(false);
      }
    }
  };

  const handleStrikesSubTabChange = async (subTab: StrikesSubTab) => {
    setStrikesSubTab(subTab);

    // Lazy load data for the sub-tab
    if (subTab === "sent" && sentStrikes === null && !loadingSent) {
      setLoadingSent(true);
      const result = await getSentStrikes();
      setSentStrikes(result.strikes);
      setLoadingSent(false);
    } else if (subTab === "received" && receivedStrikes === null && !loadingReceived) {
      setLoadingReceived(true);
      const result = await getReceivedStrikes();
      setReceivedStrikes(result.strikes);
      setLoadingReceived(false);
    }
  };

  const formatGuild = (guild: string | null) => {
    if (!guild) return null;
    return guild.charAt(0).toUpperCase() + guild.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).getFullYear().toString();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">
      {/* Mobile Section Tabs */}
      <div className="md:hidden mb-4">
        <div className="flex border border-white/20 bg-[#202020]">
          <button
            onClick={() => setMobileSection("profile")}
            className="flex-1 px-4 py-3 font-mono font-bold text-sm uppercase transition-colors"
            style={{
              backgroundColor: mobileSection === "profile" ? teamColor : "transparent",
              color: mobileSection === "profile" ? "#202020" : "white",
            }}
          >
            Profile
          </button>
          <button
            onClick={() => setMobileSection("activity")}
            className="flex-1 px-4 py-3 font-mono font-bold text-sm uppercase transition-colors"
            style={{
              backgroundColor: mobileSection === "activity" ? teamColor : "transparent",
              color: mobileSection === "activity" ? "#202020" : "white",
            }}
          >
            Activity
          </button>
        </div>
      </div>

      {/* Mobile Sliding Container */}
      <div className="md:hidden overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: mobileSection === "profile" ? "translateX(0)" : "translateX(-100%)",
          }}
        >
          {/* Mobile Profile Section */}
          <div className="w-full flex-shrink-0 space-y-4 px-0.5">
            <MobileProfileSection
              profile={profile}
              teamColor={teamColor}
              teamDisplay={teamDisplay}
              strikeStats={strikeStats}
              formatDate={formatDate}
              formatGuild={formatGuild}
              onEditProfile={() => setIsEditProfileOpen(true)}
            />
          </div>

          {/* Mobile Activity Section */}
          <div className="w-full flex-shrink-0 space-y-4 px-0.5">
            <MobileActivitySection
              profile={profile}
              characters={characters}
              teamColor={teamColor}
              activeTab={activeTab}
              strikesSubTab={strikesSubTab}
              editMode={editMode}
              editMenuOpen={editMenuOpen}
              isPending={isPending}
              hasOrderChanges={hasOrderChanges}
              sentStrikes={sentStrikes}
              receivedStrikes={receivedStrikes}
              loadingSent={loadingSent}
              loadingReceived={loadingReceived}
              deleteConfirmId={deleteConfirmId}
              sensors={sensors}
              onTabChange={handleTabChange}
              onStrikesSubTabChange={handleStrikesSubTabChange}
              onToggleEditMode={handleToggleEditMode}
              onEditMenuOpen={setEditMenuOpen}
              onEditProfile={() => setIsEditProfileOpen(true)}
              onDragEnd={handleDragEnd}
              onDeleteRequest={setDeleteConfirmId}
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex gap-6">
        {/* Left Sidebar */}
        <div className="w-80 flex-shrink-0 space-y-4">
          {/* User Profile Module */}
          <PictoModule className="p-5">
            <div className="space-y-4">
              {/* Profile Image */}
              <div
                className="w-fill aspect-square border-[3px] bg-[#333]"
                style={{ borderColor: teamColor }}
              >
                {profile.profile_image_url ? (
                  <Image
                    src={profile.profile_image_url}
                    alt={profile.username}
                    width={342}
                    height={342}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PictoArrayText size="6xl" color="white" className="opacity-30">
                      {profile.username[0].toUpperCase()}
                    </PictoArrayText>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {profile.social_links && profile.social_links.length > 0 && (
                <div className="flex gap-2 items-center flex-wrap">
                  {profile.social_links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition-colors"
                      title={link.platform}
                    >
                      {platformIcons[link.platform] || <Globe size={20} />}
                    </a>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
              {/* Handle */}
              <PictoText as="span" size="sm" color="white" muted>
                @{profile.username}
              </PictoText>

              {/* Admin/Moderator Badge */}
              {profile.is_admin && (
                <span className="px-2 py-0.5 text-xs font-mono font-bold uppercase bg-red-500 text-white">
                  Admin
                </span>
              )}
              {profile.is_moderator && !profile.is_admin && (
                <span className="px-2 py-0.5 text-xs font-mono font-bold uppercase bg-amber-500 text-white">
                  Moderator
                </span>
              )}

              {/* Pronouns */}
              {profile.pronouns && (
                <PictoText as="span" size="sm" muted>
                  {profile.pronouns}
                </PictoText>
                )}
              </div>

              {/* Username */}
              <PictoText as="h1" size="4xl" weight="bold" className="" color="white">
                {profile.display_name || profile.username}
              </PictoText>

              {/* Bio */}
              {profile.bio && (
                <PictoText
                  as="p"
                  size="base"
                  color="white"
                  uppercase={false}
                  className="opacity-90"
                >
                  {profile.bio}
                </PictoText>
              )}

              {/* Team & Fighter Since */}
              <div className="flex gap-6">
                <div>
                  <PictoText size="xs" muted className="block">
                    Team
                  </PictoText>
                  <PictoText size="sm" weight="bold" color={teamColor}>
                    {teamDisplay.name}
                  </PictoText>
                </div>
                <div>
                  <PictoText size="xs" muted className="block">
                    Fighter Since
                  </PictoText>
                  <PictoText size="sm" weight="bold" color="white">
                    {formatDate(profile.created_at)}
                  </PictoText>
                </div>
              </div>

              {/* Guild & Points */}
              <div className="flex gap-6">
                {profile.guild && (
                  <div>
                    <PictoText size="sm" weight="bold" color={teamColor}>
                      {formatGuild(profile.guild)} Guild
                    </PictoText>
                  </div>
                )}
              </div>
            </div>
          </PictoModule>

          {/* Points Module */}

          <PictoModule>
            <div className="flex flex-row items-center gap-4">
              <PictoArrayText size="6xl" glow color={teamColor}>
                {strikeStats.totalPoints.toLocaleString()}
              </PictoArrayText>
              <PictoText muted className="translate-y-0.5">
                points scored
              </PictoText>
            </div>
          </PictoModule>

          {/* Clash Rank Module */}
          <ClashRankModule
            username={profile.display_name || profile.username}
            grade={getUserGrade(strikeStats.strikeCount, strikeStats.avgScore)}
            stats={{
              pointsScored: strikeStats.totalPoints,
              strikesSubmitted: strikeStats.strikeCount,
              avgScore: strikeStats.avgScore,
            }}
            teamColor={teamColor}
          />

        </div>



        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {/* Tab Bar */}
          <PictoTabGroup className="mb-6">
            <PictoTab
              onClick={() => handleTabChange("characters")}
              active={activeTab === "characters"}
              activeColor={teamColor}
            >
              Characters
            </PictoTab>
            <StrikesTabContainer
              active={activeTab === "strikes"}
              teamColor={teamColor}
              strikesSubTab={strikesSubTab}
              onTabClick={() => handleTabChange("strikes")}
              onSubTabChange={handleStrikesSubTabChange}
            />

            {/* Edit Button - only on Characters tab */}
            {activeTab === "characters" && (
              <div className="ml-auto flex items-center gap-2">
                {editMode ? (
                  // In character edit mode - show Done button
                  <PictoMenuButton
                    onClick={handleToggleEditMode}
                    disabled={isPending}
                    variant="primary"
                    className={isPending ? "opacity-50" : ""}
                  >
                    {isPending ? "Saving..." : "Done"}
                  </PictoMenuButton>
                ) : editMenuOpen ? (
                  // Edit menu open - show Profile and Characters options
                  <>
                    <PictoMenuButton
                      onClick={() => {
                        setEditMenuOpen(false);
                        setIsEditProfileOpen(true);
                      }}
                    >
                      Profile
                    </PictoMenuButton>
                    <PictoMenuButton
                      onClick={() => {
                        setEditMenuOpen(false);
                        setEditMode(true);
                      }}
                    >
                      Characters
                    </PictoMenuButton>
                    <PictoIconButton
                      onClick={() => setEditMenuOpen(false)}
                    >
                      <X size={14} />
                    </PictoIconButton>
                  </>
                ) : (
                  // Default - show Edit button
                  <PictoMenuButton onClick={() => setEditMenuOpen(true)}>
                    Edit
                    <Pencil size={14} />
                  </PictoMenuButton>
                )}
              </div>
            )}
          </PictoTabGroup>

          {/* Tab Content */}
          {activeTab === "characters" && (
            <div className="space-y-4">
              {characters.length > 0 ? (
                editMode ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={characters.map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {characters.map((character) => (
                        <SortableCharacterCard
                          key={character.id}
                          character={character}
                          teamColor={teamColor}
                          ownerUsername={profile.username}
                          onDelete={() => setDeleteConfirmId(character.id)}
                          isDeleting={isPending && deleteConfirmId === character.id}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  characters.map((character) => (
                    <CharacterCard
                      key={character.id}
                      id={character.id}
                      name={character.name}
                      slug={character.slug}
                      ownerUsername={profile.username}
                      description={character.description}
                      reference_image_url={character.reference_image_url}
                      teamColor={teamColor}
                    />
                  ))
                )
              ) : (
                <PictoModule className="p-12 text-center">
                  <PictoText size="xl" weight="bold" color="white" className="block mb-2">
                    No Characters Yet
                  </PictoText>
                  <PictoText size="sm" muted className="block mb-6">
                    Create your first character to start participating in events
                  </PictoText>
                  <Link
                    href="/characters/new"
                    className="inline-block px-6 py-2 font-mono font-bold uppercase text-sm"
                    style={{
                      backgroundColor: teamColor,
                      color: "#202020",
                    }}
                  >
                    Create Character
                  </Link>
                </PictoModule>
              )}

              {characters.length > 0 && (
                <Link href="/characters/new" className="block">
                  <PictoModule className="p-6 border-dashed border-white/30 hover:border-white/50 transition-colors text-center">
                    <PictoText size="base" weight="bold" color="white" className="opacity-60">
                      + Add New Character
                    </PictoText>
                  </PictoModule>
                </Link>
              )}
            </div>
          )}

          {activeTab === "strikes" && strikesSubTab === "sent" && (
            <div className="space-y-4">
              {loadingSent ? (
                <PictoModule className="p-12 text-center">
                  <PictoLoader color={teamColor} />
                  <PictoText size="sm" muted className="mt-4">
                    Loading strikes...
                  </PictoText>
                </PictoModule>
              ) : sentStrikes && sentStrikes.length > 0 ? (
                sentStrikes.map((strike) => (
                  <StrikeCard
                    key={strike.id}
                    variant="sent"
                    id={strike.id}
                    strike_type={strike.strike_type}
                    image_url={strike.image_url}
                    final_score={strike.final_score}
                    created_at={strike.created_at}
                    characters={strike.characters}
                    teamColor={teamColor}
                  />
                ))
              ) : (
                <PictoModule className="p-12 text-center">
                  <PictoText size="xl" weight="bold" color="white" className="block mb-2">
                    No Sent Strikes Yet
                  </PictoText>
                  <PictoText size="sm" muted className="block mb-6">
                    Create a strike to attack characters from the opposing team!
                  </PictoText>
                  <Link
                    href="/strikes/new"
                    className="inline-block px-6 py-2 font-mono font-bold uppercase text-sm"
                    style={{
                      backgroundColor: teamColor,
                      color: "#202020",
                    }}
                  >
                    Create Strike
                  </Link>
                </PictoModule>
              )}
            </div>
          )}

          {activeTab === "strikes" && strikesSubTab === "received" && (
            <div className="space-y-4">
              {loadingReceived ? (
                <PictoModule className="p-12 text-center">
                  <PictoLoader color={teamColor} />
                  <PictoText size="sm" muted className="mt-4">
                    Loading strikes...
                  </PictoText>
                </PictoModule>
              ) : receivedStrikes && receivedStrikes.length > 0 ? (
                receivedStrikes.map((strike) => (
                  <StrikeCard
                    key={strike.id}
                    variant="received"
                    id={strike.id}
                    strike_type={strike.strike_type}
                    image_url={strike.image_url}
                    final_score={strike.final_score}
                    created_at={strike.created_at}
                    message={strike.message}
                    creator={strike.creator}
                    character={strike.character}
                    teamColor={teamColor}
                  />
                ))
              ) : (
                <PictoModule className="p-12 text-center">
                  <PictoText size="xl" weight="bold" color="white" className="block mb-2">
                    No Received Strikes Yet
                  </PictoText>
                  <PictoText size="sm" muted>
                    When other artists create strikes featuring your characters, they&apos;ll appear here!
                  </PictoText>
                </PictoModule>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <PictoModule className="p-6 max-w-md mx-4">
            <PictoText size="xl" weight="bold" color="white" className="block mb-4">
              Delete Character?
            </PictoText>
            <PictoText size="sm" color="white" uppercase={false} className="block mb-6 opacity-80">
              This action cannot be undone. The character and all associated data will be permanently deleted.
            </PictoText>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 font-mono font-bold uppercase text-sm text-white border border-white/30 hover:bg-white/10 transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 font-mono font-bold uppercase text-sm bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </PictoModule>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        initialData={{
          display_name: profile.display_name,
          pronouns: profile.pronouns,
          bio: profile.bio,
          profile_image_url: profile.profile_image_url,
          social_links: profile.social_links || [],
        }}
        teamColor={teamColor}
        hasTeam={!!profile.team}
        totalPoints={strikeStats.totalPoints}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

function SortableCharacterCard({
  character,
  teamColor,
  ownerUsername,
  onDelete,
  isDeleting,
}: {
  character: Character;
  teamColor: string;
  ownerUsername: string;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: character.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };

  const characterId = `C-${character.id.slice(0, 7).toUpperCase()}`;

  return (
    <div ref={setNodeRef} style={style} className={isDeleting ? "opacity-50" : ""}>
      <PictoModule noPadding className="flex h-[165px] group">
        {/* Drag Handle */}
        <div
          className="flex flex-col justify-center px-2 border-r border-white/10 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <div className="p-2 text-white/40 hover:text-white">
            <GripVertical size={20} />
          </div>
        </div>

        {/* Character Image */}
        <div className="w-[132px] h-[132px] m-4 flex-shrink-0 bg-[#333]">
          <Image
            src={character.reference_image_url}
            alt={character.name}
            width={132}
            height={132}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Character Info */}
        <div className="flex-1 py-4 pr-4 min-w-0">
          <PictoText size="base" muted className="block">
            {characterId}
          </PictoText>
          <PictoText
            as="h3"
            size="4xl"
            weight="bold"
            color="white"
            className="mt-2 truncate"
          >
            {character.name}
          </PictoText>
          {character.description && (
            <PictoText
              as="p"
              size="base"
              color="white"
              uppercase={false}
              className="mt-2 line-clamp-2"
            >
              {character.description}
            </PictoText>
          )}
        </div>

        {/* Edit Mode Actions */}
        <div className="flex flex-col justify-center gap-2 px-4 border-l border-white/10">
          <Link
            href={`/characters/${ownerUsername}/${character.slug}/edit`}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            style={{ color: teamColor }}
          >
            <Pencil size={18} />
          </Link>
          <button
            className="p-2 text-red-500 hover:bg-white/10 rounded transition-colors"
            onClick={onDelete}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </PictoModule>
    </div>
  );
}

/**
 * Mobile profile section - condensed profile info, points, and clash rank.
 */
function MobileProfileSection({
  profile,
  teamColor,
  teamDisplay,
  strikeStats,
  formatDate,
  formatGuild,
  onEditProfile,
}: {
  profile: Profile;
  teamColor: string;
  teamDisplay: TeamDisplay;
  strikeStats: StrikeStats;
  formatDate: (date: string) => string;
  formatGuild: (guild: string | null) => string | null;
  onEditProfile: () => void;
}) {
  return (
    <>
      {/* Profile Card */}
      <PictoModule className="p-4">
        <div className="flex gap-4">
          {/* Profile Image */}
          <div
            className="w-24 h-24 flex-shrink-0 border-2 bg-[#333]"
            style={{ borderColor: teamColor }}
          >
            {profile.profile_image_url ? (
              <Image
                src={profile.profile_image_url}
                alt={profile.username}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PictoArrayText size="3xl" color="white" className="opacity-30">
                  {profile.username[0].toUpperCase()}
                </PictoArrayText>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <PictoText size="xs" muted>
                @{profile.username}
              </PictoText>
              {profile.pronouns && (
                <PictoText size="xs" muted>
                  {profile.pronouns}
                </PictoText>
              )}
            </div>
            <PictoText as="h1" size="xl" weight="bold" color="white" className="truncate">
              {profile.display_name || profile.username}
            </PictoText>
            <div className="flex items-center gap-3 mt-2">
              <PictoText size="xs" weight="bold" color={teamColor}>
                {teamDisplay.name}
              </PictoText>
              <PictoText size="xs" muted>
                Since {formatDate(profile.created_at)}
              </PictoText>
            </div>
            {profile.guild && (
              <PictoText size="xs" color={teamColor} className="mt-1">
                {formatGuild(profile.guild)} Guild
              </PictoText>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <PictoText
            as="p"
            size="sm"
            color="white"
            uppercase={false}
            className="mt-3 opacity-80"
          >
            {profile.bio}
          </PictoText>
        )}

        {/* Social Links */}
        {profile.social_links && profile.social_links.length > 0 && (
          <div className="flex gap-2 items-center flex-wrap mt-3">
            {profile.social_links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                title={link.platform}
              >
                {platformIcons[link.platform] || <Globe size={18} />}
              </a>
            ))}
          </div>
        )}

        {/* Edit Profile Button */}
        <button
          onClick={onEditProfile}
          className="mt-4 w-full py-2 px-4 font-mono font-bold text-sm uppercase border border-white/30 text-white/80 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <Pencil size={14} />
          Edit Profile
        </button>
      </PictoModule>

      {/* Points Module */}
      <PictoModule className="p-4">
        <div className="flex items-center gap-3">
          <PictoArrayText size="4xl" glow color={teamColor}>
            {strikeStats.totalPoints.toLocaleString()}
          </PictoArrayText>
          <PictoText muted size="sm">
            points scored
          </PictoText>
        </div>
      </PictoModule>

      {/* Clash Rank Module */}
      <ClashRankModule
        username={profile.display_name || profile.username}
        grade={getUserGrade(strikeStats.strikeCount, strikeStats.avgScore)}
        stats={{
          pointsScored: strikeStats.totalPoints,
          strikesSubmitted: strikeStats.strikeCount,
          avgScore: strikeStats.avgScore,
        }}
        teamColor={teamColor}
      />
    </>
  );
}

/**
 * Mobile activity section - characters/strikes tabs with edit functionality.
 */
function MobileActivitySection({
  profile,
  characters,
  teamColor,
  activeTab,
  strikesSubTab,
  editMode,
  editMenuOpen,
  isPending,
  hasOrderChanges,
  sentStrikes,
  receivedStrikes,
  loadingSent,
  loadingReceived,
  deleteConfirmId,
  sensors,
  onTabChange,
  onStrikesSubTabChange,
  onToggleEditMode,
  onEditMenuOpen,
  onEditProfile,
  onDragEnd,
  onDeleteRequest,
}: {
  profile: Profile;
  characters: Character[];
  teamColor: string;
  activeTab: Tab;
  strikesSubTab: StrikesSubTab;
  editMode: boolean;
  editMenuOpen: boolean;
  isPending: boolean;
  hasOrderChanges: boolean;
  sentStrikes: SentStrike[] | null;
  receivedStrikes: ReceivedStrike[] | null;
  loadingSent: boolean;
  loadingReceived: boolean;
  deleteConfirmId: string | null;
  sensors: ReturnType<typeof useSensors>;
  onTabChange: (tab: Tab) => void;
  onStrikesSubTabChange: (subTab: StrikesSubTab) => void;
  onToggleEditMode: () => void;
  onEditMenuOpen: (open: boolean) => void;
  onEditProfile: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDeleteRequest: (id: string | null) => void;
}) {
  return (
    <>
      {/* Tab Bar */}
      <div className="flex items-center gap-2 mb-4">
        <PictoTabGroup className="flex-1">
          <PictoTab
            onClick={() => onTabChange("characters")}
            active={activeTab === "characters"}
            activeColor={teamColor}
          >
            Characters
          </PictoTab>
          <MobileStrikesTabContainer
            active={activeTab === "strikes"}
            teamColor={teamColor}
            strikesSubTab={strikesSubTab}
            onTabClick={() => onTabChange("strikes")}
            onSubTabChange={onStrikesSubTabChange}
          />
        </PictoTabGroup>

        {/* Edit Button - only on Characters tab */}
        {activeTab === "characters" && (
          <div className="flex items-center gap-1">
            {editMode ? (
              <PictoMenuButton
                onClick={onToggleEditMode}
                disabled={isPending}
                variant="primary"
                className={isPending ? "opacity-50" : ""}
              >
                {isPending ? "..." : "Done"}
              </PictoMenuButton>
            ) : editMenuOpen ? (
              <>
                <PictoMenuButton
                  onClick={() => {
                    onEditMenuOpen(false);
                    onEditProfile();
                  }}
                >
                  Profile
                </PictoMenuButton>
                <PictoMenuButton
                  onClick={() => {
                    onEditMenuOpen(false);
                    onToggleEditMode();
                  }}
                >
                  Chars
                </PictoMenuButton>
                <PictoIconButton onClick={() => onEditMenuOpen(false)}>
                  <X size={14} />
                </PictoIconButton>
              </>
            ) : (
              <PictoMenuButton onClick={() => onEditMenuOpen(true)}>
                <Pencil size={14} />
              </PictoMenuButton>
            )}
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "characters" && (
        <div className="space-y-3">
          {characters.length > 0 ? (
            editMode ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={characters.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {characters.map((character) => (
                    <MobileSortableCharacterCard
                      key={character.id}
                      character={character}
                      teamColor={teamColor}
                      ownerUsername={profile.username}
                      onDelete={() => onDeleteRequest(character.id)}
                      isDeleting={isPending && deleteConfirmId === character.id}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              characters.map((character) => (
                <MobileCharacterCard
                  key={character.id}
                  character={character}
                  ownerUsername={profile.username}
                  teamColor={teamColor}
                />
              ))
            )
          ) : (
            <PictoModule className="p-8 text-center">
              <PictoText size="lg" weight="bold" color="white" className="block mb-2">
                No Characters Yet
              </PictoText>
              <PictoText size="xs" muted className="block mb-4">
                Create your first character to participate
              </PictoText>
              <Link
                href="/characters/new"
                className="inline-block px-4 py-2 font-mono font-bold uppercase text-xs"
                style={{
                  backgroundColor: teamColor,
                  color: "#202020",
                }}
              >
                Create Character
              </Link>
            </PictoModule>
          )}

          {characters.length > 0 && (
            <Link href="/characters/new" className="block">
              <PictoModule className="p-4 border-dashed border-white/30 hover:border-white/50 transition-colors text-center">
                <PictoText size="sm" weight="bold" color="white" className="opacity-60">
                  + Add New Character
                </PictoText>
              </PictoModule>
            </Link>
          )}
        </div>
      )}

      {activeTab === "strikes" && strikesSubTab === "sent" && (
        <div className="space-y-3">
          {loadingSent ? (
            <PictoModule className="p-8 text-center">
              <PictoLoader color={teamColor} />
              <PictoText size="xs" muted className="mt-3">
                Loading strikes...
              </PictoText>
            </PictoModule>
          ) : sentStrikes && sentStrikes.length > 0 ? (
            sentStrikes.map((strike) => (
              <StrikeCard
                key={strike.id}
                variant="sent"
                id={strike.id}
                strike_type={strike.strike_type}
                image_url={strike.image_url}
                final_score={strike.final_score}
                created_at={strike.created_at}
                characters={strike.characters}
                teamColor={teamColor}
              />
            ))
          ) : (
            <PictoModule className="p-8 text-center">
              <PictoText size="lg" weight="bold" color="white" className="block mb-2">
                No Sent Strikes Yet
              </PictoText>
              <PictoText size="xs" muted className="block mb-4">
                Create a strike to attack the opposing team!
              </PictoText>
              <Link
                href="/strikes/new"
                className="inline-block px-4 py-2 font-mono font-bold uppercase text-xs"
                style={{
                  backgroundColor: teamColor,
                  color: "#202020",
                }}
              >
                Create Strike
              </Link>
            </PictoModule>
          )}
        </div>
      )}

      {activeTab === "strikes" && strikesSubTab === "received" && (
        <div className="space-y-3">
          {loadingReceived ? (
            <PictoModule className="p-8 text-center">
              <PictoLoader color={teamColor} />
              <PictoText size="xs" muted className="mt-3">
                Loading strikes...
              </PictoText>
            </PictoModule>
          ) : receivedStrikes && receivedStrikes.length > 0 ? (
            receivedStrikes.map((strike) => (
              <StrikeCard
                key={strike.id}
                variant="received"
                id={strike.id}
                strike_type={strike.strike_type}
                image_url={strike.image_url}
                final_score={strike.final_score}
                created_at={strike.created_at}
                message={strike.message}
                creator={strike.creator}
                character={strike.character}
                teamColor={teamColor}
              />
            ))
          ) : (
            <PictoModule className="p-8 text-center">
              <PictoText size="lg" weight="bold" color="white" className="block mb-2">
                No Received Strikes Yet
              </PictoText>
              <PictoText size="xs" muted>
                Strikes featuring your characters appear here
              </PictoText>
            </PictoModule>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Mobile character card - compact version for mobile.
 */
function MobileCharacterCard({
  character,
  ownerUsername,
  teamColor,
}: {
  character: Character;
  ownerUsername: string;
  teamColor: string;
}) {
  return (
    <Link href={`/characters/${ownerUsername}/${character.slug}`}>
      <PictoModule noPadding className="flex h-24">
        <div className="w-24 h-24 flex-shrink-0 bg-[#333]">
          <Image
            src={character.reference_image_url}
            alt={character.name}
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1 p-3 min-w-0 flex flex-col justify-center">
          <PictoText size="xs" muted className="block">
            C-{character.id.slice(0, 7).toUpperCase()}
          </PictoText>
          <PictoText
            as="h3"
            size="lg"
            weight="bold"
            color="white"
            className="truncate"
          >
            {character.name}
          </PictoText>
        </div>
      </PictoModule>
    </Link>
  );
}

/**
 * Mobile sortable character card for edit mode.
 */
function MobileSortableCharacterCard({
  character,
  teamColor,
  ownerUsername,
  onDelete,
  isDeleting,
}: {
  character: Character;
  teamColor: string;
  ownerUsername: string;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: character.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDeleting ? "opacity-50" : ""}>
      <PictoModule noPadding className="flex h-24">
        {/* Drag Handle */}
        <div
          className="flex items-center px-2 border-r border-white/10 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} className="text-white/40" />
        </div>

        {/* Character Image */}
        <div className="w-20 h-20 m-2 flex-shrink-0 bg-[#333]">
          <Image
            src={character.reference_image_url}
            alt={character.name}
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Character Info */}
        <div className="flex-1 py-2 min-w-0 flex flex-col justify-center">
          <PictoText size="xs" muted className="block">
            C-{character.id.slice(0, 7).toUpperCase()}
          </PictoText>
          <PictoText
            as="h3"
            size="base"
            weight="bold"
            color="white"
            className="truncate"
          >
            {character.name}
          </PictoText>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 px-2 border-l border-white/10">
          <Link
            href={`/characters/${ownerUsername}/${character.slug}/edit`}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            style={{ color: teamColor }}
          >
            <Pencil size={16} />
          </Link>
          <button
            className="p-2 text-red-500 hover:bg-white/10 rounded transition-colors"
            onClick={onDelete}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </PictoModule>
    </div>
  );
}

/**
 * Mobile strikes tab container - more compact version.
 */
function MobileStrikesTabContainer({
  active,
  teamColor,
  strikesSubTab,
  onTabClick,
  onSubTabChange,
}: {
  active: boolean;
  teamColor: string;
  strikesSubTab: StrikesSubTab;
  onTabClick: () => void;
  onSubTabChange: (tab: StrikesSubTab) => void;
}) {
  if (active) {
    return (
      <div
        className="flex items-center transition-colors"
        style={{ backgroundColor: teamColor }}
      >
        <button
          onClick={onTabClick}
          className="px-3 py-2 font-mono font-bold text-xs uppercase text-[#202020]"
        >
          Strikes
        </button>
        <div className="flex items-center gap-0.5 border-l border-black/20 px-1.5">
          <button
            onClick={() => onSubTabChange("received")}
            className="p-1 transition-colors text-black/50 hover:bg-black/20 hover:text-black/80"
            style={strikesSubTab === "received" ? { backgroundColor: "#202020", color: teamColor } : undefined}
            title="Received"
          >
            <ArrowDownToLine size={14} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onSubTabChange("sent")}
            className="p-1 transition-colors text-black/50 hover:bg-black/20 hover:text-black/80"
            style={strikesSubTab === "sent" ? { backgroundColor: "#202020", color: teamColor } : undefined}
            title="Sent"
          >
            <ArrowUpFromLine size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onTabClick}
      className="px-3 py-2 font-mono font-bold text-xs uppercase bg-[#202020] text-white hover:bg-white hover:text-[#202020] transition-colors"
    >
      Strikes
    </button>
  );
}

/**
 * Strikes tab with sub-tabs for sent/received.
 * Active state uses dynamic team color, inactive uses Tailwind hover.
 */
function StrikesTabContainer({
  active,
  teamColor,
  strikesSubTab,
  onTabClick,
  onSubTabChange,
}: {
  active: boolean;
  teamColor: string;
  strikesSubTab: "sent" | "received";
  onTabClick: () => void;
  onSubTabChange: (tab: "sent" | "received") => void;
}) {
  // When active, use inline style for dynamic team color
  // When inactive, use Tailwind classes for hover
  if (active) {
    return (
      <div
        className="flex items-center transition-colors"
        style={{ backgroundColor: teamColor }}
      >
        <button
          onClick={onTabClick}
          className="px-5 py-2 font-mono font-bold text-sm uppercase text-[#202020]"
        >
          Strikes
        </button>
        <div className="flex items-center gap-1 border-l border-black/20 px-2">
          <button
            onClick={() => onSubTabChange("received")}
            className="p-1.5 transition-colors text-black/50 hover:bg-black/20 hover:text-black/80"
            style={strikesSubTab === "received" ? { backgroundColor: "#202020", color: teamColor } : undefined}
            title="Received"
          >
            <ArrowDownToLine size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onSubTabChange("sent")}
            className="p-1.5 transition-colors text-black/50 hover:bg-black/20 hover:text-black/80"
            style={strikesSubTab === "sent" ? { backgroundColor: "#202020", color: teamColor } : undefined}
            title="Sent"
          >
            <ArrowUpFromLine size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onTabClick}
      className="px-5 py-2 font-mono font-bold text-sm uppercase bg-[#202020] text-white hover:bg-white hover:text-[#202020] transition-colors"
    >
      Strikes
    </button>
  );
}
