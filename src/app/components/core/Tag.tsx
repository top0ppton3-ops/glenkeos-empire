import { X } from "lucide-react";
import { HTMLAttributes } from "react";

export type TagVariant = "default" | "removable" | "icon-label";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  icon?: React.ReactNode;
  onRemove?: () => void;
}

export const Tag: React.FC<TagProps> = ({
  variant = "default",
  icon,
  onRemove,
  children,
  className = "",
  ...props
}) => {
  const isRemovable = variant === "removable" || !!onRemove;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 ${className}`}
      style={{
        backgroundColor: "var(--b1-obsidian-panel)",
        border: "1px solid var(--b1-border-subtle)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--font-size-sm)",
        color: "var(--b1-white-space)"
      }}
      {...props}
    >
      {icon && <span className="flex items-center" style={{ color: "var(--b1-neutral-gray)" }}>{icon}</span>}
      <span>{children}</span>
      {isRemovable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="p-0.5 rounded transition-colors flex items-center"
          style={{ color: "var(--b1-neutral-gray)" }}
          aria-label="Remove tag"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
