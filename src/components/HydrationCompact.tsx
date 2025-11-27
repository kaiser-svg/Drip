"use client";

import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface HydrationCompactProps {
  current: number;
  goal: number;
}

export function HydrationCompact({ current, goal }: HydrationCompactProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  return (
    <div className="rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets
            className={cn(
              "w-5 h-5",
              isComplete
                ? "text-blue-600 dark:text-blue-400"
                : "text-zinc-600 dark:text-zinc-400"
            )}
          />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Hydration Today
          </span>
        </div>
        <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {current.toFixed(1)}
          <span className="text-xs font-medium text-zinc-500 mx-0.5">/</span>
          {goal.toFixed(1)}
          <span className="text-xs font-medium text-zinc-500 ml-1">L</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isComplete
              ? "bg-gradient-to-r from-green-600 to-green-500"
              : "bg-gradient-to-r from-blue-600 to-cyan-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-zinc-500">
          {isComplete
            ? "🎉 Goal achieved!"
            : `${percentage.toFixed(0)}% complete`}
        </span>
        <span className="text-zinc-500">
          {(goal - current).toFixed(1)}L to go
        </span>
      </div>
    </div>
  );
}
