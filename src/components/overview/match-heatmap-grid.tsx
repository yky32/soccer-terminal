"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import {
  Blocks,
  LayoutDashboard,
  LayoutGrid,
  List,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { MirrorMatchScoreline } from "@/components/matches/mirror-match-scoreline";
import { LeagueIcon } from "@/components/leagues/league-icon";
import {
  groupMatchesByLeague,
  heatmapMosaicPlacement,
  isMatchLive,
  type MosaicTier,
  matchEventGlyph,
  matchEventLineLabel,
  matchEventStrip,
  matchHeatStyle,
  matchHeatWeight,
  matchMinuteLabel,
  matchMonitorInsight,
  matchSideState,
  readHeatmapViewPrefs,
  sortHeatmapItems,
  writeHeatmapViewPrefs,
  type HeatmapDensity,
  type HeatmapLayout,
  type HeatmapViewPrefs,
  type MonitoredMatch,
} from "@/lib/match-monitor";
import { matchHref } from "@/lib/match-paths";
import type { LiveMatch } from "@/lib/data/live-match";
import { useUserPreferences } from "@/components/user-preferences-provider";
import { cn } from "@/lib/utils";

type MatchHeatmapGridProps = {
  items: MonitoredMatch[];
  onRemove: (matchId: number) => void;
  fullWidth?: boolean;
  emptySlot?: ReactNode;
};

type SideState = "leading" | "losing" | "draw";

const LAYOUT_OPTIONS: {
  id: HeatmapLayout;
  label: string;
  icon: ElementType<{ className?: string; "aria-hidden"?: boolean }>;
}[] = [
  { id: "treemap", label: "Treemap by league", icon: LayoutDashboard },
  { id: "grid", label: "Uniform grid", icon: LayoutGrid },
  { id: "mosaic", label: "Ranked mosaic grid", icon: Blocks },
  { id: "timeline", label: "Timeline list", icon: List },
];

function cellSizeClass(density: HeatmapDensity, layout: HeatmapLayout) {
  if (layout === "grid") {
    return density === "compact" ? "h-full min-h-[6.25rem] p-2" : "h-full min-h-[7.5rem] p-2.5";
  }

  if (layout === "timeline") {
    return density === "compact" ? "min-h-[4.75rem] w-full p-2.5" : "min-h-[5.25rem] w-full p-3";
  }

  return density === "compact"
    ? "min-h-[4.75rem] min-w-[5.75rem] p-2"
    : "min-h-[6.25rem] min-w-[7rem] p-2.5";
}

type HeatmapRank = { index: number; total: number; tier: MosaicTier };

type HeatmapTileType = {
  league: string;
  minute: string;
  live: string;
  score: string;
  scoreGoals: string;
  scoreVs: string;
  insight: string;
  eventRow: string;
  eventGlyph: string;
  scoreWide: string;
  scoreNarrow: string;
  hideMiddleOnGrid: boolean;
  mosaicCompact: boolean;
};

function mosaicCellPadding(tier: MosaicTier, density: HeatmapDensity) {
  const padding: Record<HeatmapDensity, Record<MosaicTier, string>> = {
    normal: { xl: "p-3.5", lg: "p-3", md: "p-2.5", sm: "p-2" },
    compact: { xl: "p-3", lg: "p-2.5", md: "p-2", sm: "p-1.5" },
  };

  return cn("h-full min-h-0", padding[density][tier]);
}

function heatmapTypeMosaic(tier: MosaicTier, density: HeatmapDensity): HeatmapTileType {
  const compact = density === "compact";

  switch (tier) {
    case "xl":
      return {
        eventRow: "leading-snug",
        league: "text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.06em]",
        minute: compact ? "text-xs leading-none" : "text-sm leading-none",
        live: "text-[0.625rem] font-semibold uppercase leading-none tracking-[0.1em]",
        score: "text-xs leading-snug",
        scoreGoals: compact ? "text-sm font-extrabold" : "text-base font-extrabold",
        scoreVs: "text-[0.625rem] font-medium opacity-50",
        insight: "text-[0.6875rem] leading-snug",
        eventGlyph: "text-[0.625rem]",
        scoreWide: "hidden items-center gap-1.5 @[11rem]:flex",
        scoreNarrow: "flex flex-col gap-1 @[11rem]:hidden",
        hideMiddleOnGrid: false,
        mosaicCompact: false,
      };
    case "lg":
      return {
        eventRow: "leading-snug",
        league: "text-[0.625rem] font-semibold uppercase leading-none tracking-[0.06em]",
        minute: compact ? "text-xs leading-none" : "text-sm leading-none",
        live: "text-[0.5625rem] font-semibold uppercase leading-none tracking-[0.1em]",
        score: "text-[0.6875rem] leading-snug",
        scoreGoals: "text-xs font-extrabold",
        scoreVs: "text-[0.5625rem] font-medium opacity-50",
        insight: "text-[0.625rem] leading-snug",
        eventGlyph: "text-[0.5625rem]",
        scoreWide: "hidden items-center gap-1.5 @[9.5rem]:flex",
        scoreNarrow: "flex flex-col gap-1 @[9.5rem]:hidden",
        hideMiddleOnGrid: true,
        mosaicCompact: false,
      };
    case "md":
      return {
        eventRow: "leading-tight",
        league: "text-[0.625rem] font-semibold uppercase leading-none tracking-[0.05em]",
        minute: compact ? "text-[0.5625rem] leading-none" : "text-[0.625rem] leading-none",
        live: "text-[0.5625rem] font-semibold uppercase leading-none tracking-[0.08em]",
        score: "text-[0.6875rem] leading-snug",
        scoreGoals: "text-xs font-extrabold leading-none",
        scoreVs: "text-[0.5625rem] font-medium opacity-50",
        insight: "text-[0.625rem] leading-snug",
        eventGlyph: "text-[0.5625rem]",
        scoreWide: "hidden",
        scoreNarrow: "flex flex-col gap-1",
        hideMiddleOnGrid: true,
        mosaicCompact: false,
      };
    case "sm":
      return {
        eventRow: "leading-tight",
        league: "text-[0.5625rem] font-semibold uppercase leading-none",
        minute: "text-[0.625rem] font-semibold leading-none opacity-90",
        live: "text-[0.5rem] font-semibold uppercase leading-none",
        score: "text-[0.6875rem] font-bold leading-none",
        scoreGoals: "text-[0.6875rem] font-extrabold",
        scoreVs: "text-[0.5rem] opacity-50",
        insight: "text-[0.5625rem] leading-tight",
        eventGlyph: "text-[0.5rem]",
        scoreWide: "hidden",
        scoreNarrow: "hidden",
        hideMiddleOnGrid: true,
        mosaicCompact: true,
      };
  }
}

/** Layout-aware type scale — grid tiles stay small; timeline/treemap can breathe. */
function heatmapType(density: HeatmapDensity, layout: HeatmapLayout, rank?: HeatmapRank) {
  const compact = density === "compact";

  if (layout === "mosaic" && rank) {
    return heatmapTypeMosaic(rank.tier, density);
  }

  if (layout === "grid") {
    return {
      league: "text-[0.625rem] font-semibold uppercase leading-none tracking-[0.06em]",
      minute: compact ? "text-[0.5625rem] leading-none" : "text-[0.625rem] leading-none",
      live: "text-[0.5625rem] font-semibold uppercase leading-none tracking-[0.1em]",
      score: compact ? "text-[0.6875rem] leading-tight" : "text-xs leading-tight",
      scoreGoals: "text-xs font-extrabold leading-none",
      scoreVs: "text-[0.5625rem] font-medium leading-none opacity-50",
      insight: "text-[0.625rem] leading-snug",
      eventRow: "leading-tight",
      eventGlyph: "text-[0.625rem]",
      scoreWide: "hidden",
      scoreNarrow: "flex flex-col gap-0.5",
      hideMiddleOnGrid: true,
      mosaicCompact: false,
    };
  }

  if (layout === "timeline") {
    return {
      league: "text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.06em]",
      minute: compact ? "text-xs leading-none" : "text-sm leading-none",
      live: "text-[0.625rem] font-semibold uppercase leading-none tracking-[0.1em]",
      score: "text-xs leading-snug",
      scoreGoals: compact ? "text-sm font-extrabold" : "text-base font-extrabold",
      scoreVs: "text-[0.625rem] font-medium opacity-50",
      insight: compact ? "text-[0.6875rem] leading-snug" : "text-xs leading-snug",
      eventRow: "leading-snug",
      eventGlyph: compact ? "text-[0.625rem]" : "text-[0.6875rem]",
      scoreWide: "flex items-center gap-1.5",
      scoreNarrow: "hidden",
      hideMiddleOnGrid: false,
      mosaicCompact: false,
    };
  }

  return {
    league: compact
      ? "text-[0.625rem] leading-tight tracking-[0.06em]"
      : "text-[0.6875rem] leading-tight tracking-[0.07em]",
    minute: compact ? "text-xs leading-none" : "text-sm leading-none",
    live: compact ? "text-[0.625rem] leading-none" : "text-[0.6875rem] leading-none",
    score: compact ? "text-xs leading-snug" : "text-[0.6875rem] leading-snug",
    scoreGoals: compact ? "text-xs font-extrabold" : "text-sm font-extrabold",
    scoreVs: compact ? "text-[0.625rem]" : "text-[0.6875rem]",
    insight: compact ? "text-[0.625rem] leading-snug" : "text-[0.6875rem] leading-snug",
    eventRow: "leading-snug",
    eventGlyph: compact ? "text-[0.625rem]" : "text-[0.6875rem]",
    scoreWide: compact ? "hidden @[8.5rem]:flex" : "hidden @[10rem]:flex",
    scoreNarrow: compact ? "flex flex-col gap-1 @[8.5rem]:hidden" : "flex flex-col gap-1 @[10rem]:hidden",
    hideMiddleOnGrid: false,
    mosaicCompact: false,
  };
}

function eventLyricsRowClass(
  total: number,
  index: number,
  density: HeatmapDensity,
  layout: HeatmapLayout,
) {
  if (layout === "grid" || layout === "mosaic") {
    const distanceFromLatest = total - 1 - index;
    if (distanceFromLatest === 0) return "text-[0.625rem] text-white/90";
    return "text-[0.5625rem] text-white/45";
  }

  const compact = density === "compact";
  const distanceFromLatest = total - 1 - index;

  if (distanceFromLatest === 0) {
    return compact ? "text-xs text-white/92" : "text-sm text-white/92";
  }
  if (distanceFromLatest === 1) {
    return compact ? "text-[0.6875rem] text-white/62" : "text-xs text-white/62";
  }
  if (distanceFromLatest === 2) {
    return compact ? "text-[0.6875rem] text-white/45" : "text-xs text-white/45";
  }
  return compact ? "text-[0.625rem] text-white/36" : "text-[0.6875rem] text-white/36";
}

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

type HeatmapScorelinePropsWithDensity = HeatmapScorelineProps & {
  density: HeatmapDensity;
  layout: HeatmapLayout;
  rank?: HeatmapRank;
};

function HeatmapScoreline({
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  homeGoals,
  awayGoals,
  homeState,
  awayState,
  density,
  layout,
  rank,
}: HeatmapScorelinePropsWithDensity) {
  const type = heatmapType(density, layout, rank);

  return (
    <div className="mt-auto flex min-h-[1.125rem] items-center pt-1.5">
      <MirrorMatchScoreline
        className="w-full"
        variant="heatmap"
        abbreviate
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeLogo={homeLogo}
        awayLogo={awayLogo}
        homeGoals={homeGoals}
        awayGoals={awayGoals}
        homeState={homeState}
        awayState={awayState}
        scoreClassName={cn(type.score, "font-bold tracking-tight leading-none")}
        homeGoalsClassName={cn(type.scoreGoals, "leading-none")}
        awayGoalsClassName={cn(type.scoreGoals, "leading-none")}
        homeNameClassName={cn(scoreSideClass(homeState, "label"), type.score, "leading-none")}
        awayNameClassName={cn(scoreSideClass(awayState, "label"), type.score, "leading-none")}
        homeLabelExtra={
          homeState === "leading" ? <LeadingDot label="Home leading" /> : null
        }
        awayLabelExtra={
          awayState === "leading" ? <LeadingDot label="Away leading" /> : null
        }
      />
    </div>
  );
}

function HeatmapInsight({
  match,
  density,
  layout,
  rank,
}: {
  match: LiveMatch;
  density: HeatmapDensity;
  layout: HeatmapLayout;
  rank?: HeatmapRank;
}) {
  const insight = matchMonitorInsight(match);
  if (!insight) return null;

  const type = heatmapType(density, layout, rank);

  return (
    <p
      className={cn(
        "max-w-full truncate text-center font-medium tracking-[0.02em] text-white/75",
        type.insight,
      )}
    >
      <span>{insight.lead}</span>
      {insight.tail ? (
        <>
          <span className="text-white/35"> · </span>
          <span className="text-white/82">{insight.tail}</span>
        </>
      ) : null}
    </p>
  );
}

function HeatmapEventLyrics({
  match,
  density,
  layout,
  rank,
}: {
  match: LiveMatch;
  density: HeatmapDensity;
  layout: HeatmapLayout;
  rank?: HeatmapRank;
}) {
  const events = matchEventStrip(match, 10);
  const latestRef = useRef<HTMLParagraphElement>(null);
  const type = heatmapType(density, layout, rank);
  const lyricsMaxHeight =
    layout === "grid" || (layout === "mosaic" && type.hideMiddleOnGrid)
      ? "max-h-[2.25rem]"
      : density === "compact"
        ? "max-h-[4rem]"
        : "max-h-[5rem]";

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    latestRef.current?.scrollIntoView({ block: "end", behavior: reduced ? "auto" : "smooth" });
  }, [events.length, match.id]);

  if (events.length === 0) return null;

  return (
    <div
      className={cn(
        "heatmap-event-lyrics-scroll w-full overflow-y-auto overscroll-contain px-1 py-0.5",
        lyricsMaxHeight,
      )}
    >
      <div className="flex flex-col items-center gap-0.5">
        {events.map((event, index) => (
          <p
            key={`${event.minute}-${event.type}-${event.team}-${index}`}
            ref={index === events.length - 1 ? latestRef : undefined}
            className={cn(
              "inline-flex max-w-full shrink-0 items-center justify-center gap-1 truncate font-medium tracking-[0.01em]",
              type.eventRow,
              eventLyricsRowClass(events.length, index, density, layout),
            )}
          >
            <span className={cn("shrink-0 leading-none", type.eventGlyph)} aria-hidden>
              {matchEventGlyph(event.type, event.detail)}
            </span>
            <span className="truncate">{matchEventLineLabel(event, match)}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function HeatmapMiddleBand({
  match,
  density,
  layout,
  rank,
}: {
  match: LiveMatch;
  density: HeatmapDensity;
  layout: HeatmapLayout;
  rank?: HeatmapRank;
}) {
  const type = heatmapType(density, layout, rank);
  const hasEvents = match.events.length > 0;
  const insight = matchMonitorInsight(match);

  if (type.hideMiddleOnGrid) {
    if (!insight) return <div className="min-h-0 flex-1" aria-hidden />;
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-0.5 py-0.5">
        <HeatmapInsight match={match} density={density} layout={layout} rank={rank} />
      </div>
    );
  }

  if (!hasEvents && !insight) {
    return <div className="min-h-0 flex-1" aria-hidden />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-0.5 py-0.5">
      {hasEvents ? (
        <HeatmapEventLyrics match={match} density={density} layout={layout} rank={rank} />
      ) : null}
      {insight && !hasEvents ? (
        <HeatmapInsight match={match} density={density} layout={layout} rank={rank} />
      ) : null}
    </div>
  );
}

type MosaicCompactFaceProps = {
  match: LiveMatch;
  minuteLabel: string;
  live: boolean;
  homeState: SideState;
  awayState: SideState;
  type: HeatmapTileType;
};

function MosaicCompactFace({
  match,
  minuteLabel,
  live,
  homeState,
  awayState,
  type,
}: MosaicCompactFaceProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-1.5">
        <LeagueIcon league={{ logo: match.leagueLogo, name: match.league }} size="xs" />
        <div className="min-w-0 text-right leading-none">
          <p className={cn("tabular-nums opacity-85", type.minute)}>{minuteLabel}</p>
          {live ? (
            <p className={cn("mt-0.5 uppercase opacity-90", type.live)}>Live</p>
          ) : null}
        </div>
      </div>

      <div className="mt-auto flex min-h-[1.125rem] items-center">
        <MirrorMatchScoreline
          className="w-full leading-none"
          variant="heatmap"
          abbreviate
          showLogos={false}
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
          homeLogo={match.homeLogo}
          awayLogo={match.awayLogo}
          homeGoals={match.homeGoals}
          awayGoals={match.awayGoals}
          homeState={homeState}
          awayState={awayState}
          scoreClassName={cn("min-w-0 justify-center font-bold tracking-tight leading-none", type.score)}
          homeGoalsClassName={cn(scoreSideClass(homeState, "goals"), type.scoreGoals, "leading-none")}
          awayGoalsClassName={cn(scoreSideClass(awayState, "goals"), type.scoreGoals, "leading-none")}
          homeNameClassName={cn(scoreSideClass(homeState, "label"), type.score, "leading-none")}
          awayNameClassName={cn(scoreSideClass(awayState, "label"), type.score, "leading-none")}
        />
      </div>
    </>
  );
}

function HeatmapCellHeader({
  match,
  type,
  minuteLabel,
  live,
  palette,
  layout,
}: {
  match: LiveMatch;
  type: HeatmapTileType;
  minuteLabel: string;
  live: boolean;
  palette: { accent: string };
  layout: HeatmapLayout;
}) {
  const leagueLabel = (
    <div className="flex min-w-0 flex-1 items-center gap-1 leading-none">
      <LeagueIcon
        league={{ logo: match.leagueLogo, name: match.league }}
        size="xs"
        className="shrink-0"
      />
      <p
        className={cn("min-w-0 truncate font-semibold uppercase leading-none", type.league)}
        style={{ color: palette.accent }}
      >
        {match.league}
      </p>
    </div>
  );

  if (layout === "grid") {
    return (
      <div className="flex items-center justify-between gap-1.5 leading-none">
        {leagueLabel}
        <div className="flex shrink-0 items-center gap-1">
          <p className={cn("font-semibold tabular-nums opacity-85", type.minute)}>{minuteLabel}</p>
          {live ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold uppercase opacity-90",
                type.live,
              )}
            >
              <span className="relative flex h-1 w-1 shrink-0" aria-hidden>
                <span className="absolute inset-0 animate-ping rounded-full bg-white/70" />
                <span className="relative m-auto h-1 w-1 rounded-full bg-white" />
              </span>
              Live
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5 pt-0.5">
        <LeagueIcon league={{ logo: match.leagueLogo, name: match.league }} size="xs" />
        <p
          className={cn("min-w-0 truncate font-semibold uppercase", type.league)}
          style={{ color: palette.accent }}
        >
          {match.league}
        </p>
      </div>

      <div className="shrink-0 text-right leading-none">
        <p className={cn("font-semibold tabular-nums tracking-tight opacity-85", type.minute)}>
          {minuteLabel}
        </p>
        {live ? (
          <p
            className={cn(
              "mt-0.5 flex items-center justify-end gap-1 font-semibold uppercase tracking-[0.1em] opacity-90",
              type.live,
            )}
          >
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span className="absolute inset-0 animate-ping rounded-full bg-white/70" />
              <span className="relative m-auto h-1 w-1 rounded-full bg-white" />
            </span>
            Live
          </p>
        ) : null}
      </div>
    </div>
  );
}

type MatchHeatmapCellProps = {
  item: MonitoredMatch;
  onRemove: (matchId: number) => void;
  density: HeatmapDensity;
  layout: HeatmapLayout;
  rank?: HeatmapRank;
  className?: string;
  style?: CSSProperties;
};

function MatchHeatmapCell({
  item,
  onRemove,
  density,
  layout,
  rank,
  className,
  style,
}: MatchHeatmapCellProps) {
  const { match } = item;
  const { locale, timeZone } = useUserPreferences();
  const palette = matchHeatStyle(match);
  const type = heatmapType(density, layout, rank);
  const live = isMatchLive(match);
  const sideState = live
    ? matchSideState(match.homeGoals, match.awayGoals)
    : { home: "draw" as const, away: "draw" as const };
  const minuteLabel = matchMinuteLabel(match, { locale, timeZone });

  const cellPadding =
    layout === "mosaic" && rank?.tier
      ? mosaicCellPadding(rank.tier, density)
      : cellSizeClass(density, layout);

  const cellClassName = cn(
    "@container group relative flex flex-col overflow-hidden rounded-[4px] transition-[filter,transform] duration-200 hover:brightness-110",
    cellPadding,
    className,
  );
  const cellStyle = {
    ...style,
    backgroundColor: palette.background,
    color: palette.foreground,
  };
  const cellTitle = `${match.homeTeam} ${match.homeGoals} – ${match.awayGoals} ${match.awayTeam}`;

  if (type.mosaicCompact) {
    return (
      <Link
        href={matchHref(match.id)}
        className={cn(cellClassName, "cursor-pointer")}
        style={cellStyle}
        title={cellTitle}
      >
        <MosaicCompactFace
          match={match}
          minuteLabel={minuteLabel}
          live={live}
          homeState={sideState.home}
          awayState={sideState.away}
          type={type}
        />
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemove(match.id);
          }}
          className="absolute bottom-1 right-1 z-10 rounded px-1 py-0.5 text-[0.625rem] leading-none text-white/70 opacity-0 transition-opacity hover:bg-white/15 hover:text-white group-hover:opacity-100"
          aria-label={`Remove ${match.homeTeam} vs ${match.awayTeam}`}
        >
          ×
        </button>
      </Link>
    );
  }

  return (
    <Link
      href={matchHref(match.id)}
      className={cn(cellClassName, "cursor-pointer")}
      style={cellStyle}
      title={cellTitle}
    >
      <HeatmapCellHeader
        match={match}
        type={type}
        minuteLabel={minuteLabel}
        live={live}
        palette={palette}
        layout={layout}
      />

      <HeatmapMiddleBand match={match} density={density} layout={layout} rank={rank} />

      <HeatmapScoreline
        homeTeam={match.homeTeam}
        awayTeam={match.awayTeam}
        homeLogo={match.homeLogo}
        awayLogo={match.awayLogo}
        homeGoals={match.homeGoals}
        awayGoals={match.awayGoals}
        homeState={sideState.home}
        awayState={sideState.away}
        density={density}
        layout={layout}
        rank={rank}
      />

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRemove(match.id);
        }}
        className="absolute bottom-1.5 right-1.5 z-10 rounded px-1 py-0.5 text-[0.625rem] leading-none text-white/70 opacity-0 transition-opacity hover:bg-white/15 hover:text-white group-hover:opacity-100"
        aria-label={`Remove ${match.homeTeam} vs ${match.awayTeam}`}
      >
        ×
      </button>
    </Link>
  );
}

function HeatmapLayoutToggle({
  prefs,
  onChange,
}: {
  prefs: HeatmapViewPrefs;
  onChange: (next: HeatmapViewPrefs) => void;
}) {
  const compact = prefs.density === "compact";

  return (
    <div
      className="flex items-center gap-1"
      role="toolbar"
      aria-label="Heat map layout"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center gap-0.5 rounded-full bg-white/[0.08] p-0.5 ring-1 ring-white/[0.06]">
        {LAYOUT_OPTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            title={label}
            aria-pressed={prefs.layout === id}
            onClick={() => onChange({ ...prefs, layout: id })}
            className={cn(
              "rounded-full p-1.5 transition-colors",
              prefs.layout === id
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/45 hover:bg-white/10 hover:text-white/80",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label={compact ? "Comfortable tile size" : "Compact tile size"}
        title={compact ? "Comfortable tiles" : "Compact tiles"}
        aria-pressed={compact}
        onClick={() =>
          onChange({
            ...prefs,
            density: compact ? "normal" : "compact",
          })
        }
        className={cn(
          "rounded-full p-1.5 transition-colors ring-1 ring-white/[0.06]",
          compact
            ? "bg-white/20 text-white"
            : "bg-white/[0.08] text-white/45 hover:bg-white/10 hover:text-white/80",
        )}
      >
        {compact ? (
          <Maximize2 className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Minimize2 className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>
    </div>
  );
}

function HeatmapLegend() {
  return (
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
  );
}

function TreemapLayout({
  items,
  density,
  onRemove,
}: {
  items: MonitoredMatch[];
  density: HeatmapDensity;
  onRemove: (matchId: number) => void;
}) {
  const groups = groupMatchesByLeague(items);

  return (
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
                density={density}
                layout="treemap"
                onRemove={onRemove}
                style={{ flex: `${matchHeatWeight(item.match)} 1 0%` }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function GridLayout({
  items,
  density,
  onRemove,
}: {
  items: MonitoredMatch[];
  density: HeatmapDensity;
  onRemove: (matchId: number) => void;
}) {
  const sorted = sortHeatmapItems(items);
  const minCol = density === "compact" ? "8.5rem" : "10.5rem";
  const rowHeight = density === "compact" ? "6.25rem" : "7.5rem";

  return (
    <div className="max-h-[min(720px,70vh)] overflow-auto overscroll-contain">
      <div
        className="grid gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${minCol}, 1fr))`,
          gridAutoRows: `minmax(${rowHeight}, auto)`,
        }}
      >
        {sorted.map((item) => (
          <MatchHeatmapCell
            key={item.match.id}
            item={item}
            density={density}
            layout="grid"
            onRemove={onRemove}
            className="h-full shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

function MosaicLayout({
  items,
  density,
  onRemove,
}: {
  items: MonitoredMatch[];
  density: HeatmapDensity;
  onRemove: (matchId: number) => void;
}) {
  const sorted = sortHeatmapItems(items);
  const columns = 12;
  const rowUnit = density === "compact" ? "2rem" : "2.25rem";

  return (
    <div className="max-h-[min(720px,70vh)] overflow-auto overscroll-contain">
      <div
        className="grid min-h-[min(420px,50vh)] grid-flow-dense gap-1"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridAutoRows: rowUnit,
        }}
      >
        {sorted.map((item, index) => {
          const placement = heatmapMosaicPlacement(index, sorted.length, density);

          return (
            <MatchHeatmapCell
              key={item.match.id}
              item={item}
              density={density}
              layout="mosaic"
              rank={{ index, total: sorted.length, tier: placement.tier }}
              onRemove={onRemove}
              className="h-full min-h-0 shrink-0"
              style={{
                gridColumn: `span ${placement.colSpan}`,
                gridRow: `span ${placement.rowSpan}`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function TimelineLayout({
  items,
  density,
  onRemove,
}: {
  items: MonitoredMatch[];
  density: HeatmapDensity;
  onRemove: (matchId: number) => void;
}) {
  const sorted = sortHeatmapItems(items);
  const maxWidth = density === "compact" ? "30rem" : "40rem";

  return (
    <div className="max-h-[min(720px,70vh)] overflow-auto overscroll-contain">
      <div className="mx-auto flex w-full flex-col gap-[3px]" style={{ maxWidth }}>
        {sorted.map((item) => (
          <MatchHeatmapCell
            key={item.match.id}
            item={item}
            density={density}
            layout="timeline"
            onRemove={onRemove}
            className="w-full shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

export function MatchHeatmapGrid({
  items,
  onRemove,
  fullWidth = false,
  emptySlot,
}: MatchHeatmapGridProps) {
  const [prefs, setPrefs] = useState<HeatmapViewPrefs>(() => readHeatmapViewPrefs());

  useEffect(() => {
    writeHeatmapViewPrefs(prefs);
  }, [prefs]);

  const updatePrefs = (next: HeatmapViewPrefs) => setPrefs(next);

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
        <div className="flex max-w-md flex-col items-center gap-4">
          <p className="text-[0.875rem] leading-relaxed text-neutral-500">
            Add fixtures with Quick add or search above. Your watchlist appears here as a live
            heat map.
          </p>
          {emptySlot}
        </div>
      </div>
    );
  }

  const scrollable = prefs.layout !== "treemap";

  return (
    <div
      className={cn(
        "bg-[#161a22] p-[3px]",
        scrollable ? "" : "overflow-hidden",
        fullWidth
          ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "rounded-xl border border-black/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
      )}
      role="grid"
      aria-label="Match monitor heat map"
    >
      <div className="flex items-center justify-end gap-2 px-1 pb-1.5 pt-0.5">
        <HeatmapLayoutToggle prefs={prefs} onChange={updatePrefs} />
      </div>

      {prefs.layout === "treemap" ? (
        <TreemapLayout items={items} density={prefs.density} onRemove={onRemove} />
      ) : null}
      {prefs.layout === "grid" ? (
        <GridLayout items={items} density={prefs.density} onRemove={onRemove} />
      ) : null}
      {prefs.layout === "mosaic" ? (
        <MosaicLayout items={items} density={prefs.density} onRemove={onRemove} />
      ) : null}
      {prefs.layout === "timeline" ? (
        <TimelineLayout items={items} density={prefs.density} onRemove={onRemove} />
      ) : null}

      <HeatmapLegend />
    </div>
  );
}
