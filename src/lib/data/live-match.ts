export type MatchEventType = "goal" | "yellow" | "red";

export type MatchLiveEvent = {
  minute: number;
  extraMinute?: number | null;
  type: MatchEventType;
  team: "home" | "away";
  detail?: string | null;
};

export type LiveMatch = {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  leagueId: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  homeLogo: string | null;
  awayLogo: string | null;
  homeWinner: boolean | null;
  awayWinner: boolean | null;
  kickoffAt: string | null;
  statusShort: string;
  statusLong: string;
  elapsed: number | null;
  league: string;
  leagueLogo: string | null;
  leagueRound: string | null;
  country: string;
  countryCode: string;
  countryFlag: string | null;
  venue: string | null;
  venueCity: string | null;
  latitude: number | null;
  longitude: number | null;
  halftimeHome: number | null;
  halftimeAway: number | null;
  events: MatchLiveEvent[];
};
