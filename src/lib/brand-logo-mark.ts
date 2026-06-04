import {
  hexagonPoints,
  pointsToPath,
  twoHexCenters,
} from "@/lib/logo-geometry";

const VIEWBOX = 48;
const CX = 24;
const CY = 24;
const BALL_R = 22;
const HEX_R = 6;

/** Hex panel paths — shared by nav LogoIcon, favicons, and OG mark. */
export function getBrandLogoHexPaths() {
  return twoHexCenters(CX, CY, HEX_R).map((center) =>
    pointsToPath(hexagonPoints(center.x, center.y, HEX_R)),
  );
}

type BrandLogoMarkSvgOptions = {
  /** Nav uses currentColor; favicons use fixed #000 for contrast on tabs. */
  ballFill?: string;
};

export function brandLogoMarkSvg({ ballFill = "#000000" }: BrandLogoMarkSvgOptions = {}) {
  const hexPaths = getBrandLogoHexPaths()
    .map((d) => `<path d="${d}" fill="#ffffff"/>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" fill="none"><circle cx="${CX}" cy="${CY}" r="${BALL_R}" fill="${ballFill}"/>${hexPaths}</svg>`;
}

export function brandLogoMarkDataUrl(options?: BrandLogoMarkSvgOptions) {
  return `data:image/svg+xml,${encodeURIComponent(brandLogoMarkSvg(options))}`;
}
