"use client";

import { cn } from "@/lib/utils";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface PictoTabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "style"> {
  children: ReactNode;
  active?: boolean;
  activeColor?: string;
  className?: string;
}

/**
 * Tab button for switching between content sections.
 * Active state uses the provided color, inactive uses dark gray with invert on hover.
 */
export function PictoTab({
  children,
  active = false,
  activeColor = "#ffffff",
  className,
  ...props
}: PictoTabProps) {
  // Active tabs use inline style for dynamic color, inactive use Tailwind for hover
  if (active) {
    return (
      <button
        className={cn(
          "px-5 py-2 font-mono font-bold text-sm uppercase transition-colors",
          className
        )}
        style={{
          backgroundColor: activeColor,
          color: "#202020",
        }}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={cn(
        "px-5 py-2 font-mono font-bold text-sm uppercase transition-colors",
        "bg-[#202020] text-white hover:bg-white hover:text-[#202020]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface PictoTabGroupProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container for grouping PictoTabs
 */
export function PictoTabGroup({ children, className }: PictoTabGroupProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  );
}
