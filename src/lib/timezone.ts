export const TIMEZONE_COOKIE = "soccer-monitor-timezone";

/** Fallback when detection and storage are unavailable (SSR). */
export const DEFAULT_TIMEZONE = "UTC";

/** Major zones for the account menu — user's stored zone is always included. */
const CURATED_TIMEZONES = [
  "UTC",
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Brussels",
  "Europe/Zurich",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Perth",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

export type TimeZoneCode = string;

export function detectBrowserTimeZone(): string {
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidTimeZone(resolved) ? resolved : DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

export function isValidTimeZone(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function timeZoneOffsetMinutes(timeZone: string, at = Date.now()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(new Date(at));

  const raw = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = raw.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/i);
  if (!match) return 0;

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? 0);
  return sign * (hours * 60 + minutes);
}

export function formatTimeZoneLabel(timeZone: string) {
  const city = timeZone.includes("/")
    ? timeZone.split("/").pop()?.replace(/_/g, " ") ?? timeZone
    : timeZone;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(new Date());

  const offset = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  return `${city} (${offset})`;
}

export function buildTimeZoneOptions(selected?: string | null) {
  const zones = new Set<string>(CURATED_TIMEZONES);
  if (isValidTimeZone(selected)) {
    zones.add(selected);
  }

  return [...zones]
    .sort((a, b) => timeZoneOffsetMinutes(a) - timeZoneOffsetMinutes(b) || a.localeCompare(b))
    .map((code) => ({ code, label: formatTimeZoneLabel(code) }));
}

export function readTimeZoneCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === TIMEZONE_COOKIE) {
      const value = decodeURIComponent(rest.join("="));
      return isValidTimeZone(value) ? value : null;
    }
  }

  return null;
}

export function persistTimeZoneCookie(timeZone: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(timeZone)};path=/;max-age=31536000;SameSite=Lax`;
}
