import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  numberColor?: string;
  glowColor?: string;
  className?: string;
}

/**
 * Numbered step card for tutorials/how-it-works sections
 */
export function StepCard({
  number,
  title,
  description,
  numberColor = "#ffffff",
  glowColor,
  className,
}: StepCardProps) {
  const resolvedGlowColor = glowColor || `${numberColor}66`;

  return (
    <div
      className={cn(
        "bg-[#202020] border border-white/20 p-5 flex flex-col gap-3",
        className
      )}
    >
      {/* Step number */}
      <span
        className="font-array font-bold text-6xl"
        style={{
          color: numberColor,
          textShadow: glowColor ? `0 0 7px ${resolvedGlowColor}` : undefined,
        }}
      >
        {number}
      </span>

      {/* Title */}
      <h3
        className="font-mono text-base font-bold text-white"
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="font-mono text-xs text-white/50 leading-relaxed"
      >
        {description}
      </p>
    </div>
  );
}

interface StepCardGroupProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container for step cards - handles responsive layout
 */
export function StepCardGroup({ children, className }: StepCardGroupProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}
