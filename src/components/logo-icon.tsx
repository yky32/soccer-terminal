import { getBrandLogoHexPaths } from "@/lib/brand-logo-mark";

type LogoIconProps = {
  className?: string;
};

export function LogoIcon({ className = "h-10 w-10" }: LogoIconProps) {
  const hexPaths = getBrandLogoHexPaths();

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`aspect-square shrink-0 text-foreground ${className}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <circle cx={24} cy={24} r={22} fill="currentColor" />
      {hexPaths.map((d, i) => (
        <path key={i} d={d} fill="#ffffff" />
      ))}
    </svg>
  );
}
