
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Standing } from '@/lib/types';
import FormGuide from './form-guide';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StandingsTableProps {
  standings: Standing[];
}

export default function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center">#</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-center">P</TableHead>
            <TableHead className="text-center">W</TableHead>
            <TableHead className="text-center">D</TableHead>
            <TableHead className="text-center">L</TableHead>
            <TableHead className="text-center">GD</TableHead>
            <TableHead className="text-center">Pts</TableHead>
            <TableHead className="text-right pr-4">Form</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TooltipProvider>
            {standings.map((s) => (
              <TableRow key={s.team.id}>
                <TableCell className="text-center font-medium text-muted-foreground">{s.rank}</TableCell>
                <TableCell>
                  <Link href={`/team/${s.team.id}`} className="flex items-center gap-3 group">
                    <Image
                      src={s.team.logo}
                      alt={`${s.team.name} logo`}
                      width={24}
                      height={24}
                      className="transition-transform group-hover:scale-110"
                      data-ai-hint="team logo"
                    />
                    <span className="font-medium group-hover:text-primary transition-colors">{s.team.name}</span>
                  </Link>
                </TableCell>
                <TableCell className="text-center">
                    <Tooltip>
                        <TooltipTrigger>{s.all.played}</TooltipTrigger>
                        <TooltipContent><p>Played</p></TooltipContent>
                    </Tooltip>
                </TableCell>
                <TableCell className="text-center">
                    <Tooltip>
                        <TooltipTrigger>{s.all.win}</TooltipTrigger>
                        <TooltipContent><p>Wins</p></TooltipContent>
                    </Tooltip>
                </TableCell>
                 <TableCell className="text-center">
                    <Tooltip>
                        <TooltipTrigger>{s.all.draw}</TooltipTrigger>
                        <TooltipContent><p>Draws</p></TooltipContent>
                    </Tooltip>
                </TableCell>
                 <TableCell className="text-center">
                    <Tooltip>
                        <TooltipTrigger>{s.all.lose}</TooltipTrigger>
                        <TooltipContent><p>Losses</p></TooltipContent>
                    </Tooltip>
                </TableCell>
                <TableCell className="text-center">
                    <Tooltip>
                        <TooltipTrigger>{s.goalsDiff}</TooltipTrigger>
                        <TooltipContent><p>Goal Difference</p></TooltipContent>
                    </Tooltip>
                </TableCell>
                <TableCell className="text-center font-bold">{s.points}</TableCell>
                <TableCell className="text-right pr-4">
                  <FormGuide form={s.form} />
                </TableCell>
              </TableRow>
            ))}
          </TooltipProvider>
        </TableBody>
      </Table>
    </div>
  );
}
