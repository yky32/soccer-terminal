import type { LeagueProfile, LeagueRegion, LeagueTier } from "@/lib/data/league-profile";
import type { NewsArticle } from "@/lib/data/news-article";
import type { PlayerProfile } from "@/lib/data/player-profile";
import { FEATURED_LEAGUE_ID } from "@/lib/football/league-catalog";
import { getFootballDataProvider } from "@/lib/football/get-provider";
import type { PlayerSlugMatch } from "@/lib/football/provider";
import {
  getNewsArticleById,
  getNewsLeaguesFromArticles,
  getRelatedNewsArticles,
} from "@/lib/football/providers/api-football/fetch-news";
import type { MatchDetail } from "@/lib/data/match-detail";
import type { TeamProfile } from "@/lib/data/team-profile";
import { fetchMatchDetail as loadMatchDetail } from "@/lib/football/fetch-match-detail";

export { FEATURED_LEAGUE_ID };

/** Static catalog for the league picker — 0 API calls. */
export async function fetchLeagueCatalog() {
  return getFootballDataProvider().getLeagueCatalog();
}

/** One featured league for first paint on /leagues (~2 API calls). */
export async function fetchFeaturedLeague(id = FEATURED_LEAGUE_ID) {
  return getFootballDataProvider().getLeagueById(id);
}

/** @deprecated Prefer fetchLeagueCatalog + lazy /api/leagues/[id] */
export async function fetchLeagues() {
  return fetchLeagueCatalog();
}

export async function fetchLeagueById(id: string) {
  return getFootballDataProvider().getLeagueById(id);
}

export async function fetchTeamProfile(leagueId: string, teamSlug: string) {
  return getFootballDataProvider().getTeamProfile(leagueId, teamSlug);
}

export async function fetchMatchDetail(fixtureId: number): Promise<MatchDetail | null> {
  return loadMatchDetail(fixtureId);
}

export async function findPlayerBySlug(leagueId: string, playerSlug: string) {
  return getFootballDataProvider().findPlayerBySlug(leagueId, playerSlug);
}

export async function fetchPlayerProfile(match: PlayerSlugMatch) {
  return getFootballDataProvider().getPlayerProfile(match);
}

export async function fetchNewsArticles() {
  return getFootballDataProvider().getNewsArticles();
}

export async function fetchNewsArticleById(id: string) {
  const articles = await fetchNewsArticles();
  return getNewsArticleById(articles, id);
}

export async function fetchRelatedNewsArticles(article: NewsArticle, limit = 4) {
  const articles = await fetchNewsArticles();
  return getRelatedNewsArticles(article, articles, limit);
}

export async function fetchNewsLeagues() {
  const articles = await fetchNewsArticles();
  return getNewsLeaguesFromArticles(articles);
}

export { getNewsLeaguesFromArticles };

export function filterLeagues(
  leagues: LeagueProfile[],
  options: {
    region?: LeagueRegion | "all";
    tier?: LeagueTier | "all";
    query?: string;
  },
) {
  const query = options.query?.trim().toLowerCase() ?? "";

  return leagues.filter((league) => {
    const regionMatch =
      !options.region || options.region === "all" || league.region === options.region;
    const tierMatch = !options.tier || options.tier === "all" || league.tier === options.tier;
    const searchMatch =
      query.length === 0 ||
      league.name.toLowerCase().includes(query) ||
      league.country.toLowerCase().includes(query) ||
      league.shortName.toLowerCase().includes(query);

    return regionMatch && tierMatch && searchMatch;
  });
}

export type { PlayerProfile, TeamProfile };
