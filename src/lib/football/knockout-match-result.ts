import type { LeagueKnockoutMatch } from "@/lib/data/league-profile";

export type KnockoutSide = "home" | "away";

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

export function isKnockoutMatchFinished(status: string) {
  return FINISHED_STATUSES.has(status);
}

/** Winner of a single leg (null if not finished or draw without penalties). */
export function knockoutLegWinner(match: LeagueKnockoutMatch): KnockoutSide | null {
  if (!isKnockoutMatchFinished(match.status)) return null;

  if (match.homeWinner === true) return "home";
  if (match.awayWinner === true) return "away";
  if (match.homeGoals === null || match.awayGoals === null) return null;
  if (match.homeGoals > match.awayGoals) return "home";
  if (match.awayGoals > match.homeGoals) return "away";

  return null;
}

export type KnockoutAggregateResult = {
  winnerTeam: string;
  winnerLogo: string | null;
};

export function computeKnockoutAggregate(legs: LeagueKnockoutMatch[]): KnockoutAggregateResult | null {
  if (legs.length < 2) return null;

  const finished = legs.filter((leg) => isKnockoutMatchFinished(leg.status));
  if (finished.length < 2) return null;

  const teamA = legs[0].homeTeam;
  const teamB = legs[0].awayTeam;
  let goalsA = 0;
  let goalsB = 0;

  for (const leg of finished) {
    if (leg.homeTeam === teamA && leg.awayTeam === teamB) {
      goalsA += leg.homeGoals ?? 0;
      goalsB += leg.awayGoals ?? 0;
    } else if (leg.homeTeam === teamB && leg.awayTeam === teamA) {
      goalsA += leg.awayGoals ?? 0;
      goalsB += leg.homeGoals ?? 0;
    } else {
      return null;
    }
  }

  if (goalsA === goalsB) return null;

  if (goalsA > goalsB) {
    const logo =
      legs.find((leg) => leg.homeTeam === teamA)?.homeLogo ??
      legs.find((leg) => leg.awayTeam === teamA)?.awayLogo ??
      null;
    return { winnerTeam: teamA, winnerLogo: logo };
  }

  const logo =
    legs.find((leg) => leg.homeTeam === teamB)?.homeLogo ??
    legs.find((leg) => leg.awayTeam === teamB)?.awayLogo ??
    null;
  return { winnerTeam: teamB, winnerLogo: logo };
}

function tieKeyForMatch(match: LeagueKnockoutMatch) {
  return [match.homeTeam, match.awayTeam].sort().join("|");
}

/** Groups two-legged ties; single matches stay as one-element arrays. */
export function groupKnockoutIntoTies(matches: LeagueKnockoutMatch[]): LeagueKnockoutMatch[][] {
  const byKey = new Map<string, LeagueKnockoutMatch[]>();

  for (const match of matches) {
    const key = tieKeyForMatch(match);
    const list = byKey.get(key) ?? [];
    list.push(match);
    byKey.set(key, list);
  }

  const groups: LeagueKnockoutMatch[][] = [];

  for (const list of byKey.values()) {
    const sorted = [...list].sort((left, right) => {
      const leftTime = left.kickoffAt ? Date.parse(left.kickoffAt) : 0;
      const rightTime = right.kickoffAt ? Date.parse(right.kickoffAt) : 0;
      return leftTime - rightTime;
    });
    groups.push(sorted);
  }

  return groups.sort((left, right) => {
    const leftTime = left[0]?.kickoffAt ? Date.parse(left[0].kickoffAt) : 0;
    const rightTime = right[0]?.kickoffAt ? Date.parse(right[0].kickoffAt) : 0;
    return leftTime - rightTime;
  });
}

export function teamWonKnockoutLeg(match: LeagueKnockoutMatch, teamName: string) {
  const winner = knockoutLegWinner(match);
  if (!winner) return false;
  return winner === "home"
    ? match.homeTeam === teamName
    : match.awayTeam === teamName;
}
