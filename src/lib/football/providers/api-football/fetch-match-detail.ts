import type { MatchDetail } from "@/lib/data/match-detail";
import { matchDetailRevalidateSec } from "@/lib/football/match-detail-revalidate";
import { fetchApiFootballFixture } from "@/lib/football/providers/api-football/fetch-fixture";
import { buildMatchDetailFromApi } from "@/lib/football/providers/api-football/normalize-match-detail";
import { normalizeFixtureForMatchDetail } from "@/lib/football/providers/api-football/normalize-fixtures";
import { apiFootballGetSafe } from "@/lib/football/providers/api-football/request";
import { API_REVALIDATE_DEFAULT_SEC } from "@/lib/football/refresh-policy";
import type {
  ApiFootballFixtureEvent,
  ApiFootballFixtureInjury,
  ApiFootballFixturePlayers,
  ApiFootballFixtureStatistics,
  ApiFootballLineup,
  ApiFootballLiveFixture,
} from "@/lib/football/providers/api-football/types";

function teamFormQuery(
  teamId: number,
  season: number | undefined,
  last: number,
): Record<string, string | number> {
  const query: Record<string, string | number> = { team: teamId, last };
  if (season !== undefined) query.season = season;
  return query;
}

/**
 * Match detail is driven entirely by API-Football fixture sub-endpoints.
 * Flow: /fixtures → fan-out with `fixture`, `h2h`, and `team` query params.
 * @see https://www.api-football.com/documentation-v3#tag/Fixtures
 */
export async function fetchApiMatchDetail(
  apiKey: string,
  fixtureId: number,
): Promise<MatchDetail | null> {
  const fixture = await fetchApiFootballFixture(
    apiKey,
    fixtureId,
    API_REVALIDATE_DEFAULT_SEC,
  );

  if (!fixture) return null;

  const match = normalizeFixtureForMatchDetail(fixture);
  const revalidate = matchDetailRevalidateSec(match.statusShort);
  const { homeTeamId, awayTeamId } = match;
  const season = fixture.league.season;

  const [
    lineups,
    events,
    headToHead,
    statistics,
    playerStats,
    injuries,
    homeFormFixtures,
    awayFormFixtures,
  ] = await Promise.all([
    apiFootballGetSafe<ApiFootballLineup>(
      apiKey,
      "/fixtures/lineups",
      { fixture: fixtureId },
      revalidate,
    ),
    apiFootballGetSafe<ApiFootballFixtureEvent>(
      apiKey,
      "/fixtures/events",
      { fixture: fixtureId },
      revalidate,
    ),
    apiFootballGetSafe<ApiFootballLiveFixture>(
      apiKey,
      "/fixtures/headtohead",
      { h2h: `${homeTeamId}-${awayTeamId}`, last: 10 },
      revalidate,
    ),
    apiFootballGetSafe<ApiFootballFixtureStatistics>(
      apiKey,
      "/fixtures/statistics",
      { fixture: fixtureId },
      revalidate,
    ),
    apiFootballGetSafe<ApiFootballFixturePlayers>(
      apiKey,
      "/fixtures/players",
      { fixture: fixtureId },
      revalidate,
    ),
    apiFootballGetSafe<ApiFootballFixtureInjury>(
      apiKey,
      "/injuries",
      { fixture: fixtureId },
      revalidate,
    ),
    apiFootballGetSafe<ApiFootballLiveFixture>(
      apiKey,
      "/fixtures",
      teamFormQuery(homeTeamId, season, 6),
      revalidate,
    ),
    apiFootballGetSafe<ApiFootballLiveFixture>(
      apiKey,
      "/fixtures",
      teamFormQuery(awayTeamId, season, 6),
      revalidate,
    ),
  ]);

  return buildMatchDetailFromApi(
    fixture,
    lineups,
    headToHead,
    events,
    statistics,
    playerStats,
    injuries,
    homeFormFixtures,
    awayFormFixtures,
  );
}
