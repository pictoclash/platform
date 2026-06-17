import Link from "next/link";
import Image from "next/image";
import { PictoModule } from "../primitives/picto-module";
import { PictoText } from "../primitives/picto-text";
import { PictoArrayText } from "../primitives";

interface BaseStrikeCardProps {
  id: string;
  strike_type: "visual" | "writing" | "sculpture";
  image_url: string | null;
  final_score: number;
  created_at: string;
  teamColor: string;
}

export interface SentStrikeCardProps extends BaseStrikeCardProps {
  variant: "sent";
  characters: {
    id: string;
    name: string;
    reference_image_url: string;
    owner_username: string;
  }[];
}

export interface ReceivedStrikeCardProps extends BaseStrikeCardProps {
  variant: "received";
  message: string | null;
  creator: {
    username: string;
    display_name: string | null;
  };
  character: {
    id: string;
    name: string;
  };
}

export type StrikeCardProps = SentStrikeCardProps | ReceivedStrikeCardProps;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Strike card for displaying sent or received strikes
 */
export function StrikeCard(props: StrikeCardProps) {
  const { id, strike_type, image_url, final_score, created_at, teamColor } =
    props;

  return (
    <Link href={`/strikes/${id}`} className="block">
      <PictoModule
        noPadding
        className="flex h-[140px] group hover:border-white/30 transition-colors"
      >
        {/* Strike Image */}
        <div className="w-[140px] h-[140px] flex-shrink-0 bg-[#333]">
          {image_url ? (
            <Image
              src={image_url}
              alt="Strike"
              width={140}
              height={140}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PictoText size="sm" muted>
                {strike_type === "writing" ? "Writing" : "No Image"}
              </PictoText>
            </div>
          )}
        </div>

        {/* Strike Info */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <PictoText size="xs" muted>
              {formatDate(created_at)}
            </PictoText>
            <PictoText size="xs" muted>
              •
            </PictoText>
            <PictoText size="xs" muted className="capitalize">
              {strike_type}
            </PictoText>
          </div>

          {props.variant === "sent" ? (
            <SentStrikeContent characters={props.characters} />
          ) : (
            <ReceivedStrikeContent
              creator={props.creator}
              character={props.character}
              message={props.message}
            />
          )}
        </div>

        {/* Score */}
        <div className="flex items-center px-6">
          <div className="text-right flex flex-col">
            <PictoArrayText size="4xl" color={teamColor}>
              {final_score}
            </PictoArrayText>
            <PictoText size="xs" muted>
              pts
            </PictoText>
          </div>
        </div>
      </PictoModule>
    </Link>
  );
}

function SentStrikeContent({
  characters,
}: {
  characters: SentStrikeCardProps["characters"];
}) {
  const characterNames = characters.map((c) => c.name).join(", ");

  return (
    <>
      <PictoText
        as="h3"
        size="lg"
        weight="bold"
        color="white"
        className="truncate"
      >
        Strike on {characterNames || "Unknown"}
      </PictoText>
      {characters.length > 0 && (
        <PictoText size="sm" muted className="mt-1">
          @{characters[0].owner_username}
          {characters.length > 1 && ` +${characters.length - 1} more`}
        </PictoText>
      )}
    </>
  );
}

function ReceivedStrikeContent({
  creator,
  character,
  message,
}: {
  creator: ReceivedStrikeCardProps["creator"];
  character: ReceivedStrikeCardProps["character"];
  message: string | null;
}) {
  const creatorName = creator.display_name || creator.username;

  return (
    <>
      <PictoText
        as="h3"
        size="lg"
        weight="bold"
        color="white"
        className="truncate"
      >
        From {creatorName}
      </PictoText>
      <PictoText size="sm" muted className="mt-1">
        on {character.name}
      </PictoText>
      {message && (
        <PictoText
          size="xs"
          color="white"
          uppercase={false}
          className="mt-2 line-clamp-1 opacity-70"
        >
          &quot;{message}&quot;
        </PictoText>
      )}
    </>
  );
}
