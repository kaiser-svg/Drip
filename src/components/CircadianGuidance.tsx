"use client";

import { getCircadianGuidance } from "@/lib/hydration-quality";
import { useEffect, useState } from "react";
import { Clock, Sunrise, Sun, Utensils, CloudSun, Sunset, Moon, BedDouble } from "lucide-react";

const PERIOD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Early Morning': Sunrise,
  'Morning': Sun,
  'Lunch Time': Utensils,
  'Afternoon': CloudSun,
  'Evening': Sunset,
  'Pre-Bedtime': Moon,
  'Night': BedDouble,
};

export function CircadianGuidance() {
  const [guidance, setGuidance] = useState(getCircadianGuidance());

  // Update guidance every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setGuidance(getCircadianGuidance());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const IconComponent = PERIOD_ICONS[guidance.period] || Sun;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/40 dark:to-cyan-950/40 p-3 backdrop-blur-sm">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {guidance.period}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-blue-500/70 dark:text-blue-400/70">
              <Clock className="w-2.5 h-2.5" />
              <span>Circadian Guidance</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {guidance.recommendation}
        </p>
      </div>
    </div>
  );
}