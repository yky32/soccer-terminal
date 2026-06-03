import type { FormatDateTimeContext } from "@/lib/format-date-time";
import { formatDateTime, formatRelativeTime } from "@/lib/format-date-time";

/** @deprecated Prefer `useFormatDateTime()` in client components. */
export function formatNewsRelativeTime(
  isoDate: string,
  now = Date.now(),
  context?: FormatDateTimeContext,
) {
  return formatRelativeTime(isoDate, now, context);
}

/** @deprecated Prefer `useFormatDateTime()` in client components. */
export function formatNewsTimestamp(isoDate: string, context?: FormatDateTimeContext) {
  return formatDateTime(isoDate, "datetime-tooltip", context);
}
