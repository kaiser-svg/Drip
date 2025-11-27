"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, PanInfo } from "framer-motion";
import { Droplets, BarChart2, Settings, ClipboardList, Sparkles, Calendar, Trophy, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type ScreenType = "bottle" | "details" | "settings" | "stats" | "quality" | "history" | "achievements";

interface OverviewMapProps {
  currentScreen: ScreenType;
  onScreenSelect: (screen: ScreenType) => void;
  onClose: () => void;
  onLayoutChange?: (layout: GridLayout) => void;
}

// Grid position type (0-2 for both row and col in 3x3 grid)
type GridPosition = { row: number; col: number };

// Grid layout maps screen to grid position (null means empty cell)
type GridLayout = Record<ScreenType, GridPosition>;

const SCREEN_CONFIG: Record<ScreenType, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
  bottle: {
    icon: <Droplets className="w-5 h-5" />,
    label: "Hydration",
    color: "from-blue-500 to-cyan-400",
    bgColor: "bg-blue-500/10",
  },
  details: {
    icon: <ClipboardList className="w-5 h-5" />,
    label: "Details",
    color: "from-sky-400 to-blue-500",
    bgColor: "bg-sky-500/10",
  },
  settings: {
    icon: <Settings className="w-5 h-5" />,
    label: "Settings",
    color: "from-slate-500 to-zinc-600",
    bgColor: "bg-slate-500/10",
  },
  stats: {
    icon: <BarChart2 className="w-5 h-5" />,
    label: "Statistics",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
  },
  quality: {
    icon: <Sparkles className="w-5 h-5" />,
    label: "Quality",
    color: "from-emerald-400 to-green-500",
    bgColor: "bg-emerald-500/10",
  },
  history: {
    icon: <Calendar className="w-5 h-5" />,
    label: "History",
    color: "from-cyan-400 to-teal-500",
    bgColor: "bg-cyan-500/10",
  },
  achievements: {
    icon: <Trophy className="w-5 h-5" />,
    label: "Awards",
    color: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-500/10",
  },
};

// Default layout in 3x3 grid
const DEFAULT_LAYOUT: GridLayout = {
  stats: { row: 0, col: 1 },
  history: { row: 1, col: 0 },
  bottle: { row: 1, col: 1 },
  settings: { row: 1, col: 2 },
  details: { row: 2, col: 0 },
  quality: { row: 2, col: 1 },
  achievements: { row: 2, col: 2 },
};

const STORAGE_KEY = "drip-grid-layout";

// Check if all screens are orthogonally connected (no isolated screens)
function isLayoutConnected(layout: GridLayout): boolean {
  const screens = Object.keys(layout) as ScreenType[];
  if (screens.length === 0) return true;
  
  const visited = new Set<ScreenType>();
  const queue: ScreenType[] = [screens[0]];
  visited.add(screens[0]);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentPos = layout[current];
    
    // Check all orthogonal neighbors
    for (const screen of screens) {
      if (visited.has(screen)) continue;
      
      const pos = layout[screen];
      const isAdjacent = 
        (Math.abs(pos.row - currentPos.row) === 1 && pos.col === currentPos.col) ||
        (Math.abs(pos.col - currentPos.col) === 1 && pos.row === currentPos.row);
      
      if (isAdjacent) {
        visited.add(screen);
        queue.push(screen);
      }
    }
  }
  
  return visited.size === screens.length;
}

// Get screen at a specific grid position
function getScreenAtPosition(layout: GridLayout, row: number, col: number): ScreenType | null {
  for (const [screen, pos] of Object.entries(layout)) {
    if (pos.row === row && pos.col === col) return screen as ScreenType;
  }
  return null;
}

// Grid constants
const CELL_SIZE = 80;
const GAP_SIZE = 12;
const GRID_PADDING = 16;
const CELL_STEP = CELL_SIZE + GAP_SIZE;

export function OverviewMap({ currentScreen, onScreenSelect, onClose, onLayoutChange }: OverviewMapProps) {
  const [layout, setLayout] = useState<GridLayout>(DEFAULT_LAYOUT);
  const [draggingScreen, setDraggingScreen] = useState<ScreenType | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ row: number; col: number } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  // Load saved layout from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isLayoutConnected(parsed)) {
          setLayout(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved layout");
      }
    }
  }, []);

  // Save layout changes
  const saveLayout = useCallback((newLayout: GridLayout) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
    onLayoutChange?.(newLayout);
    setHasChanges(false);
  }, [onLayoutChange]);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LAYOUT));
    onLayoutChange?.(DEFAULT_LAYOUT);
    setHasChanges(false);
  }, [onLayoutChange]);

  // Handle drag start
  const handleDragStart = (screen: ScreenType, event: MouseEvent | TouchEvent | PointerEvent) => {
    setDraggingScreen(screen);
    
    // Store initial pointer position
    if ('touches' in event) {
      dragStartPos.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else {
      dragStartPos.current = { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY };
    }
  };

  // Handle drag end - place screen in new cell if valid
  const handleDragEnd = (screen: ScreenType) => {
    if (!dragOverCell) {
      setDraggingScreen(null);
      dragStartPos.current = null;
      return;
    }

    const { row, col } = dragOverCell;
    const currentPos = layout[screen];
    
    // Only process if actually moved to a different cell
    if (row === currentPos.row && col === currentPos.col) {
      setDraggingScreen(null);
      setDragOverCell(null);
      dragStartPos.current = null;
      return;
    }
    
    const existingScreen = getScreenAtPosition(layout, row, col);
    
    // Create new layout
    const newLayout = { ...layout };
    
    if (existingScreen) {
      // Swap positions
      newLayout[existingScreen] = { ...currentPos };
    }
    newLayout[screen] = { row, col };
    
    // Validate connectivity
    if (isLayoutConnected(newLayout)) {
      setLayout(newLayout);
      setHasChanges(true);
    }
    
    setDraggingScreen(null);
    setDragOverCell(null);
    dragStartPos.current = null;
  };

  // Calculate which cell is being hovered during drag based on pointer position
  const handleDrag = (screen: ScreenType, info: PanInfo, event: MouseEvent | TouchEvent | PointerEvent) => {
    if (!gridRef.current) return;
    
    const gridRect = gridRef.current.getBoundingClientRect();
    
    // Get the current pointer position
    let pointerX: number, pointerY: number;
    if ('touches' in event && event.touches.length > 0) {
      pointerX = event.touches[0].clientX;
      pointerY = event.touches[0].clientY;
    } else {
      pointerX = (event as MouseEvent).clientX;
      pointerY = (event as MouseEvent).clientY;
    }
    
    // Calculate position relative to grid
    const relativeX = pointerX - gridRect.left - GRID_PADDING;
    const relativeY = pointerY - gridRect.top - GRID_PADDING;
    
    // Determine which cell this point falls into
    const targetCol = Math.floor(relativeX / CELL_STEP);
    const targetRow = Math.floor(relativeY / CELL_STEP);
    
    // Clamp to valid grid bounds
    const clampedRow = Math.max(0, Math.min(2, targetRow));
    const clampedCol = Math.max(0, Math.min(2, targetCol));
    
    // Update drag over cell
    if (dragOverCell?.row !== clampedRow || dragOverCell?.col !== clampedCol) {
      setDragOverCell({ row: clampedRow, col: clampedCol });
    }
  };

  // Get screen position in pixels
  const getScreenPixelPos = (screen: ScreenType) => {
    const pos = layout[screen];
    return {
      left: pos.col * CELL_STEP + GRID_PADDING,
      top: pos.row * CELL_STEP + GRID_PADDING,
    };
  };

  // Check if two cells are orthogonally adjacent
  const areAdjacent = (pos1: GridPosition, pos2: GridPosition) => {
    return (
      (Math.abs(pos1.row - pos2.row) === 1 && pos1.col === pos2.col) ||
      (Math.abs(pos1.col - pos2.col) === 1 && pos1.row === pos2.row)
    );
  };

  // Get connection lines between adjacent screens
  const getConnectionLines = () => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const screens = Object.keys(layout) as ScreenType[];
    
    for (let i = 0; i < screens.length; i++) {
      for (let j = i + 1; j < screens.length; j++) {
        const pos1 = layout[screens[i]];
        const pos2 = layout[screens[j]];
        
        if (areAdjacent(pos1, pos2)) {
          const pix1 = getScreenPixelPos(screens[i]);
          const pix2 = getScreenPixelPos(screens[j]);
          
          lines.push({
            x1: pix1.left + CELL_SIZE / 2,
            y1: pix1.top + CELL_SIZE / 2,
            x2: pix2.left + CELL_SIZE / 2,
            y2: pix2.top + CELL_SIZE / 2,
          });
        }
      }
    }
    
    return lines;
  };

  const screens: ScreenType[] = ["stats", "history", "bottle", "settings", "details", "quality", "achievements"];
  const connectionLines = getConnectionLines();

  const gridWidth = CELL_SIZE * 3 + GAP_SIZE * 2 + GRID_PADDING * 2;
  const gridHeight = CELL_SIZE * 3 + GAP_SIZE * 2 + GRID_PADDING * 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative flex flex-col items-center gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h2 className="text-lg font-semibold text-white tracking-tight">Screen Map</h2>
          <p className="text-xs text-zinc-500 mt-1">Drag to reorganize your layout</p>
        </motion.div>

        {/* 3x3 Grid Container */}
        <motion.div 
          ref={gridRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="relative rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 shadow-2xl shadow-black/50"
          style={{ width: gridWidth, height: gridHeight }}
        >
          {/* Grid cell backgrounds */}
          <div 
            className="absolute grid grid-cols-3 grid-rows-3"
            style={{ inset: GRID_PADDING, gap: GAP_SIZE }}
          >
            {Array.from({ length: 9 }).map((_, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              const screenHere = getScreenAtPosition(layout, row, col);
              const isDropTarget = dragOverCell?.row === row && dragOverCell?.col === col;
              const isDraggingOver = draggingScreen && isDropTarget;
              
              return (
                <motion.div
                  key={i}
                  animate={{
                    scale: isDraggingOver ? 1.05 : 1,
                    borderColor: isDraggingOver ? "rgba(59, 130, 246, 0.6)" : "rgba(63, 63, 70, 0.3)",
                  }}
                  className={`rounded-2xl border-2 border-dashed transition-colors ${
                    isDraggingOver
                      ? "bg-blue-500/20"
                      : screenHere
                      ? "border-transparent"
                      : "bg-zinc-800/20"
                  }`}
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                />
              );
            })}
          </div>

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                <stop offset="100%" stopColor="rgba(6, 182, 212, 0.4)" />
              </linearGradient>
            </defs>
            {connectionLines.map((line, i) => (
              <motion.line
                key={i}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.05 }}
              />
            ))}
          </svg>

          {/* Screen Cards */}
          {screens.map((screen, index) => {
            const pixelPos = getScreenPixelPos(screen);
            const config = SCREEN_CONFIG[screen];
            const isActive = currentScreen === screen;
            const isDragging = draggingScreen === screen;

            return (
              <motion.div
                key={screen}
                className="absolute"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  left: pixelPos.left, 
                  top: pixelPos.top,
                  zIndex: isDragging ? 50 : 10,
                }}
                transition={{ 
                  opacity: { delay: 0.1 + index * 0.03 },
                  scale: { delay: 0.1 + index * 0.03 },
                  left: { type: "spring", stiffness: 300, damping: 30 },
                  top: { type: "spring", stiffness: 300, damping: 30 },
                }}
                style={{ width: CELL_SIZE, height: CELL_SIZE }}
                drag
                dragMomentum={false}
                dragElastic={0}
                dragSnapToOrigin
                onDragStart={(e) => handleDragStart(screen, e as unknown as MouseEvent)}
                onDrag={(e, info) => handleDrag(screen, info, e as unknown as MouseEvent)}
                onDragEnd={() => handleDragEnd(screen)}
                whileDrag={{ scale: 1.1, zIndex: 50, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
              >
                <motion.button
                  onClick={() => !isDragging && onScreenSelect(screen)}
                  className={`w-full h-full rounded-2xl flex flex-col items-center justify-center gap-1 transition-all touch-none relative overflow-hidden ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  whileHover={!isDragging ? { scale: 1.02 } : undefined}
                  whileTap={!isDragging ? { scale: 0.98 } : undefined}
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.color} opacity-10`} />
                  
                  {/* Card background */}
                  <div className={`absolute inset-0 rounded-2xl bg-zinc-900/90 backdrop-blur-sm border ${
                    isActive ? 'border-blue-500/50' : 'border-zinc-700/50'
                  }`} />
                  
                  {/* Active glow */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(59, 130, 246, 0)",
                          "0 0 20px 2px rgba(59, 130, 246, 0.3)",
                          "0 0 0 0 rgba(59, 130, 246, 0)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  
                  {/* Icon container */}
                  <div className={`relative z-10 h-8 w-8 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white shadow-lg`}>
                    {config.icon}
                  </div>
                  
                  {/* Label */}
                  <span className="relative z-10 text-[10px] font-medium text-zinc-300">{config.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    />
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Action buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex gap-3"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={resetLayout}
            className="bg-zinc-900/60 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 rounded-xl px-4"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            Reset
          </Button>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button
                size="sm"
                onClick={() => saveLayout(layout)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl px-4 shadow-lg shadow-blue-500/25"
              >
                <Check className="w-3.5 h-3.5 mr-2" />
                Save Layout
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation hints */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-0.5"
        >
          <p className="text-xs text-zinc-500">Tap a screen to navigate</p>
          <p className="text-[10px] text-zinc-600">Press Esc or tap outside to close</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Export helper to get current layout for navigation
export function getStoredLayout(): GridLayout {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (isLayoutConnected(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse saved layout");
    }
  }
  return DEFAULT_LAYOUT;
}

// Export the type for use in page.tsx
export type { GridLayout, GridPosition };