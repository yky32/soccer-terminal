import { cn } from "@/lib/utils";

export type LineupPositionKind = "goalkeeper" | "defender" | "midfielder" | "forward";

export const LINEUP_POSITION_ORDER: LineupPositionKind[] = [
  "goalkeeper",
  "defender",
  "midfielder",
  "forward",
];

const POSITION_SAMPLE: Record<LineupPositionKind, string> = {
  goalkeeper: "G",
  defender: "D",
  midfielder: "M",
  forward: "F",
};

export function groupByLineupPosition<
  T extends { position: string | null; number?: string | null; name?: string },
>(players: T[]): Array<{ kind: LineupPositionKind; players: T[] }> {
  const buckets = new Map<LineupPositionKind, T[]>(
    LINEUP_POSITION_ORDER.map((kind) => [kind, []]),
  );

  for (const player of players) {
    const kind = resolveLineupPositionKind(player.position);
    buckets.get(kind)!.push(player);
  }

  for (const list of buckets.values()) {
    list.sort((left, right) => {
      const leftNum = Number(left.number);
      const rightNum = Number(right.number);
      if (Number.isFinite(leftNum) && Number.isFinite(rightNum)) {
        return leftNum - rightNum;
      }
      return (left.name ?? "").localeCompare(right.name ?? "");
    });
  }

  return LINEUP_POSITION_ORDER.map((kind) => ({
    kind,
    players: buckets.get(kind)!,
  })).filter((group) => group.players.length > 0);
}

export function lineupPositionSample(kind: LineupPositionKind) {
  return POSITION_SAMPLE[kind];
}

export function resolveLineupPositionKind(
  position: string | null | undefined,
): LineupPositionKind {
  const key = (position ?? "").trim().charAt(0).toUpperCase();
  if (key === "G") return "goalkeeper";
  if (key === "D") return "defender";
  if (key === "M") return "midfielder";
  if (key === "F") return "forward";
  return "midfielder";
}

export function lineupPositionLabel(position: string | null | undefined) {
  const key = (position ?? "").trim().charAt(0).toUpperCase();
  if (key === "G") return "GK";
  if (key === "D") return "D";
  if (key === "M") return "M";
  if (key === "F") return "F";
  return position?.trim().slice(0, 3).toUpperCase() || "—";
}

export const LINEUP_POSITION_STYLE: Record<
  LineupPositionKind,
  {
    label: string;
    fullName: string;
    badge: string;
  }
> = {
  goalkeeper: {
    label: "GK",
    fullName: "Goalkeeper",
    badge: "bg-amber-100 text-amber-900 ring-amber-200/80",
  },
  defender: {
    label: "D",
    fullName: "Defender",
    badge: "bg-sky-100 text-sky-900 ring-sky-200/80",
  },
  midfielder: {
    label: "M",
    fullName: "Midfielder",
    badge: "bg-emerald-100 text-emerald-900 ring-emerald-200/80",
  },
  forward: {
    label: "F",
    fullName: "Forward",
    badge: "bg-rose-100 text-rose-900 ring-rose-200/80",
  },
};

export function lineupPositionFullName(kind: LineupPositionKind) {
  return LINEUP_POSITION_STYLE[kind].fullName;
}

export function LineupPositionRowHeader({
  kind,
  className,
}: {
  kind: LineupPositionKind;
  className?: string;
}) {
  const style = LINEUP_POSITION_STYLE[kind];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded px-1 text-[0.625rem] font-bold uppercase tracking-[0.04em] ring-1",
          style.badge,
        )}
      >
        {style.label}
      </span>
      <span className="text-[0.6875rem] font-medium text-neutral-600">{style.fullName}</span>
    </div>
  );
}

export function LineupPositionBadge({
  position,
  className,
}: {
  position: string | null | undefined;
  className?: string;
}) {
  const kind = resolveLineupPositionKind(position);
  const style = LINEUP_POSITION_STYLE[kind];

  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded px-1 text-[0.625rem] font-bold uppercase tracking-[0.04em] ring-1",
        style.badge,
        className,
      )}
    >
      {lineupPositionLabel(position)}
    </span>
  );
}

export function LineupPositionLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5", className)}
      aria-label="Position colors"
    >
      {LINEUP_POSITION_ORDER.map((kind) => (
        <LineupPositionRowHeader key={kind} kind={kind} />
      ))}
    </div>
  );
}
