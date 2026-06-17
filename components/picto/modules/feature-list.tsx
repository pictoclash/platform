import { cn } from "@/lib/utils";

interface FeatureItemProps {
  title: string;
  description: string;
  color?: string;
  className?: string;
}

/**
 * Individual feature item with colored title
 */
export function FeatureItem({
  title,
  description,
  color = "#ffffff",
  className,
}: FeatureItemProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <h4
        className="font-mono text-sm font-bold"
        style={{ color }}
      >
        {title}
      </h4>
      <p
        className="font-mono text-xs text-white/50 leading-relaxed"
      >
        {description}
      </p>
    </div>
  );
}

interface FeatureListProps {
  features: Array<{
    title: string;
    description: string;
    color?: string;
  }>;
  className?: string;
  columns?: 1 | 2;
}

/**
 * List of features in a grid layout
 */
export function FeatureList({ features, className, columns = 1 }: FeatureListProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        columns === 2 ? "grid-cols-2" : "grid-cols-1",
        className
      )}
    >
      {features.map((feature, index) => (
        <FeatureItem
          key={index}
          title={feature.title}
          description={feature.description}
          color={feature.color}
        />
      ))}
    </div>
  );
}
