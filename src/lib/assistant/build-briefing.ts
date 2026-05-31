import type { LiveMatch } from "@/lib/data/live-match";
import { buildNewsInsights } from "@/lib/data/news-insights";
import { getFootballDataProvider } from "@/lib/football/get-provider";
import {
  compareHeatmapOrder,
  flattenMapMatches,
  teamAbbrev,
  type MonitoredMatch,
} from "@/lib/match-monitor";

export type BriefingSignal = "live" | "news" | "table" | "upcoming" | "neutral";

export type BriefingBullet = {
  id: string;
  signal: BriefingSignal;
  text: string;
  href?: string;
};

export type AssistantContext = {
  generatedAt: string;
  provider: string;
  liveCount: number;
  upcomingCount: number;
  headline: string;
  bullets: BriefingBullet[];
  liveHighlights: string[];
  newsPulse: string;
  tablePulse: string | null;
  highScoring: string[];
  topHeadlines: string[];
};

function flattenLive(snapshot: Record<string, LiveMatch[]>) {
  return flattenMapMatches(snapshot, {});
}

function flattenUpcoming(snapshot: Record<string, LiveMatch[]>) {
  return flattenMapMatches({}, snapshot);
}

function formatLiveMatch(match: LiveMatch) {
  const minute = match.elapsed !== null ? `${match.elapsed}'` : match.statusShort;
  return `${teamAbbrev(match.homeTeam)} ${match.homeGoals}–${match.awayGoals} ${teamAbbrev(match.awayTeam)} (${minute})`;
}

function sortLive(items: MonitoredMatch[]) {
  return [...items].sort(compareHeatmapOrder);
}

async function buildTablePulse() {
  const league = await getFootballDataProvider().getLeagueById("premier-league");
  if (!league?.standings?.length) return null;

  const top = league.standings.slice(0, 3);
  const leader = top[0];
  const second = top[1];
  if (!leader || !second) return null;

  const gap = leader.points - second.points;
  return `PL: ${leader.team} lead by ${gap} pt${gap === 1 ? "" : "s"} — ${top.map((row) => `${row.rank}. ${teamAbbrev(row.team)}`).join(", ")}`;
}

async function buildNewsPulse() {
  const articles = await getFootballDataProvider().getNewsArticles();
  const insights = buildNewsInsights(articles);
  const parts: string[] = [];

  if (insights.newCount > 0) {
    parts.push(`${insights.newCount} headline${insights.newCount === 1 ? "" : "s"} in the last 2h`);
  }

  if (insights.topCategory) {
    parts.push(`${insights.topCategory.label} most active (${insights.topCategory.count})`);
  }

  parts.push(`${insights.leagueCount} leagues in the wire`);

  return parts.join(" · ");
}

async function buildTopHeadlines(limit = 3) {
  const articles = await getFootballDataProvider().getNewsArticles();
  return articles
    .slice()
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, limit)
    .map((article) => article.headline);
}

export async function buildAssistantBriefing(): Promise<AssistantContext> {
  const provider = getFootballDataProvider();
  const [liveSnapshot, futureSnapshot] = await Promise.all([
    provider.getMapCountries("live"),
    provider.getMapCountries("future"),
  ]);

  const liveItems = sortLive(flattenLive(liveSnapshot.matchesByCountry));
  const upcomingItems = flattenUpcoming(futureSnapshot.matchesByCountry);
  const liveMatches = liveItems.map((item) => item.match);
  const liveCount = liveMatches.length;
  const upcomingCount = upcomingItems.length;

  const liveHighlights = liveMatches.slice(0, 4).map(formatLiveMatch);
  const highScoring = liveMatches
    .filter((match) => match.homeGoals + match.awayGoals >= 3)
    .slice(0, 4)
    .map(formatLiveMatch);

  const bullets: BriefingBullet[] = [];

  if (liveCount > 0) {
    const lead = liveMatches[0];
    if (lead) {
      bullets.push({
        id: "live-lead",
        signal: "live",
        text: `${liveCount} live ${liveCount === 1 ? "match" : "matches"} — top line: ${formatLiveMatch(lead)}`,
        href: "/#global-map",
      });
    }
  } else {
    bullets.push({
      id: "live-empty",
      signal: "neutral",
      text: "No live matches right now — check upcoming fixtures on the global map.",
      href: "/#global-map",
    });
  }

  if (highScoring.length > 0) {
    bullets.push({
      id: "high-scoring",
      signal: "live",
      text: `High tempo: ${highScoring.slice(0, 2).join("; ")}`,
      href: "/#match-monitor",
    });
  }

  const newsPulse = await buildNewsPulse();
  const topHeadlines = await buildTopHeadlines();
  if (topHeadlines[0]) {
    bullets.push({
      id: "news-top",
      signal: "news",
      text: `News wire: ${topHeadlines[0]}`,
      href: "/news",
    });
  }

  const tablePulse = await buildTablePulse();
  if (tablePulse) {
    bullets.push({
      id: "table-pl",
      signal: "table",
      text: tablePulse,
      href: "/leagues",
    });
  }

  if (upcomingCount > 0) {
    const next = upcomingItems
      .map((item) => item.match)
      .filter((match) => match.kickoffAt)
      .sort((a, b) => Date.parse(a.kickoffAt!) - Date.parse(b.kickoffAt!))[0];

    if (next?.kickoffAt) {
      const kickoff = new Date(next.kickoffAt).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      bullets.push({
        id: "upcoming-next",
        signal: "upcoming",
        text: `Next up: ${teamAbbrev(next.homeTeam)} vs ${teamAbbrev(next.awayTeam)} · ${kickoff}`,
        href: "/#global-map",
      });
    }
  }

  const headline =
    liveCount > 0
      ? `${liveCount} live across the map — ${highScoring.length > 0 ? "goals flowing" : "monitor your watchlist"}`
      : upcomingCount > 0
        ? `${upcomingCount} fixtures on the horizon today`
        : "Your football command center digest";

  return {
    generatedAt: new Date().toISOString(),
    provider: liveSnapshot.provider,
    liveCount,
    upcomingCount,
    headline,
    bullets: bullets.slice(0, 5),
    liveHighlights,
    newsPulse,
    tablePulse,
    highScoring,
    topHeadlines,
  };
}

export function formatBriefingTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
