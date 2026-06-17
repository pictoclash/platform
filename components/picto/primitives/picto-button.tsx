import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface PictoButtonBaseProps {
  children: ReactNode;
  className?: string;
  color?: string;
  glowColor?: string;
  variant?: "filled" | "outline";
  size?: "sm" | "md" | "lg";
}

interface PictoButtonAsButtonProps extends PictoButtonBaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof PictoButtonBaseProps> {
  href?: never;
}

interface PictoButtonAsLinkProps extends PictoButtonBaseProps {
  href: string;
}

type PictoButtonProps = PictoButtonAsButtonProps | PictoButtonAsLinkProps;

/**
 * PictoClash styled button with optional glow effect
 * Supports both button and link modes
 */
export function PictoButton({
  children,
  className,
  color = "#00ff47",
  glowColor,
  variant = "filled",
  size = "md",
  href,
  ...props
}: PictoButtonProps) {
  const resolvedGlowColor = glowColor || `${color}80`;

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const baseClasses = cn(
    "font-mono font-bold uppercase tracking-wide rounded-full inline-flex items-center justify-center transition-all",
    sizeClasses[size],
    className
  );

  const style: React.CSSProperties =
    variant === "filled"
      ? {
          backgroundColor: color,
          color: "#202020",
          boxShadow: `0 0 14px ${resolvedGlowColor}`,
        }
      : {
          backgroundColor: "#202020",
          color: "#ffffff",
          border: `2px solid #ffffff`,
        };

  if (href) {
    return (
      <Link href={href} className={baseClasses} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClasses} style={style} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

interface PictoButtonGroupProps {
  children: ReactNode;
  className?: string;
  vertical?: boolean;
}

/**
 * Container for grouping PictoButtons
 */
export function PictoButtonGroup({ children, className, vertical }: PictoButtonGroupProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4",
        vertical && "flex-col",
        className
      )}
    >
      {children}
    </div>
  );
}
