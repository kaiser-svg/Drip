import { DrinkLog, HydrationQuality, HydrationWarning, TimePeriod, DRINK_TYPES } from './types';

const HOURLY_ABSORPTION_LIMIT = 800; // ml per hour (research-based)
const RAPID_INTAKE_THRESHOLD = 500; // ml in 15 minutes
const RAPID_INTAKE_WINDOW = 15 * 60 * 1000; // 15 minutes in ms
const MAX_CAFFEINE_DAILY = 400; // mg (FDA recommendation)
const WARNING_CAFFEINE_DAILY = 300; // mg (warn at this level)
const LONG_GAP_HOURS = 3; // Hours without hydration = gap warning

// Circadian rhythm recommendations (research-based)
const TIME_PERIODS: Omit<TimePeriod, 'actual'>[] = [
  { name: 'Morning', start: 6, end: 12, targetPercentage: 37.5 },
  { name: 'Afternoon', start: 12, end: 18, targetPercentage: 37.5 },
  { name: 'Evening', start: 18, end: 22, targetPercentage: 25 },
  { name: 'Night', start: 22, end: 6, targetPercentage: 0 }, // Should avoid
];

/**
 * Calculate total caffeine consumed today
 */
export function calculateCaffeine(logs: DrinkLog[]): number {
  return logs.reduce((total, log) => {
    const drinkDef = DRINK_TYPES[log.type];
    return total + (log.amount * drinkDef.caffeinePerMl);
  }, 0);
}

/**
 * Calculate effective hydration with beverage multipliers
 */
export function calculateEffectiveHydration(logs: DrinkLog[]): number {
  return logs.reduce((total, log) => {
    const drinkDef = DRINK_TYPES[log.type];
    return total + (log.amount * drinkDef.hydrationFactor);
  }, 0);
}

/**
 * Check for rapid intake (absorption rate violation)
 */
function checkRapidIntake(logs: DrinkLog[]): HydrationWarning[] {
  const warnings: HydrationWarning[] = [];
  const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);

  for (let i = 0; i < sortedLogs.length; i++) {
    const currentLog = sortedLogs[i];
    const windowStart = currentLog.timestamp;
    const windowEnd = windowStart + RAPID_INTAKE_WINDOW;

    // Find all drinks within 15-minute window
    const windowLogs = sortedLogs.filter(
      (log) => log.timestamp >= windowStart && log.timestamp < windowEnd
    );

    const totalInWindow = windowLogs.reduce((sum, log) => sum + log.amount, 0);

    if (totalInWindow >= RAPID_INTAKE_THRESHOLD) {
      warnings.push({
        type: 'absorption',
        severity: 'warning',
        message: `⚠️ Rapid intake detected (${totalInWindow}ml in 15 min). Your body can only absorb ~800ml/hour effectively. Consider spacing drinks.`,
        timestamp: currentLog.timestamp,
      });
      // Skip logs in this window to avoid duplicate warnings
      i += windowLogs.length - 1;
    }
  }

  return warnings;
}

/**
 * Check for hourly intake exceeding absorption limits
 */
function checkHourlyLimits(logs: DrinkLog[]): HydrationWarning[] {
  const warnings: HydrationWarning[] = [];
  const hourlyTotals = new Map<number, { total: number; timestamp: number }>();

  logs.forEach((log) => {
    const hour = new Date(log.timestamp).getHours();
    const existing = hourlyTotals.get(hour) || { total: 0, timestamp: log.timestamp };
    hourlyTotals.set(hour, {
      total: existing.total + log.amount,
      timestamp: existing.timestamp,
    });
  });

  hourlyTotals.forEach(({ total, timestamp }, hour) => {
    if (total > HOURLY_ABSORPTION_LIMIT) {
      warnings.push({
        type: 'overload',
        severity: 'info',
        message: `💡 ${total}ml consumed during ${hour}:00-${hour + 1}:00. Body absorbs ~800ml/hour max. Excess may not be fully utilized.`,
        timestamp,
      });
    }
  });

  return warnings;
}

/**
 * Check caffeine levels
 */
function checkCaffeine(logs: DrinkLog[]): HydrationWarning[] {
  const warnings: HydrationWarning[] = [];
  const totalCaffeine = calculateCaffeine(logs);

  if (totalCaffeine >= MAX_CAFFEINE_DAILY) {
    warnings.push({
      type: 'caffeine',
      severity: 'critical',
      message: `☕ High caffeine intake (${Math.round(totalCaffeine)}mg). FDA recommends max 400mg/day. Consider switching to water.`,
    });
  } else if (totalCaffeine >= WARNING_CAFFEINE_DAILY) {
    warnings.push({
      type: 'caffeine',
      severity: 'warning',
      message: `☕ Moderate caffeine intake (${Math.round(totalCaffeine)}mg). Consider balancing with water for better hydration.`,
    });
  }

  return warnings;
}

/**
 * Check for bedtime drinking
 */
function checkBedtime(logs: DrinkLog[], bedtimeHour: number = 20): HydrationWarning[] {
  const warnings: HydrationWarning[] = [];
  const lateDrinks = logs.filter((log) => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= bedtimeHour || hour < 6;
  });

  if (lateDrinks.length > 0) {
    const totalLate = lateDrinks.reduce((sum, log) => sum + log.amount, 0);
    warnings.push({
      type: 'bedtime',
      severity: 'warning',
      message: `🌙 ${totalLate}ml consumed after ${bedtimeHour}:00. Late hydration may disrupt sleep due to bathroom trips.`,
    });
  }

  return warnings;
}

/**
 * Check for long gaps in hydration
 */
function checkGaps(logs: DrinkLog[]): HydrationWarning[] {
  const warnings: HydrationWarning[] = [];
  if (logs.length < 2) return warnings;

  const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
  const maxGapMs = LONG_GAP_HOURS * 60 * 60 * 1000;

  for (let i = 1; i < sortedLogs.length; i++) {
    const gap = sortedLogs[i].timestamp - sortedLogs[i - 1].timestamp;
    if (gap > maxGapMs) {
      const gapHours = Math.round(gap / (60 * 60 * 1000));
      warnings.push({
        type: 'gap',
        severity: 'info',
        message: `⏰ ${gapHours}-hour gap detected. Regular hydration throughout the day is more effective than playing catch-up.`,
        timestamp: sortedLogs[i].timestamp,
      });
    }
  }

  return warnings;
}

/**
 * Calculate time period distribution
 */
export function calculateTimePeriods(logs: DrinkLog[], dailyGoal: number): TimePeriod[] {
  const periods: TimePeriod[] = TIME_PERIODS.map((p) => ({ ...p, actual: 0 }));

  logs.forEach((log) => {
    const hour = new Date(log.timestamp).getHours();
    const effectiveAmount = log.amount * DRINK_TYPES[log.type].hydrationFactor;

    periods.forEach((period) => {
      if (
        (period.start < period.end && hour >= period.start && hour < period.end) ||
        (period.start > period.end && (hour >= period.start || hour < period.end))
      ) {
        period.actual += effectiveAmount;
      }
    });
  });

  return periods;
}

/**
 * Grade distribution quality
 */
function gradeDistribution(periods: TimePeriod[], dailyGoal: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  let totalDeviation = 0;

  periods.slice(0, 3).forEach((period) => {
    // Skip night period
    const targetAmount = (dailyGoal * period.targetPercentage) / 100;
    const deviation = Math.abs(period.actual - targetAmount) / dailyGoal;
    totalDeviation += deviation;
  });

  const avgDeviation = totalDeviation / 3;

  if (avgDeviation < 0.1) return 'A';
  if (avgDeviation < 0.2) return 'B';
  if (avgDeviation < 0.3) return 'C';
  if (avgDeviation < 0.4) return 'D';
  return 'F';
}

/**
 * Grade spacing between drinks
 */
function gradeSpacing(logs: DrinkLog[]): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (logs.length < 2) return 'C';

  const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
  const gaps: number[] = [];

  for (let i = 1; i < sortedLogs.length; i++) {
    gaps.push(sortedLogs[i].timestamp - sortedLogs[i - 1].timestamp);
  }

  const avgGapHours = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length / (60 * 60 * 1000);
  const maxGapHours = Math.max(...gaps) / (60 * 60 * 1000);

  // Ideal: drinks every 1-2 hours during waking hours
  if (avgGapHours >= 1 && avgGapHours <= 2 && maxGapHours < 3) return 'A';
  if (avgGapHours <= 3 && maxGapHours < 4) return 'B';
  if (maxGapHours < 5) return 'C';
  if (maxGapHours < 7) return 'D';
  return 'F';
}

/**
 * Grade bedtime timing
 */
function gradeTiming(logs: DrinkLog[], bedtimeHour: number = 20): 'A' | 'B' | 'C' | 'D' | 'F' {
  const lateDrinks = logs.filter((log) => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= bedtimeHour || hour < 6;
  });

  const totalLate = lateDrinks.reduce((sum, log) => sum + log.amount, 0);
  const latePercentage = logs.length > 0 ? totalLate / logs.reduce((sum, log) => sum + log.amount, 0) : 0;

  if (latePercentage === 0) return 'A';
  if (latePercentage < 0.1) return 'B';
  if (latePercentage < 0.2) return 'C';
  if (latePercentage < 0.3) return 'D';
  return 'F';
}

/**
 * Generate insights
 */
function generateInsights(
  logs: DrinkLog[],
  periods: TimePeriod[],
  distribution: string,
  spacing: string,
  timing: string
): string[] {
  const insights: string[] = [];

  // Best period insight
  const bestPeriod = periods.reduce((best, period) =>
    period.actual > best.actual ? period : best
  );
  if (bestPeriod.actual > 0) {
    insights.push(`🌟 Best hydration: ${bestPeriod.name} (${Math.round(bestPeriod.actual)}ml)`);
  }

  // Grade-specific insights
  if (distribution === 'A') {
    insights.push('🎯 Excellent distribution throughout the day!');
  } else if (distribution === 'D' || distribution === 'F') {
    insights.push('💡 Try spreading drinks more evenly across morning, afternoon, and evening');
  }

  if (spacing === 'A') {
    insights.push('⏱️ Perfect spacing between drinks!');
  } else if (spacing === 'D' || spacing === 'F') {
    insights.push('⏰ Aim to drink every 1-2 hours for optimal absorption');
  }

  if (timing === 'A') {
    insights.push('😴 Great bedtime hydration habits!');
  }

  // Caffeine insight
  const caffeine = calculateCaffeine(logs);
  if (caffeine > 0 && caffeine < WARNING_CAFFEINE_DAILY) {
    insights.push(`☕ Moderate caffeine: ${Math.round(caffeine)}mg (well balanced)`);
  }

  return insights;
}

/**
 * Main function: Calculate comprehensive hydration quality
 */
export function calculateHydrationQuality(
  logs: DrinkLog[],
  dailyGoal: number,
  bedtimeHour: number = 20
): HydrationQuality {
  const warnings: HydrationWarning[] = [
    ...checkRapidIntake(logs),
    ...checkHourlyLimits(logs),
    ...checkCaffeine(logs),
    ...checkBedtime(logs, bedtimeHour),
    ...checkGaps(logs),
  ];

  const periods = calculateTimePeriods(logs, dailyGoal);
  const distribution = gradeDistribution(periods, dailyGoal);
  const spacing = gradeSpacing(logs);
  const timing = gradeTiming(logs, bedtimeHour);

  // Calculate overall grade (weighted average)
  const grades = { A: 4, B: 3, C: 2, D: 1, F: 0 };
  const overallScore =
    (grades[distribution] * 0.4 + grades[spacing] * 0.3 + grades[timing] * 0.3) / 1;
  const overall =
    overallScore >= 3.5
      ? 'A'
      : overallScore >= 2.5
      ? 'B'
      : overallScore >= 1.5
      ? 'C'
      : overallScore >= 0.5
      ? 'D'
      : 'F';

  const insights = generateInsights(logs, periods, distribution, spacing, timing);

  return {
    overall,
    distribution,
    spacing,
    timing,
    warnings,
    insights,
  };
}

/**
 * Get circadian rhythm recommendations for current time
 */
export function getCircadianGuidance(): {
  period: string;
  recommendation: string;
  emoji: string;
} {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 9) {
    return {
      period: 'Early Morning',
      recommendation: 'Start your day with 500ml within 30 minutes of waking',
      emoji: '🌅',
    };
  } else if (hour >= 9 && hour < 12) {
    return {
      period: 'Morning',
      recommendation: 'Maintain steady intake - aim for 250-500ml per hour',
      emoji: '☀️',
    };
  } else if (hour >= 12 && hour < 14) {
    return {
      period: 'Lunch Time',
      recommendation: 'Drink 300ml 20-30 minutes before meals to aid digestion',
      emoji: '🍽️',
    };
  } else if (hour >= 14 && hour < 18) {
    return {
      period: 'Afternoon',
      recommendation: 'Keep hydrating regularly - your body needs consistent intake',
      emoji: '🌤️',
    };
  } else if (hour >= 18 && hour < 20) {
    return {
      period: 'Evening',
      recommendation: 'Continue light hydration, but start tapering off',
      emoji: '🌆',
    };
  } else if (hour >= 20 && hour < 22) {
    return {
      period: 'Pre-Bedtime',
      recommendation: 'Minimize intake to avoid sleep disruptions',
      emoji: '🌙',
    };
  } else {
    return {
      period: 'Night',
      recommendation: 'Avoid drinking to ensure uninterrupted sleep',
      emoji: '😴',
    };
  }
}
