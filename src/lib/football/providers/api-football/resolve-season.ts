import type { LeagueCatalogEntry } from "@/lib/football/league-catalog";
import { seasonYearForEntry } from "@/lib/football/league-catalog";
import { apiFootballGetSafe } from "@/lib/football/providers/api-football/request";
import { API_REVALIDATE_DEFAULT_SEC } from "@/lib/football/refresh-policy";

type ApiFootballLeagueSeason = {
  year: number;
  current: boolean;
};

type ApiFootballLeagueDetail = {
  league: {
    seasons: ApiFootballLeagueSeason[];
  };
};

const seasonCache = new Map<number, { year: number; cachedAt: number }>();
const SEASON_CACHE_MS = 24 * 60 * 60_000;

/**
 * Tournaments and UEFA knockout cups use the API's `current` season year.
 * Split-season domestic leagues use the Jul–Jun football year rule.
 */
export async function resolveSeasonYearForEntry(
  apiKey: string,
  entry: LeagueCatalogEntry,
  now = new Date(),
): Promise<number> {
  if (entry.seasonKind !== "tournament" && !entry.hasKnockoutStage) {
    return seasonYearForEntry(entry, now);
  }

  const cached = seasonCache.get(entry.apiId);
  if (cached && Date.now() - cached.cachedAt < SEASON_CACHE_MS) {
    return cached.year;
  }

  const details = await apiFootballGetSafe<ApiFootballLeagueDetail>(
    apiKey,
    "/leagues",
    { id: entry.apiId },
    API_REVALIDATE_DEFAULT_SEC,
  );

  const seasons = details[0]?.league.seasons ?? [];
  const current = seasons.find((season) => season.current);
  const year =
    current?.year ??
    (seasons.length > 0
      ? Math.max(...seasons.map((season) => season.year))
      : seasonYearForEntry(entry, now));

  seasonCache.set(entry.apiId, { year, cachedAt: Date.now() });
  return year;
}
