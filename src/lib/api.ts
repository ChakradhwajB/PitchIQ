import type { League, Season, Standing, Team, Player, Match, Shot, HeatmapPoint, Fixture, Lineup, MatchTeam, MatchEvent } from './types';
import { suggestShots } from '@/ai/flows/suggest-shots';

const API_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';
const API_KEY = process.env.NEXT_PUBLIC_THESPORTSDB_API_KEY;

// Helper function to make API calls
async function fetchFromApi<T>(endpoint: string): Promise<T | null> {
  if (!API_KEY) {
    console.error("TheSportsDB API key is missing. Add NEXT_PUBLIC_THESPORTSDB_API_KEY to your .env file.");
    return null;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/${API_KEY}/${endpoint}`);
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    // TheSportsDB doesn't have a consistent error format, so we check for empty results.
    if (!data || (data.teams === null) || (data.leagues === null) || (data.events === null) || (data.table === null)) {
        // console.warn(`No data found for endpoint: ${endpoint}`);
    }
    return data;
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}`, error);
    return null;
  }
}

// NOTE: TheSportsDB has a different structure and less comprehensive free data than API-Football.
// Some data will be mocked or simplified.

const TOP_LEAGUE_IDS: {[key: string]: string} = {
    'English Premier League': '4328',
    'La Liga': '4335',
    'Serie A': '4332',
    'Bundesliga': '4331',
    'Ligue 1': '4334',
    'UEFA Champions League': '4480',
    'UEFA Europa League': '4481'
};
const REVERSE_LEAGUE_IDS = Object.fromEntries(Object.entries(TOP_LEAGUE_IDS).map(([k, v]) => [v, k]));

export async function getLeagues(): Promise<League[]> {
    return Object.entries(TOP_LEAGUE_IDS).map(([name, id]) => ({
        id,
        name,
    }));
}

export async function getSeasons(): Promise<Season[]> {
  // TheSportsDB uses season strings like "2023-2024"
  // Returning a static list of recent seasons as requested.
  return [
    { year: "2024-2025" },
    { year: "2023-2024" },
    { year: "2022-2023" },
    { year: "2021-2022" },
  ];
}

export async function getStandings(leagueId: string, season: string): Promise<Standing[][]> {
  const data = await fetchFromApi<{table: any[]}>(`lookuptable.php?l=${leagueId}&s=${season}`);
  if (!data || !data.table) return [];
  
  const standings: Standing[] = data.table.map(t => ({
      rank: t.intRank,
      team: {
          id: t.idTeam,
          name: t.strTeam,
          logo: t.strTeamBadge + '/preview',
      },
      points: t.intPoints,
      goalsDiff: t.intGoalDifference,
      form: t.strForm?.replace(/[-]/g, '') || '',
      all: {
          played: t.intPlayed,
          win: t.intWin,
          draw: t.intDraw,
          lose: t.intLoss,
          goals: {
              for: t.intGoalsFor,
              against: t.intGoalsAgainst
          }
      },
      group: t.strGroup || 'League Table'
  }));

  // TheSportsDB doesn't group standings for tournaments like API-Football did.
  // We'll return it as a single group.
  return [standings];
}

export async function getTeam(teamId: string): Promise<Team | undefined> {
    const data = await fetchFromApi<{teams: any[]}>(`lookupteam.php?id=${teamId}`);
    if (!data || !data.teams || data.teams.length === 0) return undefined;
    const teamData = data.teams[0];
    return {
        id: teamData.idTeam,
        name: teamData.strTeam,
        logo: teamData.strTeamBadge + '/preview',
        country: teamData.strCountry,
        stadium: teamData.strStadium,
    };
}

export async function getTeamPlayers(teamId: string): Promise<Player[]> {
    const data = await fetchFromApi<{player: any[]}>(`lookup_all_players.php?id=${teamId}`);
    if (!data || !data.player) return [];
  
    return data.player.map((p: any) => ({
      id: p.idPlayer,
      name: p.strPlayer,
      age: new Date().getFullYear() - new Date(p.dateBorn).getFullYear(),
      nationality: p.strNationality,
      photo: p.strCutout || p.strThumb || 'https://placehold.co/150x150.png',
      position: p.strPosition,
      statistics: [], // Full stats would require more calls
      height: p.strHeight,
      weight: p.strWeight,
    }));
}

export async function getPlayer(playerId: string): Promise<Player | undefined> {
    const data = await fetchFromApi<{players: any[]}>(`lookupplayer.php?id=${playerId}`);
    if (!data || !data.players) return undefined;

    const p = data.players[0];
    const currentTeam = await getTeam(p.idTeam);

    return {
        id: p.idPlayer,
        name: p.strPlayer,
        age: new Date().getFullYear() - new Date(p.dateBorn).getFullYear(),
        nationality: p.strNationality,
        height: p.strHeight,
        weight: p.strWeight,
        photo: p.strCutout || p.strThumb  || 'https://placehold.co/150x150.png',
        position: p.strPosition,
        statistics: currentTeam ? [{
            team: currentTeam,
            league: { id: p.idLeague, name: p.strLeague },
            games: { appearences: 0, minutes: 0, position: p.strPosition }, // Mocked data
            goals: { total: 0, assists: 0 },
        }] : [],
        career: [], // Not provided by this endpoint
    };
}

export async function getTeamFixtures(teamId: string): Promise<Fixture[]> {
    const data = await fetchFromApi<{results: any[], events: any[]}>(`eventslast.php?id=${teamId}`);
    if (!data || !data.results) return [];

    return data.results.map((f:any) => {
        const isHome = f.idHomeTeam === teamId;
        const opponentId = isHome ? f.idAwayTeam : f.idHomeTeam;
        const opponentName = isHome ? f.strAwayTeam : f.strHomeTeam;
        const score = `${f.intHomeScore}-${f.intAwayScore}`;
        
        let result: 'W' | 'D' | 'L' | null = null;
        if(f.intHomeScore !== null) {
            if (f.intHomeScore === f.intAwayScore) {
                result = 'D';
            } else if ((isHome && f.intHomeScore > f.intAwayScore) || (!isHome && f.intAwayScore > f.intHomeScore)) {
                result = 'W';
            } else {
                result = 'L';
            }
        }
        
        return {
            id: f.idEvent,
            type: 'Result',
            opponent: { id: opponentId, name: opponentName, logo: 'https://placehold.co/32x32' }, // Logo not in this response
            date: new Date(`${f.dateEvent}T${f.strTime}`).toISOString(),
            competition: f.strLeague,
            score,
            result
        }
    }).slice(-10); 
}

export async function getMatch(matchId: string): Promise<Match | undefined> {
  const data = await fetchFromApi<{events: any[]}>(`lookupevent.php?id=${matchId}`);
  if (!data || !data.events) return undefined;
  const matchData = data.events[0];

  const [homeTeam, awayTeam] = await Promise.all([
    getTeam(matchData.idHomeTeam),
    getTeam(matchData.idAwayTeam)
  ]);
  
  if (!homeTeam || !awayTeam) return undefined;

  // TheSportsDB does not provide detailed events, lineups, or statistics in the free tier.
  // This data will be mocked.
  const mockLineup = {
      team: homeTeam,
      formation: "4-3-3",
      startXI: [],
      substitutes: []
  };

  const mockEvents: MatchEvent[] = [];
  if (matchData.strHomeGoalDetails) {
      matchData.strHomeGoalDetails.split(';').forEach((detail:string) => {
          const parts = detail.match(/(\d+)'?\s*(.*)/);
          if (parts) {
            mockEvents.push({ time: { elapsed: parts[1] }, team: {id: homeTeam.id, name: homeTeam.name}, player: {id: '0', name: parts[2].trim()}, type: 'Goal', detail: 'Normal Goal'})
          }
      });
  }
   if (matchData.strAwayGoalDetails) {
      matchData.strAwayGoalDetails.split(';').forEach((detail:string) => {
          const parts = detail.match(/(\d+)'?\s*(.*)/);
          if (parts) {
            mockEvents.push({ time: { elapsed: parts[1] }, team: {id: awayTeam.id, name: awayTeam.name}, player: {id: '0', name: parts[2].trim()}, type: 'Goal', detail: 'Normal Goal'})
          }
      });
  }
  
  const fullMatchData = {
    id: matchData.idEvent,
    fixture: {
        id: matchData.idEvent,
        date: new Date(`${matchData.dateEvent}T${matchData.strTime}`).toISOString(),
        venue: { name: matchData.strVenue },
    },
    league: { name: matchData.strLeague, round: matchData.intRound },
    teams: { home: homeTeam, away: awayTeam },
    goals: { home: matchData.intHomeScore, away: matchData.intAwayScore },
    events: mockEvents,
    lineups: [
        {...mockLineup, team: homeTeam, formation: matchData.strHomeFormation}, 
        {...mockLineup, team: awayTeam, formation: matchData.strAwayFormation}
    ],
    statistics: [], // Mocked
  };

  // Stringify for AI flow
   const matchForAI = {
    ...fullMatchData,
    teams: {
        home: { id: homeTeam.id, name: homeTeam.name },
        away: { id: awayTeam.id, name: awayTeam.name },
    },
    // Mock player lists for shot generation
    lineups: [{ team: {id: homeTeam.id}, startXI: Array(11).fill(0).map((_,i) => ({player: {id: i, name: `Home Player ${i+1}`}}))}, { team: {id: awayTeam.id}, startXI: Array(11).fill(0).map((_,i) => ({player: {id: i+11, name: `Away Player ${i+1}`}}))}]
  };
  
  return fullMatchData as Match;
}

export async function getMatchShots(matchStatistics: string): Promise<Shot[]> {
    try {
        const result = await suggestShots({ matchStatistics });
        if (result.shots) {
            // TheSportsDB team IDs are strings
            return result.shots.map(s => ({...s, teamId: String(s.teamId)}));
        }
    } catch (e) {
        console.error('Failed to generate shots from AI, returning empty array.', e);
    }
    return [];
}


export async function getPlayerHeatmap(playerId: string): Promise<HeatmapPoint[]> {
    // This API does not provide heatmap data. Using mock data.
    console.warn("Player heatmap data is mocked.");
    const points: HeatmapPoint[] = [];
    for (let i = 0; i < 50; i++) {
        points.push({
            x: Math.random() * 60 + 20,
            y: Math.random() * 60 + 4,
        });
    }
    return points;
}

export async function getFixturesByStage(leagueId: string, season: string, round: string): Promise<Fixture[]> {
    // TheSportsDB API doesn't support fetching by stage/round name in the same way.
    // We will fetch all matches for the season and filter if possible.
    const roundNumber = round.match(/\d+/)?.[0];
    if (!roundNumber) return [];

    const data = await fetchFromApi<{events: any[]}>(`eventsround.php?id=${leagueId}&r=${roundNumber}&s=${season}`);
    if (!data || !data.events) return [];

    return data.events.map((f: any) => ({
        id: f.idEvent,
        date: new Date(`${f.dateEvent}T${f.strTime}`).toISOString(),
        status: f.strStatus === "Match Finished" ? "Finished" : f.strStatus,
        teams: {
          home: { id: f.idHomeTeam, name: f.strHomeTeam, logo: '' }, // Logo not in this response
          away: { id: f.idAwayTeam, name: f.strAwayTeam, logo: '' },
        },
        goals: {
          home: f.intHomeScore,
          away: f.intAwayScore,
        },
    }));
}

export async function getFixturesByDate(date: string): Promise<Fixture[]> {
    // TheSportsDB doesn't have a direct "fixtures by date" for all leagues.
    // This will be mocked for now.
    console.warn("Fixtures by date is not fully supported by TheSportsDB API and will return limited/mocked results.");
    // Let's try to get PL fixtures for that day
    const data = await fetchFromApi<{events: any[]}>(`eventsday.php?d=${date}&l=English%20Premier%20League`);
    if (!data || !data.events) return [];

    return data.events.map((f: any) => ({
        id: f.idEvent,
        date: new Date(`${f.dateEvent}T${f.strTime}`).toISOString(),
        status: f.strStatus,
        teams: {
          home: { id: f.idHomeTeam, name: f.strHomeTeam, logo: '' }, // No logos here
          away: { id: f.idAwayTeam, name: f.strAwayTeam, logo: '' },
        },
        goals: {
          home: f.intHomeScore,
          away: f.intAwayScore,
        },
    }));
}

export async function searchPlayersByName(name: string): Promise<Player[]> {
  const data = await fetchFromApi<{player: any[]}>(`searchplayers.php?p=${name}`);
  if (!data || !data.player) return [];

  return data.player
    .filter(p => p.strSport === 'Soccer') // Filter only for soccer players
    .map((p: any) => ({
    id: p.idPlayer,
    name: p.strPlayer,
    age: new Date().getFullYear() - new Date(p.dateBorn).getFullYear(),
    nationality: p.strNationality,
    photo: p.strCutout || p.strThumb || 'https://placehold.co/48x48.png',
    position: p.strPosition,
    statistics: [], // Full stats can be fetched on the player page
  }));
}
