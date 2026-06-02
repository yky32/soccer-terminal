export type ApiFootballFixtureEvent = {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo?: string | null;
  };
  player: {
    id: number | null;
    name: string | null;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments?: string | null;
};

export type ApiFootballLiveFixture = {
  fixture: {
    id: number;
    referee?: string | null;
    timezone?: string | null;
    date?: string;
    status: {
      short: string;
      long: string;
      elapsed: number | null;
    };
    venue?: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    periods?: {
      first?: number | null;
      second?: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string | null;
    flag: string | null;
    round?: string | null;
    season?: number;
  };
  teams: {
    home: { id: number; name: string; logo: string | null; winner?: boolean | null };
    away: { id: number; name: string; logo: string | null; winner?: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score?: {
    halftime?: {
      home: number | null;
      away: number | null;
    };
    fulltime?: {
      home: number | null;
      away: number | null;
    };
    extratime?: {
      home: number | null;
      away: number | null;
    };
    penalty?: {
      home: number | null;
      away: number | null;
    };
  };
  events?: ApiFootballFixtureEvent[];
};

export type ApiFootballFixtureStatisticEntry = {
  type: string;
  value: string | number | null;
};

export type ApiFootballFixtureStatistics = {
  team: {
    id: number;
    name: string;
    logo: string | null;
  };
  statistics: ApiFootballFixtureStatisticEntry[];
};

export type ApiFootballLineupPlayer = {
  id: number | null;
  name: string | null;
  number: number | null;
  pos: string | null;
  photo?: string | null;
};

export type ApiFootballLineup = {
  team: {
    id: number;
    name: string;
    logo: string | null;
  };
  formation: string | null;
  coach: {
    id?: number | null;
    name?: string | null;
    photo?: string | null;
  };
  startXI: Array<{ player: ApiFootballLineupPlayer }>;
  substitutes: Array<{ player: ApiFootballLineupPlayer }>;
};

export type ApiFootballLiveResponse = {
  errors: Record<string, string> | unknown[];
  response: ApiFootballLiveFixture[];
};

export type ApiFootballFixturePlayerStatistics = {
  games: {
    minutes: number | null;
    number: number | null;
    position: string | null;
    rating: string | null;
    captain: boolean | null;
    substitute: boolean | null;
  };
  shots: { total: number | null; on: number | null } | null;
  goals: { total: number | null; assists: number | null } | null;
  passes: { total: number | null; key: number | null; accuracy: string | null } | null;
  tackles: { total: number | null; blocks: number | null; interceptions: number | null } | null;
  duels: { total: number | null; won: number | null } | null;
  dribbles: { attempts: number | null; success: number | null; past: number | null } | null;
  fouls: { drawn: number | null; committed: number | null } | null;
  cards: { yellow: number | null; red: number | null } | null;
  penalty: { won: number | null; scored: number | null; missed: number | null } | null;
};

export type ApiFootballFixturePlayerEntry = {
  player: {
    id: number;
    name: string;
    photo: string | null;
  };
  statistics: ApiFootballFixturePlayerStatistics[];
};

export type ApiFootballFixturePlayers = {
  team: { id: number; name: string; logo: string | null };
  players: ApiFootballFixturePlayerEntry[];
};

export type ApiFootballFixtureInjury = {
  player: {
    id: number;
    name: string;
    photo: string | null;
    type: string | null;
    reason: string | null;
  };
  team: { id: number; name: string; logo: string | null };
  fixture: { id: number; date?: string };
  league: { id: number; name: string; season: number };
};
