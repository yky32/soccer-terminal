import { LEAGUE_CATALOG } from "@/lib/football/league-catalog";

/** API-Football league ids included in the app catalog. */
export const CATALOG_LEAGUE_API_IDS = new Set(
  LEAGUE_CATALOG.map((entry) => entry.apiId),
);

export function isCatalogLeagueApiId(leagueId: number) {
  return CATALOG_LEAGUE_API_IDS.has(leagueId);
}
