import type { LeagueProfile } from "@/lib/data/league-profile";
import { hasPlayerLeaderData } from "@/lib/data/league-stats";
import { getCatalogEntryById } from "@/lib/football/league-catalog";

/** True when standings and API leader/season payloads are present (not catalog shell). */
export function isLoadedLeagueProfile(profile: LeagueProfile | undefined): boolean {
  return Boolean(profile && profile.standings.length > 0);
}

/**
 * Reject older localStorage entries that predate API leader boards / season history.
 */
export function isValidCachedLeagueProfile(profile: LeagueProfile, leagueId?: string): boolean {
  if (leagueId && profile.id !== leagueId) return false;

  const entry = leagueId ? getCatalogEntryById(leagueId) : null;
  if (entry && profile.apiLeagueId !== undefined && profile.apiLeagueId !== entry.apiId) {
    return false;
  }

  if (!isLoadedLeagueProfile(profile)) return false;
  if (!profile.leaderBoards) return false;
  if (!Array.isArray(profile.seasonHistory)) return false;
  if (
    (profile.competitionFormat === "tournament" ||
      profile.competitionFormat === "knockout-cup") &&
    !profile.knockoutBracket
  ) {
    return false;
  }
  return hasPlayerLeaderData(profile.leaderBoards) || profile.seasonHistory.length > 0;
}
