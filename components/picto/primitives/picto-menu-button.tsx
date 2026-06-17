"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface PictoMenuButtonBaseProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "primary" | "danger";
}

interface PictoMenuButtonAsButtonProps
  extends PictoMenuButtonBaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof PictoMenuButtonBaseProps> {
  href?: never;
}

interface PictoMenuButtonAsLinkProps extends PictoMenuButtonBaseProps {
  href: string;
  onClick?: () => void;
}

type PictoMenuButtonProps = PictoMenuButtonAsButtonProps | PictoMenuButtonAsLinkProps;

/**
 * Menu button for edit menus and action bars.
 * Inverts colors on hover for clear feedback.
 */
export function PictoMenuButton({
  children,
  className,
  variant = "default",
  href,
  ...props
}: PictoMenuButtonProps) {
  const baseClasses = cn(
    "px-4 py-2 font-mono font-bold text-sm uppercase transition-colors inline-flex items-center gap-2",
    variant === "default" && "bg-[#202020] text-white hover:bg-white hover:text-[#202020]",
    variant === "primary" && "bg-white text-[#202020] hover:bg-[#202020] hover:text-white",
    variant === "danger" && "text-[#e91e63] border border-[#e91e63]/30 hover:bg-[#e91e63] hover:text-white hover:border-[#e91e63]",
    className
  );

  if (href) {
    const { onClick } = props as PictoMenuButtonAsLinkProps;
    return (
      <Link href={href} className={baseClasses} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={baseClasses}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
