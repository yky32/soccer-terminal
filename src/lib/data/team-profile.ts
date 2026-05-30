import type {
  LeagueFixture,
  LeagueFormResult,
  LeagueLeaderBoards,
  LeagueProfile,
  LeagueStandingRow,
} from "@/lib/data/league-profile";

export type TeamPosition = "GK" | "DEF" | "MID" | "FWD";

export type TeamSquadPlayer = {
  id: string;
  name: string;
  avatar: string | null;
  number: number;
  position: TeamPosition;
  nationality: string;
  age: number;
  appearances: number;
  goals: number;
  assists: number;
  rating: number;
};

export type TeamCoachRecord = {
  name: string;
  winRate: number;
  pointsPerGame: number;
  matches: number;
};

export type TeamClubInfo = {
  stadium: string;
  capacity: number;
  opened: number;
  surface: string;
  city: string;
  country: string;
  founded: number;
  manager: string;
};

export type TeamHistorySeason = {
  id: string;
  season: string;
  finish: number;
  points: number;
  won: number;
  drawn: number;
  lost: number;
};

export type TeamFormMatch = {
  result: LeagueFormResult;
  opponent: string;
  opponentLogo: string | null;
  isHome: boolean;
  teamScore: number;
  opponentScore: number;
};

export type TeamMatchResult = LeagueFixture & {
  homeScore: number;
  awayScore: number;
  isHome: boolean;
};

export type TeamProfile = {
  slug: string;
  name: string;
  logo: string | null;
  league: LeagueProfile;
  standing: LeagueStandingRow;
  squad: TeamSquadPlayer[];
  coach: TeamCoachRecord;
  club: TeamClubInfo;
  history: TeamHistorySeason[];
  formMatches: TeamFormMatch[];
  recentResults: TeamMatchResult[];
  upcomingFixtures: LeagueFixture[];
  leaderBoards: LeagueLeaderBoards;
};
