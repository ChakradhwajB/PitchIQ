
'use client';

import * as React from 'react';
import { getPlayer, getPlayerHeatmap } from '@/lib/api';
import type { Player as PlayerType, PlayerStats, HeatmapPoint } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Flag, Calendar, BarChart, Zap, Clock, Shield, Target, Award, ArrowRightCircle, Trophy, Shirt, BookOpen, ExternalLink, Star, Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import PlayerHeatmap from '@/components/player-heatmap';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
                    {stats.league.logo ? (
                        <Image src={stats.league.logo} alt={stats.league.name} width={24} height={24} data-ai-hint="league logo"/>
                    ) : (
                        <Trophy className="w-6 h-6" />
                    )}
                    {stats.league.name}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> <strong>Apps:</strong> {stats.games.appearences || 'N/A'}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> <strong>Mins:</strong> {stats.games.minutes || 'N/A'}</div>
                <div className="flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> <strong>Goals:</strong> {stats.goals.total || 'N/A'}</div>
                <div className="flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> <strong>Assists:</strong> {stats.goals.assists ?? 'N/A'}</div>
                <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> <strong>Position:</strong> {stats.games.position}</div>
            </CardContent>
        </Card>
    )
}

function ProFeatureCallout() {
    return (
        <Card className="shadow-lg rounded-xl bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Player Heatmap
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                 <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
                    <Lock className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">See where a player has the most impact on the pitch. Upgrade to Pro to unlock this feature.</p>
                <Button asChild>
                    <Link href="/pricing">Upgrade to Pro</Link>
                </Button>
            </CardContent>
        </Card>
    )
}

function PageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-48 w-full mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="space-y-8">
                    <Skeleton className="h-72 w-full" />
                </div>
            </div>
        </div>
    )
}


export default function PlayerPage({ params }: { params: { id: string } }) {
  const { isProUser } = useAuth();
  const [player, setPlayer] = React.useState<PlayerType | null>(null);
  const [heatmapPoints, setHeatmapPoints] = React.useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPlayerData() {
        setLoading(true);
        try {
            const [playerData, heatmapData] = await Promise.all([
                getPlayer(params.id),
                getPlayerHeatmap(params.id),
            ]);
            setPlayer(playerData || null);
            setHeatmapPoints(heatmapData);
        } catch (error) {
            console.error("Failed to fetch player data:", error);
            setPlayer(null);
        } finally {
            setLoading(false);
        }
    }
    fetchPlayerData();
  }, [params.id]);


  if (loading) {
    return <PageSkeleton />;
  }

  if (!player) {
    return <div className="text-center py-12">Player not found.</div>;
  }

  const currentTeam = player.statistics?.[0]?.team;

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
                        className="rounded-full border-4 border-background object-cover shadow-2xl bg-white"
                        data-ai-hint="player photo"
                    />
                    {currentTeam?.logo && (
                     <Image
                        src={currentTeam.logo}
                        alt={currentTeam.name}
                        width={48}
                        height={48}
                        className="absolute bottom-0 right-0 rounded-full border-2 border-background bg-white p-1"
                        data-ai-hint="team logo"
                    />
                    )}
                    {player.number && (
                        <div className="absolute top-0 right-0 flex items-center justify-center w-10 h-10 bg-background rounded-full font-bold text-lg text-primary border-2 border-primary">
                            {player.number}
                        </div>
                    )}
                </div>
                <div className="text-center md:text-left text-primary-foreground">
                    <h1 className="text-4xl font-headline font-bold">{player.name}</h1>
                    <Badge variant="secondary" className="mt-2 text-lg">{player.position}</Badge>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2"><User className="w-4 h-4"/>Age: {player.age}</div>
                        <div className="flex items-center gap-2"><Flag className="w-4 h-4"/>{player.nationality}</div>
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/>Height: {player.height || 'N/A'}</div>
                        <div className="flex items-center gap-2"><BarChart className="w-4 h-4"/>Weight: {player.weight || 'N/A'}</div>
                    </div>
                </div>
            </div>
        </Card>
        
        {player.transfermarket_id && (
            <Card className="mb-8">
                <CardContent className="p-4">
                    <Link href={`https://www.transfermarkt.com/spieler/profil/spieler/${player.transfermarket_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm font-medium hover:text-primary transition-colors">
                        View on Transfermarkt
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {player.description && (
                    <Card className="shadow-lg rounded-xl">
                        <CardHeader><CardTitle className="font-headline text-2xl flex items-center gap-2"><BookOpen /> Biography</CardTitle></CardHeader>
                        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                            <p>{player.description}</p>
                        </CardContent>
                    </Card>
                )}

                <Card className="shadow-lg rounded-xl">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {player.statistics && player.statistics.length > 0 ? player.statistics.map((stats, idx) => (
                           <PlayerStatBreakdown key={idx} stats={stats} />
                        )) : (
                            <p className="text-muted-foreground">Statistics for this player are not available.</p>
                        )}
                    </CardContent>
                </Card>

                { isProUser ? (
                    <Card className="shadow-lg rounded-xl">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Player Heatmap</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PlayerHeatmap points={heatmapPoints} />
                        </CardContent>
                    </Card>
                ) : (
                    <ProFeatureCallout />
                )}
            </div>
            
            <div className="space-y-8">
                <Card className="shadow-lg rounded-xl">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Career History</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {player.career && player.career.length > 0 ? (
                            <ul className="space-y-4">
                                {/* Current Team is first in career array */}
                                {player.career.map((club, idx) => (
                                    <li key={idx} className={`flex items-center gap-4 ${idx > 0 ? 'opacity-70' : ''}`}>
                                        <Image src={club.team.logo} alt={club.team.name} width={40} height={40} data-ai-hint="team logo" className="bg-white rounded-full p-1"/>
                                        <div>
                                            <p className="font-bold">{club.team.name}</p>
                                            <p className="text-sm text-muted-foreground">{club.start} - {club.end || 'Present'}</p>
                                        </div>
                                         {idx === 0 && <ArrowRightCircle className="ml-auto h-5 w-5 text-primary" />}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">Career history is not available.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
