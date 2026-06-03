import type {
  MatchDetailPlayer,
  MatchDetailTimelineView,
} from "@/lib/data/match-detail";

export type LineupPlayerHighlight = {
  topRating: boolean;
  worstRating: boolean;
  subbedOut: boolean;
  subOutMinute: string | null;
};

export type LineupTeamHighlights = {
  topRatingKeys: Set<string>;
  worstRatingKeys: Set<string>;
  hasRatingSpread: boolean;
  subbedOut: Map<string, string>;
};

export function lineupPlayerKey(player: MatchDetailPlayer) {
  return player.id != null ? `id:${player.id}` : `name:${player.name.trim().toLowerCase()}`;
}

export function parsePlayerRating(rating: string | null | undefined) {
  if (!rating?.trim()) return null;
  const value = Number.parseFloat(rating);
  return Number.isFinite(value) ? value : null;
}

function normalizeNameKey(name: string) {
  return name.trim().toLowerCase();
}

function namesMatch(lineupName: string, eventName: string) {
  const left = normalizeNameKey(lineupName);
  const right = normalizeNameKey(eventName);
  if (left === right) return true;
  const leftLast = left.split(/\s+/).pop();
  const rightLast = right.split(/\s+/).pop();
  return Boolean(leftLast && rightLast && leftLast === rightLast);
}

export function buildTopRatingKeys(players: MatchDetailPlayer[]) {
  let best: number | null = null;
  const keys: string[] = [];

  for (const player of players) {
    const rating = parsePlayerRating(player.rating);
    if (rating == null) continue;

    if (best == null || rating > best) {
      best = rating;
      keys.length = 0;
      keys.push(lineupPlayerKey(player));
    } else if (rating === best) {
      keys.push(lineupPlayerKey(player));
    }
  }

  return new Set(keys);
}

export function buildWorstRatingKeys(players: MatchDetailPlayer[]) {
  let worst: number | null = null;
  const keys: string[] = [];

  for (const player of players) {
    const rating = parsePlayerRating(player.rating);
    if (rating == null) continue;

    if (worst == null || rating < worst) {
      worst = rating;
      keys.length = 0;
      keys.push(lineupPlayerKey(player));
    } else if (rating === worst) {
      keys.push(lineupPlayerKey(player));
    }
  }

  return new Set(keys);
}

function buildRatingSpread(players: MatchDetailPlayer[]) {
  let min = Infinity;
  let max = -Infinity;

  for (const player of players) {
    const rating = parsePlayerRating(player.rating);
    if (rating == null) continue;
    min = Math.min(min, rating);
    max = Math.max(max, rating);
  }

  return min < max;
}

export function buildSubbedOutMap(
  timeline: MatchDetailTimelineView,
  side: "home" | "away",
) {
  const map = new Map<string, string>();

  for (const segment of timeline.segments) {
    for (const event of segment.events) {
      if (event.type !== "subst" || event.team !== side || !event.subst) continue;
      const key = `name:${normalizeNameKey(event.subst.out.name)}`;
      map.set(key, event.minute);
    }
  }

  return map;
}

export function buildLineupTeamHighlights(
  lineupPlayers: MatchDetailPlayer[],
  timeline: MatchDetailTimelineView,
  side: "home" | "away",
): LineupTeamHighlights {
  const topRatingKeys = buildTopRatingKeys(lineupPlayers);
  const worstRatingKeys = buildWorstRatingKeys(lineupPlayers);

  return {
    topRatingKeys,
    worstRatingKeys,
    hasRatingSpread: buildRatingSpread(lineupPlayers),
    subbedOut: buildSubbedOutMap(timeline, side),
  };
}

export function resolvePlayerHighlight(
  player: MatchDetailPlayer,
  highlights: LineupTeamHighlights,
): LineupPlayerHighlight {
  const key = lineupPlayerKey(player);
  let subbedOut = highlights.subbedOut.has(key);
  let subOutMinute = highlights.subbedOut.get(key) ?? null;

  if (!subbedOut) {
    for (const [nameKey, minute] of highlights.subbedOut) {
      if (!nameKey.startsWith("name:")) continue;
      const eventName = nameKey.slice(5);
      if (namesMatch(player.name, eventName)) {
        subbedOut = true;
        subOutMinute = minute;
        break;
      }
    }
  }

  return {
    topRating: highlights.topRatingKeys.has(key),
    worstRating:
      highlights.hasRatingSpread &&
      highlights.worstRatingKeys.has(key) &&
      !highlights.topRatingKeys.has(key),
    subbedOut,
    subOutMinute,
  };
}

export function lineupPlayerTooltip(
  player: MatchDetailPlayer,
  highlight: LineupPlayerHighlight,
) {
  const parts = [
    player.name,
    player.number ? `#${player.number}` : null,
    player.position ?? null,
    player.rating ? `Rating ${player.rating}` : null,
    highlight.topRating ? "Top rating" : null,
    highlight.worstRating ? "Lowest rating" : null,
    player.captain ? "Captain" : null,
    player.goals && player.goals > 0
      ? `${player.goals} goal${player.goals > 1 ? "s" : ""}`
      : null,
    player.assists && player.assists > 0
      ? `${player.assists} assist${player.assists > 1 ? "s" : ""}`
      : null,
    player.yellowCards && player.yellowCards > 0 ? "Yellow card" : null,
    player.redCards && player.redCards > 0 ? "Red card" : null,
    highlight.subbedOut
      ? `Subbed off${highlight.subOutMinute ? ` ${highlight.subOutMinute}` : ""}`
      : null,
  ];

  return parts.filter(Boolean).join(" · ");
}
