/** Terminal statuses — scores, lineups, and events do not change after this. */
export const FINISHED_MATCH_STATUSES = new Set([
  "FT",
  "AET",
  "PEN",
  "AWD",
  "WO",
  "CANC",
  "ABD",
]);

const LIVE_MATCH_STATUSES = new Set(["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"]);

export function isMatchFinishedStatus(statusShort: string) {
  return FINISHED_MATCH_STATUSES.has(statusShort);
}

export function isMatchLiveStatus(statusShort: string) {
  return LIVE_MATCH_STATUSES.has(statusShort);
}

export function isMatchDetailImmutable(statusShort: string) {
  return isMatchFinishedStatus(statusShort);
}
