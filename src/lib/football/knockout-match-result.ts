import type { LeagueKnockoutMatch } from "@/lib/data/league-profile";

export type KnockoutSide = "home" | "away";

/** Regulation win (green) vs winner after a draw, e.g. penalties (orange). */
export type KnockoutWinKind = "regulation" | "draw-decided";

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

/** True when the match was level but a winner was decided (penalties, etc.). */
export function isKnockoutDrawDecided(match: LeagueKnockoutMatch) {
  if (!isKnockoutMatchFinished(match.status)) return false;
  if (match.status === "PEN") return true;

  if (match.homeGoals === null || match.awayGoals === null) return false;
  if (match.homeGoals !== match.awayGoals) return false;

  return match.homeWinner === true || match.awayWinner === true;
}

export function knockoutLegWinKind(match: LeagueKnockoutMatch): KnockoutWinKind | null {
  const side = knockoutLegWinner(match);
  if (!side) return null;
  return isKnockoutDrawDecided(match) ? "draw-decided" : "regulation";
}

export type KnockoutAggregateResult = {
  winnerTeam: string;
  winnerLogo: string | null;
  winKind: KnockoutWinKind;
};

function tieTeams(legs: LeagueKnockoutMatch[]) {
  return { teamA: legs[0].homeTeam, teamB: legs[0].awayTeam };
}

function accumulateTieGoals(
  legs: LeagueKnockoutMatch[],
  teamA: string,
  teamB: string,
  onlyFinished = true,
) {
  let goalsA = 0;
  let goalsB = 0;
  let legsCounted = 0;

  for (const leg of legs) {
    if (onlyFinished && !isKnockoutMatchFinished(leg.status)) continue;
    legsCounted += 1;

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

  return { goalsA, goalsB, legsCounted };
}

export type KnockoutTieSummary = {
  teamA: string;
  teamB: string;
  logoA: string | null;
  logoB: string | null;
  goalsA: number;
  goalsB: number;
  legsFinished: number;
  legsTotal: number;
  hasLiveLeg: boolean;
  winnerTeam: string | null;
  winKind: KnockoutWinKind | null;
};

/** Aggregate scoreboard for a two-legged tie (works with 0–2 legs finished). */
export function getKnockoutTieSummary(legs: LeagueKnockoutMatch[]): KnockoutTieSummary | null {
  if (legs.length < 2) return null;

  const { teamA, teamB } = tieTeams(legs);
  const totals = accumulateTieGoals(legs, teamA, teamB, true);
  if (!totals) return null;

  const logoA =
    legs.find((leg) => leg.homeTeam === teamA)?.homeLogo ??
    legs.find((leg) => leg.awayTeam === teamA)?.awayLogo ??
    null;
  const logoB =
    legs.find((leg) => leg.homeTeam === teamB)?.homeLogo ??
    legs.find((leg) => leg.awayTeam === teamB)?.awayLogo ??
    null;

  const decided = computeKnockoutAggregate(legs);
  const hasLiveLeg = legs.some(
    (leg) => leg.status === "1H" || leg.status === "2H" || leg.status === "HT",
  );

  return {
    teamA,
    teamB,
    logoA,
    logoB,
    goalsA: totals.goalsA,
    goalsB: totals.goalsB,
    legsFinished: totals.legsCounted,
    legsTotal: legs.length,
    hasLiveLeg,
    winnerTeam: decided?.winnerTeam ?? null,
    winKind: decided?.winKind ?? null,
  };
}

export function computeKnockoutAggregate(legs: LeagueKnockoutMatch[]): KnockoutAggregateResult | null {
  if (legs.length < 2) return null;

  const finished = legs.filter((leg) => isKnockoutMatchFinished(leg.status));
  if (finished.length < 2) return null;

  const { teamA, teamB } = tieTeams(legs);
  const totals = accumulateTieGoals(finished, teamA, teamB, false);
  if (!totals) return null;

  const { goalsA, goalsB } = totals;

  if (goalsA > goalsB) {
    const logo =
      legs.find((leg) => leg.homeTeam === teamA)?.homeLogo ??
      legs.find((leg) => leg.awayTeam === teamA)?.awayLogo ??
      null;
    return { winnerTeam: teamA, winnerLogo: logo, winKind: "regulation" };
  }

  if (goalsB > goalsA) {
    const logo =
      legs.find((leg) => leg.homeTeam === teamB)?.homeLogo ??
      legs.find((leg) => leg.awayTeam === teamB)?.awayLogo ??
      null;
    return { winnerTeam: teamB, winnerLogo: logo, winKind: "regulation" };
  }

  for (const leg of [...finished].reverse()) {
    if (!isKnockoutDrawDecided(leg)) continue;

    const side = knockoutLegWinner(leg);
    if (!side) continue;

    const winnerTeam = side === "home" ? leg.homeTeam : leg.awayTeam;
    const winnerLogo = side === "home" ? leg.homeLogo : leg.awayLogo;
    return { winnerTeam, winnerLogo, winKind: "draw-decided" };
  }

  return null;
}

export function knockoutTieKey(match: LeagueKnockoutMatch) {
  return [match.homeTeam, match.awayTeam].sort().join("|");
}

function tieKeyForMatch(match: LeagueKnockoutMatch) {
  return knockoutTieKey(match);
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

/**
 * Splits a round into left/right bracket halves by tie (not by individual leg).
 * Keeps both legs of a two-legged tie on the same side.
 */
export function splitKnockoutRoundHalf(
  matches: LeagueKnockoutMatch[],
  side: "left" | "right",
) {
  const ties = groupKnockoutIntoTies(matches);
  const midpoint = Math.ceil(ties.length / 2);
  const half = side === "left" ? ties.slice(0, midpoint) : ties.slice(midpoint);
  return half.flat();
}

export function teamWonKnockoutLeg(match: LeagueKnockoutMatch, teamName: string) {
  const winner = knockoutLegWinner(match);
  if (!winner) return false;
  return winner === "home"
    ? match.homeTeam === teamName
    : match.awayTeam === teamName;
}

export type KnockoutMatchAggregateHint = {
  winnerTeam: string;
  winnerLogo: string | null;
  winKind: KnockoutWinKind;
};

/** Aggregate advancer per leg id for an entire round (survives bracket left/right split). */
export function buildKnockoutAggregateByMatchId(
  matches: LeagueKnockoutMatch[],
): Map<string, KnockoutMatchAggregateHint> {
  const map = new Map<string, KnockoutMatchAggregateHint>();

  for (const legs of groupKnockoutIntoTies(matches)) {
    const aggregate = computeKnockoutAggregate(legs);
    if (!aggregate) continue;

    for (const leg of legs) {
      const winnerLogo =
        leg.homeTeam === aggregate.winnerTeam
          ? leg.homeLogo
          : leg.awayTeam === aggregate.winnerTeam
            ? leg.awayLogo
            : aggregate.winnerLogo;
      map.set(leg.id, {
        winnerTeam: aggregate.winnerTeam,
        winnerLogo,
        winKind: aggregate.winKind,
      });
    }
  }

  return map;
}
