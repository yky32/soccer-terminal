/**
 * Football data refresh policy — API-Football PRO (7,500 req/day).
 *
 * Tier guide (production):
 * - Live scores: 30–60s upstream + client poll hits cached /api routes only
 * - Standings & fixtures: 5–15 min
 * - Player / squad / team metadata: 24h
 *
 * Monitor usage: https://dashboard.api-football.com/
 */

/** Client poll for /api/map/live-countries (never calls API-Football directly). */
export const CLIENT_MAP_REFRESH_MS = 60_000;

/** Server in-memory map snapshot TTL. */
export const SNAPSHOT_TTL_LIVE_MS = 60_000;
export const SNAPSHOT_TTL_FUTURE_MS = 15 * 60_000;

/** Next.js route segment revalidate (seconds). */
export const ROUTE_REVALIDATE_MAP_SEC = 60;
export const ROUTE_REVALIDATE_LEAGUE_SEC = 600;
export const ROUTE_REVALIDATE_NEWS_SEC = 900;

/** Upstream API-Football fetch cache (seconds). */
export const API_REVALIDATE_LIVE_SEC = 60;
export const API_REVALIDATE_STANDINGS_SEC = 600;
export const API_REVALIDATE_FIXTURES_SEC = 600;
export const API_REVALIDATE_PLAYER_SEC = 60 * 60 * 24;

/** Default for league catalog, knockout, news-adjacent fetches. */
export const API_REVALIDATE_DEFAULT_SEC = API_REVALIDATE_STANDINGS_SEC;

/** Finished fixtures — immutable after full time. */
export const API_REVALIDATE_MATCH_FINISHED_SEC = 60 * 60 * 24 * 7;
/** Not started / postponed — lineups and kickoff may still change. */
export const API_REVALIDATE_MATCH_UPCOMING_SEC = 900;

/** Server in-memory match detail cache for live / upcoming. */
export const MATCH_DETAIL_VOLATILE_CACHE_MS = 60_000;
export const MATCH_DETAIL_UPCOMING_CACHE_MS = 15 * 60_000;

/** Client localStorage TTL for league profiles on /leagues. */
export const LEAGUE_LOCAL_TTL_MS = 15 * 60_000;

/** Client localStorage TTL for map + match monitor snapshot. */
export const MAP_LOCAL_TTL_MS = CLIENT_MAP_REFRESH_MS;

/** Server in-memory league profile cache. */
export const LEAGUE_SERVER_CACHE_MS = ROUTE_REVALIDATE_LEAGUE_SEC * 1000;

/** Catalog fixture fetches — sequential to avoid burst rate limits. */
export const CATALOG_FETCH_CONCURRENCY = 1;
