import { motion } from "motion/react";

export type LoaderVariant = "spinner" | "bar" | "dots" | "inline";
export type LoaderSize = "sm" | "md" | "lg";

export interface LoaderProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  label?: string;
  progress?: number;
}

const sizeStyles = {
  sm: { width: "16px", height: "16px" },
  md: { width: "24px", height: "24px" },
  lg: { width: "32px", height: "32px" }
};

export const Loader: React.FC<LoaderProps> = ({
  variant = "spinner",
  size = "md",
  label,
  progress
}) => {
  if (variant === "spinner") {
    const sizeStyle = sizeStyles[size];

    return (
      <div className="flex flex-col items-center gap-2" role="status" aria-label={label || "Loading"}>
        <svg
          className="animate-spin"
          style={sizeStyle}
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
            style={{ stroke: "var(--b1-neutral-gray)" }}
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            style={{ fill: "var(--b1-gold-minimal)" }}
          />
        </svg>
        {label && (
          <div className="text-sm" style={{ color: "var(--b1-neutral-gray)" }}>
            {label}
          </div>
        )}
      </div>
    );
  }

  if (variant === "bar") {
    return (
      <div className="w-full" role="progressbar" aria-label={label || "Loading"}>
        {label && (
          <div className="mb-2 text-sm" style={{ color: "var(--b1-white-space)" }}>
            {label}
          </div>
        )}
        <div
          className="w-full h-2 overflow-hidden"
          style={{
            backgroundColor: "var(--b1-obsidian-panel)",
            borderRadius: "var(--radius-full)"
          }}
        >
          {progress !== undefined ? (
            <div
              className="h-full transition-all"
              style={{
                width: `${progress}%`,
                backgroundColor: "var(--b1-gold-minimal)"
              }}
            />
          ) : (
            <motion.div
              className="h-full"
              style={{ backgroundColor: "var(--b1-gold-minimal)" }}
              animate={{
                x: ["-100%", "100%"]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </div>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className="flex items-center gap-2" role="status" aria-label={label || "Loading"}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--b1-gold-minimal)" }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
        {label && (
          <div className="ml-2 text-sm" style={{ color: "var(--b1-neutral-gray)" }}>
            {label}
          </div>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--b1-gold-minimal)", borderTopColor: "transparent" }} />
        {label && <span className="text-sm" style={{ color: "var(--b1-neutral-gray)" }}>{label}</span>}
      </span>
    );
  }

  return null;
};
