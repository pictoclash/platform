"use client";

import { PictoText } from "@/components/picto";

export type ContentWarningCurtainProps = {
  /** The content warning text to display */
  warning: string;
  /** Whether the curtain has been revealed */
  revealed?: boolean;
  /** Callback when curtain is clicked to reveal */
  onReveal?: () => void;
  /** Optional custom accent color (defaults to red) */
  accentColor?: string;
};

export function ContentWarningCurtain({
  warning,
  revealed = false,
  onReveal,
  accentColor,
}: ContentWarningCurtainProps) {
  const handleClick = () => {
    if (!revealed) {
      onReveal?.();
    }
  };

  // Color palette based on accent or default red
  const baseColor = accentColor || "#cc3333";
  const darkColor = accentColor ? `color-mix(in srgb, ${accentColor} 50%, black)` : "#661a1a";
  const lightColor = accentColor ? `color-mix(in srgb, ${accentColor} 50%, white)` : "#ff6666";
  const bgColor = accentColor ? `color-mix(in srgb, ${accentColor} 30%, black)` : "#4a1111";

  return (
    <div
      className="absolute inset-0 z-10 overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {/* Curtain strips container */}
      <div
        className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
        style={{
          transformOrigin: "left center",
          transform: revealed ? "scaleX(0)" : "scaleX(1)",
          backgroundColor: bgColor,
        }}
      >
        {/* Individual curtain strips with staggered sway animation */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-full flex-1"
            style={{
              background: `repeating-linear-gradient(
                to left,
                ${baseColor} 40%,
                ${darkColor} 80%,
                ${lightColor} 100%
              )`,
              backgroundSize: "100% 100%",
              transformOrigin: "top center",
              animationName: revealed ? "none" : "curtainSway",
              animationDuration: "4s",
              animationTimingFunction: "ease",
              animationIterationCount: "infinite",
              animationDelay: `${-i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Center content - shown when curtain is closed */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center text-center px-8 transition-opacity duration-300 group ${
          revealed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Backdrop for hover text */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <PictoText size="sm" color="white" weight="bold" className="block mb-2">
            CONTENT WARNING
          </PictoText>
          <PictoText size="xs" className="block mb-4 text-white/90">
            {warning.toUpperCase()}
          </PictoText>
          <PictoText size="xs" color="white" className="block italic">
            click to reveal
          </PictoText>
        </div>
        <div className="absolute group-hover:opacity-0 transition-opacity duration-200">
          <PictoText size="2xl" weight="bold" className="text-white/60 drop-shadow-lg">
            Hidden due to<br />
            content warning
          </PictoText>
        </div>
      </div>

      {/* Keyframes for curtain sway */}
      <style>{`
        @keyframes curtainSway {
          0%, 100% { transform: rotate(0.8deg); }
          50% { transform: rotate(-0.8deg); }
        }
      `}</style>
    </div>
  );
}
