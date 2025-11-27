"use client";

import { Plus, Coffee, Droplets, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrinkType } from "@/lib/types";

interface QuickLogProps {
  onLog: (amount: number, type: DrinkType) => void;
  customButton?: React.ReactNode;
}

const PRESETS = [
  { amount: 150, label: "Coffee", icon: Coffee, type: "coffee" as DrinkType },
  { amount: 250, label: "Glass", icon: Droplets, type: "water" as DrinkType },
  { amount: 500, label: "Bottle", icon: Wine, type: "water" as DrinkType },
];

export function QuickLog({ onLog, customButton }: QuickLogProps) {
  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-md">
      {PRESETS.map((preset) => {
        const IconComponent = preset.icon;
        return (
          <Button
            key={preset.amount + preset.type}
            variant="outline"
            className="flex h-20 flex-col gap-1.5 rounded-2xl border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all active:scale-95 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm"
            onClick={() => onLog(preset.amount, preset.type)}
          >
            <IconComponent className="w-5 h-5 text-blue-500" />
            <div className="flex flex-col items-center leading-none">
              <span className="font-semibold text-xs">{preset.label}</span>
              <span className="text-[10px] text-muted-foreground">{preset.amount}ml</span>
            </div>
          </Button>
        );
      })}
      
      {/* Custom Drink Button */}
      {customButton || (
        <Button
          variant="outline"
          className="flex h-20 flex-col gap-1.5 rounded-2xl border-2 border-dashed border-blue-400 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all active:scale-95 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm"
        >
          <Plus className="w-5 h-5 text-blue-500" />
          <div className="flex flex-col items-center leading-none">
            <span className="font-semibold text-xs">Custom</span>
          </div>
        </Button>
      )}
    </div>
  );
}