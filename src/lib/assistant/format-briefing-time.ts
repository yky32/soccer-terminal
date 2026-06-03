import type { FormatDateTimeContext } from "@/lib/format-date-time";
import { formatDateTime } from "@/lib/format-date-time";

export function formatBriefingTime(iso: string, context?: FormatDateTimeContext) {
  return formatDateTime(iso, "kickoff-full", context);
}
