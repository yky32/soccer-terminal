/** Country centroid + live match count (mock until fixture API) */
export type CountryMatchActivity = {
  code: string;
  name: string;
  longitude: number;
  latitude: number;
  liveMatches: number;
};

/** Mock snapshot: countries with at least one live match right now */
export const LIVE_MATCH_COUNTRIES: CountryMatchActivity[] = [
  { code: "GB", name: "United Kingdom", longitude: -2.5, latitude: 54.5, liveMatches: 6 },
  { code: "ES", name: "Spain", longitude: -3.7, latitude: 40.4, liveMatches: 5 },
  { code: "DE", name: "Germany", longitude: 10.5, latitude: 51.2, liveMatches: 4 },
  { code: "IT", name: "Italy", longitude: 12.5, latitude: 42.8, liveMatches: 4 },
  { code: "FR", name: "France", longitude: 2.2, latitude: 46.2, liveMatches: 3 },
  { code: "US", name: "United States", longitude: -98.5, latitude: 39.8, liveMatches: 7 },
  { code: "BR", name: "Brazil", longitude: -51.9, latitude: -14.2, liveMatches: 5 },
  { code: "AR", name: "Argentina", longitude: -64.2, latitude: -34.6, liveMatches: 3 },
  { code: "MX", name: "Mexico", longitude: -102.5, latitude: 23.6, liveMatches: 2 },
  { code: "JP", name: "Japan", longitude: 138.0, latitude: 36.2, liveMatches: 4 },
  { code: "KR", name: "South Korea", longitude: 127.8, latitude: 36.5, liveMatches: 2 },
  { code: "AU", name: "Australia", longitude: 133.8, latitude: -25.3, liveMatches: 2 },
];

export function getLiveMatchStats(countries: CountryMatchActivity[] = LIVE_MATCH_COUNTRIES) {
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

export function countriesToGeoJSON(
  countries: CountryMatchActivity[] = LIVE_MATCH_COUNTRIES,
): GeoJSON.FeatureCollection<GeoJSON.Point, { liveMatches: number; name: string; code: string }> {
  return {
    type: "FeatureCollection",
    features: countries
      .filter((c) => c.liveMatches > 0)
      .map((country) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [country.longitude, country.latitude],
        },
        properties: {
          liveMatches: country.liveMatches,
          name: country.name,
          code: country.code,
        },
      })),
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
