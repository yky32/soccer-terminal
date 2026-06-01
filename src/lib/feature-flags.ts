function envFlag(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return defaultValue;
}

/**
 * Feature flags.
 *
 * Client bundles may read ONLY `NEXT_PUBLIC_*` env vars.
 *
 * News is off by default — nav, league/team tabs, `/news`, and `/api/news` stay hidden
 * until `NEXT_PUBLIC_ENABLE_NEWS=true`.
 */
export const ENABLE_NEWS = envFlag(process.env.NEXT_PUBLIC_ENABLE_NEWS, false);

export const ENABLE_AI = envFlag(process.env.NEXT_PUBLIC_ENABLE_AI, false);

