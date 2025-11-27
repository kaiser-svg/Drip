"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Flame, Target, Zap, Award, X } from "lucide-react";
import confetti from "canvas-confetti";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "trophy" | "star" | "flame" | "target" | "zap" | "award";
  color: "gold" | "silver" | "bronze" | "blue" | "green" | "purple";
  rarity?: "common" | "rare" | "epic" | "legendary";
}

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
  target: Target,
  zap: Zap,
  award: Award,
};

const colorMap = {
  gold: {
    bg: "from-amber-400 to-yellow-500",
    glow: "shadow-amber-500/50",
    text: "text-amber-900",
    border: "border-amber-300",
  },
  silver: {
    bg: "from-zinc-300 to-zinc-400",
    glow: "shadow-zinc-400/50",
    text: "text-zinc-800",
    border: "border-zinc-200",
  },
  bronze: {
    bg: "from-orange-400 to-amber-600",
    glow: "shadow-orange-500/50",
    text: "text-orange-900",
    border: "border-orange-300",
  },
  blue: {
    bg: "from-blue-400 to-cyan-500",
    glow: "shadow-blue-500/50",
    text: "text-blue-900",
    border: "border-blue-300",
  },
  green: {
    bg: "from-emerald-400 to-green-500",
    glow: "shadow-emerald-500/50",
    text: "text-emerald-900",
    border: "border-emerald-300",
  },
  purple: {
    bg: "from-purple-400 to-violet-500",
    glow: "shadow-purple-500/50",
    text: "text-purple-900",
    border: "border-purple-300",
  },
};

const rarityLabels = {
  common: { label: "Common", class: "text-zinc-600 bg-zinc-100" },
  rare: { label: "Rare", class: "text-blue-600 bg-blue-100" },
  epic: { label: "Epic", class: "text-purple-600 bg-purple-100" },
  legendary: { label: "Legendary", class: "text-amber-600 bg-amber-100" },
};

export function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      
      // Trigger confetti
      const duration = 2000;
      const end = Date.now() + duration;

      const colors = achievement.color === "gold" 
        ? ["#fbbf24", "#f59e0b", "#fcd34d"]
        : achievement.color === "purple"
        ? ["#a855f7", "#8b5cf6", "#c084fc"]
        : ["#3b82f6", "#06b6d4", "#60a5fa"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      // Vibrate on mobile
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const Icon = iconMap[achievement.icon];
  const colors = colorMap[achievement.color];
  const rarity = achievement.rarity ? rarityLabels[achievement.rarity] : null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="relative z-10 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              {/* Header with gradient */}
              <div className={`relative h-40 bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                {/* Animated rings */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute w-32 h-32 rounded-full border-4 border-white/30"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  className="absolute w-40 h-40 rounded-full border-4 border-white/20"
                />
                
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.2 }}
                  className={`relative z-10 h-20 w-20 rounded-full bg-white shadow-xl ${colors.glow} shadow-lg flex items-center justify-center`}
                >
                  <Icon className={`w-10 h-10 ${colors.text}`} />
                </motion.div>

                {/* Sparkles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: [0, (Math.random() - 0.5) * 100],
                      y: [0, (Math.random() - 0.5) * 100],
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: i * 0.2,
                      repeatDelay: 0.5
                    }}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{
                      left: `${30 + Math.random() * 40}%`,
                      top: `${30 + Math.random() * 40}%`,
                    }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                    🎉 Achievement Unlocked!
                  </p>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    {achievement.title}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    {achievement.description}
                  </p>
                  
                  {rarity && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${rarity.class}`}>
                      {rarity.label}
                    </span>
                  )}
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleClose}
                  className={`mt-6 w-full py-3 rounded-2xl bg-gradient-to-r ${colors.bg} text-white font-semibold shadow-lg ${colors.glow} hover:shadow-xl transition-shadow active:scale-95`}
                >
                  Awesome!
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage achievement popups
export function useAchievementPopup() {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [queue, setQueue] = useState<Achievement[]>([]);

  const showAchievement = (achievement: Achievement) => {
    if (currentAchievement) {
      setQueue(prev => [...prev, achievement]);
    } else {
      setCurrentAchievement(achievement);
    }
  };

  const handleClose = () => {
    setCurrentAchievement(null);
    // Show next in queue after a short delay
    setTimeout(() => {
      if (queue.length > 0) {
        setCurrentAchievement(queue[0]);
        setQueue(prev => prev.slice(1));
      }
    }, 500);
  };

  return {
    currentAchievement,
    showAchievement,
    handleClose,
    AchievementPopupComponent: (
      <AchievementPopup achievement={currentAchievement} onClose={handleClose} />
    ),
  };
}
