"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DayLog, DRINK_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HistoryCalendarProps {
  history: Record<string, DayLog>;
}

export function HistoryCalendar({ history }: HistoryCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Helper to check if a day met the goal
  const getDayStatus = (day: Date) => {
    const dateKey = day.toISOString().split('T')[0];
    const log = history[dateKey];
    if (!log) return 'empty';
    
    const total = log.logs.reduce((acc, curr) => {
      const factor = DRINK_TYPES[curr.type]?.hydrationFactor || 1;
      return acc + (curr.amount * factor);
    }, 0);
    
    if (total >= log.goal) return 'goal-met';
    if (total > 0) return 'started';
    return 'empty';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{
              metGoal: (date) => getDayStatus(date) === 'goal-met',
              started: (date) => getDayStatus(date) === 'started',
            }}
            modifiersClassNames={{
              metGoal: "bg-green-100 text-green-900 font-bold dark:bg-green-900 dark:text-green-100",
              started: "bg-blue-50 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100",
            }}
          />
        </CardContent>
      </Card>

      {date && (
        <Card>
           <CardHeader>
             <CardTitle className="text-base">
               {date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </CardTitle>
           </CardHeader>
           <CardContent>
             {(() => {
               const dateKey = date.toISOString().split('T')[0];
               const log = history[dateKey];
               
               if (!log || log.logs.length === 0) {
                 return <p className="text-sm text-muted-foreground text-center py-4">No data for this day.</p>;
               }

               const total = log.logs.reduce((acc, curr) => {
                 const factor = DRINK_TYPES[curr.type]?.hydrationFactor || 1;
                 return acc + (curr.amount * factor);
               }, 0);

               return (
                 <div className="space-y-4">
                   <div className="flex justify-between items-end">
                     <div className="text-2xl font-bold">{Math.round(total)}<span className="text-base font-normal text-muted-foreground">ml</span></div>
                     <div className="text-sm text-muted-foreground">Goal: {log.goal}ml</div>
                   </div>
                   
                   <div className="space-y-2">
                     <h4 className="text-xs font-semibold uppercase text-muted-foreground">Drinks Logged</h4>
                     <div className="space-y-2">
                       {log.logs.map((drink) => {
                          const drinkDef = DRINK_TYPES[drink.type];
                          return (
                            <div key={drink.id} className="flex items-center justify-between text-sm p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span>{drinkDef?.icon || '💧'}</span>
                                <span>{drinkDef?.name || 'Water'}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(drink.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <span className="font-mono font-medium">{drink.amount}ml</span>
                            </div>
                          );
                       })}
                     </div>
                   </div>
                 </div>
               );
             })()}
           </CardContent>
        </Card>
      )}
    </div>
  );
}
