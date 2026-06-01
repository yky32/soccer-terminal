import type { LeagueProfile } from "@/lib/data/league-profile";
import type { LeagueCatalogEntry } from "@/lib/football/league-catalog";
import { isRateLimitError } from "@/lib/football/providers/api-football/errors";

import { LEAGUE_SERVER_CACHE_MS } from "@/lib/football/refresh-policy";

const CACHE_TTL_MS = LEAGUE_SERVER_CACHE_MS;

type CacheEntry = {
  profile: LeagueProfile;
  cachedAt: number;
};

const store = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<LeagueProfile>>();

export function getCachedLeagueProfile(id: string) {
  const entry = store.get(id);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt >= CACHE_TTL_MS) return null;
  return entry.profile;
}

export async function getLeagueProfileCached(
  entry: LeagueCatalogEntry,
  fetch: () => Promise<LeagueProfile>,
): Promise<LeagueProfile> {
  const cached = getCachedLeagueProfile(entry.id);
  if (cached) return cached;

  const pending = inflight.get(entry.id);
  if (pending) return pending;

  const stale = store.get(entry.id)?.profile;

  const promise = fetch()
    .then((profile) => {
      store.set(entry.id, { profile, cachedAt: Date.now() });
      return profile;
    })
    .catch((error: unknown) => {
      if (stale && isRateLimitError(error)) return stale;
      throw error;
    })
    .finally(() => {
      inflight.delete(entry.id);
    });

  inflight.set(entry.id, promise);
  return promise;
}

export function primeLeagueCache(profiles: LeagueProfile[]) {
  const now = Date.now();
  for (const profile of profiles) {
    store.set(profile.id, { profile, cachedAt: now });
  }
}
