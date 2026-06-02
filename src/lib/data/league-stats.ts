import {
  LEAGUE_LEADER_LIMIT,
  type LeagueLeaderBoards,
  type LeaguePlayerStat,
  type LeaguePlayerStatKind,
  type LeagueProfile,
  type LeagueSeasonRecord,
  type LeagueStandingRow,
  type LeagueTeamStat,
} from "@/lib/data/league-profile";
import { teamSlugFromName } from "@/lib/team-paths";

const FIRST_NAMES = [
  "James",
  "Lucas",
  "Marco",
  "Yuki",
  "Omar",
  "Diego",
  "Kai",
  "Victor",
  "Antoine",
  "Bruno",
  "Gabriel",
  "Hugo",
  "Leandro",
  "Matheus",
  "Pedro",
  "Rafael",
];

const LAST_NAMES = [
  "Silva",
  "García",
  "Kim",
  "Alves",
  "Fernández",
  "Müller",
  "Santos",
  "Rossi",
  "Johnson",
  "Martinez",
  "Okonkwo",
  "Petrov",
  "Nielsen",
  "Costa",
  "Walker",
  "Brooks",
];

const PLAYER_STAT_KINDS: LeaguePlayerStatKind[] = ["rating", "goals", "assists", "fouls"];

const PLAYER_AVATAR_PHOTOS = [
  "photo-1574629810360-7efbbe195018",
  "photo-1507003211169-0a1dd7228f2d",
  "photo-1500648767791-00dcc994a43e",
  "photo-1472099645785-5658abf4ff4e",
  "photo-1519082780210-588b635ef122",
  "photo-1599562820212-4442516f7429",
  "photo-1552374196-1ab2a7036a8a",
  "photo-1544005313-94ddf0286df2",
  "photo-1534528741775-53994a69daeb",
  "photo-1539577614458-281718137e24",
  "photo-1529626455594-4ff0802cfb7e",
  "photo-1525134479661-759ea2f8b274",
  "photo-1517841905240-472988babdf9",
  "photo-1499996860823-ce281385117f",
  "photo-1488426862026-3d574a134fd4",
  "photo-1568602471122-783663691618",
  "photo-1600486913731-49a14d2a4c45",
  "photo-1580489944761-15a19d654956",
  "photo-1566492031773-4f4e44671857",
  "photo-1506794778202-cad84cf45f1d",
];

function unsplashAvatar(photoId: string) {
  return `https://images.unsplash.com/${photoId}?w=80&h=80&auto=format&fit=crop&q=80`;
}

/** Maps league profile ids to news wire league labels. */
export const LEAGUE_NEWS_LABELS: Record<string, string> = {
  "premier-league": "Premier League",
  "la-liga": "La Liga",
  "serie-a": "Serie A",
  bundesliga: "Bundesliga",
  "ligue-1": "Ligue 1",
  "world-cup": "World Cup",
  ucl: "Champions League",
  uel: "Europa League",
  mls: "MLS",
  j1: "J1 League",
  "saudi-pro": "Pro League",
};

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function playerName(leagueId: string, team: string, slot: number) {
  const hash = hashString(`${leagueId}:${team}:${slot}`);
  const first = FIRST_NAMES[hash % FIRST_NAMES.length] ?? "Alex";
  const last = LAST_NAMES[(hash >> 4) % LAST_NAMES.length] ?? "Morgan";
  return `${first} ${last}`;
}

function playerAvatar(leagueId: string, team: string, slot: number) {
  const hash = hashString(`avatar:${leagueId}:${team}:${slot}`);
  const photoId =
    PLAYER_AVATAR_PHOTOS[hash % PLAYER_AVATAR_PHOTOS.length] ?? PLAYER_AVATAR_PHOTOS[0];
  return unsplashAvatar(photoId ?? "photo-1574629810360-7efbbe195018");
}

function statValue(kind: LeaguePlayerStatKind, leagueId: string, team: string, slot: number) {
  const hash = hashString(`${kind}:${leagueId}:${team}:${slot}`);

  switch (kind) {
    case "rating":
      return 6.4 + (hash % 35) / 10;
    case "goals":
      return 28 - slot * 3 - (hash % 4);
    case "assists":
      return 18 - slot * 2 - (hash % 3);
    case "fouls":
      return 42 + slot * 2 + (hash % 8);
    default:
      return 0;
  }
}

function playerSlugFromName(name: string) {
  return teamSlugFromName(name);
}

function playerSlugFromTeamAndName(teamName: string, playerName: string) {
  return `${teamSlugFromName(teamName)}-${playerSlugFromName(playerName)}`;
}

function buildPlayerLeaderRows(
  league: LeagueProfile,
  teams: LeagueStandingRow[],
  kind: LeaguePlayerStatKind,
  limit: number,
  teamFilter?: string,
): LeaguePlayerStat[] {
  const pool = teamFilter ? teams.filter((team) => team.team === teamFilter) : teams;

  const rows = pool.flatMap((standing, teamIndex) =>
    Array.from({ length: teamFilter ? 3 : 2 }, (_, slot) => {
      const playerSlot = teamIndex + slot;
      const name = playerName(league.id, standing.team, playerSlot);
      const value = statValue(kind, league.id, standing.team, playerSlot);
      return {
        playerName: name,
        playerSlug: playerSlugFromTeamAndName(standing.team, name),
        playerAvatar: playerAvatar(league.id, standing.team, playerSlot),
        team: standing.team,
        teamLogo: standing.teamLogo,
        value,
        appearances: Math.max(8, standing.played - (slot % 3)),
      };
    }),
  );

  const sorted = [...rows].sort((a, b) => b.value - a.value);

  return sorted.slice(0, limit).map((row, index) => ({
    ...row,
    rank: index + 1,
    value: kind === "rating" ? Math.round(row.value * 10) / 10 : Math.round(row.value),
  }));
}

function buildTeamWinRates(standings: LeagueStandingRow[], limit: number): LeagueTeamStat[] {
  return [...standings]
    .map((standing) => ({
      team: standing.team,
      teamLogo: standing.teamLogo,
      value:
        standing.played > 0 ? Math.round((standing.won / standing.played) * 100) : 0,
      played: standing.played,
      won: standing.won,
      rank: 0,
    }))
    .sort((a, b) => b.value - a.value || b.won - a.won || a.team.localeCompare(b.team))
    .slice(0, limit)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function buildLeaderBoards(
  league: LeagueProfile,
  teamFilter?: string,
): LeagueLeaderBoards {
  const teams = teamFilter
    ? league.standings.filter((row) => row.team === teamFilter)
    : league.standings;

  const players = PLAYER_STAT_KINDS.reduce(
    (acc, kind) => {
      acc[kind] = buildPlayerLeaderRows(league, teams, kind, LEAGUE_LEADER_LIMIT, teamFilter);
      return acc;
    },
    {} as Record<LeaguePlayerStatKind, LeaguePlayerStat[]>,
  );

  return {
    players,
    teamWinRates: buildTeamWinRates(league.standings, LEAGUE_LEADER_LIMIT),
  };
}

export function buildLeagueLeaderBoards(league: LeagueProfile): LeagueLeaderBoards {
  return buildLeaderBoards(league);
}

const PLAYER_LEADER_KINDS: LeaguePlayerStatKind[] = ["rating", "goals", "assists", "fouls"];

export function hasPlayerLeaderData(boards: LeagueLeaderBoards) {
  return PLAYER_LEADER_KINDS.some((kind) => boards.players[kind].length > 0);
}

/** Attach team win rates from API standings when missing from leader payload. */
export function finalizeApiLeaderBoards(
  boards: LeagueLeaderBoards,
  league: LeagueProfile,
): LeagueLeaderBoards {
  return {
    ...boards,
    teamWinRates:
      boards.teamWinRates.length > 0
        ? boards.teamWinRates
        : buildTeamWinRates(league.standings, LEAGUE_LEADER_LIMIT),
  };
}

/** Slice league-wide API leader stats for one club (team page). */
export function leaderBoardsForTeam(
  boards: LeagueLeaderBoards | undefined,
  teamName: string,
): LeagueLeaderBoards {
  if (!boards) {
    return {
      players: { rating: [], goals: [], assists: [], fouls: [] },
      teamWinRates: [],
    };
  }

  const filterRows = <T extends { team: string }>(rows: T[]) =>
    rows.filter((row) => row.team === teamName).slice(0, 5);

  return {
    players: {
      rating: filterRows(boards.players.rating),
      goals: filterRows(boards.players.goals),
      assists: filterRows(boards.players.assists),
      fouls: filterRows(boards.players.fouls),
    },
    teamWinRates: filterRows(boards.teamWinRates),
  };
}

export function buildTeamLeaderBoards(
  league: LeagueProfile,
  teamName: string,
): LeagueLeaderBoards {
  return buildLeaderBoards(league, teamName);
}

/** @deprecated Use buildLeagueLeaderBoards */
export const buildLeagueStatLeaders = buildLeagueLeaderBoards;

/** @deprecated Use buildTeamLeaderBoards */
export const buildTeamStatLeaders = buildTeamLeaderBoards;

export function buildLeagueSeasons(league: LeagueProfile): LeagueSeasonRecord[] {
  const teams = league.standings;
  const currentLabel = league.season;

  const historyLabels =
    currentLabel.includes("/")
      ? ["2024/25", "2023/24", "2022/23", "2021/22", "2020/21"]
      : ["2025", "2024", "2023", "2022", "2021"];

  const seasons: LeagueSeasonRecord[] = [
    {
      id: `${league.id}-${currentLabel}`,
      label: currentLabel,
      champion: teams[0]?.team ?? "TBD",
      championLogo: teams[0]?.teamLogo ?? null,
      topScorer: playerName(league.id, teams[0]?.team ?? "League", 0),
      topScorerGoals: 24,
      isCurrent: true,
    },
  ];

  historyLabels.forEach((label, index) => {
    const champion = teams[(index + 1) % teams.length] ?? teams[0];
    if (!champion) return;

    seasons.push({
      id: `${league.id}-${label}`,
      label,
      champion: champion.team,
      championLogo: champion.teamLogo,
      topScorer: playerName(league.id, champion.team, index + 2),
      topScorerGoals: 22 - index,
    });
  });

  return seasons;
}

export function getLeagueNewsLabel(league: LeagueProfile) {
  return LEAGUE_NEWS_LABELS[league.id] ?? league.name;
}

export const LEAGUE_PLAYER_STAT_LABELS: Record<LeaguePlayerStatKind, string> = {
  rating: "Top rated",
  goals: "Top scorers",
  assists: "Top assists",
  fouls: "Most fouls",
};

export const LEAGUE_TEAM_WIN_RATE_LABEL = "Team win rate";

export function formatPlayerStatValue(kind: LeaguePlayerStatKind, value: number) {
  if (kind === "rating") return value.toFixed(1);
  return String(value);
}

export function formatTeamWinRate(value: number) {
  return `${value}%`;
}

export function formatTeamWinRateMeta(won: number, played: number) {
  return `${won}W · ${played} played`;
}

/** @deprecated Use LEAGUE_PLAYER_STAT_LABELS */
export const LEAGUE_STAT_LABELS = LEAGUE_PLAYER_STAT_LABELS;

/** @deprecated Use formatPlayerStatValue */
export function formatStatValue(kind: LeaguePlayerStatKind, value: number) {
  return formatPlayerStatValue(kind, value);
}

export const mockPlayerName = playerName;
export const mockPlayerAvatar = playerAvatar;
export const statValueForPlayer = statValue;
