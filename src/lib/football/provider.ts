import type { LiveMatch } from "@/lib/data/live-match";
import type { CountryMatchActivity } from "@/lib/data/live-match-countries";
import type { MapMatchMode } from "@/lib/data/map-match-mode";
import type { LeagueProfile, LeagueStandingRow } from "@/lib/data/league-profile";
import type { NewsArticle } from "@/lib/data/news-article";
import type { PlayerProfile } from "@/lib/data/player-profile";
import type { TeamProfile } from "@/lib/data/team-profile";

export type LiveCountriesSnapshot = {
  mode: MapMatchMode;
  countries: CountryMatchActivity[];
  matchesByCountry: Record<string, LiveMatch[]>;
  updatedAt: string;
  provider: string;
};

export type PlayerSlugMatch = {
  league: LeagueProfile;
  standing: LeagueStandingRow;
  playerId: number;
  name: string;
  slot: number;
};

/** Swap implementations without changing UI or API routes */
export interface FootballDataProvider {
  readonly id: string;
  getMapCountries(mode: MapMatchMode): Promise<LiveCountriesSnapshot>;
  getLeagues(): Promise<LeagueProfile[]>;
  getLeagueById(id: string): Promise<LeagueProfile | null>;
  getTeamProfile(leagueId: string, teamSlug: string): Promise<TeamProfile | null>;
  findPlayerBySlug(leagueId: string, playerSlug: string): Promise<PlayerSlugMatch | null>;
  getPlayerProfile(match: PlayerSlugMatch): Promise<PlayerProfile>;
  getNewsArticles(): Promise<NewsArticle[]>;
}
