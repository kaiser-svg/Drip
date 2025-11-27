"use client";

import { useHydration } from "@/hooks/useHydration";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { HydrationTimeline } from "@/components/HydrationTimeline";
import { QualityScore } from "@/components/QualityScore";
import { calculateHydrationQuality } from "@/lib/hydration-quality";
import { Clock, Droplets, Moon, Gauge, Timer, Calendar } from "lucide-react";

export function QualityScreen() {
  const { goal, logs, settings, isLoaded } = useHydration();

  const todayQuality = useMemo(() => {
    return calculateHydrationQuality(logs, goal, settings.bedtimeHour);
  }, [logs, goal, settings.bedtimeHour]);

  if (!isLoaded) {
    return null;
  }

  const qualityFactors = [
    {
      icon: Droplets,
      title: "Distribution",
      description: "Spread drinks evenly across the day",
      color: "green",
    },
    {
      icon: Timer,
      title: "Spacing",
      description: "1-2 hours between drinks is ideal",
      color: "blue",
    },
    {
      icon: Moon,
      title: "Timing",
      description: "Avoid drinking too close to bedtime",
      color: "purple",
    },
  ];

  const scoreBreakdown = [
    { label: "Distribution", score: todayQuality.distributionScore, gradient: "from-green-400 to-emerald-500" },
    { label: "Spacing", score: todayQuality.spacingScore, gradient: "from-blue-400 to-cyan-500" },
    { label: "Timing", score: todayQuality.timingScore, gradient: "from-purple-400 to-pink-500" },
  ];

  return (
    <div className="h-full overflow-y-auto" data-scrollable>
      <div className="px-6 pt-20 pb-12 max-w-md mx-auto">
        <div className="space-y-4">
          {/* Quality Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5 dark:shadow-none"
          >
            <QualityScore quality={todayQuality} />
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5 dark:shadow-none"
          >
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              Today's Timeline
            </h3>
            <HydrationTimeline logs={logs} dailyGoal={goal} />
          </motion.div>

          {/* Quality Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50"
          >
            <h3 className="font-semibold text-sm mb-4 text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Gauge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Quality Factors
            </h3>
            <div className="space-y-3">
              {qualityFactors.map((factor, index) => (
                <motion.div
                  key={factor.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-white/50 dark:bg-zinc-900/30 rounded-xl"
                >
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                    <factor.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">{factor.title}</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">{factor.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Current Scores Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5 dark:shadow-none"
          >
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-violet-500" />
              </div>
              Score Breakdown
            </h3>
            <div className="space-y-4">
              {scoreBreakdown.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-bold">{item.score}%</span>
                  </div>
                  <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      className={`h-full bg-gradient-to-r ${item.gradient} rounded-full`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}