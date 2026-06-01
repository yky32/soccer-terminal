import type { LeagueKnockoutBracket, LeagueKnockoutMatch, LeagueKnockoutRound } from "@/lib/data/league-profile";
import type { LeagueCatalogEntry } from "@/lib/football/league-catalog";
import type { ApiFootballLiveFixture } from "@/lib/football/providers/api-football/types";
import { apiFootballGetSafe } from "@/lib/football/providers/api-football/request";
import { mapInBatches } from "@/lib/football/providers/api-football/request";
import { API_REVALIDATE_DEFAULT_SEC, CATALOG_FETCH_CONCURRENCY } from "@/lib/football/refresh-policy";

const KNOCKOUT_ROUND_RANK: Record<string, number> = {
  "Round of 32": 0,
  "Round of 16": 1,
  "8th Finals": 1,
  "Quarter-finals": 2,
  "Semi-finals": 3,
  "3rd Place Final": 4,
  "Final": 5,
};

/** Whitelist — excludes league phase, qualifiers, and play-offs. */
function isKnockoutRound(round: string) {
  const label = round.trim();
  return (
    /^round of 32$/i.test(label) ||
    /^round of 16$/i.test(label) ||
    /^8th finals$/i.test(label) ||
    /^quarter-finals$/i.test(label) ||
    /^semi-finals$/i.test(label) ||
    /^3rd place final$/i.test(label) ||
    /^final$/i.test(label)
  );
}

function roundId(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function normalizeKnockoutMatch(fixture: ApiFootballLiveFixture): LeagueKnockoutMatch {
  const round = fixture.league.round ?? "Knockout";

  return {
    id: String(fixture.fixture.id),
    homeTeam: fixture.teams.home.name,
    awayTeam: fixture.teams.away.name,
    homeLogo: fixture.teams.home.logo,
    awayLogo: fixture.teams.away.logo,
    homeGoals: fixture.goals.home,
    awayGoals: fixture.goals.away,
    homeWinner: fixture.teams.home.winner ?? null,
    awayWinner: fixture.teams.away.winner ?? null,
    kickoffAt: fixture.fixture.date ?? null,
    status: fixture.fixture.status.short,
    round,
  };
}

function sortKnockoutRounds(rounds: LeagueKnockoutRound[]) {
  return [...rounds].sort(
    (left, right) =>
      (KNOCKOUT_ROUND_RANK[left.label] ?? 99) - (KNOCKOUT_ROUND_RANK[right.label] ?? 99),
  );
}

export async function fetchLeagueKnockoutBracket(
  apiKey: string,
  entry: LeagueCatalogEntry,
  season: number,
): Promise<LeagueKnockoutBracket> {
  const roundNames = await apiFootballGetSafe<string>(
    apiKey,
    "/fixtures/rounds",
    { league: entry.apiId, season },
    API_REVALIDATE_DEFAULT_SEC,
  );

  const knockoutRoundNames = roundNames.filter(isKnockoutRound);

  if (knockoutRoundNames.length === 0) {
    return { published: false, rounds: [] };
  }

  const roundBatches = await mapInBatches(
    knockoutRoundNames,
    CATALOG_FETCH_CONCURRENCY,
    async (round) => {
      const fixtures = await apiFootballGetSafe<ApiFootballLiveFixture>(
        apiKey,
        "/fixtures",
        { league: entry.apiId, season, round },
        API_REVALIDATE_DEFAULT_SEC,
      );

      return {
        id: roundId(round),
        label: round,
        matches: fixtures
          .map(normalizeKnockoutMatch)
          .sort((a, b) => {
            const left = a.kickoffAt ? Date.parse(a.kickoffAt) : 0;
            const right = b.kickoffAt ? Date.parse(b.kickoffAt) : 0;
            return left - right;
          }),
      } satisfies LeagueKnockoutRound;
    },
  );

  const rounds = sortKnockoutRounds(
    roundBatches.filter((round) => round.matches.length > 0),
  );

  return {
    published: rounds.length > 0,
    rounds,
  };
}
