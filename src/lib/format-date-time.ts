import type { LocaleCode } from "@/lib/user-preferences";
import { DEFAULT_LOCALE } from "@/lib/user-preferences";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";

export type FormatDateTimeContext = {
  locale?: LocaleCode;
  timeZone?: string;
};

export type DateTimeFormatPreset =
  | "kickoff-full"
  | "kickoff-short"
  | "kickoff-date"
  | "kickoff-time"
  | "datetime-tooltip"
  | "date-medium"
  | "date-short";

const PRESET_OPTIONS: Record<
  DateTimeFormatPreset,
  Intl.DateTimeFormatOptions
> = {
  "kickoff-full": {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  "kickoff-short": {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  "kickoff-date": {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
  "kickoff-time": {
    hour: "2-digit",
    minute: "2-digit",
  },
  "datetime-tooltip": {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  "date-medium": {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
  "date-short": {
    month: "short",
    day: "numeric",
  },
};

function resolveContext(context?: FormatDateTimeContext) {
  return {
    locale: context?.locale ?? DEFAULT_LOCALE,
    timeZone: context?.timeZone ?? DEFAULT_TIMEZONE,
  };
}

export function formatDateTime(
  value: string | Date | null | undefined,
  preset: DateTimeFormatPreset,
  context?: FormatDateTimeContext,
): string {
  if (!value) return "TBD";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";

  const { locale, timeZone } = resolveContext(context);

  return date.toLocaleString(locale, {
    ...PRESET_OPTIONS[preset],
    timeZone,
  });
}

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

export function formatRelativeTime(
  isoDate: string,
  now = Date.now(),
  context?: FormatDateTimeContext,
) {
  const published = new Date(isoDate).getTime();
  const diff = now - published;

  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes}m ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours}h ago`;
  }
  if (diff < DAY * 7) {
    const days = Math.floor(diff / DAY);
    return `${days}d ago`;
  }

  return formatDateTime(isoDate, "date-medium", context);
}

export function createDateTimeFormatters(context: FormatDateTimeContext) {
  const format = (value: string | Date | null | undefined, preset: DateTimeFormatPreset) =>
    formatDateTime(value, preset, context);

  return {
    format,
    formatKickoffFull: (value: string | Date | null | undefined) =>
      format(value, "kickoff-full"),
    formatKickoffShort: (value: string | Date | null | undefined) =>
      format(value, "kickoff-short"),
    formatKickoffDate: (value: string | Date | null | undefined) =>
      format(value, "kickoff-date"),
    formatKickoffTime: (value: string | Date | null | undefined) =>
      format(value, "kickoff-time"),
    formatDateTimeTooltip: (value: string | Date | null | undefined) =>
      format(value, "datetime-tooltip"),
    formatDateMedium: (value: string | Date | null | undefined) =>
      format(value, "date-medium"),
    formatDateShort: (value: string | Date | null | undefined) =>
      format(value, "date-short"),
    formatRelativeTime: (isoDate: string, now?: number) =>
      formatRelativeTime(isoDate, now, context),
  };
}

export type DateTimeFormatters = ReturnType<typeof createDateTimeFormatters>;
