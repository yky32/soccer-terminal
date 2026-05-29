export type ApiFootballLiveFixture = {
  fixture: {
    id: number;
    status: { short: string };
  };
  league: {
    country: string;
    flag: string | null;
  };
};

export type ApiFootballLiveResponse = {
  errors: Record<string, string> | unknown[];
  response: ApiFootballLiveFixture[];
};
