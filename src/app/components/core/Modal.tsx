import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl"
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md"
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              zIndex: "var(--z-modal)"
            }}
            onClick={onClose}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`w-full ${sizeStyles[size]} flex flex-col`}
              style={{
                backgroundColor: "var(--b1-obsidian)",
                border: "1px solid var(--b1-border-subtle)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                maxHeight: "90vh"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {title && (
                <div
                  className="flex items-center justify-between px-6 py-4 border-b"
                  style={{ borderBottomColor: "var(--b1-border-subtle)" }}
                >
                  <h2
                    className="tracking-wider"
                    style={{
                      fontSize: "var(--font-size-xl)",
                      fontWeight: "var(--font-weight-medium)",
                      color: "var(--b1-white-space)"
                    }}
                  >
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-1 rounded transition-colors"
                    style={{ color: "var(--b1-neutral-gray)" }}
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="px-6 py-6 overflow-y-auto flex-1">{children}</div>

              {/* Footer */}
              {footer && (
                <div
                  className="px-6 py-4 border-t"
                  style={{ borderTopColor: "var(--b1-border-subtle)" }}
                >
                  {footer}
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
