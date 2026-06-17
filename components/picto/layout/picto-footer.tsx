import { cn } from "@/lib/utils";
import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Help", href: "/help" },
  { label: "FAQ", href: "/faq" },
  { label: "Code of Conduct", href: "/conduct" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "GitHub", href: "https://github.com/pictoclash/pictoclash" },
  { label: "Threads", href: "https://threads.net/@pictoclash" },
  { label: "Instagram", href: "https://instagram.com/pictoclash" },
];

interface PictoFooterProps {
  className?: string;
}

/**
 * PictoClash footer with navigation links and copyright
 */
export function PictoFooter({ className }: PictoFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("py-8 px-6", className)}>
      {/* Links */}
      <nav className="flex flex-wrap justify-center gap-x-2 gap-y-1">
        {FOOTER_LINKS.map((link, index) => (
          <span key={link.label} className="flex items-center">
            <Link
              href={link.href}
              className="font-mono text-sm font-bold text-black uppercase hover:underline"
              {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {link.label}
            </Link>
            {index < FOOTER_LINKS.length - 1 && (
              <span className="font-mono text-sm font-bold text-black mx-2">-</span>
            )}
          </span>
        ))}
      </nav>

      {/* Copyright */}
      <p
        className="font-mono text-sm font-bold text-black/50 text-center uppercase mt-4"
      >
        {currentYear} - PICTOCLASH - THE OPEN-SOURCE ART TRADING GAME
      </p>
    </footer>
  );
}
