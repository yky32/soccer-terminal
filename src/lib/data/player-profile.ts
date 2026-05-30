import type { LeagueProfile } from "@/lib/data/league-profile";
import type { TeamPosition } from "@/lib/data/team-profile";

export type PlayerBodyStats = {
  heightCm: number;
  weightKg: number;
  preferredFoot: "Left" | "Right" | "Both";
};

export type PlayerPositionInfo = {
  primary: TeamPosition;
  secondary: TeamPosition | null;
  role: string;
};

export type PlayerLeagueStats = {
  appearances: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  rating: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  shots: number;
  passAccuracy: number;
  xG: number;
  keyPasses: number;
};

export type PlayerMatchPerformance = {
  id: string;
  opponent: string;
  opponentLogo: string | null;
  isHome: boolean;
  date: string;
  rating: number;
  goals: number;
  assists: number;
  minutes: number;
  matchday: string;
  shots: number;
  passes: number;
};

export type PlayerProfile = {
  slug: string;
  slot: number;
  name: string;
  avatar: string | null;
  number: number;
  age: number;
  nationality: string;
  team: string;
  teamLogo: string | null;
  teamSlug: string;
  league: LeagueProfile;
  body: PlayerBodyStats;
  position: PlayerPositionInfo;
  marketValueEur: number;
  leagueStats: PlayerLeagueStats;
  matchPerformances: PlayerMatchPerformance[];
  ratingTrend: number[];
};
