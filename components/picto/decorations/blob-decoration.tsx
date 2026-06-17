"use client";

import { cn } from "@/lib/utils";

interface BlobDecorationProps {
  color: string;
  className?: string;
  variant?: 1 | 2 | 3 | 4;
  opacity?: number;
  size?: number;
  glowColor?: string;
  showGlow?: boolean;
}

/**
 * Organic blob shape decoration - signature PictoClash visual element
 * Multiple variants for visual variety
 */
export function BlobDecoration({
  color,
  className,
  variant = 1,
  opacity = 1,
  size = 80,
  glowColor,
  showGlow = false,
}: BlobDecorationProps) {
  const resolvedGlowColor = glowColor || `${color}80`;

  // Different blob path variants for visual variety
  const blobPaths = {
    1: "M40.5,10 C60,5 75,20 78,40 C81,60 70,75 50,78 C30,81 15,70 12,50 C9,30 21,15 40.5,10 Z",
    2: "M35,8 C55,3 72,15 77,35 C82,55 72,72 52,77 C32,82 15,72 10,52 C5,32 15,13 35,8 Z",
    3: "M42,5 C62,2 78,18 80,38 C82,58 68,75 48,78 C28,81 12,68 10,48 C8,28 22,8 42,5 Z",
    4: "M38,12 C58,7 73,22 76,42 C79,62 66,77 46,79 C26,81 11,66 9,46 C7,26 18,17 38,12 Z",
  };

  const style: React.CSSProperties = {
    opacity,
    filter: showGlow ? `drop-shadow(0 0 7px ${resolvedGlowColor})` : undefined,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 90 90"
      className={cn("pointer-events-none", className)}
      style={style}
    >
      <path d={blobPaths[variant]} fill={color} />
    </svg>
  );
}

interface BlobClusterProps {
  colorA: string;
  colorB: string;
  className?: string;
}

/**
 * A cluster of decorative blobs using both team colors
 */
export function BlobCluster({ colorA, colorB, className }: BlobClusterProps) {
  return (
    <div className={cn("relative", className)}>
      <BlobDecoration
        color={colorA}
        variant={1}
        size={90}
        opacity={0.3}
        className="absolute -left-2 -top-2"
      />
      <BlobDecoration
        color={colorB}
        variant={2}
        size={70}
        opacity={0.25}
        className="absolute left-8 top-6"
      />
      <BlobDecoration
        color={colorA}
        variant={3}
        size={50}
        opacity={0.2}
        className="absolute left-4 top-14"
      />
    </div>
  );
}

interface CharacterBlobProps {
  outlineColor: string;
  className?: string;
  size?: number;
}

/**
 * Blob shape for character profile pictures with colored outline
 */
export function CharacterBlob({ outlineColor, className, size = 144 }: CharacterBlobProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 144 132"
      className={cn("pointer-events-none", className)}
    >
      <path
        d="M72,8 C100,4 130,25 138,60 C146,95 125,120 90,126 C55,132 20,115 8,80 C-4,45 44,12 72,8 Z"
        fill="#202020"
        stroke={outlineColor}
        strokeWidth="3"
      />
    </svg>
  );
}
