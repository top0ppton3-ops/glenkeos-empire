import { motion } from "motion/react";
import { forwardRef, ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "icon";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: {
    backgroundColor: "var(--b1-gold-minimal)",
    color: "var(--b1-black-marble)",
    border: "none"
  },
  secondary: {
    backgroundColor: "transparent",
    color: "var(--b1-gold-trim)",
    border: "1px solid var(--b1-gold-trim)"
  },
  tertiary: {
    backgroundColor: "transparent",
    color: "var(--b1-white-space)",
    border: "1px solid var(--b1-border-subtle)"
  },
  destructive: {
    backgroundColor: "var(--color-error)",
    color: "var(--b1-white-space)",
    border: "none"
  },
  icon: {
    backgroundColor: "transparent",
    color: "var(--b1-white-space)",
    border: "none"
  }
};

const sizeStyles = {
  sm: {
    padding: "var(--space-2) var(--space-4)",
    fontSize: "var(--font-size-sm)"
  },
  md: {
    padding: "var(--space-3) var(--space-6)",
    fontSize: "var(--font-size-md)"
  },
  lg: {
    padding: "var(--space-4) var(--space-8)",
    fontSize: "var(--font-size-lg)"
  }
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ duration: 0.12 }}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 tracking-wider font-medium transition-all ${
          fullWidth ? "w-full" : ""
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
        style={{
          ...variantStyle,
          ...sizeStyle,
          borderRadius: "var(--radius-sm)",
          fontWeight: "var(--font-weight-medium)"
        }}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span>{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span>{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
