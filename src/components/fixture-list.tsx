'use client';

import type { Fixture } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface FixtureListProps {
    fixtures: Fixture[];
}

export default function FixtureList({ fixtures }: FixtureListProps) {
    if (fixtures.length === 0) {
        return <p>No fixtures found for this stage.</p>
    }

    return (
        <div className="space-y-4">
            {fixtures.map((fixture) => (
                 <Link href={`/match/${fixture.id}`} key={fixture.id} className="block p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="flex flex-col items-end gap-2">
                               <div className="flex items-center gap-2">
                                   <span className="font-medium text-right w-32 truncate">{fixture.teams.home.name}</span>
                                   <Image src={fixture.teams.home.logo} alt={fixture.teams.home.name} width={24} height={24} data-ai-hint="team logo" />
                               </div>
                               <div className="flex items-center gap-2">
                                   <span className="font-medium text-right w-32 truncate">{fixture.teams.away.name}</span>
                                   <Image src={fixture.teams.away.logo} alt={fixture.teams.away.name} width={24} height={24} data-ai-hint="team logo" />
                               </div>
                           </div>
                           <div className="flex flex-col items-center border-l border-r px-4">
                                <span className="font-bold text-lg">{fixture.goals.home ?? '-'}</span>
                                <span className="font-bold text-lg">{fixture.goals.away ?? '-'}</span>
                           </div>
                        </div>
                        <div className="text-right">
                           <Badge variant={fixture.status === 'Match Finished' ? 'secondary' : 'outline'}>{fixture.status}</Badge>
                           <p className="text-xs text-muted-foreground mt-1">{new Date(fixture.date).toLocaleString()}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
