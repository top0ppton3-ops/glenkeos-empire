import { motion } from "motion/react";

export interface ListItemProps {
  leadingIcon?: React.ReactNode;
  leadingAvatar?: React.ReactNode;
  title: string;
  subtitle?: string;
  trailingAction?: React.ReactNode;
  onClick?: () => void;
  variant?: "basic" | "interactive" | "dense" | "media";
}

export const ListItem: React.FC<ListItemProps> = ({
  leadingIcon,
  leadingAvatar,
  title,
  subtitle,
  trailingAction,
  onClick,
  variant = "basic"
}) => {
  const isDense = variant === "dense";
  const isInteractive = variant === "interactive" || !!onClick;

  const Component = isInteractive ? motion.div : "div";

  const motionProps = isInteractive
    ? {
        whileHover: { backgroundColor: "var(--b1-obsidian)" },
        whileTap: { scale: 0.99 },
        transition: { duration: 0.12 }
      }
    : {};

  return (
    <Component
      className={`flex items-center gap-3 ${isDense ? "px-4 py-2" : "px-6 py-4"} ${
        isInteractive ? "cursor-pointer" : ""
      } border-b`}
      style={{ borderBottomColor: "var(--b1-border-subtle)" }}
      onClick={onClick}
      {...(Component === motion.div ? motionProps : {})}
    >
      {(leadingIcon || leadingAvatar) && (
        <div className="flex-shrink-0" style={{ color: "var(--b1-neutral-gray)" }}>
          {leadingAvatar || leadingIcon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div
          className="truncate tracking-wide"
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--b1-white-space)"
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            className="truncate mt-1"
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--b1-neutral-gray)"
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {trailingAction && <div className="flex-shrink-0">{trailingAction}</div>}
    </Component>
  );
};

export interface ListProps {
  children: React.ReactNode;
  variant?: "basic" | "interactive" | "dense" | "media";
}

export const List: React.FC<ListProps> = ({ children, variant = "basic" }) => {
  return (
    <div
      className="overflow-hidden"
      style={{
        backgroundColor: "var(--b1-obsidian-panel)",
        border: "1px solid var(--b1-border-subtle)",
        borderRadius: "var(--radius-md)"
      }}
    >
      {children}
    </div>
  );
};
