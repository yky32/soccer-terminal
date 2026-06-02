/** Shared pitch geometry — matches `FootballPitchSurface` SVG (viewBox 0 0 100 140). */
export const FOOTBALL_PITCH_VIEWBOX = {
  width: 100,
  height: 140,
  pitch: { x: 10, y: 8, w: 80, h: 124 },
  /** Keep pins off the touchlines; lower = more horizontal spread for 11 players. */
  inset: { x: 0.05, y: 0.06 },
} as const;

export type PitchGridBounds = {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
};

function normalizeT(value: number, min: number, max: number) {
  const span = Math.max(max - min, 1);
  return (value - min) / span;
}

/**
 * Map API-Football grid (row:col) to overlay % coordinates.
 *
 * Tactical view (own half, looking upfield):
 *   LW  ST  RW
 *   LMF AMF RMF
 *      CMF
 *   LWB  DMF  RWB
 *   LB  CB  CB  RB
 *        GK
 *
 * Row 1 = GK line (API); higher rows = attack. Columns = left → right (LW … RW).
 */
export function gridToPitchOverlayPercent(
  rowDepthT: number,
  col: number,
  colBounds: Pick<PitchGridBounds, "minCol" | "maxCol">,
  options?: {
    centerColumn?: boolean;
    /** 0–0.5: keep space off each touchline (e.g. 4-def / 3-mid row). */
    sideMargin?: number;
  },
): { x: number; y: number } {
  const { pitch, width, height, inset } = FOOTBALL_PITCH_VIEWBOX;

  const depthT = Math.max(0, Math.min(1, rowDepthT));
  let colT = options?.centerColumn
    ? 0.5
    : normalizeT(col, colBounds.minCol, colBounds.maxCol);

  const sideMargin = options?.sideMargin ?? 0;
  if (!options?.centerColumn && sideMargin > 0) {
    colT = sideMargin + colT * (1 - 2 * sideMargin);
  }

  const innerW = pitch.w * (1 - 2 * inset.x);
  const innerH = pitch.h * (1 - 2 * inset.y);

  const xView = pitch.x + inset.x * pitch.w + colT * innerW;
  const yView = pitch.y + inset.y * pitch.h + (1 - depthT) * innerH;

  return {
    x: (xView / width) * 100,
    y: (yView / height) * 100,
  };
}
