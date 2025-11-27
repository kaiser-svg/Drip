"use client";

import { HydrationWarning } from "@/lib/types";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HydrationWarningsProps {
  warnings: HydrationWarning[];
}

export function HydrationWarnings({ warnings }: HydrationWarningsProps) {
  if (warnings.length === 0) return null;

  const getSeverityIcon = (severity: HydrationWarning["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-5 h-5 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 shrink-0" />;
      case "info":
        return <Info className="w-5 h-5 shrink-0" />;
    }
  };

  const getSeverityColor = (severity: HydrationWarning["severity"]) => {
    switch (severity) {
      case "critical":
        return "border-red-500/50 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400";
      case "warning":
        return "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400";
      case "info":
        return "border-blue-500/50 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400";
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Smart Alerts
      </h3>
      <div className="space-y-2">
        {warnings.map((warning, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border-2 transition-all",
              getSeverityColor(warning.severity)
            )}
          >
            {getSeverityIcon(warning.severity)}
            <p className="text-sm leading-relaxed flex-1">{warning.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
