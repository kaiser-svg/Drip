"use client";

import { useHydration } from "@/hooks/useHydration";
import { WeeklyChart } from "@/components/WeeklyChart";
import { HistoryCalendar } from "@/components/HistoryCalendar";
import { AchievementsList } from "@/components/AchievementsList";
import { Button } from "@/components/ui/button";
import { ChevronLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";
import { DRINK_TYPES } from "@/lib/types";
import { HydrationTimeline } from "@/components/HydrationTimeline";
import { QualityScore } from "@/components/QualityScore";
import { calculateHydrationQuality, calculateEffectiveHydration } from "@/lib/hydration-quality";

export default function HistoryPage() {
  const { history, isLoaded, goal, logs, settings } = useHydration();

  // Calculate today's quality score
  const todayQuality = useMemo(() => {
    return calculateHydrationQuality(logs, goal, settings.bedtimeHour);
  }, [logs, goal, settings.bedtimeHour]);

  // Calculate comprehensive stats
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
    
    // Last 7 days average
    const last7Days = days.slice(-7);
    const last7DaysTotal = last7Days.reduce((acc, day) => {
      return acc + calculateEffectiveHydration(day.logs);
    }, 0);
    const avgLast7Days = last7Days.length > 0 ? Math.round(last7DaysTotal / last7Days.length) : 0;
    
    // Trend calculation
    const previous7Days = days.slice(-14, -7);
    const previous7DaysTotal = previous7Days.reduce((acc, day) => {
      return acc + calculateEffectiveHydration(day.logs);
    }, 0);
    const avgPrevious7Days = previous7Days.length > 0 ? previous7DaysTotal / previous7Days.length : 0;
    
    let trend: "up" | "down" | "stable" = "stable";
    if (avgLast7Days > avgPrevious7Days * 1.1) trend = "up";
    else if (avgLast7Days < avgPrevious7Days * 0.9) trend = "down";
    
    // Most logged drink type
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="p-4 sticky top-0 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="-ml-2 rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Your Progress</h1>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto pb-20">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Stats</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="calendar">History</TabsTrigger>
            <TabsTrigger value="achievements">Awards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <WeeklyChart history={history} />
            
            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm">
                 <div className="text-muted-foreground text-sm font-medium mb-1">Total Logged</div>
                 <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                   {stats.totalDrinks}
                   <span className="text-sm text-muted-foreground font-normal ml-1">drinks</span>
                 </div>
               </div>
               <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm">
                 <div className="text-muted-foreground text-sm font-medium mb-1">Goals Met</div>
                 <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                   {stats.daysWithGoalMet}
                   <span className="text-sm text-muted-foreground font-normal ml-1">days</span>
                 </div>
               </div>
               <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm">
                 <div className="text-muted-foreground text-sm font-medium mb-1">Success Rate</div>
                 <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                   {stats.goalSuccessRate}
                   <span className="text-sm text-muted-foreground font-normal ml-1">%</span>
                 </div>
               </div>
               <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm">
                 <div className="text-muted-foreground text-sm font-medium mb-1">Total Days</div>
                 <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                   {stats.totalDays}
                   <span className="text-sm text-muted-foreground font-normal ml-1">days</span>
                 </div>
               </div>
            </div>

            {/* Average & Trends */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-sm space-y-4">
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-2">Daily Average (All Time)</div>
                <div className="text-3xl font-bold">
                  {stats.avgDaily}
                  <span className="text-lg text-muted-foreground font-normal ml-1">ml</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-2 border-t border-blue-200/50 dark:border-blue-800/50">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground font-medium mb-1">Last 7 Days Avg</div>
                  <div className="text-xl font-bold">
                    {stats.avgLast7Days}
                    <span className="text-sm text-muted-foreground font-normal ml-1">ml</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stats.trend === "up" && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-semibold">Improving</span>
                    </div>
                  )}
                  {stats.trend === "down" && (
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-full">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-xs font-semibold">Declining</span>
                    </div>
                  )}
                  {stats.trend === "stable" && (
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                      <Minus className="w-4 h-4" />
                      <span className="text-xs font-semibold">Steady</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border shadow-sm space-y-3">
              <h3 className="font-semibold text-base">Quick Insights</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 dark:text-blue-400 mt-0.5">💧</span>
                  <p className="text-muted-foreground">
                    You've logged <span className="font-semibold text-foreground">{stats.totalHydration.toLocaleString()}ml</span> in total hydration
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">{DRINK_TYPES[stats.mostLoggedType as keyof typeof DRINK_TYPES]?.icon || '💧'}</span>
                  <p className="text-muted-foreground">
                    Your favorite drink is <span className="font-semibold text-foreground">{DRINK_TYPES[stats.mostLoggedType as keyof typeof DRINK_TYPES]?.name || 'Water'}</span>
                  </p>
                </div>
                {stats.avgDaily < goal && (
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">💪</span>
                    <p className="text-muted-foreground">
                      Try to increase your daily intake to reach your {goal}ml goal consistently!
                    </p>
                  </div>
                )}
                {stats.goalSuccessRate >= 80 && (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">🎉</span>
                    <p className="text-muted-foreground">
                      Amazing! You're hitting your goal <span className="font-semibold text-foreground">{stats.goalSuccessRate}%</span> of the time!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            {/* Hydration Quality Score */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border shadow-sm">
              <QualityScore quality={todayQuality} />
            </div>

            {/* 24-Hour Timeline */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border shadow-sm">
              <HydrationTimeline logs={logs} dailyGoal={goal} />
            </div>

            {/* Quality Explanation */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-5 rounded-xl border border-purple-100 dark:border-purple-900/50">
              <h3 className="font-semibold text-base mb-3">Understanding Quality Scores</h3>
              <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <div className="flex gap-2">
                  <span className="font-medium">Distribution:</span>
                  <span>How well your hydration is spread across morning, afternoon, and evening</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium">Spacing:</span>
                  <span>Time between drinks (ideal: 1-2 hours during waking hours)</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium">Timing:</span>
                  <span>Avoiding late-night hydration that disrupts sleep</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="calendar">
            <HistoryCalendar history={history} />
          </TabsContent>
          
          <TabsContent value="achievements">
            <AchievementsList history={history} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}