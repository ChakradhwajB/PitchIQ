import { getTeam, getTeamPlayers, getTeamFixtures } from '@/lib/api';
import type { Player, Fixture } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Home, Globe, Users, BarChart, Calendar, Trophy, Shield, Target, Plus, Minus, AlertTriangle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

async function StatCard({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string, value: string | number, color?: string }) {
    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className={`h-5 w-5 ${color || 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

export default async function TeamPage({ params }: { params: { id: string } }) {
  const teamData = await getTeam(params.id);
  
  if (!teamData) {
    notFound();
  }
  
  const [players, fixtures] = await Promise.all([
    getTeamPlayers(params.id),
    getTeamFixtures(params.id)
  ]);

  const keyStats = {
    goalsScored: 'N/A', 
    goalsConceded: 'N/A',
    avgPossession: "N/A",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Team Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-6 bg-card rounded-xl shadow-lg">
        <Image
          src={teamData.logo}
          alt={`${teamData.name} logo`}
          width={100}
          height={100}
          className="bg-white p-2 rounded-full shadow-md"
          data-ai-hint="team logo"
        />
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary">{teamData.name}</h1>
          <div className="flex items-center gap-6 mt-2 text-muted-foreground">
            <div className="flex items-center gap-2"><Home className="w-4 h-4"/><span>{teamData.stadium}</span></div>
            <div className="flex items-center gap-2"><Globe className="w-4 h-4"/><span>{teamData.country}</span></div>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="mb-8">
        <h2 className="text-2xl font-headline font-semibold mb-4">Season Snapshot</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={Target} title="Goals Scored" value={keyStats.goalsScored} color="text-green-500" />
            <StatCard icon={Shield} title="Goals Conceded" value={keyStats.goalsConceded} color="text-red-500" />
            <StatCard icon={BarChart} title="Average Possession" value={keyStats.avgPossession} color="text-blue-500" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Note: Detailed season stats are not available in the new API.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Squad List */}
        <div className="lg:col-span-2">
            <Card className="shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><Users /> Current Squad</CardTitle>
                </CardHeader>
                <CardContent>
                    {players.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Player</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Nationality</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {players.map((player: Player) => (
                                    <TableRow key={player.id}>
                                        <TableCell>
                                            <Link href={`/player/${player.id}`} className="flex items-center gap-3 group">
                                                 <Image src={player.photo} alt={player.name} width={32} height={32} className="rounded-full object-cover transition-transform group-hover:scale-110 bg-muted" data-ai-hint="player photo" />
                                                <span className="font-medium group-hover:text-primary">{player.name}</span>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{player.position}</Badge>
                                        </TableCell>
                                        <TableCell>{player.nationality}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <Alert variant="default">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Squad Information Unavailable</AlertTitle>
                            <AlertDescription>
                                We're currently unable to retrieve the squad list for this team due to limitations with our data provider. Please check back later.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Fixtures */}
        <div>
            <Card className="shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><Calendar /> Fixtures & Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {fixtures.map((fixture) => (
                            <Link href={`/match/${fixture.id}`} key={fixture.id} className="block p-3 rounded-lg hover:bg-accent transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Image src={fixture.opponent.logo} alt={fixture.opponent.name} width={24} height={24} data-ai-hint="team logo" className="bg-white rounded-full"/>
                                        <span className="font-medium">{fixture.opponent.name}</span>
                                    </div>
                                    {fixture.type === 'Result' ? (
                                        <div className='flex items-center gap-2'>
                                            <Badge variant={fixture.result === 'W' ? 'default' : fixture.result === 'L' ? 'destructive': 'secondary'} className={fixture.result === 'W' ? 'bg-green-500' : ''}>{fixture.result}</Badge>
                                            <span className="font-bold">{fixture.score}</span>
                                        </div>
                                    ) : (
                                        <Badge variant="outline">Upcoming</Badge>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{new Date(fixture.date).toLocaleDateString()} &middot; {fixture.competition}</div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
