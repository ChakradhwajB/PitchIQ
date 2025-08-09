import { getMatch } from '@/lib/api';
import type { Match as MatchType, Lineup, MatchStats, MatchEvent, LineupPlayer } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { Clock, Goal, Replace, Square, Users, Trophy, Shirt } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

function TeamHeader({ team, goals }: { team: MatchType['teams']['home'], goals: number | null }) {
    return (
        <div className="flex flex-col items-center gap-4 text-center">
            <Image src={team.logo} alt={team.name} width={80} height={80} className="mb-2" data-ai-hint="team logo"/>
            <h2 className="text-2xl font-bold font-headline">{team.name}</h2>
            <p className="text-5xl font-bold text-primary">{goals ?? '-'}</p>
        </div>
    )
}

function StartingLineup({ lineup }: { lineup: Lineup }) {
    return (
        <div>
            <h3 className="font-bold text-lg mb-2 text-center font-headline">{lineup.team.name}</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">{lineup.formation}</p>
            <ul className="space-y-3">
                {lineup.startXI.map(({ player }) => (
                    <li key={player.id} className="flex items-center gap-3 text-sm">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center text-xs">{player.number}</Badge>
                         <Link href={`/player/${player.id}`} className="font-medium hover:text-primary transition-colors hover:underline">
                            {player.name}
                        </Link>
                        <span className="text-muted-foreground ml-auto">{player.pos}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function SubstitutesList({ lineup }: { lineup?: Lineup }) {
    if (!lineup || !lineup.substitutes) return null;

    return (
        <div className="p-4">
            <h3 className="font-bold text-lg mb-2 text-center font-headline">{lineup.team.name}</h3>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                 {lineup.substitutes.map(p => (
                    <li key={p.player.id}>
                        <Link href={`/player/${p.player.id}`} className="hover:text-primary transition-colors hover:underline">
                            {p.player.name}
                        </Link>
                    </li>
                 ))}
            </ul>
        </div>
    );
}

function StatsTable({ stats, homeTeamId, awayTeamId }: { stats: MatchStats[], homeTeamId: string, awayTeamId: string }) {
    const homeStats = stats.find(s => s.team.id === homeTeamId)?.statistics || [];
    const awayStats = stats.find(s => s.team.id === awayTeamId)?.statistics || [];
    
    // Create a unified list of all stat types
    const allStatTypes = [...new Set([...homeStats.map(s => s.type), ...awayStats.map(s => s.type)])];

    return (
         <Card>
            <CardHeader><CardTitle className="font-headline text-xl">Match Statistics</CardTitle></CardHeader>
            <CardContent>
                { allStatTypes.length > 0 ? (
                    <div className="space-y-2">
                    {allStatTypes.map(type => {
                        const homeStat = homeStats.find(s => s.type === type)?.value ?? '0';
                        const awayStat = awayStats.find(s => s.type === type)?.value ?? '0';
                        const homeVal = parseInt(String(homeStat).replace('%','')) || 0;
                        const awayVal = parseInt(String(awayStat).replace('%','')) || 0;
                        const total = homeVal + awayVal;

                        return (
                            <div key={type}>
                                <div className="flex justify-between items-center text-sm font-medium mb-1">
                                    <span>{homeStat}</span>
                                    <span className="text-muted-foreground">{type}</span>
                                    <span>{awayStat}</span>
                                </div>
                                <div className="w-full bg-accent rounded-full h-2.5">
                                    <div className="bg-primary h-2.5 rounded-l-full" style={{ width: `${total > 0 ? (homeVal / total) * 100 : 50}%` }}></div>
                                </div>
                            </div>
                        )
                    })}
                    </div>
                 ) : (
                    <p className="text-muted-foreground text-center">Detailed match statistics are not available for this game.</p>
                )}
            </CardContent>
        </Card>
    )
}

function EventIcon({ event }: {event: MatchEvent}) {
    switch(event.type) {
        case 'Goal': return <Goal className="w-5 h-5 text-green-500"/>
        case 'Card': return <Square className={`w-5 h-5 ${event.detail === 'Yellow Card' ? 'text-yellow-400 fill-yellow-400' : 'text-red-600 fill-red-600' }`} />
        case 'subst': return <Replace className="w-5 h-5 text-blue-500" />
        default: return null
    }
}

function Timeline({ events, homeTeamId }: { events: MatchEvent[], homeTeamId: string}) {
    if (!events || events.length === 0) {
        return <p className="text-muted-foreground text-center">No timeline events available.</p>
    }
    const sortedEvents = [...events].sort((a, b) => Number(a.time.elapsed) - Number(b.time.elapsed));

    return (
        <div className="relative pt-4">
             <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-border"></div>
            {sortedEvents.map((event, i) => {
                const isHomeEvent = event.team.id === homeTeamId;
                const detailText = event.detail === 'Normal Goal' ? 'Goal' : event.detail;
                return (
                    <div key={i} className="relative flex items-center mb-8">
                        {isHomeEvent ? (
                            <>
                                <div className="flex-1 text-right pr-12">
                                     <div className="p-3 rounded-lg bg-card shadow-sm inline-block text-left">
                                        <p className="font-semibold">
                                            <Link href={`/player/${event.player.id}`} className="hover:text-primary transition-colors hover:underline">
                                                {event.player.name}
                                            </Link>
                                        </p>
                                        <p className="text-xs font-bold text-muted-foreground">{event.team.name}</p>
                                        <p className="text-xs text-muted-foreground">{detailText}</p>
                                    </div>
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 bg-background border-2 border-primary rounded-full p-1 z-10">
                                    <EventIcon event={event} />
                                </div>
                                <div className="w-1/2 pl-12 flex justify-start">
                                    <div className="font-bold text-lg w-10 text-center">{event.time.elapsed}'</div>
                                </div>
                            </>
                        ) : (
                            <>
                                 <div className="w-1/2 pr-12 flex justify-end">
                                     <div className="font-bold text-lg w-10 text-center">{event.time.elapsed}'</div>
                                </div>
                                 <div className="absolute left-1/2 -translate-x-1/2 bg-background border-2 border-primary rounded-full p-1 z-10">
                                    <EventIcon event={event} />
                                </div>
                                <div className="flex-1 pl-12">
                                    <div className="p-3 rounded-lg bg-card shadow-sm inline-block text-left">
                                        <p className="font-semibold">
                                             <Link href={`/player/${event.player.id}`} className="hover:text-primary transition-colors hover:underline">
                                                {event.player.name}
                                            </Link>
                                        </p>
                                        <p className="text-xs font-bold text-muted-foreground">{event.team.name}</p>
                                        <p className="text-xs text-muted-foreground">{detailText}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    )
}

export default async function MatchPage({ params }: { params: { id: string } }) {
  const match = await getMatch(params.id);

  if (!match) {
    notFound();
  }
  
  const homeLineup = match.lineups.find(l => l.team.id === match.teams.home.id);
  const awayLineup = match.lineups.find(l => l.team.id === match.teams.away.id);

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Score Header */}
        <Card className="mb-8 shadow-lg rounded-xl">
            <CardContent className="p-8">
                <div className="flex justify-around items-center">
                    <TeamHeader team={match.teams.home} goals={match.goals.home} />
                    <div className="text-center text-muted-foreground">
                        <p>{match.league.name}</p>
                        <p className="text-sm">{new Date(match.fixture.date).toLocaleDateString()}</p>
                        <Badge variant="outline" className="mt-2">Finished</Badge>
                    </div>
                    <TeamHeader team={match.teams.away} goals={match.goals.away} />
                </div>
            </CardContent>
        </Card>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                 {/* Lineups */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl flex items-center gap-2">
                            <Shirt className="w-5 h-5" />
                            Starting Lineups
                        </CardTitle>
                    </CardHeader>
                     <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 divide-y md:divide-y-0 md:divide-x">
                        {homeLineup && homeLineup.startXI.length > 0 ? (
                           <div className="p-4"><StartingLineup lineup={homeLineup} /></div>
                        ) : <p className="text-muted-foreground p-4">Home lineup not available.</p>}
                        {awayLineup && awayLineup.startXI.length > 0 ? (
                            <div className="p-4"><StartingLineup lineup={awayLineup} /></div>
                        ) : <p className="text-muted-foreground p-4">Away lineup not available.</p>}
                    </CardContent>
                </Card>

                 {/* Substitutes */}
                <Card>
                    <CardHeader><CardTitle className="font-headline text-xl flex items-center gap-2">
                        <Users className="w-5 h-5"/>
                        Substitutes
                    </CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x">
                       {homeLineup && homeLineup.substitutes.length > 0 ? (
                            <SubstitutesList lineup={homeLineup} />
                       ) : <p className="text-muted-foreground text-center p-4">No substitutes listed for home team.</p>}
                       {awayLineup && awayLineup.substitutes.length > 0 ? (
                            <SubstitutesList lineup={awayLineup} />
                       ) : <p className="text-muted-foreground text-center p-4">No substitutes listed for away team.</p>}
                    </CardContent>
                </Card>

                {/* Timeline */}
                 <Card>
                    <CardHeader><CardTitle className="font-headline text-xl">Match Timeline</CardTitle></CardHeader>
                    <CardContent>
                        <Timeline events={match.events} homeTeamId={match.teams.home.id} />
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8">
                {/* Match Stats */}
                <StatsTable stats={match.statistics} homeTeamId={match.teams.home.id} awayTeamId={match.teams.away.id} />
            </div>
        </div>
    </div>
  );
}
