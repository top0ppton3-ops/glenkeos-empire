import { Shield, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { Badge } from "../core/Badge";

export type ComplianceSeverity = "low" | "medium" | "high" | "critical";
export type ComplianceStatus = "pending" | "in-review" | "resolved" | "escalated";

export interface ComplianceBlockProps {
  flagType: string;
  severity: ComplianceSeverity;
  description: string;
  linkedOrderId?: string;
  linkedPolicy?: string;
  status: ComplianceStatus;
  timestamp?: string;
  assignee?: string;
  variant?: "inline" | "card" | "detailed";
  onResolve?: () => void;
  onEscalate?: () => void;
}

const severityConfig = {
  low: { color: "info" as const, label: "LOW" },
  medium: { color: "warning" as const, label: "MEDIUM" },
  high: { color: "error" as const, label: "HIGH" },
  critical: { color: "error" as const, label: "CRITICAL" }
};

const statusConfig = {
  pending: { color: "neutral" as const, label: "PENDING", icon: Shield },
  "in-review": { color: "info" as const, label: "IN REVIEW", icon: Shield },
  resolved: { color: "success" as const, label: "RESOLVED", icon: CheckCircle2 },
  escalated: { color: "error" as const, label: "ESCALATED", icon: AlertTriangle }
};

export const ComplianceBlock: React.FC<ComplianceBlockProps> = ({
  flagType,
  severity,
  description,
  linkedOrderId,
  linkedPolicy,
  status,
  timestamp,
  assignee,
  variant = "card",
  onResolve,
  onEscalate
}) => {
  const severityInfo = severityConfig[severity];
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  if (variant === "inline") {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          backgroundColor: "rgba(211, 47, 47, 0.05)",
          border: `1px solid ${
            severity === "critical" || severity === "high"
              ? "var(--color-error)"
              : "var(--color-warning)"
          }`,
          borderRadius: "var(--radius-sm)"
        }}
      >
        <AlertTriangle
          className="w-4 h-4 flex-shrink-0"
          style={{ color: severity === "critical" ? "var(--color-error)" : "var(--color-warning)" }}
        />
        <div className="flex-1 text-sm" style={{ color: "var(--b1-white-space)" }}>
          {flagType}: {description}
        </div>
        <Badge variant="solid" color={severityInfo.color}>
          {severityInfo.label}
        </Badge>
      </div>
    );
  }

  if (variant === "card" || variant === "detailed") {
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
                {flagType}
              </h3>
              <Badge variant="solid" color={severityInfo.color}>
                {severityInfo.label}
              </Badge>
              <Badge variant="subtle" color={statusInfo.color}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>

          <StatusIcon className="w-6 h-6" style={{ color: "var(--b1-gold-trim)" }} />
        </div>

        {/* Description */}
        <p className="mb-4 text-sm" style={{ color: "var(--b1-white-space)" }}>
          {description}
        </p>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          {linkedOrderId && (
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--b1-neutral-gray)" }}>
                LINKED ORDER
              </div>
              <div style={{ color: "var(--b1-white-space)" }}>{linkedOrderId}</div>
            </div>
          )}

          {linkedPolicy && (
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--b1-neutral-gray)" }}>
                RELATED POLICY
              </div>
              <div className="flex items-center gap-1" style={{ color: "var(--b1-gold-trim)" }}>
                <FileText className="w-3 h-3" />
                <span>{linkedPolicy}</span>
              </div>
            </div>
          )}

          {timestamp && (
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--b1-neutral-gray)" }}>
                TIMESTAMP
              </div>
              <div style={{ color: "var(--b1-white-space)" }}>{timestamp}</div>
            </div>
          )}

          {assignee && (
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--b1-neutral-gray)" }}>
                ASSIGNEE
              </div>
              <div style={{ color: "var(--b1-white-space)" }}>{assignee}</div>
            </div>
          )}
        </div>

        {/* Actions (Detailed variant) */}
        {variant === "detailed" && (onResolve || onEscalate) && (
          <div className="flex gap-3">
            {onResolve && status !== "resolved" && (
              <button
                onClick={onResolve}
                className="px-4 py-2 text-sm tracking-wider transition-colors"
                style={{
                  backgroundColor: "var(--b1-gold-minimal)",
                  color: "var(--b1-black-marble)",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: "var(--font-weight-medium)"
                }}
              >
                Mark Resolved
              </button>
            )}

            {onEscalate && status !== "escalated" && (
              <button
                onClick={onEscalate}
                className="px-4 py-2 text-sm tracking-wider transition-colors"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--color-error)",
                  border: "1px solid var(--color-error)",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: "var(--font-weight-medium)"
                }}
              >
                Escalate
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};
