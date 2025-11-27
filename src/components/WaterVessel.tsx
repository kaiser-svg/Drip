"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface WaterVesselProps {
  current: number;
  goal: number;
  className?: string;
}

export function WaterVessel({ current, goal, className }: WaterVesselProps) {
  const percentage = Math.min(100, Math.max(0, (current / goal) * 100));
  const [waveOffset, setWaveOffset] = useState(0);

  // Continuous wave animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveOffset((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)}>
      {/* Bottle/Vessel Container */}
      <div className="relative h-80 w-48 overflow-hidden rounded-[3rem] border-4 border-white/20 bg-white/5 backdrop-blur-sm shadow-xl ring-1 ring-white/10 dark:border-white/10 dark:bg-zinc-900/50">
        
        {/* Water Level */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden transition-all duration-1000 ease-out"
             style={{ height: `${percentage}%` }}>
          
          {/* Wave SVG Animation */}
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{ 
              repeat: Infinity, 
              ease: "linear", 
              duration: 5 
            }}
            className="absolute -top-4 left-0 h-8 w-[200%] bg-blue-500/80 dark:bg-blue-600/80"
            style={{ 
              borderRadius: "40%",
              opacity: 0.8
            }}
          />
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              repeat: Infinity, 
              ease: "linear", 
              duration: 7 
            }}
            className="absolute -top-4 left-0 h-8 w-[200%] bg-cyan-400/60 dark:bg-cyan-500/60"
            style={{ 
              borderRadius: "45%",
              opacity: 0.6
            }}
          />
          
          {/* Water Body */}
          <div className="h-full w-full bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800" />
        </div>

        {/* Glass Highlights/Reflections */}
        <div className="pointer-events-none absolute inset-0 rounded-[2.8rem] ring-1 ring-inset ring-white/20" />
        <div className="pointer-events-none absolute left-4 top-4 h-24 w-2 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
        <div className="pointer-events-none absolute right-4 bottom-4 h-16 w-2 rounded-full bg-gradient-to-t from-white/10 to-transparent" />
        
        {/* Percentage Text inside vessel (visible when full enough or always floating) */}
        <div className="absolute inset-0 flex items-center justify-center">
           <span className={cn(
             "text-4xl font-bold tabular-nums tracking-tighter transition-colors duration-500",
             percentage > 50 ? "text-white drop-shadow-md" : "text-zinc-800 dark:text-zinc-100"
           )}>
             {Math.round(percentage)}%
           </span>
        </div>
      </div>
      
      {/* Lid/Cap visualization */}
      <div className="absolute -top-6 h-6 w-20 rounded-t-lg bg-zinc-200 dark:bg-zinc-800 border-x border-t border-white/20 shadow-sm" />
    </div>
  );
}
