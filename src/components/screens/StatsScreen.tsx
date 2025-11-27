"use client";

import { useHydration } from "@/hooks/useHydration";
import { WeeklyChart } from "@/components/WeeklyChart";
import { TrendingUp, TrendingDown, Minus, Droplets, Award, Target, Calendar, BarChart3 } from "lucide-react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { DRINK_TYPES } from "@/lib/types";
import { calculateEffectiveHydration } from "@/lib/hydration-quality";

export function StatsScreen() {
  const { history, isLoaded } = useHydration();

  const stats = useMemo(() => {
    const days = Object.values(history);
    const totalDrinks = days.reduce((acc, day) => acc + day.logs.length, 0);
    
    const daysWithGoalMet = days.filter(day => {
      const total = calculateEffectiveHydration(day.logs);
      return total >= day.goal;
    }).length;
    
    const totalHydration = days.reduce((acc, day) => {
      return acc + calculateEffectiveHydration(day.logs);
    }, 0);
    
    const avgDaily = days.length > 0 ? Math.round(totalHydration / days.length) : 0;
    
    const last7Days = days.slice(-7);
    const last7DaysTotal = last7Days.reduce((acc, day) => {
      return acc + calculateEffectiveHydration(day.logs);
    }, 0);
    const avgLast7Days = last7Days.length > 0 ? Math.round(last7DaysTotal / last7Days.length) : 0;
    
    const previous7Days = days.slice(-14, -7);
    const previous7DaysTotal = previous7Days.reduce((acc, day) => {
      return acc + calculateEffectiveHydration(day.logs);
    }, 0);
    const avgPrevious7Days = previous7Days.length > 0 ? previous7DaysTotal / previous7Days.length : 0;
    
    let trend: "up" | "down" | "stable" = "stable";
    if (avgLast7Days > avgPrevious7Days * 1.1) trend = "up";
    else if (avgLast7Days < avgPrevious7Days * 0.9) trend = "down";
    
    const drinkCounts: Record<string, number> = {};
    days.forEach(day => {
      day.logs.forEach(log => {
        drinkCounts[log.type] = (drinkCounts[log.type] || 0) + 1;
      });
    });
    const mostLoggedType = Object.entries(drinkCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'water';
    
    return {
      totalDrinks,
      daysWithGoalMet,
      totalDays: days.length,
      totalHydration: Math.round(totalHydration),
      avgDaily,
      avgLast7Days,
      trend,
      mostLoggedType,
      goalSuccessRate: days.length > 0 ? Math.round((daysWithGoalMet / days.length) * 100) : 0,
    };
  }, [history]);

  if (!isLoaded) {
    return null;
  }

  const statCards = [
    { label: "Total Logged", value: stats.totalDrinks, unit: "drinks", color: "blue", icon: Droplets },
    { label: "Goals Met", value: stats.daysWithGoalMet, unit: "days", color: "green", icon: Target },
    { label: "Success Rate", value: stats.goalSuccessRate, unit: "%", color: "purple", icon: Award },
    { label: "Total Days", value: stats.totalDays, unit: "days", color: "orange", icon: Calendar },
  ];

  const colorClasses: Record<string, { text: string; bg: string }> = {
    blue: { text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    green: { text: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
    purple: { text: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
    orange: { text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  };

  return (
    <div className="h-full overflow-y-auto" data-scrollable>
      <div className="px-6 pt-20 pb-12 max-w-md mx-auto">
        <div className="space-y-4">
          {/* Weekly Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <WeeklyChart history={history} />
          </motion.div>
          
          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5 dark:shadow-none"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-7 w-7 rounded-lg ${colorClasses[stat.color].bg} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${colorClasses[stat.color].text}`} />
                  </div>
                  <div className="text-muted-foreground text-xs font-medium">{stat.label}</div>
                </div>
                <div className={`text-2xl font-bold ${colorClasses[stat.color].text}`}>
                  {stat.value}
                  <span className="text-xs text-muted-foreground font-normal ml-1">{stat.unit}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Average & Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-5 rounded-2xl border border-violet-100 dark:border-violet-900/50 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <div className="text-xs text-violet-600 dark:text-violet-400 font-medium">Daily Average</div>
                <div className="text-2xl font-bold text-violet-900 dark:text-violet-100">
                  {stats.avgDaily}
                  <span className="text-sm text-violet-600/70 dark:text-violet-400/70 font-normal ml-1">ml</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-3 border-t border-violet-200/50 dark:border-violet-800/50">
              <div className="flex-1">
                <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-0.5">Last 7 Days</div>
                <div className="text-lg font-bold text-violet-900 dark:text-violet-100">
                  {stats.avgLast7Days}
                  <span className="text-xs text-violet-600/70 dark:text-violet-400/70 font-normal ml-1">ml/day</span>
                </div>
              </div>
              <div>
                {stats.trend === "up" && (
                  <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-semibold">Improving</span>
                  </div>
                )}
                {stats.trend === "down" && (
                  <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-full">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-xs font-semibold">Declining</span>
                  </div>
                )}
                {stats.trend === "stable" && (
                  <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-3 py-1.5 rounded-full">
                    <Minus className="w-4 h-4" />
                    <span className="text-xs font-semibold">Steady</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5 dark:shadow-none"
          >
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
              </div>
              Insights
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Hydration</p>
                  <p className="text-sm font-semibold">{stats.totalHydration.toLocaleString()}ml</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="h-8 w-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                  <Award className="w-4 h-4 text-cyan-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Favorite Drink</p>
                  <p className="text-sm font-semibold">{DRINK_TYPES[stats.mostLoggedType as keyof typeof DRINK_TYPES]?.name || 'Water'}</p>
                </div>
              </div>
              {stats.goalSuccessRate >= 80 && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/50">
                  <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <Target className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400">Great consistency!</p>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">Hitting goal {stats.goalSuccessRate}% of the time</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}