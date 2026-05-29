/** Country centroid + live match count for the overview map */
export type CountryMatchActivity = {
  code: string;
  name: string;
  longitude: number;
  latitude: number;
  liveMatches: number;
};

export type LiveCountriesResponse = {
  countries: CountryMatchActivity[];
  countryCount: number;
  totalMatches: number;
  maxMatches: number;
  updatedAt?: string;
  provider?: string;
  error?: string;
};

export function getLiveMatchStats(countries: CountryMatchActivity[]) {
  const active = countries.filter((c) => c.liveMatches > 0);
  const totalMatches = active.reduce((sum, c) => sum + c.liveMatches, 0);
  const maxMatches = Math.max(...active.map((c) => c.liveMatches), 1);

  return {
    countryCount: active.length,
    totalMatches,
    maxMatches,
    countries: active,
  };
}

/** Bubble halo diameter in px from match volume */
export function bubbleDiameter(
  liveMatches: number,
  maxMatches: number,
  minPx = 28,
  maxPx = 80,
) {
  const t = liveMatches / maxMatches;
  return Math.round(minPx + t * (maxPx - minPx));
}
