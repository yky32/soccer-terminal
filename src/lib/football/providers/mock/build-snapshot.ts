import type { LiveMatch } from "@/lib/data/live-match";
import type { CountryMatchActivity } from "@/lib/data/live-match-countries";
import type { MapMatchMode } from "@/lib/data/map-match-mode";
import type { LiveCountriesSnapshot } from "@/lib/football/provider";
import { getCountryCentroid } from "@/lib/football/country-centroids";

export function buildSnapshotFromMatches(
  matches: LiveMatch[],
  mode: MapMatchMode,
): LiveCountriesSnapshot {
  const matchesByCountry: Record<string, LiveMatch[]> = {};

  for (const match of matches) {
    const list = matchesByCountry[match.countryCode] ?? [];
    list.push(match);
    matchesByCountry[match.countryCode] = list;
  }

  for (const code of Object.keys(matchesByCountry)) {
    matchesByCountry[code].sort((a, b) => {
      const aTime = a.kickoffAt ? Date.parse(a.kickoffAt) : 0;
      const bTime = b.kickoffAt ? Date.parse(b.kickoffAt) : 0;
      if (aTime !== bTime) return aTime - bTime;
      return a.league.localeCompare(b.league);
    });
  }

  const countryCounts = new Map<string, { name: string; count: number }>();
  for (const match of matches) {
    const existing = countryCounts.get(match.countryCode);
    if (existing) existing.count += 1;
    else countryCounts.set(match.countryCode, { name: match.country, count: 1 });
  }

  const countries: CountryMatchActivity[] = [];
  for (const [code, { name, count }] of countryCounts) {
    const centroid = getCountryCentroid(code);
    if (!centroid) continue;
    countries.push({
      code,
      name,
      latitude: centroid.latitude,
      longitude: centroid.longitude,
      liveMatches: count,
    });
  }

  return {
    mode,
    countries: countries.sort((a, b) => b.liveMatches - a.liveMatches),
    matchesByCountry,
    updatedAt: new Date().toISOString(),
    provider: "mock",
  };
}
