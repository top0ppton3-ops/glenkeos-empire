import { motion } from "motion/react";
import { HTMLAttributes } from "react";

export type SkeletonVariant = "line" | "block" | "avatar" | "card" | "table";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  count?: number;
}

const pulseAnimation = {
  opacity: [0.3, 0.7, 0.3]
};

const pulseTransition = {
  duration: 1.5,
  repeat: Infinity,
  ease: "easeInOut"
};

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "line",
  width,
  height,
  count = 1,
  className = "",
  ...props
}) => {
  const baseStyles = {
    backgroundColor: "var(--b1-obsidian-panel)",
    borderRadius: "var(--radius-sm)"
  };

  if (variant === "line") {
    return (
      <div className={`space-y-2 ${className}`} {...props}>
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            style={{
              ...baseStyles,
              width: width || "100%",
              height: height || "16px"
            }}
            animate={pulseAnimation}
            transition={pulseTransition}
          />
        ))}
      </div>
    );
  }

  if (variant === "block") {
    return (
      <motion.div
        className={className}
        style={{
          ...baseStyles,
          width: width || "100%",
          height: height || "120px"
        }}
        animate={pulseAnimation}
        transition={pulseTransition}
        {...props}
      />
    );
  }

  if (variant === "avatar") {
    const size = width || height || "40px";
    return (
      <motion.div
        className={className}
        style={{
          ...baseStyles,
          width: size,
          height: size,
          borderRadius: "var(--radius-full)"
        }}
        animate={pulseAnimation}
        transition={pulseTransition}
        {...props}
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`p-6 ${className}`}
        style={{
          ...baseStyles,
          borderRadius: "var(--radius-md)"
        }}
        {...props}
      >
        <motion.div
          style={{
            ...baseStyles,
            width: "60%",
            height: "20px",
            marginBottom: "var(--space-4)"
          }}
          animate={pulseAnimation}
          transition={pulseTransition}
        />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              style={{
                ...baseStyles,
                width: i === 2 ? "80%" : "100%",
                height: "14px"
              }}
              animate={pulseAnimation}
              transition={pulseTransition}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={className} {...props}>
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <motion.div
                  key={j}
                  style={{
                    ...baseStyles,
                    width: "25%",
                    height: "40px"
                  }}
                  animate={pulseAnimation}
                  transition={pulseTransition}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
