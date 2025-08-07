'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getStandings, getLeagues, getSeasons } from '@/lib/api';
import type { Standing, League, Season } from '@/lib/types';
import StandingsTable from '@/components/standings-table';
import TeamPointsChart from '@/components/team-points-chart';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [leagues, setLeagues] = React.useState<League[]>([]);
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [selectedLeague, setSelectedLeague] = React.useState<string>('39');
  const [selectedSeason, setSelectedSeason] = React.useState<string>('2023');
  const [standings, setStandings] = React.useState<Standing[][]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchInitialData() {
        setLoading(true);
        const [leaguesData, seasonsData] = await Promise.all([getLeagues(), getSeasons()]);
        setLeagues(leaguesData);
        setSeasons(seasonsData);
        setLoading(false);
    }
    fetchInitialData();
  }, []);

  React.useEffect(() => {
    async function fetchStandings() {
        if (!selectedLeague || !selectedSeason) return;
        setLoading(true);
        const standingsData = await getStandings(selectedLeague, selectedSeason);
        setStandings(standingsData);
        setLoading(false);
    }
    fetchStandings();
  }, [selectedLeague, selectedSeason]);
  
  const handleLeagueChange = (leagueId: string) => {
    setSelectedLeague(leagueId);
  };
  
  const handleSeasonChange = (seasonYear: string) => {
    setSelectedSeason(seasonYear);
  };

  const selectedLeagueName = leagues.find(l => l.id.toString() === selectedLeague)?.name || 'League';
  const isGroupStage = standings.length > 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          {selectedLeagueName} Standings
        </h1>
        <div className="flex gap-4">
          <Select onValueChange={handleLeagueChange} defaultValue={selectedLeague}>
            <SelectTrigger className="w-[180px] font-body">
              <SelectValue placeholder="Select League" />
            </SelectTrigger>
            <SelectContent>
              {leagues.map((league) => (
                <SelectItem key={league.id} value={league.id.toString()}>
                  {league.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={handleSeasonChange} defaultValue={selectedSeason}>
            <SelectTrigger className="w-[180px] font-body">
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.year} value={season.year.toString()}>
                  {season.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
             <Card className="shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">League Table</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
          ) : standings.length > 0 ? (
            standings.map((group, index) => (
              <Card key={index} className="shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">
                    {group[0]?.group || 'League Table'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StandingsTable standings={group} />
                </CardContent>
              </Card>
            ))
          ) : (
             <Card className="shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">No Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>No standings available for the selected league and season.</p>
                </CardContent>
              </Card>
          )}
        </div>
        {!isGroupStage && (
          <div>
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Team Points</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <TeamPointsChart standings={standings.flat()} />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
