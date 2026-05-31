import type { AssistantContext } from "@/lib/assistant/build-briefing";
import type { LiveMatch } from "@/lib/data/live-match";
import { getFootballDataProvider } from "@/lib/football/get-provider";
import { flattenMapMatches, teamAbbrev } from "@/lib/match-monitor";

export type AssistantContextPayload = {
  generatedAt: string;
  dataProvider: string;
  liveCount: number;
  upcomingCount: number;
  liveHighlights: string[];
  highScoring: string[];
  newsPulse: string;
  topHeadlines: string[];
  tablePulse: string | null;
  briefingBullets: string[];
  watchlist: Array<{
    home: string;
    away: string;
    score: string;
    minute: string;
    league: string;
    events: string[];
  }>;
};

function formatWatchlistMatch(match: LiveMatch) {
  const minute =
    match.elapsed !== null ? `${match.elapsed}'` : match.kickoffAt ? "upcoming" : match.statusShort;

  return {
    home: match.homeTeam,
    away: match.awayTeam,
    score: `${match.homeGoals}–${match.awayGoals}`,
    minute,
    league: match.league,
    events: match.events.slice(-5).map((event) => {
      const label =
        event.type === "goal"
          ? "goal"
          : event.type === "yellow"
            ? "yellow card"
            : "red card";
      return `${event.minute}' ${event.team} ${label}`;
    }),
  };
}

export async function resolveWatchlistMatches(ids: number[]): Promise<LiveMatch[]> {
  const unique = [...new Set(ids.filter((id) => Number.isInteger(id)))].slice(0, 16);
  if (unique.length === 0) return [];

  const provider = getFootballDataProvider();
  const [liveSnapshot, futureSnapshot] = await Promise.all([
    provider.getMapCountries("live"),
    provider.getMapCountries("future"),
  ]);

  const catalog = flattenMapMatches(
    liveSnapshot.matchesByCountry,
    futureSnapshot.matchesByCountry,
  );
  const idSet = new Set(unique);

  return catalog.filter((item) => idSet.has(item.match.id)).map((item) => item.match);
}

export function buildContextPayload(
  context: AssistantContext,
  watchlistMatches: LiveMatch[] = [],
): AssistantContextPayload {
  return {
    generatedAt: context.generatedAt,
    dataProvider: context.provider,
    liveCount: context.liveCount,
    upcomingCount: context.upcomingCount,
    liveHighlights: context.liveHighlights,
    highScoring: context.highScoring,
    newsPulse: context.newsPulse,
    topHeadlines: context.topHeadlines,
    tablePulse: context.tablePulse,
    briefingBullets: context.bullets.map((bullet) => bullet.text),
    watchlist: watchlistMatches.map(formatWatchlistMatch),
  };
}

export const ASSISTANT_SYSTEM_PROMPT = `You are Soccer Terminal AI — a concise football intelligence assistant inside a live monitoring dashboard.

Rules:
- Answer ONLY using facts in CONTEXT JSON. Never invent scores, teams, headlines, or table positions.
- If CONTEXT lacks data, say so briefly and suggest checking Global map, Match monitor, News, or Leagues.
- Default to short bullet answers using "•" lines. Max ~120 words unless the user asks for detail.
- Prefer team abbreviations already present in context when space is tight.
- Do not mention JSON, CONTEXT, or that you are an AI model.
- Links in the app: Global map /, Match monitor /#match-monitor, News /news, Leagues /leagues.`;

export function buildChatMessages(
  contextPayload: AssistantContextPayload,
  history: Array<{ role: "user" | "assistant"; content: string }>,
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  return [
    {
      role: "system",
      content: `${ASSISTANT_SYSTEM_PROMPT}\n\nCONTEXT:\n${JSON.stringify(contextPayload, null, 2)}`,
    },
    ...history.slice(-8),
  ];
}

export function buildBriefingEnhancementPrompt(contextPayload: AssistantContextPayload) {
  return [
    {
      role: "system" as const,
      content:
        "You write concise football briefing copy for a terminal dashboard. Return ONLY valid JSON with keys headline (string, max 12 words) and summary (string, 2 short sentences max). Use ONLY facts from CONTEXT. No markdown.",
    },
    {
      role: "user" as const,
      content: `CONTEXT:\n${JSON.stringify(contextPayload, null, 2)}`,
    },
  ];
}

export function formatWatchlistLine(match: LiveMatch) {
  const minute = match.elapsed !== null ? `${match.elapsed}'` : "upcoming";
  return `${teamAbbrev(match.homeTeam)} ${match.homeGoals}–${match.awayGoals} ${teamAbbrev(match.awayTeam)} (${minute})`;
}
