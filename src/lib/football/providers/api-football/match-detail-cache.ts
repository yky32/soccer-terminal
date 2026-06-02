import type { MatchDetail } from "@/lib/data/match-detail";
import { coerceMatchDetail } from "@/lib/football/match-detail-coerce";
import {
  API_REVALIDATE_MATCH_FINISHED_SEC,
  MATCH_DETAIL_UPCOMING_CACHE_MS,
  MATCH_DETAIL_VOLATILE_CACHE_MS,
} from "@/lib/football/refresh-policy";
import { isMatchDetailImmutable, isMatchLiveStatus } from "@/lib/football/match-status";
import { isRateLimitError } from "@/lib/football/providers/api-football/errors";

import { unstable_cache } from "next/cache";

type VolatileEntry = {
  detail: MatchDetail;
  cachedAt: number;
};

/** Finished fixtures — no TTL; safe because result data is final. */
const finishedStore = new Map<number, MatchDetail>();
const volatileStore = new Map<number, VolatileEntry>();
const inflight = new Map<number, Promise<MatchDetail | null>>();

function volatileTtlMs(statusShort: string) {
  if (isMatchLiveStatus(statusShort)) return MATCH_DETAIL_VOLATILE_CACHE_MS;
  return MATCH_DETAIL_UPCOMING_CACHE_MS;
}

function dropStaleTimelineCache(fixtureId: number, detail: MatchDetail) {
  if (Array.isArray(detail.timeline)) {
    finishedStore.delete(fixtureId);
    volatileStore.delete(fixtureId);
    return true;
  }
  return false;
}

export function getCachedMatchDetail(fixtureId: number): MatchDetail | null {
  const finished = finishedStore.get(fixtureId);
  if (finished) {
    if (dropStaleTimelineCache(fixtureId, finished)) return null;
    return coerceMatchDetail(finished);
  }

  const volatile = volatileStore.get(fixtureId);
  if (!volatile) return null;

  if (dropStaleTimelineCache(fixtureId, volatile.detail)) return null;

  const ttl = volatileTtlMs(volatile.detail.match.statusShort);
  if (Date.now() - volatile.cachedAt >= ttl) {
    volatileStore.delete(fixtureId);
    return null;
  }

  return coerceMatchDetail(volatile.detail);
}

export function setCachedMatchDetail(detail: MatchDetail) {
  const normalized = coerceMatchDetail(detail);
  if (!normalized) return;

  const id = normalized.match.id;
  if (isMatchDetailImmutable(normalized.match.statusShort)) {
    finishedStore.set(id, normalized);
    volatileStore.delete(id);
    return;
  }
  volatileStore.set(id, { detail: normalized, cachedAt: Date.now() });
}

function cacheFinishedAcrossRequests(fixtureId: number, detail: MatchDetail) {
  return unstable_cache(
    async () => detail,
    ["match-detail-v5", String(fixtureId)],
    { revalidate: API_REVALIDATE_MATCH_FINISHED_SEC },
  )();
}

export async function getMatchDetailCached(
  fixtureId: number,
  fetch: () => Promise<MatchDetail | null>,
): Promise<MatchDetail | null> {
  const memoryHit = getCachedMatchDetail(fixtureId);
  if (memoryHit) {
    if (isMatchDetailImmutable(memoryHit.match.statusShort)) {
      return cacheFinishedAcrossRequests(fixtureId, memoryHit);
    }
    return memoryHit;
  }

  const pending = inflight.get(fixtureId);
  if (pending) return pending;

  const staleFinished = finishedStore.get(fixtureId);

  const promise = fetch()
    .then(async (detail) => {
      const normalized = coerceMatchDetail(detail);
      if (!normalized) return null;

      setCachedMatchDetail(normalized);

      if (isMatchDetailImmutable(normalized.match.statusShort)) {
        return coerceMatchDetail(await cacheFinishedAcrossRequests(fixtureId, normalized));
      }

      return normalized;
    })
    .catch((error: unknown) => {
      if (staleFinished && isRateLimitError(error)) return staleFinished;
      throw error;
    })
    .finally(() => {
      inflight.delete(fixtureId);
    });

  inflight.set(fixtureId, promise);
  return promise;
}
