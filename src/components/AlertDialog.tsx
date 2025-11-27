"use client";

import { useState, createContext, useContext, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, CheckCircle2, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AlertType = "info" | "success" | "warning" | "error" | "confirm";

export interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  destructive?: boolean;
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

const typeConfig = {
  info: {
    icon: Info,
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
  },
  success: {
    icon: CheckCircle2,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    buttonColor: "bg-emerald-500 hover:bg-emerald-600",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    buttonColor: "bg-amber-500 hover:bg-amber-600",
  },
  error: {
    icon: XCircle,
    iconBg: "bg-red-100 dark:bg-red-900/50",
    iconColor: "text-red-600 dark:text-red-400",
    buttonColor: "bg-red-500 hover:bg-red-600",
  },
  confirm: {
    icon: Info,
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
  },
};

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlert(config);
    setIsVisible(true);
    // Vibrate for warnings and errors
    if ((config.type === "warning" || config.type === "error") && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, []);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setAlert(null), 200);
  }, []);

  const handleConfirm = () => {
    alert?.onConfirm?.();
    hideAlert();
  };

  const handleCancel = () => {
    alert?.onCancel?.();
    hideAlert();
  };

  const config = alert ? typeConfig[alert.type] : null;
  const Icon = config?.icon || Info;

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}

      <AnimatePresence>
        {isVisible && alert && config && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            onClick={handleCancel}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Dialog */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>

              <div className="p-6">
                {/* Icon */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, delay: 0.1 }}
                  className={`w-16 h-16 mx-auto mb-4 rounded-full ${config.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`w-8 h-8 ${config.iconColor}`} />
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-center"
                >
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                    {alert.title}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {alert.message}
                  </p>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 flex gap-3"
                >
                  {(alert.type === "confirm" || alert.cancelLabel) && (
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl h-12"
                      onClick={handleCancel}
                    >
                      {alert.cancelLabel || "Cancel"}
                    </Button>
                  )}
                  <Button
                    className={`flex-1 rounded-xl h-12 text-white ${
                      alert.destructive 
                        ? "bg-red-500 hover:bg-red-600" 
                        : config.buttonColor
                    }`}
                    onClick={handleConfirm}
                  >
                    {alert.confirmLabel || "OK"}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

// Convenience hooks
export function useConfirmDialog() {
  const { showAlert } = useAlert();

  const confirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmLabel?: string; cancelLabel?: string; destructive?: boolean }
  ) => {
    showAlert({
      type: "confirm",
      title,
      message,
      confirmLabel: options?.confirmLabel || "Confirm",
      cancelLabel: options?.cancelLabel || "Cancel",
      onConfirm,
      destructive: options?.destructive,
    });
  }, [showAlert]);

  return confirm;
}
