import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

export type ToastVariant = "success" | "warning" | "error" | "info";

export interface ToastProps {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

const variantConfig = {
  success: {
    icon: CheckCircle2,
    backgroundColor: "rgba(46, 125, 50, 0.95)",
    iconColor: "var(--b1-white-space)"
  },
  warning: {
    icon: AlertTriangle,
    backgroundColor: "rgba(237, 108, 2, 0.95)",
    iconColor: "var(--b1-black-marble)"
  },
  error: {
    icon: XCircle,
    backgroundColor: "rgba(211, 47, 47, 0.95)",
    iconColor: "var(--b1-white-space)"
  },
  info: {
    icon: Info,
    backgroundColor: "rgba(2, 136, 209, 0.95)",
    iconColor: "var(--b1-white-space)"
  }
};

export const Toast: React.FC<ToastProps> = ({
  id,
  variant,
  title,
  message,
  duration = 5000,
  onDismiss
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 px-4 py-3 shadow-lg min-w-[320px] max-w-md"
      style={{
        backgroundColor: config.backgroundColor,
        borderRadius: "var(--radius-md)",
        color: config.iconColor
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />

      <div className="flex-1">
        {title && (
          <div className="mb-1 font-medium text-sm">{title}</div>
        )}
        <div className="text-sm">{message}</div>
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="p-1 rounded transition-opacity hover:opacity-70 flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export interface ToastContainerProps {
  toasts: ToastProps[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div
      className="fixed top-4 right-4 flex flex-col gap-3 pointer-events-none"
      style={{ zIndex: "var(--z-toast)" }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
