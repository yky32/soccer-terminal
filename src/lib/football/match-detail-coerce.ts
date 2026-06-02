import type {
  MatchDetail,
  MatchDetailScoreBreakdown,
  MatchDetailTimelineView,
} from "@/lib/data/match-detail";
import type { LiveMatch } from "@/lib/data/live-match";

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
    lineups: value.lineups ?? { home: null, away: null },
    headToHead: value.headToHead ?? [],
    h2hSummary: value.h2hSummary ?? { homeTeamWins: 0, awayTeamWins: 0, draws: 0 },
    homeForm: value.homeForm ?? [],
    awayForm: value.awayForm ?? [],
    playerPerformances: value.playerPerformances ?? { home: [], away: [] },
  };
}
