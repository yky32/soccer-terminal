"use client";

import type { CSSProperties } from "react";
import { FootballLogo } from "@/components/overview/football-logo";
import { LeagueIcon } from "@/components/leagues/league-icon";
import {
  groupMatchesByLeague,
  isMatchLive,
  matchHeatStyle,
  matchHeatWeight,
  matchMinuteLabel,
  matchSideState,
  teamAbbrev,
  type MonitoredMatch,
} from "@/lib/match-monitor";
import { cn } from "@/lib/utils";

type MatchHeatmapGridProps = {
  items: MonitoredMatch[];
  onRemove: (matchId: number) => void;
  fullWidth?: boolean;
};

type SideState = "leading" | "losing" | "draw";

function scoreSideClass(state: SideState, part: "label" | "goals") {
  if (state === "leading") {
    return part === "label"
      ? "font-extrabold text-white"
      : "font-extrabold text-white";
  }
  if (state === "losing") {
    return part === "label" ? "font-medium opacity-45" : "font-semibold opacity-45";
  }
  return part === "label" ? "font-semibold text-white/95" : "font-bold text-white/90";
}

type HeatmapScorelineProps = {
  homeTeam: string;
  awayTeam: string;
  homeLogo: string | null;
  awayLogo: string | null;
  homeGoals: number;
  awayGoals: number;
  homeState: SideState;
  awayState: SideState;
};

function LeadingDot({ label }: { label: string }) {
  return (
    <span
      className="h-1 w-1 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.85)]"
      aria-label={label}
    />
  );
}

function HeatmapScoreline({
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  homeGoals,
  awayGoals,
  homeState,
  awayState,
}: HeatmapScorelineProps) {
  const scoreTextClass =
    "text-[0.8125rem] font-bold tabular-nums leading-none tracking-tight";

  return (
    <div className="mt-auto pt-2">
      <div className="hidden items-center gap-1.5 @[9rem]:flex">
        <FootballLogo src={homeLogo} label={homeTeam} size="xs" />
        <p
          className={cn(
            "flex min-w-0 flex-1 items-center justify-center gap-1",
            scoreTextClass,
          )}
        >
          <span className={cn("inline-flex items-center gap-0.5", scoreSideClass(homeState, "label"))}>
            {teamAbbrev(homeTeam)}
            {homeState === "leading" ? <LeadingDot label="Home leading" /> : null}
          </span>
          <span className={scoreSideClass(homeState, "goals")}>{homeGoals}</span>
          <span className="px-0.5 text-[0.6875rem] font-semibold opacity-55">vs</span>
          <span className={scoreSideClass(awayState, "goals")}>{awayGoals}</span>
          <span className={cn("inline-flex items-center gap-0.5", scoreSideClass(awayState, "label"))}>
            {awayState === "leading" ? <LeadingDot label="Away leading" /> : null}
            {teamAbbrev(awayTeam)}
          </span>
        </p>
        <FootballLogo src={awayLogo} label={awayTeam} size="xs" />
      </div>

      <div className={cn("flex flex-col gap-1 @[9rem]:hidden", scoreTextClass)}>
        <div className="flex items-center gap-1.5">
          <FootballLogo src={homeLogo} label={homeTeam} size="xs" />
          <span className={cn("inline-flex items-center gap-0.5", scoreSideClass(homeState, "label"))}>
            {teamAbbrev(homeTeam)}
            {homeState === "leading" ? <LeadingDot label="Home leading" /> : null}
          </span>
          <span className={cn("ml-auto", scoreSideClass(homeState, "goals"))}>{homeGoals}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FootballLogo src={awayLogo} label={awayTeam} size="xs" />
          <span className={cn("inline-flex items-center gap-0.5", scoreSideClass(awayState, "label"))}>
            {teamAbbrev(awayTeam)}
            {awayState === "leading" ? <LeadingDot label="Away leading" /> : null}
          </span>
          <span className={cn("ml-auto", scoreSideClass(awayState, "goals"))}>{awayGoals}</span>
        </div>
      </div>
    </div>
  );
}

type MatchHeatmapCellProps = {
  item: MonitoredMatch;
  onRemove: (matchId: number) => void;
  className?: string;
  style?: CSSProperties;
};

function MatchHeatmapCell({ item, onRemove, className, style }: MatchHeatmapCellProps) {
  const { match } = item;
  const palette = matchHeatStyle(match);
  const live = isMatchLive(match);
  const sideState = live
    ? matchSideState(match.homeGoals, match.awayGoals)
    : { home: "draw" as const, away: "draw" as const };
  const minuteLabel = matchMinuteLabel(match);

  return (
    <div
      className={cn(
        "@container group relative flex min-h-[5.75rem] min-w-[6rem] flex-col overflow-hidden rounded-[3px] p-2.5 transition-[filter,transform] duration-200 hover:brightness-110",
        className,
      )}
      style={{ ...style, backgroundColor: palette.background, color: palette.foreground }}
      title={`${match.homeTeam} ${match.homeGoals} – ${match.awayGoals} ${match.awayTeam}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 pt-0.5">
          <LeagueIcon league={{ logo: match.leagueLogo, name: match.league }} size="xs" />
          <p
            className="min-w-0 truncate text-[0.5625rem] font-semibold uppercase tracking-[0.08em]"
            style={{ color: palette.accent }}
          >
            {match.league}
          </p>
        </div>

        <div className="shrink-0 text-right leading-none">
          <p className="text-[1.125rem] font-bold tabular-nums tracking-tight sm:text-[1.25rem]">
            {minuteLabel}
          </p>
          {live ? (
            <p className="mt-1 flex items-center justify-end gap-1 text-[0.5625rem] font-semibold uppercase tracking-[0.12em] opacity-90">
              <span className="relative flex h-1.5 w-1.5" aria-hidden>
                <span className="absolute inset-0 animate-ping rounded-full bg-white/70" />
                <span className="relative m-auto h-1 w-1 rounded-full bg-white" />
              </span>
              Live
            </p>
          ) : null}
        </div>
      </div>

      <HeatmapScoreline
        homeTeam={match.homeTeam}
        awayTeam={match.awayTeam}
        homeLogo={match.homeLogo}
        awayLogo={match.awayLogo}
        homeGoals={match.homeGoals}
        awayGoals={match.awayGoals}
        homeState={sideState.home}
        awayState={sideState.away}
      />

      <button
        type="button"
        onClick={() => onRemove(match.id)}
        className="absolute bottom-1.5 right-1.5 rounded px-1 py-0.5 text-[0.625rem] leading-none text-white/70 opacity-0 transition-opacity hover:bg-white/15 hover:text-white group-hover:opacity-100"
        aria-label={`Remove ${match.homeTeam} vs ${match.awayTeam}`}
      >
        ×
      </button>
    </div>
  );
}

export function MatchHeatmapGrid({ items, onRemove, fullWidth = false }: MatchHeatmapGridProps) {
  const groups = groupMatchesByLeague(items);

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-[220px] items-center justify-center px-6 py-12 text-center",
          fullWidth
            ? "bg-[#161a22] text-neutral-500"
            : "rounded-xl border border-dashed border-black/10 bg-neutral-950/[0.03]",
        )}
      >
        <p className="max-w-sm text-[0.875rem] leading-relaxed text-neutral-500">
          Search for a match above, then add it to your watchlist. Selected fixtures appear
          here as a live heat map.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden bg-[#161a22] p-[3px]",
        fullWidth
          ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "rounded-xl border border-black/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
      )}
      role="grid"
      aria-label="Match monitor heat map"
    >
      <div className="flex min-h-[min(440px,52vh)] gap-[3px]">
        {groups.map((group) => {
          const groupWeight = group.matches.reduce(
            (sum, item) => sum + matchHeatWeight(item.match),
            0,
          );

          return (
            <div
              key={group.league}
              className="flex min-w-0 flex-col gap-[3px]"
              style={{ flex: `${groupWeight} 1 0%` }}
            >
              {group.matches.map((item) => (
                <MatchHeatmapCell
                  key={item.match.id}
                  item={item}
                  onRemove={onRemove}
                  style={{ flex: `${matchHeatWeight(item.match)} 1 0%` }}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div className="mt-[3px] flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/[0.06] px-2 py-2 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-neutral-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px] bg-emerald-500/80" aria-hidden />
          Home lead
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px] bg-rose-500/80" aria-hidden />
          Away lead
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px] bg-amber-500/70" aria-hidden />
          Level
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" aria-hidden />
          Leading team
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px] bg-slate-500/80" aria-hidden />
          Upcoming
        </span>
      </div>
    </div>
  );
}
