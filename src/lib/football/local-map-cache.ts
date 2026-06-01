import type { LiveCountriesBothResponse } from "@/lib/data/live-match-countries";

const STORAGE_KEY = "soccer-terminal.mapSnapshot.v1";

type StoredMapSnapshot = {
  cachedAt: number;
  value: LiveCountriesBothResponse;
};

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function readCachedMapSnapshot(): {
  snapshot: LiveCountriesBothResponse;
  cachedAt: number;
} | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  const parsed = safeParse(raw);
  if (!parsed || typeof parsed !== "object") return null;

  const entry = parsed as Partial<StoredMapSnapshot>;
  if (!entry.cachedAt || typeof entry.cachedAt !== "number") return null;
  if (!entry.value || typeof entry.value !== "object") return null;

  return { snapshot: entry.value as LiveCountriesBothResponse, cachedAt: entry.cachedAt };
}

export function writeCachedMapSnapshot(snapshot: LiveCountriesBothResponse) {
  if (typeof window === "undefined") return;

  const payload: StoredMapSnapshot = { cachedAt: Date.now(), value: snapshot };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Best-effort — ignore quota errors.
  }
}
