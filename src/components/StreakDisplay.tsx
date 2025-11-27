"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  streak: number;
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  if (streak === 0) return null;

  return (
    <div className={cn(
      "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold transition-all animate-in fade-in slide-in-from-top-2",
      streak > 3 ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
    )}>
      <Flame className={cn("w-4 h-4", streak > 3 && "fill-orange-600 dark:fill-orange-400 animate-pulse")} />
      <span>{streak} day streak!</span>
    </div>
  );
}
