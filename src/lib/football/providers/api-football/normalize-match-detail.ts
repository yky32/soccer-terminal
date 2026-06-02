import type {
  MatchDetail,
  MatchDetailH2HMatch,
  MatchDetailInjury,
  MatchDetailLineupSide,
  MatchDetailPlayer,
  MatchDetailPlayerPerformance,
} from "@/lib/data/match-detail";
import type { LiveMatch } from "@/lib/data/live-match";
import { coerceMatchDetail } from "@/lib/football/match-detail-coerce";
import {
  computeH2HSummary,
  normalizeMatchStatistics,
  buildMatchTimelineView,
  buildPlayerPhotoIndex,
  enrichPlayerPhotoIndexFromSquads,
  mergeFixtureEvents,
  normalizePenaltyShootout,
  normalizeScoreBreakdown,
  normalizeTeamForm,
  type PlayerPhotoIndex,
} from "@/lib/football/providers/api-football/normalize-match-detail-helpers";
import {
  normalizeFixtureForMatchDetail,
} from "@/lib/football/providers/api-football/normalize-fixtures";
import type { ApiFootballSquad } from "@/lib/football/providers/api-football/normalize-catalog";
import type {
  ApiFootballFixtureEvent,
  ApiFootballFixtureInjury,
  ApiFootballFixturePlayers,
  ApiFootballFixtureStatistics,
  ApiFootballLineup,
  ApiFootballLineupPlayer,
  ApiFootballLiveFixture,
} from "@/lib/football/providers/api-football/types";

type PlayerPerformanceIndex = Map<
  number,
  {
    rating: string | null;
    minutes: number | null;
    goals: number | null;
    assists: number | null;
    number: string | null;
    position: string | null;
  }
>;

function buildPlayerPerformanceIndex(
  blocks: ApiFootballFixturePlayers[],
): PlayerPerformanceIndex {
  const index: PlayerPerformanceIndex = new Map();

  for (const block of blocks) {
    for (const entry of block.players) {
      const stats = entry.statistics[0];
      if (!entry.player.id) continue;

      index.set(entry.player.id, {
        rating: stats?.games.rating ?? null,
        minutes: stats?.games.minutes ?? null,
        goals: stats?.goals?.total ?? null,
        assists: stats?.goals?.assists ?? null,
        number:
          stats?.games.number !== null && stats?.games.number !== undefined
            ? String(stats.games.number)
            : null,
        position: stats?.games.position?.trim() || null,
      });
    }
  }

  return index;
}

function lineupPlayer(
  player: ApiFootballLineupPlayer,
  performance: PlayerPerformanceIndex,
  photos: PlayerPhotoIndex,
): MatchDetailPlayer | null {
  const name = player.name?.trim();
  if (!name) return null;

  const perf = player.id ? performance.get(player.id) : undefined;
  const photo =
    player.photo ?? (player.id ? (photos.get(player.id) ?? null) : null);

  return {
    id: player.id,
    name,
    number:
      player.number === null || player.number === undefined
        ? (perf?.number ?? null)
        : String(player.number),
    position: player.pos?.trim() || perf?.position || null,
    grid: player.grid?.trim() || null,
    photo,
    rating: perf?.rating ?? null,
    minutes: perf?.minutes ?? null,
    goals: perf?.goals ?? null,
    assists: perf?.assists ?? null,
  };
}

function normalizeLineupSide(
  lineup: ApiFootballLineup,
  performance: PlayerPerformanceIndex,
  photos: PlayerPhotoIndex,
): MatchDetailLineupSide {
  const starting = lineup.startXI
    .map((entry) => lineupPlayer(entry.player, performance, photos))
    .filter((player): player is MatchDetailPlayer => player !== null);
  const substitutes = lineup.substitutes
    .map((entry) => lineupPlayer(entry.player, performance, photos))
    .filter((player): player is MatchDetailPlayer => player !== null);

  return {
    team: lineup.team.name,
    teamLogo: lineup.team.logo,
    formation: lineup.formation?.trim() || null,
    coach: lineup.coach?.name?.trim() || null,
    starting,
    substitutes,
  };
}

function normalizePlayerPerformances(
  match: LiveMatch,
  blocks: ApiFootballFixturePlayers[],
): { home: MatchDetailPlayerPerformance[]; away: MatchDetailPlayerPerformance[] } {
  const homeBlock = blocks.find((block) => block.team.id === match.homeTeamId);
  const awayBlock = blocks.find((block) => block.team.id === match.awayTeamId);

  const mapBlock = (block: ApiFootballFixturePlayers | undefined) => {
    if (!block) return [];

    const byPlayerId = new Map<number, MatchDetailPlayerPerformance>();

    for (const entry of block.players) {
      const stats = entry.statistics[0];
      if (!stats) continue;

      byPlayerId.set(entry.player.id, {
        id: entry.player.id,
        name: entry.player.name,
        photo: entry.player.photo,
        position: stats.games.position?.trim() || null,
        rating: stats.games.rating,
        minutes: stats.games.minutes,
        goals: stats.goals?.total ?? null,
        assists: stats.goals?.assists ?? null,
        shotsTotal: stats.shots?.total ?? null,
        passesTotal: stats.passes?.total ?? null,
        yellowCards: stats.cards?.yellow ?? null,
        redCards: stats.cards?.red ?? null,
      });
    }

    return [...byPlayerId.values()].sort((left, right) => {
        const leftRating = Number.parseFloat(left.rating ?? "0");
        const rightRating = Number.parseFloat(right.rating ?? "0");
        if (rightRating !== leftRating) return rightRating - leftRating;
        return (right.minutes ?? 0) - (left.minutes ?? 0);
      });
  };

  return {
    home: mapBlock(homeBlock),
    away: mapBlock(awayBlock),
  };
}

function normalizeInjuries(injuries: ApiFootballFixtureInjury[]): MatchDetailInjury[] {
  return injuries.map((row, index) => ({
    id: `injury-${row.player.id}-${index}`,
    player: row.player.name,
    playerPhoto: row.player.photo,
    team: row.team.name,
    teamLogo: row.team.logo,
    type: row.player.type?.trim() || null,
    reason: row.player.reason?.trim() || null,
  }));
}

function normalizeH2HMatch(fixture: ApiFootballLiveFixture): MatchDetailH2HMatch {
  const match = normalizeFixtureForMatchDetail(fixture);

  return {
    id: match.id,
    date: match.kickoffAt,
    league: match.league,
    leagueLogo: match.leagueLogo,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeGoals: match.homeGoals,
    awayGoals: match.awayGoals,
    homeLogo: match.homeLogo,
    awayLogo: match.awayLogo,
  };
}

export function buildMatchDetailFromApi(
  fixture: ApiFootballLiveFixture,
  lineups: ApiFootballLineup[],
  headToHead: ApiFootballLiveFixture[],
  events: ApiFootballFixtureEvent[],
  statistics: ApiFootballFixtureStatistics[],
  playerStats: ApiFootballFixturePlayers[],
  injuries: ApiFootballFixtureInjury[],
  homeFormFixtures: ApiFootballLiveFixture[],
  awayFormFixtures: ApiFootballLiveFixture[],
  squads: ApiFootballSquad[] = [],
): MatchDetail {
  const match = normalizeFixtureForMatchDetail(fixture);
  const performance = buildPlayerPerformanceIndex(playerStats);

  const homeLineup = lineups.find((lineup) => lineup.team.id === match.homeTeamId) ?? null;
  const awayLineup = lineups.find((lineup) => lineup.team.id === match.awayTeamId) ?? null;

  const eventList = mergeFixtureEvents(events, fixture.events);
  const playerPhotos = enrichPlayerPhotoIndexFromSquads(
    buildPlayerPhotoIndex(lineups, playerStats),
    squads,
  );
  const score = normalizeScoreBreakdown(fixture, match);
  const h2hSeen = new Set<number>();
  const h2hRows = headToHead
    .map(normalizeH2HMatch)
    .filter((row) => {
      if (row.id === match.id) return false;
      if (h2hSeen.has(row.id)) return false;
      h2hSeen.add(row.id);
      return true;
    })
    .slice(0, 10);

  return coerceMatchDetail({
    match: {
      ...match,
      events: [],
    },
    referee: fixture.fixture.referee?.trim() || null,
    timezone: fixture.fixture.timezone?.trim() || null,
    score,
    statistics: normalizeMatchStatistics(match, statistics),
    timeline: buildMatchTimelineView(match, eventList, score, playerPhotos),
    penaltyShootout: normalizePenaltyShootout(match, eventList, playerPhotos),
    injuries: normalizeInjuries(injuries),
    lineups: {
      home: homeLineup ? normalizeLineupSide(homeLineup, performance, playerPhotos) : null,
      away: awayLineup ? normalizeLineupSide(awayLineup, performance, playerPhotos) : null,
    },
    playerPerformances: normalizePlayerPerformances(match, playerStats),
    headToHead: h2hRows,
    h2hSummary: computeH2HSummary(match, h2hRows),
    homeForm: normalizeTeamForm(match.homeTeam, homeFormFixtures, match.id),
    awayForm: normalizeTeamForm(match.awayTeam, awayFormFixtures, match.id),
  })!;
}
