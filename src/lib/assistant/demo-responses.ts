import type { LiveMatch } from "@/lib/data/live-match";
import type { AssistantContext } from "@/lib/assistant/build-briefing";
import { ENABLE_NEWS } from "@/lib/feature-flags";
import { teamAbbrev } from "@/lib/match-monitor";

export type DemoPrompt = {
  id: string;
  label: string;
};

const ALL_DEMO_PROMPTS: DemoPrompt[] = [
  { id: "live", label: "What's live?" },
  { id: "watchlist", label: "My watchlist" },
  { id: "news", label: "News pulse" },
  { id: "table", label: "PL title race" },
  { id: "high-scoring", label: "High-scoring games" },
  { id: "watch", label: "What should I watch?" },
];

export function getDemoPrompts() {
  return ALL_DEMO_PROMPTS.filter((prompt) => ENABLE_NEWS || prompt.id !== "news");
}

/** @deprecated Use getDemoPrompts() */
export const DEMO_PROMPTS = ALL_DEMO_PROMPTS;

export function promptLabelForId(promptId: string) {
  return ALL_DEMO_PROMPTS.find((prompt) => prompt.id === promptId)?.label ?? "";
}

function bulletLines(lines: string[]) {
  return lines.filter(Boolean).join("\n");
}

export function answerDemoPrompt(
  promptId: string,
  context: AssistantContext,
  watchlistMatches: LiveMatch[] = [],
): string {
  switch (promptId) {
    case "live": {
      if (context.liveCount === 0) {
        return "Nothing live right now. Open the global map and switch to upcoming — or add fixtures to your match monitor watchlist.";
      }

      const lines = [
        `${context.liveCount} matches live on the map.`,
        ...context.liveHighlights.map((line) => `• ${line}`),
      ];
      return bulletLines(lines);
    }

    case "watchlist": {
      if (watchlistMatches.length === 0) {
        return "Your watchlist is empty. Search on the match monitor and add fixtures — I'll summarize them here once you do.";
      }

      const lines = watchlistMatches.slice(0, 6).map((match) => {
        const live = match.elapsed !== null ? `${match.elapsed}'` : "upcoming";
        return `• ${teamAbbrev(match.homeTeam)} ${match.homeGoals}–${match.awayGoals} ${teamAbbrev(match.awayTeam)} (${live})`;
      });

      return bulletLines([
        `${watchlistMatches.length} watchlist ${watchlistMatches.length === 1 ? "match" : "matches"}:`,
        ...lines,
      ]);
    }

    case "news":
      if (!ENABLE_NEWS) {
        return "News is not enabled in this build. Try live matches, your watchlist, or league standings.";
      }
      return bulletLines([
        context.newsPulse,
        ...context.topHeadlines.map((headline) => `• ${headline}`),
      ]);

    case "table":
      return context.tablePulse ?? "Standings data isn't available for this demo run.";

    case "high-scoring": {
      if (context.highScoring.length === 0) {
        return "No high-scoring live games at the moment (3+ goals). Check back as matches progress.";
      }

      return bulletLines([
        "Live games with 3+ goals:",
        ...context.highScoring.map((line) => `• ${line}`),
      ]);
    }

    case "watch": {
      if (context.highScoring.length > 0) {
        return bulletLines([
          "Best for drama right now:",
          ...context.highScoring.slice(0, 2).map((line) => `• ${line}`),
          context.tablePulse ? `\nTable context: ${context.tablePulse}` : "",
        ]);
      }

      if (context.liveHighlights.length > 0) {
        return bulletLines([
          "Pick from the live board:",
          ...context.liveHighlights.slice(0, 3).map((line) => `• ${line}`),
        ]);
      }

      return "No live matches — browse upcoming fixtures on the map or queue your watchlist on the match monitor.";
    }

    default:
      return ENABLE_NEWS
        ? "Try a quick prompt above — answers are grounded in live map data, news wire, and league standings."
        : "Try a quick prompt above — answers are grounded in live map data and league standings.";
  }
}

export function answerDemoQuestion(
  question: string,
  context: AssistantContext,
  watchlistMatches: LiveMatch[] = [],
): string {
  const needle = question.trim().toLowerCase();
  if (!needle) {
    return ENABLE_NEWS
      ? "Ask about live matches, your watchlist, news, or the table."
      : "Ask about live matches, your watchlist, or the table.";
  }

  if (needle.includes("watchlist") || needle.includes("monitor")) {
    return answerDemoPrompt("watchlist", context, watchlistMatches);
  }
  if (needle.includes("live") || needle.includes("now")) {
    return answerDemoPrompt("live", context, watchlistMatches);
  }
  if (
    ENABLE_NEWS &&
    (needle.includes("news") || needle.includes("headline") || needle.includes("transfer"))
  ) {
    return answerDemoPrompt("news", context, watchlistMatches);
  }
  if (needle.includes("table") || needle.includes("stand") || needle.includes("premier")) {
    return answerDemoPrompt("table", context, watchlistMatches);
  }
  if (needle.includes("goal") || needle.includes("score")) {
    return answerDemoPrompt("high-scoring", context, watchlistMatches);
  }
  if (needle.includes("watch") || needle.includes("recommend")) {
    return answerDemoPrompt("watch", context, watchlistMatches);
  }

  return answerDemoPrompt("live", context, watchlistMatches);
}
