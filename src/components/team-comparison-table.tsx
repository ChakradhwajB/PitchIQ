
'use client';

import type { Standing } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TeamComparisonTableProps {
  currentStandings: Standing[];
  previousStandings: Standing[];
}

interface ComparisonData {
  team: {
    id: string;
    name: string;
    logo: string;
  };
  currentPoints: number;
  previousPoints: number | null;
  difference: number | null;
}

export default function TeamComparisonTable({ currentStandings, previousStandings }: TeamComparisonTableProps) {
  if (currentStandings.length === 0 || previousStandings.length === 0) {
    return null; // Don't render if we don't have both sets of data
  }

  const prevStandingsMap = new Map<string, number>();
  previousStandings.forEach(s => {
    prevStandingsMap.set(s.team.id, s.points);
  });

  const topThreeStandings = currentStandings.filter(s => s.rank <= 3);

  const comparisonData: ComparisonData[] = topThreeStandings
    .map(current => {
      const previousPoints = prevStandingsMap.get(current.team.id) ?? null;
      return {
        team: current.team,
        currentPoints: current.points,
        previousPoints: previousPoints,
        difference: previousPoints !== null ? current.points - previousPoints : null,
      };
    })
    .filter(data => data.previousPoints !== null); // Only include teams present in both seasons
    // Keep original rank order, no need to sort by difference


  if (comparisonData.length === 0) {
      return (
         <Card className="shadow-lg rounded-xl">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Season Comparison</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm">Not enough data to compare with the previous season.</p>
            </CardContent>
         </Card>
      )
  }

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Top 3 Year-over-Year</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">Current</TableHead>
              <TableHead className="text-center">Prev</TableHead>
              <TableHead className="text-center">+/-</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisonData.map(data => (
              <TableRow key={data.team.id}>
                <TableCell>
                  <Link href={`/team/${data.team.id}`} className="flex items-center gap-3 group">
                    <Image
                      src={data.team.logo}
                      alt={`${data.team.name} logo`}
                      width={24}
                      height={24}
                      className="transition-transform group-hover:scale-110"
                      data-ai-hint="team logo"
                    />
                    <span className="font-medium group-hover:text-primary transition-colors text-xs sm:text-sm truncate">
                      {data.team.name}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="text-center font-bold">{data.currentPoints}</TableCell>
                <TableCell className="text-center text-muted-foreground">{data.previousPoints}</TableCell>
                <TableCell className="text-center">
                  {data.difference !== null && (
                    <span
                      className={cn('flex items-center justify-center gap-1 font-bold', {
                        'text-green-500': data.difference > 0,
                        'text-red-500': data.difference < 0,
                        'text-muted-foreground': data.difference === 0,
                      })}
                    >
                      {data.difference > 0 ? <TrendingUp className="w-4 h-4" /> : data.difference < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                      {data.difference > 0 ? `+${data.difference}` : data.difference}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
