"use client";

import { useHydration } from "@/hooks/useHydration";
import { AchievementsList } from "@/components/AchievementsList";
import { Star, Trophy, Flame, Target, Calendar } from "lucide-react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { calculateStreak, getTotalHydration, getAchievementProgress } from "@/lib/stats-utils";

export function AchievementsScreen() {
  const { history, isLoaded } = useHydration();

  const achievementStats = useMemo(() => {
    const currentStreak = calculateStreak(history);
    const totalVolume = getTotalHydration(history);
    const { daysMetGoal, totalLoggedDays } = getAchievementProgress(history);
    
    // Calculate longest streak (same logic as AchievementsList)
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

    // Count unlocked achievements (matching AchievementsList exactly)
    let unlocked = 0;
    if (totalVolume > 0) unlocked++; // first-drop
    if (daysMetGoal >= 3) unlocked++; // goal-getter
    if (totalLoggedDays >= 7) unlocked++; // week-warrior
    if (daysMetGoal >= 10) unlocked++; // hydration-hero
    if (longestStreak >= 3) unlocked++; // streak-starter
    if (totalVolume >= 10000) unlocked++; // hydration-master
    if (daysMetGoal >= 30) unlocked++; // consistency-king
    if (longestStreak >= 7) unlocked++; // streak-legend
    if (totalVolume >= 50000) unlocked++; // hydration-champion
    if (totalLoggedDays >= 30) unlocked++; // dedication-master

    return {
      streak: currentStreak,
      perfectDays: daysMetGoal,
      totalDays: totalLoggedDays,
      unlocked,
      total: 10, // Matches the 10 achievements in AchievementsList
    };
  }, [history]);

  if (!isLoaded) {
    return null;
  }

  const statItems = [
    { label: "Day Streak", value: achievementStats.streak, icon: Flame, color: "orange" },
    { label: "Goals Met", value: achievementStats.perfectDays, icon: Target, color: "green" },
    { label: "Total Days", value: achievementStats.totalDays, icon: Calendar, color: "blue" },
  ];

  const colorClasses: Record<string, { bg: string; iconBg: string; text: string; border: string }> = {
    orange: { 
      bg: "bg-orange-50 dark:bg-orange-950/30", 
      iconBg: "bg-orange-100 dark:bg-orange-900/50",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-100 dark:border-orange-900/50"
    },
    green: { 
      bg: "bg-green-50 dark:bg-green-950/30", 
      iconBg: "bg-green-100 dark:bg-green-900/50",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-100 dark:border-green-900/50"
    },
    blue: { 
      bg: "bg-blue-50 dark:bg-blue-950/30", 
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-100 dark:border-blue-900/50"
    },
  };

  const progressPercentage = (achievementStats.unlocked / achievementStats.total) * 100;

  return (
    <div className="h-full overflow-y-auto" data-scrollable>
      <div className="px-6 pt-20 pb-12 max-w-md mx-auto">
        <div className="space-y-4">
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <span className="font-semibold text-amber-900 dark:text-amber-100">Achievement Progress</span>
                  <p className="text-xs text-amber-700 dark:text-amber-300">Keep going to unlock more!</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {achievementStats.unlocked}
                </span>
                <span className="text-sm text-amber-600/70 dark:text-amber-400/70">/{achievementStats.total}</span>
              </div>
            </div>
            
            <div className="h-3 bg-amber-100 dark:bg-amber-900/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              {statItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`text-center p-3 rounded-xl ${colorClasses[item.color].bg} border ${colorClasses[item.color].border}`}
                >
                  <div className={`h-8 w-8 rounded-lg ${colorClasses[item.color].iconBg} flex items-center justify-center mx-auto mb-2`}>
                    <item.icon className={`w-4 h-4 ${colorClasses[item.color].text}`} />
                  </div>
                  <div className={`text-lg font-bold ${colorClasses[item.color].text}`}>{item.value}</div>
                  <div className="text-[10px] text-muted-foreground font-medium">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Achievements List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5 dark:shadow-none overflow-hidden"
          >
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Star className="w-4 h-4 text-purple-500" />
                </div>
                All Achievements
              </h3>
            </div>
            <AchievementsList history={history} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}