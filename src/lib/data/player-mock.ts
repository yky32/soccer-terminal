import type { LeagueProfile, LeagueStandingRow } from "@/lib/data/league-profile";
import {
  mockPlayerAvatar,
  mockPlayerName,
  statValueForPlayer,
} from "@/lib/data/league-stats";
import type {
  PlayerBodyStats,
  PlayerLeagueStats,
  PlayerMatchPerformance,
  PlayerPositionInfo,
  PlayerProfile,
} from "@/lib/data/player-profile";
import type { TeamPosition } from "@/lib/data/team-profile";
import { playerSlugFromTeamAndName } from "@/lib/player-paths";
import { teamSlugFromName } from "@/lib/team-paths";

const NATIONALITIES = [
  "Spain",
  "England",
  "Brazil",
  "France",
  "Germany",
  "Argentina",
  "Portugal",
  "Netherlands",
  "Italy",
  "Belgium",
  "Norway",
  "Japan",
  "South Korea",
  "USA",
  "Mexico",
];

const ROLE_BY_POSITION: Record<TeamPosition, string[]> = {
  GK: ["Goalkeeper"],
  DEF: ["Centre-Back", "Left-Back", "Right-Back"],
  MID: ["Central Midfield", "Attacking Midfield", "Defensive Midfield"],
  FWD: ["Centre-Forward", "Left Winger", "Right Winger", "Second Striker"],
};

const SQUAD_SHAPE: TeamPosition[] = [
  "GK",
  "GK",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "MID",
  "MID",
  "MID",
  "MID",
  "MID",
  "MID",
  "FWD",
  "FWD",
  "FWD",
  "FWD",
  "FWD",
];

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pick<T>(items: T[], hash: number, offset = 0) {
  return items[(hash + offset) % items.length] ?? items[0];
}

function positionForSlot(slot: number): TeamPosition {
  return SQUAD_SHAPE[slot] ?? "MID";
}

function buildBodyStats(leagueId: string, teamName: string, slot: number): PlayerBodyStats {
  const hash = hashString(`${leagueId}:${teamName}:${slot}:body`);
  const feet: PlayerBodyStats["preferredFoot"][] = ["Right", "Left", "Both"];

  return {
    heightCm: 168 + (hash % 28),
    weightKg: 62 + (hash % 28),
    preferredFoot: pick(feet, hash) ?? "Right",
  };
}

function buildPositionInfo(slot: number, hash: number): PlayerPositionInfo {
  const primary = positionForSlot(slot);
  const roles = ROLE_BY_POSITION[primary];
  const secondaryPool = (["GK", "DEF", "MID", "FWD"] as TeamPosition[]).filter(
    (pos) => pos !== primary,
  );

  return {
    primary,
    secondary: hash % 4 === 0 ? pick(secondaryPool, hash, 1) ?? null : null,
    role: pick(roles, hash, 2) ?? roles[0] ?? primary,
  };
}

function buildLeagueStats(
  league: LeagueProfile,
  teamName: string,
  slot: number,
  standing: LeagueStandingRow,
): PlayerLeagueStats {
  const hash = hashString(`${league.id}:${teamName}:${slot}:stats`);
  const position = positionForSlot(slot);
  const appearances = Math.max(1, standing.played - (slot % 5));
  const starts = Math.max(1, appearances - (hash % 4));
  const goals =
    position === "FWD"
      ? Math.max(1, statValueForPlayer("goals", league.id, teamName, slot))
      : position === "MID"
        ? Math.max(0, Math.floor(statValueForPlayer("goals", league.id, teamName, slot) / 3))
        : hash % 3;
  const assists =
    position === "MID" || position === "FWD"
      ? Math.max(0, statValueForPlayer("assists", league.id, teamName, slot))
      : hash % 4;
  const rating = Math.round(statValueForPlayer("rating", league.id, teamName, slot) * 10) / 10;
  const fouls = Math.max(0, statValueForPlayer("fouls", league.id, teamName, slot));

  return {
    appearances,
    starts,
    minutes: starts * (65 + (hash % 26)),
    goals,
    assists,
    rating,
    fouls,
    yellowCards: hash % 7,
    redCards: hash % 11 === 0 ? 1 : 0,
    shots: goals * 3 + (hash % 12),
    passAccuracy: 72 + (hash % 24),
    xG: Math.round((goals * 0.85 + (hash % 10) / 10) * 10) / 10,
    keyPasses: assists + (hash % 8),
  };
}

function buildMatchPerformances(
  league: LeagueProfile,
  teamName: string,
  slot: number,
  standing: LeagueStandingRow,
): PlayerMatchPerformance[] {
  const opponents = league.standings.filter((row) => row.team !== teamName);

  return Array.from({ length: 5 }, (_, index) => {
    const opponent = opponents[index % opponents.length];
    if (!opponent) {
      return null;
    }

    const hash = hashString(`${league.id}:${teamName}:${slot}:match:${index}`);
    const isHome = index % 2 === 0;
    const hoursAgo = -(index + 1) * 96;
    const rating = Math.round((6.2 + (hash % 18) / 10) * 10) / 10;
    const goals = hash % 3 === 0 ? 1 + (hash % 2) : 0;
    const assists = hash % 5 === 0 ? 1 : 0;

    return {
      id: `${playerSlugFromTeamAndName(teamName, mockPlayerName(league.id, teamName, slot))}-match-${index}`,
      opponent: opponent.team,
      opponentLogo: opponent.teamLogo,
      isHome,
      date: new Date(Date.now() + hoursAgo * 3_600_000).toISOString(),
      rating,
      goals,
      assists,
      minutes: 60 + (hash % 31),
      matchday: `MD ${Math.max(1, league.matchday - index - 1)}`,
      shots: goals + (hash % 4),
      passes: 24 + (hash % 40),
    };
  }).filter((item): item is PlayerMatchPerformance => item !== null);
}

export function buildPlayerProfile(
  league: LeagueProfile,
  standing: LeagueStandingRow,
  slot: number,
): PlayerProfile {
  const teamName = standing.team;
  const name = mockPlayerName(league.id, teamName, slot);
  const hash = hashString(`${league.id}:${teamName}:${slot}`);
  const leagueStats = buildLeagueStats(league, teamName, slot, standing);
  const matchPerformances = buildMatchPerformances(league, teamName, slot, standing);

  return {
    slug: playerSlugFromTeamAndName(teamName, name),
    slot,
    name,
    avatar: mockPlayerAvatar(league.id, teamName, slot),
    number: slot === 0 ? 1 : (hash % 98) + 2,
    age: 18 + (hash % 18),
    nationality: pick(NATIONALITIES, hash, slot) ?? "International",
    team: teamName,
    teamLogo: standing.teamLogo,
    teamSlug: teamSlugFromName(teamName),
    league,
    body: buildBodyStats(league.id, teamName, slot),
    position: buildPositionInfo(slot, hash),
    marketValueEur: (3 + (hash % 120)) * 1_000_000,
    leagueStats,
    matchPerformances,
    ratingTrend: matchPerformances.map((match) => match.rating),
  };
}
