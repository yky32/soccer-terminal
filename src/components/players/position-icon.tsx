import type { TeamPosition } from "@/lib/data/team-profile";
import { cn } from "@/lib/utils";

export type PositionKind = "goalkeeper" | "defender" | "midfielder" | "forward";

export function resolvePositionKind(
  primary: TeamPosition,
  role: string,
): PositionKind | null {
  if (primary === "GK" || role === "Goalkeeper") return "goalkeeper";

  if (
    primary === "DEF" ||
    role.includes("Back") ||
    role === "Defender"
  ) {
    return "defender";
  }

  if (
    primary === "MID" ||
    role.includes("Midfield") ||
    role === "Midfielder"
  ) {
    return "midfielder";
  }

  if (
    primary === "FWD" ||
    role.includes("Forward") ||
    role.includes("Winger") ||
    role.includes("Striker")
  ) {
    return "forward";
  }

  return null;
}

type PositionIconProps = {
  primary: TeamPosition;
  role: string;
  className?: string;
};

export function PositionIcon({ primary, role, className }: PositionIconProps) {
  const kind = resolvePositionKind(primary, role);

  if (kind === "goalkeeper") return <GoalkeeperIcon className={className} />;
  if (kind === "defender") return <DefenderIcon className={className} />;
  if (kind === "midfielder") return <MidfielderIcon className={className} />;
  if (kind === "forward") return <ForwardIcon className={className} />;
  return null;
}

function iconClass(className?: string) {
  return cn("h-3.5 w-3.5 shrink-0 text-neutral-500", className);
}

/** Goal frame — goalkeeper */
function GoalkeeperIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={iconClass(className)} aria-hidden>
      <rect
        x="3.5"
        y="4"
        width="9"
        height="7"
        rx="0.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M3.5 7.5h9"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="8" cy="9.25" r="1" fill="currentColor" />
    </svg>
  );
}

/** Penalty box — defender */
function DefenderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={iconClass(className)} aria-hidden>
      <rect
        x="4"
        y="7.5"
        width="8"
        height="5"
        rx="0.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M2.5 12.5h11"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="6" cy="12.5" r="0.75" fill="currentColor" />
      <circle cx="10" cy="12.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

/** Center circle — midfielder */
function MidfielderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={iconClass(className)} aria-hidden>
      <circle
        cx="8"
        cy="8"
        r="3.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M2.5 8h11"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="8" cy="8" r="0.75" fill="currentColor" />
    </svg>
  );
}

/** Arrow toward goal — forward */
function ForwardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={iconClass(className)} aria-hidden>
      <path
        d="M8 13V3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M5.5 5.5 8 3l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M4.5 2.5h7"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}