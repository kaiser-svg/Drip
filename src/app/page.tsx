"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { WaterVessel } from "@/components/WaterVessel";
import { QuickLog } from "@/components/QuickLog";
import { HydrationStatus } from "@/components/HydrationStatus";
import { Button } from "@/components/ui/button";
import { Plus, Droplets, Flame } from "lucide-react";
import { useHydration } from "@/hooks/useHydration";
import { useNotifications } from "@/hooks/useNotifications";
import { AddDrinkDrawer } from "@/components/AddDrinkDrawer";
import { TodayDrinks } from "@/components/TodayDrinks";
import { calculateStreak } from "@/lib/stats-utils";
import { Onboarding } from "@/components/Onboarding";
import { CircadianGuidance } from "@/components/CircadianGuidance";
import { CaffeineTracker } from "@/components/CaffeineTracker";
import { HydrationWarnings } from "@/components/HydrationWarnings";
import { calculateHydrationQuality } from "@/lib/hydration-quality";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { StatsScreen } from "@/components/screens/StatsScreen";
import { QualityScreen } from "@/components/screens/QualityScreen";
import { HistoryScreen } from "@/components/screens/HistoryScreen";
import { AchievementsScreen } from "@/components/screens/AchievementsScreen";
import { OverviewMap, type GridLayout } from "@/components/screens/OverviewMap";
import { AchievementPopup, useAchievementPopup, type Achievement } from "@/components/AchievementPopup";
import { useNotificationBanner } from "@/components/NotificationBanner";
import { AnimatePresence, motion, PanInfo } from "framer-motion";

type ScreenType = "bottle" | "details" | "settings" | "stats" | "quality" | "history" | "achievements";

const STORAGE_KEY = "drip-grid-layout";
const ACHIEVEMENT_STORAGE_KEY = "drip-unlocked-achievements";

// Default layout matching OverviewMap
const DEFAULT_LAYOUT: GridLayout = {
  stats: { row: 0, col: 1 },
  history: { row: 1, col: 0 },
  bottle: { row: 1, col: 1 },
  settings: { row: 1, col: 2 },
  details: { row: 2, col: 0 },
  quality: { row: 2, col: 1 },
  achievements: { row: 2, col: 2 },
};

const getScreenFromPosition = (layout: GridLayout, row: number, col: number): ScreenType | null => {
  for (const [screen, pos] of Object.entries(layout)) {
    if (pos.row === row && pos.col === col) return screen as ScreenType;
  }
  return null;
};

// Edge swipe zone component
const SwipeZone = ({ 
  position, 
  onSwipe 
}: { 
  position: "left" | "right" | "top" | "bottom";
  onSwipe: (direction: "left" | "right" | "up" | "down") => void;
}) => {
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const threshold = 30;
    const velocityThreshold = 100;
    
    if (position === "left" || position === "right") {
      if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > velocityThreshold) {
        if (offset.x > 0) {
          onSwipe("left");
        } else {
          onSwipe("right");
        }
      }
    } else {
      if (Math.abs(offset.y) > threshold || Math.abs(velocity.y) > velocityThreshold) {
        if (offset.y > 0) {
          onSwipe("up");
        } else {
          onSwipe("down");
        }
      }
    }
  };

  const positionStyles: Record<string, string> = {
    left: "left-0 top-20 bottom-20 w-12",
    right: "right-0 top-20 bottom-20 w-12",
    top: "top-16 left-12 right-12 h-16",
    bottom: "bottom-0 left-12 right-12 h-20",
  };

  return (
    <motion.div
      className={`fixed z-10 ${positionStyles[position]}`}
      drag={position === "left" || position === "right" ? "x" : "y"}
      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      style={{ touchAction: "none" }}
    />
  );
};

// Achievement definitions
const ACHIEVEMENTS: Record<string, Achievement> = {
  first_drink: {
    id: "first_drink",
    title: "First Sip",
    description: "Log your first drink. Your hydration journey begins!",
    icon: "star",
    color: "blue",
    rarity: "common",
  },
  goal_reached: {
    id: "goal_reached",
    title: "Goal Crusher",
    description: "You reached your daily hydration goal!",
    icon: "trophy",
    color: "gold",
    rarity: "common",
  },
  streak_3: {
    id: "streak_3",
    title: "Consistency King",
    description: "Maintained a 3-day hydration streak!",
    icon: "flame",
    color: "bronze",
    rarity: "rare",
  },
  streak_7: {
    id: "streak_7",
    title: "Week Warrior",
    description: "A full week of meeting your goals!",
    icon: "flame",
    color: "gold",
    rarity: "epic",
  },
  early_bird: {
    id: "early_bird",
    title: "Early Bird",
    description: "Logged water before 8 AM. Great start!",
    icon: "zap",
    color: "purple",
    rarity: "rare",
  },
  hydration_master: {
    id: "hydration_master",
    title: "Hydration Master",
    description: "Exceeded your goal by 50%!",
    icon: "award",
    color: "purple",
    rarity: "legendary",
  },
};

export default function Home() {
  const { hydration, goal, addDrink, isLoaded, settings, history, logs, removeDrink } = useHydration();
  useNotifications();
  const { showNotification } = useNotificationBanner();
  const { currentAchievement, showAchievement, handleClose: handleAchievementClose } = useAchievementPopup();
  
  const [mounted, setMounted] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("bottle");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showOverview, setShowOverview] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gridLayout, setGridLayout] = useState<GridLayout>(DEFAULT_LAYOUT);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [prevHydration, setPrevHydration] = useState(0);
  const [prevStreak, setPrevStreak] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAccumulatorRef = useRef({ x: 0, y: 0 });
  const lastScrollTime = useRef(0);
  const atBoundaryStartTime = useRef<number | null>(null);
  const lastScrollDirection = useRef<"up" | "down" | "left" | "right" | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    // Load saved layout
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setGridLayout(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved layout");
      }
    }
    // Load unlocked achievements
    const savedAchievements = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
    if (savedAchievements) {
      try {
        setUnlockedAchievements(new Set(JSON.parse(savedAchievements)));
      } catch (e) {
        console.error("Failed to parse achievements");
      }
    }
  }, []);

  // Save unlocked achievements
  useEffect(() => {
    if (mounted && unlockedAchievements.size > 0) {
      localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify([...unlockedAchievements]));
    }
  }, [unlockedAchievements, mounted]);

  // Unlock achievement helper
  const unlockAchievement = useCallback((achievementId: string) => {
    if (!ACHIEVEMENTS[achievementId] || unlockedAchievements.has(achievementId)) return;
    
    setUnlockedAchievements(prev => new Set([...prev, achievementId]));
    showAchievement(ACHIEVEMENTS[achievementId]);
  }, [unlockedAchievements, showAchievement]);

  // Check for achievements when hydration changes
  useEffect(() => {
    if (!mounted || !isLoaded) return;

    const streak = calculateStreak(history);
    const percentage = (hydration / goal) * 100;
    const hour = new Date().getHours();

    // First drink achievement
    if (hydration > 0 && prevHydration === 0 && logs.length === 1) {
      unlockAchievement("first_drink");
      showNotification({
        type: "success",
        title: "Great start!",
        message: "You've logged your first drink today!",
        duration: 4000,
      });
    }

    // Goal reached achievement
    if (hydration >= goal && prevHydration < goal) {
      unlockAchievement("goal_reached");
      showNotification({
        type: "success",
        title: "Goal reached!",
        message: "You've hit your daily hydration goal. Amazing work!",
        duration: 5000,
      });
    }

    // Hydration master (150% of goal)
    if (percentage >= 150 && (prevHydration / goal) * 100 < 150) {
      unlockAchievement("hydration_master");
    }

    // Early bird (before 8 AM)
    if (hour < 8 && logs.length > 0 && prevHydration === 0) {
      unlockAchievement("early_bird");
    }

    // Streak achievements
    if (streak >= 3 && prevStreak < 3) {
      unlockAchievement("streak_3");
      showNotification({
        type: "streak",
        title: `${streak} day streak!`,
        message: "You're on fire! Keep up the great hydration habits.",
        duration: 5000,
      });
    }
    if (streak >= 7 && prevStreak < 7) {
      unlockAchievement("streak_7");
    }

    setPrevHydration(hydration);
    setPrevStreak(streak);
  }, [hydration, goal, logs, history, mounted, isLoaded, prevHydration, prevStreak, unlockAchievement, showNotification]);

  // Handle drink logging with feedback
  const handleAddDrink = useCallback((amount: number, type: string) => {
    addDrink(amount, type as any);
    
    // Show quick feedback notification
    const newTotal = hydration + amount;
    const percentage = (newTotal / goal) * 100;
    
    if (percentage >= 100 && (hydration / goal) * 100 < 100) {
      // Goal will be reached - handled by achievement system
    } else if (percentage >= 75 && (hydration / goal) * 100 < 75) {
      showNotification({
        type: "info",
        title: "Almost there!",
        message: "You're 75% of the way to your goal!",
        duration: 3000,
      });
    } else if (percentage >= 50 && (hydration / goal) * 100 < 50) {
      showNotification({
        type: "info",
        title: "Halfway there!",
        message: "Keep it up - you're doing great!",
        duration: 3000,
      });
    }
  }, [addDrink, hydration, goal, showNotification]);

  // Handle layout changes from OverviewMap
  const handleLayoutChange = useCallback((newLayout: GridLayout) => {
    setGridLayout(newLayout);
  }, []);

  // Long press handler for opening overview
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      longPressTriggeredRef.current = false;
      longPressTimerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = true;
        setShowOverview(true);
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 500);
    };

    const handleTouchEnd = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    const handleTouchMove = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Navigate to a specific screen
  const navigateToScreen = useCallback((screen: ScreenType) => {
    if (isTransitioning || screen === currentScreen) return;
    setIsTransitioning(true);
    setCurrentScreen(screen);
    setShowOverview(false);
    scrollAccumulatorRef.current = { x: 0, y: 0 };
    setTimeout(() => setIsTransitioning(false), 400);
  }, [currentScreen, isTransitioning]);

  // Navigate based on direction from current screen (using dynamic grid layout)
  const navigateDirection = useCallback((direction: "up" | "down" | "left" | "right") => {
    if (isTransitioning) return;
    
    const currentPos = gridLayout[currentScreen];
    let newRow = currentPos.row;
    let newCol = currentPos.col;
    
    switch (direction) {
      case "up": newRow -= 1; break;
      case "down": newRow += 1; break;
      case "left": newCol -= 1; break;
      case "right": newCol += 1; break;
    }
    
    newRow = Math.max(0, Math.min(2, newRow));
    newCol = Math.max(0, Math.min(2, newCol));
    
    const targetScreen = getScreenFromPosition(gridLayout, newRow, newCol);
    if (targetScreen && targetScreen !== currentScreen) {
      navigateToScreen(targetScreen);
    }
  }, [currentScreen, isTransitioning, navigateToScreen, gridLayout]);

  // Get available navigation directions from current screen
  const getAvailableDirections = useCallback(() => {
    const currentPos = gridLayout[currentScreen];
    return {
      up: getScreenFromPosition(gridLayout, currentPos.row - 1, currentPos.col),
      down: getScreenFromPosition(gridLayout, currentPos.row + 1, currentPos.col),
      left: getScreenFromPosition(gridLayout, currentPos.row, currentPos.col - 1),
      right: getScreenFromPosition(gridLayout, currentPos.row, currentPos.col + 1),
    };
  }, [currentScreen, gridLayout]);

  // Check if element is scrollable and at boundary
  const isAtScrollBoundary = useCallback((element: HTMLElement | null, direction: "up" | "down" | "left" | "right"): boolean => {
    if (!element) return true;
    
    const scrollable = element.querySelector('[data-scrollable]') as HTMLElement | null;
    if (!scrollable) return true;
    
    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = scrollable;
    const threshold = 50;
    
    switch (direction) {
      case "up": return scrollTop <= threshold;
      case "down": return scrollTop + clientHeight >= scrollHeight - threshold;
      case "left": return scrollLeft <= threshold;
      case "right": return scrollLeft + clientWidth >= scrollWidth - threshold;
    }
  }, []);

  // Handle wheel events for scroll-based navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning || showOverview) return;
      
      const now = Date.now();
      const timeDelta = now - lastScrollTime.current;
      
      if (timeDelta > 1000) {
        scrollAccumulatorRef.current = { x: 0, y: 0 };
        atBoundaryStartTime.current = null;
        lastScrollDirection.current = null;
      }
      lastScrollTime.current = now;
      
      const mainContent = containerRef.current?.querySelector('main');
      const availableDirections = getAvailableDirections();
      
      const isVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);
      
      if (isVertical) {
        const direction = e.deltaY > 0 ? "down" : "up";
        const targetScreen = direction === "down" ? availableDirections.down : availableDirections.up;
        
        if (lastScrollDirection.current && lastScrollDirection.current !== direction) {
          scrollAccumulatorRef.current = { x: 0, y: 0 };
          atBoundaryStartTime.current = null;
        }
        lastScrollDirection.current = direction;
        
        const atBoundary = isAtScrollBoundary(mainContent, direction);
        
        if (targetScreen && atBoundary) {
          if (atBoundaryStartTime.current === null) {
            atBoundaryStartTime.current = now;
          }
          
          e.preventDefault();
          scrollAccumulatorRef.current.y += Math.abs(e.deltaY);
          
          if (scrollAccumulatorRef.current.y > 25) {
            navigateDirection(direction);
            scrollAccumulatorRef.current = { x: 0, y: 0 };
            atBoundaryStartTime.current = null;
          }
        } else if (!atBoundary) {
          if (direction === "down") {
            const scrollable = mainContent?.querySelector('[data-scrollable]') as HTMLElement | null;
            if (scrollable && scrollable.scrollTop + scrollable.clientHeight < scrollable.scrollHeight - 100) {
              scrollAccumulatorRef.current.y = 0;
              atBoundaryStartTime.current = null;
            }
          } else {
            const scrollable = mainContent?.querySelector('[data-scrollable]') as HTMLElement | null;
            if (scrollable && scrollable.scrollTop > 100) {
              scrollAccumulatorRef.current.y = 0;
              atBoundaryStartTime.current = null;
            }
          }
        }
      } else {
        const direction = e.deltaX > 0 ? "right" : "left";
        const targetScreen = direction === "right" ? availableDirections.right : availableDirections.left;
        
        if (lastScrollDirection.current && lastScrollDirection.current !== direction) {
          scrollAccumulatorRef.current = { x: 0, y: 0 };
          atBoundaryStartTime.current = null;
        }
        lastScrollDirection.current = direction;
        
        const atBoundary = isAtScrollBoundary(mainContent, direction);
        
        if (targetScreen && atBoundary) {
          if (atBoundaryStartTime.current === null) {
            atBoundaryStartTime.current = now;
          }
          
          e.preventDefault();
          scrollAccumulatorRef.current.x += Math.abs(e.deltaX);
          
          if (scrollAccumulatorRef.current.x > 25) {
            navigateDirection(direction);
            scrollAccumulatorRef.current = { x: 0, y: 0 };
            atBoundaryStartTime.current = null;
          }
        } else if (!atBoundary) {
          scrollAccumulatorRef.current.x = 0;
          atBoundaryStartTime.current = null;
        }
      }
    };
    
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isTransitioning, showOverview, getAvailableDirections, isAtScrollBoundary, navigateDirection]);

  // Handle touch events for swipe-based navigation at boundaries
  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;
    let isSwiping = false;
    let wasAtBoundaryAtStart = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      isSwiping = false;
      
      const mainContent = containerRef.current?.querySelector('main');
      const availableDirections = getAvailableDirections();
      wasAtBoundaryAtStart = 
        (availableDirections.up && isAtScrollBoundary(mainContent, "up")) ||
        (availableDirections.down && isAtScrollBoundary(mainContent, "down")) ||
        (availableDirections.left && isAtScrollBoundary(mainContent, "left")) ||
        (availableDirections.right && isAtScrollBoundary(mainContent, "right"));
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isTransitioning || showOverview || isSwiping) return;
      
      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      const deltaY = touchStartY - touchY;
      const deltaX = touchStartX - touchX;
      
      const mainContent = containerRef.current?.querySelector('main');
      const availableDirections = getAvailableDirections();
      
      const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
      const threshold = 40;
      
      if (!wasAtBoundaryAtStart) return;
      
      if (isVertical && Math.abs(deltaY) > threshold) {
        const direction = deltaY > 0 ? "down" : "up";
        const targetScreen = direction === "down" ? availableDirections.down : availableDirections.up;
        
        if (targetScreen && isAtScrollBoundary(mainContent, direction)) {
          isSwiping = true;
          navigateDirection(direction);
        }
      } else if (!isVertical && Math.abs(deltaX) > threshold) {
        const direction = deltaX > 0 ? "right" : "left";
        const targetScreen = direction === "right" ? availableDirections.right : availableDirections.left;
        
        if (targetScreen && isAtScrollBoundary(mainContent, direction)) {
          isSwiping = true;
          navigateDirection(direction);
        }
      }
    };
    
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isTransitioning, showOverview, getAvailableDirections, isAtScrollBoundary, navigateDirection]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showOverview) {
        if (e.key === "Escape") setShowOverview(false);
        return;
      }
      
      switch (e.key) {
        case "ArrowUp": navigateDirection("up"); break;
        case "ArrowDown": navigateDirection("down"); break;
        case "ArrowLeft": navigateDirection("left"); break;
        case "ArrowRight": navigateDirection("right"); break;
        case "Escape": setShowOverview(true); break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigateDirection, showOverview]);

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const streak = calculateStreak(history);
  const quality = calculateHydrationQuality(logs, goal, settings.bedtimeHour);
  const percentage = Math.min((hydration / goal) * 100, 100);

  // Build mini-map based on current grid layout
  const renderMiniMap = () => {
    const cells: (ScreenType | null)[][] = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    
    for (const [screen, pos] of Object.entries(gridLayout)) {
      if (pos.row >= 0 && pos.row <= 2 && pos.col >= 0 && pos.col <= 2) {
        cells[pos.row][pos.col] = screen as ScreenType;
      }
    }

    const screenColors: Record<ScreenType, string> = {
      stats: "bg-purple-500",
      history: "bg-cyan-500",
      bottle: "bg-blue-500",
      settings: "bg-zinc-500",
      details: "bg-blue-400",
      quality: "bg-green-500",
      achievements: "bg-amber-500",
    };

    return (
      <div className="flex flex-col gap-1">
        {cells.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1 justify-center">
            {row.map((screen, colIdx) => (
              <div
                key={colIdx}
                className={`w-2 h-2 rounded-full transition-all ${
                  screen
                    ? currentScreen === screen
                      ? `${screenColors[screen]} scale-125`
                      : "bg-zinc-300 dark:bg-zinc-700"
                    : "bg-transparent"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="h-screen bg-gradient-to-b from-zinc-50 via-blue-50/30 to-cyan-50/20 dark:from-zinc-950 dark:via-blue-950/20 dark:to-cyan-950/10 overflow-hidden"
    >
      {!settings.hasOnboarded && <Onboarding />}

      {/* Achievement Popup */}
      <AchievementPopup achievement={currentAchievement} onClose={handleAchievementClose} />

      {/* Edge Swipe Zones */}
      <SwipeZone position="left" onSwipe={navigateDirection} />
      <SwipeZone position="right" onSwipe={navigateDirection} />
      <SwipeZone position="top" onSwipe={navigateDirection} />
      <SwipeZone position="bottom" onSwipe={navigateDirection} />

      {/* Minimal Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-30 px-6 py-4 flex justify-between items-center max-w-md mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
              Drip
            </h1>
            {streak > 0 && (
              <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {streak} day streak
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mini-map in header */}
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-xl p-2 border border-zinc-200/50 dark:border-zinc-800/50">
            {renderMiniMap()}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowOverview(true)}
            className="rounded-full h-9 w-9 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl hover:bg-white dark:hover:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 relative z-40"
          >
            <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </Button>
        </div>
      </header>

      {/* Main Screen Container with Sliding Animation */}
      <AnimatePresence mode="wait">
        <motion.main
          key={currentScreen}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-full w-full"
        >
          {/* BOTTLE SCREEN - Enhanced */}
          {currentScreen === "bottle" && (
            <section className="h-full flex flex-col px-6 relative pt-24 pb-28">
              {/* Animated background glow */}
              <motion.div 
                className="absolute inset-0 -z-10 opacity-30 dark:opacity-20"
                animate={{
                  background: [
                    `radial-gradient(circle at 50% 40%, ${percentage > 80 ? '#3b82f6' : percentage > 50 ? '#06b6d4' : '#94a3b8'} 0%, transparent 50%)`,
                    `radial-gradient(circle at 50% 45%, ${percentage > 80 ? '#3b82f6' : percentage > 50 ? '#06b6d4' : '#94a3b8'} 0%, transparent 55%)`,
                    `radial-gradient(circle at 50% 40%, ${percentage > 80 ? '#3b82f6' : percentage > 50 ? '#06b6d4' : '#94a3b8'} 0%, transparent 50%)`,
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="flex flex-col items-center justify-center flex-1 space-y-3">
                {/* Water Vessel with enhanced animations */}
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-[200px]">
                    <WaterVessel current={hydration} goal={goal} />
                  </div>
                  
                  {/* Celebration particles when goal reached */}
                  {percentage >= 100 && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                          style={{
                            left: '50%',
                            top: '50%',
                          }}
                          animate={{
                            x: [0, (Math.cos(i * Math.PI / 4) * 80)],
                            y: [0, (Math.sin(i * Math.PI / 4) * 80)],
                            opacity: [1, 0],
                            scale: [1, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                            repeatDelay: 2,
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>

                {/* Stats display */}
                <motion.div 
                  className="text-center space-y-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="space-y-0.5">
                    <motion.p 
                      className="text-4xl font-bold text-zinc-900 dark:text-white"
                      key={hydration}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                    >
                      {hydration}<span className="text-xl text-zinc-400 dark:text-zinc-600">ml</span>
                    </motion.p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      of {goal}ml - {percentage.toFixed(0)}%
                    </p>
                  </div>
                  <HydrationStatus current={hydration} goal={goal} name={settings.name} />
                </motion.div>

                {/* Circadian guidance */}
                <div className="w-full max-w-sm">
                  <CircadianGuidance />
                </div>
              </div>

              {/* Quick log buttons */}
              <div className="absolute bottom-16 left-0 right-0 px-6 z-20">
                <div className="max-w-sm mx-auto">
                  <QuickLog 
                    onLog={handleAddDrink}
                    customButton={
                      <AddDrinkDrawer onAdd={handleAddDrink}>
                        <Button
                          variant="outline"
                          className="flex h-20 flex-col gap-1.5 rounded-2xl border-2 border-dashed border-blue-400 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all active:scale-95 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm"
                        >
                          <Plus className="w-5 h-5 text-blue-500" />
                          <span className="font-semibold text-xs">Custom</span>
                        </Button>
                      </AddDrinkDrawer>
                    }
                  />
                </div>
              </div>
            </section>
          )}

          {/* DETAILS SCREEN */}
          {currentScreen === "details" && (
            <section className="h-full overflow-y-auto" data-scrollable>
              <div className="px-6 pt-20 pb-12 space-y-4">
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-6 border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5 dark:shadow-none">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Today's Progress</h3>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{hydration}ml consumed</span>
                    <span>{Math.max(0, goal - hydration)}ml remaining</span>
                  </div>
                </div>

                {quality.warnings.length > 0 && (
                  <div className="overflow-hidden">
                    <button
                      onClick={() => toggleSection('warnings')}
                      className="w-full bg-amber-50 dark:bg-amber-950/30 backdrop-blur-xl rounded-3xl p-5 border border-amber-200/50 dark:border-amber-900/50 transition-all hover:shadow-lg hover:shadow-amber-500/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                              <path d="M12 9v4"/><path d="M12 17h.01"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                              {quality.warnings.length} Alert{quality.warnings.length > 1 ? 's' : ''}
                            </h3>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              Tap to {expandedSections.has('warnings') ? 'hide' : 'view'}
                            </p>
                          </div>
                        </div>
                        <svg className={`w-5 h-5 text-amber-600 dark:text-amber-400 transition-transform duration-300 ${expandedSections.has('warnings') ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </div>
                    </button>
                    {expandedSections.has('warnings') && (
                      <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <HydrationWarnings warnings={quality.warnings} />
                      </div>
                    )}
                  </div>
                )}

                <div className="overflow-hidden">
                  <button
                    onClick={() => toggleSection('caffeine')}
                    className="w-full bg-orange-50 dark:bg-orange-950/30 backdrop-blur-xl rounded-3xl p-5 border border-orange-200/50 dark:border-orange-900/50 transition-all hover:shadow-lg hover:shadow-orange-500/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                          <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
                            <line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>
                          </svg>
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                            Caffeine Today
                          </h3>
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            {logs.filter(l => l.type === 'coffee' || l.type === 'tea').length} drink{logs.filter(l => l.type === 'coffee' || l.type === 'tea').length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <svg className={`w-5 h-5 text-orange-600 dark:text-orange-400 transition-transform duration-300 ${expandedSections.has('caffeine') ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>
                  </button>
                  {expandedSections.has('caffeine') && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <CaffeineTracker logs={logs} />
                    </div>
                  )}
                </div>

                {logs.length > 0 && (
                  <div className="overflow-hidden">
                    <button
                      onClick={() => toggleSection('log')}
                      className="w-full bg-blue-50 dark:bg-blue-950/30 backdrop-blur-xl rounded-3xl p-5 border border-blue-200/50 dark:border-blue-900/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="8" height="18" x="3" y="3" rx="1"/><path d="M7 3v18"/><path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                              Today's Log
                            </h3>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              {logs.length} entr{logs.length !== 1 ? 'ies' : 'y'}
                            </p>
                          </div>
                        </div>
                        <svg className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform duration-300 ${expandedSections.has('log') ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </div>
                    </button>
                    {expandedSections.has('log') && (
                      <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <TodayDrinks logs={logs} onRemove={removeDrink} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* SETTINGS SCREEN */}
          {currentScreen === "settings" && <SettingsScreen />}

          {/* STATS SCREEN */}
          {currentScreen === "stats" && <StatsScreen />}

          {/* QUALITY SCREEN */}
          {currentScreen === "quality" && <QualityScreen />}

          {/* HISTORY SCREEN */}
          {currentScreen === "history" && <HistoryScreen />}

          {/* ACHIEVEMENTS SCREEN */}
          {currentScreen === "achievements" && <AchievementsScreen />}
        </motion.main>
      </AnimatePresence>

      {/* Overview Map */}
      <AnimatePresence>
        {showOverview && (
          <OverviewMap
            currentScreen={currentScreen}
            onScreenSelect={navigateToScreen}
            onClose={() => setShowOverview(false)}
            onLayoutChange={handleLayoutChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}