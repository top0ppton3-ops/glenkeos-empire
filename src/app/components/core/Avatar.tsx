import { HTMLAttributes } from "react";
import { User } from "lucide-react";

export type AvatarVariant = "circle" | "square";
export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AvatarVariant;
  size?: AvatarSize;
  src?: string;
  alt?: string;
  initials?: string;
}

const sizeStyles = {
  sm: { width: "32px", height: "32px", fontSize: "var(--font-size-xs)" },
  md: { width: "40px", height: "40px", fontSize: "var(--font-size-sm)" },
  lg: { width: "48px", height: "48px", fontSize: "var(--font-size-md)" },
  xl: { width: "64px", height: "64px", fontSize: "var(--font-size-lg)" }
};

export const Avatar: React.FC<AvatarProps> = ({
  variant = "circle",
  size = "md",
  src,
  alt = "Avatar",
  initials,
  className = "",
  ...props
}) => {
  const sizeStyle = sizeStyles[size];
  const borderRadius = variant === "circle" ? "var(--radius-full)" : "var(--radius-md)";

  if (src) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden ${className}`}
        style={{
          ...sizeStyle,
          borderRadius,
          backgroundColor: "var(--b1-obsidian-panel)"
        }}
        {...props}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }

  if (initials) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{
          ...sizeStyle,
          borderRadius,
          backgroundColor: "var(--b1-gold-minimal)",
          color: "var(--b1-black-marble)",
          fontWeight: "var(--font-weight-medium)"
        }}
        {...props}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        ...sizeStyle,
        borderRadius,
        backgroundColor: "var(--b1-obsidian-panel)",
        color: "var(--b1-neutral-gray)"
      }}
      {...props}
    >
      <User className="w-1/2 h-1/2" />
    </div>
  );
};
