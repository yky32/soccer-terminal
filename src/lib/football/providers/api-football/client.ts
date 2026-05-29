import { apiRequest } from "@/lib/http/api-client";
import type {
  FootballDataProvider,
  LiveCountriesSnapshot,
} from "@/lib/football/provider";
import { enrichMatchesWithLocations } from "@/lib/football/enrich-match-locations";
import type { MapMatchMode } from "@/lib/data/map-match-mode";
import { buildLiveFixturesSnapshot } from "@/lib/football/providers/api-football/normalize-fixtures";
import type {
  ApiFootballLiveFixture,
  ApiFootballLiveResponse,
} from "@/lib/football/providers/api-football/types";

const API_BASE = "https://v3.football.api-sports.io";
const FUTURE_DAYS = 7;
const UPCOMING_STATUSES = new Set(["NS", "TBD"]);

function assertNoApiErrors(data: ApiFootballLiveResponse) {
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    throw new Error("API-Football returned errors for fixtures");
  }

  if (
    data.errors &&
    typeof data.errors === "object" &&
    !Array.isArray(data.errors) &&
    Object.keys(data.errors).length > 0
  ) {
    const message = Object.values(data.errors).join("; ");
    throw new Error(message || "API-Football returned errors");
  }
}

function upcomingDates(days: number) {
  const dates: string[] = [];

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + offset);
    dates.push(date.toISOString().slice(0, 10));
  }

  return dates;
}

function isUpcomingFixture(fixture: ApiFootballLiveFixture) {
  if (!UPCOMING_STATUSES.has(fixture.fixture.status.short)) return false;
  if (!fixture.fixture.date) return true;

  return Date.parse(fixture.fixture.date) >= Date.now() - 60_000;
}

async function fetchFixturesByDate(
  apiKey: string,
  date: string,
): Promise<ApiFootballLiveFixture[]> {
  const { data } = await apiRequest<ApiFootballLiveResponse>({
    scope: "server",
    provider: "api-football",
    method: "GET",
    url: `${API_BASE}/fixtures`,
    query: { date },
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

export function createApiFootballProvider(apiKey: string): FootballDataProvider {
  return {
    id: "api-football",

    async getMapCountries(mode: MapMatchMode): Promise<LiveCountriesSnapshot> {
      if (mode === "live") {
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
        return buildSnapshot(apiKey, mode, data.response ?? []);
      }

      const dates = upcomingDates(FUTURE_DAYS);
      const batches = await Promise.all(
        dates.map((date) => fetchFixturesByDate(apiKey, date)),
      );

      const seen = new Set<number>();
      const fixtures: ApiFootballLiveFixture[] = [];

      for (const batch of batches) {
        for (const fixture of batch) {
          if (!isUpcomingFixture(fixture)) continue;
          if (seen.has(fixture.fixture.id)) continue;
          seen.add(fixture.fixture.id);
          fixtures.push(fixture);
        }
      }

      return buildSnapshot(apiKey, mode, fixtures);
    },
  };
}
