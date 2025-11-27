"use client";

import { DrinkLog, DRINK_TYPES } from "@/lib/types";
import { calculateTimePeriods } from "@/lib/hydration-quality";
import { cn } from "@/lib/utils";

interface HydrationTimelineProps {
  logs: DrinkLog[];
  dailyGoal: number;
}

export function HydrationTimeline({ logs, dailyGoal }: HydrationTimelineProps) {
  const periods = calculateTimePeriods(logs, dailyGoal);

  // Create hourly data for visualization
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourLogs = logs.filter((log) => {
      const logHour = new Date(log.timestamp).getHours();
      return logHour === hour;
    });

    const total = hourLogs.reduce(
      (sum, log) => sum + log.amount * DRINK_TYPES[log.type].hydrationFactor,
      0
    );

    return { hour, total, logs: hourLogs };
  });

  const maxHourly = Math.max(...hourlyData.map((d) => d.total), 300);

  // Ideal curve (circadian rhythm)
  const getIdealHeight = (hour: number): number => {
    if (hour >= 6 && hour < 12) return 70; // Morning peak
    if (hour >= 12 && hour < 18) return 70; // Afternoon peak
    if (hour >= 18 && hour < 22) return 50; // Evening taper
    return 20; // Night minimal
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">24-Hour Timeline</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500/20 border-2 border-blue-500 border-dashed" />
            <span className="text-zinc-500">Ideal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-zinc-500">Actual</span>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="relative h-32 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-3 overflow-hidden">
        <div className="flex items-end justify-between h-full gap-[2px]">
          {hourlyData.map(({ hour, total }) => {
            const actualHeight = total > 0 ? (total / maxHourly) * 100 : 0;
            const idealHeight = getIdealHeight(hour);
            const isCurrentHour = new Date().getHours() === hour;

            return (
              <div key={hour} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                {/* Ideal curve indicator */}
                <div
                  className="absolute bottom-0 w-full bg-blue-500/10 border-t-2 border-blue-500 border-dashed transition-all"
                  style={{ height: `${idealHeight}%` }}
                />

                {/* Actual bar */}
                {total > 0 && (
                  <div
                    className={cn(
                      "w-full rounded-t transition-all",
                      isCurrentHour
                        ? "bg-gradient-to-t from-blue-500 to-blue-400 animate-pulse"
                        : "bg-gradient-to-t from-blue-600 to-blue-500"
                    )}
                    style={{ height: `${actualHeight}%` }}
                  />
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
                  <div className="bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs rounded px-2 py-1 whitespace-nowrap">
                    {hour}:00 - {total > 0 ? `${Math.round(total)}ml` : "No intake"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-3 -mb-5 text-[10px] text-zinc-400">
          <span>0</span>
          <span>6</span>
          <span>12</span>
          <span>18</span>
          <span>24</span>
        </div>
      </div>

      {/* Period breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {periods.slice(0, 3).map((period) => {
          const target = (dailyGoal * period.targetPercentage) / 100;
          const percentage = target > 0 ? (period.actual / target) * 100 : 0;
          const isGood = percentage >= 80 && percentage <= 120;

          return (
            <div
              key={period.name}
              className={cn(
                "rounded-lg p-3 border-2 transition-all",
                isGood
                  ? "bg-green-50 dark:bg-green-950/20 border-green-500/30"
                  : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
              )}
            >
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {period.name}
              </div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {Math.round(period.actual)}ml
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                of {Math.round(target)}ml
              </div>
              <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isGood ? "bg-green-500" : "bg-blue-500"
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
