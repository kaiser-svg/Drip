"use client";

import { Trophy, Droplets, Calendar as CalendarIcon, Flame, Target, Zap, Award, Crown } from "lucide-react";
import { DayLog } from "@/lib/types";
import { getTotalHydration, getAchievementProgress } from "@/lib/stats-utils";
import { calculateStreak } from "@/lib/stats-utils";
import { cn } from "@/lib/utils";

interface AchievementsListProps {
  history: Record<string, DayLog>;
}

export function AchievementsList({ history }: AchievementsListProps) {
  const totalVolume = getTotalHydration(history);
  const { daysMetGoal, totalLoggedDays } = getAchievementProgress(history);
  
  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  const sortedDates = Object.keys(history).sort();
  
  sortedDates.forEach((date) => {
    const log = history[date];
    const total = log.logs.reduce((acc, curr) => acc + curr.amount, 0);
    
    if (total >= log.goal) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  });
  
  const achievements = [
    {
      id: "first-drop",
      title: "First Drop",
      description: "Log your first drink",
      icon: Droplets,
      unlocked: totalVolume > 0,
      color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
      tier: "bronze" as const,
    },
    {
      id: "goal-getter",
      title: "Goal Getter",
      description: "Reach your daily goal 3 times",
      icon: Target,
      unlocked: daysMetGoal >= 3,
      color: "text-green-500 bg-green-100 dark:bg-green-900/30",
      tier: "bronze" as const,
    },
    {
      id: "week-warrior",
      title: "Week Warrior",
      description: "Log drinks for 7 days total",
      icon: CalendarIcon,
      unlocked: totalLoggedDays >= 7,
      color: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
      tier: "bronze" as const,
    },
    {
      id: "hydration-hero",
      title: "Hydration Hero",
      description: "Reach your goal 10 times",
      icon: Trophy,
      unlocked: daysMetGoal >= 10,
      color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30",
      tier: "silver" as const,
    },
    {
      id: "streak-starter",
      title: "Streak Starter",
      description: "Maintain a 3-day streak",
      icon: Flame,
      unlocked: longestStreak >= 3,
      color: "text-orange-500 bg-orange-100 dark:bg-orange-900/30",
      tier: "silver" as const,
    },
    {
      id: "hydration-master",
      title: "Hydration Master",
      description: "Drink over 10,000ml total",
      icon: Zap,
      unlocked: totalVolume >= 10000,
      color: "text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30",
      tier: "silver" as const,
    },
    {
      id: "consistency-king",
      title: "Consistency King",
      description: "Reach your goal 30 times",
      icon: Crown,
      unlocked: daysMetGoal >= 30,
      color: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
      tier: "gold" as const,
    },
    {
      id: "streak-legend",
      title: "Streak Legend",
      description: "Maintain a 7-day streak",
      icon: Flame,
      unlocked: longestStreak >= 7,
      color: "text-red-500 bg-red-100 dark:bg-red-900/30",
      tier: "gold" as const,
    },
    {
      id: "hydration-champion",
      title: "Hydration Champion",
      description: "Drink over 50,000ml total",
      icon: Award,
      unlocked: totalVolume >= 50000,
      color: "text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30",
      tier: "gold" as const,
    },
    {
      id: "dedication-master",
      title: "Dedication Master",
      description: "Log for 30 days total",
      icon: CalendarIcon,
      unlocked: totalLoggedDays >= 30,
      color: "text-pink-500 bg-pink-100 dark:bg-pink-900/30",
      tier: "gold" as const,
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="p-4 space-y-3">
      {/* Achievements Grid */}
      {achievements.map((achievement) => (
        <div 
          key={achievement.id} 
          className={cn(
            "flex items-center gap-4 p-4 rounded-xl border transition-all",
            achievement.unlocked 
              ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm" 
              : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800/50 opacity-60"
          )}
        >
          <div className={cn(
            "p-3 rounded-full transition-all",
            achievement.unlocked ? achievement.color : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
          )}>
            <achievement.icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className={cn(
              "font-semibold flex items-center gap-2", 
              achievement.unlocked ? "text-foreground" : "text-muted-foreground"
            )}>
              {achievement.title}
              {achievement.unlocked && (
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                  achievement.tier === "gold" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                  achievement.tier === "silver" && "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
                  achievement.tier === "bronze" && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                )}>
                  {achievement.tier}
                </span>
              )}
            </h4>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
          </div>
          {achievement.unlocked && (
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>
      ))}

      {/* Stats Summary */}
      {unlockedCount > 0 && (
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-xl border border-zinc-100 dark:border-zinc-800 mt-4">
          <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-3">Your Stats</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Total Volume</div>
              <div className="font-bold text-lg">{totalVolume.toLocaleString()}ml</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Days Logged</div>
              <div className="font-bold text-lg">{totalLoggedDays}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Goals Met</div>
              <div className="font-bold text-lg">{daysMetGoal}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Longest Streak</div>
              <div className="font-bold text-lg">{longestStreak} days</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}