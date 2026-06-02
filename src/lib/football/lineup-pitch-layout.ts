import type { MatchDetailPlayer } from "@/lib/data/match-detail";
import {
  gridToPitchOverlayPercent,
  type PitchGridBounds,
} from "@/lib/football/pitch-viewbox";

export type PitchCoords = { x: number; y: number };

export type LineupGridBounds = PitchGridBounds;

export function parseLineupGrid(
  grid: string | null | undefined,
): { row: number; col: number } | null {
  if (!grid?.trim()) return null;
  const parts = grid.trim().split(":");
  if (parts.length !== 2) return null;
  const row = Number(parts[0]);
  const col = Number(parts[1]);
  if (!Number.isFinite(row) || !Number.isFinite(col) || row < 1 || col < 1) {
    return null;
  }
  return { row, col };
}

export function computeGridBounds(
  players: Pick<MatchDetailPlayer, "grid">[],
): LineupGridBounds | null {
  const coords = players
    .map((player) => parseLineupGrid(player.grid))
    .filter((value): value is { row: number; col: number } => value !== null);

  if (coords.length === 0) return null;

  return {
    minRow: Math.min(...coords.map((c) => c.row)),
    maxRow: Math.max(...coords.map((c) => c.row)),
    minCol: Math.min(...coords.map((c) => c.col)),
    maxCol: Math.max(...coords.map((c) => c.col)),
  };
}

function playerKey(player: MatchDetailPlayer) {
  return `${player.id ?? player.name}-${player.number ?? ""}`;
}

function isGoalkeeperPosition(position: string | null) {
  const pos = (position ?? "").trim().toUpperCase();
  return pos === "G" || pos.startsWith("GK");
}

function positionBand(position: string | null): "G" | "D" | "M" | "F" {
  const pos = (position ?? "M").trim().toUpperCase();
  if (pos === "G" || pos.startsWith("GK")) return "G";
  if (pos.startsWith("D") || /\b(CB|LB|RB|WB|LWB|RWB)\b/.test(pos)) return "D";
  if (
    pos.startsWith("F") ||
    /\b(ST|CF|LW|RW|LF|RF|FW|SS|ATT|FORWARD|ATTACKER)\b/.test(pos)
  ) {
    return "F";
  }
  return "M";
}

function isSamePlayer(left: MatchDetailPlayer, right: MatchDetailPlayer) {
  if (left.id != null && right.id != null) return left.id === right.id;
  return left.name === right.name;
}

function isLoneForward(player: MatchDetailPlayer, allPlayers: MatchDetailPlayer[]) {
  const forwards = allPlayers.filter(
    (entry) => positionBand(entry.position) === "F",
  );
  return forwards.length === 1 && isSamePlayer(player, forwards[0]!);
}

function shouldCenterPlayerOnPitch(
  player: MatchDetailPlayer,
  rowPlayers: MatchDetailPlayer[],
  allPlayers: MatchDetailPlayer[],
) {
  if (isGoalkeeperPosition(player.position)) return true;
  if (positionBand(player.position) !== "F") return false;
  if (isLoneForward(player, allPlayers)) return true;
  return rowPlayers.length === 1;
}

function pitchPlacementOptions(
  player: MatchDetailPlayer,
  rowPlayers: MatchDetailPlayer[],
  allPlayers: MatchDetailPlayer[],
) {
  if (shouldCenterPlayerOnPitch(player, rowPlayers, allPlayers)) {
    return { centerColumn: true as const };
  }
  return { sideMargin: rowHorizontalMargin(rowPlayers) };
}

/** Horizontal bias: 0 = left touchline, 1 = right (LW … RW). */
function horizontalBias(position: string | null, index: number, count: number) {
  const pos = (position ?? "").trim().toUpperCase();
  if (/\bLW\b|\bLMF\b|\bLM\b|\bLB\b|\bLWB\b|\bLF\b/.test(pos)) return 0;
  if (/\bRW\b|\bRMF\b|\bRM\b|\bRB\b|\bRWB\b|\bRF\b/.test(pos)) return 1;
  if (pos.startsWith("L") && !pos.startsWith("LF")) return 0;
  if (pos.startsWith("R") && !pos.startsWith("RF")) return 1;
  if (/\bST\b|\bCF\b|\bAMF\b|\bAM\b|\bCMF\b|\bCM\b|\bDMF\b|\bCDM\b/.test(pos)) {
    return 0.5;
  }
  if (count <= 1) return 0.5;
  return index / Math.max(count - 1, 1);
}

/** Deeper midfielders sit on lower lines when formation has multiple outfield rows. */
function midfieldDepthTier(position: string | null) {
  const pos = (position ?? "").trim().toUpperCase();
  if (/\bDMF\b|\bCDM\b|\bDM\b/.test(pos) || /\bLWB\b|\bRWB\b/.test(pos)) return 0;
  if (/\bAMF\b|\bCAM\b|\bAM\b|\bOM\b/.test(pos)) return 2;
  return 1;
}

function parseFormationLines(formation: string | null | undefined) {
  if (!formation?.trim()) return [4, 3, 3];
  const lines = formation
    .split("-")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((value) => Number.isFinite(value) && value > 0);
  return lines.length > 0 ? lines : [4, 3, 3];
}

/** API grid row for the goalkeeper line (row 1 or highest row depending on feed). */
export function resolveDefensiveGridRow(
  players: MatchDetailPlayer[],
  bounds: LineupGridBounds,
): number {
  for (const player of players) {
    if (!isGoalkeeperPosition(player.position)) continue;
    const grid = parseLineupGrid(player.grid);
    if (grid) return grid.row;
  }

  return bounds.minRow;
}

/** Map each grid row to depth 0 (GK line) … 1 (attack), using actual lines not raw row numbers. */
function buildRowDepthMap(
  players: MatchDetailPlayer[],
  defensiveRow: number,
  invertRows: boolean,
): Map<number, number> {
  const rows = [
    ...new Set(
      players
        .map((player) => parseLineupGrid(player.grid)?.row)
        .filter((row): row is number => row !== undefined),
    ),
  ].sort((left, right) => left - right);

  if (rows.length === 0) return new Map();

  const defIndex = Math.max(0, rows.indexOf(defensiveRow));
  const span = Math.max(rows.length - 1 - defIndex, 1);

  return new Map(
    rows.map((row) => {
      const index = rows.indexOf(row);
      let depth = (index - defIndex) / span;
      if (invertRows) depth = 1 - depth;
      return [row, Math.max(0, Math.min(1, depth))];
    }),
  );
}

/** Some feeds put the GK on the highest row number instead of row 1. */
function shouldInvertGridRows(
  players: MatchDetailPlayer[],
  bounds: LineupGridBounds,
  defensiveRow: number,
) {
  if (bounds.minRow === bounds.maxRow) return false;
  if (defensiveRow === bounds.maxRow && defensiveRow !== bounds.minRow) return true;

  const gkRow = players
    .filter((player) => isGoalkeeperPosition(player.position))
    .map((player) => parseLineupGrid(player.grid)?.row)
    .find((row): row is number => row !== undefined);

  return gkRow === bounds.maxRow && gkRow !== bounds.minRow;
}

/** Forwards cap below the top pitch line (avatars extend above the anchor point). */
export const FORWARD_LINE_MAX_DEPTH = 0.87;

/** GK sits slightly above the bottom line so name / kit # clear the edge. */
export const GK_LINE_MIN_DEPTH = 0.05;

/** Pull whole M / D lines slightly toward GK (depth scale, GK row unchanged). */
export const MID_LINE_DEPTH_FACTOR = 0.88;
export const DEF_LINE_DEPTH_FACTOR = 0.88;

/**
 * Side inset by players in a row — wing pins stay inside the pitch.
 * 4-in-a-row (e.g. back four) needs visible L/R padding; 5 is full width max.
 */
export function spreadRowHorizontalMargin(playerCount: number): number {
  const count = Math.min(Math.max(playerCount, 1), 5);
  if (count >= 5) return 0;
  if (count === 4) return 0.13;
  if (count === 3) return 0.16;
  if (count === 2) return 0.24;
  return 0;
}

function playersInGridRow(players: MatchDetailPlayer[], row: number) {
  return players.filter((player) => parseLineupGrid(player.grid)?.row === row);
}

function rowHorizontalMargin(rowPlayers: MatchDetailPlayer[]) {
  if (isGoalkeeperRow(rowPlayers) || rowPlayers.length <= 1) return 0;
  // Every multi-player line (D/M/F) — 4-wide rows inset from touchlines
  return spreadRowHorizontalMargin(rowPlayers.length);
}

function isForwardDominantRow(rowPlayers: MatchDetailPlayer[]) {
  if (rowPlayers.length === 0) return false;
  const forwards = rowPlayers.filter(
    (player) => positionBand(player.position) === "F",
  ).length;
  return forwards >= Math.ceil(rowPlayers.length / 2);
}

function isMidfieldDominantRow(rowPlayers: MatchDetailPlayer[]) {
  if (rowPlayers.length === 0) return false;
  const midfielders = rowPlayers.filter(
    (player) => positionBand(player.position) === "M",
  ).length;
  return midfielders >= Math.ceil(rowPlayers.length / 2);
}

function isDefensiveDominantRow(rowPlayers: MatchDetailPlayer[]) {
  if (rowPlayers.length === 0) return false;
  const defenders = rowPlayers.filter(
    (player) => positionBand(player.position) === "D",
  ).length;
  return defenders >= Math.ceil(rowPlayers.length / 2);
}

function isGoalkeeperRow(rowPlayers: MatchDetailPlayer[]) {
  return rowPlayers.some((player) => isGoalkeeperPosition(player.position));
}

function adjustRowDepthT(
  depthT: number,
  rowPlayers: MatchDetailPlayer[],
  allPlayers?: MatchDetailPlayer[],
) {
  if (isGoalkeeperRow(rowPlayers)) {
    return Math.max(depthT, GK_LINE_MIN_DEPTH);
  }

  const hasLoneForward =
    allPlayers != null &&
    rowPlayers.some((player) => isLoneForward(player, allPlayers));

  if (isForwardDominantRow(rowPlayers) || hasLoneForward) {
    return Math.min(depthT, FORWARD_LINE_MAX_DEPTH);
  }
  if (isMidfieldDominantRow(rowPlayers)) {
    return depthT * MID_LINE_DEPTH_FACTOR;
  }
  if (isDefensiveDominantRow(rowPlayers)) {
    return depthT * DEF_LINE_DEPTH_FACTOR;
  }
  return depthT;
}

function rowColumnBounds(players: MatchDetailPlayer[], row: number): Pick<PitchGridBounds, "minCol" | "maxCol"> {
  const cols = players
    .map((player) => parseLineupGrid(player.grid))
    .filter((value): value is { row: number; col: number } => value !== null && value.row === row)
    .map((value) => value.col);

  if (cols.length === 0) {
    return { minCol: 1, maxCol: 1 };
  }

  return {
    minCol: Math.min(...cols),
    maxCol: Math.max(...cols),
  };
}

function fallbackPitchCoords(
  players: MatchDetailPlayer[],
  formation: string | null | undefined,
): Map<string, PitchCoords> {
  const lines = parseFormationLines(formation);
  const bands: Record<"G" | "D" | "M" | "F", MatchDetailPlayer[]> = {
    G: [],
    D: [],
    M: [],
    F: [],
  };

  for (const player of players) {
    bands[positionBand(player.position)].push(player);
  }

  const sortBySide = (group: MatchDetailPlayer[]) =>
    [...group].sort((left, right) => {
      const lb = horizontalBias(left.position, 0, 1);
      const rb = horizontalBias(right.position, 0, 1);
      return lb - rb;
    });

  const sortMids = (group: MatchDetailPlayer[]) =>
    sortBySide(group).sort(
      (left, right) =>
        midfieldDepthTier(left.position) - midfieldDepthTier(right.position),
    );

  const result = new Map<string, PitchCoords>();
  const totalLines = 1 + lines.length;

  const placeLine = (group: MatchDetailPlayer[], lineIndex: number) => {
    const depthT = adjustRowDepthT(
      lineIndex / Math.max(totalLines - 1, 1),
      group,
      players,
    );

    const colSpan = Math.max(group.length, 1);

    group.forEach((player, index) => {
      const col = colSpan <= 1 ? 3 : 1 + Math.round((index / Math.max(colSpan - 1, 1)) * 4);
      const colBounds = { minCol: 1, maxCol: Math.max(colSpan, 5) };
      result.set(
        playerKey(player),
        gridToPitchOverlayPercent(
          depthT,
          col,
          colBounds,
          pitchPlacementOptions(player, group, players),
        ),
      );
    });
  };

  const outfieldPool = [...sortMids(bands.M), ...sortBySide(bands.F)];
  let poolOffset = 0;

  placeLine(sortBySide(bands.G), 0);
  placeLine(sortBySide(bands.D), 1);

  for (let line = 1; line < lines.length; line += 1) {
    const count = lines[line] ?? 0;
    const chunk = outfieldPool.slice(poolOffset, poolOffset + count);
    poolOffset += count;
    if (chunk.length > 0) {
      placeLine(chunk, line + 1);
    }
  }

  if (poolOffset < outfieldPool.length) {
    placeLine(outfieldPool.slice(poolOffset), totalLines - 1);
  }

  return result;
}

export function layoutLineupOnPitch(
  players: MatchDetailPlayer[],
  _side: "home" | "away",
  formation?: string | null,
): Array<{ player: MatchDetailPlayer; coords: PitchCoords }> {
  const bounds = computeGridBounds(players);
  const fallback = bounds ? null : fallbackPitchCoords(players, formation);
  const defensiveRow = bounds ? resolveDefensiveGridRow(players, bounds) : 1;
  const invertRows =
    bounds != null ? shouldInvertGridRows(players, bounds, defensiveRow) : false;
  const rowDepthMap = bounds
    ? buildRowDepthMap(players, defensiveRow, invertRows)
    : new Map();

  return players.map((player) => {
    const parsed = parseLineupGrid(player.grid);
    const key = playerKey(player);

    if (parsed && bounds) {
      const colBounds = rowColumnBounds(players, parsed.row);
      const rowPlayers = playersInGridRow(players, parsed.row);
      const rowDepthT = adjustRowDepthT(
        rowDepthMap.get(parsed.row) ?? 0,
        rowPlayers,
        players,
      );

      return {
        player,
        coords: gridToPitchOverlayPercent(
          rowDepthT,
          parsed.col,
          colBounds,
          pitchPlacementOptions(player, rowPlayers, players),
        ),
      };
    }

    const coords =
      fallback?.get(key) ??
      gridToPitchOverlayPercent(0, 3, { minCol: 1, maxCol: 5 }, { centerColumn: true });

    return { player, coords };
  });
}

export function shortPlayerName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name;
  const last = parts[parts.length - 1] ?? name;
  if (last.length >= 10) return `${last.slice(0, 9)}…`;
  return last;
}
