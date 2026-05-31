import type { LiveMatch } from "@/lib/data/live-match";
import type { MapMatchMode } from "@/lib/data/map-match-mode";

export type MonitoredMatch = {
  match: LiveMatch;
  mode: MapMatchMode;
};

export type LeagueMatchGroup = {
  league: string;
  matches: MonitoredMatch[];
};

export const WATCHLIST_STORAGE_KEY = "soccer-terminal.match-watchlist";
export const MAX_WATCHLIST = 16;

/** Top-tier leagues for one-tap bulk add. */
export const FAMOUS_LEAGUES = [
  { name: "Premier League", shortLabel: "PL" },
  { name: "La Liga", shortLabel: "La Liga" },
  { name: "Serie A", shortLabel: "Serie A" },
  { name: "Bundesliga", shortLabel: "BL" },
  { name: "Major League Soccer", shortLabel: "MLS" },
] as const;

export type FamousLeague = (typeof FAMOUS_LEAGUES)[number];

export const FAMOUS_LEAGUE_NAMES = FAMOUS_LEAGUES.map((league) => league.name);

const FAMOUS_LEAGUE_SET = new Set<string>(FAMOUS_LEAGUE_NAMES);

const LIVE_STATUSES = new Set(["1H", "2H", "HT", "ET", "BT", "P", "LIVE"]);

export function isMatchLive(match: LiveMatch) {
  return LIVE_STATUSES.has(match.statusShort);
}

export function matchSideState(homeGoals: number, awayGoals: number) {
  if (homeGoals > awayGoals) {
    return { home: "leading" as const, away: "losing" as const };
  }
  if (awayGoals > homeGoals) {
    return { home: "losing" as const, away: "leading" as const };
  }
  return { home: "draw" as const, away: "draw" as const };
}

export function teamAbbrev(name: string) {
  const cleaned = name.replace(/\s*(FC|U23|CF|SC)\s*/gi, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return parts
      .slice(0, 2)
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 3);
  }

  return cleaned.slice(0, 3).toUpperCase();
}

export function flattenMapMatches(
  live: Record<string, LiveMatch[]>,
  future: Record<string, LiveMatch[]>,
): MonitoredMatch[] {
  const seen = new Set<number>();
  const items: MonitoredMatch[] = [];

  for (const matches of Object.values(live)) {
    for (const match of matches) {
      if (seen.has(match.id)) continue;
      seen.add(match.id);
      items.push({ match, mode: "live" });
    }
  }

  for (const matches of Object.values(future)) {
    for (const match of matches) {
      if (seen.has(match.id)) continue;
      seen.add(match.id);
      items.push({ match, mode: "future" });
    }
  }

  return items;
}

export function searchMatches(items: MonitoredMatch[], query: string) {
  const needle = query.trim().toLowerCase();
  const pool = needle
    ? items.filter(({ match }) => {
        const haystack = [
          match.homeTeam,
          match.awayTeam,
          match.league,
          match.country,
          match.venue,
          match.venueCity,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(needle);
      })
    : items;

  return sortHeatmapItems(pool).slice(0, 12);
}

/** Live elapsed minutes — higher = closer to full time, ranks earlier (top-left). */
export function matchElapsedSortValue(match: LiveMatch) {
  if (isMatchLive(match)) {
    if (match.elapsed !== null) return match.elapsed;
    return 120;
  }

  if (match.kickoffAt) return -1_000_000 + new Date(match.kickoffAt).getTime() / 1_000_000;

  return -2_000_000;
}

export function compareHeatmapOrder(a: MonitoredMatch, b: MonitoredMatch) {
  const aLive = isMatchLive(a.match);
  const bLive = isMatchLive(b.match);
  if (aLive !== bLive) return aLive ? -1 : 1;

  const minuteDiff = matchElapsedSortValue(b.match) - matchElapsedSortValue(a.match);
  if (minuteDiff !== 0) return minuteDiff;

  const goalDiff =
    b.match.homeGoals +
    b.match.awayGoals -
    (a.match.homeGoals + a.match.awayGoals);
  if (goalDiff !== 0) return goalDiff;

  return matchHeatWeight(b.match) - matchHeatWeight(a.match);
}

export function sortHeatmapItems(items: MonitoredMatch[]) {
  return [...items].sort(compareHeatmapOrder);
}

export function groupMatchesByLeague(items: MonitoredMatch[]): LeagueMatchGroup[] {
  const groups = new Map<string, MonitoredMatch[]>();

  for (const item of items) {
    const key = item.match.league;
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }

  return [...groups.entries()]
    .map(([league, matches]) => ({
      league,
      matches: sortHeatmapItems(matches),
    }))
    .sort((a, b) => {
      const aLead = a.matches[0];
      const bLead = b.matches[0];
      if (!aLead || !bLead) return 0;
      return compareHeatmapOrder(aLead, bLead);
    });
}

/** Tile weight — more goals + live minutes = larger block (TradingView “size”). */
export function matchHeatWeight(match: LiveMatch) {
  const goals = match.homeGoals + match.awayGoals;
  const liveBoost = isMatchLive(match) ? 1.25 : 0.85;
  const minuteBoost =
    match.elapsed !== null ? 0.5 + Math.min(match.elapsed, 90) / 90 : 0.5;

  return liveBoost * (1 + goals * 0.35 + minuteBoost * 0.25);
}

export type HeatCellStyle = {
  background: string;
  foreground: string;
  accent: string;
};

export function matchHeatStyle(match: LiveMatch): HeatCellStyle {
  if (!isMatchLive(match)) {
    return {
      background: "rgba(51, 65, 85, 0.92)",
      foreground: "rgba(248, 250, 252, 0.95)",
      accent: "rgba(148, 163, 184, 0.9)",
    };
  }

  const diff = match.homeGoals - match.awayGoals;
  const margin = Math.min(Math.abs(diff), 4) / 4;
  const alpha = 0.42 + margin * 0.48;

  if (diff > 0) {
    return {
      background: `rgba(5, 150, 105, ${alpha})`,
      foreground: "rgba(255, 255, 255, 0.98)",
      accent: "rgba(167, 243, 208, 0.95)",
    };
  }

  if (diff < 0) {
    return {
      background: `rgba(225, 29, 72, ${alpha})`,
      foreground: "rgba(255, 255, 255, 0.98)",
      accent: "rgba(254, 205, 211, 0.95)",
    };
  }

  return {
    background: `rgba(217, 119, 6, ${0.38 + margin * 0.2})`,
    foreground: "rgba(255, 255, 255, 0.98)",
    accent: "rgba(254, 243, 199, 0.95)",
  };
}

export function matchMinuteLabel(match: LiveMatch) {
  if (isMatchLive(match)) {
    if (match.elapsed !== null) return `${match.elapsed}'`;
    return match.statusShort;
  }

  if (!match.kickoffAt) return "TBD";

  const date = new Date(match.kickoffAt);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function readWatchlistIds(): number[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === "number");
  } catch {
    return [];
  }
}

export function writeWatchlistIds(ids: number[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(ids));
}

export function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isMatchToday(match: LiveMatch, now = new Date()) {
  if (isMatchLive(match)) return true;
  if (!match.kickoffAt) return false;
  return isSameLocalDay(new Date(match.kickoffAt), now);
}

export function isFamousLeague(league: string) {
  return FAMOUS_LEAGUE_SET.has(league);
}

export function filterTodayMatches(items: MonitoredMatch[]) {
  return items.filter(({ match }) => isMatchToday(match));
}

export function filterFamousLeagueMatches(items: MonitoredMatch[]) {
  return items.filter(({ match }) => isFamousLeague(match.league));
}

export function filterLeagueMatches(items: MonitoredMatch[], leagueName: string) {
  return items.filter(({ match }) => match.league === leagueName);
}

export function countAddableMatches(items: MonitoredMatch[], watchlistIds: number[]) {
  const watched = new Set(watchlistIds);
  return items.filter(({ match }) => !watched.has(match.id)).length;
}

export function bulkAddToWatchlist(
  current: number[],
  items: MonitoredMatch[],
  max = MAX_WATCHLIST,
) {
  const next = [...current];
  const sorted = sortHeatmapItems(items);

  for (const { match } of sorted) {
    if (next.length >= max) break;
    if (next.includes(match.id)) continue;
    next.push(match.id);
  }

  return next;
}
