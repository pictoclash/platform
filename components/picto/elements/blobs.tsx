'use client';

import React from 'react';
import { cn } from "@/lib/utils";

interface BlobProps {
  color?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
}

// Extended props for decorator-style blobs (D, E, T)
interface DecoratorBlobProps {
  color?: string;
  className?: string;
  // Legacy size props
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  // BlobDecoration-compatible props
  size?: number;
  opacity?: number;
  glowColor?: string;
  showGlow?: boolean;
}

// Common SVG props to prevent clipping - paths can extend outside viewBox
const svgProps = {
  overflow: 'visible' as const,
  preserveAspectRatio: 'xMidYMid meet' as const,
};

// a = splat/explosion shape
export function BlobA({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 -50 1127 1100"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
      {...svgProps}
    >
      <path d="M727 743l-91 264l-114 -193l-162 210l25 -239l-259 86l160 -161l-129 2l94 -109l-223 38l194 -112l-143 -61l162 -75l-234 -84l238 -77l-224 -240l277 128l-26 -228l148 110l8 -268l118 180l106 -171l49 200l210 -137l-116 249l309 -134l-246 206l195 -3l-164 133l113 39l-110 66l215 98l-227 67l227 239l-277 -127l26 228z" />
    </svg>
  );
}

// b = cloud blob
export function BlobB({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 -200 1124 1200"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
      {...svgProps}
    >
      <path d="M632 -134c68 -82 236 -49 226 76c132 15 223 234 116 396c232 209 36 683 -388 589c-61 78 -213 44 -234 -37c-218 52 -400 -204 -261 -423c-128 -103 -58 -323 96 -338c-81 -205 202 -435 445 -263z" />
    </svg>
  );
}

// c = curved rectangle
export function BlobC({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 891 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M557 -131c124 0 202 -38 294 -31c7 190 -6 707 -17 996c-67 10 -134 29 -202 29c-131 0 -255 -53 -325 -53c-86 0 -188 37 -259 76c-5 -178 -25 -507 -25 -753c0 -119 -1 -155 7 -236c204 -135 398 -28 527 -28z" />
    </svg>
  );
}

// d = paint blob
export function BlobD({
  color = 'currentColor',
  className,
  width,
  height,
  style,
  size,
  opacity = 1,
  glowColor,
  showGlow = false,
}: DecoratorBlobProps) {
  const resolvedGlowColor = glowColor || `${color}80`;
  const resolvedWidth = size ?? width;
  const resolvedHeight = size ?? height;

  const computedStyle: React.CSSProperties = {
    width: resolvedWidth,
    height: resolvedHeight,
    opacity,
    filter: showGlow ? `drop-shadow(0 0 7px ${resolvedGlowColor})` : undefined,
    ...style,
  };

  return (
    <svg
      viewBox="-10 -50 1118 1100"
      fill={color}
      className={cn("pointer-events-none", className)}
      style={computedStyle}
      {...svgProps}
    >
      <path d="M626 895c-106 0 -150 70 -275 70c-79 0 -137 -45 -149 -179c-8 -96 -23 -128 -70 -183c-63 -74 -125 -117 -125 -208c0 -87 46 -130 94 -167c44 -35 92 -78 105 -176c19 -143 116 -237 303 -237c144 0 194 48 315 53c136 5 204 63 204 189c0 92 -31 120 -31 224c0 157 82 194 82 406c0 174 -90 269 -207 269c-76 0 -149 -61 -246 -61z" />
    </svg>
  );
}

// e = paint blotch
export function BlobE({
  color = 'currentColor',
  className,
  width,
  height,
  style,
  size,
  opacity = 1,
  glowColor,
  showGlow = false,
}: DecoratorBlobProps) {
  const resolvedGlowColor = glowColor || `${color}80`;
  const resolvedWidth = size ?? width;
  const resolvedHeight = size ?? height;

  const computedStyle: React.CSSProperties = {
    width: resolvedWidth,
    height: resolvedHeight,
    opacity,
    filter: showGlow ? `drop-shadow(0 0 7px ${resolvedGlowColor})` : undefined,
    ...style,
  };

  return (
    <svg
      viewBox="-10 -150 1254 1200"
      fill={color}
      className={cn("pointer-events-none", className)}
      style={computedStyle}
      {...svgProps}
    >
      <path d="M759 875c-76 0 -48 147 -144 147c-74 0 -72 -147 -125 -147c-62 0 -75 100 -250 100c-71 0 -186 -54 -186 -206c0 -205 144 -239 144 -342c0 -39 -34 -53 -92 -53c-59 0 -101 -28 -101 -80c0 -43 25 -68 71 -68c44 0 55 15 94 15c29 0 46 -15 46 -43c0 -80 -54 -89 -54 -206c0 -77 48 -171 179 -171c134 0 168 91 214 91c42 0 76 -119 221 -119c135 0 167 87 197 200c13 49 32 65 101 65c101 0 160 39 160 107c0 65 -35 118 -102 118c-58 0 -97 -11 -132 -11c-26 0 -47 14 -47 42c0 26 16 42 66 60c42 15 81 40 81 89c0 72 -117 86 -117 150c0 48 78 61 78 181c0 72 -47 131 -132 131c-81 0 -125 -50 -170 -50z" />
    </svg>
  );
}

// f = star burst
export function BlobF({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 1023 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M463 -214c16 57 46 148 80 271c2 -70 5 -159 8 -248c45 4 62 -5 92 3c0 0 -1 91 -14 192c42 -40 97 -98 131 -154c53 59 204 208 243 315c-16 65 -135 180 -212 252c45 41 118 109 156 175c-38 83 -129 204 -215 332c-31 -47 -99 -90 -197 -216c-4 84 -9 178 -11 226c0 0 -33 15 -95 17c0 0 -6 -54 -12 -143c-16 66 -38 127 -67 167c-8 4 -281 -167 -344 -384c43 -32 117 -60 201 -110c-60 -16 -133 -36 -183 -52c0 0 11 -141 17 -191c0 0 65 8 142 27c-45 -44 -97 -88 -135 -113c101 -120 295 -275 415 -366z" />
    </svg>
  );
}

// g = irregular star
export function BlobG({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-56 0 1177 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M856 867c-139 -144 -210 -85 -220 175c-72 -223 -269 -279 -510 -171c165 -125 176 -178 31 -159c44 -56 48 -107 -203 -21c251 -124 268 -181 75 -227c178 -106 199 -295 -67 -515c269 163 352 129 310 -57c124 119 176 67 156 -158c102 209 248 242 483 72c-133 216 -68 255 193 115c-208 145 -225 212 7 206c-163 186 -200 371 -4 639c-229 -156 -312 -123 -251 101z" />
    </svg>
  );
}

// h = organic blob
export function BlobH({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 1129 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M605 -82c145 -272 270 -167 197 71c237 -155 407 254 86 320c432 218 175 801 -294 523c-64 284 -217 261 -201 -13c-300 199 -552 -166 -169 -404c-321 -64 -243 -319 20 -280c-319 -366 130 -560 361 -217z" />
    </svg>
  );
}

// i = spiky blob
export function BlobI({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 1413 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M909 -42c32 -43 76 -113 107 -98c29 14 -18 80 -55 126c66 -56 177 -153 206 -98c27 50 -84 121 -132 170c22 -20 85 -34 94 -21c13 19 -9 45 -27 65c30 -13 72 -29 78 -11c6 17 -18 33 -44 49c43 -9 124 -46 129 -24s-90 62 -150 83c49 -5 97 -11 103 5c13 32 -16 43 -59 71c147 -18 209 0 215 40c11 78 -111 99 -185 105c43 11 92 26 90 53c-3 34 -82 30 -142 24c65 35 123 75 117 105c-7 34 -83 20 -135 13c68 31 177 120 153 150c-19 24 -106 -25 -167 -54c46 38 113 126 77 149c-32 21 -111 -21 -171 -85c19 54 76 147 16 177c-51 25 -106 -63 -142 -118c6 90 28 179 -4 185c-33 6 -58 -65 -75 -132c-1 78 7 163 -27 162c-15 -1 -45 -41 -71 -156c-26 98 -57 140 -78 138c-49 -6 -16 -132 -11 -207c-25 97 -89 218 -149 200c-44 -13 0 -162 24 -223c-37 50 -79 135 -112 119c-32 -15 18 -95 60 -147c-66 56 -177 153 -206 98c-27 -50 84 -121 155 -166c-38 14 -107 31 -117 17c-13 -19 9 -45 27 -65c-30 13 -72 29 -78 11c-6 -17 18 -33 44 -49c-59 12 -172 56 -178 29c-5 -24 121 -61 199 -88c-36 4 -70 10 -76 -5c-8 -20 23 -31 51 -49c-62 8 -150 -4 -151 -28c-1 -31 79 -45 148 -54c-87 -16 -245 3 -254 -48c-10 -59 128 -30 208 -37c-36 -9 -76 -25 -74 -50c3 -38 73 -32 126 -27c-73 -40 -142 -76 -136 -106c7 -32 95 -20 154 -12c-68 -31 -177 -120 -153 -150c19 -24 106 25 167 54c-46 -38 -113 -126 -77 -149c32 -21 111 21 171 85c-19 -54 -76 -147 -16 -177c51 -25 106 63 142 118c-6 -90 -28 -179 4 -185c33 -6 58 65 75 132c1 -95 -10 -196 43 -198c26 -1 55 35 77 134c19 -72 42 -105 63 -101c49 10 16 153 4 228c34 -97 78 -224 124 -213c50 12 -28 171 -50 215c33 -49 60 -104 83 -95s-5 58 -32 116z" />
    </svg>
  );
}

// j = smooth oval
export function BlobJ({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 926 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M448 966c-302 0 -414 -82 -414 -575c0 -495 107 -607 419 -607c320 0 427 111 429 607c3 493 -118 575 -434 575z" />
    </svg>
  );
}

// k = 4-point star
export function BlobK({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 1249 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M1 378c161 -36 174 -99 219 -304c36 -165 95 -251 207 -269c124 -20 141 -44 189 -201c45 155 60 178 191 202c110 20 167 103 203 268c45 205 60 268 219 304c-159 36 -174 99 -219 304c-36 165 -93 248 -203 268c-131 24 -146 47 -191 202c-48 -157 -65 -181 -189 -201c-112 -18 -171 -104 -207 -269c-45 -205 -58 -268 -219 -304z" />
    </svg>
  );
}

// l = scribble shape
export function BlobL({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-58 0 1244 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M78 585c21 -20 45 -44 71 -71c-49 -58 -150 -158 -197 -194c75 -73 156 -156 236 -242c-37 26 -70 51 -93 74c-13 -17 -25 -34 -41 -46c73 -70 211 -199 282 -272c13 15 26 29 40 43c46 -50 92 -99 135 -143c38 47 146 157 188 171c-39 55 -82 111 -126 165c85 -88 163 -167 222 -222c34 42 68 81 110 115c-15 19 -32 38 -49 58c38 -36 74 -71 107 -102c25 29 51 55 80 80c-47 51 -103 109 -165 171c30 -27 57 -49 78 -66c31 42 70 84 116 121c-10 9 -21 20 -33 32c24 28 49 53 77 77c-29 29 -61 62 -96 97c21 -15 40 -29 57 -41c28 33 50 67 81 95c-45 45 -102 99 -163 156c26 27 51 53 79 81c-87 74 -217 169 -381 274c-68 -28 -103 -51 -141 -80c-22 22 -42 43 -61 62c-22 -25 -47 -48 -72 -71c37 -44 83 -96 132 -152c-61 60 -115 111 -156 145c-35 -46 -73 -88 -119 -123c29 -35 69 -79 116 -128c-65 63 -125 122 -175 173c-23 -30 -50 -56 -80 -79c47 -48 107 -109 175 -177c-53 49 -100 92 -135 126c-33 -38 -61 -78 -99 -107z" />
    </svg>
  );
}

// m = slanted rectangle
export function BlobM({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 891 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M29 -135c172 14 340 35 509 56c114 -19 209 -42 314 -75c-20 402 -29 702 -21 1022c-151 -12 -332 -36 -484 -55c-115 29 -189 48 -299 72c15 -252 8 -670 -19 -1020z" />
    </svg>
  );
}

// n = spiky star
export function BlobN({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-48 0 1406 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M-38 531c56 -82 133 -152 235 -204c-65 -30 -112 -176 -179 -275c96 -35 172 -52 292 -49c15 -146 69 -171 92 -251c114 68 174 110 243 175c27 -81 107 -156 166 -205c46 64 74 156 125 251c63 -38 176 -48 249 -54c-22 133 -24 234 -95 344c94 -5 166 48 258 164c-40 85 -144 185 -269 250c17 60 10 190 46 336c-132 -57 -252 -77 -322 -137c-5 63 -104 144 -207 227c-50 -92 -104 -176 -113 -235c-122 40 -244 74 -368 73c39 -131 73 -228 148 -303c-99 -23 -200 -81 -301 -107z" />
    </svg>
  );
}

// o = speech bubble
export function BlobO({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-63 0 1221 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M590 -131l84 -167l-6 167c103 -78 361 -66 256 193l224 -189l-174 418c69 0 174 75 174 223c0 146 -92 212 -166 235l126 284l-263 -214l9 208l-94 -161c-29 91 -131 164 -276 164c-152 0 -262 -99 -220 -249l-205 133l82 -233c-123 -5 -171 -208 -4 -297l-140 -42l173 -53l-223 -273l217 130c-70 -82 -6 -175 94 -150c-112 -271 274 -325 332 -127z" />
    </svg>
  );
}

// p = exploded splat
export function BlobP({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 1213 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M87 445l32 -23l-33 -31l107 -62l-180 -80l128 -8l-51 -37l81 -10l-28 -34l50 -17l-19 -29l30 -7l-75 -82l96 22l-50 -69l144 51l-76 -98l71 11l-64 -65l77 19l-16 -52l142 53l60 -93l29 45l39 -48l35 72l12 -32l38 57l66 -133l-4 158l156 -32l-4 42l60 -5l-17 82l175 -49l-53 77l100 -16l-118 135l62 -3l-66 53l91 6l-71 46l76 -5l-44 58l58 3l-74 78l123 23l-123 32l20 43l-46 18l63 56l-70 1l50 56l-77 -7l79 78l-52 32l73 105l-134 -45l12 163l-58 -55l-4 96l-38 -64l-7 42l-37 -70l-18 86l-53 -87l-18 27l-31 -40l-21 60l-32 -48l-27 58l-43 -84l-45 119l-31 -71l-33 64l-15 -49l-37 87l-19 -103l-47 83l13 -64l-33 36l3 -90l-125 131l81 -199l-100 48l27 -71l-74 27l6 -82l-129 24l61 -82l-75 -21l123 -85l-132 -5l135 -33l-67 -22l68 -22z" />
    </svg>
  );
}

// q = wavy rectangle
export function BlobQ({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 1055 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M652 -217c118 0 198 -3 349 -15c-2 111 -12 258 -31 344c-29 6 -88 21 -145 28c79 6 146 13 210 23c-17 142 -21 251 -14 327c-35 0 -68 -2 -104 -8c6 44 10 93 12 137c-49 22 -84 35 -131 49c64 -2 128 -4 190 -8c-8 114 -25 229 -53 343c-121 -22 -285 -37 -508 -37c-116 0 -176 2 -295 6c5 -61 12 -123 23 -184c-49 9 -79 18 -128 17c2 -109 -3 -242 -20 -360c77 -8 153 -20 222 -33c-43 -6 -87 -9 -129 -10c-10 -77 -12 -144 -8 -201c39 -10 92 -23 145 -33c-72 -11 -146 -23 -205 -28c6 -166 22 -296 48 -403c146 33 341 46 572 46z" />
    </svg>
  );
}

// r = bumpy rectangle
export function BlobR({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 1072 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M544 -217c196 0 288 -3 389 -15c-44 105 -56 132 -56 199c0 72 67 97 175 66c-22 192 -26 521 -19 649c-125 -52 -186 -15 -187 71c-1 84 14 132 64 250c-114 -20 -269 -37 -482 -37c-86 0 -175 2 -284 6c37 -86 48 -132 48 -206s-74 -125 -166 -82c16 -179 3 -535 -8 -652c87 47 161 -14 162 -82s-5 -101 -38 -213c106 33 249 46 402 46z" />
    </svg>
  );
}

// s = sun/starburst
export function BlobS({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 1311 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M40 324c37 -27 38 -53 -30 -80c72 -29 75 -57 51 -88c33 -22 37 -46 12 -82c37 -6 42 -25 -1 -75c58 9 68 -11 59 -47c32 -3 44 -21 46 -44c25 -8 40 -21 31 -61c43 15 62 3 64 -33c46 13 76 3 94 -42c34 33 53 29 71 4c17 20 31 18 37 -32c28 46 49 44 66 19c23 23 44 22 58 -31c19 65 65 71 102 23c17 30 37 31 65 -12c13 45 34 47 58 18c10 33 24 35 50 20c8 20 28 24 72 -31c7 67 37 77 79 69c7 31 26 43 82 17c-23 51 -8 64 42 57c-23 38 -10 56 56 36c-43 59 -34 79 6 80c-24 40 -19 59 8 77c-15 24 -11 48 56 63c-58 38 -55 66 -26 96c-25 26 -24 52 30 82c-53 23 -86 89 -17 131c-37 27 -38 53 30 80c-72 29 -75 57 -51 88c-33 22 -37 46 -13 82c-36 6 -41 25 1 75c-58 -9 -67 11 -59 47c-31 3 -44 21 -45 44c-26 8 -41 21 -31 61c-43 -15 -62 -3 -64 33c-47 -13 -77 -3 -94 42c-34 -33 -54 -29 -71 -4c-17 -20 -31 -18 -37 32c-28 -46 -49 -44 -66 -19c-24 -23 -44 -22 -58 31c-19 -65 -65 -71 -102 -23c-17 -30 -38 -31 -66 12c-12 -45 -33 -47 -58 -18c-9 -33 -23 -35 -49 -20c-9 -20 -28 -24 -72 31c-8 -67 -38 -77 -80 -69c-6 -31 -25 -43 -81 -17c22 -51 7 -64 -42 -57c22 -38 10 -56 -56 -36c43 -59 33 -79 -6 -80c24 -40 19 -59 -8 -77c15 -24 11 -48 -56 -63c58 -38 55 -66 26 -96c25 -26 24 -52 -30 -82c74 -41 57 -94 17 -131z" />
    </svg>
  );
}

// t = dotted blob
export function BlobT({
  color = 'currentColor',
  className,
  width,
  height,
  style,
  size,
  opacity = 1,
  glowColor,
  showGlow = false,
}: DecoratorBlobProps) {
  const resolvedGlowColor = glowColor || `${color}80`;
  const resolvedWidth = size ?? width;
  const resolvedHeight = size ?? height;

  const computedStyle: React.CSSProperties = {
    width: resolvedWidth,
    height: resolvedHeight,
    opacity,
    filter: showGlow ? `drop-shadow(0 0 7px ${resolvedGlowColor})` : undefined,
    ...style,
  };

  return (
    <svg
      viewBox="-10 -300 1195 1300"
      fill={color}
      className={cn("pointer-events-none", className)}
      style={computedStyle}
      {...svgProps}
    >
      <path d="M611 -266c52 0 77 40 77 78c0 40 -25 80 -74 80c-58 0 -82 -37 -82 -71c0 -44 30 -87 79 -87zM761 -217c13 0 19 7 19 14c0 8 -6 15 -18 15c-13 0 -19 -6 -19 -13c0 -8 8 -16 18 -16zM770 -166c20 0 27 11 27 23c0 13 -7 25 -25 25c-20 0 -29 -10 -29 -22c0 -13 11 -26 27 -26zM444 -143c13 0 19 7 19 14c0 8 -6 15 -18 15c-14 0 -19 -6 -19 -13c0 -8 7 -16 18 -16zM514 -137c21 0 30 13 30 26c0 14 -9 27 -28 27c-22 0 -32 -11 -32 -24c0 -14 13 -29 30 -29zM814 837c-102 0 -147 -72 -260 -72c-74 0 -168 63 -292 63c-67 0 -105 -36 -105 -89c0 -82 62 -99 62 -156c0 -42 -24 -65 -88 -65c-82 0 -123 -44 -123 -98c0 -111 176 -91 176 -165c0 -73 -28 -118 -28 -191c0 -103 59 -172 156 -172c118 0 168 46 224 46c59 0 135 -34 231 -34c103 0 157 71 157 175c0 113 -16 135 -16 246c0 123 38 153 38 353c0 92 -55 159 -132 159zM1013 66c19 0 27 11 27 23c0 13 -8 25 -25 25c-21 0 -29 -10 -29 -22c0 -13 11 -26 27 -26zM67 119c21 0 31 14 31 28c0 17 -10 31 -30 31c-22 0 -32 -12 -32 -26c0 -17 13 -33 31 -33zM1066 155c76 0 109 31 109 92c0 52 -57 162 -170 162c-49 0 -69 -37 -69 -82c0 -77 53 -172 130 -172zM132 179c12 0 18 7 18 14c0 8 -6 15 -17 15c-14 0 -20 -6 -20 -13c0 -8 8 -16 19 -16zM102 229c13 0 19 7 19 14c0 8 -6 15 -18 15c-13 0 -19 -6 -19 -13c0 -8 8 -16 18 -16zM1106 425c13 0 19 7 19 14c0 8 -6 15 -18 15c-13 0 -19 -6 -19 -13c0 -8 8 -16 18 -16zM1019 487c39 0 59 26 59 50c0 26 -20 52 -57 52c-45 0 -63 -24 -63 -46c0 -28 23 -56 61 -56zM75 531c27 0 40 19 40 38c0 20 -13 39 -38 39c-30 0 -43 -16 -43 -35c0 -20 18 -42 41 -42zM133 619c12 0 18 7 18 14c0 8 -6 15 -17 15c-14 0 -20 -6 -20 -13c0 -8 8 -16 19 -16zM544 810c71 0 106 36 106 73s-36 75 -102 75c-79 0 -113 -33 -113 -67c0 -40 43 -81 109 -81z" />
    </svg>
  );
}

// u = rough rectangle
export function BlobU({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 1052 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M1019 374l4 4c0 3 -4 3 -4 3c-4 0 -4 3 -4 3c0 4 0 4 -5 7c-4 -3 0 -7 -4 -10v10c9 0 13 6 17 10c5 17 5 20 0 43c-4 -3 -4 -6 -4 -10h-9v4c5 3 5 6 9 13h-9v13c5 3 5 3 0 7c-4 3 0 6 0 14c0 -4 0 -4 5 -4l4 4c0 2 -4 2 -4 7c0 0 0 2 -5 5c-4 0 -9 0 -13 4v7c-4 3 -4 9 4 14c0 0 5 -5 9 -7c5 0 5 2 9 2l4 -2c5 7 0 12 0 16c-4 0 -4 0 -4 -4l-4 -3c0 3 -5 7 -5 7c0 3 5 10 5 14c4 0 4 0 8 -4c0 4 -4 4 -4 6c-4 5 -4 5 0 7h13c-4 3 -4 7 -9 10c0 0 5 0 5 4l-5 3c-4 0 -4 -3 -8 -3v3h8v6c-4 0 -4 -2 -8 0c0 3 0 7 -5 10c0 0 -4 0 -4 4c0 3 -5 7 0 7c4 7 0 10 4 16c0 0 -4 3 -4 7c0 0 -5 3 -5 7h5v3s-5 0 -5 4v3s0 2 5 6c4 0 9 3 13 7c-4 0 -9 0 -13 -4c0 4 0 4 4 4v3c5 7 5 7 0 14v2h-9s-4 0 -4 4c4 3 4 7 4 10v9s5 5 5 7l4 -2s5 2 5 6c4 0 4 0 8 -4c-4 7 0 11 0 14c0 4 -4 7 -8 7c-5 -3 -5 0 -9 0v2c4 5 13 7 17 11c-4 3 -8 3 -13 7h-13v10h13v3c-4 6 0 13 -4 20c0 -3 -5 -3 -5 -3c-4 0 -4 3 0 6l5 -3s4 3 0 7c-5 3 -5 3 -9 13c-4 -4 -9 -4 -13 -4c0 4 4 7 4 4c9 0 13 3 18 3c-5 7 -5 7 -13 10c0 4 0 4 4 7c-4 -3 -9 -3 -13 0c0 0 -4 4 4 4l-4 -4c4 4 9 0 13 0c0 0 -4 4 0 4v9l4 4c5 0 5 3 5 3h9c-5 -3 -5 -3 -9 -7c0 -3 4 -3 9 -7c0 4 0 4 4 7l4 4v10c0 3 5 3 9 7h-9c0 6 -4 12 -4 16c0 3 4 7 0 10c0 4 0 6 4 11l-4 2v-2c-4 0 -9 2 -13 2c0 7 9 10 4 14c-4 -4 -9 -11 -13 -14c0 3 -4 7 0 10c4 0 0 4 0 4v3c4 0 4 4 4 6v5h5c-5 -5 -5 -5 -5 -7c5 2 5 0 9 0l5 2v-2c4 0 4 2 4 2v7c-9 0 -9 3 -9 7c5 3 5 7 5 7h8c0 3 -4 7 -4 9c0 0 -4 0 -4 -2v2h4v3c4 7 4 11 -4 11h-5c0 3 5 7 9 10c-4 0 -4 0 -4 4l4 2c-9 3 -18 0 -22 10c9 0 27 0 29 9c-164 -20 -376 -23 -599 -23c-158 0 -231 13 -396 20v-5c8 -6 8 -11 0 -20c0 0 -5 -2 -5 -5c9 -3 0 -8 0 -11c5 0 13 -3 13 -6c0 -5 -8 -2 -13 -5c0 -6 9 -3 9 -6c4 -5 -4 -5 -9 -8c0 0 5 -3 0 -5c-8 -3 -8 -6 -4 -9c4 -5 13 -8 17 -13c-4 -9 -4 -17 -8 -25h-9v-17c0 -2 9 -2 13 -5c-4 -6 -9 -8 -9 -11s5 -8 5 -11s-5 -6 -5 -11c-4 -3 -4 -6 -4 -11c9 -6 9 -6 9 -11c-5 -9 0 -17 -5 -22c0 -3 0 -6 5 -6c4 -8 17 -17 0 -28v-3c0 -3 0 -5 4 -8c-9 -8 -13 -11 -9 -17c9 -11 0 -22 9 -33c0 -2 0 -2 -4 -5c-5 -6 0 -11 4 -14c4 -5 4 -8 0 -11c-4 0 -4 -3 -4 -5c4 -3 4 -6 8 -11c-8 -11 -13 -22 -4 -33c-9 -3 -13 -9 -9 -14c5 -8 5 -17 0 -25v-11c5 6 9 8 13 11c5 -5 5 -8 9 -11c0 -3 -4 -3 -4 -5l4 -3c-4 -3 -9 -6 -13 -8v-3c4 0 9 -3 13 -3c0 -11 0 -11 -13 -19v-6c-9 -6 -9 -6 0 -11c9 -3 9 -6 9 -11c-5 -6 -9 -9 -13 -11c0 -9 4 -14 0 -23v-11c-5 -2 -5 -8 0 -11v-5c-5 -8 0 -17 4 -25v-25c-9 -11 -4 -22 -4 -36c4 0 4 3 4 3c4 0 4 0 9 3v-3s0 -3 -5 -3c0 0 -4 0 -8 -2c4 0 8 -6 8 -9c5 0 5 0 9 3c-4 -5 -4 -8 -4 -11c-5 -8 -5 -14 -5 -19c5 -8 5 -14 5 -22c-5 -3 0 -8 -5 -11c0 -3 0 -8 5 -11c0 -3 4 -6 4 -8c0 -3 0 -3 -4 -6c8 -3 8 -8 4 -11c-9 -6 -9 -11 -9 -14c0 -6 5 -14 13 -17c0 0 0 -2 4 -5c-8 0 -12 -6 -12 -9c0 0 0 -2 4 -5c-4 0 -9 0 -13 -3c4 -11 9 -22 30 -30c4 0 4 -9 0 -11c-9 -3 -9 -6 -9 -9c5 -5 5 -13 0 -19h-8c8 -5 13 -8 8 -14c0 -8 0 -13 -4 -19c-8 -3 -4 -8 -4 -14c0 -5 -4 -11 -4 -19v-5c4 -11 8 -22 0 -33v-6c0 -3 4 -5 0 -8v-8c4 -3 4 -9 4 -14c0 -6 4 -11 0 -17c-4 -5 -4 -8 0 -14c4 -3 4 -8 4 -14v-41c-4 -6 -8 -9 0 -11v-9c0 -2 0 -5 4 -8v-3c0 -8 5 -16 9 -24c4 0 0 -3 0 -3c0 -11 8 -22 13 -33c8 0 6 -8 10 -7c148 9 333 7 564 7c118 0 198 -3 349 -15c0 7 -4 10 -4 14c4 3 4 3 9 3c-5 7 -5 7 0 13c0 3 -9 0 -9 3v11s0 3 -4 7c8 0 8 -4 13 -4c0 0 4 0 4 4c0 3 -9 3 -9 5c0 0 -4 0 -4 4l-4 3c4 4 4 4 8 4c0 3 0 7 -4 10c-4 0 -4 4 -4 4c4 0 4 3 8 3c0 0 0 2 -4 2s-4 7 -9 7c-4 0 -4 4 -4 4h4c13 0 13 0 13 10c5 4 9 7 14 7c-5 2 -14 2 -9 6c4 3 4 7 0 7c0 7 4 10 0 13c-5 0 0 -3 -5 -6c-4 0 -4 -4 -8 -4v4c4 3 8 10 17 16c-4 3 -4 7 0 14c0 0 -4 3 -4 6c4 4 13 4 13 10c-4 0 -9 0 -9 -4c-4 4 -4 4 -9 7c9 7 14 14 14 23l-5 -2c-4 2 -4 2 -4 6c-9 3 -5 7 -5 14c5 3 5 3 9 6c0 4 0 6 5 10c0 0 1 -3 5 -7c4 4 0 4 0 7l-1 3c-4 0 -9 4 -9 10c-4 4 -9 4 -9 7h18c0 4 -9 4 -9 6v11c5 3 -4 6 0 10v23c-4 0 -4 0 -4 -3c0 -4 -5 -4 -9 -4v4c-4 3 -4 2 -4 2c-4 -4 -8 -6 -13 -13c5 0 0 -2 0 -2c4 -4 4 -7 -5 -11v11c0 2 0 2 -4 7c4 2 9 2 9 9c-5 0 4 7 8 7c5 3 13 7 13 14c0 2 5 2 5 5c-5 4 -9 7 -5 14v4c-4 2 0 7 0 9h18c4 3 -9 3 -4 10l4 -3c9 3 9 3 4 7c-4 3 0 7 -4 9l-4 -2c-5 -4 -9 0 -9 2c0 7 9 7 17 7c-8 3 -13 7 -13 10v11c0 5 5 9 9 12c0 4 4 7 4 11v3c-4 0 -4 -3 -4 -3c-4 0 0 -4 -4 -4l-5 4c0 3 0 7 -4 10c0 2 -5 6 0 13v3c-9 7 -5 14 0 16c0 4 0 4 4 4c0 0 5 0 5 -4c4 4 0 4 -5 7c5 4 5 7 5 11c-5 3 -5 10 8 12v4h-8c-5 3 0 7 0 10h4c-9 4 -9 10 -9 20c0 3 9 3 9 10c0 4 4 4 4 7v20c-4 3 -8 3 -13 7v-11c-4 0 -4 0 -9 4c5 3 5 7 5 10c-5 0 -5 3 -9 3c4 4 4 4 4 6c-4 7 -4 7 0 11c5 -4 9 -4 5 -11c0 -2 4 -6 4 -6h5c4 0 4 0 4 4v9z" />
    </svg>
  );
}

// v = oval with tail (left)
export function BlobV({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 926 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M448 966c-24 0 -47 -1 -69 -2c-81 103 -214 133 -327 126c56 -31 102 -100 126 -180c-102 -69 -144 -217 -144 -519c0 -495 107 -607 419 -607c320 0 427 111 429 607c3 493 -118 575 -434 575z" />
    </svg>
  );
}

// w = oval with tail (right)
export function BlobW({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 926 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M448 966c-302 0 -414 -82 -414 -575c0 -495 107 -607 419 -607c320 0 427 111 429 607c2 283 -38 431 -131 505c23 86 71 161 130 194c-114 7 -247 -23 -328 -128c-33 3 -67 4 -105 4z" />
    </svg>
  );
}

// x = cloud with dots (left)
export function BlobX({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 1124 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M632 -134c68 -82 236 -49 226 76c132 15 223 234 116 396c232 209 36 683 -388 589c-61 78 -213 44 -234 -37c-218 52 -400 -204 -261 -423c-128 -103 -58 -323 96 -338c-81 -205 202 -435 445 -263zM247 931c82 0 121 63 121 122c0 62 -39 125 -116 125c-90 0 -128 -58 -128 -111c0 -69 47 -136 123 -136zM104 1162c39 0 59 26 59 50c0 26 -20 52 -57 52c-45 0 -63 -24 -63 -46c0 -28 23 -56 61 -56z" />
    </svg>
  );
}

// y = cloud with dots (right)
export function BlobY({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-10 0 1124 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M632 -134c68 -82 236 -49 226 76c132 15 223 234 116 396c232 209 36 683 -388 589c-61 78 -213 44 -234 -37c-218 52 -400 -204 -261 -423c-128 -103 -58 -323 96 -338c-81 -205 202 -435 445 -263zM864 931c76 0 123 67 123 136c0 53 -38 111 -128 111c-77 0 -116 -63 -116 -125c0 -59 39 -122 121 -122zM1007 1162c38 0 61 28 61 56c0 22 -18 46 -63 46c-37 0 -57 -26 -57 -52c0 -24 20 -50 59 -50z" />
    </svg>
  );
}

// z = 6-point star
export function BlobZ({ color = 'currentColor', className, width, height, style }: BlobProps) {
  return (
    <svg
      viewBox="-12 0 1271 1000"
      fill={color}
      className={className}
      style={{ width, height, ...style }}
    >
      <path d="M553 -303c150 195 370 232 609 203c-84 208 -71 397 87 573c-159 69 -256 267 -228 457c-243 -68 -450 -31 -592 100c-51 -158 -160 -371 -431 -359c184 -177 164 -489 3 -665c332 4 469 -122 552 -309z" />
    </svg>
  );
}

// Convenience export of all blobs as a map
export const Blobs = {
  a: BlobA,
  b: BlobB,
  c: BlobC,
  d: BlobD,
  e: BlobE,
  f: BlobF,
  g: BlobG,
  h: BlobH,
  i: BlobI,
  j: BlobJ,
  k: BlobK,
  l: BlobL,
  m: BlobM,
  n: BlobN,
  o: BlobO,
  p: BlobP,
  q: BlobQ,
  r: BlobR,
  s: BlobS,
  t: BlobT,
  u: BlobU,
  v: BlobV,
  w: BlobW,
  x: BlobX,
  y: BlobY,
  z: BlobZ,
} as const;

// Random blob selector
export function getRandomBlob() {
  const keys = Object.keys(Blobs) as (keyof typeof Blobs)[];
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return Blobs[randomKey];
}
