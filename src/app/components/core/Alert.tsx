import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { HTMLAttributes, useState } from "react";

export type AlertVariant = "success" | "warning" | "error" | "info";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant: AlertVariant;
  title?: string;
  isDismissible?: boolean;
  onDismiss?: () => void;
}

const variantConfig = {
  success: {
    icon: CheckCircle2,
    backgroundColor: "rgba(46, 125, 50, 0.1)",
    borderColor: "var(--color-success)",
    iconColor: "var(--color-success)"
  },
  warning: {
    icon: AlertTriangle,
    backgroundColor: "rgba(237, 108, 2, 0.1)",
    borderColor: "var(--color-warning)",
    iconColor: "var(--color-warning)"
  },
  error: {
    icon: XCircle,
    backgroundColor: "rgba(211, 47, 47, 0.1)",
    borderColor: "var(--color-error)",
    iconColor: "var(--color-error)"
  },
  info: {
    icon: Info,
    backgroundColor: "rgba(2, 136, 209, 0.1)",
    borderColor: "var(--color-info)",
    iconColor: "var(--color-info)"
  }
};

export const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  isDismissible = false,
  onDismiss,
  children,
  className = "",
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 ${className}`}
      style={{
        backgroundColor: config.backgroundColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: "var(--radius-md)"
      }}
      role="alert"
      {...props}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: config.iconColor }} />

      <div className="flex-1">
        {title && (
          <div
            className="mb-1 tracking-wide"
            style={{
              fontWeight: "var(--font-weight-medium)",
              fontSize: "var(--font-size-sm)",
              color: "var(--b1-white-space)"
            }}
          >
            {title}
          </div>
        )}
        <div
          className="text-sm"
          style={{ color: "var(--b1-white-space)", lineHeight: "var(--line-height-normal)" }}
        >
          {children}
        </div>
      </div>

      {isDismissible && (
        <button
          onClick={handleDismiss}
          className="p-1 rounded transition-colors flex-shrink-0"
          style={{ color: "var(--b1-neutral-gray)" }}
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
