"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DayLog } from "@/lib/types";
import { getWeeklyData } from "@/lib/stats-utils";
import { useTheme } from "next-themes";

interface WeeklyChartProps {
  history: Record<string, DayLog>;
}

export function WeeklyChart({ history }: WeeklyChartProps) {
  const data = useMemo(() => getWeeklyData(history), [history]);
  
  // Simple way to detect dark mode if next-themes isn't fully set up, 
  // but ideally we use CSS variables or the theme context. 
  // For now, we'll rely on chart customization via Tailwind classes mostly.

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Weekly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis 
                dataKey="dayName" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                contentStyle={{ 
                  backgroundColor: 'var(--popover)', 
                  borderColor: 'var(--border)',
                  color: 'var(--popover-foreground)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.total >= entry.goal ? "var(--primary)" : "var(--chart-1)"}
                    className={entry.total >= entry.goal ? "fill-blue-500 dark:fill-blue-400" : "fill-blue-200 dark:fill-blue-800"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
