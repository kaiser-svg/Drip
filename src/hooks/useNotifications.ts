"use client";

import { useEffect, useRef, useCallback } from "react";
import { useHydration } from "./useHydration";
import {
  requestNotificationPermission,
  sendNotification,
  generateSmartReminderTimes,
  generateRegularReminderTimes,
  scheduleNextReminder,
  getMotivationalMessage,
  shouldSendReminder,
} from "@/lib/notifications";

export function useNotifications() {
  const { settings, history, hydration, goal, logs } = useHydration();
  const timeoutRef = useRef<number | null>(null);
  const hasRequestedPermission = useRef(false);

  // Request permission when reminders are enabled
  useEffect(() => {
    if (settings.remindersEnabled && !hasRequestedPermission.current) {
      hasRequestedPermission.current = true;
      requestNotificationPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notifications enabled");
        }
      });
    }
  }, [settings.remindersEnabled]);

  // Send reminder notification
  const sendReminderNotification = useCallback(() => {
    if (!settings.remindersEnabled) return;
    
    const percentage = (hydration / goal) * 100;
    const message = getMotivationalMessage(percentage);
    
    // Check if user actually needs a reminder
    const lastLog = logs[logs.length - 1];
    const lastLogTime = lastLog?.timestamp || null;
    
    if (shouldSendReminder(lastLogTime, 2)) {
      sendNotification("Time to Hydrate! 💧", {
        body: message,
        tag: "hydration-reminder",
        requireInteraction: false,
      });
    }
  }, [settings.remindersEnabled, hydration, goal, logs]);

  // Schedule reminders
  useEffect(() => {
    if (!settings.remindersEnabled) {
      // Clear any existing timeout
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Determine reminder times based on smart schedule
    let reminderTimes: number[];
    
    if (settings.smartSchedule) {
      reminderTimes = generateSmartReminderTimes(history);
    } else {
      reminderTimes = generateRegularReminderTimes();
    }

    // Schedule next reminder
    const scheduleNext = () => {
      sendReminderNotification();
      
      // Schedule the next one
      const timeoutId = scheduleNextReminder(reminderTimes, scheduleNext);
      if (timeoutId !== null) {
        timeoutRef.current = timeoutId;
      }
    };

    // Clear previous timeout
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule first reminder
    const timeoutId = scheduleNextReminder(reminderTimes, scheduleNext);
    if (timeoutId !== null) {
      timeoutRef.current = timeoutId;
    }

    // Cleanup
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [settings.remindersEnabled, settings.smartSchedule, history, sendReminderNotification]);

  return {
    requestPermission: requestNotificationPermission,
  };
}
