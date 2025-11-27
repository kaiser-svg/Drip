"use client";

import { Droplets } from "lucide-react";

interface HydrationStatusProps {
  current: number;
  goal: number;
  name?: string;
}

export function HydrationStatus({ current, goal, name }: HydrationStatusProps) {
  const remaining = Math.max(0, goal - current);
  const percentage = (current / goal) * 100;
  
  let message = name ? `Hi ${name}, let's hydrate.` : "Good morning! Let's hydrate.";
  if (percentage > 0 && percentage < 30) message = "Off to a good start!";
  else if (percentage >= 30 && percentage < 60) message = "Keep it flowing!";
  else if (percentage >= 60 && percentage < 100) message = "Almost there!";
  else if (percentage >= 100) message = "Goal reached! You're amazing!";

  return (
    <div className="text-center space-y-2">
      <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full mb-2">
        <Droplets className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">{message}</h2>
      <p className="text-muted-foreground">
        <span className="font-semibold text-foreground">{current}ml</span> of {goal}ml goal
      </p>
    </div>
  );
}