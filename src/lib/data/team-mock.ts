import { findTeamsInText } from "@/lib/data/news-team-registry";
import type { LeagueFixture, LeagueProfile, LeagueStandingRow } from "@/lib/data/league-profile";
import {
  buildTeamLeaderBoards,
  mockPlayerAvatar,
  mockPlayerName,
} from "@/lib/data/league-stats";
import type { NewsArticle } from "@/lib/data/news-article";
import type {
  TeamClubInfo,
  TeamCoachRecord,
  TeamFormMatch,
  TeamHistorySeason,
  TeamMatchResult,
  TeamPosition,
  TeamProfile,
  TeamSquadPlayer,
} from "@/lib/data/team-profile";
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
  "Uruguay",
  "Morocco",
  "Japan",
  "South Korea",
  "USA",
  "Mexico",
];

const MANAGERS = [
  "Pep Guardiola",
  "Carlo Ancelotti",
  "Mikel Arteta",
  "Xabi Alonso",
  "Simone Inzaghi",
  "Luis Enrique",
  "Erik ten Hag",
  "Ange Postecoglou",
  "Diego Simeone",
  "Unai Emery",
];

const SURFACES = ["Grass", "Hybrid grass", "Artificial"];

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

function buildClubInfo(league: LeagueProfile, teamName: string): TeamClubInfo {
  const hash = hashString(`${league.id}:${teamName}:club`);

  return {
    stadium: `${teamName} Arena`,
    capacity: 35_000 + (hash % 55_000),
    opened: 1890 + (hash % 110),
    surface: pick(SURFACES, hash, 2) ?? "Grass",
    city: league.country === "Europe" ? "Europe" : league.country,
    country: league.country,
    founded: 1870 + (hash % 80),
    manager: pick(MANAGERS, hash, 4) ?? "Head Coach",
  };
}

function buildCoach(league: LeagueProfile, standing: LeagueStandingRow): TeamCoachRecord {
  const hash = hashString(`${league.id}:${standing.team}:coach`);
  const winRate = standing.played > 0 ? Math.round((standing.won / standing.played) * 100) : 0;
  const pointsPerGame =
    standing.played > 0
      ? Math.round((standing.points / standing.played) * 100) / 100
      : 0;

  return {
    name: pick(MANAGERS, hash) ?? "Head Coach",
    winRate,
    pointsPerGame,
    matches: standing.played,
  };
}

function buildSquad(
  league: LeagueProfile,
  teamName: string,
  standing: LeagueStandingRow,
): TeamSquadPlayer[] {
  const slug = teamSlugFromName(teamName);

  return SQUAD_SHAPE.map((position, index) => {
    const hash = hashString(`${league.id}:${teamName}:squad:${index}`);
    const appearances = Math.max(1, standing.played - (index % 5));
    const goals = position === "FWD" ? (hash % 18) + 2 : position === "MID" ? hash % 8 : hash % 2;
    const assists = position === "MID" || position === "FWD" ? hash % 10 : hash % 3;

    const name = mockPlayerName(league.id, teamName, index);

    return {
      id: `${slug}-${index}`,
      slug: playerSlugFromTeamAndName(teamName, name),
      name,
      avatar: mockPlayerAvatar(league.id, teamName, index),
      number: index === 0 ? 1 : (hash % 98) + 2,
      position,
      nationality: pick(NATIONALITIES, hash, index) ?? "International",
      age: 18 + (hash % 18),
      appearances,
      goals,
      assists,
      rating: Math.round((6.4 + (hash % 18) / 10) * 10) / 10,
    };
  });
}

function buildHistory(
  league: LeagueProfile,
  teamName: string,
  standing: LeagueStandingRow,
): TeamHistorySeason[] {
  const labels =
    league.season.includes("/")
      ? ["2024/25", "2023/24", "2022/23", "2021/22", "2020/21"]
      : ["2024", "2023", "2022", "2021", "2020"];

  return labels.map((season, index) => {
    const hash = hashString(`${league.id}:${teamName}:history:${season}`);
    const finish = Math.max(1, Math.min(20, standing.rank + (index % 3) - 1 + (hash % 4)));
    const played = 34 + (hash % 5);
    const won = Math.max(6, Math.floor(played * (0.35 + (hash % 30) / 100)));
    const drawn = Math.max(3, Math.floor((played - won) * 0.35));
    const lost = Math.max(0, played - won - drawn);

    return {
      id: `${teamSlugFromName(teamName)}-${season}`,
      season,
      finish,
      points: won * 3 + drawn,
      won,
      drawn,
      lost,
    };
  });
}

function buildFormMatches(
  league: LeagueProfile,
  teamName: string,
  standing: LeagueStandingRow,
): TeamFormMatch[] {
  const opponents = league.standings
    .map((row) => row.team)
    .filter((name) => name !== teamName);

  return standing.form.map((result, index) => {
    const opponent = opponents[index % opponents.length] ?? "Opponent";
    const opponentLogo =
      league.standings.find((row) => row.team === opponent)?.teamLogo ?? null;
    const hash = hashString(`${league.id}:${teamName}:form:${index}`);
    const isHome = index % 2 === 0;

    let teamScore: number;
    let opponentScore: number;

    if (result === "W") {
      teamScore = 2 + (hash % 2);
      opponentScore = hash % 2;
    } else if (result === "L") {
      opponentScore = 2 + (hash % 2);
      teamScore = hash % 2;
    } else {
      teamScore = 1 + (hash % 2);
      opponentScore = teamScore;
    }

    return {
      result,
      opponent,
      opponentLogo,
      isHome,
      teamScore,
      opponentScore,
    };
  });
}

function buildRecentResults(
  league: LeagueProfile,
  teamName: string,
  standing: LeagueStandingRow,
  formMatches: TeamFormMatch[],
): TeamMatchResult[] {
  return [...formMatches].reverse().map((match, index) => {
    const homeTeam = match.isHome ? teamName : match.opponent;
    const awayTeam = match.isHome ? match.opponent : teamName;
    const homeLogo = match.isHome
      ? standing.teamLogo
      : match.opponentLogo;
    const awayLogo = match.isHome
      ? match.opponentLogo
      : standing.teamLogo;
    const hoursAgo = -(index + 1) * 96;

    return {
      id: `${teamSlugFromName(teamName)}-result-${index}`,
      homeTeam,
      awayTeam,
      homeLogo,
      awayLogo,
      kickoffAt: new Date(Date.now() + hoursAgo * 3_600_000).toISOString(),
      matchday: `MD ${Math.max(1, league.matchday - index - 1)}`,
      homeScore: match.isHome ? match.teamScore : match.opponentScore,
      awayScore: match.isHome ? match.opponentScore : match.teamScore,
      isHome: match.isHome,
    };
  });
}

function filterTeamFixtures(
  league: LeagueProfile,
  teamName: string,
): LeagueFixture[] {
  return league.fixtures.filter(
    (fixture) => fixture.homeTeam === teamName || fixture.awayTeam === teamName,
  );
}

function buildUpcomingFixtures(
  league: LeagueProfile,
  teamName: string,
  standing: LeagueStandingRow,
): LeagueFixture[] {
  const existing = [...filterTeamFixtures(league, teamName)].sort(
    (a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime(),
  );

  if (existing.length >= 5) {
    return existing.slice(0, 5);
  }

  const opponents = league.standings.filter((row) => row.team !== teamName);
  const generated: LeagueFixture[] = [];
  const slug = teamSlugFromName(teamName);

  for (let index = existing.length; index < 5; index += 1) {
    const opponent = opponents[index % opponents.length];
    if (!opponent) break;

    const hash = hashString(`${league.id}:${teamName}:upcoming:${index}`);
    const isHome = index % 2 === 0;
    const hoursAhead = 24 + (index + 1) * 96 + (hash % 24);

    generated.push({
      id: `${slug}-upcoming-${index}`,
      homeTeam: isHome ? teamName : opponent.team,
      awayTeam: isHome ? opponent.team : teamName,
      homeLogo: isHome ? standing.teamLogo : opponent.teamLogo,
      awayLogo: isHome ? opponent.teamLogo : standing.teamLogo,
      kickoffAt: new Date(Date.now() + hoursAhead * 3_600_000).toISOString(),
      matchday: `MD ${league.matchday + index + 1}`,
    });
  }

  return [...existing, ...generated]
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime())
    .slice(0, 5);
}

export function buildTeamProfile(
  league: LeagueProfile,
  standing: LeagueStandingRow,
): TeamProfile {
  const slug = teamSlugFromName(standing.team);
  const formMatches = buildFormMatches(league, standing.team, standing);

  return {
    slug,
    name: standing.team,
    logo: standing.teamLogo,
    league,
    standing,
    squad: buildSquad(league, standing.team, standing),
    coach: buildCoach(league, standing),
    club: buildClubInfo(league, standing.team),
    history: buildHistory(league, standing.team, standing),
    formMatches,
    recentResults: buildRecentResults(league, standing.team, standing, formMatches),
    upcomingFixtures: buildUpcomingFixtures(league, standing.team, standing),
    leaderBoards: buildTeamLeaderBoards(league, standing.team),
  };
}

export function getTeamNewsArticles(articles: NewsArticle[], teamName: string, limit = 12) {
  const teamLower = teamName.toLowerCase();

  return articles
    .filter((article) => {
      const text = `${article.headline} ${article.excerpt}`;
      const detected = findTeamsInText(text, 4);
      if (detected.some((team) => team.name.toLowerCase() === teamLower)) return true;
      return text.toLowerCase().includes(teamLower);
    })
    .slice(0, limit);
}

export function getTeamProfile(
  league: LeagueProfile,
  standing: LeagueStandingRow,
) {
  return buildTeamProfile(league, standing);
}
