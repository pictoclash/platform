"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe } from "lucide-react";
import {
  PictoModule,
  PictoText,
  TeamColors,
  ClashRankModule,
  CharacterCard,
  StrikeCard,
  PictoLoader,
  PictoArrayText,
  PictoTab,
  PictoTabGroup,
} from "@/components/picto";
import { platformIcons } from "@/app/profile/edit-profile-modal";
import { getUserGrade } from "@/lib/clash-rank";
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

type SentStrike = {
  id: string;
  strike_type: "visual" | "writing" | "sculpture";
  image_url: string | null;
  final_score: number;
  created_at: string;
  characters: {
    id: string;
    name: string;
    reference_image_url: string;
    owner_username: string;
  }[];
};

interface UserContentProps {
  profile: Profile;
  characters: Character[];
  strikeStats: StrikeStats;
  teamDisplay: TeamDisplay;
  colors: TeamColors;
  sentStrikes: SentStrike[];
  isOwnProfile: boolean;
}

type Tab = "characters" | "strikes";
type MobileSection = "profile" | "activity";

export function UserContent({
  profile,
  characters,
  strikeStats,
  teamDisplay,
  colors,
  sentStrikes,
  isOwnProfile,
}: UserContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>("characters");
  const [mobileSection, setMobileSection] = useState<MobileSection>("profile");

  const teamColor =
    profile.team === "a"
      ? colors.teamA
      : profile.team === "b"
      ? colors.teamB
      : colors.teamA;

  const formatGuild = (guild: string | null) => {
    if (!guild) return null;
    return guild.charAt(0).toUpperCase() + guild.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).getFullYear().toString();
  };

  const grade = getUserGrade(strikeStats.strikeCount, strikeStats.avgScore);

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
              grade={grade}
            />
          </div>

          {/* Mobile Activity Section */}
          <div className="w-full flex-shrink-0 space-y-4 px-0.5">
            <MobileActivitySection
              profile={profile}
              characters={characters}
              sentStrikes={sentStrikes}
              teamColor={teamColor}
              activeTab={activeTab}
              onTabChange={setActiveTab}
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
                className="w-full aspect-square border-[3px] bg-[#333]"
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

              {/* Display Name */}
              <PictoText as="h1" size="4xl" weight="bold" color="white">
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
                  <PictoText size="base" weight="bold" color={teamColor}>
                    {teamDisplay.name}
                  </PictoText>
                </div>
                <div>
                  <PictoText size="xs" muted className="block">
                    Fighter Since
                  </PictoText>
                  <PictoText size="base" weight="bold" color="white">
                    {formatDate(profile.created_at)}
                  </PictoText>
                </div>
              </div>

              {/* Guild */}
              {profile.guild && (
                <div>
                  <PictoText size="xs" muted className="block">
                    Guild
                  </PictoText>
                  <PictoText size="base" weight="bold" color="white">
                    {formatGuild(profile.guild)}
                  </PictoText>
                </div>
              )}
            </div>
          </PictoModule>

          {/* Clash Rank Module */}
          <ClashRankModule
            username={profile.username}
            grade={grade}
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
              onClick={() => setActiveTab("characters")}
              active={activeTab === "characters"}
              activeColor={teamColor}
            >
              Characters
            </PictoTab>
            <PictoTab
              onClick={() => setActiveTab("strikes")}
              active={activeTab === "strikes"}
              activeColor={teamColor}
            >
              Strikes
            </PictoTab>
          </PictoTabGroup>

          {/* Tab Content */}
          {activeTab === "characters" && (
            <div className="space-y-4">
              {characters.length > 0 ? (
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
              ) : (
                <PictoModule className="p-12 text-center">
                  <PictoText size="xl" weight="bold" color="white" className="block mb-2">
                    No Characters Yet
                  </PictoText>
                  <PictoText size="sm" muted>
                    This user hasn&apos;t created any characters yet.
                  </PictoText>
                </PictoModule>
              )}
            </div>
          )}

          {activeTab === "strikes" && (
            <div className="space-y-4">
              {sentStrikes.length > 0 ? (
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
                    No Strikes Yet
                  </PictoText>
                  <PictoText size="sm" muted>
                    This user hasn&apos;t submitted any strikes yet.
                  </PictoText>
                </PictoModule>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile profile section for user page.
 */
function MobileProfileSection({
  profile,
  teamColor,
  teamDisplay,
  strikeStats,
  formatDate,
  formatGuild,
  grade,
}: {
  profile: Profile;
  teamColor: string;
  teamDisplay: TeamDisplay;
  strikeStats: StrikeStats;
  formatDate: (date: string) => string;
  formatGuild: (guild: string | null) => string | null;
  grade: ReturnType<typeof getUserGrade>;
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
      </PictoModule>

      {/* Clash Rank Module */}
      <ClashRankModule
        username={profile.username}
        grade={grade}
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
 * Mobile activity section for user page.
 */
function MobileActivitySection({
  profile,
  characters,
  sentStrikes,
  teamColor,
  activeTab,
  onTabChange,
}: {
  profile: Profile;
  characters: Character[];
  sentStrikes: SentStrike[];
  teamColor: string;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  return (
    <>
      {/* Tab Bar */}
      <PictoTabGroup className="mb-4">
        <PictoTab
          onClick={() => onTabChange("characters")}
          active={activeTab === "characters"}
          activeColor={teamColor}
        >
          Characters
        </PictoTab>
        <PictoTab
          onClick={() => onTabChange("strikes")}
          active={activeTab === "strikes"}
          activeColor={teamColor}
        >
          Strikes
        </PictoTab>
      </PictoTabGroup>

      {/* Tab Content */}
      {activeTab === "characters" && (
        <div className="space-y-3">
          {characters.length > 0 ? (
            characters.map((character) => (
              <MobileCharacterCard
                key={character.id}
                character={character}
                ownerUsername={profile.username}
              />
            ))
          ) : (
            <PictoModule className="p-8 text-center">
              <PictoText size="lg" weight="bold" color="white" className="block mb-2">
                No Characters Yet
              </PictoText>
              <PictoText size="xs" muted>
                This user hasn&apos;t created any characters yet.
              </PictoText>
            </PictoModule>
          )}
        </div>
      )}

      {activeTab === "strikes" && (
        <div className="space-y-3">
          {sentStrikes.length > 0 ? (
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
                No Strikes Yet
              </PictoText>
              <PictoText size="xs" muted>
                This user hasn&apos;t submitted any strikes yet.
              </PictoText>
            </PictoModule>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Mobile character card - compact version.
 */
function MobileCharacterCard({
  character,
  ownerUsername,
}: {
  character: Character;
  ownerUsername: string;
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
