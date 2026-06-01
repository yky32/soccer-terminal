export type ApiFootballLeagueSeason = {
  year: number;
  start?: string;
  end?: string;
  current: boolean;
};

/** `/leagues` item — `seasons` live on the root, not under `league`. */
export type ApiFootballLeagueDetail = {
  league: {
    id: number;
    name: string;
    seasons?: ApiFootballLeagueSeason[];
  };
  seasons?: ApiFootballLeagueSeason[];
};

export function seasonsFromLeagueDetail(detail: ApiFootballLeagueDetail | undefined) {
  if (!detail) return [];
  return detail.seasons ?? detail.league.seasons ?? [];
}
