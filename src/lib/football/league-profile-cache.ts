import type { LeagueProfile } from "@/lib/data/league-profile";
import { hasPlayerLeaderData } from "@/lib/data/league-stats";

/** True when standings and API leader/season payloads are present (not catalog shell). */
export function isLoadedLeagueProfile(profile: LeagueProfile | undefined): boolean {
  return Boolean(profile && profile.standings.length > 0);
}

/**
 * Reject older localStorage entries that predate API leader boards / season history.
 */
export function isValidCachedLeagueProfile(profile: LeagueProfile): boolean {
  if (!isLoadedLeagueProfile(profile)) return false;
  if (!profile.leaderBoards) return false;
  if (!Array.isArray(profile.seasonHistory)) return false;
  return hasPlayerLeaderData(profile.leaderBoards) || profile.seasonHistory.length > 0;
}
