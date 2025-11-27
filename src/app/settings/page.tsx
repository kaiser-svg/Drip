"use client";

import { useHydration } from "@/hooks/useHydration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Download, Moon, Sun, Monitor, Trash2, Bell, BellOff } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { requestNotificationPermission } from "@/lib/notifications";
import { toast } from "sonner";

export default function SettingsPage() {
  const { settings, updateGoal, history, updateSettings } = useHydration();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [customGoal, setCustomGoal] = useState(settings.dailyGoal.toString());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Sync local state with global settings when loaded
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
    // Update state immediately for better UX
    updateSettings({ remindersEnabled: checked });
    
    if (checked && notificationPermission !== "granted") {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      
      if (permission === "granted") {
        toast.success("Reminders enabled! You'll receive notifications throughout the day.");
      } else {
        // Revert if permission denied
        updateSettings({ remindersEnabled: false });
        toast.error("Please allow notifications in your browser settings to enable reminders.");
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
      toast.success("Smart schedule enabled! Reminders will adapt to your drinking patterns.");
    } else {
      toast.info("Using regular reminder schedule");
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
    
    toast.success("Data exported successfully!");
  };

  const clearData = () => {
    const totalDays = Object.keys(history).length;
    const message = totalDays > 0 
      ? `This will delete ${totalDays} days of history. This cannot be undone.`
      : "This will clear all data. This cannot be undone.";
    
    // Using a custom confirmation since we can't use window.confirm in iframe
    const confirmed = window.confirm(message);
    if (confirmed) {
      localStorage.removeItem('drip-hydration-data');
      toast.success("All data cleared");
      window.location.reload();
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="p-4 sticky top-0 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="-ml-2 rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-8 pb-20">
        
        {/* Goal Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Goals</h2>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="daily-goal">Daily Hydration Goal (ml)</Label>
              <div className="flex gap-2">
                <Input 
                  id="daily-goal" 
                  type="number" 
                  value={customGoal} 
                  onChange={handleGoalChange}
                  className="text-lg"
                />
                <Button onClick={saveGoal} disabled={parseInt(customGoal) === settings.dailyGoal}>Save</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: 2000-3000ml depending on activity level.
              </p>
            </div>
          </div>
        </section>

        {/* Reminder Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Reminders</h2>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm space-y-4">
            {/* Notification Permission Status */}
            {notificationPermission !== "granted" && settings.remindersEnabled && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-start gap-2">
                <BellOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800 dark:text-yellow-200">
                  <p className="font-semibold mb-1">Notifications are blocked</p>
                  <p>Please enable notifications in your browser settings to receive reminders.</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Daily Reminders
                </Label>
                <p className="text-xs text-muted-foreground">Get notified to drink water throughout the day</p>
              </div>
              <Switch 
                checked={settings.remindersEnabled} 
                onCheckedChange={handleRemindersToggle}
              />
            </div>
            
            <div className="flex items-center justify-between">
               <div className="space-y-0.5">
                <Label className="text-base">Smart Schedule</Label>
                <p className="text-xs text-muted-foreground">Adapt reminders to your drinking habits</p>
              </div>
              <Switch 
                checked={settings.smartSchedule}
                onCheckedChange={handleSmartScheduleToggle}
                disabled={!settings.remindersEnabled}
              />
            </div>

            {settings.remindersEnabled && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-muted-foreground">
                  {settings.smartSchedule 
                    ? "💡 Smart reminders are personalized based on your drinking patterns over the last 2 weeks."
                    : "⏰ You'll receive regular reminders every 2 hours from 8am to 8pm."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Appearance Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Appearance</h2>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'} 
                  className="flex flex-col h-20 gap-2"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="w-6 h-6" />
                  <span className="text-xs">Light</span>
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  className="flex flex-col h-20 gap-2"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="w-6 h-6" />
                  <span className="text-xs">Dark</span>
                </Button>
                <Button 
                  variant={theme === 'system' ? 'default' : 'outline'} 
                  className="flex flex-col h-20 gap-2"
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="w-6 h-6" />
                  <span className="text-xs">System</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Data</h2>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Export Data</Label>
                <p className="text-xs text-muted-foreground">Download your history as JSON</p>
              </div>
              <Button variant="outline" size="icon" onClick={exportData}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
            <hr className="border-zinc-100 dark:border-zinc-800" />
            <div className="flex items-center justify-between">
               <div className="space-y-0.5">
                <Label className="text-base text-destructive">Clear History</Label>
                <p className="text-xs text-muted-foreground">Delete all stored data</p>
              </div>
              <Button variant="destructive" size="icon" onClick={clearData}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
        
        <div className="text-center pt-8">
           <p className="text-xs text-muted-foreground">Drip v1.0.0</p>
           <p className="text-xs text-muted-foreground mt-1">Stay hydrated 💧</p>
        </div>

      </main>
    </div>
  );
}