export function hexagonPoints(
  cx: number,
  cy: number,
  radius: number,
  rotationDeg = -30,
) {
  return Array.from({ length: 6 }, (_, i) => {
    const rad = ((rotationDeg + i * 60) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  });
}

export function pointsToPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return `M${first.x.toFixed(2)} ${first.y.toFixed(2)}${rest.map((p) => ` L${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join("")}Z`;
}

/** Two hexes with a visible gap — honeycomb layout, not touching */
export function twoHexCenters(
  cx: number,
  cy: number,
  hexR: number,
  gap = 1.75,
) {
  const offsetX = (hexR * Math.sqrt(3)) / 2;
  const offsetY = hexR * 1.5;
  const s = 0.45 * gap;
  return [
    { x: cx - offsetX * s, y: cy - offsetY * s },
    { x: cx + offsetX * s, y: cy + offsetY * s },
  ];
}
