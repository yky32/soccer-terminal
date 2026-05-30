import { metricSize } from "@/components/players/player-metric";
import { cn } from "@/lib/utils";

type CardKind = "yellow" | "red";

const CARD_STYLES: Record<CardKind, { fill: string; stroke: string }> = {
  yellow: { fill: "#FACC15", stroke: "#CA8A04" },
  red: { fill: "#EF4444", stroke: "#DC2626" },
};

function CardIcon({ kind, className }: { kind: CardKind; className?: string }) {
  const { fill, stroke } = CARD_STYLES[kind];

  return (
    <svg
      viewBox="0 0 12 16"
      className={cn("h-4 w-3 shrink-0", className)}
      aria-hidden
    >
      <rect
        x="1"
        y="1"
        width="10"
        height="14"
        rx="1.5"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.75"
      />
    </svg>
  );
}

type CardCountProps = {
  kind: CardKind;
  count: number;
};

function CardCount({ kind, count }: CardCountProps) {
  const label = kind === "yellow" ? "Yellow cards" : "Red cards";

  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <CardIcon kind={kind} />
      <span className={cn(metricSize.value)}>{count}</span>
      <span className="sr-only">
        {count} {label}
      </span>
    </span>
  );
}

type DisciplineCardsProps = {
  yellowCards: number;
  redCards: number;
  className?: string;
};

export function DisciplineCards({ yellowCards, redCards, className }: DisciplineCardsProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <CardCount kind="yellow" count={yellowCards} />
      <CardCount kind="red" count={redCards} />
    </div>
  );
}
