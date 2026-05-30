import type { NewsCategory } from "@/lib/data/news-article";
import type { NewsInsights } from "@/lib/data/news-insights";

export type InsightSignal = "positive" | "negative" | "caution" | "neutral";

export const INSIGHT_SIGNAL_STYLES: Record<
  InsightSignal,
  { bg: string; text: string; dot: string; border: string; label: string }
> = {
  positive: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-500/25",
    label: "Active",
  },
  negative: {
    bg: "bg-rose-500/10",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-500/25",
    label: "Alert",
  },
  caution: {
    bg: "bg-amber-500/10",
    text: "text-amber-800",
    dot: "bg-amber-500",
    border: "border-amber-500/25",
    label: "Watch",
  },
  neutral: {
    bg: "bg-neutral-500/5",
    text: "text-foreground",
    dot: "bg-neutral-400",
    border: "border-neutral-200/80",
    label: "Stable",
  },
};

const TOP_CATEGORY_SIGNAL: Record<NewsCategory, InsightSignal> = {
  transfer: "caution",
  "match-report": "positive",
  preview: "neutral",
  injury: "negative",
  analysis: "neutral",
};

export function getNewCountSignal(count: number): InsightSignal {
  if (count >= 3) return "positive";
  if (count >= 1) return "caution";
  return "neutral";
}

export function getMatchSignal(filteredCount: number, matchRate: number, hasFilters: boolean): InsightSignal {
  if (!hasFilters) return "neutral";
  if (filteredCount === 0) return "negative";
  if (matchRate <= 25) return "caution";
  if (matchRate >= 50) return "positive";
  return "neutral";
}

export function getTotalSignal(total: number): InsightSignal {
  if (total === 0) return "negative";
  if (total >= 10) return "positive";
  return "neutral";
}

export function getTopCategorySignal(category: NewsCategory | undefined): InsightSignal {
  if (!category) return "neutral";
  return TOP_CATEGORY_SIGNAL[category];
}

export type InsightStat = {
  key: string;
  label: string;
  value: number;
  hint: string;
  signal: InsightSignal;
  pulse?: boolean;
};

export function buildInsightStats(
  insights: NewsInsights,
  filteredCount: number,
  matchRate: number,
  hasActiveFilters: boolean,
): InsightStat[] {
  const stats: InsightStat[] = [
    {
      key: "total",
      label: "Total",
      value: insights.total,
      hint: "headlines on wire",
      signal: getTotalSignal(insights.total),
    },
    {
      key: "new",
      label: "New",
      value: insights.newCount,
      hint: "past 2 hours",
      signal: getNewCountSignal(insights.newCount),
      pulse: insights.newCount >= 3,
    },
    {
      key: "matched",
      label: hasActiveFilters ? "Matched" : "Showing",
      value: filteredCount,
      hint: hasActiveFilters ? `${matchRate}% of wire` : "all headlines",
      signal: getMatchSignal(filteredCount, matchRate, hasActiveFilters),
    },
  ];

  if (insights.topCategory) {
    stats.push({
      key: "top",
      label: "Top",
      value: insights.topCategory.count,
      hint: insights.topCategory.label,
      signal: getTopCategorySignal(insights.topCategory.id),
    });
  }

  return stats;
}
