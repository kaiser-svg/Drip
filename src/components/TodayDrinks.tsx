"use client";

import { DrinkLog, DRINK_TYPES } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface TodayDrinksProps {
  logs: DrinkLog[];
  onRemove: (logId: string) => void;
}

export function TodayDrinks({ logs, onRemove }: TodayDrinksProps) {
  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-3">
      <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-center">
        Today's Drinks
      </h3>
      <div className="space-y-2">
        {logs.slice().reverse().map((log) => {
          const drinkType = DRINK_TYPES[log.type];
          const time = format(new Date(log.timestamp), 'h:mm a');
          
          return (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{drinkType.icon}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{drinkType.name}</span>
                  <span className="text-xs text-muted-foreground">{time}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {log.amount}ml
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-red-500"
                  onClick={() => onRemove(log.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
