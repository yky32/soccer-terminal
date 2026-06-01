"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, LayoutGrid, List, Search } from "lucide-react";
import { FootballLogo } from "@/components/overview/football-logo";
import {
  leaguesGlass,
  leaguesGlassFocus,
  leaguesGlassHover,
} from "@/components/leagues/leagues-glass";
import type { LeagueFormResult, LeagueProfile, LeagueStandingRow } from "@/lib/data/league-profile";
import { teamHrefFromName } from "@/lib/team-paths";
import { cn } from "@/lib/utils";

type LeagueTeamsPanelProps = {
  league: LeagueProfile;
};

type TeamsViewMode = "chips" | "list";

export function LeagueTeamsPanel({ league }: LeagueTeamsPanelProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<TeamsViewMode>("chips");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return league.standings;
    return league.standings.filter((row) => row.team.toLowerCase().includes(q));
  }, [league.standings, query]);

  const groups = useMemo(() => groupStandings(filtered), [filtered]);
  const hasGroups = groups.some((group) => group.label);

  return (
    <section className={cn(leaguesGlass, "overflow-hidden")}>
      <header className="space-y-3 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[clamp(1.125rem,2.2vw,1.375rem)] font-semibold tracking-[-0.03em] text-neutral-950">
              Teams
            </h2>
            <p className="mt-0.5 text-[0.8125rem] text-neutral-600">
              {league.shortName} · {league.season}
              {league.competitionFormat === "knockout-cup" ? " · league phase" : ""}
            </p>
          </div>
          <p className="text-[0.8125rem] font-medium tabular-nums text-neutral-500">
            {filtered.length}
            {query.trim() ? ` of ${league.standings.length}` : ""} clubs
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search club…"
              className={cn(
                leaguesGlassFocus,
                "w-full rounded-xl border border-black/[0.06] bg-white/50 py-2.5 pl-9 pr-3 text-[0.875rem] text-neutral-900 placeholder:text-neutral-400",
                "focus:border-black/10 focus:bg-white/80 focus:outline-none",
              )}
            />
          </label>

          <TeamsViewToggle view={view} onChange={setView} />
        </div>
      </header>

      <div className="border-t border-black/[0.06] px-3 pb-4 pt-3 sm:px-4 sm:pb-5">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-[0.875rem] text-neutral-500">
            No club matches &ldquo;{query.trim()}&rdquo;
          </p>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.label ?? "all"}>
                {hasGroups && group.label ? (
                  <p className="mb-2 px-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                    Group {group.label}
                  </p>
                ) : null}
                {view === "chips" ? (
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {group.rows.map((row) => (
                      <li key={`${group.label ?? ""}-${row.team}`}>
                        <TeamCard row={row} leagueId={league.id} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {group.rows.map((row) => (
                      <li key={`${group.label ?? ""}-${row.team}`}>
                        <TeamListRow row={row} leagueId={league.id} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TeamsViewToggle({
  view,
  onChange,
}: {
  view: TeamsViewMode;
  onChange: (view: TeamsViewMode) => void;
}) {
  return (
    <div
      className="flex shrink-0 rounded-xl border border-black/[0.06] bg-white/40 p-0.5"
      role="group"
      aria-label="Teams layout"
    >
      <ViewToggleButton
        active={view === "chips"}
        onClick={() => onChange("chips")}
        label="Card grid"
        icon={LayoutGrid}
      />
      <ViewToggleButton
        active={view === "list"}
        onClick={() => onChange("list")}
        label="List"
        icon={List}
      />
    </div>
  );
}

function ViewToggleButton({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: typeof LayoutGrid;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={cn(
        leaguesGlassFocus,
        "inline-flex items-center justify-center rounded-[0.625rem] p-2 transition-colors",
        active
          ? "bg-foreground text-background shadow-sm"
          : "text-neutral-600 hover:bg-white/60 hover:text-neutral-950",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function TeamCard({ row, leagueId }: { row: LeagueStandingRow; leagueId: string }) {
  const gd = row.goalsFor - row.goalsAgainst;
  const gdLabel = gd > 0 ? `+${gd}` : String(gd);

  return (
    <Link
      href={teamHrefFromName(leagueId, row.team)}
      className={cn(
        leaguesGlassHover,
        leaguesGlassFocus,
        "group flex h-full items-center gap-3 rounded-xl border border-black/[0.06] bg-white/45 px-3 py-2.5 transition-colors hover:border-black/[0.1] hover:bg-white/75",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[0.75rem] font-bold tabular-nums",
          row.rank <= 4
            ? "bg-emerald-500/12 text-emerald-900"
            : "bg-black/[0.04] text-neutral-600",
        )}
      >
        {row.rank}
      </span>

      <FootballLogo src={row.teamLogo} label={row.team} size="sm" className="h-9 w-9 shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.875rem] font-semibold leading-tight text-neutral-950 group-hover:text-sky-950">
          {row.team}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] text-neutral-600">
          <span className="font-semibold tabular-nums text-neutral-800">{row.points} pts</span>
          <span className="text-neutral-300" aria-hidden>
            ·
          </span>
          <span className="tabular-nums">{gdLabel} GD</span>
        </div>
        {row.form.length > 0 ? (
          <div className="mt-1.5">
            <TeamFormStrip form={row.form} />
          </div>
        ) : null}
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-500"
        aria-hidden
      />
    </Link>
  );
}

function TeamListRow({ row, leagueId }: { row: LeagueStandingRow; leagueId: string }) {
  const gd = row.goalsFor - row.goalsAgainst;
  const gdLabel = gd > 0 ? `+${gd}` : String(gd);

  return (
    <Link
      href={teamHrefFromName(leagueId, row.team)}
      className={cn(
        leaguesGlassHover,
        leaguesGlassFocus,
        "group flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white/45 px-3 py-2.5 transition-colors hover:border-black/[0.1] hover:bg-white/75",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[0.75rem] font-bold tabular-nums",
          row.rank <= 4
            ? "bg-emerald-500/12 text-emerald-900"
            : "bg-black/[0.04] text-neutral-600",
        )}
      >
        {row.rank}
      </span>

      <FootballLogo src={row.teamLogo} label={row.team} size="sm" className="h-9 w-9 shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.875rem] font-semibold leading-tight text-neutral-950 group-hover:text-sky-950">
          {row.team}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] text-neutral-600">
          <span className="font-semibold tabular-nums text-neutral-800">{row.points} pts</span>
          <span className="text-neutral-300" aria-hidden>
            ·
          </span>
          <span className="tabular-nums">{gdLabel} GD</span>
          <span className="hidden text-neutral-300 sm:inline" aria-hidden>
            ·
          </span>
          <span className="hidden tabular-nums sm:inline">
            {row.won}W {row.drawn}D {row.lost}L
          </span>
        </div>
        {row.form.length > 0 ? (
          <div className="mt-1.5 sm:hidden">
            <TeamFormStrip form={row.form} />
          </div>
        ) : null}
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        {row.form.length > 0 ? <TeamFormStrip form={row.form} /> : null}
        <ChevronRight
          className="h-4 w-4 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-500"
          aria-hidden
        />
      </div>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-neutral-300 sm:hidden"
        aria-hidden
      />
    </Link>
  );
}

function TeamFormStrip({ form }: { form: LeagueFormResult[] }) {
  const recent = form.slice(-5);

  return (
    <div className="flex items-center gap-0.5" aria-label="Recent form">
      {recent.map((result, index) => (
        <span
          key={`${result}-${index}`}
          className={cn(
            "inline-flex h-4 w-4 items-center justify-center rounded text-[0.5625rem] font-bold leading-none",
            result === "W" && "bg-emerald-500/15 text-emerald-800",
            result === "D" && "bg-neutral-500/10 text-neutral-600",
            result === "L" && "bg-rose-500/10 text-rose-700",
          )}
        >
          {result}
        </span>
      ))}
    </div>
  );
}

function groupStandings(rows: LeagueStandingRow[]) {
  if (!rows.some((row) => row.group)) {
    return [{ label: null as string | null, rows }];
  }

  const byGroup = new Map<string, LeagueStandingRow[]>();

  for (const row of rows) {
    const key = row.group ?? "?";
    const list = byGroup.get(key) ?? [];
    list.push(row);
    byGroup.set(key, list);
  }

  return [...byGroup.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, groupRows]) => ({
      label,
      rows: [...groupRows].sort((left, right) => left.rank - right.rank),
    }));
}
