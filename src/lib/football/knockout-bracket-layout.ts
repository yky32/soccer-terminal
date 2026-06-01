import type { LeagueKnockoutBracket, LeagueKnockoutMatch, LeagueKnockoutRound } from "@/lib/data/league-profile";
import {
  groupKnockoutIntoTies,
  knockoutTieKey,
} from "@/lib/football/knockout-match-result";

export type BracketSide = "left" | "right";

export type KnockoutBracketLayout = {
  tieSide: Map<string, BracketSide>;
  tieOrder: Map<string, number>;
};

const BRACKET_TREE_ROUND =
  /^(round of 32|round of 16|8th finals|quarter-finals|semi-finals)$/i;

function layoutTieId(round: LeagueKnockoutRound, tie: LeagueKnockoutMatch[]) {
  return `${round.id}|${knockoutTieKey(tie[0])}`;
}

function teamsInTie(tie: LeagueKnockoutMatch[]) {
  const match = tie[0];
  return [match.homeTeam, match.awayTeam];
}

function tieKickoff(tie: LeagueKnockoutMatch[]) {
  return tie[0]?.kickoffAt ? Date.parse(tie[0].kickoffAt) : 0;
}

function findTieWithTeam(round: LeagueKnockoutRound | undefined, team: string) {
  if (!round) return null;

  for (const tie of groupKnockoutIntoTies(round.matches)) {
    if (teamsInTie(tie).includes(team)) return tie;
  }

  return null;
}

/** Groups ties by the next-round tie their teams feed into (UEFA bracket path). */
function orderTiesByNextRound(
  ties: LeagueKnockoutMatch[][],
  nextRound: LeagueKnockoutRound | undefined,
) {
  if (!nextRound || ties.length <= 1) {
    return [...ties].sort((left, right) => tieKickoff(left) - tieKickoff(right));
  }

  const nextTies = groupKnockoutIntoTies(nextRound.matches);
  const buckets = new Map<string, LeagueKnockoutMatch[][]>();

  for (const tie of ties) {
    const nextTie = nextTies.find((candidate) =>
      teamsInTie(tie).some((team) => teamsInTie(candidate).includes(team)),
    );
    const bucketKey = nextTie ? knockoutTieKey(nextTie[0]) : `orphan-${knockoutTieKey(tie[0])}`;
    const list = buckets.get(bucketKey) ?? [];
    list.push(tie);
    buckets.set(bucketKey, list);
  }

  const ordered: LeagueKnockoutMatch[][] = [];

  for (const nextTie of nextTies) {
    const feeders = buckets.get(knockoutTieKey(nextTie[0])) ?? [];
    feeders.sort((left, right) => tieKickoff(left) - tieKickoff(right));
    ordered.push(...feeders);
    buckets.delete(knockoutTieKey(nextTie[0]));
  }

  const orphans = [...buckets.values()].flat();
  orphans.sort((left, right) => tieKickoff(left) - tieKickoff(right));
  ordered.push(...orphans);

  return ordered;
}

function bracketTreeRounds(bracket: LeagueKnockoutBracket) {
  const seen = new Set<string>();

  return bracket.rounds.filter((round) => {
    if (!BRACKET_TREE_ROUND.test(round.label.trim())) return false;
    if (seen.has(round.label)) return false;
    seen.add(round.label);
    return true;
  });
}

function resolveTieSide(
  tie: LeagueKnockoutMatch[],
  previousRound: LeagueKnockoutRound,
  tieSide: Map<string, BracketSide>,
): BracketSide {
  const feederSides = teamsInTie(tie).map((team) => {
    const feederTie = findTieWithTeam(previousRound, team);
    if (!feederTie) return null;
    return tieSide.get(layoutTieId(previousRound, feederTie)) ?? null;
  });

  const unique = [...new Set(feederSides.filter((side): side is BracketSide => Boolean(side)))];

  if (unique.length === 1) return unique[0];
  if (unique.length > 1) return unique[0];

  return "left";
}

export function buildKnockoutBracketLayout(bracket: LeagueKnockoutBracket): KnockoutBracketLayout {
  const tieSide = new Map<string, BracketSide>();
  const tieOrder = new Map<string, number>();
  const treeRounds = bracketTreeRounds(bracket);

  for (let index = 0; index < treeRounds.length; index += 1) {
    const round = treeRounds[index];
    const nextRound = treeRounds[index + 1];
    const previousRound = treeRounds[index - 1];
    const ties = groupKnockoutIntoTies(round.matches);

    if (index === 0) {
      const ordered = orderTiesByNextRound(ties, nextRound);
      const midpoint = Math.ceil(ordered.length / 2);

      ordered.forEach((tie, orderIndex) => {
        const id = layoutTieId(round, tie);
        tieSide.set(id, orderIndex < midpoint ? "left" : "right");
        tieOrder.set(id, orderIndex);
      });

      continue;
    }

    const ordered = orderTiesByNextRound(
      [...ties].sort((left, right) => {
        const leftSide = resolveTieSide(left, previousRound, tieSide);
        const rightSide = resolveTieSide(right, previousRound, tieSide);
        if (leftSide !== rightSide) return leftSide === "left" ? -1 : 1;
        return tieKickoff(left) - tieKickoff(right);
      }),
      nextRound,
    );

    ordered.forEach((tie, orderIndex) => {
      const id = layoutTieId(round, tie);
      tieSide.set(id, resolveTieSide(tie, previousRound, tieSide));
      tieOrder.set(id, orderIndex);
    });
  }

  return { tieSide, tieOrder };
}

export function selectMatchesForBracketSide(
  round: LeagueKnockoutRound,
  side: BracketSide,
  layout: KnockoutBracketLayout,
) {
  const ties = groupKnockoutIntoTies(round.matches);

  return ties
    .filter((tie) => layout.tieSide.get(layoutTieId(round, tie)) === side)
    .sort(
      (left, right) =>
        (layout.tieOrder.get(layoutTieId(round, left)) ?? 0) -
        (layout.tieOrder.get(layoutTieId(round, right)) ?? 0),
    )
    .flat();
}

/** Left half then right half; falls back to API order for final / bronze. */
export function orderRoundMatchesForDisplay(
  round: LeagueKnockoutRound,
  layout: KnockoutBracketLayout,
) {
  const laidOut = [
    ...selectMatchesForBracketSide(round, "left", layout),
    ...selectMatchesForBracketSide(round, "right", layout),
  ];

  return laidOut.length > 0 ? laidOut : round.matches;
}
