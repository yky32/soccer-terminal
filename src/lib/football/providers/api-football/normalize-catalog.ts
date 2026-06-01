import type {
  LeagueFixture,
  LeagueFormResult,
  LeagueLeaderBoards,
  LeaguePlayerStat,
  LeagueProfile,
  LeagueStandingRow,
  LeagueTeamStat,
} from "@/lib/data/league-profile";
import type { LeagueCatalogEntry } from "@/lib/football/league-catalog";
import {
  competitionFormatForEntry,
  seasonLabelForEntry,
  seasonYearForEntry,
} from "@/lib/football/league-catalog";
import type { ApiFootballLiveFixture } from "@/lib/football/providers/api-football/types";
import { playerSlugFromTeamAndName } from "@/lib/player-paths";

export type ApiFootballStandingRow = {
  rank: number;
  team: { id: number; name: string; logo: string | null };
  points: number;
  goalsDiff: number;
  form: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
};

export type ApiFootballStandingsBlock = {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string | null;
    flag: string | null;
    season: number;
    standings: ApiFootballStandingRow[][];
  };
};

export type ApiFootballTopPlayer = {
  player: {
    id: number;
    name: string;
    photo: string | null;
  };
  statistics: Array<{
    team: { id: number; name: string; logo: string | null };
    games: { appearences: number | null; rating: string | null };
    goals: { total: number | null; assists: number | null };
    fouls: { committed: number | null };
  }>;
};

export type ApiFootballSquadPlayer = {
  id: number;
  name: string;
  age: number | null;
  number: number | null;
  position: string | null;
  photo: string | null;
};

export type ApiFootballSquad = {
  team: { id: number; name: string; logo: string | null };
  players: ApiFootballSquadPlayer[];
};

export type ApiFootballTeamInfo = {
  team: {
    id: number;
    name: string;
    code: string | null;
    country: string;
    founded: number | null;
    logo: string | null;
  };
  venue: {
    id: number | null;
    name: string | null;
    address: string | null;
    city: string | null;
    capacity: number | null;
    surface: string | null;
    image: string | null;
  };
};

export type ApiFootballCoach = {
  id: number;
  name: string;
  firstname: string | null;
  lastname: string | null;
  nationality: string | null;
};

export type ApiFootballPlayerProfile = {
  player: {
    id: number;
    name: string;
    firstname: string | null;
    lastname: string | null;
    age: number | null;
    birth: { date: string | null; place: string | null; country: string | null };
    nationality: string | null;
    height: string | null;
    weight: string | null;
    photo: string | null;
  };
  statistics: Array<{
    team: { id: number; name: string; logo: string | null };
    league: { id: number; name: string; country: string; logo: string | null; flag: string | null; season: number };
    games: {
      appearences: number | null;
      lineups: number | null;
      minutes: number | null;
      rating: string | null;
    };
    goals: { total: number | null; assists: number | null };
    shots: { total: number | null };
    passes: { total: number | null; accuracy: number | null; key: number | null };
    fouls: { committed: number | null; drawn: number | null };
    cards: { yellow: number | null; red: number | null };
  }>;
};

export type ApiFootballInjury = {
  player: { id: number; name: string; photo: string | null; type: string | null; reason: string | null };
  team: { id: number; name: string; logo: string | null };
  fixture: { id: number; timezone: string; date: string; timestamp: number };
  league: { id: number; season: number; name: string; country: string; logo: string | null; flag: string | null };
};

export function parseForm(form: string | null | undefined): LeagueFormResult[] {
  if (!form) return [];

  return form
    .split("")
    .filter((char): char is LeagueFormResult => char === "W" || char === "D" || char === "L")
    .slice(-5);
}

function standingsGroupLabel(index: number) {
  return `Group ${String.fromCharCode(65 + index)}`;
}

export function flattenStandingsGroups(groups: ApiFootballStandingRow[][]): LeagueStandingRow[] {
  if (groups.length <= 1) {
    return (groups[0] ?? []).map((row) => normalizeStandingRow(row));
  }

  return groups.flatMap((group, index) =>
    group.map((row) => normalizeStandingRow(row, standingsGroupLabel(index))),
  );
}

export function normalizeStandingRow(
  row: ApiFootballStandingRow,
  group?: string,
): LeagueStandingRow {
  return {
    rank: row.rank,
    team: row.team.name,
    teamLogo: row.team.logo,
    group,
    teamId: row.team.id,
    played: row.all.played,
    won: row.all.win,
    drawn: row.all.draw,
    lost: row.all.lose,
    goalsFor: row.all.goals.for,
    goalsAgainst: row.all.goals.against,
    points: row.points,
    form: parseForm(row.form),
  };
}

export function normalizeFixture(fixture: ApiFootballLiveFixture): LeagueFixture {
  return {
    id: String(fixture.fixture.id),
    homeTeam: fixture.teams.home.name,
    awayTeam: fixture.teams.away.name,
    homeLogo: fixture.teams.home.logo,
    awayLogo: fixture.teams.away.logo,
    kickoffAt: fixture.fixture.date ?? new Date().toISOString(),
    matchday: fixture.league.round ?? "Fixture",
  };
}

export function buildLeagueShell(
  entry: LeagueCatalogEntry,
  seasonYear: number,
): Omit<LeagueProfile, "standings" | "fixtures" | "leaderBoards"> {
  return {
    id: entry.id,
    name: entry.name,
    shortName: entry.shortName,
    country: entry.country,
    countryFlag: entry.countryFlag,
    logo: entry.logo,
    region: entry.region,
    tier: entry.tier,
    competitionFormat: competitionFormatForEntry(entry),
    season: seasonLabelForEntry(entry, seasonYear),
    teams: 0,
    matchday: 0,
    liveMatches: 0,
  };
}

function topPlayerStat(
  item: ApiFootballTopPlayer,
  rank: number,
  value: number,
  appearances: number,
): LeaguePlayerStat {
  const stats = item.statistics[0];
  const team = stats?.team;

  return {
    rank,
    playerName: item.player.name,
    playerSlug: playerSlugFromTeamAndName(team?.name ?? "team", item.player.name),
    playerAvatar: item.player.photo,
    team: team?.name ?? "Unknown",
    teamLogo: team?.logo ?? null,
    value,
    appearances: appearances || stats?.games.appearences || 0,
  };
}

export function normalizeLeaderBoards(
  topscorers: ApiFootballTopPlayer[],
  topassists: ApiFootballTopPlayer[],
): LeagueLeaderBoards {
  const goals = topscorers.slice(0, 8).map((item, index) =>
    topPlayerStat(
      item,
      index + 1,
      item.statistics[0]?.goals.total ?? 0,
      item.statistics[0]?.games.appearences ?? 0,
    ),
  );

  const assists = topassists.slice(0, 8).map((item, index) =>
    topPlayerStat(
      item,
      index + 1,
      item.statistics[0]?.goals.assists ?? 0,
      item.statistics[0]?.games.appearences ?? 0,
    ),
  );

  const rating = [...topscorers]
    .sort((a, b) => {
      const left = Number.parseFloat(a.statistics[0]?.games.rating ?? "0");
      const right = Number.parseFloat(b.statistics[0]?.games.rating ?? "0");
      return right - left;
    })
    .slice(0, 8)
    .map((item, index) =>
      topPlayerStat(
        item,
        index + 1,
        Math.round(Number.parseFloat(item.statistics[0]?.games.rating ?? "0") * 10) / 10,
        item.statistics[0]?.games.appearences ?? 0,
      ),
    );

  const fouls = [...topscorers]
    .sort((a, b) => {
      const left = a.statistics[0]?.fouls.committed ?? 0;
      const right = b.statistics[0]?.fouls.committed ?? 0;
      return right - left;
    })
    .slice(0, 8)
    .map((item, index) =>
      topPlayerStat(
        item,
        index + 1,
        item.statistics[0]?.fouls.committed ?? 0,
        item.statistics[0]?.games.appearences ?? 0,
      ),
    );

  return {
    players: { rating, goals, assists, fouls },
    teamWinRates: [],
  };
}

export function teamWinRatesFromStandings(standings: LeagueStandingRow[]): LeagueTeamStat[] {
  return [...standings]
    .filter((row) => row.played > 0)
    .map((row) => ({
      rank: row.rank,
      team: row.team,
      teamLogo: row.teamLogo,
      value: Math.round((row.won / row.played) * 100),
      played: row.played,
      won: row.won,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function currentSeasonYear(entry: LeagueCatalogEntry) {
  return seasonYearForEntry(entry);
}
