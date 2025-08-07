import { getPlayer, getPlayerHeatmap } from '@/lib/api';
import type { Player as PlayerType, PlayerStats } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { User, Flag, Calendar, BarChart, Zap, Clock, Shield, Target, Award, ArrowRightCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import PlayerHeatmap from '@/components/player-heatmap';

function StatCard({ icon: Icon, title, value }: { icon: React.ElementType, title: string, value: string | number | null }) {
    return (
        <div className="flex items-center gap-4 rounded-lg bg-accent/50 p-4">
            <div className="rounded-full bg-primary/10 p-3">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-xl font-bold">{value ?? 'N/A'}</p>
            </div>
        </div>
    );
}

function PlayerStatBreakdown({ stats }: { stats: PlayerStats }) {
    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Image src={stats.league.logo} alt={stats.league.name} width={24} height={24} data-ai-hint="league logo"/>
                    {stats.league.name}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> <strong>Apps:</strong> {stats.games.appearences}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> <strong>Mins:</strong> {stats.games.minutes}</div>
                <div className="flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> <strong>Goals:</strong> {stats.goals.total}</div>
                <div className="flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> <strong>Assists:</strong> {stats.goals.assists ?? 0}</div>
                <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> <strong>Position:</strong> {stats.games.position}</div>
            </CardContent>
        </Card>
    )
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const [player, heatmapPoints] = await Promise.all([
    getPlayer(params.id),
    getPlayerHeatmap(params.id),
  ]);

  if (!player) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 overflow-hidden rounded-xl shadow-lg">
            <div className="bg-gradient-to-r from-primary/80 to-primary flex flex-col md:flex-row items-center gap-8 p-8">
                <div className="relative">
                    <Image
                        src={player.photo}
                        alt={player.name}
                        width={150}
                        height={150}
                        className="rounded-full border-4 border-background object-cover shadow-2xl"
                        data-ai-hint="player photo"
                    />
                     <Image
                        src={player.statistics[0].team.logo}
                        alt={player.statistics[0].team.name}
                        width={48}
                        height={48}
                        className="absolute bottom-0 right-0 rounded-full border-2 border-background bg-white p-1"
                        data-ai-hint="team logo"
                    />
                </div>
                <div className="text-center md:text-left text-primary-foreground">
                    <h1 className="text-4xl font-headline font-bold">{player.name}</h1>
                    <Badge variant="secondary" className="mt-2 text-lg">{player.position}</Badge>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2"><User className="w-4 h-4"/>Age: {player.age}</div>
                        <div className="flex items-center gap-2"><Flag className="w-4 h-4"/>{player.nationality}</div>
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/>Height: {player.height}</div>
                        <div className="flex items-center gap-2"><BarChart className="w-4 h-4"/>Weight: {player.weight}</div>
                    </div>
                </div>
            </div>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card className="shadow-lg rounded-xl">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {player.statistics.map((stats, idx) => (
                           <PlayerStatBreakdown key={idx} stats={stats} />
                        ))}
                    </CardContent>
                </Card>

                <Card className="shadow-lg rounded-xl">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Player Heatmap</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PlayerHeatmap points={heatmapPoints} />
                    </CardContent>
                </Card>
            </div>
            
            <div className="space-y-8">
                <Card className="shadow-lg rounded-xl">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Career History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {/* Current Team */}
                            <li className="flex items-center gap-4">
                                <Image src={player.statistics[0].team.logo} alt={player.statistics[0].team.name} width={40} height={40} data-ai-hint="team logo"/>
                                <div>
                                    <p className="font-bold">{player.statistics[0].team.name}</p>
                                    <p className="text-sm text-muted-foreground">{player.career?.[0].end ?? '2020'} - Present</p>
                                </div>
                                <ArrowRightCircle className="ml-auto h-5 w-5 text-primary" />
                            </li>
                            <Separator />
                            {/* Past Teams */}
                            {player.career?.map((club, idx) => (
                                <li key={idx} className="flex items-center gap-4 opacity-70">
                                    <Image src={club.team.logo} alt={club.team.name} width={40} height={40} data-ai-hint="team logo"/>
                                    <div>
                                        <p className="font-medium">{club.team.name}</p>
                                        <p className="text-sm text-muted-foreground">{club.start} - {club.end}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
