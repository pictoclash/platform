import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PictoTextProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
  weight?: "normal" | "bold";
  color?: string;
  muted?: boolean;
  centered?: boolean;
  uppercase?: boolean;
  glow?: boolean;
  glowColor?: string;
  style?: React.CSSProperties;
}

/**
 * PictoClash styled text - IBM Plex Mono
 */
export function PictoText({
  children,
  className,
  as: Component = "span",
  size = "base",
  weight = "normal",
  color,
  muted = false,
  centered = false,
  uppercase = false,
  glow = false,
  glowColor,
  style: externalStyle,
}: PictoTextProps) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl",
    "7xl": "text-7xl",
  };

  const resolvedGlowColor = glowColor || (color ? `${color}66` : undefined);

  const style: React.CSSProperties = {
    color: muted ? "rgba(255, 255, 255, 0.5)" : color,
    textShadow: glow && resolvedGlowColor ? `0 0 7px ${resolvedGlowColor}` : undefined,
    ...externalStyle,
  };

  return (
    <Component
      className={cn(
        "font-mono",
        sizeClasses[size],
        weight === "bold" && "font-bold",
        muted && "text-white/50",
        centered && "text-center",
        uppercase && "uppercase",
        className
      )}
      style={style}
    >
      {children}
    </Component>
  );
}

interface PictoHeroTitleProps {
  children: ReactNode;
  className?: string;
}

/**
 * Large hero title - display font styling
 */
export function PictoHeroTitle({ children, className }: PictoHeroTitleProps) {
  return (
    <h1
      className={cn(
        "font-mono text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center leading-tight tracking-tight",
        className
      )}
    >
      {children}
    </h1>
  );
}
