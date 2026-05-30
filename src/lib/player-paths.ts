import { getMockLeagueById, getMockLeagues } from "@/lib/data/mock-leagues";
import { mockPlayerName } from "@/lib/data/league-stats";
import { teamSlugFromName } from "@/lib/team-paths";

export function playerSlugFromName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function playerSlugFromTeamAndName(teamName: string, playerName: string) {
  return `${teamSlugFromName(teamName)}-${playerSlugFromName(playerName)}`;
}

export function playerHref(leagueId: string, playerSlug: string) {
  return `/leagues/${leagueId}/players/${playerSlug}`;
}

export function playerHrefFromTeamAndName(
  leagueId: string,
  teamName: string,
  playerName: string,
) {
  return playerHref(leagueId, playerSlugFromTeamAndName(teamName, playerName));
}

export function findPlayerSlotByName(
  leagueId: string,
  teamName: string,
  playerName: string,
  maxSlots = 24,
) {
  for (let slot = 0; slot < maxSlots; slot += 1) {
    if (mockPlayerName(leagueId, teamName, slot) === playerName) {
      return slot;
    }
  }
  return null;
}

export function findPlayerBySlug(leagueId: string, playerSlug: string) {
  const league = getMockLeagueById(leagueId);
  if (!league) return null;

  for (const standing of league.standings) {
    for (let slot = 0; slot < 24; slot += 1) {
      const name = mockPlayerName(league.id, standing.team, slot);
      if (playerSlugFromTeamAndName(standing.team, name) === playerSlug) {
        return { league, standing, slot, name };
      }
    }
  }

  return null;
}

export function getAllPlayerStaticParams() {
  return getMockLeagues().flatMap((league) =>
    league.standings.flatMap((standing) =>
      Array.from({ length: 19 }, (_, slot) => {
        const name = mockPlayerName(league.id, standing.team, slot);
        return {
          leagueId: league.id,
          playerSlug: playerSlugFromTeamAndName(standing.team, name),
        };
      }),
    ),
  );
}
