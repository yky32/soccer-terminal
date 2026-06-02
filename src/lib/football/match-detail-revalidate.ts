import {
  isMatchFinishedStatus,
  isMatchLiveStatus,
} from "@/lib/football/match-status";
import {
  API_REVALIDATE_LIVE_SEC,
  API_REVALIDATE_MATCH_FINISHED_SEC,
  API_REVALIDATE_MATCH_UPCOMING_SEC,
} from "@/lib/football/refresh-policy";

export function matchDetailRevalidateSec(statusShort: string) {
  if (isMatchFinishedStatus(statusShort)) return API_REVALIDATE_MATCH_FINISHED_SEC;
  if (isMatchLiveStatus(statusShort)) return API_REVALIDATE_LIVE_SEC;
  return API_REVALIDATE_MATCH_UPCOMING_SEC;
}
