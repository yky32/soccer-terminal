import type {
  PlayerBodyStats,
  PlayerLeagueStats,
  PlayerMatchPerformance,
  PlayerPositionInfo,
  PlayerProfile,
} from "@/lib/data/player-profile";
import type { TeamPosition } from "@/lib/data/team-profile";
import type { PlayerSlugMatch } from "@/lib/football/provider";
import { getCatalogEntryById } from "@/lib/football/league-catalog";
import { resolveSeasonYearForEntry } from "@/lib/football/providers/api-football/resolve-season";
import { getCachedLeagueProfile } from "@/lib/football/providers/api-football/league-cache";
import { fetchLeagueProfile } from "@/lib/football/providers/api-football/fetch-league-profile";
import {
  type ApiFootballPlayerProfile,
  type ApiFootballSquad,
} from "@/lib/football/providers/api-football/normalize-catalog";
import { apiFootballGet, apiFootballGetSafe } from "@/lib/football/providers/api-football/request";
import type { ApiFootballLiveFixture } from "@/lib/football/providers/api-football/types";
import { playerSlugFromName, playerSlugFromTeamAndName } from "@/lib/player-paths";
import { teamSlugFromName } from "@/lib/team-paths";

type ApiFootballFixturePlayerBlock = {
  team: { id: number; name: string; logo: string | null };
  players: Array<{
    player: { id: number; name: string; photo: string | null };
    statistics: Array<{
      games: { minutes: number | null; rating: string | null };
      goals: { total: number | null; assists: number | null };
      shots: { total: number | null };
      passes: { total: number | null };
    }>;
  }>;
};

function mapPosition(position: string | null): TeamPosition {
  const value = (position ?? "").toLowerCase();
  if (value.includes("goalkeeper")) return "GK";
  if (value.includes("defender") || value.includes("back")) return "DEF";
  if (value.includes("midfield")) return "MID";
  if (value.includes("attacker") || value.includes("forward") || value.includes("wing")) {
    return "FWD";
  }
  return "MID";
}

function parseHeight(height: string | null) {
  if (!height) return 180;
  const match = height.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 180;
}

function parseWeight(weight: string | null) {
  if (!weight) return 75;
  const match = weight.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 75;
}

async function fetchPlayerSeasonProfile(
  apiKey: string,
  match: PlayerSlugMatch,
  season: number,
) {
  const byId = await apiFootballGetSafe<ApiFootballPlayerProfile>(apiKey, "/players", {
    id: match.playerId,
    season,
  });

  if (byId[0]) return byId[0];

  if (!match.standing.teamId) return null;

  const byTeam = await apiFootballGetSafe<ApiFootballPlayerProfile>(apiKey, "/players", {
    team: match.standing.teamId,
    season,
  });

  return byTeam.find((item) => item.player.id === match.playerId) ?? null;
}

async function fetchFixturePlayerStats(
  apiKey: string,
  fixtureId: number,
  playerId: number,
) {
  const blocks = await apiFootballGetSafe<ApiFootballFixturePlayerBlock>(
    apiKey,
    "/fixtures/players",
    { fixture: fixtureId },
    600,
  );

  for (const block of blocks) {
    const entry = block.players.find((item) => item.player.id === playerId);
    if (entry?.statistics[0]) return entry.statistics[0];
  }

  return null;
}

export async function findPlayerBySlug(
  apiKey: string,
  leagueId: string,
  playerSlug: string,
): Promise<PlayerSlugMatch | null> {
  const entry = getCatalogEntryById(leagueId);
  if (!entry) return null;

  const league =
    getCachedLeagueProfile(leagueId) ?? (await fetchLeagueProfile(apiKey, entry));

  const standing =
    league.standings.find((row) => {
      const prefix = `${teamSlugFromName(row.team)}-`;
      return playerSlug.startsWith(prefix) && Boolean(row.teamId);
    }) ?? null;

  if (!standing?.teamId) return null;

  const nameSlug = playerSlug.slice(`${teamSlugFromName(standing.team)}-`.length);
  const squads = await apiFootballGet<ApiFootballSquad>(apiKey, "/players/squads", {
    team: standing.teamId,
  });
  const players = squads[0]?.players ?? [];

  for (let slot = 0; slot < players.length; slot += 1) {
    const player = players[slot];
    if (!player) continue;
    if (playerSlugFromName(player.name) === nameSlug) {
      return {
        league,
        standing,
        playerId: player.id,
        name: player.name,
        slot,
      };
    }
  }

  return null;
}

export async function fetchPlayerProfile(
  apiKey: string,
  match: PlayerSlugMatch,
): Promise<PlayerProfile> {
  const entry = getCatalogEntryById(match.league.id);
  const season = entry
    ? await resolveSeasonYearForEntry(apiKey, entry)
    : new Date().getFullYear();
  const teamId = match.standing.teamId;

  const [profile, fixtures, squads] = await Promise.all([
    fetchPlayerSeasonProfile(apiKey, match, season),
    teamId
      ? apiFootballGetSafe<ApiFootballLiveFixture>(apiKey, "/fixtures", {
          team: teamId,
          last: 10,
          season,
        })
      : Promise.resolve([] as ApiFootballLiveFixture[]),
    teamId
      ? apiFootballGetSafe<ApiFootballSquad>(apiKey, "/players/squads", { team: teamId })
      : Promise.resolve([] as ApiFootballSquad[]),
  ]);

  const stats =
    profile?.statistics.find((item) => item.league.id === entry?.apiId) ??
    profile?.statistics[0];
  const squadPlayer = squads[0]?.players.find((player) => player.id === match.playerId);

  const position = mapPosition(squadPlayer?.position ?? null);
  const rating = Number.parseFloat(stats?.games.rating ?? "6.8") || 6.8;

  const leagueStats: PlayerLeagueStats = {
    appearances: stats?.games.appearences ?? 0,
    starts: stats?.games.lineups ?? 0,
    minutes: stats?.games.minutes ?? 0,
    goals: stats?.goals.total ?? 0,
    assists: stats?.goals.assists ?? 0,
    rating,
    fouls: stats?.fouls.committed ?? 0,
    yellowCards: stats?.cards.yellow ?? 0,
    redCards: stats?.cards.red ?? 0,
    shots: stats?.shots.total ?? 0,
    passAccuracy: stats?.passes.accuracy ?? 0,
    xG: 0,
    keyPasses: stats?.passes.key ?? 0,
  };

  const body: PlayerBodyStats = {
    heightCm: parseHeight(profile?.player.height ?? null),
    weightKg: parseWeight(profile?.player.weight ?? null),
    preferredFoot: "Right",
  };

  const positionInfo: PlayerPositionInfo = {
    primary: position,
    secondary: null,
    role: squadPlayer?.position ?? position,
  };

  const finishedFixtures = fixtures.filter(
    (fixture) => fixture.fixture.status.short === "FT",
  );

  const matchPerformances: PlayerMatchPerformance[] = [];

  for (const fixture of finishedFixtures.slice(0, 4)) {
    const isHome = fixture.teams.home.name === match.standing.team;
    const fixtureStats = await fetchFixturePlayerStats(
      apiKey,
      fixture.fixture.id,
      match.playerId,
    );

    matchPerformances.push({
      id: String(fixture.fixture.id),
      opponent: isHome ? fixture.teams.away.name : fixture.teams.home.name,
      opponentLogo: isHome ? fixture.teams.away.logo : fixture.teams.home.logo,
      isHome,
      date: fixture.fixture.date ?? new Date().toISOString(),
      rating: Number.parseFloat(fixtureStats?.games.rating ?? "0") || 6.5,
      goals: fixtureStats?.goals.total ?? 0,
      assists: fixtureStats?.goals.assists ?? 0,
      minutes: fixtureStats?.games.minutes ?? 0,
      matchday: fixture.league.round ?? "Fixture",
      shots: fixtureStats?.shots.total ?? 0,
      passes: fixtureStats?.passes.total ?? 0,
    });
  }

  return {
    slug: playerSlugFromTeamAndName(match.standing.team, match.name),
    slot: match.slot,
    name: match.name,
    avatar: profile?.player.photo ?? squadPlayer?.photo ?? null,
    number: squadPlayer?.number ?? match.slot + 1,
    age: profile?.player.age ?? squadPlayer?.age ?? 24,
    nationality: profile?.player.nationality ?? "International",
    team: match.standing.team,
    teamLogo: match.standing.teamLogo,
    teamSlug: teamSlugFromName(match.standing.team),
    league: match.league,
    body,
    position: positionInfo,
    marketValueEur: 0,
    leagueStats,
    matchPerformances,
    ratingTrend: matchPerformances.map((item) => item.rating),
  };
}
