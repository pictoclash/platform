import { Swords } from "lucide-react";
import { PictoModule } from "../primitives/picto-module";
import { PictoText } from "../primitives/picto-text";
import { PictoButton } from "../primitives/picto-button";
import { TeamColors } from "../types";

interface JoinSectionProps {
  user: { id: string } | null;
  userTeam: "a" | "b" | null;
  eventId: string;
  teamAName: string;
  teamBName: string;
  colors: TeamColors;
  hasEnded: boolean;
  JoinButton: React.ComponentType<{
    eventId: string;
    teamAName: string;
    teamAColor: string;
    teamBName: string;
    teamBColor: string;
  }>;
}

/**
 * Join/participation section for events.
 * Shows login CTA, join options, or current team status.
 */
export function JoinSection({
  user,
  userTeam,
  eventId,
  teamAName,
  teamBName,
  colors,
  hasEnded,
  JoinButton,
}: JoinSectionProps) {
  if (!user) {
    return (
      <PictoModule className="p-5 sm:p-8 text-center">
        <PictoText size="base" weight="bold" color="white" className="block sm:text-lg">
          JOIN THE BATTLE
        </PictoText>
        <PictoText size="xs" muted className="mt-1.5 sm:mt-2 block sm:text-sm">
          LOG IN OR CREATE AN ACCOUNT TO PARTICIPATE
        </PictoText>
        <div className="flex justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
          <PictoButton href="/login" color="#ffffff" variant="outline" size="sm" className="sm:px-6">
            LOG IN
          </PictoButton>
          <PictoButton href="/register" color={colors.teamA} glowColor={colors.teamAGlow || `${colors.teamA}80`} size="sm" className="sm:px-6">
            REGISTER
          </PictoButton>
        </div>
      </PictoModule>
    );
  }

  if (userTeam) {
    const teamColor = userTeam === "a" ? colors.teamA : colors.teamB;
    const teamGlow = userTeam === "a" ? (colors.teamAGlow || `${colors.teamA}80`) : (colors.teamBGlow || `${colors.teamB}80`);
    const teamName = userTeam === "a" ? teamAName : teamBName;

    return (
      <PictoModule className="p-5 sm:p-8 text-center">
        <PictoText size="xs" muted className="block sm:text-sm">
          YOU&apos;RE FIGHTING FOR
        </PictoText>
        <PictoText size="xl" weight="bold" style={{ color: teamColor }} className="block mt-1.5 sm:mt-2 sm:text-2xl">
          {teamName.toUpperCase()}
        </PictoText>
        <PictoText size="xs" muted className="mt-3 sm:mt-4 block sm:text-sm">
          CREATE STRIKES TO EARN POINTS FOR YOUR TEAM
        </PictoText>
        <div className="mt-4 sm:mt-6">
          <PictoButton href="/strikes/new" color={teamColor} glowColor={teamGlow} size="sm" className="sm:px-6">
            <Swords size={16} className="mr-1.5 sm:mr-2 sm:w-[18px] sm:h-[18px]" />
            CREATE A STRIKE
          </PictoButton>
        </div>
      </PictoModule>
    );
  }

  if (hasEnded) {
    return (
      <PictoModule className="p-5 sm:p-8 text-center">
        <PictoText size="base" weight="bold" color="white" className="block sm:text-lg">
          EVENT ENDED
        </PictoText>
        <PictoText size="xs" muted className="mt-1.5 sm:mt-2 block sm:text-sm">
          THIS EVENT HAS CONCLUDED. CHECK BACK FOR THE NEXT ONE!
        </PictoText>
      </PictoModule>
    );
  }

  return (
    <PictoModule className="p-5 sm:p-8 text-center">
      <PictoText size="base" weight="bold" color="white" className="block sm:text-lg">
        READY TO JOIN?
      </PictoText>
      <PictoText size="xs" muted className="mt-1.5 sm:mt-2 block sm:text-sm">
        CHOOSE A TEAM OR LET US ASSIGN YOU FOR BALANCE
      </PictoText>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
        <JoinButton
          eventId={eventId}
          teamAName={teamAName}
          teamAColor={colors.teamA}
          teamBName={teamBName}
          teamBColor={colors.teamB}
        />
      </div>
    </PictoModule>
  );
}
