import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "../core/Badge";

export interface KPITileProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  sparkline?: number[];
  status?: {
    label: string;
    color: "success" | "warning" | "error" | "info";
  };
}

export const KPITile: React.FC<KPITileProps> = ({ title, value, trend, sparkline, status }) => {
  return (
    <div
      className="p-6"
      style={{
        backgroundColor: "var(--b1-obsidian-panel)",
        border: "1px solid var(--b1-border-subtle)",
        borderRadius: "var(--radius-md)"
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="text-sm tracking-wider"
          style={{
            color: "var(--b1-neutral-gray)",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}
        >
          {title}
        </div>
        {status && (
          <Badge variant="subtle" color={status.color}>
            {status.label}
          </Badge>
        )}
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <div
            className="mb-2"
            style={{
              fontSize: "var(--font-size-3xl)",
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
                  trend.direction === "up" ? "var(--color-success)" : "var(--color-error)"
              }}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}
            </div>
          )}
        </div>

        {sparkline && sparkline.length > 0 && (
          <div className="flex items-end gap-0.5 h-12">
            {sparkline.map((value, index) => {
              const maxValue = Math.max(...sparkline);
              const height = (value / maxValue) * 100;

              return (
                <div
                  key={index}
                  className="w-1"
                  style={{
                    height: `${height}%`,
                    backgroundColor: "var(--b1-gold-minimal)",
                    borderRadius: "var(--radius-sm)"
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
