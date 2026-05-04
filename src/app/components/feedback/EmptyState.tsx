import { Inbox } from "lucide-react";
import { Button } from "../core/Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-4" style={{ color: "var(--b1-neutral-gray)" }}>
        {icon || <Inbox className="w-12 h-12" />}
      </div>

      <h3
        className="mb-2 tracking-wider"
        style={{
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--font-weight-medium)",
          color: "var(--b1-white-space)"
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          className="mb-6 max-w-md"
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--b1-neutral-gray)",
            lineHeight: "var(--line-height-relaxed)"
          }}
        >
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
