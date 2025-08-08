
import type { League, Season, Standing, Team, Player, Match, Shot, HeatmapPoint, Fixture, Lineup, MatchTeam, MatchEvent, PlayerStats } from './types';
import { suggestShots } from '@/ai/flows/suggest-shots';

const API_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';
const API_KEY = process.env.NEXT_PUBLIC_THESPORTSDB_API_KEY;
const PLACEHOLDER_IMAGE_URL = 'https://www.thesportsdb.com/images/shared/placeholders/player_placeholder.png';
const PLACEHOLDER_TEAM_IMAGE_URL = 'https://www.thesportsdb.com/images/shared/placeholders/team_placeholder.png';


// Helper to clean up image URLs from TheSportsDB
function cleanImageUrl(url: string | null | undefined): string {
    if (!url || typeof url !== 'string') return '';
    // The API sometimes returns URLs with /preview appended, which is not a direct image link.
    if (url.endsWith('/preview')) {
        return url.slice(0, -8); 
    }
    // If the url is valid and doesn't have /preview, just return it.
    return url;
}


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
    if (!data || (data.teams === null) || (data.leagues === null) || (data.events === null) || (data.table === null) || (data.player === null)) {
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
    { "year": "2022-2023" },
    { "year": "2021-2022" },
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
          logo: cleanImageUrl(t.strTeamBadge) || PLACEHOLDER_TEAM_IMAGE_URL,
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
        logo: cleanImageUrl(teamData.strTeamBadge) || PLACEHOLDER_TEAM_IMAGE_URL,
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
      age: p.dateBorn ? new Date().getFullYear() - new Date(p.dateBorn).getFullYear() : 0,
      nationality: p.strNationality,
      photo: cleanImageUrl(p.strCutout) || cleanImageUrl(p.strThumb) || PLACEHOLDER_IMAGE_URL,
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
    const currentTeam = p.idTeam ? await getTeam(p.idTeam) : undefined;
    
    // TheSportsDB has multiple league fields, let's try to find the most relevant one
    const leagueName = p.strLeague2 || p.strLeague || 'Unknown League';
    const leagueId = p.idLeague2 || p.idLeague || '0';

    const statistics: PlayerStats[] = currentTeam ? [{
        team: currentTeam,
        league: { id: leagueId, name: leagueName, logo: leagueId !== '0' ? cleanImageUrl((await fetchFromApi<{leagues: any[]}>(`lookupleague.php?id=${leagueId}`))?.leagues?.[0]?.strBadge) : undefined },
        games: { appearences: p.intSigned, minutes: 0, position: p.strPosition }, // Mocked/approximated data
        goals: { total: p.intGoals, assists: p.intAssists },
    }] : [];

    const career: { team: { name: string, logo: string }, start: string, end: string | null }[] = [];
    if (p.strTeam && p.dateBorn) {
        career.push({ team: { name: p.strTeam, logo: currentTeam?.logo || PLACEHOLDER_TEAM_IMAGE_URL }, start: p.dateSigned || new Date(p.dateBorn).getFullYear().toString(), end: 'Present' })
    }
     // Mocking career data for demonstration purposes as the API doesn't provide a clean list
    if (p.strTeam2 && p.strTeam2 !== p.strTeam) {
        career.push({ team: { name: p.strTeam2, logo: PLACEHOLDER_TEAM_IMAGE_URL }, start: '2018', end: '2020' })
    }


    return {
        id: p.idPlayer,
        name: p.strPlayer,
        age: p.dateBorn ? new Date().getFullYear() - new Date(p.dateBorn).getFullYear() : 0,
        nationality: p.strNationality,
        height: p.strHeight,
        weight: p.strWeight,
        photo: cleanImageUrl(p.strCutout) || cleanImageUrl(p.strThumb) || PLACEHOLDER_IMAGE_URL,
        position: p.strPosition,
        statistics: statistics,
        career: career,
    };
}

export async function getTeamFixtures(teamId: string): Promise<Fixture[]> {
    const data = await fetchFromApi<{results: any[], events: any[]}>(`eventslast.php?id=${teamId}`);
    if (!data || !data.results) return [];

    const fixtures = await Promise.all(data.results.map(async (f:any) => {
        const isHome = f.idHomeTeam === teamId;
        const opponentId = isHome ? f.idAwayTeam : f.idHomeTeam;
        
        // Fetch opponent's logo
        const opponentTeamData = await getTeam(opponentId);

        let result: 'W' | 'D' | 'L' | null = null;
        if(f.intHomeScore !== null && f.intAwayScore !== null) {
            const homeScore = parseInt(f.intHomeScore);
            const awayScore = parseInt(f.intAwayScore);
            if (homeScore === awayScore) {
                result = 'D';
            } else if ((isHome && homeScore > awayScore) || (!isHome && awayScore > homeScore)) {
                result = 'W';
            } else {
                result = 'L';
            }
        }
        
        return {
            id: f.idEvent,
            type: 'Result',
            opponent: { 
                id: opponentId, 
                name: isHome ? f.strAwayTeam : f.strHomeTeam, 
                logo: opponentTeamData?.logo || PLACEHOLDER_TEAM_IMAGE_URL 
            },
            date: new Date(`${f.dateEvent}T${f.strTime ?? '00:00:00'}`).toISOString(),
            competition: f.strLeague,
            score: `${f.intHomeScore}-${f.intAwayScore}`,
            result
        }
    }));
    return fixtures.slice(-10); 
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
  // This data will be mocked or generated.
  const mockLineupPlayer = (name: string, i: number, teamId: string): LineupPlayer => ({ id: `${teamId}-${i}`, name: `${name} Player ${i}`, pos: 'N/A', grid: null });

  
  const homeLineup: Lineup = {
      team: homeTeam,
      formation: matchData.strHomeFormation || "N/A",
      startXI: Array(11).fill(null).map((_, i) => ({ player: mockLineupPlayer('Home', i, homeTeam.id)})),
      substitutes: Array(7).fill(null).map((_, i) => ({player: mockLineupPlayer('Sub', i, homeTeam.id)})),
  };
    
  const awayLineup: Lineup = {
      team: awayTeam,
      formation: matchData.strAwayFormation || "N/A",
      startXI: Array(11).fill(null).map((_, i) => ({player: mockLineupPlayer('Away', i, awayTeam.id)})),
      substitutes: Array(7).fill(null).map((_, i) => ({player: mockLineupPlayer('Sub', i+7, awayTeam.id)})),
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

  const statistics: MatchStats[] = [];
  const homeStats: MatchStats['statistics'] = [];
  const awayStats: MatchStats['statistics'] = [];

  if(matchData.intHomeShots) homeStats.push({ type: 'Total Shots', value: matchData.intHomeShots });
  if(matchData.intAwayShots) awayStats.push({ type: 'Total Shots', value: matchData.intAwayShots });
  if(matchData.intHomePossession) homeStats.push({ type: 'Ball Possession', value: `${matchData.intHomePossession}%` });
  if(matchData.intAwayPossession) awayStats.push({ type: 'Ball Possession', value: `${matchData.intAwayPossession}%` });


  statistics.push({ team: { id: homeTeam.id, name: homeTeam.name }, statistics: homeStats });
  statistics.push({ team: { id: awayTeam.id, name: awayTeam.name }, statistics: awayStats });

  
  const fullMatchData: Match = {
    id: matchData.idEvent,
    fixture: {
        id: matchData.idEvent,
        date: new Date(`${matchData.dateEvent}T${matchData.strTime ?? '00:00:00'}`).toISOString(),
        venue: { name: matchData.strVenue },
    },
    league: { name: matchData.strLeague, round: matchData.intRound },
    teams: { home: homeTeam, away: awayTeam },
    goals: { home: matchData.intHomeScore ? parseInt(matchData.intHomeScore) : null, away: matchData.intAwayScore ? parseInt(matchData.intAwayScore) : null },
    events: mockEvents,
    lineups: [homeLineup, awayLineup],
    statistics: statistics,
  };

  return fullMatchData;
}

export async function getMatchShots(matchStatistics: string): Promise<Shot[]> {
    try {
        const result = await suggestShots({ matchStatistics });
        if (result.shots) {
            // TheSportsDB team IDs are strings
            return result.shots.map(s => ({...s, teamId: String(s.teamId), player: {...s.player, id: String(s.player.id)} }));
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
    
    const fixtures = await Promise.all(data.events.map(async (f: any) => {
        const homeTeam = await getTeam(f.idHomeTeam);
        const awayTeam = await getTeam(f.idAwayTeam);

        return {
            id: f.idEvent,
            date: new Date(`${f.dateEvent}T${f.strTime ?? '00:00:00'}`).toISOString(),
            status: f.strStatus === "Match Finished" ? "Finished" : f.strStatus,
            teams: {
              home: { id: f.idHomeTeam, name: f.strHomeTeam, logo: homeTeam?.logo || PLACEHOLDER_TEAM_IMAGE_URL },
              away: { id: f.idAwayTeam, name: f.strAwayTeam, logo: awayTeam?.logo || PLACEHOLDER_TEAM_IMAGE_URL },
            },
            goals: {
              home: f.intHomeScore ? parseInt(f.intHomeScore) : null,
              away: f.intAwayScore ? parseInt(f.intAwayScore) : null,
            },
        }
    }));
    return fixtures;
}

export async function getFixturesByDate(date: string): Promise<Fixture[]> {
    // TheSportsDB API is limited for this. We'll try fetching for a major league.
    console.warn("Fixtures by date is limited and will only show Premier League results.");
    const data = await fetchFromApi<{events: any[]}>(`eventsday.php?d=${date}&l=English%20Premier%20League`);
    if (!data || !data.events) return [];

    const fixtures = await Promise.all(data.events.map(async (f: any) => {
        const homeTeam = await getTeam(f.idHomeTeam);
        const awayTeam = await getTeam(f.idAwayTeam);

        return {
            id: f.idEvent,
            date: new Date(`${f.dateEvent}T${f.strTime ?? '00:00:00'}`).toISOString(),
            status: f.strStatus === "Match Finished" ? "Finished" : f.strStatus,
            teams: {
              home: { id: f.idHomeTeam, name: f.strHomeTeam, logo: homeTeam?.logo || PLACEHOLDER_TEAM_IMAGE_URL },
              away: { id: f.idAwayTeam, name: f.strAwayTeam, logo: awayTeam?.logo || PLACEHOLDER_TEAM_IMAGE_URL },
            },
            goals: {
              home: f.intHomeScore ? parseInt(f.intHomeScore) : null,
              away: f.intAwayScore ? parseInt(f.intAwayScore) : null,
            },
        };
    }));
    return fixtures;
}

export async function searchPlayersByName(name: string): Promise<Player[]> {
  const data = await fetchFromApi<{player: any[]}>(`searchplayers.php?p=${encodeURIComponent(name)}`);
  if (!data || !data.player) return [];

  return data.player
    .filter(p => p.strSport === 'Soccer') // Filter only for soccer players
    .map((p: any) => ({
    id: p.idPlayer,
    name: p.strPlayer,
    age: p.dateBorn ? new Date().getFullYear() - new Date(p.dateBorn).getFullYear() : 0,
    nationality: p.strNationality,
    photo: cleanImageUrl(p.strCutout) || cleanImageUrl(p.strThumb) || PLACEHOLDER_IMAGE_URL,
    position: p.strPosition,
    statistics: [], // Full stats can be fetched on the player page
  }));
}
