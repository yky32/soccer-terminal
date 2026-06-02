import type { LiveMatch } from "@/lib/data/live-match";

export type MatchDetailTab = "overview" | "lineup" | "h2h";

export type MatchDetailScoreBreakdown = {
  halftime: { home: number; away: number } | null;
  fulltime: { home: number; away: number } | null;
  extratime: { home: number; away: number } | null;
  penalty: { home: number; away: number } | null;
};

export type MatchDetailStat = {
  key: string;
  label: string;
  home: string;
  away: string;
  homeNumeric: number | null;
  awayNumeric: number | null;
};

export type MatchDetailTimelinePerson = {
  name: string;
  photo: string | null;
};

export type MatchDetailTimelineItem = {
  id: string;
  minute: string;
  type: "goal" | "card" | "subst" | "period" | "info";
  team: "home" | "away" | "neutral";
  primary: string;
  secondary?: string;
  scoreAfter?: string;
  player?: MatchDetailTimelinePerson;
  assist?: MatchDetailTimelinePerson;
  subst?: {
    out: MatchDetailTimelinePerson;
    in: MatchDetailTimelinePerson;
  };
  cardKind?: "yellow" | "red";
};

export type MatchTimelineCheckpoint = {
  label: string;
  score?: string;
};

/** One phase of play: events, then an optional checkpoint (HT, FT, …). */
export type MatchTimelineSegment = {
  id: string;
  events: MatchDetailTimelineItem[];
  checkpoint?: MatchTimelineCheckpoint;
};

export type MatchDetailTimelineView = {
  showKickoff: boolean;
  segments: MatchTimelineSegment[];
};

export type MatchDetailPenaltyKick = {
  id: string;
  order: number;
  team: "home" | "away";
  player: string;
  playerPhoto: string | null;
  scored: boolean;
  homeScore: number;
  awayScore: number;
};

export type MatchDetailFormMatch = {
  id: number;
  opponent: string;
  opponentLogo: string | null;
  isHome: boolean;
  goalsFor: number;
  goalsAgainst: number;
  result: "W" | "D" | "L";
  date: string | null;
};

export type MatchDetailH2HSummary = {
  homeTeamWins: number;
  awayTeamWins: number;
  draws: number;
};

export type MatchDetailPlayer = {
  id: number | null;
  name: string;
  number: string | null;
  position: string | null;
  /** API pitch grid e.g. "2:3" (row:column, row 1 = goalkeeper line). */
  grid: string | null;
  photo: string | null;
  rating: string | null;
  minutes: number | null;
  goals: number | null;
  assists: number | null;
  yellowCards: number | null;
  redCards: number | null;
};

export type MatchDetailPlayerPerformance = {
  id: number;
  name: string;
  photo: string | null;
  position: string | null;
  rating: string | null;
  minutes: number | null;
  goals: number | null;
  assists: number | null;
  shotsTotal: number | null;
  passesTotal: number | null;
  yellowCards: number | null;
  redCards: number | null;
};

export type MatchDetailInjury = {
  id: string;
  player: string;
  playerPhoto: string | null;
  team: string;
  teamLogo: string | null;
  type: string | null;
  reason: string | null;
};

export type MatchDetailLineupSide = {
  team: string;
  teamLogo: string | null;
  formation: string | null;
  coach: string | null;
  starting: MatchDetailPlayer[];
  substitutes: MatchDetailPlayer[];
};

export type MatchDetailH2HMatch = {
  id: number;
  date: string | null;
  league: string;
  leagueLogo: string | null;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  homeLogo: string | null;
  awayLogo: string | null;
};

export type MatchDetail = {
  match: LiveMatch;
  referee: string | null;
  score: MatchDetailScoreBreakdown;
  statistics: MatchDetailStat[];
  timeline: MatchDetailTimelineView;
  penaltyShootout: MatchDetailPenaltyKick[];
  injuries: MatchDetailInjury[];
  timezone: string | null;
  lineups: {
    home: MatchDetailLineupSide | null;
    away: MatchDetailLineupSide | null;
  };
  playerPerformances: {
    home: MatchDetailPlayerPerformance[];
    away: MatchDetailPlayerPerformance[];
  };
  headToHead: MatchDetailH2HMatch[];
  h2hSummary: MatchDetailH2HSummary;
  homeForm: MatchDetailFormMatch[];
  awayForm: MatchDetailFormMatch[];
};
