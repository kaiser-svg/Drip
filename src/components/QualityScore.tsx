"use client";

import { HydrationQuality } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface QualityScoreProps {
  quality: HydrationQuality;
}

const GRADE_COLORS = {
  A: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-500/50",
  B: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-500/50",
  C: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-500/50",
  D: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-500/50",
  F: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-500/50",
};

export function QualityScore({ quality }: QualityScoreProps) {
  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="text-center">
        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Hydration Quality
        </div>
        <div
          className={cn(
            "inline-flex items-center justify-center w-20 h-20 rounded-2xl border-4 font-bold text-4xl transition-all",
            GRADE_COLORS[quality.overall]
          )}
        >
          {quality.overall}
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="grid grid-cols-3 gap-3">
        <ScoreCard
          label="Distribution"
          grade={quality.distribution}
          description="Spread across day"
        />
        <ScoreCard
          label="Spacing"
          grade={quality.spacing}
          description="Time between drinks"
        />
        <ScoreCard
          label="Timing"
          grade={quality.timing}
          description="Bedtime habits"
        />
      </div>

      {/* Insights */}
      {quality.insights.length > 0 && (
        <div className="space-y-2">
          {quality.insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 text-sm text-zinc-700 dark:text-zinc-300"
            >
              <span className="shrink-0">{insight.split(" ")[0]}</span>
              <span className="flex-1">{insight.split(" ").slice(1).join(" ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreCard({
  label,
  grade,
  description,
}: {
  label: string;
  grade: "A" | "B" | "C" | "D" | "F";
  description: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
        GRADE_COLORS[grade]
      )}
    >
      <div className="text-2xl font-bold mb-1">{grade}</div>
      <div className="text-xs font-medium text-center leading-tight">
        {label}
      </div>
      <div className="text-[10px] text-center opacity-70 mt-0.5">
        {description}
      </div>
    </div>
  );
}
