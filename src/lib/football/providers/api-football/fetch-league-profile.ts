import type { LeagueLeaderBoards, LeagueProfile } from "@/lib/data/league-profile";
import { entryHasKnockoutStage, type LeagueCatalogEntry } from "@/lib/football/league-catalog";
import { resolveSeasonYearForEntry } from "@/lib/football/providers/api-football/resolve-season";
import { finalizeApiLeaderBoards } from "@/lib/data/league-stats";
import {
  buildLeagueShell,
  flattenStandingsGroups,
  normalizeFixture,
  normalizeLeaderBoards,
  teamWinRatesFromStandings,
  type ApiFootballStandingsBlock,
  type ApiFootballTopPlayer,
} from "@/lib/football/providers/api-football/normalize-catalog";
import { fetchLeagueKnockoutBracket } from "@/lib/football/providers/api-football/fetch-league-knockout";
import { fetchLeagueSeasonHistory } from "@/lib/football/providers/api-football/fetch-league-seasons";
import { getLeagueProfileCached, primeLeagueCache } from "@/lib/football/providers/api-football/league-cache";
import { apiFootballGetSafe } from "@/lib/football/providers/api-football/request";
import { API_REVALIDATE_DEFAULT_SEC } from "@/lib/football/refresh-policy";
import type { ApiFootballLiveFixture } from "@/lib/football/providers/api-football/types";

function parseMatchday(round: string | null | undefined) {
  if (!round) return 0;
  const match = round.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

function emptyLeaderBoards(): LeagueLeaderBoards {
  return {
    players: { rating: [], goals: [], assists: [], fouls: [] },
    teamWinRates: [],
  };
}

async function fetchLeaderBoardsFromApi(
  apiKey: string,
  entry: LeagueCatalogEntry,
  season: number,
  standings: LeagueProfile["standings"],
): Promise<LeagueLeaderBoards> {
  const query = { league: entry.apiId, season };

  const [topscorers, topassists] = await Promise.all([
    apiFootballGetSafe<ApiFootballTopPlayer>(
      apiKey,
      "/players/topscorers",
      query,
      API_REVALIDATE_DEFAULT_SEC,
    ),
    apiFootballGetSafe<ApiFootballTopPlayer>(
      apiKey,
      "/players/topassists",
      query,
      API_REVALIDATE_DEFAULT_SEC,
    ),
  ]);

  if (topscorers.length === 0 && topassists.length === 0) {
    return {
      ...emptyLeaderBoards(),
      teamWinRates: teamWinRatesFromStandings(standings),
    };
  }

  const boards = normalizeLeaderBoards(topscorers, topassists);
  return {
    ...boards,
    teamWinRates: teamWinRatesFromStandings(standings),
  };
}

async function fetchLeagueProfileUncached(
  apiKey: string,
  entry: LeagueCatalogEntry,
): Promise<LeagueProfile> {
  const season = await resolveSeasonYearForEntry(apiKey, entry);
  const shell = buildLeagueShell(entry, season);

  const standingsBlocks = await apiFootballGetSafe<ApiFootballStandingsBlock>(
    apiKey,
    "/standings",
    { league: entry.apiId, season },
  );

  const standingsLeague = standingsBlocks[0]?.league;
  if (standingsLeague && standingsLeague.id !== entry.apiId) {
    return {
      ...shell,
      apiLeagueId: standingsLeague.id,
      apiSeason: season,
      teams: 0,
      matchday: 0,
      liveMatches: 0,
      standings: [],
      fixtures: [],
      leaderBoards: emptyLeaderBoards(),
      seasonHistory: [],
      knockoutBracket: entryHasKnockoutStage(entry)
        ? { published: false, rounds: [] }
        : undefined,
    };
  }

  const groups = standingsLeague?.standings ?? [];
  const standings = flattenStandingsGroups(groups);

  if (standings.length === 0) {
    return {
      ...shell,
      teams: 0,
      matchday: 0,
      liveMatches: 0,
      standings: [],
      fixtures: [],
      leaderBoards: emptyLeaderBoards(),
      seasonHistory: [],
      knockoutBracket: entryHasKnockoutStage(entry)
        ? { published: false, rounds: [] }
        : undefined,
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
  const leaderBoards = await fetchLeaderBoardsFromApi(apiKey, entry, season, standings);

  const champion = standings.find((row) => row.rank === 1) ?? standings[0];
  const topGoalscorer = leaderBoards.players.goals[0];

  const seasonHistory = await fetchLeagueSeasonHistory(
    apiKey,
    entry,
    season,
    champion
      ? { team: champion.team, logo: champion.teamLogo }
      : null,
    topGoalscorer
      ? { name: topGoalscorer.playerName, goals: topGoalscorer.value }
      : null,
  );

  const knockoutBracket = entryHasKnockoutStage(entry)
    ? await fetchLeagueKnockoutBracket(apiKey, entry, season)
    : undefined;

  return {
    ...shell,
    apiLeagueId: entry.apiId,
    apiSeason: season,
    teams: standings.length,
    matchday: matchday || Math.max(1, Math.ceil(standings[0]?.played ?? 1)),
    liveMatches,
    standings,
    fixtures,
    leaderBoards,
    seasonHistory,
    knockoutBracket,
  };
}

export async function fetchLeagueProfile(
  apiKey: string,
  entry: LeagueCatalogEntry,
): Promise<LeagueProfile> {
  const profile = await getLeagueProfileCached(entry, () =>
    fetchLeagueProfileUncached(apiKey, entry),
  );

  return {
    ...profile,
    leaderBoards: finalizeApiLeaderBoards(profile.leaderBoards ?? emptyLeaderBoards(), profile),
  };
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
