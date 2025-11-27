"use client";

import { calculateCaffeine } from "@/lib/hydration-quality";
import { DrinkLog } from "@/lib/types";
import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaffeineTrackerProps {
  logs: DrinkLog[];
}

const MAX_CAFFEINE = 400; // FDA recommendation
const WARNING_CAFFEINE = 300;

export function CaffeineTracker({ logs }: CaffeineTrackerProps) {
  const totalCaffeine = calculateCaffeine(logs);

  if (totalCaffeine === 0) return null;

  const percentage = (totalCaffeine / MAX_CAFFEINE) * 100;
  const isWarning = totalCaffeine >= WARNING_CAFFEINE;
  const isCritical = totalCaffeine >= MAX_CAFFEINE;

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-4 transition-all",
        isCritical
          ? "border-red-500/50 bg-red-50 dark:bg-red-950/20"
          : isWarning
          ? "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20"
          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coffee
            className={cn(
              "w-5 h-5",
              isCritical
                ? "text-red-600 dark:text-red-400"
                : isWarning
                ? "text-amber-600 dark:text-amber-400"
                : "text-zinc-600 dark:text-zinc-400"
            )}
          />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Caffeine Intake
          </span>
        </div>
        <div
          className={cn(
            "text-lg font-bold",
            isCritical
              ? "text-red-600 dark:text-red-400"
              : isWarning
              ? "text-amber-600 dark:text-amber-400"
              : "text-zinc-900 dark:text-zinc-100"
          )}
        >
          {Math.round(totalCaffeine)}
          <span className="text-xs font-medium text-zinc-500 ml-1">mg</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isCritical
              ? "bg-gradient-to-r from-red-600 to-red-500"
              : isWarning
              ? "bg-gradient-to-r from-amber-600 to-amber-500"
              : "bg-gradient-to-r from-amber-600 to-amber-500"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-zinc-500">
          {isCritical
            ? "Above FDA limit"
            : isWarning
            ? "Approaching limit"
            : "Within safe range"}
        </span>
        <span className="text-zinc-500">{MAX_CAFFEINE}mg max</span>
      </div>

      {isCritical && (
        <p className="mt-3 text-xs text-red-700 dark:text-red-400 leading-relaxed">
          ⚠️ You've exceeded the FDA's recommended daily limit. Consider switching to water.
        </p>
      )}
      {isWarning && !isCritical && (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          💡 Nearing the daily caffeine limit. Balance with water for better hydration.
        </p>
      )}
    </div>
  );
}
