import type { LeagueStandingRow } from "@/lib/data/league-profile";

/** API-Football meta tables that repeat teams already listed in their groups (e.g. WC third-place ranking). */
const SUPPLEMENTAL_STANDINGS_GROUP = /third[- ]placed|ranking of/i;

export function isSupplementalStandingsGroup(group?: string | null) {
  return group != null && SUPPLEMENTAL_STANDINGS_GROUP.test(group);
}

export function standingRowKey(row: LeagueStandingRow) {
  return row.teamId != null ? `id:${row.teamId}` : `name:${row.team}`;
}

/** One row per club — prefers real group tables over supplemental ranking tables. */
export function uniqueStandingRowsByTeam(standings: LeagueStandingRow[]): LeagueStandingRow[] {
  const byTeam = new Map<string, LeagueStandingRow>();

  for (const row of standings) {
    const key = standingRowKey(row);
    const existing = byTeam.get(key);
    if (!existing) {
      byTeam.set(key, row);
      continue;
    }

    const existingSupplemental = isSupplementalStandingsGroup(existing.group);
    const rowSupplemental = isSupplementalStandingsGroup(row.group);

    if (existingSupplemental && !rowSupplemental) {
      byTeam.set(key, row);
      continue;
    }
    if (!existingSupplemental && rowSupplemental) {
      continue;
    }
    if (row.played > existing.played) {
      byTeam.set(key, row);
    }
  }

  return [...byTeam.values()];
}
