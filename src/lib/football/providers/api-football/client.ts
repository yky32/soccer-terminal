import type {
  FootballDataProvider,
  LiveCountriesSnapshot,
} from "@/lib/football/provider";
import { enrichMatchesWithLocations } from "@/lib/football/enrich-match-locations";
import type { MapMatchMode } from "@/lib/data/map-match-mode";
import { isCatalogLeagueApiId } from "@/lib/football/catalog-leagues";
import { buildLiveFixturesSnapshot } from "@/lib/football/providers/api-football/normalize-fixtures";
import { isRateLimitError } from "@/lib/football/providers/api-football/errors";
import {
  API_REVALIDATE_DEFAULT_SEC,
  API_REVALIDATE_LIVE_SEC,
  CATALOG_FETCH_CONCURRENCY,
} from "@/lib/football/refresh-policy";
import {
  apiFootballFetch,
  mapInBatches,
} from "@/lib/football/providers/api-football/request";
import { getCachedMapSnapshot } from "@/lib/football/providers/api-football/snapshot-cache";
import type {
  ApiFootballLiveFixture,
} from "@/lib/football/providers/api-football/types";

const UPCOMING_PER_LEAGUE = 30;
const UPCOMING_STATUSES = new Set(["NS", "TBD"]);

function isUpcomingFixture(fixture: ApiFootballLiveFixture) {
  if (!isCatalogLeagueApiId(fixture.league.id)) return false;
  if (!UPCOMING_STATUSES.has(fixture.fixture.status.short)) return false;
  if (!fixture.fixture.date) return true;

  return Date.parse(fixture.fixture.date) >= Date.now() - 60_000;
}

async function fetchUpcomingFixtures(apiKey: string): Promise<ApiFootballLiveFixture[]> {
  const { LEAGUE_CATALOG } = await import("@/lib/football/league-catalog");
  const { resolveSeasonYearForEntry } = await import(
    "@/lib/football/providers/api-football/resolve-season"
  );

  const batches = await mapInBatches(
    LEAGUE_CATALOG,
    CATALOG_FETCH_CONCURRENCY,
    async (entry) => {
      const season = await resolveSeasonYearForEntry(apiKey, entry);
      const data = await apiFootballFetch<ApiFootballLiveFixture[]>(
        apiKey,
        "/fixtures",
        { league: entry.apiId, season, next: UPCOMING_PER_LEAGUE },
        API_REVALIDATE_DEFAULT_SEC,
      );
      return data.response ?? [];
    },
  );

  return batches.flat();
}

async function buildSnapshot(
  apiKey: string,
  mode: MapMatchMode,
  fixtures: ApiFootballLiveFixture[],
): Promise<LiveCountriesSnapshot> {
  const snapshot = buildLiveFixturesSnapshot(fixtures);
  const matchesByCountry = await enrichMatchesWithLocations(snapshot.matchesByCountry);

  return {
    mode,
    ...snapshot,
    matchesByCountry,
    updatedAt: new Date().toISOString(),
    provider: "api-football",
  };
}

async function fetchLiveSnapshot(
  apiKey: string,
  mode: MapMatchMode,
): Promise<LiveCountriesSnapshot> {
  const data = await apiFootballFetch<ApiFootballLiveFixture[]>(
    apiKey,
    "/fixtures",
    { live: "all" },
    API_REVALIDATE_LIVE_SEC,
  );

  const fixtures = (data.response ?? []).filter((fixture) =>
    isCatalogLeagueApiId(fixture.league.id),
  );

  return buildSnapshot(apiKey, mode, fixtures);
}

async function fetchFutureSnapshot(
  apiKey: string,
  mode: MapMatchMode,
): Promise<LiveCountriesSnapshot> {
  const fixtures = await fetchUpcomingFixtures(apiKey);

  const seen = new Set<number>();
  const upcoming: ApiFootballLiveFixture[] = [];

  for (const fixture of fixtures) {
    if (!isUpcomingFixture(fixture)) continue;
    if (seen.has(fixture.fixture.id)) continue;
    seen.add(fixture.fixture.id);
    upcoming.push(fixture);
  }

  return buildSnapshot(apiKey, mode, upcoming);
}

export function createApiFootballProvider(apiKey: string): FootballDataProvider {
  return {
    id: "api-football",

    async getMapCountries(mode: MapMatchMode): Promise<LiveCountriesSnapshot> {
      return getCachedMapSnapshot(mode, () =>
        mode === "live"
          ? fetchLiveSnapshot(apiKey, mode)
          : fetchFutureSnapshot(apiKey, mode),
      );
    },

    async getLeagueCatalog() {
      const { getLeagueCatalogShells } = await import("@/lib/football/league-catalog");
      return getLeagueCatalogShells();
    },

    async getLeagues() {
      return this.getLeagueCatalog();
    },

    async getLeagueById(id) {
      const { getCatalogEntryById } = await import("@/lib/football/league-catalog");
      const { fetchLeagueProfile } = await import(
        "@/lib/football/providers/api-football/fetch-league-profile"
      );
      const entry = getCatalogEntryById(id);
      if (!entry) return null;
      return fetchLeagueProfile(apiKey, entry);
    },

    async getTeamProfile(leagueId, teamSlug) {
      const { fetchTeamProfile } = await import(
        "@/lib/football/providers/api-football/fetch-team-profile"
      );
      return fetchTeamProfile(apiKey, leagueId, teamSlug);
    },

    async findPlayerBySlug(leagueId, playerSlug) {
      const { findPlayerBySlug } = await import(
        "@/lib/football/providers/api-football/fetch-player-profile"
      );
      return findPlayerBySlug(apiKey, leagueId, playerSlug);
    },

    async getPlayerProfile(match) {
      const { fetchPlayerProfile } = await import(
        "@/lib/football/providers/api-football/fetch-player-profile"
      );
      return fetchPlayerProfile(apiKey, match);
    },

    async getNewsArticles() {
      const { fetchNewsArticles } = await import(
        "@/lib/football/providers/api-football/fetch-news"
      );
      return fetchNewsArticles(apiKey);
    },
  };
}
