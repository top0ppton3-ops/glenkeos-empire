export type StatusVariant = "dot" | "dot-label" | "icon";
export type StatusColor = "success" | "warning" | "error" | "info" | "neutral";

export interface StatusIndicatorProps {
  variant?: StatusVariant;
  color?: StatusColor;
  label?: string;
  icon?: React.ReactNode;
}

const colorStyles = {
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  error: "var(--color-error)",
  info: "var(--color-info)",
  neutral: "var(--b1-neutral-gray)"
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  variant = "dot",
  color = "neutral",
  label,
  icon
}) => {
  const dotColor = colorStyles[color];

  if (variant === "dot") {
    return (
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: dotColor }}
        role="status"
        aria-label={label}
      />
    );
  }

  if (variant === "dot-label") {
    return (
      <div className="inline-flex items-center gap-2" role="status">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
        {label && (
          <span
            className="text-sm"
            style={{
              color: "var(--b1-white-space)",
              fontWeight: "var(--font-weight-medium)"
            }}
          >
            {label}
          </span>
        )}
      </div>
    );
  }

  if (variant === "icon") {
    return (
      <div className="inline-flex items-center gap-2" role="status">
        {icon && <span style={{ color: dotColor }}>{icon}</span>}
        {label && (
          <span
            className="text-sm"
            style={{
              color: "var(--b1-white-space)",
              fontWeight: "var(--font-weight-medium)"
            }}
          >
            {label}
          </span>
        )}
      </div>
    );
  }

  return null;
};
