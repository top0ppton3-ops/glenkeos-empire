import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "../core/Badge";
import { motion } from "motion/react";

export type OrderStatus = "pending" | "in-progress" | "ready" | "complete" | "delayed";
export type OrderPriority = "normal" | "rush" | "critical";

export interface OrderCardProps {
  orderId: string;
  customerName?: string;
  itemsCount: number;
  status: OrderStatus;
  priority?: OrderPriority;
  prepTime?: string;
  store?: string;
  complianceFlags?: number;
  riskScore?: number;
  variant?: "compact" | "detailed";
  onClick?: () => void;
}

const statusConfig = {
  pending: { color: "neutral" as const, label: "PENDING" },
  "in-progress": { color: "info" as const, label: "IN PROGRESS" },
  ready: { color: "success" as const, label: "READY" },
  complete: { color: "success" as const, label: "COMPLETE" },
  delayed: { color: "error" as const, label: "DELAYED" }
};

const priorityConfig = {
  normal: { color: "neutral" as const, label: "NORMAL" },
  rush: { color: "warning" as const, label: "RUSH" },
  critical: { color: "error" as const, label: "CRITICAL" }
};

export const OrderCard: React.FC<OrderCardProps> = ({
  orderId,
  customerName,
  itemsCount,
  status,
  priority = "normal",
  prepTime,
  store,
  complianceFlags,
  riskScore,
  variant = "compact",
  onClick
}) => {
  const statusInfo = statusConfig[status];
  const priorityInfo = priorityConfig[priority];

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.01 } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
      onClick={onClick}
      className={`p-6 ${onClick ? "cursor-pointer" : ""}`}
      style={{
        backgroundColor: "var(--b1-obsidian-panel)",
        border: "1px solid var(--b1-border-subtle)",
        borderRadius: "var(--radius-md)"
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className="tracking-wider"
            style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-md)" }}
          >
            {orderId}
          </span>
          <Badge variant="solid" color={statusInfo.color}>
            {statusInfo.label}
          </Badge>
          {priority !== "normal" && (
            <Badge variant="solid" color={priorityInfo.color}>
              {priorityInfo.label}
            </Badge>
          )}
        </div>

        {prepTime && (
          <div className="flex items-center gap-1" style={{ color: "var(--b1-neutral-gray)" }}>
            <Clock className="w-4 h-4" />
            <span className="text-sm">{prepTime}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {customerName && (
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--b1-neutral-gray)" }}>
              CUSTOMER
            </div>
            <div style={{ color: "var(--b1-white-space)" }}>{customerName}</div>
          </div>
        )}

        <div>
          <div className="text-xs mb-1" style={{ color: "var(--b1-neutral-gray)" }}>
            ITEMS
          </div>
          <div style={{ color: "var(--b1-white-space)" }}>{itemsCount}</div>
        </div>

        {store && (
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--b1-neutral-gray)" }}>
              STORE
            </div>
            <div style={{ color: "var(--b1-white-space)" }}>{store}</div>
          </div>
        )}

        {variant === "detailed" && (
          <>
            {complianceFlags !== undefined && complianceFlags > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" style={{ color: "var(--color-warning)" }} />
                <div>
                  <div className="text-xs" style={{ color: "var(--b1-neutral-gray)" }}>
                    COMPLIANCE FLAGS
                  </div>
                  <div style={{ color: "var(--color-warning)" }}>{complianceFlags}</div>
                </div>
              </div>
            )}

            {riskScore !== undefined && riskScore > 0 && (
              <div className="flex items-center gap-2">
                <div>
                  <div className="text-xs" style={{ color: "var(--b1-neutral-gray)" }}>
                    RISK SCORE
                  </div>
                  <div
                    style={{
                      color: riskScore > 70 ? "var(--color-error)" : "var(--color-warning)"
                    }}
                  >
                    {riskScore}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {status === "ready" && (
        <div className="mt-4 flex items-center gap-2" style={{ color: "var(--color-success)" }}>
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">Ready for pickup</span>
        </div>
      )}
    </motion.div>
  );
};
