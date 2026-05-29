export type ApiFootballLiveFixture = {
  fixture: {
    id: number;
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
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string | null;
    flag: string | null;
    round?: string | null;
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
  };
};

export type ApiFootballLiveResponse = {
  errors: Record<string, string> | unknown[];
  response: ApiFootballLiveFixture[];
};
