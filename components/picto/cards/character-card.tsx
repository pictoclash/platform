import Link from "next/link";
import Image from "next/image";
import { PictoModule } from "../primitives/picto-module";
import { PictoText } from "../primitives/picto-text";

export interface CharacterCardProps {
  id: string;
  name: string;
  slug: string;
  ownerUsername: string;
  description?: string | null;
  reference_image_url: string;
  teamColor?: string;
}

/**
 * Character card for displaying character info with image
 */
export function CharacterCard({
  id,
  name,
  slug,
  ownerUsername,
  description,
  reference_image_url,
  teamColor,
}: CharacterCardProps) {
  const characterId = `C-${id.slice(0, 7).toUpperCase()}`;

  return (
    <Link href={`/characters/${ownerUsername}/${slug}`} className="block">
      <PictoModule noPadding className="flex h-[165px] group hover:border-white/30 transition-colors">
        {/* Character Image */}
        <div className="w-[132px] h-[132px] m-4 flex-shrink-0 bg-[#333]">
          <Image
            src={reference_image_url}
            alt={name}
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
            {name}
          </PictoText>
          {description && (
            <PictoText
              as="p"
              size="base"
              color="white"
              uppercase={false}
              className="mt-2 line-clamp-2"
            >
              {description}
            </PictoText>
          )}
        </div>
      </PictoModule>
    </Link>
  );
}
