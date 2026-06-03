import type { MetadataRoute } from "next";
import type { LeagueProfile } from "@/lib/data/league-profile";
import { getMockLeagues } from "@/lib/data/mock-leagues";
import { LEAGUE_CATALOG } from "@/lib/football/league-catalog";
import { getFootballDataProvider } from "@/lib/football/get-provider";
import { absoluteUrl } from "@/lib/metadata";
import { teamSlugFromName } from "@/lib/team-paths";

const TEAM_PRIORITY = 0.75;
const PLAYER_PRIORITY = 0.65;
const MATCH_PRIORITY = 0.7;
const MAX_MATCH_URLS = 250;

export async function loadLeaguesForSitemap(): Promise<LeagueProfile[]> {
  try {
    const provider = getFootballDataProvider();
    const loaded: LeagueProfile[] = [];

    for (const entry of LEAGUE_CATALOG) {
      const league = await provider.getLeagueById(entry.id);
      if (league && league.standings.length > 0) {
        loaded.push(league);
      }
    }

    if (loaded.length > 0) return loaded;
  } catch (error) {
    console.warn("[sitemap] League fetch failed, using mock catalog:", error);
  }

  return getMockLeagues();
}

function teamEntries(leagues: LeagueProfile[], now: Date): MetadataRoute.Sitemap {
  const seen = new Set<string>();

  return leagues.flatMap((league) =>
    league.standings.flatMap((row) => {
      const slug = teamSlugFromName(row.team);
      const key = `${league.id}:${slug}`;
      if (seen.has(key)) return [];
      seen.add(key);

      return [
        {
          url: absoluteUrl(`/leagues/${league.id}/teams/${slug}`),
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: TEAM_PRIORITY,
        },
      ];
    }),
  );
}

function playerEntries(leagues: LeagueProfile[], now: Date): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  for (const league of leagues) {
    const boards = league.leaderBoards;
    if (!boards) continue;

    for (const kind of ["goals", "assists", "rating"] as const) {
      for (const row of boards.players[kind].slice(0, 8)) {
        const key = `${league.id}:${row.playerSlug}`;
        if (seen.has(key)) continue;
        seen.add(key);

        entries.push({
          url: absoluteUrl(`/leagues/${league.id}/players/${row.playerSlug}`),
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: PLAYER_PRIORITY,
        });
      }
    }
  }

  return entries;
}

async function matchEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  try {
    const provider = getFootballDataProvider();
    const [live, future] = await Promise.all([
      provider.getMapCountries("live"),
      provider.getMapCountries("future"),
    ]);

    const ids = new Set<number>();
    for (const snapshot of [live, future]) {
      for (const matches of Object.values(snapshot.matchesByCountry)) {
        for (const match of matches) {
          ids.add(match.id);
        }
      }
    }

    return [...ids].slice(0, MAX_MATCH_URLS).map((id) => ({
      url: absoluteUrl(`/matches/${id}`),
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: MATCH_PRIORITY,
    }));
  } catch (error) {
    console.warn("[sitemap] Match fetch failed:", error);
    return [];
  }
}

export async function collectDetailSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const leagues = await loadLeaguesForSitemap();
  const [teams, players, matches] = await Promise.all([
    Promise.resolve(teamEntries(leagues, now)),
    Promise.resolve(playerEntries(leagues, now)),
    matchEntries(now),
  ]);

  return [...teams, ...players, ...matches];
}
