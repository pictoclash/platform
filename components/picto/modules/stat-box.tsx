import { PictoText } from "../primitives/picto-text";

interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  highlightColor?: string;
}

/**
 * Compact stat display with icon, label, and value.
 * Use in grids/rows for event stats, user stats, etc.
 */
export function StatBox({
  icon,
  label,
  value,
  highlight = false,
  highlightColor = "#00ff47",
}: StatBoxProps) {
  return (
    <div className="px-2 py-3 sm:px-4 sm:py-4 text-center">
      <div
        className="inline-flex items-center justify-center mb-1.5 sm:mb-2"
        style={{ color: highlight ? highlightColor : "rgba(255,255,255,0.5)" }}
      >
        {icon}
      </div>
      <PictoText size="xs" muted className="block text-[10px] sm:text-xs">
        {label}
      </PictoText>
      <PictoText
        size="base"
        weight="bold"
        color={highlight ? highlightColor : "white"}
        className="block mt-0.5 sm:mt-1 sm:text-lg"
      >
        {value}
      </PictoText>
    </div>
  );
}
