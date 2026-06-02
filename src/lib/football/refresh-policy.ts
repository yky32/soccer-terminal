/**
 * Football data refresh policy — tuned for API-Football PRO (7,500 req/day).
 * Standings/fixtures change on a match-day cadence, not second-by-second.
 */

/** Client background poll for map + match monitor (10 min). */
export const CLIENT_MAP_REFRESH_MS = 10 * 60_000;

/** In-memory map snapshot TTL on the server. */
export const SNAPSHOT_TTL_LIVE_MS = 10 * 60_000;
export const SNAPSHOT_TTL_FUTURE_MS = 30 * 60_000;

/** Next.js route segment revalidate (seconds). */
export const ROUTE_REVALIDATE_MAP_SEC = 600;
export const ROUTE_REVALIDATE_LEAGUE_SEC = 1800;
export const ROUTE_REVALIDATE_NEWS_SEC = 1800;

/** Upstream API-Football fetch cache (seconds). */
export const API_REVALIDATE_LIVE_SEC = 600;
export const API_REVALIDATE_DEFAULT_SEC = 1800;
/** Finished fixtures — immutable after full time. */
export const API_REVALIDATE_MATCH_FINISHED_SEC = 60 * 60 * 24 * 7;
/** Not started / postponed — lineups and kickoff may still change. */
export const API_REVALIDATE_MATCH_UPCOMING_SEC = 1800;

/** Server in-memory match detail cache for live / upcoming. */
export const MATCH_DETAIL_VOLATILE_CACHE_MS = 60_000;
export const MATCH_DETAIL_UPCOMING_CACHE_MS = 15 * 60_000;

/** Client localStorage TTL for league profiles on /leagues. */
export const LEAGUE_LOCAL_TTL_MS = 2 * 60 * 60_000;

/** Client localStorage TTL for map + match monitor snapshot. */
export const MAP_LOCAL_TTL_MS = CLIENT_MAP_REFRESH_MS;

/** Server in-memory league profile cache. */
export const LEAGUE_SERVER_CACHE_MS = 60 * 60_000;

/** Catalog fixture fetches — sequential to avoid burst rate limits. */
export const CATALOG_FETCH_CONCURRENCY = 1;
