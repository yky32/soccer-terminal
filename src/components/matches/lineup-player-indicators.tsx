"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { FootballIcon } from "@/components/icons/football-icon";
import type { MatchDetailPlayer } from "@/lib/data/match-detail";
import type { LineupPlayerHighlight } from "@/lib/football/lineup-player-highlights";
import { cn } from "@/lib/utils";

function CardIcon({ kind }: { kind: "yellow" | "red" }) {
  return (
    <span
      className={cn(
        "inline-block h-3 w-2 shrink-0 rounded-[1px] ring-1 ring-black/10",
        kind === "red" ? "bg-red-500" : "bg-amber-400",
      )}
      aria-hidden
    />
  );
}

function CountBadge({
  count,
  className,
  children,
  title,
}: {
  count: number;
  className: string;
  children: ReactNode;
  title: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex min-h-4 min-w-4 items-center justify-center gap-0.5 rounded-full px-1 text-[0.5625rem] font-bold tabular-nums leading-none shadow-sm ring-1",
        className,
      )}
    >
      {children}
      {count > 1 ? <span>{count}</span> : null}
    </span>
  );
}

export function LineupGoalBadge({
  goals,
  size = "default",
}: {
  goals: number;
  size?: "default" | "pitch";
}) {
  if (goals <= 0) return null;

  const iconClass =
    size === "pitch"
      ? "h-[clamp(0.875rem,4.25cqw,1.25rem)] w-[clamp(0.875rem,4.25cqw,1.25rem)]"
      : "h-4 w-4";
  const countClass =
    size === "pitch"
      ? "text-[clamp(0.625rem,2.85cqw,0.8125rem)] font-bold tabular-nums leading-none"
      : "text-[0.6875rem] font-bold tabular-nums leading-none";

  return (
    <span
      title={`${goals} goal${goals > 1 ? "s" : ""}`}
      className="inline-flex items-center gap-0.5 text-neutral-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]"
    >
      <FootballIcon className={iconClass} />
      {goals > 1 ? <span className={countClass}>{goals}</span> : null}
    </span>
  );
}

export function LineupAssistBadge({ assists }: { assists: number }) {
  if (assists <= 0) return null;
  return (
    <CountBadge
      count={assists}
      title={`${assists} assist${assists > 1 ? "s" : ""}`}
      className="bg-sky-600 text-white ring-sky-700/30"
    >
      <span className="text-[0.5rem] font-extrabold">A</span>
    </CountBadge>
  );
}

export function LineupCardBadge({
  yellowCards,
  redCards,
}: {
  yellowCards: number;
  redCards: number;
}) {
  if (redCards > 0) {
    return (
      <span title="Red card" className="inline-flex items-center gap-0.5">
        <CardIcon kind="red" />
        {redCards > 1 ? (
          <span className="text-[0.5625rem] font-bold tabular-nums text-red-600">{redCards}</span>
        ) : null}
      </span>
    );
  }
  if (yellowCards > 0) {
    return (
      <span title="Yellow card" className="inline-flex items-center gap-0.5">
        <CardIcon kind="yellow" />
        {yellowCards > 1 ? (
          <span className="text-[0.5625rem] font-bold tabular-nums text-amber-700">
            {yellowCards}
          </span>
        ) : null}
      </span>
    );
  }
  return null;
}

export function LineupSubOutIndicator({ minute }: { minute: string | null }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[0.625rem] font-semibold leading-none text-orange-800 ring-1 ring-orange-500/20">
      <ArrowDown className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
      Sub off
      {minute ? <span className="font-medium text-orange-700/90">{minute}</span> : null}
    </span>
  );
}

/** Compact sub-off pill for pitch pins — sits above the avatar. */
export function LineupPitchSubOutIndicator({ minute }: { minute: string | null }) {
  return (
    <span className="inline-flex max-w-[18cqw] shrink-0 items-center gap-[0.2cqw] whitespace-nowrap rounded-full bg-orange-500/12 px-[0.45cqw] py-[0.15cqw] text-[clamp(0.4375rem,1.85cqw,0.5625rem)] font-semibold leading-none text-orange-800 shadow-sm ring-1 ring-orange-500/25">
      <ArrowDown
        className="h-[clamp(0.5rem,2cqw,0.625rem)] w-[clamp(0.5rem,2cqw,0.625rem)] shrink-0"
        strokeWidth={2.5}
        aria-hidden
      />
      Sub off
      {minute ? (
        <span className="font-medium tabular-nums text-orange-700/90">{minute}</span>
      ) : null}
    </span>
  );
}

export function LineupSubInIndicator({ minutes }: { minutes: number | null }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[0.625rem] font-semibold leading-none text-emerald-700 ring-1 ring-emerald-500/20">
      <ArrowUp className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
      Sub in
      {minutes != null && minutes > 0 ? (
        <span className="font-medium text-emerald-600/90">{minutes}&apos;</span>
      ) : null}
    </span>
  );
}

export function LineupPitchStatOverlay({ player }: { player: MatchDetailPlayer }) {
  const goals = player.goals ?? 0;
  const assists = player.assists ?? 0;
  const yellow = player.yellowCards ?? 0;
  const red = player.redCards ?? 0;

  if (goals <= 0 && assists <= 0 && yellow <= 0 && red <= 0) return null;

  return (
    <div className="absolute -left-0.5 top-[-5%] z-[2] flex flex-wrap gap-0.5">
      <LineupGoalBadge goals={goals} size="pitch" />
      <LineupAssistBadge assists={assists} />
      <LineupCardBadge yellowCards={yellow} redCards={red} />
    </div>
  );
}

export function LineupBenchStatRow({ player }: { player: MatchDetailPlayer }) {
  const goals = player.goals ?? 0;
  const assists = player.assists ?? 0;
  const yellow = player.yellowCards ?? 0;
  const red = player.redCards ?? 0;

  if (goals <= 0 && assists <= 0 && yellow <= 0 && red <= 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <LineupGoalBadge goals={goals} />
      <LineupAssistBadge assists={assists} />
      <LineupCardBadge yellowCards={yellow} redCards={red} />
    </div>
  );
}

export function lineupRatingClass(highlight: LineupPlayerHighlight, onPitch = false) {
  if (!highlight.topRating) return onPitch ? "ring-white" : "";
  return onPitch
    ? "ring-2 ring-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.35)]"
    : "ring-2 ring-amber-400/80";
}
