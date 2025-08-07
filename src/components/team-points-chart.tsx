'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { Standing } from '@/lib/types';
import { ChartTooltipContent, ChartTooltip } from '@/components/ui/chart';


interface TeamPointsChartProps {
  standings: Standing[];
}

export default function TeamPointsChart({ standings }: TeamPointsChartProps) {
  const chartData = standings
    .map((s) => ({
      name: s.team.name,
      points: s.points,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 10); // Show top 10 for clarity

  return (
    <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 25, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fillOpacity: 0.8 }}
                    width={100}
                />
                 <Tooltip
                    cursor={{ fill: 'hsl(var(--accent))' }}
                    content={<ChartTooltipContent />}
                />
                <Bar dataKey="points" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
}
