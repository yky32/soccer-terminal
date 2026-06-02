"use client";

import Link from "next/link";
import { FootballLogo } from "@/components/overview/football-logo";
import { PlayerAvatar } from "@/components/players/player-avatar";
import {
  leaguesGlass,
  leaguesGlassInset,
  leaguesGlassInsetBar,
} from "@/components/leagues/leagues-glass";
import type { LeagueLeaderBoards, LeaguePlayerStatKind } from "@/lib/data/league-profile";
import {
  formatPlayerStatValue,
  formatTeamWinRate,
  formatTeamWinRateMeta,
  LEAGUE_PLAYER_STAT_LABELS,
  LEAGUE_TEAM_WIN_RATE_LABEL,
} from "@/lib/data/league-stats";
import { playerHref } from "@/lib/player-paths";
import { cn } from "@/lib/utils";

const PLAYER_STAT_ORDER: LeaguePlayerStatKind[] = ["rating", "goals", "assists", "fouls"];

/** Grey row tint by rank (1 = strongest), through top 10. */
const LEADER_RANK_HIGHLIGHT: readonly string[] = [
  "bg-neutral-200/90",
  "bg-neutral-200/80",
  "bg-neutral-200/70",
  "bg-neutral-200/60",
  "bg-neutral-200/[0.55]",
  "bg-neutral-200/50",
  "bg-neutral-200/[0.45]",
  "bg-neutral-200/40",
  "bg-neutral-200/[0.35]",
  "bg-neutral-200/30",
];

const podiumHighlight = (rank: number) =>
  rank >= 1 && rank <= LEADER_RANK_HIGHLIGHT.length
    ? LEADER_RANK_HIGHLIGHT[rank - 1]
    : "";

type LeagueStatLeaderGridProps = {
  title: string;
  subtitle?: string;
  boards: LeagueLeaderBoards;
  focusTeam?: string;
  leagueId?: string;
};

export function LeagueStatLeaderGrid({
  title,
  subtitle,
  boards,
  focusTeam,
  leagueId,
}: LeagueStatLeaderGridProps) {
  return (
    <section className={cn(leaguesGlass, "overflow-hidden")}>
      <header
        className={cn(
          leaguesGlassInsetBar,
          "flex items-center justify-between border-b border-black/[0.06] px-4 py-3 sm:px-5",
        )}
      >
        <h2 className="text-[clamp(1.125rem,2.2vw,1.375rem)] font-semibold tracking-[-0.03em] text-neutral-950">
          {title}
        </h2>
        {subtitle ? (
          <span className="text-[0.8125rem] text-neutral-500">{subtitle}</span>
        ) : null}
      </header>

      <div className="grid gap-px bg-black/[0.06] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {PLAYER_STAT_ORDER.map((kind) => (
          <PlayerStatColumn key={kind} kind={kind} rows={boards.players[kind]} leagueId={leagueId} />
        ))}
        <TeamWinRateColumn rows={boards.teamWinRates} focusTeam={focusTeam} />
      </div>
    </section>
  );
}

function PlayerStatColumn({
  kind,
  rows,
  leagueId,
}: {
  kind: LeaguePlayerStatKind;
  rows: LeagueLeaderBoards["players"][LeaguePlayerStatKind];
  leagueId?: string;
}) {
  return (
    <div className="bg-white/20 px-3 py-3 sm:px-4">
      <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {LEAGUE_PLAYER_STAT_LABELS[kind]}
      </h3>
      <ol className="mt-2 space-y-1.5">
        {rows.length === 0 ? (
          <li className="py-2 text-[0.75rem] text-neutral-500">No API data for this stat.</li>
        ) : (
          rows.map((row) => (
            <li key={`${kind}-${row.rank}-${row.playerName}`}>
              <PlayerStatRow row={row} kind={kind} leagueId={leagueId} />
            </li>
          ))
        )}
      </ol>
    </div>
  );
}

function PlayerStatRow({
  row,
  kind,
  leagueId,
}: {
  row: LeagueLeaderBoards["players"][LeaguePlayerStatKind][number];
  kind: LeaguePlayerStatKind;
  leagueId?: string;
}) {
  const podium = podiumHighlight(row.rank);
  const content = (
    <>
      <span className="w-4 shrink-0 text-[0.75rem] font-bold tabular-nums text-neutral-400">
        {row.rank}
      </span>
      <PlayerAvatar src={row.playerAvatar} name={row.playerName} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.8125rem] font-semibold text-neutral-950">{row.playerName}</p>
        <div className="mt-0.5 flex items-center gap-1">
          <FootballLogo src={row.teamLogo} label={row.team} size="xs" />
          <span className="truncate text-[0.6875rem] text-neutral-500">{row.team}</span>
        </div>
      </div>
      <span
        className={cn(
          leaguesGlassInset,
          "shrink-0 rounded-md px-1.5 py-0.5 text-[0.75rem] font-bold tabular-nums text-neutral-900",
          kind === "rating" && "text-sky-900",
          kind === "goals" && "text-emerald-900",
          kind === "assists" && "text-violet-900",
          kind === "fouls" && "text-amber-900",
        )}
      >
        {formatPlayerStatValue(kind, row.value)}
      </span>
    </>
  );

  if (!leagueId) {
    return (
      <div className={cn("flex items-center gap-2 rounded-md px-1 py-1", podium)}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={playerHref(leagueId, row.playerSlug)}
      className={cn(
        "flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-white/30",
        podium,
      )}
    >
      {content}
    </Link>
  );
}

function TeamWinRateColumn({
  rows,
  focusTeam,
}: {
  rows: LeagueLeaderBoards["teamWinRates"];
  focusTeam?: string;
}) {
  return (
    <div className="bg-white/20 px-3 py-3 sm:px-4">
      <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {LEAGUE_TEAM_WIN_RATE_LABEL}
      </h3>
      <ol className="mt-2 space-y-1.5">
        {rows.length === 0 ? (
          <li className="py-2 text-[0.75rem] text-neutral-500">No API data for this stat.</li>
        ) : (
          rows.map((row) => {
            const isFocused = focusTeam === row.team;
            const podium = podiumHighlight(row.rank);

            return (
              <li key={`win-rate-${row.rank}-${row.team}`}>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-1 py-1 transition-colors",
                    isFocused && "bg-indigo-500/10 ring-1 ring-indigo-500/20",
                    !isFocused && podium,
                  )}
                >
                  <span className="w-4 shrink-0 text-[0.75rem] font-bold tabular-nums text-neutral-400">
                    {row.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <FootballLogo src={row.teamLogo} label={row.team} size="xs" />
                      <p className="truncate text-[0.8125rem] font-semibold text-neutral-950">
                        {row.team}
                      </p>
                    </div>
                    <p className="mt-0.5 text-[0.6875rem] text-neutral-500">
                      {formatTeamWinRateMeta(row.won, row.played)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      leaguesGlassInset,
                      "shrink-0 rounded-md px-1.5 py-0.5 text-[0.75rem] font-bold tabular-nums text-indigo-900",
                    )}
                  >
                    {formatTeamWinRate(row.value)}
                  </span>
                </div>
              </li>
            );
          })
        )}
      </ol>
    </div>
  );
}
