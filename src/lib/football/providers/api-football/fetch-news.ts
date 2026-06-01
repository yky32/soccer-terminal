import type { NewsArticle, NewsCategory } from "@/lib/data/news-article";
import {
  getCatalogEntryByApiId,
  type LeagueCatalogEntry,
} from "@/lib/football/league-catalog";
import {
  type ApiFootballInjury,
} from "@/lib/football/providers/api-football/normalize-catalog";
import { apiFootballGetSafe, mapInBatches } from "@/lib/football/providers/api-football/request";
import {
  API_REVALIDATE_DEFAULT_SEC,
  CATALOG_FETCH_CONCURRENCY,
  ROUTE_REVALIDATE_NEWS_SEC,
} from "@/lib/football/refresh-policy";
import type { ApiFootballLiveFixture } from "@/lib/football/providers/api-football/types";

const MATCH_REPORT_IMAGE =
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=675&auto=format&fit=crop&q=80";
const INJURY_IMAGE =
  "https://images.unsplash.com/photo-1577213661175-754a792548d1?w=1200&h=675&auto=format&fit=crop&q=80";

const NEWS_CACHE_MS = ROUTE_REVALIDATE_NEWS_SEC * 1000;
const MAX_INJURY_ARTICLES = 24;

let newsCache: { articles: NewsArticle[]; cachedAt: number } | null = null;

function injuryArticle(entry: LeagueCatalogEntry, injury: ApiFootballInjury): NewsArticle {
  const reason = injury.player.reason ?? injury.player.type ?? "Unavailable";
  return {
    id: `injury-${injury.player.id}-${injury.fixture.id}`,
    headline: `${injury.player.name} sidelined for ${injury.team.name}`,
    excerpt: `${injury.player.name} (${injury.team.name}) — ${reason}. Monitor squad updates ahead of ${entry.newsLabel} fixtures.`,
    body: `${injury.player.name} is listed as unavailable for ${injury.team.name} in ${entry.name}. Reported status: ${reason}.`,
    publishedAt: injury.fixture.date,
    category: "injury",
    league: entry.newsLabel,
    leagueLogo: entry.logo,
    imageUrl: injury.player.photo ?? INJURY_IMAGE,
    imageAlt: `${injury.player.name} injury update`,
  };
}

function injuryArticleFromApi(injury: ApiFootballInjury): NewsArticle | null {
  const entry = getCatalogEntryByApiId(injury.league.id);
  if (entry) return injuryArticle(entry, injury);

  // App is intentionally limited to the league catalog.
  return null;
}

function matchReportArticle(fixture: ApiFootballLiveFixture, entry: LeagueCatalogEntry | null): NewsArticle {
  const home = fixture.teams.home.name;
  const away = fixture.teams.away.name;
  const homeGoals = fixture.goals.home ?? 0;
  const awayGoals = fixture.goals.away ?? 0;
  const leagueLabel = entry?.newsLabel ?? fixture.league.name;

  return {
    id: `result-${fixture.fixture.id}`,
    headline: `${home} ${homeGoals}–${awayGoals} ${away}`,
    excerpt: `Full-time in ${fixture.league.name}: ${home} ${homeGoals}–${awayGoals} ${away}. Catch the key moments and what it means for the table.`,
    body: `${home} ${homeGoals}–${awayGoals} ${away} in ${fixture.league.name}. Final whistle at ${fixture.fixture.date ?? "recent kickoff"}.`,
    publishedAt: fixture.fixture.date ?? new Date().toISOString(),
    category: "match-report",
    league: leagueLabel,
    leagueLogo: entry?.logo ?? fixture.league.logo,
    imageUrl: MATCH_REPORT_IMAGE,
    imageAlt: `${home} vs ${away} match report`,
  };
}

function recentDateRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - (days - 1));

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

async function fetchInjuryArticles(apiKey: string) {
  const { LEAGUE_CATALOG } = await import("@/lib/football/league-catalog");
  const { resolveSeasonYearForEntry } = await import(
    "@/lib/football/providers/api-football/resolve-season"
  );
  const today = new Date().toISOString().slice(0, 10);

  const injuryBatches = await mapInBatches(
    LEAGUE_CATALOG,
    CATALOG_FETCH_CONCURRENCY,
    async (entry) => {
      const season = await resolveSeasonYearForEntry(apiKey, entry);
      return apiFootballGetSafe<ApiFootballInjury>(
        apiKey,
        "/injuries",
        { league: entry.apiId, season, date: today },
        API_REVALIDATE_DEFAULT_SEC,
      );
    },
  );

  const seen = new Set<string>();
  const articles: NewsArticle[] = [];

  for (const batch of injuryBatches) {
    for (const injury of batch) {
      const article = injuryArticleFromApi(injury);
      if (!article || seen.has(article.id)) continue;
      seen.add(article.id);
      articles.push(article);
      if (articles.length >= MAX_INJURY_ARTICLES) return articles;
    }
  }

  return articles;
}

async function fetchNewsArticlesFresh(apiKey: string): Promise<NewsArticle[]> {
  const { LEAGUE_CATALOG } = await import("@/lib/football/league-catalog");
  const { resolveSeasonYearForEntry } = await import(
    "@/lib/football/providers/api-football/resolve-season"
  );
  const articles: NewsArticle[] = [];

  articles.push(...(await fetchInjuryArticles(apiKey)));

  const range = recentDateRange(2);
  const fixtureBatches = await mapInBatches(
    LEAGUE_CATALOG,
    CATALOG_FETCH_CONCURRENCY,
    async (entry) => {
      const season = await resolveSeasonYearForEntry(apiKey, entry);
      return apiFootballGetSafe<ApiFootballLiveFixture>(
        apiKey,
        "/fixtures",
        { league: entry.apiId, season, status: "FT", ...range },
        API_REVALIDATE_DEFAULT_SEC,
      );
    },
  );

  const finished = fixtureBatches
    .flat()
    .slice(0, 24);

  for (const fixture of finished) {
    const entry = getCatalogEntryByApiId(fixture.league.id) ?? null;
    articles.push(matchReportArticle(fixture, entry));
  }

  const seen = new Set<string>();
  return articles
    .filter((article) => {
      if (seen.has(article.id)) return false;
      seen.add(article.id);
      return true;
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export async function fetchNewsArticles(apiKey: string): Promise<NewsArticle[]> {
  if (newsCache && Date.now() - newsCache.cachedAt < NEWS_CACHE_MS) {
    return newsCache.articles;
  }

  const articles = await fetchNewsArticlesFresh(apiKey);
  newsCache = { articles, cachedAt: Date.now() };
  return articles;
}

export function getNewsArticleById(articles: NewsArticle[], id: string) {
  return articles.find((article) => article.id === id) ?? null;
}

export function getRelatedNewsArticles(article: NewsArticle, articles: NewsArticle[], limit = 4) {
  const rest = articles.filter((item) => item.id !== article.id);
  const sameLeague = rest.filter((item) => item.league === article.league);
  const sameCategory = rest.filter(
    (item) => item.category === article.category && item.league !== article.league,
  );
  const other = rest.filter(
    (item) => item.league !== article.league && item.category !== article.category,
  );

  const merged = [...sameLeague, ...sameCategory, ...other];
  const seen = new Set<string>();

  return merged
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, limit);
}

export function getNewsLeaguesFromArticles(articles: NewsArticle[]) {
  const byLeague = new Map<string, { count: number; logo: string | null }>();

  for (const article of articles) {
    const current = byLeague.get(article.league);
    if (current) {
      current.count += 1;
    } else {
      byLeague.set(article.league, { count: 1, logo: article.leagueLogo });
    }
  }

  return [...byLeague.entries()]
    .map(([name, meta]) => ({ name, count: meta.count, logo: meta.logo }))
    .sort((a, b) => b.count - a.count);
}

export function categoryForArticle(article: NewsArticle): NewsCategory {
  return article.category;
}
