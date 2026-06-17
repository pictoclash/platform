import {
  PictoModule,
  PictoModuleTitle,
  PictoModuleSubtitle,
} from "../primitives/picto-module";
import { PictoButton, PictoButtonGroup } from "../primitives/picto-button";
import { PictoHeroTitle, PictoText, PictoArrayText } from "../primitives";
import { BlobDecoration } from "../decorations/blob-decoration";
import { BlobE, BlobD, BlobT } from "../elements/blobs";
import { StepCard, StepCardGroup } from "../cards/step-card";
import { FeatureList } from "../modules/feature-list";
import { GuildList } from "../modules/guild-list";
import { TeamColors } from "../types";

interface LandingPageProps {
  colors: TeamColors;
  eventName?: string;
}

/**
 * Full landing page for non-logged-in users
 * Uses the layout's header (PictoHeader) which shows login/join buttons when logged out
 */
export function LandingPage({ colors, eventName }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#c5c5c5]">
      {/* Hero Section */}
      <PictoModule className="relative" noPadding>
        <div className="max-w-[1024px] mx-auto px-6 py-16 md:py-24 text-center relative">
          {/* Decorative blobs */}
          <BlobE
            color={colors.teamA}
            size={90}
            opacity={0.3}
            className="absolute left-8 top-20 hidden md:block"
          />
          <BlobD
            color={colors.teamB}
            size={90}
            opacity={0.3}
            className="absolute right-8 top-16 hidden md:block"
          />
          <BlobT
            color={colors.teamB}
            size={100}
            opacity={0.2}
            className="absolute left-16 bottom-24 hidden md:block"
          />
          <BlobE
            color={colors.teamA}            size={70}
            opacity={0.2}
            className="absolute right-16 bottom-20 hidden md:block"
          />

          {/* Hero content */}
          <div className="relative z-10 space-y-6">
            <PictoArrayText narrow size="5xl" color="white" className="hidden md:block">
              THE OPEN-SOURCE
            </PictoArrayText>
            <PictoArrayText narrow size="3xl" color="white" className="block md:hidden">
              THE OPEN-SOURCE
            </PictoArrayText>
            <br />
            <div className="flex flex-col md:flex-row gap-2 md:gap-6 justify-center">
            <PictoArrayText size="5xl" glow color={colors.teamA} className="block md:hidden">
              ART
            </PictoArrayText>
            <PictoArrayText size="5xl" glow color={colors.teamB} className="block md:hidden">
              TRADING
            </PictoArrayText>
            <PictoArrayText size="5xl" glow color={colors.teamA} className="block md:hidden">
              GAME
            </PictoArrayText>
            <PictoArrayText size="7xl" glow color={colors.teamA} className="hidden md:block">
              ART
            </PictoArrayText>
            <PictoArrayText size="7xl" glow color={colors.teamB} className="hidden md:block">
              TRADING
            </PictoArrayText>
            <PictoArrayText size="7xl" glow color={colors.teamA} className="hidden md:block">
              GAME
            </PictoArrayText>
            </div>

            <PictoText
              as="p"
              size="lg"
              weight="bold"
              className="text-white/70"
              centered
            >
              TWO TEAMS, SEVEN CHECKPOINTS, ONE WINNER.
            </PictoText>

            <PictoText
              as="p"
              size="sm"
              className="text-white/50 max-w-xl mx-auto"
              centered
            >
              CREATE ARTWORK FEATURING CHARACTERS FROM THE OPPOSING TEAM.
              <br />
              SCORE POINTS, WIN CHECKPOINTS AND SHARE YOUR OCS.
            </PictoText>

            <div className="pt-6">
              <PictoButtonGroup vertical className="gap-4">
                <PictoButton
                  href="/register"
                  color={colors.teamA}
                  glowColor={colors.teamAGlow}
                  size="lg"
                >
                  JOIN THE CLASH
                </PictoButton>

                <PictoText as="span" size="sm" muted>
                  OR SCROLL TO LEARN MORE.
                </PictoText>

          
              </PictoButtonGroup>
            </div>
          </div>
        </div>
      </PictoModule>

      {/* How It Works */}
      <div className="max-w-[1024px] mx-auto px-4 py-6">
        <PictoModule>
          <PictoModuleTitle centered className="mb-8">
            HOW IT WORKS
          </PictoModuleTitle>

          <StepCardGroup>
            <StepCard
              number="01"
              title="UPLOAD YOUR OCS"
              description="Anyone is welcome. Furry, anthro, human, robot, show us your darlings."
              numberColor={colors.teamA}
              glowColor={colors.teamAGlow}
            />
            <StepCard
              number="02"
              title="CREATE STRIKES"
              description="Draw, model, paint, write, sculpt the other team's characters."
              numberColor={colors.teamB}
              glowColor={colors.teamBGlow}
            />
            <StepCard
              number="03"
              title="WIN CHECKPOINTS"
              description="Score points for your team. Win checkpoints. Claim victory!"
              numberColor="#ffffff"
            />
          </StepCardGroup>
        </PictoModule>
      </div>

      {/* Guilds & Features */}
      <div className="max-w-[1024px] mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Guilds */}
          <PictoModule>
            <PictoModuleTitle className="mb-1">FIVE GUILDS</PictoModuleTitle>
            <PictoModuleSubtitle className="mb-8">
              SORTED BY MEDIUM, NOT SKILL
            </PictoModuleSubtitle>

            <GuildList colors={colors} />

            <PictoText as="p" size="xs" muted className="mt-8">
              TAKE THE QUESTIONNAIRE TO FIND YOUR GUILD
            </PictoText>
          </PictoModule>

          {/* Features */}
          <PictoModule>
            <PictoModuleTitle className="mb-6">WHY PICTOCLASH?</PictoModuleTitle>

            <FeatureList
              features={[
                {
                  title: "100% OPEN SOURCE",
                  description:
                    "Free forever. Look at the source code, change it if you want, run and host your own events if you're good with computers like that. Contribute freely.",
                  color: colors.teamA,
                },
                {
                  title: "HONOUR SYSTEM SCORING",
                  description:
                    "Self-reported scoring. We don't put a price on your art, only you can do that. The only reason to cheat is to ruin your own fun.",
                  color: colors.teamB,
                },
                {
                  title: "PICTOCASH ECONOMY",
                  description:
                    "Earn PICTOCASH for participating and winning. Spend it in the store for cool digital goodies made by real human artists like you.",
                  color: colors.teamA,
                },
              ]}
            />
          </PictoModule>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-[1024px] mx-auto px-4 pb-6">
        <PictoModule className="relative">
          {/* Decorative blobs */}
          <BlobDecoration
            color={colors.teamA}
            variant={1}
            size={70}
            opacity={0.2}
            className="absolute left-4 top-4"
          />
          <BlobDecoration
            color={colors.teamB}
            variant={2}
            size={70}
            opacity={0.2}
            className="absolute right-4 top-6"
          />

          <div className="relative z-10 text-center py-8">
            <PictoText as="h2" size="2xl" weight="bold" className="text-white mb-2">
              READY TO JOIN THE CLASH?
            </PictoText>

            <PictoText as="p" size="sm" muted className="mb-8">
              THE NEXT EVENT STARTS SOON. DON&apos;T MISS IT.
            </PictoText>

            <PictoButton
              href="/register"
              color={colors.teamB}
              glowColor={colors.teamBGlow}
              size="md"
            >
              SIGN UP
            </PictoButton>
          </div>
        </PictoModule>
      </div>

    </div>
  );
}
