import type { LeagueSeasonRecord } from "@/lib/data/league-profile";
import type { LeagueCatalogEntry } from "@/lib/football/league-catalog";
import { seasonLabelForEntry } from "@/lib/football/league-catalog";
import {
  normalizeStandingRow,
  type ApiFootballStandingsBlock,
  type ApiFootballTopPlayer,
} from "@/lib/football/providers/api-football/normalize-catalog";
import { apiFootballGetSafe } from "@/lib/football/providers/api-football/request";
import { API_REVALIDATE_DEFAULT_SEC } from "@/lib/football/refresh-policy";

type ApiFootballLeagueSeason = {
  year: number;
  start: string;
  end: string;
  current: boolean;
};

type ApiFootballLeagueDetail = {
  league: {
    id: number;
    name: string;
    seasons: ApiFootballLeagueSeason[];
  };
};

const MAX_SEASONS = 3;

export async function fetchLeagueSeasonHistory(
  apiKey: string,
  entry: LeagueCatalogEntry,
  currentSeasonYear: number,
  currentChampion: { team: string; logo: string | null } | null,
  currentTopScorer: { name: string; goals: number } | null,
): Promise<LeagueSeasonRecord[]> {
  const details = await apiFootballGetSafe<ApiFootballLeagueDetail>(
    apiKey,
    "/leagues",
    { id: entry.apiId },
    API_REVALIDATE_DEFAULT_SEC,
  );

  const leagueInfo = details[0];
  if (!leagueInfo?.league.seasons?.length) {
    if (!currentChampion) return [];

    return [
      {
        id: `${entry.id}-${currentSeasonYear}`,
        label: seasonLabelForEntry(entry, currentSeasonYear),
        champion: currentChampion.team,
        championLogo: currentChampion.logo,
        topScorer: currentTopScorer?.name ?? "—",
        topScorerGoals: currentTopScorer?.goals ?? 0,
        isCurrent: true,
      },
    ];
  }

  const seasons = [...leagueInfo.league.seasons]
    .sort((a, b) => b.year - a.year)
    .slice(0, MAX_SEASONS);

  const records: LeagueSeasonRecord[] = [];

  for (const season of seasons) {
    const label = seasonLabelForEntry(entry, season.year);
    const isCurrent = season.year === currentSeasonYear || season.current;

    if (isCurrent && currentChampion) {
      records.push({
        id: `${entry.id}-${season.year}`,
        label,
        champion: currentChampion.team,
        championLogo: currentChampion.logo,
        topScorer: currentTopScorer?.name ?? "—",
        topScorerGoals: currentTopScorer?.goals ?? 0,
        isCurrent: true,
      });
      continue;
    }

    const [standingsBlocks, scorers] = await Promise.all([
      apiFootballGetSafe<ApiFootballStandingsBlock>(
        apiKey,
        "/standings",
        { league: entry.apiId, season: season.year },
        API_REVALIDATE_DEFAULT_SEC,
      ),
      apiFootballGetSafe<ApiFootballTopPlayer>(
        apiKey,
        "/players/topscorers",
        { league: entry.apiId, season: season.year },
        API_REVALIDATE_DEFAULT_SEC,
      ),
    ]);

    const table = standingsBlocks[0]?.league.standings[0] ?? [];
    const rows = table.map(normalizeStandingRow);
    const champion = rows.find((row) => row.rank === 1) ?? rows[0];
    const top = scorers[0];

    records.push({
      id: `${entry.id}-${season.year}`,
      label,
      champion: champion?.team ?? "—",
      championLogo: champion?.teamLogo ?? null,
      topScorer: top?.player.name ?? "—",
      topScorerGoals: top?.statistics[0]?.goals.total ?? 0,
      isCurrent: false,
    });
  }

  return records;
}
