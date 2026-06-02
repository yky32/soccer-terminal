export type LeagueRegion = "europe" | "americas" | "asia" | "oceania" | "middle-east" | "world";

export type LeagueTier = "top-flight" | "continental" | "regional";

import type { StandingQualificationZone } from "@/lib/football/standing-qualification";

export type LeagueFormResult = "W" | "D" | "L";

export type LeagueStandingRow = {
  rank: number;
  team: string;
  teamLogo: string | null;
  /** Present when the competition has multiple groups (e.g. World Cup). */
  group?: string;
  /** API-Football team id — used for squad/fixture lookups */
  teamId?: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: LeagueFormResult[];
  /** Raw API-Football standings `description` (qualification zone text). */
  qualificationLabel?: string | null;
  qualificationZone?: StandingQualificationZone | null;
};

export type LeagueFixture = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string | null;
  awayLogo: string | null;
  kickoffAt: string;
  matchday: string;
};

export type LeagueCompetitionFormat = "league" | "tournament" | "knockout-cup";

export type LeagueKnockoutMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string | null;
  awayLogo: string | null;
  homeGoals: number | null;
  awayGoals: number | null;
  /** From API when the leg is decided (incl. penalties). */
  homeWinner?: boolean | null;
  awayWinner?: boolean | null;
  kickoffAt: string | null;
  status: string;
  round: string;
};

export type LeagueKnockoutRound = {
  id: string;
  label: string;
  matches: LeagueKnockoutMatch[];
};

export type LeagueKnockoutBracket = {
  /** True when API-Football returned at least one knockout round. */
  published: boolean;
  rounds: LeagueKnockoutRound[];
};

export type LeaguePlayerStatKind = "rating" | "goals" | "assists" | "fouls";

export type LeaguePlayerStat = {
  rank: number;
  playerName: string;
  playerSlug: string;
  playerAvatar: string | null;
  team: string;
  teamLogo: string | null;
  value: number;
  appearances: number;
};

export type LeagueTeamStat = {
  rank: number;
  team: string;
  teamLogo: string | null;
  value: number;
  played: number;
  won: number;
};

/** Rows shown per column on league leader boards (goals, rating, win rate, etc.). */
export const LEAGUE_LEADER_LIMIT = 10;

export type LeagueLeaderBoards = {
  players: Record<LeaguePlayerStatKind, LeaguePlayerStat[]>;
  teamWinRates: LeagueTeamStat[];
};

/** @deprecated Use LeaguePlayerStatKind */
export type LeagueStatKind = LeaguePlayerStatKind;

/** @deprecated Use LeagueLeaderBoards */
export type LeagueStatLeaders = LeagueLeaderBoards;

export type LeagueSeasonRecord = {
  id: string;
  label: string;
  champion: string;
  championLogo: string | null;
  topScorer: string;
  topScorerGoals: number;
  isCurrent?: boolean;
};

export type LeagueProfile = {
  id: string;
  name: string;
  shortName: string;
  country: string;
  countryFlag: string | null;
  logo: string | null;
  region: LeagueRegion;
  tier: LeagueTier;
  /** Defaults to league when omitted (mock catalog). */
  competitionFormat?: LeagueCompetitionFormat;
  season: string;
  /** API-Football league + season used for standings (cache validation). */
  apiLeagueId?: number;
  apiSeason?: number;
  teams: number;
  matchday: number;
  liveMatches: number;
  standings: LeagueStandingRow[];
  fixtures: LeagueFixture[];
  /** Populated from API topscorers / assists when available */
  leaderBoards?: LeagueLeaderBoards;
  /** Past seasons from API-Football league + standings history */
  seasonHistory?: LeagueSeasonRecord[];
  /** Knockout rounds for tournaments (World Cup, etc.) */
  knockoutBracket?: LeagueKnockoutBracket;
};

export const LEAGUE_REGION_LABELS: Record<LeagueRegion | "all", string> = {
  all: "All regions",
  europe: "Europe",
  americas: "Americas",
  asia: "Asia",
  "middle-east": "Middle East",
  oceania: "Oceania",
  world: "World",
};

export const LEAGUE_TIER_LABELS: Record<LeagueTier | "all", string> = {
  all: "All tiers",
  "top-flight": "Top flight",
  continental: "Continental",
  regional: "Regional",
};
