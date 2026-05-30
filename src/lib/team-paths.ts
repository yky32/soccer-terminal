import type { LeagueProfile, LeagueStandingRow } from "@/lib/data/league-profile";
import { getMockLeagues } from "@/lib/data/mock-leagues";

export function teamSlugFromName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function teamHref(leagueId: string, teamSlug: string) {
  return `/leagues/${leagueId}/teams/${teamSlug}`;
}

export function teamHrefFromName(leagueId: string, teamName: string) {
  return teamHref(leagueId, teamSlugFromName(teamName));
}

export function findStandingBySlug(
  league: LeagueProfile,
  teamSlug: string,
): LeagueStandingRow | null {
  return (
    league.standings.find((row) => teamSlugFromName(row.team) === teamSlug) ?? null
  );
}

export function getAllTeamStaticParams() {
  return getMockLeagues().flatMap((league) =>
    league.standings.map((standing) => ({
      leagueId: league.id,
      teamSlug: teamSlugFromName(standing.team),
    })),
  );
}
