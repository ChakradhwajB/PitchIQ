
import type { League, Season, Standing, Team, Player, Match, Shot, HeatmapPoint, Fixture, Lineup, MatchTeam, MatchStats, MatchEvent, LineupPlayer, TvEvent, NewsArticle } from './types';

const API_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';
const API_KEY = process.env.NEXT_PUBLIC_THESPORTSDB_API_KEY;
const PLACEHOLDER_IMAGE_URL = 'https://www.thesportsdb.com/images/shared/placeholders/player_placeholder.png';
const PLACEHOLDER_TEAM_IMAGE_URL = 'https://www.thesportsdb.com/images/shared/placeholders/team_placeholder.png';


// Helper to clean up image URLs from TheSportsDB
function cleanImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    // The API sometimes returns URLs with /preview appended, which is not a direct image link.
    return url.replace(/\/preview$/, '');
}


// Helper function to make API calls
async function fetchFromApi<T>(endpoint: string): Promise<T | null> {
  if (!API_KEY) {
    console.error("TheSportsDB API key is missing. Add NEXT_PUBLIC_THESPORTSDB_API_KEY to your .env file.");
    // Return null or an empty object/array to prevent crashes on the calling side.
    return null;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/${API_KEY}/${endpoint}`);
    // Check for empty response body before parsing JSON
    const text = await response.text();
    if (!text) {
        return null;
    }

    const data = JSON.parse(text);

    // TheSportsDB doesn't have a consistent error format, so we check for empty results.
    const resultKey = Object.keys(data)[0];
    if (!data || data[resultKey] === null) {
      // No data found for this endpoint.
    }
    return data;
  } catch (error) {
    // Don't log to console, let the caller handle UI.
    throw error; // Re-throw the error to be handled by the caller's try-catch block.
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
    const data = await fetchFromApi<{leagues: any[]}>('all_leagues.php');
    if (!data || !data.leagues) return [];

    // Filter to only include the top leagues we want to show
    const topLeagues = data.leagues
        .filter(l => Object.values(TOP_LEAGUE_IDS).includes(l.idLeague))
        .map(l => ({
            id: l.idLeague,
            name: l.strLeague,
            logo: cleanImageUrl(l.strLogo) || undefined,
            country: l.strCountry
        }));
    
    // Ensure the order is the same as TOP_LEAGUE_IDS
    return Object.values(TOP_LEAGUE_IDS)
        .map(id => topLeagues.find(l => l.id === id))
        .filter((l): l is League => l !== undefined);
}

export async function getLeagueDetails(leagueId: string): Promise<League | null> {
    const data = await fetchFromApi<{ leagues: any[] }>(`lookupleague.php?id=${leagueId}`);
    if (!data || !data.leagues || data.leagues.length === 0) {
        return null;
    }
    const leagueData = data.leagues[0];
    return {
        id: leagueData.idLeague,
        name: leagueData.strLeague,
        logo: cleanImageUrl(leagueData.strLogo),
        country: leagueData.strCountry,
        description: leagueData.strDescriptionEN,
        banner: cleanImageUrl(leagueData.strBanner),
        trophy: cleanImageUrl(leagueData.strTrophy),
    };
}


export async function getTeamsInLeague(leagueId: string): Promise<Team[]> {
    const currentSeason = "2023-2024"; // The API for all teams in a league is paid, so we get it from standings.
    const data = await fetchFromApi<{ table: any[] }>(`lookuptable.php?l=${leagueId}&s=${currentSeason}`);
    if (!data || !data.table) return [];
    
    return data.table.map(t => ({
        id: t.idTeam,
        name: t.strTeam,
        logo: cleanImageUrl(t.strBadge) || PLACEHOLDER_TEAM_IMAGE_URL,
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
    { year: "2020-2021" },
    { year: "2019-2020" },
    { year: "2018-2019" },
    { year: "2017-2018" },
    { year: "2016-2017" },
    { year: "2015-2016" },
    { year: "2014-2015" },
    { year: "2013-2014" },
    { year: "2012-2013" },
    { year: "2011-2012" },
    { year: "2010-2011" },
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
          logo: cleanImageUrl(t.strBadge) || PLACEHOLDER_TEAM_IMAGE_URL,
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

export async function getTeam(teamName: string): Promise<Team | undefined> {
    const data = await fetchFromApi<{teams: any[]}>(`searchteams.php?t=${encodeURIComponent(teamName)}`);
    if (!data || !data.teams || data.teams.length === 0) return undefined;
    
    // Find the exact match, as search can return multiple results
    const teamData = data.teams.find(t => t.strTeam.toLowerCase() === teamName.toLowerCase());
    if (!teamData) return undefined;
    
    return {
        id: teamData.idTeam,
        name: teamData.strTeam,
        logo: cleanImageUrl(teamData.strBadge) || PLACEHOLDER_TEAM_IMAGE_URL,
        country: teamData.strCountry,
        stadium: teamData.strStadium,
        description: teamData.strDescriptionEN,
    };
}

export async function getTeamPlayers(teamId: string): Promise<Player[]> {
    const data = await fetchFromApi<{player: any[]}>(`lookup_all_players.php?id=${teamId}`);
    if (!data || !data.player) return [];

    return data.player.map((p: any) => ({
      id: p.idPlayer,
      name: p.strPlayer,
      number: p.strNumber,
      age: p.dateBorn ? new Date().getFullYear() - new Date(p.dateBorn).getFullYear() : 0,
      nationality: p.strNationality,
      height: p.strHeight,
      weight: p.strWeight,
      photo: cleanImageUrl(p.strCutout) || cleanImageUrl(p.strThumb) || PLACEHOLDER_IMAGE_URL,
      position: p.strPosition,
      statistics: [], // Full stats would be another API call per player
      career: [], // Not provided in this endpoint
    }));
}

export async function getPlayer(playerId: string): Promise<Player | undefined> {
    const data = await fetchFromApi<{players: any[]}>(`lookupplayer.php?id=${playerId}`);
    if (!data || !data.players) return undefined;

    const p = data.players[0];
    if (!p) return undefined;

    const currentTeam = p.idTeam ? await getTeam(p.strTeam) : undefined;
    
    // TheSportsDB has multiple league fields, let's try to find the most relevant one
    const leagueName = p.strLeague2 || p.strLeague || 'Unknown League';
    const leagueId = p.idLeague2 || p.idLeague || '0';

    const leagueDetailsData = leagueId !== '0' ? await fetchFromApi<{leagues: any[]}>(`lookupleague.php?id=${leagueId}`) : null;
    const leagueLogo = leagueDetailsData?.leagues?.[0]?.strBadge;


    const statistics: PlayerStats[] = currentTeam ? [{
        team: currentTeam,
        league: { id: leagueId, name: leagueName, logo: cleanImageUrl(leagueLogo) || undefined },
        games: { appearences: p.intSigned, minutes: 0, position: p.strPosition }, // Mocked/approximated data
        goals: { total: p.intGoals, assists: p.intAssists },
    }] : [];

    const career: { team: { name: string, logo: string }, start: string, end: string | null }[] = [];
    if (p.strTeam && p.dateSigned) {
        career.push({ team: { name: p.strTeam, logo: currentTeam?.logo || PLACEHOLDER_TEAM_IMAGE_URL }, start: p.dateSigned, end: 'Present' })
    }
     // Mocking career data for demonstration purposes as the API doesn't provide a clean list
    if (p.strTeam2 && p.strTeam2 !== p.strTeam) {
        career.push({ team: { name: p.strTeam2, logo: PLACEHOLDER_TEAM_IMAGE_URL }, start: '2018', end: '2020' })
    }


    return {
        id: p.idPlayer,
        name: p.strPlayer,
        number: p.strNumber || null,
        age: p.dateBorn ? new Date().getFullYear() - new Date(p.dateBorn).getFullYear() : 0,
        nationality: p.strNationality,
        height: p.strHeight,
        weight: p.strWeight,
        photo: cleanImageUrl(p.strCutout) || cleanImageUrl(p.strThumb) || PLACEHOLDER_IMAGE_URL,
        position: p.strPosition,
        statistics: statistics,
        career: career,
        description: p.strDescriptionEN || null,
        transfermarket_id: p.idTransferMkt || null,
    };
}

export async function getTeamFixtures(teamId: string): Promise<Fixture[]> {
    const data = await fetchFromApi<{results: any[]}>(`eventslast.php?id=${teamId}`);
    if (!data || !data.results) return [];

    const fixtures = await Promise.all(data.results.map(async (f:any) => {
        const isHome = f.idHomeTeam === teamId;
        const opponentId = isHome ? f.idAwayTeam : f.idHomeTeam;
        const opponentTeamName = isHome ? f.strAwayTeam : f.strHomeTeam;
        
        // Fetch opponent's logo
        const opponentTeamData = await getTeam(opponentTeamName);

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
                name: opponentTeamName, 
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

export async function getMatchTvInfo(matchId: string): Promise<TvEvent[]> {
    const data = await fetchFromApi<{tvevent: any[]}>(`lookuptv.php?id=${matchId}`);
    if (!data || !data.tvevent) return [];

    return data.tvevent.map((event: any) => ({
        id: event.id,
        channel: event.strChannel,
        country: event.strCountry,
        logo: cleanImageUrl(event.strLogo),
    }));
}

export async function getMatch(matchId: string): Promise<Match | undefined> {
  const eventDataPromise = fetchFromApi<{events: any[]}>(`lookupevent.php?id=${matchId}`);
  const lineupDataPromise = fetchFromApi<{lineup: any[]}>(`lookuplineup.php?id=${matchId}`);
  const timelineDataPromise = fetchFromApi<{timeline: any[]}>(`lookuptimeline.php?id=${matchId}`);
  const statsDataPromise = fetchFromApi<{eventstats: any[]}>(`lookupeventstats.php?id=${matchId}`);
  const tvDataPromise = getMatchTvInfo(matchId);
  
  const [eventData, lineupData, timelineData, statsData, tvEvents] = await Promise.all([
      eventDataPromise,
      lineupDataPromise,
      timelineDataPromise,
      statsDataPromise,
      tvDataPromise,
  ]);

  if (!eventData || !eventData.events) return undefined;
  const matchData = eventData.events[0];
  if (!matchData) return undefined;
  
  const homeTeamData = await getTeam(matchData.strHomeTeam);
  const awayTeamData = await getTeam(matchData.strAwayTeam);
  
  if (!homeTeamData || !awayTeamData) return undefined;

  const homeTeam: MatchTeam = { id: homeTeamData.id, name: homeTeamData.name, logo: homeTeamData.logo };
  const awayTeam: MatchTeam = { id: awayTeamData.id, name: awayTeamData.name, logo: awayTeamData.logo };


  // Process Lineups
  const lineups: Lineup[] = [];
  if(lineupData && lineupData.lineup) {
      const processTeamLineup = (teamId: string, teamName: string, teamLogo: string, formation: string | null): Lineup => {
          const team = {id: teamId, name: teamName, logo: teamLogo};
          const mapPlayer = (p: any): { player: LineupPlayer } => ({ 
              player: { 
                  id: p.idPlayer, 
                  name: p.strPlayer, 
                  pos: p.strPosition,
                  grid: null, // TheSportsDB doesn't provide grid
                  number: p.intSquadNumber 
              } 
          });
          
          const startXI: { player: LineupPlayer }[] = lineupData.lineup
              .filter(p => p.idTeam === teamId && p.strSubstitute === 'No')
              .map(mapPlayer);
          const substitutes: { player: LineupPlayer }[] = lineupData.lineup
              .filter(p => p.idTeam === teamId && p.strSubstitute === 'Yes')
              .map(mapPlayer);
          
          return { team: team, formation: formation || null, startXI, substitutes };
      };
      lineups.push(processTeamLineup(homeTeam.id, homeTeam.name, homeTeam.logo, matchData.strHomeFormation));
      lineups.push(processTeamLineup(awayTeam.id, awayTeam.name, awayTeam.logo, matchData.strAwayFormation));
  }

  // Process Timeline
  const events: MatchEvent[] = [];
  if (timelineData && timelineData.timeline) {
      timelineData.timeline.forEach((event: any) => {
          let type: MatchEvent['type'] | null = null;
          const eventTypeStr = event.strTimeline;

          if (eventTypeStr.toLowerCase().includes('goal')) type = 'Goal';
          else if (eventTypeStr.toLowerCase().includes('card')) type = 'Card';
          else if (eventTypeStr.toLowerCase().includes('subst')) type = 'subst';

          if (type) {
              const team = event.idTeam === homeTeam.id ? homeTeam : awayTeam;
              events.push({
                  time: { elapsed: event.intTime },
                  team: { id: team.id, name: team.name, logo: team.logo },
                  player: { id: event.idPlayer, name: event.strPlayer },
                  type: type,
                  detail: event.strTimelineDetail
              });
          }
      });
  }

  // Process Stats
    const statistics: MatchStats[] = [];
    if (statsData && statsData.eventstats) {
        const homeStatsList = statsData.eventstats.map(stat => ({
            type: stat.strStat,
            value: stat.intHome ?? '0'
        }));
        const awayStatsList = statsData.eventstats.map(stat => ({
            type: stat.strStat,
            value: stat.intAway ?? '0'
        }));
        
        statistics.push({
            team: homeTeam,
            statistics: homeStatsList
        });
        statistics.push({
            team: awayTeam,
            statistics: awayStatsList
        });
    }

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
    events: events,
    lineups: lineups,
    statistics: statistics,
    tvEvents: tvEvents,
  };

  return fullMatchData;
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
        const homeTeam = await getTeam(f.strHomeTeam);
        const awayTeam = await getTeam(f.strAwayTeam);

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
    const data = await fetchFromApi<{events: any[]}>(`eventsday.php?d=${date}&s=Soccer`);
    if (!data || !data.events) return [];

    const fixtures = await Promise.all(data.events.map(async (f: any) => {
        const homeTeam = await getTeam(f.strHomeTeam);
        const awayTeam = await getTeam(f.strAwayTeam);

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
    .filter((p:any) => p.strSport === 'Soccer') // Filter only for soccer players
    .map((p: any) => ({
    id: p.idPlayer,
    name: p.strPlayer,
    number: p.strNumber || null,
    age: p.dateBorn ? new Date().getFullYear() - new Date(p.dateBorn).getFullYear() : 0,
    nationality: p.strNationality,
    photo: cleanImageUrl(p.strCutout) || cleanImageUrl(p.strThumb) || PLACEHOLDER_IMAGE_URL,
    position: p.strPosition,
    statistics: [], // Full stats can be fetched on the player page
  }));
}

export const NEWS_SOURCES: { [key: string]: { name: string, url: string } } = {
    'all': { name: 'All Leagues', url: ''},
    'eng.1': { name: 'Premier League', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news' },
    'esp.1': { name: 'La Liga', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/news' },
    'ger.1': { name: 'Bundesliga', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/news' },
    'fra.1': { name: 'Ligue 1', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/news' },
    'ita.1': { name: 'Serie A', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/news' },
};

export async function getNews(leagueKey: string = 'all'): Promise<NewsArticle[]> {
    try {
        let urls: string[] = [];
        if (leagueKey === 'all') {
            urls = Object.values(NEWS_SOURCES).filter(s => s.url).map(s => s.url);
        } else if (NEWS_SOURCES[leagueKey]) {
            urls = [NEWS_SOURCES[leagueKey].url];
        } else {
            return [];
        }

        const responses = await Promise.all(urls.map(url => fetch(url)));
        const allArticles: NewsArticle[] = [];

        for (const response of responses) {
            if (response.ok) {
                const data = await response.json();
                if (data.articles) {
                    allArticles.push(...data.articles);
                }
            } else {
                 console.error(`Failed to fetch news from ${response.url}`);
            }
        }
        
        // De-duplicate articles by ID
        const uniqueArticles = Array.from(new Map(allArticles.map(article => [article.id, article])).values());


        // Sort by published date, most recent first
        return uniqueArticles.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}
