import { HTMLAttributes } from "react";

export type BadgeVariant = "solid" | "subtle" | "outline";
export type BadgeColor = "success" | "warning" | "error" | "info" | "neutral" | "primary";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  color?: BadgeColor;
  icon?: React.ReactNode;
}

const colorConfig = {
  success: {
    solid: { bg: "var(--color-success)", text: "var(--b1-white-space)" },
    subtle: { bg: "rgba(46, 125, 50, 0.15)", text: "var(--color-success)" },
    outline: { border: "var(--color-success)", text: "var(--color-success)" }
  },
  warning: {
    solid: { bg: "var(--color-warning)", text: "var(--b1-black-marble)" },
    subtle: { bg: "rgba(237, 108, 2, 0.15)", text: "var(--color-warning)" },
    outline: { border: "var(--color-warning)", text: "var(--color-warning)" }
  },
  error: {
    solid: { bg: "var(--color-error)", text: "var(--b1-white-space)" },
    subtle: { bg: "rgba(211, 47, 47, 0.15)", text: "var(--color-error)" },
    outline: { border: "var(--color-error)", text: "var(--color-error)" }
  },
  info: {
    solid: { bg: "var(--color-info)", text: "var(--b1-white-space)" },
    subtle: { bg: "rgba(2, 136, 209, 0.15)", text: "var(--color-info)" },
    outline: { border: "var(--color-info)", text: "var(--color-info)" }
  },
  neutral: {
    solid: { bg: "var(--b1-neutral-gray)", text: "var(--b1-black-marble)" },
    subtle: { bg: "var(--b1-obsidian-panel)", text: "var(--b1-neutral-gray)" },
    outline: { border: "var(--b1-border-subtle)", text: "var(--b1-neutral-gray)" }
  },
  primary: {
    solid: { bg: "var(--b1-gold-minimal)", text: "var(--b1-black-marble)" },
    subtle: { bg: "rgba(212, 175, 55, 0.15)", text: "var(--b1-gold-minimal)" },
    outline: { border: "var(--b1-gold-trim)", text: "var(--b1-gold-trim)" }
  }
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "solid",
  color = "neutral",
  icon,
  children,
  className = "",
  ...props
}) => {
  const config = colorConfig[color][variant];

  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-1)",
    padding: "var(--space-1) var(--space-3)",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-medium)",
    borderRadius: "var(--radius-full)",
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const
  };

  const variantStyles =
    variant === "outline"
      ? {
          ...baseStyles,
          backgroundColor: "transparent",
          border: `1px solid ${config.border}`,
          color: config.text
        }
      : {
          ...baseStyles,
          backgroundColor: config.bg,
          color: config.text,
          border: "none"
        };

  return (
    <span className={className} style={variantStyles} {...props}>
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </span>
  );
};
