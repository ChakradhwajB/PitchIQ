export interface League {
  id: string;
  name: string;
  logo?: string;
}

export interface Season {
  year: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  stadium?: string;
  country?: string;
  description?: string;
}

export interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  form: string;
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
  group: string; // TheSportsDB doesn't seem to have group info in standings, will keep for type safety
}

export interface Player {
  id: string;
  name: string;
  age: number;
  number: string | null;
  nationality: string;
  height: string;
  weight: string;
  photo: string;
  statistics: PlayerStats[];
  position?: string;
  career?: { team: { name: string, logo: string }, start: string, end: string | null }[]
  description?: string | null;
  transfermarket_id?: string | null;
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
  id: string;
  name: string;
  logo: string;
}

export interface Match {
  id: string;
  fixture: {
    id: string;
    date: string;
    venue: {
      name: string | null;
    };
  };
  league: {
    name: string | null;
    round: string | null;
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
  tvEvents?: TvEvent[];
}

export interface MatchEvent {
  time: {
    elapsed: number | string;
  };
  team: {
    id: string;
    name: string;
    logo: string;
  };
  player: {
    id: string;
    name: string;
  };
  type: 'Goal' | 'Card' | 'subst';
  detail: string;
}

export interface LineupPlayer {
  id: string;
  name: string;
  pos: string;
  grid: string | null;
  number?: number;
}

export interface Lineup {
  team: MatchTeam;
  formation: string | null;
  startXI: { player: LineupPlayer }[];
  substitutes: { player: LineupPlayer }[];
}


export interface MatchStats {
  team: {
    id: string;
    name: string;
    logo: string;
  };
  statistics: {
    type: string;
    value: number | string | null;
  }[];
}

export interface Shot {
  x: number;
  y: number;
  teamId: string;
  type: 'Goal' | 'Saved' | 'Miss';
  player: {
    id: string;
    name: string;
  };
}

export interface HeatmapPoint {
  x: number;
  y: number;
}

export interface Fixture {
    id: string;
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
    competition?: string;
    opponent?: any;
    result?: 'W' | 'D' | 'L' | null;
    score?: string | null;
    type?: string;
}

export interface TvEvent {
    id: string;
    channel: string;
    country: string;
    logo: string;
}
