import { DayLog, DRINK_TYPES } from "./types";

export type NotificationPermission = "granted" | "denied" | "default";

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// Send a notification
export function sendNotification(title: string, options?: NotificationOptions) {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/icon.png",
      badge: "/badge.png",
      ...options,
    });
  }
}

// Analyze drinking patterns from history
export function analyzeDrinkingPatterns(history: Record<string, DayLog>) {
  const hourlyActivity: Record<number, number> = {};
  
  // Analyze last 14 days
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  Object.values(history).forEach(day => {
    const dayDate = new Date(day.date);
    if (dayDate < twoWeeksAgo) return;
    
    day.logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });
  });
  
  // Find top 3 most active hours
  const activeHours = Object.entries(hourlyActivity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));
  
  return { activeHours, hourlyActivity };
}

// Generate smart reminder times based on patterns
export function generateSmartReminderTimes(history: Record<string, DayLog>): number[] {
  const { activeHours } = analyzeDrinkingPatterns(history);
  
  if (activeHours.length === 0) {
    // Default times if no pattern detected: 9am, 12pm, 3pm, 6pm
    return [9, 12, 15, 18];
  }
  
  // Use active hours + fill gaps
  const times = [...activeHours];
  
  // Add morning if not covered
  if (!times.some(h => h >= 7 && h <= 10)) {
    times.push(9);
  }
  
  // Add afternoon if not covered
  if (!times.some(h => h >= 14 && h <= 16)) {
    times.push(15);
  }
  
  // Add evening if not covered
  if (!times.some(h => h >= 17 && h <= 19)) {
    times.push(18);
  }
  
  return times.sort((a, b) => a - b).slice(0, 5); // Max 5 reminders per day
}

// Generate regular reminder times
export function generateRegularReminderTimes(): number[] {
  // Every 2 hours from 8am to 8pm
  return [8, 10, 12, 14, 16, 18, 20];
}

// Get motivational messages
export function getMotivationalMessage(hydrationPercentage: number): string {
  if (hydrationPercentage >= 100) {
    return "🎉 Amazing! You've hit your goal! Keep it up!";
  } else if (hydrationPercentage >= 75) {
    return "💪 Almost there! Just a bit more to reach your goal!";
  } else if (hydrationPercentage >= 50) {
    return "🌊 Great progress! You're halfway there!";
  } else if (hydrationPercentage >= 25) {
    return "💧 Good start! Let's keep the momentum going!";
  } else {
    return "🚰 Time to hydrate! Your body will thank you!";
  }
}

// Schedule next reminder
export function scheduleNextReminder(
  reminderTimes: number[],
  callback: () => void
): number | null {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Find next reminder time
  let nextReminderHour = reminderTimes.find(h => h > currentHour || (h === currentHour && currentMinute < 5));
  
  if (!nextReminderHour) {
    // No more reminders today, schedule first one for tomorrow
    nextReminderHour = reminderTimes[0];
  }
  
  // Calculate time until next reminder
  const nextReminder = new Date(now);
  if (nextReminderHour <= currentHour) {
    // Tomorrow
    nextReminder.setDate(nextReminder.getDate() + 1);
  }
  nextReminder.setHours(nextReminderHour, 0, 0, 0);
  
  const timeUntilReminder = nextReminder.getTime() - now.getTime();
  
  // Schedule the reminder
  const timeoutId = window.setTimeout(callback, timeUntilReminder);
  
  return timeoutId;
}

// Check if user needs a reminder (hasn't logged in a while)
export function shouldSendReminder(lastLogTimestamp: number | null, intervalHours: number = 2): boolean {
  if (!lastLogTimestamp) return true;
  
  const now = Date.now();
  const timeSinceLastLog = now - lastLogTimestamp;
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  return timeSinceLastLog >= intervalMs;
}
