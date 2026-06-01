/**
 * Football data refresh policy — standings/fixtures change on a match-day cadence,
 * not second-by-second. Keep intervals conservative to stay within API rate limits.
 */

/** Client background poll for map + match monitor (5 min). */
export const CLIENT_MAP_REFRESH_MS = 5 * 60_000;

/** In-memory map snapshot TTL on the server. */
export const SNAPSHOT_TTL_LIVE_MS = 5 * 60_000;
export const SNAPSHOT_TTL_FUTURE_MS = 15 * 60_000;

/** Next.js route segment revalidate (seconds). */
export const ROUTE_REVALIDATE_MAP_SEC = 300;
export const ROUTE_REVALIDATE_LEAGUE_SEC = 600;
export const ROUTE_REVALIDATE_NEWS_SEC = 600;

/** Upstream API-Football fetch cache (seconds). */
export const API_REVALIDATE_LIVE_SEC = 300;
export const API_REVALIDATE_DEFAULT_SEC = 600;
