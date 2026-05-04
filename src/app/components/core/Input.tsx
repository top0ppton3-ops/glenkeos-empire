import { forwardRef, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!errorText;

    return (
      <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            className="text-sm tracking-wider"
            style={{ color: "var(--b1-white-space)", fontWeight: "var(--font-weight-medium)" }}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div
              className="absolute left-3 flex items-center pointer-events-none"
              style={{ color: "var(--b1-neutral-gray)" }}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={`w-full px-4 py-3 transition-all outline-none ${
              leftIcon ? "pl-10" : ""
            } ${rightIcon ? "pr-10" : ""} ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            } ${className}`}
            style={{
              backgroundColor: "var(--b1-obsidian-panel)",
              color: "var(--b1-white-space)",
              border: `1px solid ${hasError ? "var(--color-error)" : "var(--b1-border-subtle)"}`,
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-size-md)"
            }}
            disabled={disabled}
            {...props}
          />

          {rightIcon && (
            <div
              className="absolute right-3 flex items-center pointer-events-none"
              style={{ color: "var(--b1-neutral-gray)" }}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {helperText && !errorText && (
          <div className="text-xs" style={{ color: "var(--b1-neutral-gray)" }}>
            {helperText}
          </div>
        )}

        {errorText && (
          <div className="text-xs" style={{ color: "var(--color-error)" }}>
            {errorText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
