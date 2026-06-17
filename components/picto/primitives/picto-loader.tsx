interface PictoLoaderProps {
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-4",
  lg: "w-12 h-12 border-4",
};

/**
 * Animated spinner loader with customizable color
 */
export function PictoLoader({ color = "#00ff47", size = "md", className }: PictoLoaderProps) {
  return (
    <div className={`flex justify-center ${className || ""}`}>
      <div
        className={`${sizeClasses[size]} border-t-transparent rounded-full animate-spin`}
        style={{ borderColor: `${color}40`, borderTopColor: color }}
      />
    </div>
  );
}
