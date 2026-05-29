import { buildLiveFixturesSnapshot } from "@/lib/football/providers/api-football/normalize-fixtures";
import type { ApiFootballLiveFixture } from "@/lib/football/providers/api-football/types";

/** @deprecated Use buildLiveFixturesSnapshot */
export function aggregateLiveCountries(fixtures: ApiFootballLiveFixture[]) {
  return buildLiveFixturesSnapshot(fixtures).countries;
}
