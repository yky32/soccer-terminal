"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Star } from "lucide-react";
import { AssistIcon } from "@/components/icons/assist-icon";
import { CaptainIcon } from "@/components/icons/captain-icon";
import { FootballIcon } from "@/components/icons/football-icon";
import { ShirtIcon } from "@/components/icons/shirt-icon";
import { PlayerAvatar } from "@/components/players/player-avatar";
import type { MatchDetailPlayer } from "@/lib/data/match-detail";
import type { LineupPlayerHighlight } from "@/lib/football/lineup-player-highlights";
import { shortPlayerName } from "@/lib/football/lineup-pitch-layout";
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

function lineupEventBadgeClasses(size: "default" | "pitch") {
  return {
    icon:
      size === "pitch"
        ? "h-[clamp(0.875rem,4.25cqw,1.25rem)] w-[clamp(0.875rem,4.25cqw,1.25rem)]"
        : "h-4 w-4",
    count:
      size === "pitch"
        ? "text-[clamp(0.625rem,2.85cqw,0.8125rem)] font-bold tabular-nums leading-none"
        : "text-[0.6875rem] font-bold tabular-nums leading-none",
    wrap: "inline-flex items-center gap-0.5 text-neutral-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]",
  };
}

function LineupEventCountBadge({
  count,
  size,
  title,
  icon,
}: {
  count: number;
  size: "default" | "pitch";
  title: string;
  icon: ReactNode;
}) {
  const classes = lineupEventBadgeClasses(size);

  return (
    <span title={title} className={classes.wrap}>
      {icon}
      {count > 1 ? <span className={classes.count}>{count}</span> : null}
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

  const iconClass = lineupEventBadgeClasses(size).icon;

  return (
    <LineupEventCountBadge
      count={goals}
      size={size}
      title={`${goals} goal${goals > 1 ? "s" : ""}`}
      icon={<FootballIcon className={iconClass} />}
    />
  );
}

export function LineupAssistBadge({
  assists,
  size = "default",
}: {
  assists: number;
  size?: "default" | "pitch";
}) {
  if (assists <= 0) return null;

  const iconClass = lineupEventBadgeClasses(size).icon;

  return (
    <LineupEventCountBadge
      count={assists}
      size={size}
      title={`${assists} assist${assists > 1 ? "s" : ""}`}
      icon={<AssistIcon className={iconClass} />}
    />
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

const PITCH_BUBBLE =
  "flex items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.07]";
const PITCH_BUBBLE_SIZE =
  "size-[clamp(0.875rem,3.85cqw,1.125rem)]";
const PITCH_EVENT_ICON =
  "h-[clamp(0.5rem,2.35cqw,0.6875rem)] w-[clamp(0.5rem,2.35cqw,0.6875rem)]";
const PITCH_STACK_STEP_X = "0.58cqw";
const PITCH_STACK_STEP_Y = "0.52cqw";

function PitchEventBubble({
  children,
  className,
  style,
  title,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}) {
  return (
    <span
      title={title}
      style={style}
      className={cn(PITCH_BUBBLE, PITCH_BUBBLE_SIZE, className)}
    >
      {children}
    </span>
  );
}

function PitchStackedEventIcons({
  count,
  title,
  renderIcon,
}: {
  count: number;
  title: string;
  renderIcon: () => ReactNode;
}) {
  if (count <= 0) return null;

  const layers = Math.min(count, 3);
  const frameClass =
    layers === 1
      ? "h-[clamp(0.875rem,3.85cqw,1.125rem)] w-[clamp(0.875rem,3.85cqw,1.125rem)]"
      : layers === 2
        ? "h-[clamp(1.125rem,4.4cqw,1.375rem)] w-[clamp(1.125rem,4.48cqw,1.375rem)]"
        : "h-[clamp(1.25rem,4.95cqw,1.55rem)] w-[clamp(1.25rem,5.1cqw,1.55rem)]";

  return (
    <div className={cn("relative", frameClass)} title={`${count} ${title}${count > 1 ? "s" : ""}`}>
      {Array.from({ length: layers }, (_, index) => (
        <PitchEventBubble
          key={index}
          className="absolute top-0 left-0"
          style={{
            transform: `translate(calc(${index} * ${PITCH_STACK_STEP_X}), calc(${index} * ${PITCH_STACK_STEP_Y}))`,
            zIndex: index + 1,
          }}
        >
          {renderIcon()}
        </PitchEventBubble>
      ))}
      {count > 3 ? (
        <span className="absolute -right-[0.1cqw] -top-[0.1cqw] z-[4] flex min-h-[0.75rem] min-w-[0.75rem] items-center justify-center rounded-full bg-neutral-900 px-[0.2cqw] text-[clamp(0.4375rem,1.75cqw,0.5625rem)] font-bold leading-none text-white">
          {count}
        </span>
      ) : null}
    </div>
  );
}

function PitchCardBubble({ kind }: { kind: "yellow" | "red" }) {
  return (
    <PitchEventBubble title={kind === "red" ? "Red card" : "Yellow card"}>
      <CardIcon kind={kind} />
    </PitchEventBubble>
  );
}

function PitchRatingBadge({
  rating,
  topRating,
  worstRating,
}: {
  rating: string;
  topRating: boolean;
  worstRating: boolean;
}) {
  return (
    <span
      title={`Rating ${rating}${topRating ? " · Top rating" : worstRating ? " · Lowest rating" : ""}`}
      className={cn(
        "inline-flex items-center gap-[0.15cqw] rounded-full px-[0.5cqw] py-[0.12cqw] text-[clamp(0.5rem,2.15cqw,0.625rem)] font-bold tabular-nums leading-none text-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] ring-1 ring-black/[0.08]",
        topRating && "bg-amber-500",
        worstRating && "bg-rose-500",
        !topRating && !worstRating && "bg-sky-600",
      )}
    >
      {rating}
      {topRating ? (
        <Star className="h-[0.72em] w-[0.72em] fill-white stroke-white" aria-hidden />
      ) : null}
      {worstRating ? (
        <ArrowDown className="h-[0.72em] w-[0.72em] stroke-[2.5] text-white" aria-hidden />
      ) : null}
    </span>
  );
}

/** Formation pitch only — corner badges with stacked goal/assist icons. */
export function LineupPitchAvatarOverlays({
  player,
  highlight,
}: {
  player: MatchDetailPlayer;
  highlight: LineupPlayerHighlight;
}) {
  const goals = player.goals ?? 0;
  const assists = player.assists ?? 0;
  const yellow = player.yellowCards ?? 0;
  const red = player.redCards ?? 0;
  const hasCards = yellow > 0 || red > 0;
  const hasEvents = goals > 0 || assists > 0 || hasCards || Boolean(player.rating?.trim());

  if (!hasEvents) return null;

  return (
    <>
      {goals > 0 ? (
        <div className="pointer-events-none absolute -left-[0.38cqw] -top-[0.38cqw] z-[2]">
          <PitchStackedEventIcons
            count={goals}
            title="goal"
            renderIcon={() => <FootballIcon className={cn(PITCH_EVENT_ICON, "text-neutral-950")} />}
          />
        </div>
      ) : null}

      {hasCards ? (
        <div className="pointer-events-none absolute -top-[0.28cqw] -right-[0.28cqw] z-[2] flex flex-col items-end gap-[0.14cqw]">
          {red > 0 ? <PitchCardBubble kind="red" /> : null}
          {yellow > 0 ? <PitchCardBubble kind="yellow" /> : null}
        </div>
      ) : null}

      {assists > 0 ? (
        <div className="pointer-events-none absolute -bottom-[0.38cqw] -left-[0.38cqw] z-[2]">
          <PitchStackedEventIcons
            count={assists}
            title="assist"
            renderIcon={() => <AssistIcon className={cn(PITCH_EVENT_ICON, "text-neutral-950")} />}
          />
        </div>
      ) : null}

      {player.rating ? (
        <div className="pointer-events-none absolute -bottom-[0.28cqw] -right-[0.28cqw] z-[2]">
          <PitchRatingBadge
            rating={player.rating}
            topRating={highlight.topRating}
            worstRating={highlight.worstRating}
          />
        </div>
      ) : null}
    </>
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

export function LineupPlayerName({
  name,
  captain = false,
  className,
  nameClassName,
  captainSize = "sm",
  align = "start",
}: {
  name: string;
  captain?: boolean;
  className?: string;
  nameClassName?: string;
  captainSize?: "xs" | "sm" | "pitch";
  align?: "start" | "center";
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 max-w-full items-center gap-0.5",
        align === "center" && "justify-center",
        className,
      )}
    >
      <span className={cn("truncate", nameClassName)}>{name}</span>
      {captain ? <CaptainIcon size={captainSize} /> : null}
    </span>
  );
}

export const LINEUP_PITCH_AVATAR_CLASS =
  "!size-[10.5cqw] !min-h-7 !min-w-7 shadow-sm";

export const LINEUP_COMPACT_AVATAR_CLASS =
  "!h-7 !w-7 !min-h-7 !min-w-7 shadow-sm";

const LINEUP_PIN_NAME_CLASS =
  "max-w-full truncate text-center text-[clamp(0.5625rem,2.5cqw,0.75rem)] font-semibold leading-tight text-neutral-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]";

const LINEUP_COMPACT_PIN_NAME_CLASS =
  "mt-0.5 max-w-[4.75rem] truncate text-center text-[0.625rem] font-semibold leading-tight text-neutral-900";

/** Matches formation pitch player pin — avatar stack with name below. */
export function LineupCoachPin({
  name,
  photo,
  className,
  compact = true,
}: {
  name: string;
  photo: string | null;
  className?: string;
  compact?: boolean;
}) {
  const label = shortPlayerName(name);

  return (
    <div
      className={cn("flex shrink-0 flex-col items-center", className)}
      title={name}
    >
      <div className="relative">
        <PlayerAvatar
          src={photo}
          name={name}
          className={compact ? LINEUP_COMPACT_AVATAR_CLASS : LINEUP_PITCH_AVATAR_CLASS}
        />
      </div>
      <p className={compact ? LINEUP_COMPACT_PIN_NAME_CLASS : cn("mt-[0.35cqw]", LINEUP_PIN_NAME_CLASS)}>
        {label}
      </p>
    </div>
  );
}

export function PlayerKitNumber({
  number,
  side = "neutral",
  size = "default",
  className,
}: {
  number: number | string;
  side?: "home" | "away" | "neutral";
  size?: "default" | "pitch";
  className?: string;
}) {
  const colorClass =
    side === "home"
      ? "text-emerald-800"
      : side === "away"
        ? "text-sky-800"
        : "text-neutral-500";

  const iconClass =
    size === "pitch"
      ? "h-[clamp(0.5rem,2.1cqw,0.6875rem)] w-[clamp(0.5rem,2.1cqw,0.6875rem)]"
      : "h-3 w-3";

  const textClass =
    size === "pitch"
      ? "text-[clamp(0.5rem,2.1cqw,0.6875rem)] font-bold"
      : "text-[0.6875rem] font-medium";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 tabular-nums",
        colorClass,
        textClass,
        className,
      )}
    >
      <ShirtIcon className={iconClass} />
      {number}
    </span>
  );
}

export function lineupRatingClass(highlight: LineupPlayerHighlight, onPitch = false) {
  if (!highlight.topRating) return onPitch ? "ring-white" : "";
  return onPitch
    ? "ring-2 ring-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.35)]"
    : "ring-2 ring-amber-400/80";
}
