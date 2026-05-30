"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { metricLabel, metricSize, metricUnit, StatValue } from "@/components/players/player-metric";
import { cn } from "@/lib/utils";

type SpecRowProps = {
  label: string;
  value?: string;
  unit?: string;
  valueNode?: ReactNode;
  bar?: number;
  className?: string;
};

export function SpecRow({ label, value, unit, valueNode, bar, className }: SpecRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-black/[0.04] py-3.5 last:border-b-0",
        className,
      )}
    >
      <span className={metricLabel.row}>{label}</span>
      <div className="flex min-w-0 items-center gap-3">
        {bar !== undefined ? (
          <div
            className="hidden h-1 w-20 overflow-hidden rounded-full bg-neutral-900/[0.06] sm:block"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-neutral-900/70"
              style={{ width: `${Math.min(100, Math.max(0, bar))}%` }}
            />
          </div>
        ) : null}
        {valueNode ?? (value !== undefined ? <StatValue unit={unit}>{value}</StatValue> : null)}
      </div>
    </div>
  );
}

type SpecBlockProps = {
  title: string;
  meta?: ReactNode;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
};

export function SpecBlock({ title, meta, icon: Icon, children, className }: SpecBlockProps) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-neutral-950">
          {Icon ? <Icon className="h-3.5 w-3.5 stroke-[1.75] text-neutral-400" aria-hidden /> : null}
          {title}
        </h3>
        {meta ? <span className="text-[0.8125rem] text-neutral-400">{meta}</span> : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

type MatchRowProps = {
  matchday: string;
  date: string;
  opponent: string;
  opponentLogo: string | null;
  isHome: boolean;
  goals: number;
  assists: number;
  minutes: number;
  rating: number;
};

export function MatchRow({
  matchday,
  date,
  opponent,
  opponentLogo,
  isHome,
  goals,
  assists,
  minutes,
  rating,
}: MatchRowProps) {
  return (
    <tr className="border-b border-black/[0.04] last:border-b-0">
      <td className={cn("py-3.5 pr-3", metricLabel.row, "tabular-nums text-neutral-400")}>
        {matchday}
      </td>
      <td className="py-3.5 pr-3">
        <div className="flex min-w-0 items-center gap-2">
          <FootballLogoInline src={opponentLogo} label={opponent} />
          <span className="truncate text-[0.875rem] font-medium text-neutral-950">
            {isHome ? "vs" : "@"} {opponent}
          </span>
        </div>
      </td>
      <td className={cn("hidden py-3.5 pr-3 sm:table-cell", metricLabel.row, "tabular-nums")}>
        {new Date(date).toLocaleDateString([], { month: "short", day: "numeric" })}
      </td>
      <td className={cn("py-3.5 pr-3 text-center", metricSize.table)}>{goals}</td>
      <td className={cn("py-3.5 pr-3 text-center", metricSize.table)}>{assists}</td>
      <td className={cn("hidden py-3.5 pr-3 text-center md:table-cell", metricSize.table)}>
        {minutes}
        <span className={metricUnit}>&apos;</span>
      </td>
      <td className={cn("py-3.5 text-right", metricSize.emphasis)}>{rating.toFixed(1)}</td>
    </tr>
  );
}

function FootballLogoInline({ src, label }: { src: string | null; label: string }) {
  if (!src) {
    return (
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-neutral-100 text-[8px] font-bold text-neutral-500">
        {label.charAt(0)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="h-4 w-4 shrink-0 rounded object-contain" />
  );
}
