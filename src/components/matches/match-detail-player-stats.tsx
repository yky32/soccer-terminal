"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BarChart3 } from "lucide-react";
import { CaptainIcon } from "@/components/icons/captain-icon";
import { FootballLogo } from "@/components/overview/football-logo";
import { MatchDetailSectionTitle } from "@/components/matches/match-detail-section-title";
import {
  LineupPositionBadge,
  LineupPositionLegend,
} from "@/components/matches/lineup-position-style";
import { PlayerKitNumber } from "@/components/matches/lineup-player-indicators";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { leaguesGlass, leaguesGlassInset } from "@/components/leagues/leagues-glass";
import type { MatchDetailPlayerPerformance } from "@/lib/data/match-detail";
import { shortPlayerName } from "@/lib/football/lineup-pitch-layout";
import { cn } from "@/lib/utils";

type SortKey =
  | "name"
  | "position"
  | "minutes"
  | "goals"
  | "assists"
  | "shotsTotal"
  | "passesTotal"
  | "yellowCards"
  | "redCards"
  | "rating";

type SortDir = "asc" | "desc";

type SortState = {
  key: SortKey;
  dir: SortDir;
};

const DEFAULT_SORT: SortState = { key: "rating", dir: "desc" };

const POSITION_ORDER: Record<string, number> = {
  G: 0,
  D: 1,
  M: 2,
  F: 3,
};

const STAT_HEADER_CLASS = "w-[2.35rem] px-1 text-center";
const GOAL_COL_CLASS = "bg-orange-500/10";
const ASSIST_COL_CLASS = "bg-orange-500/[0.045]";

function positionSortKey(position: string | null) {
  const key = (position ?? "").trim().charAt(0).toUpperCase();
  return POSITION_ORDER[key] ?? 9;
}

function parseRating(rating: string | null) {
  if (!rating?.trim()) return null;
  const value = Number.parseFloat(rating);
  return Number.isFinite(value) ? value : null;
}

function compareNullableNumbers(
  left: number | null,
  right: number | null,
  dir: SortDir,
) {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  return dir === "asc" ? left - right : right - left;
}

function sortPlayers(players: MatchDetailPlayerPerformance[], sort: SortState) {
  const dir = sort.dir;
  const sorted = [...players];

  sorted.sort((left, right) => {
    switch (sort.key) {
      case "name":
        return dir === "asc"
          ? left.name.localeCompare(right.name)
          : right.name.localeCompare(left.name);
      case "position": {
        const lp = positionSortKey(left.position);
        const rp = positionSortKey(right.position);
        if (lp !== rp) return dir === "asc" ? lp - rp : rp - lp;
        return left.name.localeCompare(right.name);
      }
      case "minutes":
        return compareNullableNumbers(left.minutes, right.minutes, dir);
      case "goals":
        return compareNullableNumbers(left.goals, right.goals, dir);
      case "assists":
        return compareNullableNumbers(left.assists, right.assists, dir);
      case "shotsTotal":
        return compareNullableNumbers(left.shotsTotal, right.shotsTotal, dir);
      case "passesTotal":
        return compareNullableNumbers(left.passesTotal, right.passesTotal, dir);
      case "yellowCards":
        return compareNullableNumbers(left.yellowCards, right.yellowCards, dir);
      case "redCards":
        return compareNullableNumbers(left.redCards, right.redCards, dir);
      case "rating":
        return compareNullableNumbers(parseRating(left.rating), parseRating(right.rating), dir);
      default:
        return 0;
    }
  });

  return sorted;
}

function ratingLeaderIds(
  players: MatchDetailPlayerPerformance[],
  mode: "best" | "worst",
) {
  let extreme: number | null = null;
  const ids = new Set<number>();

  for (const player of players) {
    if (!playerPlayedInMatch(player)) continue;
    const rating = parseRating(player.rating);
    if (rating == null) continue;

    const isExtreme =
      extreme == null || (mode === "best" ? rating > extreme : rating < extreme);

    if (isExtreme) {
      extreme = rating;
      ids.clear();
      ids.add(player.id);
    } else if (rating === extreme) {
      ids.add(player.id);
    }
  }

  return { ids, value: extreme };
}

function topStatPlayerIds(
  players: MatchDetailPlayerPerformance[],
  pick: (player: MatchDetailPlayerPerformance) => number,
) {
  let best = 0;
  const ids = new Set<number>();

  for (const player of players) {
    const value = pick(player);
    if (value <= 0) continue;
    if (value > best) {
      best = value;
      ids.clear();
      ids.add(player.id);
    } else if (value === best) {
      ids.add(player.id);
    }
  }

  return ids;
}

function playerPlayedInMatch(player: MatchDetailPlayerPerformance) {
  if (player.minutes != null && player.minutes > 0) return true;
  return Boolean(player.rating?.trim());
}

function statValue(value: number | null) {
  if (value == null) return "—";
  return String(value);
}

function SortableHeader({
  label,
  column,
  sort,
  onSort,
  align = "left",
  className,
  title,
}: {
  label: string;
  column: SortKey;
  sort: SortState;
  onSort: (column: SortKey) => void;
  align?: "left" | "right" | "center";
  className?: string;
  title?: string;
}) {
  const active = sort.key === column;

  return (
    <th
      className={cn(
        "py-2.5 font-semibold",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      <button
        type="button"
        title={title}
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-0.5 transition-colors hover:text-neutral-800",
          align === "right" && "ml-auto",
          align === "center" && "mx-auto",
          active ? "text-neutral-900" : "text-neutral-500",
        )}
        aria-label={`Sort by ${title ?? label}${active ? `, ${sort.dir === "asc" ? "ascending" : "descending"}` : ""}`}
      >
        <span>{label}</span>
        {active ? (
          sort.dir === "asc" ? (
            <ArrowUp className="h-3 w-3 shrink-0" aria-hidden />
          ) : (
            <ArrowDown className="h-3 w-3 shrink-0" aria-hidden />
          )
        ) : null}
      </button>
    </th>
  );
}

function StatCell({
  value,
  emphasis = false,
  tone = "default",
}: {
  value: number | null;
  emphasis?: boolean;
  tone?: "default" | "yellow" | "red";
}) {
  const display = statValue(value);
  const muted = display === "—" || display === "0";

  return (
    <td className="px-1 py-2.5 text-center tabular-nums">
      <span
        className={cn(
          muted ? "text-neutral-300" : "text-neutral-700",
          emphasis && !muted && "font-semibold text-neutral-900",
          tone === "yellow" && !muted && "font-medium text-amber-700",
          tone === "red" && !muted && "font-medium text-red-600",
        )}
      >
        {display}
      </span>
    </td>
  );
}

function GoalStatCell({
  value,
  isTop,
  played,
}: {
  value: number | null;
  isTop: boolean;
  played: boolean;
}) {
  const display = statValue(value);
  const count = value ?? 0;
  const muted = !played || count === 0;

  return (
    <td className={cn("px-1 py-2.5 text-center tabular-nums", GOAL_COL_CLASS)}>
      {muted ? (
        <span className="text-neutral-300">{display === "—" ? "—" : "0"}</span>
      ) : isTop ? (
        <span className="inline-flex min-w-[1.35rem] justify-center rounded-md bg-orange-600 px-1.5 py-0.5 text-[0.6875rem] font-bold text-white shadow-sm ring-1 ring-orange-500/35">
          {display}
        </span>
      ) : (
        <span className="text-[0.8125rem] font-bold text-orange-700">{display}</span>
      )}
    </td>
  );
}

function AssistStatCell({
  value,
  isTop,
  played,
}: {
  value: number | null;
  isTop: boolean;
  played: boolean;
}) {
  const display = statValue(value);
  const count = value ?? 0;
  const muted = !played || count === 0;

  return (
    <td className={cn("px-1 py-2.5 text-center tabular-nums", ASSIST_COL_CLASS)}>
      {muted ? (
        <span className="text-neutral-300">{display === "—" ? "—" : "0"}</span>
      ) : isTop ? (
        <span className="inline-flex min-w-[1.25rem] justify-center rounded-md bg-orange-100 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-orange-800 ring-1 ring-orange-300/45">
          {display}
        </span>
      ) : (
        <span className="font-semibold text-orange-500">{display}</span>
      )}
    </td>
  );
}

function RatingStatCell({
  rating,
  isTop,
  isWorst,
}: {
  rating: string | null;
  isTop: boolean;
  isWorst: boolean;
}) {
  return (
    <td className="px-3 py-2.5 text-right">
      {rating ? (
        <span
          className={cn(
            "inline-flex min-w-[2rem] justify-center rounded-md px-1.5 py-0.5 text-[0.6875rem] font-bold tabular-nums",
            isTop && "bg-amber-100 text-amber-950 ring-1 ring-amber-400/35",
            isWorst && "bg-rose-100 text-rose-950 ring-1 ring-rose-400/35",
            !isTop && !isWorst && "bg-neutral-100 text-neutral-800",
          )}
        >
          {rating}
        </span>
      ) : (
        <span className="text-neutral-300">—</span>
      )}
    </td>
  );
}

function PerformanceTable({
  team,
  logo,
  side,
  players,
}: {
  team: string;
  logo: string | null;
  side: "home" | "away";
  players: MatchDetailPlayerPerformance[];
}) {
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const sortedPlayers = useMemo(() => sortPlayers(players, sort), [players, sort]);
  const bestRatings = useMemo(() => ratingLeaderIds(players, "best"), [players]);
  const worstRatings = useMemo(() => ratingLeaderIds(players, "worst"), [players]);
  const showWorstRating =
    bestRatings.value != null &&
    worstRatings.value != null &&
    bestRatings.value > worstRatings.value;
  const topGoalIds = useMemo(
    () => topStatPlayerIds(players, (player) => player.goals ?? 0),
    [players],
  );
  const topAssistIds = useMemo(
    () => topStatPlayerIds(players, (player) => player.assists ?? 0),
    [players],
  );

  function toggleSort(column: SortKey) {
    setSort((current) =>
      current.key === column
        ? { key: column, dir: current.dir === "desc" ? "asc" : "desc" }
        : { key: column, dir: column === "name" || column === "position" ? "asc" : "desc" },
    );
  }

  if (players.length === 0) return null;

  return (
    <div className={cn(leaguesGlassInset, "overflow-hidden rounded-xl")}>
      <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 py-2.5">
        <FootballLogo src={logo} label={team} size="xs" />
        <p className="truncate text-[0.8125rem] font-semibold text-neutral-950">{team}</p>
        <span className="ml-auto text-[0.6875rem] tabular-nums text-neutral-400">
          {players.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[26rem] text-left text-[0.75rem]">
          <thead className="sticky top-0 z-[1] bg-white/90 backdrop-blur-sm">
            <tr className="border-b border-black/[0.06] text-[0.625rem] uppercase tracking-[0.08em]">
              <SortableHeader
                label="Player"
                column="name"
                sort={sort}
                onSort={toggleSort}
                className="min-w-[7.5rem] px-3"
              />
              <SortableHeader
                label="Pos"
                column="position"
                sort={sort}
                onSort={toggleSort}
                align="center"
                className="w-10 px-1"
              />
              <SortableHeader
                label="Min"
                column="minutes"
                sort={sort}
                onSort={toggleSort}
                align="center"
                className={STAT_HEADER_CLASS}
                title="Minutes"
              />
              <SortableHeader
                label="G"
                column="goals"
                sort={sort}
                onSort={toggleSort}
                align="center"
                className={cn(STAT_HEADER_CLASS, GOAL_COL_CLASS, "font-bold text-orange-800")}
                title="Goals"
              />
              <SortableHeader
                label="A"
                column="assists"
                sort={sort}
                onSort={toggleSort}
                align="center"
                className={cn(STAT_HEADER_CLASS, ASSIST_COL_CLASS, "font-semibold text-orange-500")}
                title="Assists"
              />
              <SortableHeader
                label="Sh"
                column="shotsTotal"
                sort={sort}
                onSort={toggleSort}
                align="center"
                className={STAT_HEADER_CLASS}
                title="Shots"
              />
              <SortableHeader
                label="Ps"
                column="passesTotal"
                sort={sort}
                onSort={toggleSort}
                align="center"
                className={STAT_HEADER_CLASS}
                title="Passes"
              />
              <SortableHeader
                label="YC"
                column="yellowCards"
                sort={sort}
                onSort={toggleSort}
                align="center"
                className={STAT_HEADER_CLASS}
                title="Yellow cards"
              />
              <SortableHeader
                label="RC"
                column="redCards"
                sort={sort}
                onSort={toggleSort}
                align="center"
                className={STAT_HEADER_CLASS}
                title="Red cards"
              />
              <SortableHeader
                label="Rt"
                column="rating"
                sort={sort}
                onSort={toggleSort}
                align="right"
                className="w-12 px-3"
                title="Rating"
              />
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => {
              const played = playerPlayedInMatch(player);
              const isTopRating = played && bestRatings.ids.has(player.id);
              const isWorstRating =
                played &&
                showWorstRating &&
                worstRatings.ids.has(player.id) &&
                !isTopRating;

              return (
                <tr
                  key={`${player.id}-${index}`}
                  className={cn(
                    "border-b border-black/[0.04] transition-[opacity,colors] last:border-0 hover:bg-black/[0.02]",
                    !played && "opacity-[0.52] saturate-[0.9]",
                  )}
                  title={played ? undefined : `${player.name} · Did not play`}
                >
                  <td className="px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <PlayerAvatar
                        src={player.photo}
                        name={player.name}
                        className="!h-7 !w-7 shrink-0"
                      />
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span
                          className={cn(
                            "min-w-0 truncate font-medium",
                            played ? "text-neutral-900" : "text-neutral-500",
                          )}
                          title={player.name}
                        >
                          {shortPlayerName(player.name)}
                        </span>
                        {player.captain ? <CaptainIcon /> : null}
                        {player.number ? (
                          <PlayerKitNumber
                            number={player.number}
                            side={side}
                            className="shrink-0"
                          />
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-1 py-2 text-center">
                    <LineupPositionBadge position={player.position} />
                  </td>
                  <StatCell value={player.minutes} />
                  <GoalStatCell
                    value={player.goals}
                    played={played}
                    isTop={played && topGoalIds.has(player.id)}
                  />
                  <AssistStatCell
                    value={player.assists}
                    played={played}
                    isTop={played && topAssistIds.has(player.id)}
                  />
                  <StatCell value={player.shotsTotal} />
                  <StatCell value={player.passesTotal} />
                  <StatCell value={player.yellowCards} tone="yellow" />
                  <StatCell value={player.redCards} tone="red" />
                  <RatingStatCell
                    rating={player.rating}
                    isTop={isTopRating}
                    isWorst={isWorstRating}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MatchDetailPlayerStats({
  homeTeam,
  homeLogo,
  awayTeam,
  awayLogo,
  performances,
}: {
  homeTeam: string;
  homeLogo: string | null;
  awayTeam: string;
  awayLogo: string | null;
  performances: {
    home: MatchDetailPlayerPerformance[];
    away: MatchDetailPlayerPerformance[];
  };
}) {
  const hasHome = performances.home.length > 0;
  const hasAway = performances.away.length > 0;

  return (
    <section className={cn(leaguesGlass, "overflow-hidden")} aria-label="Player stats">
      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <MatchDetailSectionTitle icon={BarChart3}>Player stats</MatchDetailSectionTitle>
          <LineupPositionLegend className="text-[0.625rem]" />
        </div>

        {!hasHome && !hasAway ? (
          <p className="py-6 text-center text-[0.875rem] text-neutral-500">
            Player statistics will appear after kickoff.
          </p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
            {hasHome ? (
              <PerformanceTable
                team={homeTeam}
                logo={homeLogo}
                side="home"
                players={performances.home}
              />
            ) : null}
            {hasAway ? (
              <PerformanceTable
                team={awayTeam}
                logo={awayLogo}
                side="away"
                players={performances.away}
              />
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
