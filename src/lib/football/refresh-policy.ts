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

/** Client localStorage TTL for league profiles on /leagues. */
export const LEAGUE_LOCAL_TTL_MS = 60 * 60_000;

/** Server in-memory league profile cache. */
export const LEAGUE_SERVER_CACHE_MS = 30 * 60_000;

/** Catalog fixture fetches — sequential to avoid burst rate limits. */
export const CATALOG_FETCH_CONCURRENCY = 1;
