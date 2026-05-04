import { motion } from "motion/react";
import { HTMLAttributes } from "react";

export type CardVariant = "basic" | "elevated" | "interactive" | "selectable";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isSelected?: boolean;
}

const variantStyles = {
  basic: {
    backgroundColor: "var(--b1-obsidian-panel)",
    border: "1px solid var(--b1-border-subtle)",
    boxShadow: "none"
  },
  elevated: {
    backgroundColor: "var(--b1-obsidian-panel)",
    border: "1px solid var(--b1-border-subtle)",
    boxShadow: "var(--shadow-md)"
  },
  interactive: {
    backgroundColor: "var(--b1-obsidian-panel)",
    border: "1px solid var(--b1-border-subtle)",
    boxShadow: "var(--shadow-sm)",
    cursor: "pointer"
  },
  selectable: {
    backgroundColor: "var(--b1-obsidian-panel)",
    border: "1px solid var(--b1-border-subtle)",
    boxShadow: "none",
    cursor: "pointer"
  }
};

export const Card: React.FC<CardProps> = ({
  variant = "basic",
  header,
  footer,
  isSelected = false,
  children,
  className = "",
  ...props
}) => {
  const variantStyle = variantStyles[variant];

  const Component = variant === "interactive" || variant === "selectable" ? motion.div : "div";

  const motionProps =
    variant === "interactive" || variant === "selectable"
      ? {
          whileHover: { scale: 1.01 },
          whileTap: { scale: 0.99 },
          transition: { duration: 0.12 }
        }
      : {};

  return (
    <Component
      className={`flex flex-col ${className}`}
      style={{
        ...variantStyle,
        borderRadius: "var(--radius-md)",
        ...(isSelected && {
          border: "2px solid var(--b1-gold-trim)"
        })
      }}
      {...(Component === motion.div ? motionProps : {})}
      {...props}
    >
      {header && (
        <div
          className="px-6 py-4 border-b"
          style={{ borderBottomColor: "var(--b1-border-subtle)" }}
        >
          {header}
        </div>
      )}

      <div className="px-6 py-6">{children}</div>

      {footer && (
        <div
          className="px-6 py-4 border-t"
          style={{ borderTopColor: "var(--b1-border-subtle)" }}
        >
          {footer}
        </div>
      )}
    </Component>
  );
};
