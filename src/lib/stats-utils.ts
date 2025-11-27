import { DayLog, DRINK_TYPES } from "./types";

export function getWeeklyData(history: Record<string, DayLog>) {
  const days = [];
  const today = new Date();
  
  // Go back 6 days + today = 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const log = history[dateKey];
    let total = 0;
    
    if (log) {
      total = log.logs.reduce((acc, curr) => {
         const factor = DRINK_TYPES[curr.type]?.hydrationFactor || 1;
         return acc + (curr.amount * factor);
      }, 0);
    }

    days.push({
      date: dateKey,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      total: Math.round(total),
      goal: log?.goal || 2000, // fallback goal if not recorded
    });
  }
  
  return days;
}

export function getTotalHydration(history: Record<string, DayLog>) {
  let totalVolume = 0;
  Object.values(history).forEach(day => {
    day.logs.forEach(log => {
        totalVolume += log.amount;
    });
  });
  return totalVolume;
}

export function getAchievementProgress(history: Record<string, DayLog>) {
  const daysMetGoal = Object.values(history).filter(day => {
    const total = day.logs.reduce((acc, curr) => {
       const factor = DRINK_TYPES[curr.type]?.hydrationFactor || 1;
       return acc + (curr.amount * factor);
    }, 0);
    return total >= day.goal;
  }).length;

  return {
    daysMetGoal,
    totalLoggedDays: Object.keys(history).length,
  };
}

export function calculateStreak(history: Record<string, DayLog>) {
  let streak = 0;
  const today = new Date();
  let currentCheck = new Date(today);
  
  // Check today first
  const todayKey = currentCheck.toISOString().split('T')[0];
  const todayLog = history[todayKey];
  let todayMet = false;
  
  if (todayLog) {
    const total = todayLog.logs.reduce((acc, curr) => {
       const factor = DRINK_TYPES[curr.type]?.hydrationFactor || 1;
       return acc + (curr.amount * factor);
    }, 0);
    if (total >= todayLog.goal) {
      streak++;
      todayMet = true;
    }
  }

  // Move to yesterday
  currentCheck.setDate(currentCheck.getDate() - 1);

  while (true) {
    const dateKey = currentCheck.toISOString().split('T')[0];
    const log = history[dateKey];
    
    if (!log) {
      // If no log exists for yesterday, and today wasn't met, streak is 0.
      // If today WAS met, streak ends here (1).
      // Exception: Maybe user just didn't log anything yesterday but streak shouldn't strictly break if we define it leniently? 
      // Strict definition: Streak requires continuous days. Missing a day breaks it.
      break;
    }

    const total = log.logs.reduce((acc, curr) => {
       const factor = DRINK_TYPES[curr.type]?.hydrationFactor || 1;
       return acc + (curr.amount * factor);
    }, 0);

    if (total >= log.goal) {
      streak++;
      currentCheck.setDate(currentCheck.getDate() - 1);
    } else {
      // If yesterday was not met, streak chain is broken.
      // BUT, if we didn't meet today yet, we shouldn't punish user for today yet.
      // Streak is "consecutive days met ending yesterday" OR "ending today".
      // If today is met, we count it.
      // If today is NOT met, we check if yesterday was met.
      // If yesterday was met, streak is valid.
      // If yesterday was NOT met, streak is 0.
      
      // My loop structure:
      // I already added today if met.
      // Now checking yesterday.
      // If yesterday not met, loop breaks.
      break;
    }
  }
  
  return streak;
}