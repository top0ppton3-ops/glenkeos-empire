import { TrendingUp, TrendingDown } from "lucide-react";

export interface MetricBlockProps {
  label: string;
  value: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: {
    valueSize: "var(--font-size-xl)",
    labelSize: "var(--font-size-xs)",
    padding: "var(--space-4)"
  },
  md: {
    valueSize: "var(--font-size-2xl)",
    labelSize: "var(--font-size-sm)",
    padding: "var(--space-6)"
  },
  lg: {
    valueSize: "var(--font-size-4xl)",
    labelSize: "var(--font-size-md)",
    padding: "var(--space-8)"
  }
};

export const MetricBlock: React.FC<MetricBlockProps> = ({
  label,
  value,
  trend,
  icon,
  size = "md"
}) => {
  const sizeStyle = sizeStyles[size];

  return (
    <div
      className="flex flex-col"
      style={{
        padding: sizeStyle.padding,
        backgroundColor: "var(--b1-obsidian-panel)",
        border: "1px solid var(--b1-border-subtle)",
        borderRadius: "var(--radius-md)"
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className="text-sm tracking-wider"
          style={{
            fontSize: sizeStyle.labelSize,
            color: "var(--b1-neutral-gray)",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}
        >
          {label}
        </div>
        {icon && <div style={{ color: "var(--b1-gold-trim)" }}>{icon}</div>}
      </div>

      <div
        className="mb-2"
        style={{
          fontSize: sizeStyle.valueSize,
          fontWeight: "var(--font-weight-medium)",
          color: "var(--b1-white-space)"
        }}
      >
        {value}
      </div>

      {trend && (
        <div
          className="flex items-center gap-1 text-xs"
          style={{
            color:
              trend.direction === "up"
                ? "var(--color-success)"
                : trend.direction === "down"
                ? "var(--color-error)"
                : "var(--b1-neutral-gray)"
          }}
        >
          {trend.direction === "up" && <TrendingUp className="w-3 h-3" />}
          {trend.direction === "down" && <TrendingDown className="w-3 h-3" />}
          {trend.value}
        </div>
      )}
    </div>
  );
};
