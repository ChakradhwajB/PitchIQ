
'use client';

import type { Shot } from '@/lib/types';
import Link from 'next/link';

interface ShotMapProps {
  shots: Shot[];
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
}

const shotColors: { [key: string]: { [key: string]: string } } = {
  home: {
    'Goal': 'fill-green-500 stroke-white',
    'Saved': 'fill-yellow-400 stroke-white',
    'Miss': 'fill-red-500 stroke-white',
  },
  away: {
    'Goal': 'fill-green-500 stroke-black',
    'Saved': 'fill-yellow-400 stroke-black',
    'Miss': 'fill-red-500 stroke-black',
  }
};

const PitchSVG = () => (
    <svg viewBox="0 0 105 68" className="w-full h-auto bg-green-600/20 border-2 border-white/50">
        {/* Outlines */}
        <rect x="0" y="0" width="105" height="68" fill="none" stroke="white" strokeWidth="0.5" />
        {/* Center line */}
        <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="white" strokeWidth="0.5" />
        {/* Center circle */}
        <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx="52.5" cy="34" r="0.5" fill="white" />
        {/* Penalty areas */}
        <rect x="0" y="13.84" width="16.5" height="40.32" fill="none" stroke="white" strokeWidth="0.5" />
        <rect x="88.5" y="13.84" width="16.5" height="40.32" fill="none" stroke="white" strokeWidth="0.5" />
        {/* Goal areas */}
        <rect x="0" y="24.84" width="5.5" height="18.32" fill="none" stroke="white" strokeWidth="0.5" />
        <rect x="99.5" y="24.84" width="5.5" height="18.32" fill="none" stroke="white" strokeWidth="0.5" />
        {/* Penalty spots */}
        <circle cx="11" cy="34" r="0.5" fill="white" />
        <circle cx="94" cy="34" r="0.5" fill="white" />
        {/* Arcs */}
        <path d="M 16.5,24.84 A 9.15 9.15 0 0 1 16.5,43.16" fill="none" stroke="white" strokeWidth="0.5" />
        <path d="M 88.5,24.84 A 9.15 9.15 0 0 0 88.5,43.16" fill="none" stroke="white" strokeWidth="0.5" />
        {/* Goals */}
        <rect x="-1" y="30.34" width="1" height="7.32" fill="none" stroke="white" strokeWidth="0.5" />
        <rect x="105" y="30.34" width="1" height="7.32" fill="none" stroke="white" strokeWidth="0.5" />
    </svg>
);


export default function ShotMap({ shots, homeTeam, awayTeam }: ShotMapProps) {
  return (
    <div>
      <div className="relative w-full aspect-[105/68]">
        <div className="absolute inset-0">
          <PitchSVG />
        </div>
        <svg viewBox="0 0 105 68" className="absolute inset-0 w-full h-full">
          {shots.map((shot, index) => {
            const teamType = shot.teamId === homeTeam.id ? 'home' : 'away';
            return (
                <g key={index}>
                <circle
                    cx={shot.x}
                    cy={shot.y}
                    r="1.5"
                    className={`${shotColors[teamType][shot.type]} opacity-90`}
                    strokeWidth="0.3"
                />
                </g>
            )
          })}
        </svg>
      </div>
      <div className="mt-4 flex justify-center gap-6 text-sm text-muted-foreground">
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full' style={{backgroundColor: 'white'}} />
            <span>{homeTeam.name}</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full' style={{backgroundColor: 'black'}}/>
            <span>{awayTeam.name}</span>
          </div>
      </div>
       <div className="mt-4 flex justify-center gap-6 text-sm text-muted-foreground">
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-green-500' />
            <span>Goal</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-yellow-400' />
            <span>Saved</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-red-500' />
            <span>Miss</span>
          </div>
      </div>
    </div>
  );
}
