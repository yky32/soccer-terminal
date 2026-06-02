import type {
  MatchDetailFormMatch,
  MatchDetailH2HMatch,
  MatchDetailH2HSummary,
  MatchDetailPenaltyKick,
  MatchDetailScoreBreakdown,
  MatchDetailStat,
  MatchDetailTimelineItem,
  MatchDetailTimelinePerson,
  MatchDetailTimelineView,
  MatchTimelineCheckpoint,
  MatchTimelineSegment,
} from "@/lib/data/match-detail";
import type { LiveMatch } from "@/lib/data/live-match";
import type {
  ApiFootballFixtureEvent,
  ApiFootballFixturePlayers,
  ApiFootballFixtureStatistics,
  ApiFootballLineup,
  ApiFootballLiveFixture,
} from "@/lib/football/providers/api-football/types";
import { normalizeFixtureForMatchDetail } from "@/lib/football/providers/api-football/normalize-fixtures";

const STAT_TYPE_ORDER = [
  "Ball Possession",
  "expected_goals",
  "Total Shots",
  "Shots on Goal",
  "Shots off Goal",
  "Blocked Shots",
  "Shots insidebox",
  "Shots outsidebox",
  "Corner Kicks",
  "Offsides",
  "Fouls",
  "Yellow Cards",
  "Red Cards",
  "Goalkeeper Saves",
  "Total passes",
  "Passes accurate",
  "Passes %",
  "goals_prevented",
];

function statLabel(type: string) {
  if (type === "expected_goals") return "Expected goals (xG)";
  if (type === "Passes %") return "Pass accuracy";
  if (type === "Passes accurate") return "Accurate passes";
  if (type === "Shots on Goal") return "Shots on target";
  if (type === "Shots off Goal") return "Shots off target";
  if (type === "Shots insidebox") return "Shots inside box";
  if (type === "Shots outsidebox") return "Shots outside box";
  if (type === "Corner Kicks") return "Corners";
  if (type === "goals_prevented") return "Goals prevented";
  return type;
}

function scorePair(
  pair?: { home: number | null; away: number | null } | null,
): { home: number; away: number } | null {
  if (!pair || pair.home === null || pair.away === null) return null;
  return { home: pair.home, away: pair.away };
}

export function normalizeScoreBreakdown(
  fixture: ApiFootballLiveFixture,
  match: LiveMatch,
): MatchDetailScoreBreakdown {
  const score = fixture.score;
  const fulltime = scorePair(score?.fulltime);
  const extratime = scorePair(score?.extratime);
  const penalty = scorePair(score?.penalty);

  return {
    halftime: scorePair(score?.halftime),
    fulltime:
      fulltime ??
      (match.statusShort !== "NS" && match.statusShort !== "TBD"
        ? { home: match.homeGoals, away: match.awayGoals }
        : null),
    extratime,
    penalty,
  };
}

function parseStatValue(value: string | number | null): { display: string; numeric: number | null } {
  if (value === null || value === undefined) return { display: "—", numeric: null };
  if (typeof value === "number") return { display: String(value), numeric: value };

  const trimmed = value.trim();
  if (!trimmed) return { display: "—", numeric: null };

  const percent = trimmed.endsWith("%") ? Number.parseFloat(trimmed) : Number.NaN;
  if (Number.isFinite(percent) && trimmed.endsWith("%")) {
    return { display: trimmed, numeric: percent };
  }

  const numeric = Number.parseFloat(trimmed);
  if (Number.isFinite(numeric)) return { display: trimmed, numeric };

  return { display: trimmed, numeric: null };
}

export function normalizeMatchStatistics(
  match: LiveMatch,
  blocks: ApiFootballFixtureStatistics[],
): MatchDetailStat[] {
  const homeBlock = blocks.find((block) => block.team.id === match.homeTeamId);
  const awayBlock = blocks.find((block) => block.team.id === match.awayTeamId);
  if (!homeBlock || !awayBlock) return [];

  const typeSet = new Set<string>();
  for (const row of homeBlock.statistics) typeSet.add(row.type);
  for (const row of awayBlock.statistics) typeSet.add(row.type);

  const orderedTypes = [
    ...STAT_TYPE_ORDER.filter((type) => typeSet.has(type)),
    ...[...typeSet].filter((type) => !STAT_TYPE_ORDER.includes(type)).sort(),
  ];

  const stats: MatchDetailStat[] = [];

  for (const type of orderedTypes) {
    const homeEntry = homeBlock.statistics.find((row) => row.type === type);
    const awayEntry = awayBlock.statistics.find((row) => row.type === type);

    const home = parseStatValue(homeEntry?.value ?? null);
    const away = parseStatValue(awayEntry?.value ?? null);

    if (home.display === "—" && away.display === "—") continue;

    stats.push({
      key: type.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label: statLabel(type),
      home: home.display,
      away: away.display,
      homeNumeric: home.numeric,
      awayNumeric: away.numeric,
    });
  }

  return stats;
}

function eventTeamSide(
  match: Pick<LiveMatch, "homeTeam" | "awayTeam">,
  teamName: string,
): "home" | "away" | "neutral" {
  if (teamName === match.homeTeam) return "home";
  if (teamName === match.awayTeam) return "away";
  return "neutral";
}

function formatEventMinute(event: ApiFootballFixtureEvent) {
  const { elapsed, extra } = event.time;
  if (extra) return `${elapsed}+${extra}`;
  if (elapsed === null || elapsed === undefined) return "—";
  return `${elapsed}'`;
}

function isPenaltyShootoutKick(event: ApiFootballFixtureEvent, match: LiveMatch) {
  const detail = event.detail?.trim() ?? "";
  if (detail !== "Penalty" && detail !== "Missed Penalty") return false;

  const comments = event.comments?.toLowerCase() ?? "";
  if (comments.includes("penalty shootout") || comments.includes("shootout")) {
    return true;
  }

  const elapsed = event.time.elapsed ?? 0;
  const extra = event.time.extra ?? 0;
  if (elapsed >= 120 && extra > 0) return true;

  if (match.statusShort === "PEN" && elapsed >= 120) return true;

  return false;
}

export function mergeFixtureEvents(
  dedicated: ApiFootballFixtureEvent[],
  embedded: ApiFootballFixtureEvent[] | undefined,
): ApiFootballFixtureEvent[] {
  const combined = [...(embedded ?? []), ...dedicated];
  const seen = new Set<string>();
  const merged: ApiFootballFixtureEvent[] = [];

  for (const event of combined) {
    const key = [
      event.time.elapsed,
      event.time.extra,
      event.team.id,
      event.player.id,
      event.type,
      event.detail,
      event.player.name,
    ].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(event);
  }

  return merged.sort((a, b) => eventSortKey(a) - eventSortKey(b));
}

function runningScore(
  match: LiveMatch,
  events: ApiFootballFixtureEvent[],
  throughIndex: number,
) {
  let home = 0;
  let away = 0;

  for (let index = 0; index <= throughIndex; index += 1) {
    const event = events[index];
    if (event.type !== "Goal") continue;
    if (isPenaltyShootoutKick(event, match)) continue;
    if (event.detail === "Missed Penalty") continue;

    const side = eventTeamSide(match, event.team.name);
    if (side === "home") home += 1;
    if (side === "away") away += 1;
  }

  return `${home}–${away}`;
}

export type PlayerPhotoIndex = Map<number, string | null>;

export function buildPlayerPhotoIndex(
  lineups: ApiFootballLineup[],
  playerStats: ApiFootballFixturePlayers[],
): PlayerPhotoIndex {
  const index: PlayerPhotoIndex = new Map();

  for (const lineup of lineups) {
    for (const entry of [...lineup.startXI, ...lineup.substitutes]) {
      const player = entry.player;
      if (!player.id) continue;
      const existing = index.get(player.id);
      index.set(player.id, player.photo ?? existing ?? null);
    }
  }

  for (const block of playerStats) {
    for (const entry of block.players) {
      const existing = index.get(entry.player.id);
      index.set(entry.player.id, entry.player.photo ?? existing ?? null);
    }
  }

  return index;
}

function timelinePerson(
  photos: PlayerPhotoIndex,
  id: number | null,
  name: string | null | undefined,
  fallback: string,
): MatchDetailTimelinePerson {
  const trimmed = name?.trim();
  return {
    name: trimmed || fallback,
    photo: id ? (photos.get(id) ?? null) : null,
  };
}

function parseCardKind(detail: string): "yellow" | "red" {
  const lower = detail.toLowerCase();
  if (lower.includes("red") || lower.includes("second yellow")) return "red";
  return "yellow";
}

function timelineLabel(event: ApiFootballFixtureEvent) {
  const player = event.player.name?.trim();
  const assist = event.assist.name?.trim();

  if (event.type === "subst") {
    const out = player ?? "Off";
    const inPlayer = assist ?? "On";
    return { primary: `${out} → ${inPlayer}` };
  }

  if (event.type === "Card") {
    return { primary: player ?? event.detail, secondary: event.detail };
  }

  if (event.type === "Goal") {
    const detail = event.detail?.trim();
    const secondary =
      detail && detail !== "Normal Goal" ? detail : assist ? `Assist: ${assist}` : undefined;
    return { primary: player ?? "Goal", secondary };
  }

  if (event.type === "Var") {
    return {
      primary: event.detail?.trim() || "VAR review",
      secondary: player ?? event.comments?.trim(),
    };
  }

  const detail = event.detail?.trim();
  const comments = event.comments?.trim();
  return {
    primary: player ?? event.type,
    secondary: [detail, comments].filter(Boolean).join(" · ") || undefined,
  };
}

function timelineType(event: ApiFootballFixtureEvent): MatchDetailTimelineItem["type"] {
  if (event.type === "Goal") return "goal";
  if (event.type === "Card") return "card";
  if (event.type === "subst") return "subst";
  return "info";
}

function eventSortKey(event: ApiFootballFixtureEvent) {
  return (event.time.elapsed ?? 0) * 100 + (event.time.extra ?? 0);
}

function isFirstHalfEvent(event: ApiFootballFixtureEvent) {
  return (event.time.elapsed ?? 0) <= 45;
}

function isSecondHalfEvent(event: ApiFootballFixtureEvent) {
  const elapsed = event.time.elapsed ?? 0;
  return elapsed >= 46 && elapsed <= 90;
}

function isExtraTimeEvent(event: ApiFootballFixtureEvent) {
  return (event.time.elapsed ?? 0) >= 91;
}

function matchHasStarted(statusShort: string) {
  return !["NS", "TBD"].includes(statusShort);
}

function periodMarker(
  id: string,
  minute: string,
  primary: string,
  scoreAfter?: string,
  secondary?: string,
): MatchDetailTimelineItem {
  return {
    id,
    minute,
    type: "period",
    team: "neutral",
    primary,
    secondary,
    scoreAfter,
  };
}

function eventToTimelineItem(
  match: LiveMatch,
  event: ApiFootballFixtureEvent,
  globalIndex: number,
  allEvents: ApiFootballFixtureEvent[],
  photos: PlayerPhotoIndex,
): MatchDetailTimelineItem {
  const { primary, secondary } = timelineLabel(event);
  const team = eventTeamSide(match, event.team.name);
  const isGoal = event.type === "Goal" && event.detail !== "Missed Penalty";
  const base: MatchDetailTimelineItem = {
    id: `timeline-${globalIndex}-${event.time.elapsed}-${event.type}-${event.detail}-${event.player.name ?? ""}`,
    minute: formatEventMinute(event),
    type: timelineType(event),
    team,
    primary,
    secondary,
    scoreAfter: isGoal ? runningScore(match, allEvents, globalIndex) : undefined,
  };

  if (event.type === "subst") {
    const out = timelinePerson(photos, event.player.id, event.player.name, "Off");
    const inPlayer = timelinePerson(photos, event.assist.id, event.assist.name, "On");
    return {
      ...base,
      subst: { out, in: inPlayer },
      primary: `${out.name} → ${inPlayer.name}`,
      secondary: undefined,
    };
  }

  if (event.type === "Card") {
    const player = timelinePerson(photos, event.player.id, event.player.name, "Player");
    return {
      ...base,
      player,
      cardKind: parseCardKind(event.detail),
      primary: player.name,
      secondary: undefined,
    };
  }

  if (event.type === "Goal") {
    const player = timelinePerson(photos, event.player.id, event.player.name, "Goal");
    const assistName = event.assist.name?.trim();
    const assist =
      assistName && event.detail !== "Own Goal"
        ? timelinePerson(photos, event.assist.id, event.assist.name, "Assist")
        : undefined;
    const detail = event.detail?.trim();
    const goalSecondary =
      detail && detail !== "Normal Goal"
        ? detail
        : assist
          ? `Assist · ${assist.name}`
          : undefined;
    return {
      ...base,
      player,
      assist,
      primary: player.name,
      secondary: goalSecondary,
    };
  }

  const playerName = event.player.name?.trim();
  if (playerName) {
    return {
      ...base,
      player: timelinePerson(photos, event.player.id, event.player.name, playerName),
    };
  }

  return base;
}

function mapEventsToTimeline(
  match: LiveMatch,
  regulationEvents: ApiFootballFixtureEvent[],
  subset: ApiFootballFixtureEvent[],
  photos: PlayerPhotoIndex,
) {
  return subset.map((event) => {
    const globalIndex = regulationEvents.indexOf(event);
    return eventToTimelineItem(match, event, globalIndex, regulationEvents, photos);
  });
}

function pushSegment(
  segments: MatchTimelineSegment[],
  id: string,
  events: MatchDetailTimelineItem[],
  checkpoint?: MatchTimelineCheckpoint,
) {
  if (events.length === 0 && !checkpoint) return;
  segments.push({ id, events, checkpoint });
}

/** Chronological story: kickoff → 1H events → HT → 2H events → FT → ET → Pen. */
export function buildMatchTimelineView(
  match: LiveMatch,
  events: ApiFootballFixtureEvent[],
  score: MatchDetailScoreBreakdown,
  photos: PlayerPhotoIndex = new Map(),
): MatchDetailTimelineView {
  const regulationEvents = events
    .filter((event) => !isPenaltyShootoutKick(event, match))
    .sort((a, b) => eventSortKey(a) - eventSortKey(b));

  const firstHalf = regulationEvents.filter(isFirstHalfEvent);
  const secondHalf = regulationEvents.filter(isSecondHalfEvent);
  const extraTime = regulationEvents.filter(isExtraTimeEvent);
  const started = matchHasStarted(match.statusShort);
  const segments: MatchTimelineSegment[] = [];

  pushSegment(
    segments,
    "first-half",
    mapEventsToTimeline(match, regulationEvents, firstHalf, photos),
    score.halftime
      ? { label: "HT", score: `${score.halftime.home}–${score.halftime.away}` }
      : undefined,
  );

  const showFullTime =
    score.fulltime &&
    started &&
    (firstHalf.length > 0 || secondHalf.length > 0 || score.halftime !== null);

  pushSegment(
    segments,
    "second-half",
    mapEventsToTimeline(match, regulationEvents, secondHalf, photos),
    showFullTime && score.fulltime
      ? { label: "FT", score: `${score.fulltime.home}–${score.fulltime.away}` }
      : undefined,
  );

  const hasExtraTime = extraTime.length > 0 || score.extratime !== null;

  if (hasExtraTime) {
    pushSegment(
      segments,
      "extra-time",
      mapEventsToTimeline(match, regulationEvents, extraTime, photos),
      score.extratime
        ? { label: "AET", score: `${score.extratime.home}–${score.extratime.away}` }
        : { label: "ET" },
    );
  }

  if (score.penalty) {
    pushSegment(segments, "penalties", [], {
      label: "Pen",
      score: `${score.penalty.home}–${score.penalty.away}`,
    });
  }

  return {
    showKickoff: started,
    segments,
  };
}

export function normalizePenaltyShootout(
  match: LiveMatch,
  events: ApiFootballFixtureEvent[],
  photos: PlayerPhotoIndex = new Map(),
): MatchDetailPenaltyKick[] {
  const kicks = events.filter(
    (event) =>
      isPenaltyShootoutKick(event, match) &&
      (event.type === "Goal" || event.detail === "Missed Penalty"),
  );

  let homeScore = 0;
  let awayScore = 0;

  return kicks.map((event, index) => {
    const team = eventTeamSide(match, event.team.name);
    const scored = event.detail === "Penalty";

    if (scored) {
      if (team === "home") homeScore += 1;
      if (team === "away") awayScore += 1;
    }

    const playerName = event.player.name?.trim() || "Unknown";
    return {
      id: `pen-${index}`,
      order: index + 1,
      team: team === "neutral" ? "home" : team,
      player: playerName,
      playerPhoto: event.player.id ? (photos.get(event.player.id) ?? null) : null,
      scored,
      homeScore,
      awayScore,
    };
  });
}

export function computeH2HSummary(
  match: LiveMatch,
  rows: MatchDetailH2HMatch[],
): MatchDetailH2HSummary {
  const summary: MatchDetailH2HSummary = {
    homeTeamWins: 0,
    awayTeamWins: 0,
    draws: 0,
  };

  for (const row of rows) {
    const homeGoals = row.homeGoals;
    const awayGoals = row.awayGoals;

    if (homeGoals === awayGoals) {
      summary.draws += 1;
      continue;
    }

    const homeTeamWon =
      (row.homeTeam === match.homeTeam && homeGoals > awayGoals) ||
      (row.awayTeam === match.homeTeam && awayGoals > homeGoals);

    if (homeTeamWon) summary.homeTeamWins += 1;
    else summary.awayTeamWins += 1;
  }

  return summary;
}

function resultForTeam(
  fixture: ApiFootballLiveFixture,
  teamName: string,
): "W" | "D" | "L" | null {
  const homeGoals = fixture.goals.home ?? 0;
  const awayGoals = fixture.goals.away ?? 0;
  const isHome = fixture.teams.home.name === teamName;
  const isAway = fixture.teams.away.name === teamName;
  if (!isHome && !isAway) return null;

  const goalsFor = isHome ? homeGoals : awayGoals;
  const goalsAgainst = isHome ? awayGoals : homeGoals;

  if (goalsFor > goalsAgainst) return "W";
  if (goalsFor < goalsAgainst) return "L";
  return "D";
}

export function normalizeTeamForm(
  teamName: string,
  fixtures: ApiFootballLiveFixture[],
  excludeFixtureId: number,
): MatchDetailFormMatch[] {
  return fixtures
    .filter(
      (fixture) =>
        fixture.fixture.id !== excludeFixtureId &&
        ["FT", "AET", "PEN"].includes(fixture.fixture.status.short),
    )
    .slice(0, 5)
    .map((fixture) => {
      const isHome = fixture.teams.home.name === teamName;
      const goalsFor = isHome ? (fixture.goals.home ?? 0) : (fixture.goals.away ?? 0);
      const goalsAgainst = isHome ? (fixture.goals.away ?? 0) : (fixture.goals.home ?? 0);
      const result = resultForTeam(fixture, teamName) ?? "D";

      return {
        id: fixture.fixture.id,
        opponent: isHome ? fixture.teams.away.name : fixture.teams.home.name,
        opponentLogo: isHome ? fixture.teams.away.logo : fixture.teams.home.logo,
        isHome,
        goalsFor,
        goalsAgainst,
        result,
        date: fixture.fixture.date ?? null,
      };
    });
}
