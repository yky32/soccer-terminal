export function isCaptainFlag(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

export function playerNameKey(name: string) {
  return name.trim().toLowerCase();
}

export type CaptainIndexes = {
  byId: Map<number, boolean>;
  byName: Map<string, boolean>;
};

export function buildCaptainIndexes(
  players: Array<{ id?: number | null; name: string; captain?: unknown }>,
): CaptainIndexes {
  const byId = new Map<number, boolean>();
  const byName = new Map<string, boolean>();

  for (const player of players) {
    if (!isCaptainFlag(player.captain)) continue;
    if (player.id != null) byId.set(player.id, true);
    byName.set(playerNameKey(player.name), true);
  }

  return { byId, byName };
}

export function mergeCaptainIndexes(...indexes: CaptainIndexes[]): CaptainIndexes {
  const byId = new Map<number, boolean>();
  const byName = new Map<string, boolean>();

  for (const index of indexes) {
    for (const [id, value] of index.byId) byId.set(id, value);
    for (const [name, value] of index.byName) byName.set(name, value);
  }

  return { byId, byName };
}

export function resolveCaptainFlag(
  player: { id?: number | null; name: string; captain?: unknown },
  indexes: CaptainIndexes,
): boolean {
  if (isCaptainFlag(player.captain)) return true;
  if (player.id != null && indexes.byId.get(player.id)) return true;
  if (indexes.byName.get(playerNameKey(player.name))) return true;
  return false;
}

export function matchDetailLacksCaptainSchema(detail: {
  lineups: {
    home: { starting: unknown[]; substitutes: unknown[] } | null;
    away: { starting: unknown[]; substitutes: unknown[] } | null;
  };
  playerPerformances: { home: unknown[]; away: unknown[] };
}) {
  const lacksField = (player: unknown) =>
    typeof player === "object" && player !== null && !("captain" in player);

  for (const side of [detail.lineups.home, detail.lineups.away]) {
    if (!side) continue;
    for (const player of [...side.starting, ...side.substitutes]) {
      if (lacksField(player)) return true;
    }
  }

  for (const player of [...detail.playerPerformances.home, ...detail.playerPerformances.away]) {
    if (lacksField(player)) return true;
  }

  return false;
}
