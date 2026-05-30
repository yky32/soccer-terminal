"use client";

import type { PlayerMatchPerformance } from "@/lib/data/player-profile";
import { metricLabel, metricSize, StatValue } from "@/components/players/player-metric";
import { cn } from "@/lib/utils";

type StatTileProps = {
  label: string;
  value: string;
  unit?: string;
  className?: string;
};

export function StatTile({ label, value, unit, className }: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-black/[0.05] bg-white/25 px-4 py-3.5",
        className,
      )}
    >
      <p className={metricLabel.section}>{label}</p>
      <div className="mt-2">
        <StatValue size="headline" unit={unit}>
          {value}
        </StatValue>
      </div>
    </div>
  );
}

type RatingBarChartProps = {
  ratings: number[];
  className?: string;
};

/** Last-N match ratings — Apple Health bar style with 7.0 reference. */
export function RatingBarChart({ ratings, className }: RatingBarChartProps) {
  const floor = 6;
  const ceiling = Math.max(8, ...ratings) + 0.25;
  const span = ceiling - floor || 1;
  const avg = ratings.reduce((sum, value) => sum + value, 0) / Math.max(ratings.length, 1);
  const refY = 100 - ((7 - floor) / span) * 100;

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className={metricLabel.section}>Avg rating</p>
          <p className={cn("mt-1.5", metricSize.headline)}>{avg.toFixed(1)}</p>
        </div>
        <p className={cn(metricLabel.tick, "tabular-nums")}>Ref 7.0</p>
      </div>

      <div className="relative h-40">
        <div
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-neutral-300/80"
          style={{ top: `${refY}%` }}
          aria-hidden
        />
        <div className="flex h-full items-end gap-2 sm:gap-3">
          {ratings.map((rating, index) => {
            const height = Math.max(8, ((rating - floor) / span) * 100);
            const isLatest = index === ratings.length - 1;

            return (
              <div key={`bar-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className={metricSize.tick}>{rating.toFixed(1)}</span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-colors",
                      isLatest ? "bg-neutral-900" : "bg-neutral-900/15",
                    )}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className={metricLabel.tick}>M{index + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type MatchContributionChartProps = {
  matches: PlayerMatchPerformance[];
  className?: string;
};

/** Goals + assists per match — grouped bars. */
export function MatchContributionChart({ matches, className }: MatchContributionChartProps) {
  const maxValue = Math.max(1, ...matches.flatMap((match) => [match.goals, match.assists]));

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className={metricLabel.section}>Goals & assists</p>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[0.6875rem] text-neutral-500">
            <span className="h-2 w-2 rounded-sm bg-neutral-900" aria-hidden />
            Goals
          </span>
          <span className="inline-flex items-center gap-1.5 text-[0.6875rem] text-neutral-500">
            <span className="h-2 w-2 rounded-sm bg-neutral-900/25" aria-hidden />
            Assists
          </span>
        </div>
      </div>

      <div className="flex h-32 items-end gap-2 sm:gap-3">
        {matches.map((match, index) => {
          const goalH = (match.goals / maxValue) * 100;
          const assistH = (match.assists / maxValue) * 100;

          return (
            <div key={match.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end justify-center gap-0.5 sm:gap-1">
                <div
                  className="w-[42%] max-w-[1.25rem] rounded-t-sm bg-neutral-900"
                  style={{ height: `${Math.max(match.goals > 0 ? 10 : 4, goalH)}%` }}
                />
                <div
                  className="w-[42%] max-w-[1.25rem] rounded-t-sm bg-neutral-900/20"
                  style={{ height: `${Math.max(match.assists > 0 ? 10 : 4, assistH)}%` }}
                />
              </div>
              <span className={metricLabel.tick}>M{index + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type PassAccuracyGaugeProps = {
  value: number;
  className?: string;
};

/** Semi-circle gauge for pass accuracy. */
export function PassAccuracyGauge({ value, className }: PassAccuracyGaugeProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = 52;
  const circumference = Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn("flex items-center gap-5", className)}>
      <div className="relative h-[4.5rem] w-[5.5rem] shrink-0">
        <svg viewBox="0 0 120 70" className="h-full w-full" aria-hidden>
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-neutral-900/[0.06]"
            strokeLinecap="round"
          />
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-neutral-900"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <StatValue unit="%">{String(clamped)}</StatValue>
        </div>
      </div>
      <div>
        <p className={metricLabel.section}>Pass accuracy</p>
        <p className="mt-1 text-[0.8125rem] leading-snug text-neutral-500">
          Season completion rate across all appearances.
        </p>
      </div>
    </div>
  );
}

type StatBarChartProps = {
  items: { label: string; value: number; max: number; unit?: string; display?: string }[];
  className?: string;
};

/** Horizontal stat bars — season output comparison. */
export function StatBarChart({ items, className }: StatBarChartProps) {
  return (
    <div className={cn("space-y-3.5", className)}>
      {items.map((item) => {
        const percent = item.max > 0 ? Math.min(100, (item.value / item.max) * 100) : 0;

        return (
          <div key={item.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className={metricLabel.row}>{item.label}</span>
              <StatValue unit={item.unit}>{item.display ?? String(item.value)}</StatValue>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-900/[0.06]">
              <div
                className="h-full rounded-full bg-neutral-900/75"
                style={{ width: `${Math.max(percent > 0 ? 4 : 0, percent)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

type MinutesChartProps = {
  matches: PlayerMatchPerformance[];
  className?: string;
};

export function MinutesChart({ matches, className }: MinutesChartProps) {
  const maxMinutes = Math.max(1, ...matches.map((match) => match.minutes));

  return (
    <div className={cn("space-y-4", className)}>
      <p className={metricLabel.section}>Minutes played</p>
      <div className="flex h-24 items-end gap-2 sm:gap-3">
        {matches.map((match, index) => {
          const height = (match.minutes / maxMinutes) * 100;

          return (
            <div key={match.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className={cn(metricSize.tick, "text-neutral-600")}>{match.minutes}</span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-neutral-900/20"
                  style={{ height: `${Math.max(12, height)}%` }}
                />
              </div>
              <span className={metricLabel.tick}>M{index + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
