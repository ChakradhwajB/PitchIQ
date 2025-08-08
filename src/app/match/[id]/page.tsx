import { getMatch, getMatchShots } from '@/lib/api';
import type { Match as MatchType, Lineup, MatchStats, MatchEvent } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { Clock, Goal, Replace, Square } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import SmartHighlights from '@/components/smart-highlights';
import ShotMap from '@/components/shot-map';

function TeamHeader({ team, goals }: { team: MatchType['teams']['home'], goals: number | null }) {
    return (
        <div className="flex flex-col items-center gap-4 text-center">
            <Image src={team.logo} alt={team.name} width={80} height={80} className="mb-2" data-ai-hint="team logo"/>
            <h2 className="text-2xl font-bold font-headline">{team.name}</h2>
            <p className="text-5xl font-bold text-primary">{goals ?? '-'}</p>
        </div>
    )
}

function LineupDisplay({ lineup }: { lineup?: Lineup }) {
    if (!lineup) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline">{lineup.team.name} ({lineup.formation})</CardTitle>
            </CardHeader>
            <CardContent>
                <h4 className="font-semibold mb-2">Starting XI</h4>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4">
                    {lineup.startXI.map(p => <li key={p.player.id}><span className="text-muted-foreground">{p.player.pos}</span> {p.player.name}</li>)}
                </ul>
                <Separator className="my-2"/>
                <h4 className="font-semibold mb-2">Substitutes</h4>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                     {lineup.substitutes.map(p => <li key={p.player.id}>{p.player.name}</li>)}
                </ul>
            </CardContent>
        </Card>
    )
}

function StatsTable({ stats, homeTeamId, awayTeamId }: { stats: MatchStats[], homeTeamId: number, awayTeamId: number }) {
    const homeStats = stats.find(s => s.team.id === homeTeamId)?.statistics || [];
    const awayStats = stats.find(s => s.team.id === awayTeamId)?.statistics || [];
    
    // Create a unified list of all stat types
    const allStatTypes = [...new Set([...homeStats.map(s => s.type), ...awayStats.map(s => s.type)])];

    return (
         <Card>
            <CardHeader><CardTitle className="font-headline text-xl">Match Statistics</CardTitle></CardHeader>
            <CardContent>
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

function Timeline({ events, homeTeamId }: { events: MatchEvent[], homeTeamId: number}) {
    const sortedEvents = [...events].sort((a, b) => a.time.elapsed - b.time.elapsed);

    return (
        <div className="relative pt-4">
             <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-border"></div>
            {sortedEvents.map((event, i) => {
                const isHomeEvent = event.team.id === homeTeamId;
                return (
                    <div key={i} className="relative flex items-center mb-8">
                        {isHomeEvent ? (
                            <>
                                <div className="flex-1 text-right pr-12">
                                     <div className="p-3 rounded-lg bg-card shadow-sm inline-block text-left">
                                        <p className="font-semibold">{event.player.name}</p>
                                        <p className="text-xs font-bold text-muted-foreground">{event.team.name}</p>
                                        <p className="text-xs text-muted-foreground">{event.detail}</p>
                                    </div>
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 bg-background border-2 border-primary rounded-full p-1 z-10">
                                    <EventIcon event={event} />
                                </div>
                                <div className="flex-1 pl-12">
                                    <div className="font-bold text-lg w-10 text-center">{event.time.elapsed}'</div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex-1 text-right pr-12">
                                     <div className="font-bold text-lg w-10 text-center ml-auto">{event.time.elapsed}'</div>
                                </div>
                                 <div className="absolute left-1/2 -translate-x-1/2 bg-background border-2 border-primary rounded-full p-1 z-10">
                                    <EventIcon event={event} />
                                </div>
                                <div className="flex-1 pl-12">
                                    <div className="p-3 rounded-lg bg-card shadow-sm inline-block text-left">
                                        <p className="font-semibold">{event.player.name}</p>
                                        <p className="text-xs font-bold text-muted-foreground">{event.team.name}</p>
                                        <p className="text-xs text-muted-foreground">{event.detail}</p>
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
  const [match, shots] = await Promise.all([
    getMatch(params.id),
    getMatchShots(params.id)
  ]);

  if (!match) {
    notFound();
  }

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
                {/* Timeline */}
                 <Card>
                    <CardHeader><CardTitle className="font-headline text-xl">Match Timeline</CardTitle></CardHeader>
                    <CardContent>
                        <Timeline events={match.events} homeTeamId={match.teams.home.id} />
                    </CardContent>
                </Card>
                {/* Shot Map */}
                <Card>
                    <CardHeader><CardTitle className="font-headline text-xl">Shot Map</CardTitle></CardHeader>
                    <CardContent>
                       <ShotMap shots={shots} homeTeamId={match.teams.home.id} awayTeamId={match.teams.away.id} />
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8">
                {/* Smart Highlights */}
                <SmartHighlights matchStatistics={JSON.stringify(match, null, 2)} />

                {/* Match Stats */}
                <StatsTable stats={match.statistics} homeTeamId={match.teams.home.id} awayTeamId={match.teams.away.id} />
            </div>
        </div>

        {/* Lineups */}
        <Card className="mt-8">
            <CardHeader><CardTitle className="font-headline text-2xl">Lineups</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <LineupDisplay lineup={match.lineups[0]} />
                <LineupDisplay lineup={match.lineups[1]} />
            </CardContent>
        </Card>
    </div>
  );
}
