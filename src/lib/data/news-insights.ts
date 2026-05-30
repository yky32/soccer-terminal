import type { NewsArticle, NewsCategory } from "@/lib/data/news-article";

export type NewsCategoryFilter = "all" | NewsCategory;

export type NewsCategoryCounts = Record<NewsCategoryFilter, number>;

export type NewsInsights = {
  total: number;
  newCount: number;
  leagueCount: number;
  categoryCounts: NewsCategoryCounts;
  topCategory: { id: NewsCategory; label: string; count: number } | null;
};

const CATEGORY_LABELS: Record<NewsCategory, string> = {
  transfer: "Transfers",
  "match-report": "Reports",
  preview: "Previews",
  injury: "Injuries",
  analysis: "Analysis",
};

function isRecentNews(isoDate: string, hours = 2) {
  return Date.now() - new Date(isoDate).getTime() < hours * 3_600_000;
}

export function buildNewsInsights(articles: NewsArticle[]): NewsInsights {
  const categoryCounts: NewsCategoryCounts = {
    all: articles.length,
    transfer: 0,
    "match-report": 0,
    preview: 0,
    injury: 0,
    analysis: 0,
  };

  let newCount = 0;
  const leagues = new Set<string>();

  for (const article of articles) {
    categoryCounts[article.category] += 1;
    if (isRecentNews(article.publishedAt)) newCount += 1;
    leagues.add(article.league);
  }

  let topCategory: NewsInsights["topCategory"] = null;
  let topCount = 0;

  for (const id of Object.keys(CATEGORY_LABELS) as NewsCategory[]) {
    const count = categoryCounts[id];
    if (count > topCount) {
      topCount = count;
      topCategory = { id, label: CATEGORY_LABELS[id], count };
    }
  }

  return {
    total: articles.length,
    newCount,
    leagueCount: leagues.size,
    categoryCounts,
    topCategory,
  };
}

export function buildScopedCategoryCounts(
  articles: NewsArticle[],
  league: string,
): NewsCategoryCounts {
  const scoped =
    league === "all" ? articles : articles.filter((article) => article.league === league);

  return buildNewsInsights(scoped).categoryCounts;
}
