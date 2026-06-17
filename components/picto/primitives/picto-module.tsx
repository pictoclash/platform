import { cn } from "@/lib/utils";
import { ReactNode, forwardRef, HTMLAttributes } from "react";

interface PictoModuleProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * Dark module card with 1px border - the signature PictoClash container
 */
export const PictoModule = forwardRef<HTMLDivElement, PictoModuleProps>(
  ({ children, className, noPadding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-[#202020] border border-[#202020] relative overflow-hidden",
          !noPadding && "p-6",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PictoModule.displayName = "PictoModule";

interface PictoModuleTitleProps {
  children: ReactNode;
  className?: string;
  centered?: boolean;
  id?: string;
}

/**
 * Module title text - bold, IBM Plex Mono
 */
export function PictoModuleTitle({ children, className, centered, id }: PictoModuleTitleProps) {
  return (
    <h2
      id={id}
      className={cn(
        "font-mono text-xl font-bold text-white tracking-wide",
        centered && "text-center",
        className
      )}
    >
      {children}
    </h2>
  );
}

interface PictoModuleSubtitleProps {
  children: ReactNode;
  className?: string;
  centered?: boolean;
}

/**
 * Module subtitle - smaller, muted
 */
export function PictoModuleSubtitle({ children, className, centered }: PictoModuleSubtitleProps) {
  return (
    <p
      className={cn(
        "font-mono text-sm text-white/50",
        centered && "text-center",
        className
      )}
    >
      {children}
    </p>
  );
}
