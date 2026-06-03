import type { ReactNode } from "react";
import { FootballLogo } from "@/components/overview/football-logo";
import type { TeamSideState } from "@/components/matches/match-detail-score";
import { teamAbbrev } from "@/lib/match-monitor";
import { cn } from "@/lib/utils";

export type MirrorMatchScorelineVariant = "hero" | "default" | "compact" | "heatmap";

function sideNameClass(state: TeamSideState, variant: MirrorMatchScorelineVariant) {
  if (variant === "heatmap") {
    return cn(
      "truncate leading-none",
      state === "leading" && "font-semibold text-white",
      state === "losing" && "font-medium text-white/45",
      state === "draw" && "font-semibold text-white/80",
      state === "neutral" && "font-semibold text-white/80",
    );
  }

  return cn(
    "truncate leading-tight",
    variant === "hero" && "text-[clamp(0.875rem,2.2vw,1.125rem)]",
    variant === "default" && "text-[0.8125rem]",
    variant === "compact" && "text-xs font-medium",
    state === "leading" && "font-semibold text-neutral-950",
    state === "losing" && "font-medium text-neutral-400",
    state === "draw" && "font-semibold text-neutral-950",
    state === "neutral" && "font-semibold text-neutral-950",
  );
}

function sideGoalClass(state: TeamSideState, variant: MirrorMatchScorelineVariant) {
  if (variant === "heatmap") {
    return cn(
      "tabular-nums leading-none",
      state === "leading" && "font-extrabold text-white",
      state === "losing" && "font-bold text-white/40",
      state === "draw" && "font-extrabold text-white/85",
      state === "neutral" && "font-extrabold text-white/85",
    );
  }

  return cn(
    "tabular-nums",
    state === "leading" && "text-emerald-800",
    state === "losing" && "text-neutral-400",
    state === "draw" && "text-neutral-950",
    state === "neutral" && "text-neutral-950",
  );
}

function sideLogoClass(state: TeamSideState, variant: MirrorMatchScorelineVariant) {
  if (variant === "heatmap") return "shrink-0 self-center opacity-95";

  return cn(
    "shrink-0 rounded-full ring-1",
    variant === "hero" && "!h-10 !w-10 sm:!h-11 sm:!w-11",
    variant === "default" && "!h-6 !w-6",
    variant === "compact" && "",
    state === "leading" && "ring-emerald-300/70",
    state === "losing" && "opacity-80 ring-black/[0.06]",
    (state === "draw" || state === "neutral") && "ring-black/[0.08]",
  );
}

function logoSize(variant: MirrorMatchScorelineVariant): "xs" | "sm" | "md" | "lg" {
  switch (variant) {
    case "hero":
      return "lg";
    case "default":
      return "sm";
    case "compact":
      return "md";
    case "heatmap":
      return "xs";
  }
}

export type MirrorMatchScorelineProps = {
  homeTeam: string;
  awayTeam: string;
  homeLogo: string | null;
  awayLogo: string | null;
  homeGoals?: number;
  awayGoals?: number;
  upcoming?: boolean;
  homeState?: TeamSideState;
  awayState?: TeamSideState;
  variant?: MirrorMatchScorelineVariant;
  abbreviate?: boolean;
  showLogos?: boolean;
  className?: string;
  centerContent?: ReactNode;
  homeLabelExtra?: ReactNode;
  awayLabelExtra?: ReactNode;
  homeNameClassName?: string;
  awayNameClassName?: string;
  homeGoalsClassName?: string;
  awayGoalsClassName?: string;
  scoreClassName?: string;
  dashClassName?: string;
};

export function MirrorMatchScoreline({
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  homeGoals = 0,
  awayGoals = 0,
  upcoming = false,
  homeState = "neutral",
  awayState = "neutral",
  variant = "default",
  abbreviate = false,
  showLogos = true,
  className,
  centerContent,
  homeLabelExtra,
  awayLabelExtra,
  homeNameClassName,
  awayNameClassName,
  homeGoalsClassName,
  awayGoalsClassName,
  scoreClassName,
  dashClassName,
}: MirrorMatchScorelineProps) {
  const homeLabel = abbreviate ? teamAbbrev(homeTeam) : homeTeam;
  const awayLabel = abbreviate ? teamAbbrev(awayTeam) : awayTeam;
  const size = logoSize(variant);

  const defaultScore = upcoming ? (
    <span
      className={cn(
        "font-bold tracking-tight",
        variant === "hero" && "text-[1.75rem] text-sky-800",
        variant === "compact" && "text-[10px] font-bold text-sky-900",
        variant === "default" && "text-[0.8125rem] font-bold text-sky-800",
        scoreClassName,
      )}
    >
      vs
    </span>
  ) : (
    <span
      className={cn(
        "inline-flex items-center tabular-nums",
        variant === "hero" && "gap-x-3 text-[clamp(2rem,5vw,2.75rem)] font-bold tracking-tight sm:gap-x-4",
        variant === "default" && "gap-x-2 text-[0.8125rem] font-bold",
        variant === "compact" && "gap-x-1 text-[11px] font-bold leading-none",
        variant === "heatmap" && "gap-x-0.5 leading-none items-center",
        scoreClassName,
      )}
    >
      <span className={cn(sideGoalClass(homeState, variant), homeGoalsClassName)}>{homeGoals}</span>
      <span
        className={cn(
          "font-normal leading-none",
          variant === "heatmap" ? "px-0.5 font-semibold text-white/35" : "text-neutral-400",
          variant === "hero" && "text-neutral-300",
          variant === "compact" && "text-[11px] font-medium text-neutral-400",
          dashClassName,
        )}
      >
        –
      </span>
      <span className={cn(sideGoalClass(awayState, variant), awayGoalsClassName)}>{awayGoals}</span>
    </span>
  );

  const sideGap =
    variant === "hero" ? "gap-2.5 sm:gap-3" : variant === "heatmap" ? "gap-1" : "gap-2";

  return (
    <div
      className={cn(
        "flex min-w-0 items-center",
        variant === "hero" ? "gap-x-3 sm:gap-x-4" : variant === "heatmap" ? "gap-1.5 leading-none" : "gap-2.5",
        className,
      )}
    >
      <div className={cn("flex min-w-0 flex-1 items-center justify-end self-center", sideGap)}>
        <span
          className={cn(
            sideNameClass(homeState, variant),
            variant === "hero" && "text-right",
            variant === "heatmap" && "inline-flex items-center gap-0.5",
            homeNameClassName,
          )}
        >
          {homeLabel}
          {homeLabelExtra}
        </span>
        {showLogos ? (
          <FootballLogo
            src={homeLogo}
            label={homeTeam}
            size={size}
            className={sideLogoClass(homeState, variant)}
          />
        ) : null}
      </div>

      <div className="flex shrink-0 items-center self-center">{centerContent ?? defaultScore}</div>

      <div className={cn("flex min-w-0 flex-1 items-center justify-start self-center", sideGap)}>
        {showLogos ? (
          <FootballLogo
            src={awayLogo}
            label={awayTeam}
            size={size}
            className={sideLogoClass(awayState, variant)}
          />
        ) : null}
        <span
          className={cn(
            sideNameClass(awayState, variant),
            variant === "heatmap" && "inline-flex items-center gap-0.5",
            awayNameClassName,
          )}
        >
          {awayLabelExtra}
          {awayLabel}
        </span>
      </div>
    </div>
  );
}
