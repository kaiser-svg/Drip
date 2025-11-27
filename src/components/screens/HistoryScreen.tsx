"use client";

import { useHydration } from "@/hooks/useHydration";
import { HistoryCalendar } from "@/components/HistoryCalendar";
import { Calendar, TrendingUp, Target, CheckCircle2, XCircle } from "lucide-react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { calculateEffectiveHydration } from "@/lib/hydration-quality";

export function HistoryScreen() {
  const { history, isLoaded } = useHydration();

  const recentStats = useMemo(() => {
    const days = Object.entries(history).sort(([a], [b]) => b.localeCompare(a)).slice(0, 7);
    const daysWithGoal = days.filter(([, day]) => {
      const total = calculateEffectiveHydration(day.logs);
      return total >= day.goal;
    }).length;

    return {
      recentDays: days.length,
      goalsMet: daysWithGoal,
    };
  }, [history]);

  if (!isLoaded) {
    return null;
  }

  const legendItems = [
    { color: "bg-green-500", label: "Goal met" },
    { color: "bg-blue-400", label: "75%+ progress" },
    { color: "bg-blue-200 dark:bg-blue-800", label: "Some progress" },
    { color: "bg-zinc-100 dark:bg-zinc-800", label: "No data" },
  ];

  return (
    <div className="h-full overflow-y-auto" data-scrollable>
      <div className="px-6 pt-20 pb-12 max-w-md mx-auto">
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-4 rounded-2xl border border-cyan-100 dark:border-cyan-900/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                {Object.keys(history).length}
              </div>
              <div className="text-xs text-cyan-700 dark:text-cyan-300 font-medium">Days Tracked</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-2xl border border-green-100 dark:border-green-900/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {recentStats.goalsMet}<span className="text-base font-normal text-green-600/70 dark:text-green-400/70">/{recentStats.recentDays}</span>
              </div>
              <div className="text-xs text-green-700 dark:text-green-300 font-medium">Last 7 Days Goals</div>
            </motion.div>
          </div>

          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5 dark:shadow-none"
          >
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              Activity Calendar
            </h3>
            <HistoryCalendar history={history} />
          </motion.div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5 dark:shadow-none"
          >
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-purple-500" />
              </div>
              Legend
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {legendItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center gap-2.5 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
                >
                  <div className={`w-4 h-4 rounded ${item.color}`} />
                  <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-5 rounded-2xl border border-violet-100 dark:border-violet-900/50"
          >
            <h3 className="font-semibold text-sm mb-3 text-violet-900 dark:text-violet-100 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              Recent Activity
            </h3>
            <div className="space-y-2">
              {Object.entries(history)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 5)
                .map(([date, day], index) => {
                  const total = calculateEffectiveHydration(day.logs);
                  const percentage = Math.round((total / day.goal) * 100);
                  const metGoal = total >= day.goal;
                  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  });
                  
                  return (
                    <motion.div
                      key={date}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-center justify-between p-2.5 bg-white/50 dark:bg-zinc-900/30 rounded-xl"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          metGoal 
                            ? 'bg-green-100 dark:bg-green-900/50' 
                            : 'bg-zinc-100 dark:bg-zinc-800'
                        }`}>
                          {metGoal ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-violet-900 dark:text-violet-100">{formattedDate}</p>
                          <p className="text-[10px] text-violet-600 dark:text-violet-400">{total}ml / {day.goal}ml</p>
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${
                        metGoal 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-violet-600 dark:text-violet-400'
                      }`}>
                        {percentage}%
                      </div>
                    </motion.div>
                  );
                })}
              {Object.keys(history).length === 0 && (
                <p className="text-xs text-violet-600 dark:text-violet-400 text-center py-4">
                  No history yet. Start tracking to see your progress!
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}