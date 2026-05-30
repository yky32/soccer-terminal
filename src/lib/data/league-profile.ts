export type LeagueRegion = "europe" | "americas" | "asia" | "oceania" | "middle-east";

export type LeagueTier = "top-flight" | "continental" | "regional";

export type LeagueFormResult = "W" | "D" | "L";

export type LeagueStandingRow = {
  rank: number;
  team: string;
  teamLogo: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: LeagueFormResult[];
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

export type LeagueProfile = {
  id: string;
  name: string;
  shortName: string;
  country: string;
  countryFlag: string | null;
  logo: string | null;
  region: LeagueRegion;
  tier: LeagueTier;
  season: string;
  teams: number;
  matchday: number;
  liveMatches: number;
  standings: LeagueStandingRow[];
  fixtures: LeagueFixture[];
};

export const LEAGUE_REGION_LABELS: Record<LeagueRegion | "all", string> = {
  all: "All regions",
  europe: "Europe",
  americas: "Americas",
  asia: "Asia",
  "middle-east": "Middle East",
  oceania: "Oceania",
};

export const LEAGUE_TIER_LABELS: Record<LeagueTier | "all", string> = {
  all: "All tiers",
  "top-flight": "Top flight",
  continental: "Continental",
  regional: "Regional",
};
