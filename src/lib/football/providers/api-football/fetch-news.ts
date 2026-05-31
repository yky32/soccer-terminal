import type { NewsArticle, NewsCategory } from "@/lib/data/news-article";
import {
  LEAGUE_CATALOG,
  seasonYearForEntry,
  type LeagueCatalogEntry,
} from "@/lib/football/league-catalog";
import {
  type ApiFootballInjury,
} from "@/lib/football/providers/api-football/normalize-catalog";
import { apiFootballGet } from "@/lib/football/providers/api-football/request";
import type { ApiFootballLiveFixture } from "@/lib/football/providers/api-football/types";

const NEWS_LEAGUES = LEAGUE_CATALOG.filter((entry) =>
  ["premier-league", "la-liga", "serie-a", "bundesliga", "ligue-1", "ucl", "mls", "saudi-pro"].includes(
    entry.id,
  ),
);

const MATCH_REPORT_IMAGE =
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=675&auto=format&fit=crop&q=80";
const INJURY_IMAGE =
  "https://images.unsplash.com/photo-1577213661175-754a792548d1?w=1200&h=675&auto=format&fit=crop&q=80";

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

function recentDates(days: number) {
  const dates: string[] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - offset);
    dates.push(date.toISOString().slice(0, 10));
  }
  return dates;
}

export async function fetchNewsArticles(apiKey: string): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];

  const injuryBatches = await Promise.all(
    NEWS_LEAGUES.map(async (entry) => {
      const season = seasonYearForEntry(entry);
      try {
        const injuries = await apiFootballGet<ApiFootballInjury>(apiKey, "/injuries", {
          league: entry.apiId,
          season,
        });
        return injuries.slice(0, 6).map((injury) => injuryArticle(entry, injury));
      } catch {
        return [] as NewsArticle[];
      }
    }),
  );

  articles.push(...injuryBatches.flat());

  const dates = recentDates(3);
  const fixtureBatches = await Promise.all(
    dates.map((date) =>
      apiFootballGet<ApiFootballLiveFixture>(apiKey, "/fixtures", { date }, 120).catch(
        () => [] as ApiFootballLiveFixture[],
      ),
    ),
  );

  const finished = fixtureBatches
    .flat()
    .filter((fixture) => fixture.fixture.status.short === "FT")
    .slice(0, 24);

  for (const fixture of finished) {
    const entry = LEAGUE_CATALOG.find((item) => item.apiId === fixture.league.id) ?? null;
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
