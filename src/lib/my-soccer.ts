export const FAVORITES_STORAGE_KEY = "soccer-terminal.team-favorites";

export const MAX_FAVORITE_TEAMS = 12;

export type FavoriteTeam = {
  leagueId: string;
  teamSlug: string;
  teamName: string;
  teamLogo: string | null;
  leagueShortName: string;
};

export function favoriteTeamKey(team: Pick<FavoriteTeam, "leagueId" | "teamSlug">) {
  return `${team.leagueId}:${team.teamSlug}`;
}

export function readFavoriteTeams(): FavoriteTeam[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is FavoriteTeam =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as FavoriteTeam).leagueId === "string" &&
        typeof (item as FavoriteTeam).teamSlug === "string" &&
        typeof (item as FavoriteTeam).teamName === "string",
    );
  } catch {
    return [];
  }
}

export function writeFavoriteTeams(teams: FavoriteTeam[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(teams));
}
