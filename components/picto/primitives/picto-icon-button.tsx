"use client";

import { cn } from "@/lib/utils";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface PictoIconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "style"> {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "muted" | "danger";
  /** Active state with custom color */
  active?: boolean;
  activeColor?: string;
}

/**
 * Icon-only button for actions like close, delete, etc.
 * Inverts or brightens on hover.
 */
export function PictoIconButton({
  children,
  className,
  size = "md",
  variant = "default",
  active = false,
  activeColor,
  ...props
}: PictoIconButtonProps) {
  const sizeClasses = {
    sm: "p-2",
    md: "p-2.75",
    lg: "p-3.5",
  };

  // Active state uses inline style for dynamic color
  if (active) {
    return (
      <button
        className={cn(
          "transition-colors",
          sizeClasses[size],
          className
        )}
        style={{
          backgroundColor: "#202020",
          color: activeColor || "#ffffff",
        }}
        {...props}
      >
        {children}
      </button>
    );
  }

  const variantClasses = {
    default: "bg-[#202020] text-white/60 hover:bg-white hover:text-[#202020]",
    muted: "text-white/40 hover:text-white hover:bg-white/10",
    danger: "text-red-500 hover:bg-red-500 hover:text-white",
  };

  return (
    <button
      className={cn(
        "transition-colors",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
