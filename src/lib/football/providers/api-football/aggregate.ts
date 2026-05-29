import type { CountryMatchActivity } from "@/lib/data/live-match-countries";
import { getCountryCentroid } from "@/lib/football/country-centroids";
import { countryCodeFromLeagueFlag } from "@/lib/football/providers/api-football/country-code";
import type { ApiFootballLiveFixture } from "@/lib/football/providers/api-football/types";

export function aggregateLiveCountries(
  fixtures: ApiFootballLiveFixture[],
): CountryMatchActivity[] {
  const counts = new Map<
    string,
    { name: string; liveMatches: number }
  >();

  for (const item of fixtures) {
    const code = countryCodeFromLeagueFlag(item.league.flag);
    if (!code) continue;

    const name = item.league.country?.trim() || code;
    const existing = counts.get(code);

    if (existing) {
      existing.liveMatches += 1;
    } else {
      counts.set(code, { name, liveMatches: 1 });
    }
  }

  const countries: CountryMatchActivity[] = [];

  for (const [code, { name, liveMatches }] of counts) {
    const centroid = getCountryCentroid(code);
    if (!centroid) continue;

    countries.push({
      code,
      name,
      latitude: centroid.latitude,
      longitude: centroid.longitude,
      liveMatches,
    });
  }

  return countries.sort((a, b) => b.liveMatches - a.liveMatches);
}
