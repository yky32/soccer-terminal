import type { MapMatchMode } from "@/lib/data/map-match-mode";
import type { LiveCountriesSnapshot } from "@/lib/football/provider";
import { isRateLimitError } from "@/lib/football/providers/api-football/errors";

type CacheEntry = {
  snapshot: LiveCountriesSnapshot;
  cachedAt: number;
};

const CACHE_TTL_MS: Record<MapMatchMode, number> = {
  live: 60_000,
  future: 300_000,
};

const store = new Map<MapMatchMode, CacheEntry>();
const inflight = new Map<MapMatchMode, Promise<LiveCountriesSnapshot>>();

export async function getCachedMapSnapshot(
  mode: MapMatchMode,
  fetch: () => Promise<LiveCountriesSnapshot>,
): Promise<LiveCountriesSnapshot> {
  const cached = store.get(mode);
  const ttl = CACHE_TTL_MS[mode];
  const fresh = cached && Date.now() - cached.cachedAt < ttl;

  if (fresh) {
    return cached.snapshot;
  }

  const pending = inflight.get(mode);
  if (pending) {
    return pending;
  }

  const promise = fetch()
    .then((snapshot) => {
      store.set(mode, { snapshot, cachedAt: Date.now() });
      return snapshot;
    })
    .catch((error: unknown) => {
      if (cached && isRateLimitError(error)) {
        return cached.snapshot;
      }
      throw error;
    })
    .finally(() => {
      inflight.delete(mode);
    });

  inflight.set(mode, promise);
  return promise;
}
