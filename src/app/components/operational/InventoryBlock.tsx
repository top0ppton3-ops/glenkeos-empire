import { Package, AlertTriangle, TrendingDown } from "lucide-react";
import { Badge } from "../core/Badge";
import { Button } from "../core/Button";

export type InventoryStatus = "good" | "low" | "critical" | "out-of-stock";

export interface InventoryBlockProps {
  itemName: string;
  sku?: string;
  currentStock: number;
  unit: string;
  threshold: number;
  status: InventoryStatus;
  location?: string;
  usageTrend?: "increasing" | "decreasing" | "stable";
  onReorder?: () => void;
  variant?: "basic" | "detailed";
}

const statusConfig = {
  good: { color: "success" as const, label: "GOOD" },
  low: { color: "warning" as const, label: "LOW" },
  critical: { color: "error" as const, label: "CRITICAL" },
  "out-of-stock": { color: "error" as const, label: "OUT OF STOCK" }
};

export const InventoryBlock: React.FC<InventoryBlockProps> = ({
  itemName,
  sku,
  currentStock,
  unit,
  threshold,
  status,
  location,
  usageTrend,
  onReorder,
  variant = "basic"
}) => {
  const statusInfo = statusConfig[status];
  const needsReorder = status === "low" || status === "critical" || status === "out-of-stock";

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: "var(--b1-obsidian-panel)",
        border: "1px solid var(--b1-border-subtle)",
        borderRadius: "var(--radius-md)"
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="tracking-wider" style={{ fontWeight: "var(--font-weight-medium)" }}>
              {itemName}
            </h3>
            <Badge variant="solid" color={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>

          {sku && (
            <div className="text-xs" style={{ color: "var(--b1-neutral-gray)" }}>
              SKU: {sku}
            </div>
          )}
        </div>

        <div style={{ color: "var(--b1-gold-trim)" }}>
          <Package className="w-6 h-6" />
        </div>
      </div>

      {/* Stock Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div>
          <div className="text-xs mb-1" style={{ color: "var(--b1-neutral-gray)" }}>
            CURRENT STOCK
          </div>
          <div
            style={{
              color: needsReorder ? "var(--color-warning)" : "var(--b1-white-space)",
              fontWeight: "var(--font-weight-medium)"
            }}
          >
            {currentStock} {unit}
          </div>
        </div>

        <div>
          <div className="text-xs mb-1" style={{ color: "var(--b1-neutral-gray)" }}>
            THRESHOLD
          </div>
          <div style={{ color: "var(--b1-white-space)" }}>
            {threshold} {unit}
          </div>
        </div>

        {location && (
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--b1-neutral-gray)" }}>
              LOCATION
            </div>
            <div style={{ color: "var(--b1-white-space)" }}>{location}</div>
          </div>
        )}

        <div>
          <div className="text-xs mb-1" style={{ color: "var(--b1-neutral-gray)" }}>
            STATUS
          </div>
          <div style={{ color: "var(--b1-white-space)" }}>
            {currentStock < threshold ? "Reorder Required" : "Adequate"}
          </div>
        </div>
      </div>

      {/* Usage Trend (Detailed variant) */}
      {variant === "detailed" && usageTrend && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          {usageTrend === "increasing" && (
            <>
              <TrendingDown className="w-4 h-4" style={{ color: "var(--color-warning)" }} />
              <span style={{ color: "var(--color-warning)" }}>Usage increasing</span>
            </>
          )}
          {usageTrend === "decreasing" && (
            <span style={{ color: "var(--color-success)" }}>Usage decreasing</span>
          )}
          {usageTrend === "stable" && (
            <span style={{ color: "var(--b1-neutral-gray)" }}>Usage stable</span>
          )}
        </div>
      )}

      {/* Warning for critical/out of stock */}
      {status === "critical" && (
        <div
          className="mb-4 flex items-center gap-2 px-3 py-2"
          style={{
            backgroundColor: "rgba(211, 47, 47, 0.1)",
            border: "1px solid var(--color-error)",
            borderRadius: "var(--radius-sm)"
          }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: "var(--color-error)" }} />
          <span className="text-sm" style={{ color: "var(--color-error)" }}>
            Critical stock level - immediate action required
          </span>
        </div>
      )}

      {status === "out-of-stock" && (
        <div
          className="mb-4 flex items-center gap-2 px-3 py-2"
          style={{
            backgroundColor: "rgba(211, 47, 47, 0.1)",
            border: "1px solid var(--color-error)",
            borderRadius: "var(--radius-sm)"
          }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: "var(--color-error)" }} />
          <span className="text-sm" style={{ color: "var(--color-error)" }}>
            Out of stock - urgent reorder required
          </span>
        </div>
      )}

      {/* Reorder Action */}
      {needsReorder && onReorder && (
        <Button variant="primary" size="sm" onClick={onReorder} fullWidth>
          Reorder Now
        </Button>
      )}
    </div>
  );
};
