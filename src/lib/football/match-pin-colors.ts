export type MatchPinColor = {
  hex: string;
  ping: string;
};

export const MATCH_PIN_COLORS: MatchPinColor[] = [
  { hex: "#2563eb", ping: "rgba(37, 99, 235, 0.35)" },
  { hex: "#d97706", ping: "rgba(217, 119, 6, 0.35)" },
  { hex: "#7c3aed", ping: "rgba(124, 58, 237, 0.35)" },
  { hex: "#e11d48", ping: "rgba(225, 29, 72, 0.35)" },
  { hex: "#0891b2", ping: "rgba(8, 145, 178, 0.35)" },
  { hex: "#ca8a04", ping: "rgba(202, 138, 4, 0.35)" },
  { hex: "#059669", ping: "rgba(5, 150, 105, 0.35)" },
  { hex: "#c026d3", ping: "rgba(192, 38, 211, 0.35)" },
];

export function getMatchPinColor(index: number): MatchPinColor {
  return MATCH_PIN_COLORS[index % MATCH_PIN_COLORS.length]!;
}
