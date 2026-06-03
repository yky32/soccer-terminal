import type {
  MatchDetail,
  MatchDetailLineupSide,
  MatchDetailPlayer,
  MatchDetailPlayerPerformance,
  MatchDetailScoreBreakdown,
  MatchDetailTimelineView,
} from "@/lib/data/match-detail";
import type { LiveMatch } from "@/lib/data/live-match";
import {
  buildCaptainIndexes,
  mergeCaptainIndexes,
  resolveCaptainFlag,
  type CaptainIndexes,
} from "@/lib/football/player-captain";

const EMPTY_SCORE: MatchDetailScoreBreakdown = {
  halftime: null,
  fulltime: null,
  extratime: null,
  penalty: null,
};

const EMPTY_TIMELINE: MatchDetailTimelineView = {
  showKickoff: false,
  segments: [],
};

function isTimelineView(value: unknown): value is MatchDetailTimelineView {
  return (
    typeof value === "object" &&
    value !== null &&
    "segments" in value &&
    Array.isArray((value as MatchDetailTimelineView).segments)
  );
}

/** Legacy flat timeline (HT was sometimes first) → empty; client refetches fresh data. */
function legacyFlatTimeline(value: unknown): boolean {
  return Array.isArray(value);
}

function lineupNumberIndex(side: MatchDetailLineupSide | null | undefined) {
  const index = new Map<number, string>();
  if (!side) return index;

  for (const player of [...side.starting, ...side.substitutes]) {
    if (player.id != null && player.number) {
      index.set(player.id, player.number);
    }
  }

  return index;
}

function coerceLineupSide(
  side: MatchDetailLineupSide | null,
  performanceCaptains: CaptainIndexes,
): MatchDetailLineupSide | null {
  if (!side) return null;

  const mapPlayer = (player: MatchDetailPlayer): MatchDetailPlayer => ({
    ...player,
    captain: resolveCaptainFlag(player, performanceCaptains),
  });

  return {
    ...side,
    coachPhoto: side.coachPhoto ?? null,
    starting: side.starting.map(mapPlayer),
    substitutes: side.substitutes.map(mapPlayer),
  };
}

function coercePlayerPerformance(
  player: MatchDetailPlayerPerformance,
  lineupNumbers: Map<number, string>,
  captainIndexes: CaptainIndexes,
): MatchDetailPlayerPerformance {
  return {
    id: player.id,
    name: player.name,
    photo: player.photo ?? null,
    number: player.number ?? lineupNumbers.get(player.id) ?? null,
    position: player.position ?? null,
    rating: player.rating ?? null,
    minutes: player.minutes ?? null,
    goals: player.goals ?? null,
    assists: player.assists ?? null,
    shotsTotal: player.shotsTotal ?? null,
    passesTotal: player.passesTotal ?? null,
    yellowCards: player.yellowCards ?? null,
    redCards: player.redCards ?? null,
    captain: resolveCaptainFlag(player, captainIndexes),
  };
}

function coercePlayerPerformances(
  performances: { home: MatchDetailPlayerPerformance[]; away: MatchDetailPlayerPerformance[] },
  lineups: { home: MatchDetailLineupSide | null; away: MatchDetailLineupSide | null },
  performanceCaptains: { home: CaptainIndexes; away: CaptainIndexes },
) {
  const homeNumbers = lineupNumberIndex(lineups.home);
  const awayNumbers = lineupNumberIndex(lineups.away);
  const homeLineupCaptains = buildCaptainIndexes([
    ...(lineups.home?.starting ?? []),
    ...(lineups.home?.substitutes ?? []),
  ]);
  const awayLineupCaptains = buildCaptainIndexes([
    ...(lineups.away?.starting ?? []),
    ...(lineups.away?.substitutes ?? []),
  ]);

  return {
    home: (performances.home ?? []).map((player) =>
      coercePlayerPerformance(
        player,
        homeNumbers,
        mergeCaptainIndexes(performanceCaptains.home, homeLineupCaptains),
      ),
    ),
    away: (performances.away ?? []).map((player) =>
      coercePlayerPerformance(
        player,
        awayNumbers,
        mergeCaptainIndexes(performanceCaptains.away, awayLineupCaptains),
      ),
    ),
  };
}

/** Ensures cached or partial payloads match the current MatchDetail shape. */
export function coerceMatchDetail(value: MatchDetail | null | undefined): MatchDetail | null {
  if (!value?.match) return null;

  const match = value.match as LiveMatch;

  let timeline: MatchDetailTimelineView = EMPTY_TIMELINE;
  if (isTimelineView(value.timeline)) {
    timeline = {
      showKickoff: value.timeline.showKickoff ?? false,
      segments: (value.timeline.segments ?? []).map((segment) => ({
        id: segment.id,
        events: segment.events ?? [],
        checkpoint: segment.checkpoint,
      })),
    };
  } else if (legacyFlatTimeline(value.timeline)) {
    timeline = EMPTY_TIMELINE;
  }

  const performancesRaw = value.playerPerformances ?? { home: [], away: [] };
  const performanceCaptains = {
    home: buildCaptainIndexes(performancesRaw.home ?? []),
    away: buildCaptainIndexes(performancesRaw.away ?? []),
  };

  const lineupsRaw = value.lineups ?? { home: null, away: null };
  const lineups = {
    home: coerceLineupSide(lineupsRaw.home, performanceCaptains.home),
    away: coerceLineupSide(lineupsRaw.away, performanceCaptains.away),
  };
  const playerPerformances = coercePlayerPerformances(
    performancesRaw,
    lineups,
    performanceCaptains,
  );

  return {
    match: {
      ...match,
      homeWinner: match.homeWinner ?? null,
      awayWinner: match.awayWinner ?? null,
    },
    referee: value.referee ?? null,
    timezone: value.timezone ?? null,
    score: value.score ?? EMPTY_SCORE,
    statistics: value.statistics ?? [],
    timeline,
    penaltyShootout: (value.penaltyShootout ?? []).map((kick, index) => ({
      ...kick,
      order: kick.order ?? index + 1,
      playerPhoto: kick.playerPhoto ?? null,
    })),
    injuries: value.injuries ?? [],
    lineups,
    headToHead: value.headToHead ?? [],
    h2hSummary: value.h2hSummary ?? { homeTeamWins: 0, awayTeamWins: 0, draws: 0 },
    homeForm: value.homeForm ?? [],
    awayForm: value.awayForm ?? [],
    playerPerformances,
  };
}
