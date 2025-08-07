export interface League {
  id: number;
  name: string;
  logo: string;
}

export interface Season {
  year: number;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
  stadium?: string;
  country?: string;
}

export interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  form: string;
  group: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

export interface Player {
  id: number;
  name: string;
  age: number;
  nationality: string;
  height: string;
  weight: string;
  photo: string;
  statistics: PlayerStats[];
  position?: string;
  career?: { team: { name: string, logo: string }, start: string, end: string | null }[]
}

export interface PlayerStats {
  team: Team;
  league: League;
  games: {
    appearences: number;
    minutes: number;
    position: string;
  };
  goals: {
    total: number;
    assists: number | null;
  };
}

export interface MatchTeam {
  id: number;
  name: string;
  logo: string;
  winner: boolean | null;
}

export interface Match {
  fixture: {
    id: number;
    date: string;
    venue: {
      name: string;
    };
  };
  league: {
    name: string;
    round: string;
  };
  teams: {
    home: MatchTeam;
    away: MatchTeam;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  events: MatchEvent[];
  lineups: Lineup[];
  statistics: MatchStats[];
}

export interface MatchEvent {
  time: {
    elapsed: number;
  };
  team: {
    id: number;
    name: string;
  };
  player: {
    id: number;
    name: string;
  };
  type: 'Goal' | 'Card' | 'subst';
  detail: string;
}

export interface LineupPlayer {
  id: number;
  name: string;
  pos: string;
  grid: string | null;
}

export interface Lineup {
  team: MatchTeam;
  formation: string;
  startXI: { player: LineupPlayer }[];
  substitutes: { player: LineupPlayer }[];
}

export interface MatchStats {
  team: {
    id: number;
    name: string;
  };
  statistics: {
    type: string;
    value: number | string | null;
  }[];
}

export interface Shot {
  x: number;
  y: number;
  teamId: number;
  type: 'Goal' | 'Saved' | 'Miss';
  player: {
    id: number;
    name: string;
  };
}

export interface HeatmapPoint {
  x: number;
  y: number;
}

export interface Fixture {
    id: number;
    date: string;
    status: string;
    teams: {
      home: MatchTeam;
      away: MatchTeam;
    };
    goals: {
      home: number | null;
      away: number | null;
    };
}
