'use client';

import type { HeatmapPoint } from '@/lib/types';

const PitchSVG = () => (
    <svg viewBox="0 0 105 68" className="w-full h-auto bg-green-700/10 border-2 border-white/20 rounded-lg">
        {/* Outlines */}
        <rect x="0" y="0" width="105" height="68" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="0.5" />
        {/* Center line */}
        <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="white" strokeOpacity="0.3" strokeWidth="0.5" />
        {/* Center circle */}
        <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="0.5" />
    </svg>
);


export default function PlayerHeatmap({ points }: { points: HeatmapPoint[] }) {
    if (!points || points.length === 0) {
        return (
             <div className="relative aspect-video w-full bg-green-600/10 rounded-lg p-4 border-2 border-dashed border-muted">
                <p className="text-center text-muted-foreground m-auto">No heatmap data available for this player.</p>
            </div>
        )
    }

    return (
        <div className="relative w-full aspect-[105/68]">
            <div className="absolute inset-0">
                <PitchSVG />
            </div>
            <svg viewBox="0 0 105 68" className="absolute inset-0 w-full h-full">
                <defs>
                    <radialGradient id="heatGradient">
                        <stop offset="0%" stopColor="rgba(255, 255, 0, 0.5)" />
                        <stop offset="50%" stopColor="rgba(255, 165, 0, 0.3)" />
                        <stop offset="100%" stopColor="rgba(255, 0, 0, 0)" />
                    </radialGradient>
                </defs>
                {points.map((point, index) => (
                    <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r={12} // Radius of the heat spot
                        fill="url(#heatGradient)"
                        style={{ mixBlendMode: 'screen' }}
                    />
                ))}
            </svg>
        </div>
    );
}
