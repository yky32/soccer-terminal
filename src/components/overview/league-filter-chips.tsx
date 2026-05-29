"use client";

import { FootballLogo } from "@/components/overview/football-logo";
import type { LiveMatch } from "@/lib/data/live-match";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export type LeagueFilterOption = {
  name: string;
  count: number;
  logo: string | null;
};

type LeagueFilterToggleProps = {
  expanded: boolean;
  selectedCount: number;
  totalCount: number;
  onClick: () => void;
};

type LeagueFilterChipsProps = {
  leagues: LeagueFilterOption[];
  selectedLeagues: Set<string>;
  onToggle: (league: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
};

export function buildLeagueFilterOptions(matches: LiveMatch[]): LeagueFilterOption[] {
  const byLeague = new Map<string, LeagueFilterOption>();

  for (const match of matches) {
    const existing = byLeague.get(match.league);
    if (existing) {
      existing.count += 1;
    } else {
      byLeague.set(match.league, {
        name: match.league,
        count: 1,
        logo: match.leagueLogo,
      });
    }
  }

  return [...byLeague.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function LeagueFilterToggle({
  expanded,
  selectedCount,
  totalCount,
  onClick,
}: LeagueFilterToggleProps) {
  const allSelected = selectedCount === totalCount;
  const noneSelected = selectedCount === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls="league-filter-panel"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-semibold transition-colors",
        expanded
          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
          : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 hover:bg-white hover:text-neutral-900",
      )}
    >
      <span className="uppercase tracking-wide">Filter leagues</span>
      {!allSelected ? (
        <span
          className={cn(
            "rounded-full px-1.5 py-px text-[9px] font-bold tabular-nums",
            noneSelected ? "bg-neutral-200 text-neutral-600" : "bg-emerald-200/80 text-emerald-900",
          )}
        >
          {selectedCount}/{totalCount}
        </span>
      ) : null}
      <ChevronDown
        className={cn("h-3 w-3 shrink-0 transition-transform duration-200", expanded && "rotate-180")}
        aria-hidden
      />
    </button>
  );
}

export function LeagueFilterChips({
  leagues,
  selectedLeagues,
  onToggle,
  onSelectAll,
  onClearAll,
}: LeagueFilterChipsProps) {
  if (leagues.length === 0) return null;

  const selectedCount = leagues.filter((league) => selectedLeagues.has(league.name)).length;
  const allSelected = selectedCount === leagues.length;
  const noneSelected = selectedCount === 0;

  return (
    <div
      id="league-filter-panel"
      className="border-b border-neutral-200/80 bg-neutral-50/90 px-3 py-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-neutral-600">
          {allSelected
            ? "All leagues selected"
            : noneSelected
              ? "No leagues selected"
              : `${selectedCount} of ${leagues.length} leagues selected`}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onSelectAll}
            disabled={allSelected}
            className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900 disabled:cursor-default disabled:opacity-40"
          >
            All
          </button>
          <button
            type="button"
            onClick={onClearAll}
            disabled={noneSelected}
            className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900 disabled:cursor-default disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-2 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto overscroll-contain pr-0.5">
        {leagues.map((league) => {
          const selected = selectedLeagues.has(league.name);

          return (
            <button
              key={league.name}
              type="button"
              aria-pressed={selected}
              title={league.name}
              onClick={() => onToggle(league.name)}
              className={cn(
                "inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left transition-all",
                selected
                  ? "border-emerald-300/90 bg-emerald-50 shadow-sm ring-1 ring-emerald-200/60"
                  : "border-neutral-200/90 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50",
              )}
            >
              <FootballLogo src={league.logo} label={league.name} size="xs" />
              <span
                className={cn(
                  "min-w-0 truncate text-[11px] leading-tight",
                  selected ? "font-semibold text-emerald-900" : "font-medium text-neutral-700",
                )}
              >
                {league.name}
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                  selected ? "bg-emerald-200/70 text-emerald-900" : "bg-neutral-100 text-neutral-500",
                )}
              >
                {league.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
