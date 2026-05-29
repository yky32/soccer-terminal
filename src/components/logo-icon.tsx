import {
  hexagonPoints,
  pointsToPath,
  twoHexCenters,
} from "@/lib/logo-geometry";

type LogoIconProps = {
  className?: string;
};

export function LogoIcon({ className = "h-10 w-10" }: LogoIconProps) {
  const cx = 24;
  const cy = 24;
  const ballR = 22;
  const hexR = 6;

  const hexPaths = twoHexCenters(cx, cy, hexR).map((center) =>
    pointsToPath(hexagonPoints(center.x, center.y, hexR)),
  );

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`aspect-square shrink-0 text-foreground ${className}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <circle cx={cx} cy={cy} r={ballR} fill="currentColor" />
      {hexPaths.map((d, i) => (
        <path key={i} d={d} fill="#ffffff" />
      ))}
    </svg>
  );
}
