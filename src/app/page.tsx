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
import { getStandings, getLeagues, getFixturesByStage } from '@/lib/api';
import type { Standing, League, Season, Fixture } from '@/lib/types';
import StandingsTable from '@/components/standings-table';
import TeamPointsChart from '@/components/team-points-chart';
import { Skeleton } from '@/components/ui/skeleton';
import FixtureList from '@/components/fixture-list';

const TOURNAMENT_LEAGUE_IDS = [2, 3]; // UCL, UEL

const TOURNAMENT_STAGES = [
  'Group Stage',
  'Round of 16',
  'Quarter-finals',
  'Semi-finals',
  'Final',
];

export default function Home() {
  const [leagues, setLeagues] = React.useState<League[]>([]);
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [selectedLeague, setSelectedLeague] = React.useState<string>('39');
  const [selectedSeason, setSelectedSeason] = React.useState<string>('2023');
  const [standings, setStandings] = React.useState<Standing[][]>([]);
  const [fixtures, setFixtures] = React.useState<Fixture[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedStage, setSelectedStage] = React.useState<string>(TOURNAMENT_STAGES[0]);

  React.useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      const leaguesData = await getLeagues();
      setLeagues(leaguesData);
      // As per API limitations, we will use a fixed list of recent, valid seasons.
      const availableSeasons = [
          { year: 2023 },
          { year: 2022 },
          { year: 2021 },
          { year: 2024 },
          { year: 2025 },
      ].sort((a,b) => b.year - a.year);
      setSeasons(availableSeasons);
      setSelectedSeason('2023');
      setLoading(false);
    }
    fetchInitialData();
  }, []);

  const isTournament = TOURNAMENT_LEAGUE_IDS.includes(parseInt(selectedLeague));
  const showStandings = !isTournament || (isTournament && selectedStage === 'Group Stage');

  React.useEffect(() => {
    async function fetchData() {
        if (!selectedLeague || !selectedSeason) return;
        setLoading(true);
        setStandings([]);
        setFixtures([]);

        if (showStandings) {
            const standingsData = await getStandings(selectedLeague, selectedSeason);
            setStandings(standingsData);
        } else { // This is a tournament knockout stage
            const fixturesData = await getFixturesByStage(selectedLeague, selectedSeason, selectedStage.replace(/ /g, '-'));
            setFixtures(fixturesData);
        }

        setLoading(false);
    }
    fetchData();
  }, [selectedLeague, selectedSeason, selectedStage, showStandings]);
  
  const handleLeagueChange = (leagueId: string) => {
    setSelectedLeague(leagueId);
    // Reset stage to default when changing league
    setSelectedStage(TOURNAMENT_STAGES[0]);
  };
  
  const handleSeasonChange = (seasonYear: string) => {
    setSelectedSeason(seasonYear);
  };

  const handleStageChange = (stage: string) => {
    setSelectedStage(stage);
  }

  const selectedLeagueName = leagues.find(l => l.id.toString() === selectedLeague)?.name || 'League';
  const isGroupStage = standings.length > 1;
  const showFixtures = isTournament && !showStandings;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          {selectedLeagueName} {isTournament ? selectedStage : 'Standings'}
        </h1>
        <div className="flex gap-4">
          <Select onValueChange={handleLeagueChange} value={selectedLeague}>
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
          <Select onValueChange={handleSeasonChange} value={selectedSeason}>
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
          {isTournament && (
            <Select onValueChange={handleStageChange} value={selectedStage}>
                <SelectTrigger className="w-[180px] font-body">
                    <SelectValue placeholder="Select Stage" />
                </SelectTrigger>
                <SelectContent>
                    {TOURNAMENT_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                            {stage}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
             <Card className="shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">
                    <Skeleton className="h-8 w-1/2" />
                  </CardTitle>
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
          ) : showFixtures ? (
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Fixtures</CardTitle>
              </CardHeader>
              <CardContent>
                <FixtureList fixtures={fixtures} />
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
                  <CardTitle className="font-headline text-2xl">No Data Available</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>There is no data available for the selected league, season, and stage. Please try a different selection.</p>
                </CardContent>
              </Card>
          )}
        </div>
        {!isGroupStage && !isTournament && (
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
