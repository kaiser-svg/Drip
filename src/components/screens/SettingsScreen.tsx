"use client";

import { useHydration } from "@/hooks/useHydration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download, Moon, Sun, Monitor, Trash2, Bell, BellOff, Target, Palette, Database, Droplets } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { requestNotificationPermission } from "@/lib/notifications";
import { toast } from "sonner";

export function SettingsScreen() {
  const { settings, updateGoal, history, updateSettings } = useHydration();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [customGoal, setCustomGoal] = useState(settings.dailyGoal.toString());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    setMounted(true);
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    setCustomGoal(settings.dailyGoal.toString());
  }, [settings.dailyGoal]);

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomGoal(e.target.value);
  };

  const saveGoal = () => {
    const val = parseInt(customGoal);
    if (!isNaN(val) && val > 0) {
      updateGoal(val);
      toast.success("Goal updated successfully!");
    }
  };

  const handleRemindersToggle = async (checked: boolean) => {
    updateSettings({ remindersEnabled: checked });
    
    if (checked && notificationPermission !== "granted") {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      
      if (permission === "granted") {
        toast.success("Reminders enabled!");
      } else {
        updateSettings({ remindersEnabled: false });
        toast.error("Please allow notifications to enable reminders.");
      }
    } else if (checked) {
      toast.success("Reminders enabled!");
    } else {
      toast.info("Reminders disabled");
    }
  };

  const handleSmartScheduleToggle = (checked: boolean) => {
    updateSettings({ smartSchedule: checked });
    if (checked) {
      toast.success("Smart schedule enabled!");
    } else {
      toast.info("Using regular schedule");
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `drip_data_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success("Data exported!");
  };

  const clearData = () => {
    localStorage.removeItem('drip-hydration-data');
    toast.success("All data cleared");
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <div className="h-full overflow-y-auto" data-scrollable>
      <div className="px-6 pt-20 pb-12 space-y-5 max-w-md mx-auto">
        {/* Goal Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Goals</h3>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5 dark:shadow-none space-y-4">
            <div className="space-y-2">
              <Label htmlFor="daily-goal" className="text-sm font-medium">Daily Hydration Goal</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    id="daily-goal" 
                    type="number" 
                    value={customGoal} 
                    onChange={handleGoalChange}
                    className="text-base pr-10 h-11 rounded-xl"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ml</span>
                </div>
                <Button 
                  onClick={saveGoal} 
                  disabled={parseInt(customGoal) === settings.dailyGoal} 
                  className="h-11 px-5 rounded-xl"
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: 2000-3000ml based on activity level
              </p>
            </div>
          </div>
        </motion.section>

        {/* Reminder Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-cyan-500" />
            </div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reminders</h3>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5 dark:shadow-none space-y-4">
            {notificationPermission !== "granted" && settings.remindersEnabled && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                  <BellOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Enable notifications in your browser settings to receive hydration reminders.
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Daily Reminders</Label>
                <p className="text-xs text-muted-foreground">Get notified throughout the day</p>
              </div>
              <Switch 
                checked={settings.remindersEnabled} 
                onCheckedChange={handleRemindersToggle}
              />
            </div>
            
            <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Smart Schedule</Label>
                <p className="text-xs text-muted-foreground">Adapt reminders to your habits</p>
              </div>
              <Switch 
                checked={settings.smartSchedule}
                onCheckedChange={handleSmartScheduleToggle}
                disabled={!settings.remindersEnabled}
              />
            </div>
          </div>
        </motion.section>

        {/* Appearance Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Palette className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Appearance</h3>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5 dark:shadow-none">
            <Label className="text-sm font-medium mb-3 block">Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                className={`flex flex-col h-20 gap-2 rounded-xl transition-all ${theme === 'light' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                onClick={() => setTheme('light')}
                size="sm"
              >
                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Sun className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-xs font-medium">Light</span>
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                className={`flex flex-col h-20 gap-2 rounded-xl transition-all ${theme === 'dark' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                onClick={() => setTheme('dark')}
                size="sm"
              >
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-indigo-500" />
                </div>
                <span className="text-xs font-medium">Dark</span>
              </Button>
              <Button 
                variant={theme === 'system' ? 'default' : 'outline'} 
                className={`flex flex-col h-20 gap-2 rounded-xl transition-all ${theme === 'system' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                onClick={() => setTheme('system')}
                size="sm"
              >
                <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-zinc-500" />
                </div>
                <span className="text-xs font-medium">System</span>
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Data Management */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-zinc-500/10 flex items-center justify-center">
              <Database className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</h3>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5 dark:shadow-none space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Export Data</Label>
                <p className="text-xs text-muted-foreground">Download your history as JSON</p>
              </div>
              <Button variant="outline" size="icon" onClick={exportData} className="rounded-xl h-10 w-10">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-destructive">Clear All Data</Label>
                <p className="text-xs text-muted-foreground">Permanently delete your history</p>
              </div>
              <Button variant="destructive" size="icon" onClick={clearData} className="rounded-xl h-10 w-10">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.section>
        
        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center pt-4 pb-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-full">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-foreground font-medium">Drip v1.0.0</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}