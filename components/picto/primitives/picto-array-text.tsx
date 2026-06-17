import { cn } from "@/lib/utils";

type ArrayTextSize = "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl";

interface PictoArrayTextProps {
  children: React.ReactNode;
  size?: ArrayTextSize;
  color?: string;
  glow?: boolean;
  glowIntensity?: number;
  tabularNums?: boolean;
  narrow?: boolean;
  className?: string;
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3";
  "aria-label"?: string;
}

const sizeClasses: Record<ArrayTextSize, string> = {
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
  "6xl": "text-6xl",
  "7xl": "text-7xl",
  "8xl": "text-8xl",
  "9xl": "text-9xl",
};

/**
 * Array font text component for large display text like grades and scores.
 * Uses the Array typeface with optional glow effects.
 */
export function PictoArrayText({
  children,
  size = "8xl",
  color,
  glow = false,
  glowIntensity = 80,
  tabularNums = false,
  narrow = false,
  className,
  as: Component = "span",
  "aria-label": ariaLabel,
}: PictoArrayTextProps) {
  const style: React.CSSProperties = {};

  if (color) {
    style.color = color;
    if (glow) {
      // Create hex with alpha for glow intensity (0-100 maps to 00-FF)
      const alpha = Math.round((glowIntensity / 100) * 255)
        .toString(16)
        .padStart(2, "0");
      style.textShadow = `0 0 20px ${color}${alpha}`;
    }
  }

  return (
    <Component
      className={cn(
        "font-array leading-none",
        narrow ? "font-normal" : "font-bold",
        sizeClasses[size],
        tabularNums && "tabular-nums",
        className
      )}
      style={style}
      aria-label={ariaLabel}
    >
      {children}
    </Component>
  );
}
