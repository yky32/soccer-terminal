import type { LeagueProfile } from "@/lib/data/league-profile";
import type { LeagueCatalogEntry } from "@/lib/football/league-catalog";
import { seasonYearForEntry } from "@/lib/football/league-catalog";
import {
  buildLeagueShell,
  normalizeFixture,
  normalizeLeaderBoards,
  normalizeStandingRow,
  teamWinRatesFromStandings,
  type ApiFootballStandingsBlock,
  type ApiFootballTopPlayer,
} from "@/lib/football/providers/api-football/normalize-catalog";
import { apiFootballGet } from "@/lib/football/providers/api-football/request";
import type { ApiFootballLiveFixture } from "@/lib/football/providers/api-football/types";

function parseMatchday(round: string | null | undefined) {
  if (!round) return 0;
  const match = round.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

export async function fetchLeagueProfile(
  apiKey: string,
  entry: LeagueCatalogEntry,
): Promise<LeagueProfile> {
  const season = seasonYearForEntry(entry);
  const shell = buildLeagueShell(entry, season);

  try {
    const [standingsBlocks, upcoming, recent, topscorers, topassists, topyellow] =
      await Promise.all([
        apiFootballGet<ApiFootballStandingsBlock>(apiKey, "/standings", {
          league: entry.apiId,
          season,
        }),
        apiFootballGet<ApiFootballLiveFixture>(apiKey, "/fixtures", {
          league: entry.apiId,
          season,
          next: 8,
        }),
        apiFootballGet<ApiFootballLiveFixture>(apiKey, "/fixtures", {
          league: entry.apiId,
          season,
          last: 4,
        }),
        apiFootballGet<ApiFootballTopPlayer>(apiKey, "/players/topscorers", {
          league: entry.apiId,
          season,
        }).catch(() => [] as ApiFootballTopPlayer[]),
        apiFootballGet<ApiFootballTopPlayer>(apiKey, "/players/topassists", {
          league: entry.apiId,
          season,
        }).catch(() => [] as ApiFootballTopPlayer[]),
        apiFootballGet<ApiFootballTopPlayer>(apiKey, "/players/topyellowcards", {
          league: entry.apiId,
          season,
        }).catch(() => [] as ApiFootballTopPlayer[]),
      ]);

    const table = standingsBlocks[0]?.league.standings[0] ?? [];
    const standings = table.map(normalizeStandingRow);
    const fixtures = [...upcoming, ...recent]
      .map(normalizeFixture)
      .sort((a, b) => Date.parse(a.kickoffAt) - Date.parse(b.kickoffAt));

    const leaderBoards = normalizeLeaderBoards(topscorers, topassists, topyellow);
    leaderBoards.teamWinRates = teamWinRatesFromStandings(standings);

    const liveMatches = upcoming.filter(
      (fixture) => fixture.fixture.status.short === "1H" || fixture.fixture.status.short === "2H",
    ).length;

    const matchday = parseMatchday(upcoming[0]?.league.round ?? recent[0]?.league.round);

    return {
      ...shell,
      teams: standings.length,
      matchday: matchday || Math.max(1, Math.ceil(standings[0]?.played ?? 1)),
      liveMatches,
      standings,
      fixtures,
      leaderBoards,
    };
  } catch {
    return {
      ...shell,
      teams: 0,
      matchday: 0,
      liveMatches: 0,
      standings: [],
      fixtures: [],
    };
  }
}

export async function fetchAllLeagueProfiles(
  apiKey: string,
  entries: LeagueCatalogEntry[],
  batchSize = 4,
): Promise<LeagueProfile[]> {
  const profiles: LeagueProfile[] = [];

  for (let index = 0; index < entries.length; index += batchSize) {
    const batch = entries.slice(index, index + batchSize);
    profiles.push(...(await Promise.all(batch.map((entry) => fetchLeagueProfile(apiKey, entry)))));
  }

  return profiles;
}
