export type DrinkType = 'water' | 'tea' | 'coffee' | 'soda' | 'juice' | 'energy';

export interface DrinkDefinition {
  id: DrinkType;
  name: string;
  hydrationFactor: number; // Research-based multiplier
  caffeinePerMl: number; // mg of caffeine per ml
  icon: string;
  color: string;
}

// Research-based hydration factors and caffeine content
export const DRINK_TYPES: Record<DrinkType, DrinkDefinition> = {
  water: { id: 'water', name: 'Water', hydrationFactor: 1.0, caffeinePerMl: 0, icon: '💧', color: 'bg-blue-500' },
  tea: { id: 'tea', name: 'Tea', hydrationFactor: 0.95, caffeinePerMl: 0.2, icon: '🍵', color: 'bg-emerald-500' }, // ~20mg/100ml
  coffee: { id: 'coffee', name: 'Coffee', hydrationFactor: 0.85, caffeinePerMl: 0.4, icon: '☕', color: 'bg-amber-700' }, // ~40mg/100ml
  soda: { id: 'soda', name: 'Soda', hydrationFactor: 0.9, caffeinePerMl: 0.1, icon: '🥤', color: 'bg-red-500' }, // ~10mg/100ml average
  juice: { id: 'juice', name: 'Juice', hydrationFactor: 1.0, caffeinePerMl: 0, icon: '🧃', color: 'bg-orange-500' },
  energy: { id: 'energy', name: 'Energy', hydrationFactor: 0.85, caffeinePerMl: 0.32, icon: '⚡', color: 'bg-purple-500' }, // ~32mg/100ml
};

export interface DrinkLog {
  id: string;
  timestamp: number;
  amount: number; // volume in ml
  type: DrinkType;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  logs: DrinkLog[];
  goal: number;
}

export interface AppSettings {
  dailyGoal: number;
  weight?: number;
  activityLevel?: 'low' | 'moderate' | 'high';
  useOunces: boolean;
  name?: string;
  hasOnboarded?: boolean;
  remindersEnabled?: boolean;
  smartSchedule?: boolean;
  showQualityScores?: boolean; // Show hydration quality analysis
  bedtimeHour?: number; // Hour to start bedtime warnings (default 20 = 8pm)
}

// Hydration quality scoring
export interface HydrationQuality {
  overall: 'A' | 'B' | 'C' | 'D' | 'F';
  distribution: 'A' | 'B' | 'C' | 'D' | 'F'; // How well spread across day
  spacing: 'A' | 'B' | 'C' | 'D' | 'F'; // Gaps between drinks
  timing: 'A' | 'B' | 'C' | 'D' | 'F'; // Pre-bedtime timing
  warnings: HydrationWarning[];
  insights: string[];
}

export type WarningType = 'absorption' | 'bedtime' | 'caffeine' | 'gap' | 'overload';

export interface HydrationWarning {
  type: WarningType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp?: number;
}

// Time period distribution
export interface TimePeriod {
  name: string;
  start: number; // Hour (0-23)
  end: number;
  targetPercentage: number; // Ideal percentage of daily intake
  actual: number; // Actual ml consumed
}