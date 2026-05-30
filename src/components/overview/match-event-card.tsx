import { FootballLogo } from "@/components/overview/football-logo";
import type { LiveMatch } from "@/lib/data/live-match";
import type { MapMatchMode } from "@/lib/data/map-match-mode";
import { getMatchPinColor } from "@/lib/football/match-pin-colors";
import { glass, glassInset } from "@/components/glass-surface";
import { cn } from "@/lib/utils";

type MatchEventCardProps = {
  match: LiveMatch;
  matchMode?: MapMatchMode;
  compact?: boolean;
  colorIndex?: number;
};

function kickoffLabel(kickoffAt: string | null) {
  if (!kickoffAt) return "TBD";

  const date = new Date(kickoffAt);
  return date.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function kickoffShort(kickoffAt: string | null) {
  if (!kickoffAt) return "TBD";

  const date = new Date(kickoffAt);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function liveLabel(match: LiveMatch) {
  if (match.elapsed !== null && match.elapsed !== undefined) {
    return `${match.elapsed}'`;
  }
  return match.statusShort;
}

function showHalftime(match: LiveMatch) {
  if (match.halftimeHome === null || match.halftimeAway === null) return false;
  return ["2H", "HT", "ET", "BT", "P"].includes(match.statusShort);
}

function matchSideState(homeGoals: number, awayGoals: number) {
  if (homeGoals > awayGoals) {
    return { home: "leading" as const, away: "losing" as const };
  }
  if (awayGoals > homeGoals) {
    return { home: "losing" as const, away: "leading" as const };
  }
  return { home: "draw" as const, away: "draw" as const };
}

function TeamSideLabel({
  name,
  align,
  state,
}: {
  name: string;
  align: "left" | "right";
  state: "leading" | "losing" | "draw";
}) {
  return (
    <span
      className={cn(
        "min-w-0 truncate rounded px-1.5 py-0.5 text-xs leading-snug transition-colors",
        align === "right" && "text-right",
        state === "leading" &&
          "bg-emerald-50 font-semibold text-emerald-800 ring-1 ring-emerald-200/80",
        state === "losing" && "font-normal text-neutral-400",
        state === "draw" && "font-medium text-neutral-800",
      )}
    >
      {name}
    </span>
  );
}

function ScoreValue({
  goals,
  state,
}: {
  goals: number;
  state: "leading" | "losing" | "draw";
}) {
  return (
    <span
      className={cn(
        "text-sm font-bold tabular-nums leading-none",
        state === "leading" && "text-emerald-800",
        state === "losing" && "text-neutral-400",
        state === "draw" && "text-neutral-900",
      )}
    >
      {goals}
    </span>
  );
}

function TeamRow({
  name,
  logo,
  goals,
  state,
}: {
  name: string;
  logo: string | null;
  goals: number;
  state: "leading" | "losing" | "draw";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded px-1 py-0.5",
        state === "leading" && "bg-emerald-50/90 ring-1 ring-emerald-200/70",
      )}
    >
      <FootballLogo src={logo} label={name} size="md" />
      <p
        className={cn(
          "min-w-0 flex-1 truncate text-[10px] leading-tight",
          state === "leading" && "font-semibold text-emerald-800",
          state === "losing" && "font-normal text-neutral-400",
          state === "draw" && "font-semibold text-neutral-900",
        )}
      >
        {name}
      </p>
      <ScoreValue goals={goals} state={state} />
    </div>
  );
}

export function MatchEventCard({
  match,
  matchMode = "live",
  compact = false,
  colorIndex,
}: MatchEventCardProps) {
  const isFuture = matchMode === "future";
  const sideState = isFuture
    ? { home: "draw" as const, away: "draw" as const }
    : matchSideState(match.homeGoals, match.awayGoals);
  const pinColor =
    colorIndex !== undefined ? getMatchPinColor(colorIndex).hex : undefined;

  if (!compact) {
    return (
      <article
        className="border border-neutral-300/80 bg-white px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
        style={pinColor ? { borderLeftWidth: 3, borderLeftColor: pinColor } : undefined}
      >
        <MatchCardHeader match={match} matchMode={matchMode} />
        {isFuture ? (
          <CompactFutureMatchupRow match={match} />
        ) : (
          <div className="mt-2 space-y-1">
            <TeamRow
              name={match.homeTeam}
              logo={match.homeLogo}
              goals={match.homeGoals}
              state={sideState.home}
            />
            <TeamRow
              name={match.awayTeam}
              logo={match.awayLogo}
              goals={match.awayGoals}
              state={sideState.away}
            />
          </div>
        )}
        <MatchCardFooter match={match} matchMode={matchMode} />
      </article>
    );
  }

  return (
    <article
      className={cn(glass, "overflow-hidden")}
      style={pinColor ? { borderLeftWidth: 3, borderLeftColor: pinColor } : undefined}
    >
      <MatchCardHeader match={match} matchMode={matchMode} compact />
      {isFuture ? (
        <CompactFutureMatchupRow match={match} />
      ) : (
        <CompactMatchupRow match={match} sideState={sideState} />
      )}
      <MatchCardFooter match={match} matchMode={matchMode} compact />
    </article>
  );
}

function CompactFutureMatchupRow({ match }: { match: LiveMatch }) {
  return (
    <div className="flex items-center gap-2 px-3 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <FootballLogo src={match.homeLogo} label={match.homeTeam} size="md" />
        <span className="min-w-0 truncate text-xs font-medium leading-snug text-neutral-800">
          {match.homeTeam}
        </span>
      </div>

      <div className="shrink-0 rounded-md bg-sky-50 px-2 py-1.5 text-center ring-1 ring-sky-200/70">
        <p className="text-[10px] font-bold leading-none text-sky-900">vs</p>
        <p className="mt-0.5 text-[10px] font-semibold leading-none text-sky-800">
          {kickoffShort(match.kickoffAt)}
        </p>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <span className="min-w-0 truncate text-right text-xs font-medium leading-snug text-neutral-800">
          {match.awayTeam}
        </span>
        <FootballLogo src={match.awayLogo} label={match.awayTeam} size="md" />
      </div>
    </div>
  );
}

function CompactMatchupRow({
  match,
  sideState,
}: {
  match: LiveMatch;
  sideState: ReturnType<typeof matchSideState>;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <FootballLogo src={match.homeLogo} label={match.homeTeam} size="md" />
        <TeamSideLabel name={match.homeTeam} align="left" state={sideState.home} />
      </div>

      <div className="flex shrink-0 items-center gap-1 rounded-md bg-neutral-100 px-2.5 py-1.5">
        <ScoreValue goals={match.homeGoals} state={sideState.home} />
        <span className="text-[11px] font-medium leading-none text-neutral-400">vs</span>
        <ScoreValue goals={match.awayGoals} state={sideState.away} />
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <TeamSideLabel name={match.awayTeam} align="right" state={sideState.away} />
        <FootballLogo src={match.awayLogo} label={match.awayTeam} size="md" />
      </div>
    </div>
  );
}

function MatchCardHeader({
  match,
  matchMode = "live",
  compact = false,
}: {
  match: LiveMatch;
  matchMode?: MapMatchMode;
  compact?: boolean;
}) {
  const isFuture = matchMode === "future";

  return (
    <div
      className={cn(
        "border-b border-black/[0.06]",
        compact ? "px-3 py-2.5" : "px-2 py-1.5",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-sm font-bold uppercase tracking-[0.12em]",
            compact ? "px-2 py-0.5 text-[10px]" : "px-1.5 py-0.5 text-[8px]",
            isFuture
              ? "bg-sky-600/10 text-sky-800"
              : "bg-emerald-600/10 text-emerald-800",
          )}
        >
          {!isFuture ? (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden />
          ) : null}
          {isFuture ? "Upcoming" : "Live"}
        </span>
        <span
          className={cn(
            "font-bold tabular-nums text-neutral-600",
            compact ? "text-xs" : "text-[10px] text-neutral-700",
          )}
          title={isFuture ? kickoffLabel(match.kickoffAt) : match.statusLong}
        >
          {isFuture ? kickoffShort(match.kickoffAt) : liveLabel(match)}
        </span>
      </div>

      <div className={cn("flex items-start gap-2", compact ? "mt-2" : "mt-1.5")}>
        <FootballLogo
          src={match.leagueLogo}
          label={match.league}
          size={compact ? "md" : "sm"}
          className="mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate font-semibold leading-snug text-neutral-800",
              compact ? "text-xs" : "text-[10px] leading-tight",
            )}
          >
            {match.league}
          </p>
          {match.leagueRound ? (
            <p
              className={cn(
                "truncate text-neutral-500",
                compact ? "mt-0.5 text-[11px] leading-snug" : "text-[9px]",
              )}
            >
              {match.leagueRound}
            </p>
          ) : null}
        </div>
        {match.countryFlag ? (
          <FootballLogo
            src={match.countryFlag}
            label={match.country}
            size="sm"
            className="mt-0.5 rounded-sm object-cover"
          />
        ) : null}
      </div>
    </div>
  );
}

function MatchCardFooter({
  match,
  matchMode = "live",
  compact = false,
}: {
  match: LiveMatch;
  matchMode?: MapMatchMode;
  compact?: boolean;
}) {
  const hasHalftime = matchMode === "live" && showHalftime(match);
  const hasVenue = Boolean(match.venue);

  if (!hasHalftime && !hasVenue) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-black/[0.06] text-neutral-500",
        compact ? "px-3 py-2 text-[11px] leading-relaxed" : "px-2 py-1 text-[9px]",
      )}
    >
      {hasHalftime ? (
        <span className="tabular-nums">
          HT {match.halftimeHome}–{match.halftimeAway}
        </span>
      ) : null}
      {hasHalftime && hasVenue ? <span className="text-neutral-300">·</span> : null}
      {hasVenue ? <span className="min-w-0 truncate">{match.venue}</span> : null}
    </div>
  );
}
