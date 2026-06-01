import type { LeagueProfile } from "@/lib/data/league-profile";

/** Bump when LeagueProfile shape or API sourcing changes. */
const STORAGE_PREFIX = "soccer-terminal.leagueProfile.v2.";

type StoredLeagueProfile = {
  cachedAt: number;
  value: LeagueProfile;
};

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function readCachedLeagueProfile(
  leagueId: string,
): { profile: LeagueProfile; cachedAt: number } | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${leagueId}`);
  if (!raw) return null;

  const parsed = safeParse(raw);
  if (!parsed || typeof parsed !== "object") return null;

  const entry = parsed as Partial<StoredLeagueProfile>;
  if (!entry.cachedAt || typeof entry.cachedAt !== "number") return null;
  if (!entry.value || typeof entry.value !== "object") return null;

  return { profile: entry.value as LeagueProfile, cachedAt: entry.cachedAt };
}

export function writeCachedLeagueProfile(leagueId: string, profile: LeagueProfile) {
  if (typeof window === "undefined") return;

  const payload: StoredLeagueProfile = { cachedAt: Date.now(), value: profile };

  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${leagueId}`, JSON.stringify(payload));
  } catch {
    // Ignore quota/serialization errors — caching is best-effort.
  }
}

