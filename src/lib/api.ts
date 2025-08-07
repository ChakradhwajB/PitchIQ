// In a real application, this would be your API client.
// For this example, we're using mock data.
import type { League, Season, Standing, Team, Player, Match, Shot, HeatmapPoint } from './types';
import MOCK_STANDINGS from './mock-data/standings.json';
import MOCK_TEAMS from './mock-data/teams.json';
import MOCK_PLAYERS from './mock-data/players.json';
import MOCK_MATCH from './mock-data/match.json';

const leagues: League[] = [
  { id: 39, name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { id: 140, name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { id: 135, name: 'Serie A', logo: 'https://media.api-sports.io/football/leagues/135.png' },
  { id: 78, name: 'Bundesliga', logo: 'https://media.api-sports.io/football/leagues/78.png' },
];

const seasons: Season[] = [
  { year: 2023 },
  { year: 2022 },
  { year: 2021 },
];

// Simulate API latency
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getLeagues(): Promise<League[]> {
  await sleep(200);
  return leagues;
}

export async function getSeasons(): Promise<Season[]> {
  await sleep(200);
  return seasons;
}

export async function getStandings(leagueId: string, season: string): Promise<Standing[]> {
  await sleep(500);
  // In a real app, you'd fetch based on leagueId and season.
  // We only have one set of mock data.
  return MOCK_STANDINGS[0].league.standings[0] as Standing[];
}

export async function getTeam(teamId: string): Promise<Team | undefined> {
  await sleep(500);
  const teamData = (MOCK_TEAMS as any[]).find(t => t.team.id.toString() === teamId);
  if (!teamData) return undefined;
  return {
    id: teamData.team.id,
    name: teamData.team.name,
    logo: teamData.team.logo,
    country: teamData.team.country,
    stadium: teamData.venue.name,
  };
}

export async function getTeamPlayers(teamId: string): Promise<Player[]> {
  await sleep(500);
  const teamPlayers = (MOCK_PLAYERS as any[]).find(p => p.players[0].statistics[0].team.id.toString() === teamId);
  if (!teamPlayers) return [];
  
  return teamPlayers.players.map((p: any) => ({
    id: p.player.id,
    name: p.player.name,
    age: p.player.age,
    nationality: p.player.nationality,
    height: p.player.height,
    weight: p.player.weight,
    photo: p.player.photo,
    statistics: p.statistics,
    position: p.statistics[0]?.games.position,
  }));
}

export async function getPlayer(playerId: string): Promise<Player | undefined> {
    await sleep(500);
    // This is a simplified search across the mock data. A real API would be a direct fetch.
    let foundPlayer: any = null;
    for (const team of MOCK_PLAYERS) {
        const player = team.players.find((p: any) => p.player.id.toString() === playerId);
        if (player) {
            foundPlayer = player;
            break;
        }
    }

    if (!foundPlayer) return undefined;
    
    // Add mock career data
    const career = [
      { team: { name: 'Previous Club FC', logo: 'https://placehold.co/32x32' }, start: '2018', end: '2020' },
      { team: { name: 'Youth Academy', logo: 'https://placehold.co/32x32' }, start: '2015', end: '2018' },
    ];

    return {
        id: foundPlayer.player.id,
        name: foundPlayer.player.name,
        age: foundPlayer.player.age,
        nationality: foundPlayer.player.nationality,
        height: foundPlayer.player.height,
        weight: foundPlayer.player.weight,
        photo: foundPlayer.player.photo,
        statistics: foundPlayer.statistics,
        position: foundPlayer.statistics[0]?.games.position,
        career: career,
    };
}


export async function getTeamFixtures(teamId: string): Promise<any[]> {
    await sleep(500);
    // This would be a separate API call in a real app
    return [
        { id: 1, type: 'Upcoming', opponent: { name: 'Rival FC', logo: 'https://media.api-sports.io/football/teams/47.png' }, date: '2024-08-17', competition: 'Premier League' },
        { id: 2, type: 'Upcoming', opponent: { name: 'Challenger United', logo: 'https://media.api-sports.io/football/teams/46.png' }, date: '2024-08-24', competition: 'Premier League' },
        { id: 3, type: 'Result', opponent: { name: 'Old Opponent AFC', logo: 'https://media.api-sports.io/football/teams/45.png' }, date: '2024-05-12', score: '2 - 1', result: 'W' },
        { id: 4, type: 'Result', opponent: { name: 'Historic Rivals', logo: 'https://media.api-sports.io/football/teams/42.png' }, date: '2024-05-05', score: '0 - 1', result: 'L' },
    ]
}


export async function getMatch(matchId: string): Promise<Match | undefined> {
  await sleep(500);
  // We only have one mock match, but in a real app you would fetch by ID.
  return MOCK_MATCH[0] as Match;
}

export async function getMatchShots(matchId: string): Promise<Shot[]> {
    await sleep(300);
    // Mock data for shots. A real API would provide this.
    // Coordinates are based on a 105x68 pitch representation.
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
    await sleep(300);
    // Mock data for player heatmap. More points simulate more activity.
    const points: HeatmapPoint[] = [];
    // Generate random points in a midfield area for demonstration
    for (let i = 0; i < 50; i++) {
        points.push({
            x: Math.random() * 60 + 20, // 20 to 80 on x-axis
            y: Math.random() * 60 + 4, // 4 to 64 on y-axis
        });
    }
    return points;
}
