"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { DrinkLog, DayLog, AppSettings, DRINK_TYPES, DrinkType } from '@/lib/types';

const STORAGE_KEY = 'drip-hydration-data';
const SETTINGS_KEY = 'drip-settings';

const DEFAULT_SETTINGS: AppSettings = {
  dailyGoal: 2500,
  useOunces: false,
  hasOnboarded: false,
  remindersEnabled: false,
  smartSchedule: false,
};

interface HydrationContextType {
  isLoaded: boolean;
  hydration: number;
  goal: number;
  percentage: number;
  logs: DrinkLog[];
  history: Record<string, DayLog>;
  addDrink: (amount: number, type?: DrinkType) => void;
  removeDrink: (logId: string) => void;
  updateGoal: (newGoal: number) => void;
  setSettings: (settings: AppSettings) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  settings: AppSettings;
}

const HydrationContext = createContext<HydrationContextType | undefined>(undefined);

export function HydrationProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [history, setHistory] = useState<Record<string, DayLog>>({});
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [todayDate, setTodayDate] = useState<string>('');

  // Initialize
  useEffect(() => {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    setTodayDate(dateKey);

    const storedData = localStorage.getItem(STORAGE_KEY);
    const storedSettings = localStorage.getItem(SETTINGS_KEY);

    if (storedData) {
      try {
        setHistory(JSON.parse(storedData));
      } catch (e) {
        console.error("Failed to parse hydration history", e);
      }
    }

    if (storedSettings) {
      try {
        setSettingsState({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }

    setIsLoaded(true);
  }, []);

  // Persistence
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  }, [history, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  // Helpers
  const getTodayLog = useCallback(() => {
    if (!todayDate) return { date: '', logs: [], goal: settings.dailyGoal };
    
    if (!history[todayDate]) {
      return { date: todayDate, logs: [], goal: settings.dailyGoal };
    }
    return history[todayDate];
  }, [history, todayDate, settings.dailyGoal]);

  const getHydrationTotal = useCallback((logs: DrinkLog[]) => {
    return logs.reduce((acc, log) => {
      const factor = DRINK_TYPES[log.type]?.hydrationFactor || 1;
      return acc + (log.amount * factor);
    }, 0);
  }, []);

  // Actions
  const addDrink = useCallback((amount: number, type: DrinkType = 'water') => {
    const newLog: DrinkLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      amount,
      type,
    };

    console.log('Adding drink:', newLog); // Debug log

    setHistory((prev) => {
      const currentDay = prev[todayDate] || { date: todayDate, logs: [], goal: settings.dailyGoal };
      return {
        ...prev,
        [todayDate]: {
          ...currentDay,
          logs: [...currentDay.logs, newLog],
        },
      };
    });
  }, [todayDate, settings.dailyGoal]);

  const removeDrink = useCallback((logId: string) => {
    setHistory((prev) => {
      const currentDay = prev[todayDate];
      if (!currentDay) return prev;

      return {
        ...prev,
        [todayDate]: {
          ...currentDay,
          logs: currentDay.logs.filter((l) => l.id !== logId),
        },
      };
    });
  }, [todayDate]);

  const updateGoal = useCallback((newGoal: number) => {
    setSettingsState((prev) => ({ ...prev, dailyGoal: newGoal }));
    setHistory((prev) => {
      if (!prev[todayDate]) return prev;
      return {
        ...prev,
        [todayDate]: {
          ...prev[todayDate],
          goal: newGoal
        }
      };
    });
  }, [todayDate]);

  const setSettings = useCallback((newSettings: AppSettings) => {
    setSettingsState(newSettings);
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...updates }));
  }, []);

  const todayLog = getTodayLog();
  const currentHydration = getHydrationTotal(todayLog.logs);
  const progress = Math.min(100, (currentHydration / settings.dailyGoal) * 100);

  const value = {
    isLoaded,
    hydration: currentHydration,
    goal: settings.dailyGoal,
    percentage: progress,
    logs: todayLog.logs,
    history,
    addDrink,
    removeDrink,
    updateGoal,
    setSettings,
    updateSettings,
    settings
  };

  return (
    <HydrationContext.Provider value={value}>
      {children}
    </HydrationContext.Provider>
  );
}

export function useHydration() {
  const context = useContext(HydrationContext);
  if (context === undefined) {
    throw new Error('useHydration must be used within a HydrationProvider');
  }
  return context;
}