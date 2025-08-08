import type { League, Season, Standing, Team, Player, Match, Shot, HeatmapPoint, MatchTeam, PlayerStats, Fixture, Lineup } from './types';

const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;

const apiHeaders = {
  "x-rapidapi-host": "v3.football.api-sports.io",
  "x-rapidapi-key": API_KEY || '',
};

// Helper function to make API calls
async function fetchFromApi<T>(endpoint: string): Promise<T | null> {
  if (!API_KEY) {
    console.error("API-Football key is missing. Add it to your .env file.");
    return null;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, { headers: apiHeaders });
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data.errors && (Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors).length > 0)) {
        console.error('API-Football Error:', data.errors);
        return null;
    }
    return data.response;
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}`, error);
    return null;
  }
}

export async function getLeagues(): Promise<League[]> {
  const data = await fetchFromApi<any[]>('leagues');
  if (!data) return [];
  // Filtering for top leagues as API returns many
  const topLeagues = [39, 140, 135, 78, 61, 2, 3]; // PL, La Liga, Serie A, Bundesliga, Ligue 1, UCL, UEL
  return data
    .filter(item => topLeagues.includes(item.league.id))
    .map(item => ({
        id: item.league.id,
        name: item.league.name,
        logo: item.league.logo,
  }));
}

export async function getSeasons(): Promise<Season[]> {
  // The API-Football free plan has limitations on accessible seasons.
  // Returning a static list of recent seasons as requested.
  return [
    { year: 2025 },
    { year: 2024 },
    { year: 2023 },
    { year: 2022 },
    { year: 2021 },
  ];
}

export async function getStandings(leagueId: string, season: string): Promise<Standing[][]> {
  const data = await fetchFromApi<any[]>(`standings?league=${leagueId}&season=${season}`);
  if (!data || !data[0]?.league?.standings) return [];
  
  // The API returns an array of standings arrays (for leagues with groups)
  return data[0].league.standings;
}

export async function getTeam(teamId: string): Promise<Team | undefined> {
    const data = await fetchFromApi<any[]>(`teams?id=${teamId}`);
    if (!data || data.length === 0) return undefined;
    const teamData = data[0];
    return {
        id: teamData.team.id,
        name: teamData.team.name,
        logo: teamData.team.logo,
        country: teamData.team.country,
        stadium: teamData.venue.name,
    };
}

export async function getTeamPlayers(teamId: string): Promise<Player[]> {
    const season = 2023; // Use last season for more complete data
    const data = await fetchFromApi<any[]>(`players/squads?team=${teamId}`);
    if (!data || !data[0]?.players) return [];
  
    return data[0].players.map((p: any) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      nationality: p.nationality,
      photo: p.photo,
      position: p.position,
      statistics: [] // Player page will fetch detailed stats
    }));
}

export async function getPlayer(playerId: string): Promise<Player | undefined> {
    const season = 2023;
    const data = await fetchFromApi<any[]>(`players?id=${playerId}&season=${season}`);
    if (!data || data.length === 0) return undefined;

    const p = data[0];
    return {
        id: p.player.id,
        name: p.player.name,
        age: p.player.age,
        nationality: p.player.nationality,
        height: p.player.height,
        weight: p.player.weight,
        photo: p.player.photo,
        statistics: p.statistics.map((s:any): PlayerStats => ({
            team: { id: s.team.id, name: s.team.name, logo: s.team.logo },
            league: { id: s.league.id, name: s.league.name, logo: s.league.logo },
            games: s.games,
            goals: s.goals,
        })),
        position: p.statistics[0]?.games.position,
        // The API doesn't provide a simple career history, so we'll mock this for now
        career: [
            { team: { name: 'Previous Club FC', logo: 'https://placehold.co/32x32' }, start: '2018', end: '2020' },
            { team: { name: 'Youth Academy', logo: 'https://placehold.co/32x32' }, start: '2015', end: '2018' },
        ],
    };
}

export async function getTeamFixtures(teamId: string): Promise<any[]> {
    const season = 2023;
    const data = await fetchFromApi<any[]>(`fixtures?team=${teamId}&season=${season}`);
    if (!data) return [];

    return data.map((f:any) => {
        const opponent = f.teams.home.id.toString() === teamId ? f.teams.away : f.teams.home;
        const score = f.fixture.status.short === 'FT' ? `${f.goals.home} - ${f.goals.away}` : null;
        let result: 'W' | 'D' | 'L' | null = null;
        if(score) {
            const homeWon = f.teams.home.winner;
            const awayWon = f.teams.away.winner;
            if (homeWon === null || awayWon === null) {
                result = 'D';
            } else if ((f.teams.home.id.toString() === teamId && homeWon) || (f.teams.away.id.toString() === teamId && awayWon)) {
                result = 'W';
            } else {
                result = 'L';
            }
        }

        return {
            id: f.fixture.id,
            type: score ? 'Result' : 'Upcoming',
            opponent: { id: opponent.id, name: opponent.name, logo: opponent.logo },
            date: f.fixture.date,
            competition: f.league.name,
            score: score,
            result: result
        }
    }).slice(-10); // Return last 10 fixtures for brevity
}


export async function getMatch(matchId: string): Promise<Match | undefined> {
  const data = await fetchFromApi<any[]>(`fixtures?id=${matchId}`);
  if (!data || data.length === 0) return undefined;
  const matchData = data[0];

  const lineupsData = await fetchFromApi<Lineup[]>(`fixtures/lineups?fixture=${matchId}`);
  
  return {
    fixture: matchData.fixture,
    league: matchData.league,
    teams: matchData.teams,
    goals: matchData.goals,
    events: matchData.events,
    lineups: lineupsData || [],
    statistics: matchData.statistics,
  } as Match;
}

export async function getMatchShots(matchId: string): Promise<Shot[]> {
    // API-Football does not have a direct shot map endpoint.
    // We will continue to use mock data for this specific visualization.
    console.warn("Shot map data is mocked as API-Football does not provide it.");
    const shots: Shot[] = [
        { x: 85, y: 34, teamId: 42, type: 'Goal', player: { id: 278, name: 'K. Havertz' } },
        { x: 92, y: 45, teamId: 42, type: 'Saved', player: { id: 9, name: 'L. Trossard' } },
        { x: 78, y: 20, teamId: 42, type: 'Miss', player: { id: 6, name: 'M. Ødegaard' } },
        { x: 20, y: 30, teamId: 45, type: 'Goal', player: { id: 19184, name: 'I. Gueye' } },
        { x: 15, y: 40, teamId: 45, type: 'Miss', player: { id: 24, name: 'D. Calvert-Lewin' } },
        { x: 88, y: 38, teamId: 42, type: 'Goal', player: { id: 15352, name: 'T. Tomiyasu' } },
    ];
    return shots.filter(shot => shot.x > 0 && shot.x < 105 && shot.y > 0 && shot.y < 68);
}

export async function getPlayerHeatmap(playerId: string): Promise<HeatmapPoint[]> {
    // API-Football does not have a direct heatmap endpoint.
    // We will continue to use mock data for this specific visualization.
    console.warn("Player heatmap data is mocked as API-Football does not provide it.");
    const points: HeatmapPoint[] = [];
    for (let i = 0; i < 50; i++) {
        points.push({
            x: Math.random() * 60 + 20, // 20 to 80 on x-axis
            y: Math.random() * 60 + 4, // 4 to 64 on y-axis
        });
    }
    return points;
}

export async function getFixturesByStage(leagueId: string, season: string, round: string): Promise<Fixture[]> {
    const data = await fetchFromApi<any[]>(`fixtures?league=${leagueId}&season=${season}&round=${round}`);
    if (!data) return [];

    return data.map((f: any) => ({
        id: f.fixture.id,
        date: f.fixture.date,
        status: f.fixture.status.long,
        teams: f.teams,
        goals: f.goals,
    }));
}
