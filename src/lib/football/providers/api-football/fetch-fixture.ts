import { apiFootballGet } from "@/lib/football/providers/api-football/request";
import type { ApiFootballLiveFixture } from "@/lib/football/providers/api-football/types";

/**
 * Load one fixture by API-Football `fixture.id` (the same id used in `/matches/[fixtureId]`).
 * Tries `GET /fixtures?id=` then `GET /fixtures?ids=` per provider docs.
 */
export async function fetchApiFootballFixture(
  apiKey: string,
  fixtureId: number,
  revalidate: number,
): Promise<ApiFootballLiveFixture | null> {
  const byId = await apiFootballGet<ApiFootballLiveFixture>(
    apiKey,
    "/fixtures",
    { id: fixtureId },
    revalidate,
  );

  if (byId[0]) return byId[0];

  const byIds = await apiFootballGet<ApiFootballLiveFixture>(
    apiKey,
    "/fixtures",
    { ids: fixtureId },
    revalidate,
  );

  return byIds[0] ?? null;
}
