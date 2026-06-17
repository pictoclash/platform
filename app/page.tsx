import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  LandingPage,
  PictoModule,
  PictoModuleTitle,
  CharacterBlob,
  ClashRankModule,
  StandingsModule,
  getTeamColors,
  TeamColors,
} from "@/components/picto";
import { BlobD, BlobE } from "@/components/picto/elements";
import { getUserGrade } from "@/lib/clash-rank";
import {
  getActiveEvent,
  getCheckpoints,
  getInspirationCharacters,
  getUserStrikeStats,
  getUserProfile,
} from "@/lib/cache";

type ActiveEvent = {
  id: string;
  name: string;
  description: string | null;
  team_a_name: string;
  team_a_color: string;
  team_b_name: string;
  team_b_color: string;
  starts_at: string;
  ends_at: string;
};

type CheckpointRaw = {
  id: string;
  name: string | null;
  is_revealed: boolean;
  winning_team: string | null;
  team_a_score: number | null;
  team_b_score: number | null;
  scheduled_at: string;
  triggered_at: string | null;
};

// Sanitized checkpoint data safe for client - no sensitive data for unrevealed checkpoints
type Checkpoint = {
  id: string;
  name: string | null;
  is_revealed: boolean;
  scheduled_at: string;
  triggered_at: string | null;
  // Only populated when is_revealed is true
  winning_team: string | null;
  winner_percentage: number | null;
};

type UserProfile = {
  id: string;
  username: string;
  team: "a" | "b" | null;
  pictocash: number;
};

type Character = {
  id: string;
  name: string;
  slug: string;
  reference_image_url: string;
  owner_username: string | null;
  owner_team: "a" | "b" | null;
};

export default async function Home() {
  const supabase = await createClient();

  // Run auth and active event fetch in parallel
  const [{ data: { user } }, activeEvent] = await Promise.all([
    supabase.auth.getUser(),
    getActiveEvent(),
  ]);

  // Get team colors from active event (or use defaults)
  const colors = getTeamColors(activeEvent);

  // Show landing page for non-logged-in users
  if (!user) {
    return <LandingPage colors={colors} eventName={activeEvent?.name} />;
  }

  // Fetch all user data in parallel
  const [profile, checkpointData, userStats, savedCharacters] = await Promise.all([
    getUserProfile(user.id),
    activeEvent ? getCheckpoints(activeEvent.id) : Promise.resolve([]),
    getUserStrikeStats(user.id),
    getInspirationCharacters(user.id),
  ]);

  // Process checkpoints
  let checkpoints: Checkpoint[] = [];
  let teamAWins = 0;
  let teamBWins = 0;

  if (activeEvent && checkpointData) {

    // Sanitize checkpoint data - only include sensitive info for revealed checkpoints
    checkpoints = checkpointData.map((c: CheckpointRaw) => {
      const base = {
        id: c.id,
        name: c.name,
        scheduled_at: c.scheduled_at,
        triggered_at: c.triggered_at,
      };

      if (c.is_revealed && c.team_a_score !== null && c.team_b_score !== null) {
        const total = c.team_a_score + c.team_b_score;
        const winnerScore = c.winning_team === "a" ? c.team_a_score : c.team_b_score;
        const percentage = total > 0 ? Math.round((winnerScore / total) * 100) : 50;
        return {
          ...base,
          is_revealed: true,
          winning_team: c.winning_team,
          winner_percentage: percentage,
        };
      }
      // Unrevealed checkpoint - no sensitive data
      return {
        ...base,
        is_revealed: false,
        winning_team: null,
        winner_percentage: null,
      };
    });
    teamAWins = checkpoints.filter((c) => c.is_revealed && c.winning_team === "a").length;
    teamBWins = checkpoints.filter((c) => c.is_revealed && c.winning_team === "b").length;
  }

  const userGrade = getUserGrade(userStats.strikesSubmitted, userStats.avgScore);
  const userTeamName =
    profile?.team === "a"
      ? activeEvent?.team_a_name
      : profile?.team === "b"
        ? activeEvent?.team_b_name
        : null;
  const userTeamColor =
    profile?.team === "a" ? colors.teamA : profile?.team === "b" ? colors.teamB : "#ffffff";

  return (
    <>
      <StatusBar colors={colors} />

      <main className="max-w-[1024px] mx-auto px-4 py-4 space-y-4">
        {activeEvent && (
          <StandingsModule
            colors={colors}
            activeEvent={activeEvent}
            checkpoints={checkpoints}
            teamAWins={teamAWins}
            teamBWins={teamBWins}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-[387px_1fr] gap-4">
          <ClashRankModule
            username={profile?.username || "USER"}
            grade={userGrade}
            stats={userStats}
            teamColor={userTeamColor}
          />
          <PictoStoreModule colors={colors} pictocash={profile?.pictocash ?? 0} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_387px] gap-4">
          <SavedCharactersModule colors={colors} characters={savedCharacters} />
          <RandomModule colors={colors} />
        </div>
      </main>
    </>
  );
}

// Status Bar Component
// TODO: This fetches the currently active PictoQuest, update once that system is built.
function StatusBar({ colors }: { colors: TeamColors }) {
  return (
    <aside
      className="h-8 overflow-hidden"
      style={{ backgroundColor: colors.teamA }}
      aria-label="Current quest"
    >
      <div className="h-full flex items-center animate-marquee whitespace-nowrap">
        <p className="font-mono text-base text-black uppercase px-4">
          Current PictoQuest +++ Create a strike with two characters from the Writer&apos;s Guild
          +++ Current PictoQuest +++ Create a strike with two characters +++
        </p>
      </div>
    </aside>
  );
}

// PictoStore Module Component
// TODO: Wire this up to the actual PictoStore logic once implemented
function PictoStoreModule({ colors, pictocash }: { colors: TeamColors; pictocash: number }) {
  return (
    <PictoModule>
      <section aria-labelledby="store-title">
        <div className="flex justify-between items-start mb-4">
          <h2 id="store-title" className="font-mono text-lg font-bold text-white uppercase">
            New Arrivals in the PictoStore!
          </h2>
          <div className="flex items-center gap-1" aria-label={`Your balance: ${pictocash} PictoCash`}>
            <span className="font-mono text-xl font-bold text-white tabular-nums">{pictocash}</span>
            <PictoCashIcon />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="relative w-32 h-32 sm:w-48 sm:h-48 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0" aria-hidden="true">
            <BlobE
              color={colors.teamA}
              width={180}
              height={180}
              className="drop-shadow-[0_0_14px_rgba(0,255,71,0.4)] scale-75 sm:scale-100"
            />
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h3 className="font-mono text-lg sm:text-xl font-bold text-white uppercase">
              True_Marker_Brush_Pack
            </h3>
            <p className="font-mono text-sm text-white/50 uppercase mt-2">
              By Design Syndrome
            </p>
            <div className="flex items-center gap-1 mt-4 justify-center sm:justify-start">
              <PictoCashIcon />
              <span className="font-mono text-xl font-bold text-white tabular-nums">350</span>
            </div>
          </div>
        </div>
      </section>
    </PictoModule>
  );
}

function PictoCashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="10" stroke="white" strokeWidth="2" />
      <path d="M11 5V17M7 9H15M7 13H15" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Saved Characters Module Component
// TODO: Implement this component once saved characters are implemented. For now, randoms.
function SavedCharactersModule({
  colors,
  characters,
}: {
  colors: TeamColors;
  characters: Character[];
}) {
  return (
    <PictoModule>
      <section aria-labelledby="inspiration-title">
        <div className="flex justify-between items-start mb-6">
          <h2 id="inspiration-title" className="font-mono text-lg font-bold text-white uppercase">
            Need Inspiration?
          </h2>
          <Link
            href="/characters"
            className="font-mono text-sm text-white/50 uppercase hover:text-white/70 transition-colors"
          >
            See All Characters
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:justify-around">
          {characters.map((char) => {
            const charColor = char.owner_team === "a" ? colors.teamA : colors.teamB;
            return (
              <Link key={char.id} href={`/characters/${char.owner_username}/${char.slug}`} className="text-center group">
                <div className="relative w-24 h-24 sm:w-36 sm:h-36 mb-2 flex items-center justify-center">
                  <CharacterBlob outlineColor={charColor} size={144} className="absolute scale-[0.67] sm:scale-100" />
                  {char.reference_image_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-16 h-16 sm:w-24 sm:h-24 overflow-hidden rounded-full">
                        <Image
                          src={char.reference_image_url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 64px, 96px"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <p className="font-mono text-sm sm:text-base text-white uppercase group-hover:underline">
                  {char.name}
                </p>
                <p className="font-mono text-xs text-white/50 uppercase">
                  @{char.owner_username}
                </p>
              </Link>
            );
          })}

          {characters.length < 3 &&
            Array.from({ length: 3 - characters.length }).map((_, i) => (
              <div key={`empty-${i}`} className="text-center opacity-30 hidden sm:block" aria-hidden="true">
                <div className="relative w-24 h-24 sm:w-36 sm:h-36 mb-2 flex items-center justify-center">
                  <CharacterBlob outlineColor="#ffffff" size={144} className="absolute scale-[0.67] sm:scale-100" />
                </div>
                <p className="font-mono text-sm sm:text-base text-white uppercase">???</p>
              </div>
            ))}
        </div>
      </section>
    </PictoModule>
  );
}

// Random Character Module Component
function RandomModule({ colors }: { colors: TeamColors }) {
  return (
    <PictoModule className="flex flex-col items-center justify-center">
      <h2 className="font-mono text-base sm:text-lg font-bold text-white uppercase text-center mb-4 sm:mb-8">
        Try Something New?
      </h2>

      <div className="flex flex-row sm:flex-col gap-4 sm:gap-6">
        <Link href="/characters/random" className="block group">
          <div className="relative w-[140px] h-[95px] sm:w-[180px] sm:h-[120px] flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
            <BlobD
              color={colors.teamA}
              width={180}
              height={120}
              className="absolute scale-[0.78] sm:scale-100"
              style={{ filter: `drop-shadow(0 0 14px ${colors.teamAGlow})` }}
            />
            <span className="relative z-10 font-mono text-sm sm:text-lg font-bold text-[#202020] text-center uppercase">
              Random<br />Character
            </span>
          </div>
        </Link>

        <Link href="/characters/smart-random" className="block group">
          <div className="relative w-[140px] h-[95px] sm:w-[180px] sm:h-[120px] flex items-center justify-center -rotate-3 group-hover:rotate-0 transition-transform">
            <BlobE
              color={colors.teamB}
              width={180}
              height={120}
              className="absolute scale-[0.78] sm:scale-100"
              style={{ filter: `drop-shadow(0 0 14px ${colors.teamBGlow})` }}
            />
            <span className="relative z-10 font-mono text-sm sm:text-lg font-bold text-[#202020] text-center uppercase">
              Smart<br />Random
            </span>
          </div>
        </Link>
      </div>
    </PictoModule>
  );
}
