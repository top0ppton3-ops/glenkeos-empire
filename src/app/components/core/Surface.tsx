import { HTMLAttributes } from "react";

export type SurfaceVariant = "flat" | "elevated" | "inset";

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles = {
  flat: {
    backgroundColor: "var(--b1-obsidian-panel)",
    border: "1px solid var(--b1-border-subtle)",
    boxShadow: "none"
  },
  elevated: {
    backgroundColor: "var(--b1-obsidian-panel)",
    border: "1px solid var(--b1-border-subtle)",
    boxShadow: "var(--shadow-md)"
  },
  inset: {
    backgroundColor: "var(--b1-obsidian)",
    border: "1px solid var(--b1-border-subtle)",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
  }
};

const paddingStyles = {
  none: "0",
  sm: "var(--space-4)",
  md: "var(--space-6)",
  lg: "var(--space-8)"
};

export const Surface: React.FC<SurfaceProps> = ({
  variant = "flat",
  padding = "md",
  children,
  className = "",
  ...props
}) => {
  const variantStyle = variantStyles[variant];
  const paddingValue = paddingStyles[padding];

  return (
    <div
      className={className}
      style={{
        ...variantStyle,
        padding: paddingValue,
        borderRadius: "var(--radius-md)"
      }}
      {...props}
    >
      {children}
    </div>
  );
};
