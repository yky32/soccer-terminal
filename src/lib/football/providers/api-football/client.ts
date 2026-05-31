import { apiRequest } from "@/lib/http/api-client";
import type {
  FootballDataProvider,
  LiveCountriesSnapshot,
} from "@/lib/football/provider";
import { enrichMatchesWithLocations } from "@/lib/football/enrich-match-locations";
import type { MapMatchMode } from "@/lib/data/map-match-mode";
import { buildLiveFixturesSnapshot } from "@/lib/football/providers/api-football/normalize-fixtures";
import { enrichMatchesWithEvents } from "@/lib/football/providers/api-football/enrich-fixture-events";
import {
  assertNoApiErrors,
  isRateLimitError,
} from "@/lib/football/providers/api-football/errors";
import { getCachedMapSnapshot } from "@/lib/football/providers/api-football/snapshot-cache";
import type {
  ApiFootballLiveFixture,
  ApiFootballLiveResponse,
} from "@/lib/football/providers/api-football/types";

const API_BASE = "https://v3.football.api-sports.io";
const FUTURE_DAYS = 7;
const UPCOMING_STATUSES = new Set(["NS", "TBD"]);

function upcomingDateRange(days: number) {
  const from = new Date();
  const to = new Date();
  to.setUTCDate(to.getUTCDate() + days - 1);

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function isUpcomingFixture(fixture: ApiFootballLiveFixture) {
  if (!UPCOMING_STATUSES.has(fixture.fixture.status.short)) return false;
  if (!fixture.fixture.date) return true;

  return Date.parse(fixture.fixture.date) >= Date.now() - 60_000;
}

async function fetchUpcomingFixtures(
  apiKey: string,
  days: number,
): Promise<ApiFootballLiveFixture[]> {
  const range = upcomingDateRange(days);

  const { data } = await apiRequest<ApiFootballLiveResponse>({
    scope: "server",
    provider: "api-football",
    method: "GET",
    url: `${API_BASE}/fixtures`,
    query: range,
    headers: {
      "x-apisports-key": apiKey,
    },
    next: { revalidate: 300 },
  });

  assertNoApiErrors(data);
  return data.response ?? [];
}

async function buildSnapshot(
  apiKey: string,
  mode: MapMatchMode,
  fixtures: ApiFootballLiveFixture[],
  withEvents = false,
): Promise<LiveCountriesSnapshot> {
  const snapshot = buildLiveFixturesSnapshot(fixtures);
  let matchesByCountry = snapshot.matchesByCountry;

  if (withEvents) {
    try {
      matchesByCountry = await enrichMatchesWithEvents(matchesByCountry, apiKey);
    } catch (error) {
      if (!isRateLimitError(error)) throw error;
    }
  }

  matchesByCountry = await enrichMatchesWithLocations(matchesByCountry);

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
  const { data } = await apiRequest<ApiFootballLiveResponse>({
    scope: "server",
    provider: "api-football",
    method: "GET",
    url: `${API_BASE}/fixtures`,
    query: { live: "all" },
    headers: {
      "x-apisports-key": apiKey,
    },
    next: { revalidate: 60 },
  });

  assertNoApiErrors(data);
  return buildSnapshot(apiKey, mode, data.response ?? [], true);
}

async function fetchFutureSnapshot(
  apiKey: string,
  mode: MapMatchMode,
): Promise<LiveCountriesSnapshot> {
  const fixtures = await fetchUpcomingFixtures(apiKey, FUTURE_DAYS);

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

    async getLeagues() {
      const { LEAGUE_CATALOG } = await import("@/lib/football/league-catalog");
      const { fetchAllLeagueProfiles } = await import(
        "@/lib/football/providers/api-football/fetch-league-profile"
      );
      return fetchAllLeagueProfiles(apiKey, LEAGUE_CATALOG);
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
