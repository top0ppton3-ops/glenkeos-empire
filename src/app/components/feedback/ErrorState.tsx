import { AlertCircle } from "lucide-react";
import { Button } from "../core/Button";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  supportLink?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try Again",
  supportLink
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-4" style={{ color: "var(--color-error)" }}>
        <AlertCircle className="w-12 h-12" />
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

      <p
        className="mb-6 max-w-md"
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--b1-neutral-gray)",
          lineHeight: "var(--line-height-relaxed)"
        }}
      >
        {message}
      </p>

      <div className="flex gap-3">
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}

        {supportLink && (
          <Button variant="tertiary" onClick={() => window.location.href = supportLink}>
            Contact Support
          </Button>
        )}
      </div>
    </div>
  );
};
