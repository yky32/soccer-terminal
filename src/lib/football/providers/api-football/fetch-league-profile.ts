import type { LeagueLeaderBoards, LeagueProfile } from "@/lib/data/league-profile";
import type { LeagueCatalogEntry } from "@/lib/football/league-catalog";
import { seasonYearForEntry } from "@/lib/football/league-catalog";
import {
  buildLeagueShell,
  normalizeFixture,
  normalizeStandingRow,
  teamWinRatesFromStandings,
  type ApiFootballStandingsBlock,
} from "@/lib/football/providers/api-football/normalize-catalog";
import { getLeagueProfileCached, primeLeagueCache } from "@/lib/football/providers/api-football/league-cache";
import { apiFootballGetSafe } from "@/lib/football/providers/api-football/request";
import type { ApiFootballLiveFixture } from "@/lib/football/providers/api-football/types";

function parseMatchday(round: string | null | undefined) {
  if (!round) return 0;
  const match = round.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

function leaderBoardsFromStandings(standings: LeagueProfile["standings"]): LeagueLeaderBoards {
  return {
    players: { rating: [], goals: [], assists: [], fouls: [] },
    teamWinRates: teamWinRatesFromStandings(standings),
  };
}

async function fetchLeagueProfileUncached(
  apiKey: string,
  entry: LeagueCatalogEntry,
): Promise<LeagueProfile> {
  const season = seasonYearForEntry(entry);
  const shell = buildLeagueShell(entry, season);

  const standingsBlocks = await apiFootballGetSafe<ApiFootballStandingsBlock>(
    apiKey,
    "/standings",
    { league: entry.apiId, season },
  );

  const table = standingsBlocks[0]?.league.standings[0] ?? [];
  const standings = table.map(normalizeStandingRow);

  if (standings.length === 0) {
    return {
      ...shell,
      teams: 0,
      matchday: 0,
      liveMatches: 0,
      standings: [],
      fixtures: [],
      leaderBoards: leaderBoardsFromStandings([]),
    };
  }

  const upcoming = await apiFootballGetSafe<ApiFootballLiveFixture>(apiKey, "/fixtures", {
    league: entry.apiId,
    season,
    next: 8,
  });

  const fixtures = upcoming
    .map(normalizeFixture)
    .sort((a, b) => Date.parse(a.kickoffAt) - Date.parse(b.kickoffAt));

  const liveMatches = upcoming.filter(
    (fixture) =>
      fixture.fixture.status.short === "1H" || fixture.fixture.status.short === "2H",
  ).length;

  const matchday = parseMatchday(upcoming[0]?.league.round);

  return {
    ...shell,
    teams: standings.length,
    matchday: matchday || Math.max(1, Math.ceil(standings[0]?.played ?? 1)),
    liveMatches,
    standings,
    fixtures,
    leaderBoards: leaderBoardsFromStandings(standings),
  };
}

export async function fetchLeagueProfile(
  apiKey: string,
  entry: LeagueCatalogEntry,
): Promise<LeagueProfile> {
  return getLeagueProfileCached(entry, () => fetchLeagueProfileUncached(apiKey, entry));
}

export async function fetchAllLeagueProfiles(
  apiKey: string,
  entries: LeagueCatalogEntry[],
): Promise<LeagueProfile[]> {
  const profiles: LeagueProfile[] = [];

  for (const entry of entries) {
    profiles.push(await fetchLeagueProfile(apiKey, entry));
  }

  primeLeagueCache(profiles);
  return profiles;
}
