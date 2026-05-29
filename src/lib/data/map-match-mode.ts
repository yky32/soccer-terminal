export type MapMatchMode = "live" | "future";

export const MAP_MATCH_MODES: MapMatchMode[] = ["live", "future"];

export function isMapMatchMode(value: string | null | undefined): value is MapMatchMode {
  return value === "live" || value === "future";
}
