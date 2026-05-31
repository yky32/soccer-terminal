import type { LeagueFixture, LeagueFormResult, LeagueProfile, LeagueStandingRow } from "@/lib/data/league-profile";
import type {
  TeamClubInfo,
  TeamCoachRecord,
  TeamFormMatch,
  TeamMatchResult,
  TeamPosition,
  TeamProfile,
  TeamSquadPlayer,
} from "@/lib/data/team-profile";
import { buildTeamLeaderBoards } from "@/lib/data/league-stats";
import { playerSlugFromTeamAndName } from "@/lib/player-paths";
import { findStandingBySlug, teamSlugFromName } from "@/lib/team-paths";
import {
  normalizeFixture,
  type ApiFootballCoach,
  type ApiFootballSquad,
  type ApiFootballTeamInfo,
} from "@/lib/football/providers/api-football/normalize-catalog";
import { apiFootballGet } from "@/lib/football/providers/api-football/request";
import { seasonYearForEntry, getCatalogEntryById } from "@/lib/football/league-catalog";
import { fetchLeagueProfile } from "@/lib/football/providers/api-football/fetch-league-profile";
import type { ApiFootballLiveFixture } from "@/lib/football/providers/api-football/types";

function mapPosition(position: string | null): TeamPosition {
  const value = (position ?? "").toLowerCase();
  if (value.includes("goalkeeper")) return "GK";
  if (value.includes("defender") || value.includes("back")) return "DEF";
  if (value.includes("midfield")) return "MID";
  if (value.includes("attacker") || value.includes("forward") || value.includes("wing")) {
    return "FWD";
  }
  return "MID";
}

function buildClubInfo(team: ApiFootballTeamInfo, manager: string): TeamClubInfo {
  return {
    stadium: team.venue.name ?? "Stadium TBD",
    capacity: team.venue.capacity ?? 0,
    opened: team.team.founded ?? 1900,
    surface: team.venue.surface ?? "Grass",
    city: team.venue.city ?? team.team.country,
    country: team.team.country,
    founded: team.team.founded ?? 1900,
    manager,
  };
}

function buildCoach(standing: LeagueStandingRow, coachName: string): TeamCoachRecord {
  const winRate = standing.played > 0 ? Math.round((standing.won / standing.played) * 100) : 0;
  const pointsPerGame =
    standing.played > 0 ? Math.round((standing.points / standing.played) * 100) / 100 : 0;

  return {
    name: coachName,
    winRate,
    pointsPerGame,
    matches: standing.played,
  };
}

function formFromFixtures(
  teamName: string,
  fixtures: ApiFootballLiveFixture[],
): TeamFormMatch[] {
  return fixtures.map((fixture) => {
    const isHome = fixture.teams.home.name === teamName;
    const homeGoals = fixture.goals.home ?? 0;
    const awayGoals = fixture.goals.away ?? 0;
    const teamScore = isHome ? homeGoals : awayGoals;
    const opponentScore = isHome ? awayGoals : homeGoals;

    let result: LeagueFormResult = "D";
    if (teamScore > opponentScore) result = "W";
    if (teamScore < opponentScore) result = "L";

    return {
      result,
      opponent: isHome ? fixture.teams.away.name : fixture.teams.home.name,
      opponentLogo: isHome ? fixture.teams.away.logo : fixture.teams.home.logo,
      isHome,
      teamScore,
      opponentScore,
    };
  });
}

function recentResultsFromFixtures(
  teamName: string,
  standing: LeagueStandingRow,
  fixtures: ApiFootballLiveFixture[],
): TeamMatchResult[] {
  return fixtures.map((fixture) => {
    const normalized = normalizeFixture(fixture);
    const isHome = fixture.teams.home.name === teamName;

    return {
      ...normalized,
      homeScore: fixture.goals.home ?? 0,
      awayScore: fixture.goals.away ?? 0,
      isHome,
    };
  });
}

function buildSquad(
  squad: ApiFootballSquad,
  league: LeagueProfile,
  standing: LeagueStandingRow,
): TeamSquadPlayer[] {
  return squad.players.map((player, index) => ({
    id: String(player.id),
    slug: playerSlugFromTeamAndName(standing.team, player.name),
    name: player.name,
    avatar: player.photo,
    number: player.number ?? index + 1,
    position: mapPosition(player.position),
    nationality: league.country,
    age: player.age ?? 24,
    appearances: Math.max(0, standing.played - (index % 4)),
    goals: 0,
    assists: 0,
    rating: 6.8,
  }));
}

export async function fetchTeamProfile(
  apiKey: string,
  leagueId: string,
  teamSlug: string,
): Promise<TeamProfile | null> {
  const entry = getCatalogEntryById(leagueId);
  if (!entry) return null;

  const league = await fetchLeagueProfile(apiKey, entry);
  const standing = findStandingBySlug(league, teamSlug);
  if (!standing?.teamId) return null;

  const season = seasonYearForEntry(entry);
  const teamId = standing.teamId;

  const [squadBlocks, lastFixtures, nextFixtures, teamInfoBlocks, coachBlocks] =
    await Promise.all([
      apiFootballGet<ApiFootballSquad>(apiKey, "/players/squads", { team: teamId }),
      apiFootballGet<ApiFootballLiveFixture>(apiKey, "/fixtures", { team: teamId, last: 5, season }),
      apiFootballGet<ApiFootballLiveFixture>(apiKey, "/fixtures", { team: teamId, next: 5, season }),
      apiFootballGet<ApiFootballTeamInfo>(apiKey, "/teams", { id: teamId }),
      apiFootballGet<ApiFootballCoach>(apiKey, "/coachs", { team: teamId }).catch(
        () => [] as ApiFootballCoach[],
      ),
    ]);

  const squadBlock = squadBlocks[0];
  const teamInfo = teamInfoBlocks[0];
  const coachName = coachBlocks[0]?.name ?? "Head Coach";
  const formMatches = formFromFixtures(standing.team, lastFixtures);
  const recentResults = recentResultsFromFixtures(standing.team, standing, lastFixtures);
  const upcomingFixtures = nextFixtures.map(normalizeFixture);

  const squad = squadBlock
    ? buildSquad(squadBlock, league, standing)
    : buildSquad({ team: { id: teamId, name: standing.team, logo: standing.teamLogo }, players: [] }, league, standing);

  const history = [
    {
      id: `${teamSlug}-${league.season}`,
      season: league.season,
      finish: standing.rank,
      points: standing.points,
      won: standing.won,
      drawn: standing.drawn,
      lost: standing.lost,
    },
  ];

  return {
    slug: teamSlugFromName(standing.team),
    name: standing.team,
    logo: standing.teamLogo,
    league,
    standing,
    squad,
    coach: buildCoach(standing, coachName),
    club: teamInfo ? buildClubInfo(teamInfo, coachName) : buildClubInfo(
      {
        team: { id: teamId, name: standing.team, code: null, country: league.country, founded: null, logo: standing.teamLogo },
        venue: { id: null, name: null, address: null, city: null, capacity: null, surface: null, image: null },
      },
      coachName,
    ),
    history,
    formMatches: formMatches.length > 0 ? formMatches : standing.form.map((result, index) => ({
      result,
      opponent: league.standings[(index + 1) % league.standings.length]?.team ?? "Opponent",
      opponentLogo: league.standings[(index + 1) % league.standings.length]?.teamLogo ?? null,
      isHome: index % 2 === 0,
      teamScore: result === "W" ? 2 : result === "L" ? 0 : 1,
      opponentScore: result === "W" ? 0 : result === "L" ? 2 : 1,
    })),
    recentResults,
    upcomingFixtures,
    leaderBoards: league.leaderBoards ?? buildTeamLeaderBoards(league, standing.team),
  };
}
