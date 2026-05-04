import { Clock, ChefHat } from "lucide-react";
import { Badge } from "../core/Badge";

export type KDSStatus = "pending" | "in-progress" | "complete" | "delayed";

export interface KDSTileProps {
  itemName: string;
  quantity: number;
  orderId: string;
  station: string;
  timer?: string;
  status: KDSStatus;
  modifiers?: string[];
  onClick?: () => void;
}

const statusConfig = {
  pending: { color: "neutral" as const, label: "PENDING" },
  "in-progress": { color: "info" as const, label: "COOKING" },
  complete: { color: "success" as const, label: "COMPLETE" },
  delayed: { color: "error" as const, label: "DELAYED" }
};

export const KDSTile: React.FC<KDSTileProps> = ({
  itemName,
  quantity,
  orderId,
  station,
  timer,
  status,
  modifiers,
  onClick
}) => {
  const statusInfo = statusConfig[status];

  return (
    <div
      onClick={onClick}
      className={`p-6 ${onClick ? "cursor-pointer transition-all hover:scale-[1.02]" : ""}`}
      style={{
        backgroundColor: "var(--b1-obsidian-panel)",
        border: `2px solid ${
          status === "delayed"
            ? "var(--color-error)"
            : status === "complete"
            ? "var(--color-success)"
            : "var(--b1-border-subtle)"
        }`,
        borderRadius: "var(--radius-md)"
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="solid" color={statusInfo.color}>
              {statusInfo.label}
            </Badge>
            <span className="text-xs" style={{ color: "var(--b1-neutral-gray)" }}>
              {station}
            </span>
          </div>

          <h3 className="mb-1 tracking-wide" style={{ fontWeight: "var(--font-weight-medium)" }}>
            {itemName}
          </h3>

          <div className="text-xs" style={{ color: "var(--b1-neutral-gray)" }}>
            Qty: {quantity} • Order: {orderId}
          </div>
        </div>

        <div className="flex items-center gap-1" style={{ color: "var(--b1-gold-trim)" }}>
          <ChefHat className="w-5 h-5" />
        </div>
      </div>

      {/* Modifiers */}
      {modifiers && modifiers.length > 0 && (
        <div className="mb-3">
          <div className="text-xs mb-1" style={{ color: "var(--b1-neutral-gray)" }}>
            MODIFIERS
          </div>
          <div className="flex flex-wrap gap-1">
            {modifiers.map((mod, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs"
                style={{
                  backgroundColor: "var(--b1-obsidian)",
                  color: "var(--b1-white-space)",
                  borderRadius: "var(--radius-sm)"
                }}
              >
                {mod}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timer */}
      {timer && (
        <div
          className="flex items-center justify-between p-4 border"
          style={{ borderColor: "var(--b1-border-subtle)", borderRadius: "var(--radius-sm)" }}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: "var(--b1-gold-trim)" }} />
            <span className="text-sm" style={{ color: "var(--b1-neutral-gray)" }}>
              TIMER
            </span>
          </div>
          <div
            className="text-2xl"
            style={{
              fontWeight: "var(--font-weight-medium)",
              color:
                status === "delayed"
                  ? "var(--color-error)"
                  : "var(--b1-white-space)"
            }}
          >
            {timer}
          </div>
        </div>
      )}
    </div>
  );
};
