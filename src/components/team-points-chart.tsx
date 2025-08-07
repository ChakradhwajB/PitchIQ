'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { Standing } from '@/lib/types';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';


interface TeamPointsChartProps {
  standings: Standing[];
}

const chartConfig = {
  win: {
    label: "Wins",
    color: "hsl(var(--chart-2))",
  },
  draw: {
    label: "Draws",
    color: "hsl(var(--chart-4))",
  },
  lose: {
    label: "Losses",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export default function TeamPointsChart({ standings }: TeamPointsChartProps) {
  const chartData = standings
    .map((s) => ({
      name: s.team.name,
      win: s.all.win,
      draw: s.all.draw,
      lose: s.all.lose,
      points: s.points,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  return (
    <div className="h-[400px] w-full">
       <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" stackOffset="expand" margin={{ left: 25, right: 10 }}>
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
                    content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="win" stackId="a" fill="var(--color-win)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="draw" stackId="a" fill="var(--color-draw)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="lose" stackId="a" fill="var(--color-lose)" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
       </ChartContainer>
    </div>
  );
}
