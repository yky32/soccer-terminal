import type { MatchDetail } from "@/lib/data/match-detail";
import { coerceMatchDetail } from "@/lib/football/match-detail-coerce";
import { fetchApiMatchDetail } from "@/lib/football/providers/api-football/fetch-match-detail";
import { getMatchDetailCached } from "@/lib/football/providers/api-football/match-detail-cache";

export async function fetchMatchDetail(fixtureId: number): Promise<MatchDetail | null> {
  if (!Number.isFinite(fixtureId) || fixtureId <= 0) return null;

  const apiKey = process.env.API_FOOTBALL_KEY?.trim();
  if (!apiKey) {
    console.error("[match-detail] API_FOOTBALL_KEY is required — mock data is not used");
    return null;
  }

  const detail = await getMatchDetailCached(fixtureId, () => fetchApiMatchDetail(apiKey, fixtureId));
  return coerceMatchDetail(detail);
}
