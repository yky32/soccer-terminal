import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Apple Health / index-ticker number hierarchy for player stats. */
export const metricSize = {
  /** Market value, primary headline figures */
  display:
    "text-[clamp(2rem,4.5vw,2.75rem)] font-semibold tabular-nums leading-none tracking-[-0.045em]",
  /** Hero stat strip */
  hero: "text-[clamp(1.625rem,3vw,2rem)] font-semibold tabular-nums leading-none tracking-[-0.04em]",
  /** Sparkline average, performance summary tiles */
  headline:
    "text-[clamp(1.5rem,2.5vw,1.875rem)] font-semibold tabular-nums leading-none tracking-[-0.035em]",
  /** Spec rows, discipline counts */
  value:
    "text-[1.0625rem] font-semibold tabular-nums leading-none tracking-[-0.025em] sm:text-[1.125rem]",
  /** Match table stat cells */
  table: "text-[0.9375rem] font-medium tabular-nums leading-none tracking-[-0.015em]",
  /** Match rating, sparkline match dots */
  emphasis:
    "text-[1.0625rem] font-semibold tabular-nums leading-none tracking-[-0.03em] sm:text-[1.125rem]",
  /** Sparkline per-match labels */
  tick: "text-[0.9375rem] font-semibold tabular-nums leading-none tracking-[-0.02em]",
} as const;

export const metricLabel = {
  hero: "text-[0.6875rem] font-medium leading-none text-neutral-500",
  section: "text-[0.75rem] font-medium leading-none text-neutral-500",
  row: "text-[0.8125rem] leading-snug text-neutral-500",
  tick: "text-[0.6875rem] font-medium leading-none text-neutral-400",
} as const;

export const metricUnit =
  "text-[0.8125rem] font-medium tabular-nums leading-none text-neutral-400";

type StatValueProps = {
  children: ReactNode;
  unit?: string;
  size?: keyof typeof metricSize;
  className?: string;
};

export function StatValue({ children, unit, size = "value", className }: StatValueProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-baseline gap-0.5", className)}>
      <span className={metricSize[size]}>{children}</span>
      {unit ? <span className={metricUnit}>{unit}</span> : null}
    </span>
  );
}
