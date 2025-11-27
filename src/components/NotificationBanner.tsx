"use client";

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  X, 
  Bell,
  Flame,
  Trophy,
  Clock
} from "lucide-react";

export type NotificationType = "info" | "success" | "warning" | "reminder" | "achievement" | "streak";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // ms, default 5000
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, "id">) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const typeConfig = {
  info: {
    icon: Info,
    bgClass: "bg-blue-50 dark:bg-blue-950/50",
    borderClass: "border-blue-200 dark:border-blue-800",
    iconClass: "text-blue-500",
    titleClass: "text-blue-900 dark:text-blue-100",
  },
  success: {
    icon: CheckCircle2,
    bgClass: "bg-emerald-50 dark:bg-emerald-950/50",
    borderClass: "border-emerald-200 dark:border-emerald-800",
    iconClass: "text-emerald-500",
    titleClass: "text-emerald-900 dark:text-emerald-100",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-amber-50 dark:bg-amber-950/50",
    borderClass: "border-amber-200 dark:border-amber-800",
    iconClass: "text-amber-500",
    titleClass: "text-amber-900 dark:text-amber-100",
  },
  reminder: {
    icon: Bell,
    bgClass: "bg-cyan-50 dark:bg-cyan-950/50",
    borderClass: "border-cyan-200 dark:border-cyan-800",
    iconClass: "text-cyan-500",
    titleClass: "text-cyan-900 dark:text-cyan-100",
  },
  achievement: {
    icon: Trophy,
    bgClass: "bg-purple-50 dark:bg-purple-950/50",
    borderClass: "border-purple-200 dark:border-purple-800",
    iconClass: "text-purple-500",
    titleClass: "text-purple-900 dark:text-purple-100",
  },
  streak: {
    icon: Flame,
    bgClass: "bg-orange-50 dark:bg-orange-950/50",
    borderClass: "border-orange-200 dark:border-orange-800",
    iconClass: "text-orange-500",
    titleClass: "text-orange-900 dark:text-orange-100",
  },
};

function NotificationItem({ 
  notification, 
  onDismiss 
}: { 
  notification: Notification; 
  onDismiss: () => void;
}) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`w-full max-w-sm mx-auto ${config.bgClass} rounded-2xl border ${config.borderClass} shadow-lg backdrop-blur-xl overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 mt-0.5 ${config.iconClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${config.titleClass}`}>
              {notification.title}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              {notification.message}
            </p>
            {notification.action && (
              <button
                onClick={() => {
                  notification.action?.onClick();
                  onDismiss();
                }}
                className={`mt-2 text-xs font-medium ${config.iconClass} hover:underline`}
              >
                {notification.action.label}
              </button>
            )}
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: (notification.duration || 5000) / 1000, ease: "linear" }}
        className={`h-1 ${config.iconClass.replace('text-', 'bg-')} origin-left`}
      />
    </motion.div>
  );
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Vibrate on mobile for important notifications
    if ((notification.type === "warning" || notification.type === "achievement") && navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, dismissNotification, clearAll }}>
      {children}
      
      {/* Notification container */}
      <div className="fixed top-16 left-0 right-0 z-[90] px-4 pointer-events-none">
        <div className="max-w-md mx-auto space-y-2">
          <AnimatePresence mode="popLayout">
            {notifications.map(notification => (
              <div key={notification.id} className="pointer-events-auto">
                <NotificationItem
                  notification={notification}
                  onDismiss={() => dismissNotification(notification.id)}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotificationBanner() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationBanner must be used within a NotificationProvider");
  }
  return context;
}

// Convenience functions
export function useHydrationReminders() {
  const { showNotification } = useNotificationBanner();

  const remindToDrink = useCallback(() => {
    showNotification({
      type: "reminder",
      title: "Time to hydrate",
      message: "You haven't logged water in a while. Take a sip!",
      duration: 8000,
      action: {
        label: "Log water now",
        onClick: () => {
          // This will be handled by parent component
        },
      },
    });
  }, [showNotification]);

  const celebrateGoal = useCallback(() => {
    showNotification({
      type: "success",
      title: "Goal reached!",
      message: "You've hit your daily hydration goal. Amazing work!",
      duration: 6000,
    });
  }, [showNotification]);

  const streakReminder = useCallback((days: number) => {
    showNotification({
      type: "streak",
      title: `${days} day streak!`,
      message: "Keep it up! Your consistency is paying off.",
      duration: 6000,
    });
  }, [showNotification]);

  const warningNotification = useCallback((message: string) => {
    showNotification({
      type: "warning",
      title: "Heads up!",
      message,
      duration: 7000,
    });
  }, [showNotification]);

  return {
    remindToDrink,
    celebrateGoal,
    streakReminder,
    warningNotification,
  };
}