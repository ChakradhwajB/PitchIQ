

'use client';

import type { Lineup } from '@/lib/types';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface LineupDiagramProps {
  lineup: Lineup;
}

const positionMap: { [key: string]: string } = {
    G: 'Goalkeeper',
    D: 'Defender',
    M: 'Midfielder',
    F: 'Forward',
};

const PitchSVG = () => (
    <svg viewBox="0 0 105 68" className="w-full h-auto bg-green-700/20 border-2 border-white/20 rounded-lg">
        {/* Outlines */}
        <rect x="0" y="0" width="105" height="68" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="0.5" />
        {/* Center line */}
        <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="white" strokeOpacity="0.3" strokeWidth="0.5" />
        {/* Center circle */}
        <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="0.5" />
         {/* Penalty Area */}
        <rect x="0" y="13.84" width="16.5" height="40.32" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="0.5" />
         {/* Goal Area */}
        <rect x="0" y="24.84" width="5.5" height="18.32" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="0.5" />
    </svg>
);

const getPositionCoords = (grid: string, formation: string, isHome: boolean) => {
    if (!grid) return { x: 50, y: 50 };

    const [row, col] = grid.split(':').map(Number);
    
    // Normalize formation to array of numbers
    const formationParts = formation.split('-').map(Number);
    const totalLines = formationParts.length + 2; // Goalkeeper, defense, midfield, attack

    let x, y;

    // Y position based on row (goalkeeper, defense, midfield, attack)
    const yPositions = [5, 20, 45, 70, 90]; // Goalkeeper, Defenders, Midfielders, Forwards, Extra Forwards
    y = yPositions[row - 1] || 50;

    // X position based on column and number of players in that line
    let playersInLine = 1;
    if (row === 1) { // Goalkeeper
        playersInLine = 1;
    } else if (row > 1 && row - 2 < formationParts.length) {
        playersInLine = formationParts[row - 2];
    }
    
    const xOffset = 100 / (playersInLine + 1);
    x = col * xOffset;

    // Flip for away team
    if (!isHome) {
        y = 100 - y;
    }

    return { x: x, y: y };
};

export default function LineupDiagram({ lineup }: LineupDiagramProps) {
  // Simple heuristic for home/away, can be improved.
  // Assuming the first player (goalie) for home team is on the left side.
  const firstPlayerGrid = lineup.startXI[0]?.player.grid;
  const isHome = firstPlayerGrid ? parseInt(firstPlayerGrid.split(':')[1]) <= 5 : true;

  return (
     <div className="text-center">
        <h3 className="font-bold font-headline text-lg">{lineup.team.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{lineup.formation}</p>
        <TooltipProvider>
            <div className="relative w-full aspect-[105/68]">
                <div className="absolute inset-0">
                    <PitchSVG />
                </div>
                <div className="absolute inset-0">
                    {lineup.startXI.map(({ player }) => {
                        if (!player.grid) return null;
                        const { x, y } = getPositionCoords(player.grid, lineup.formation, isHome);
                        
                        return (
                            <Tooltip key={player.id}>
                                <TooltipTrigger asChild>
                                    <div
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                        style={{ left: `${y}%`, top: `${x}%` }}
                                    >
                                       <Link href={`/player/${player.id}`} className="flex flex-col items-center group">
                                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold border-2 border-white shadow-lg group-hover:scale-110 transition-transform">
                                                {player.pos}
                                            </div>
                                            <span className="text-xs mt-1 px-2 py-0.5 bg-background/80 rounded-md truncate max-w-20">{player.name.split(' ').pop()}</span>
                                        </Link>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold">{player.name}</p>
                                    <p>Position: {positionMap[player.pos] || player.pos}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </div>
        </TooltipProvider>
    </div>
  );
}
