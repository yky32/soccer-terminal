"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { FootballLogo } from "@/components/overview/football-logo";
import {
  knockoutMatchCardClass,
  type KnockoutStage,
} from "@/components/leagues/knockout-stage-styles";
import { leaguesGlassInset } from "@/components/leagues/leagues-glass";
import type { LeagueKnockoutMatch } from "@/lib/data/league-profile";
import {
  computeKnockoutAggregate,
  getKnockoutTieSummary,
  groupKnockoutIntoTies,
  isKnockoutMatchFinished,
  knockoutLegWinKind,
  knockoutLegWinner,
  type KnockoutMatchAggregateHint,
  type KnockoutWinKind,
} from "@/lib/football/knockout-match-result";
import { knockoutTeamShortName } from "@/lib/football/knockout-team-name";
import { fixtureDetailHref } from "@/lib/match-paths";
import { useFormatDateTime } from "@/lib/use-format-date-time";
import { cn } from "@/lib/utils";

function KnockoutMatchDetailLink({
  match,
  className,
  children,
}: {
  match: LeagueKnockoutMatch;
  className?: string;
  children: ReactNode;
}) {
  const href = fixtureDetailHref(match);

  if (!href) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Link
      href={href}
      className={cn("block cursor-pointer transition-opacity hover:opacity-95", className)}
    >
      {children}
    </Link>
  );
}

const WINNER_NAME_CLASS: Record<KnockoutWinKind, string> = {
  regulation: "font-semibold text-emerald-950",
  "draw-decided": "font-semibold text-orange-950",
};

const WINNER_SCORE_CLASS: Record<KnockoutWinKind, string> = {
  regulation: "text-emerald-900",
  "draw-decided": "text-orange-900",
};

type KnockoutMatchCardProps = {
  match: LeagueKnockoutMatch;
  align: "left" | "right" | "center";
  stage?: KnockoutStage;
  wide?: boolean;
  compact?: boolean;
  shortTeamNames?: boolean;
  /** Highlight winner when this team advanced on aggregate (two-legged tie). */
  aggregateWinnerTeam?: string | null;
  aggregateWinKind?: KnockoutWinKind | null;
};

export function KnockoutBracketMatchGroup({
  matches,
  align,
  shortTeamNames = false,
  stage = "default",
  wide = false,
  compact = false,
  roundAggregateByMatchId,
}: {
  matches: LeagueKnockoutMatch[];
  align: "left" | "right" | "center";
  shortTeamNames?: boolean;
  stage?: KnockoutStage;
  wide?: boolean;
  compact?: boolean;
  /** Full-round aggregate hints (legs may sit in different bracket columns). */
  roundAggregateByMatchId?: Map<string, KnockoutMatchAggregateHint>;
}) {
  const ties = groupKnockoutIntoTies(matches);

  return (
    <>
      {ties.map((legs) =>
        legs.length > 1 ? (
          <KnockoutTieCard
            key={`${legs[0].id}-${legs[legs.length - 1].id}`}
            legs={legs}
            align={align}
            shortTeamNames={shortTeamNames}
            stage={stage}
            wide={wide}
            compact={compact}
            roundAggregateByMatchId={roundAggregateByMatchId}
          />
        ) : (
          <KnockoutMatchCard
            key={legs[0].id}
            match={legs[0]}
            align={align}
            shortTeamNames={shortTeamNames}
            stage={stage}
            wide={wide}
            compact={compact}
            roundAggregate={roundAggregateByMatchId?.get(legs[0].id) ?? null}
          />
        ),
      )}
    </>
  );
}

function KnockoutTieCard({
  legs,
  align,
  shortTeamNames = false,
  stage,
  wide,
  compact,
  roundAggregateByMatchId,
}: {
  legs: LeagueKnockoutMatch[];
  align: "left" | "right" | "center";
  shortTeamNames?: boolean;
  stage?: KnockoutStage;
  wide?: boolean;
  compact?: boolean;
  roundAggregateByMatchId?: Map<string, KnockoutMatchAggregateHint>;
}) {
  const [expanded, setExpanded] = useState(false);
  const summary = getKnockoutTieSummary(legs);
  const localAggregate = computeKnockoutAggregate(legs);
  const roundAggregate = roundAggregateByMatchId?.get(legs[0].id) ?? null;
  const aggregate =
    localAggregate ??
    (roundAggregate
      ? {
          winnerTeam: roundAggregate.winnerTeam,
          winnerLogo: roundAggregate.winnerLogo,
          winKind: roundAggregate.winKind,
        }
      : null);

  const shellClass = "rounded-lg border border-black/[0.06] bg-white/35 shadow-sm";

  if (!summary) {
    return (
      <div className={cn(shellClass, "p-1")}>
        <div className="space-y-1">
          {legs.map((leg, index) => (
            <KnockoutMatchCard
              key={leg.id}
              match={leg}
              align={align}
              shortTeamNames={shortTeamNames}
              stage={stage}
              wide={wide}
              compact={compact || index > 0}
              aggregateWinnerTeam={aggregate?.winnerTeam ?? null}
              aggregateWinKind={aggregate?.winKind ?? null}
              roundAggregate={roundAggregateByMatchId?.get(leg.id) ?? null}
              legLabel={`Leg ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!expanded) {
    return (
      <div className={cn(shellClass, "p-1")} aria-expanded={false}>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full cursor-pointer rounded-md text-left transition-colors hover:bg-black/[0.04]"
          aria-label="Show all legs for this tie"
        >
          <KnockoutTieSummaryCard
            summary={summary}
            align={align}
            shortTeamNames={shortTeamNames}
            stage={stage}
            wide={wide}
            expanded={false}
          />
        </button>
      </div>
    );
  }

  return (
    <div className={cn(shellClass, "p-1")}>
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="mb-1 flex w-full items-center justify-between gap-1 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-black/[0.03]"
        aria-expanded={true}
        aria-label="Show aggregate score only"
      >
        {summary ? (
          <span className="text-[0.5rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            Agg {summary.goalsA}–{summary.goalsB}
          </span>
        ) : (
          <span className="text-[0.5rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            2 legs
          </span>
        )}
        <ChevronDown className="h-3 w-3 shrink-0 rotate-180 text-neutral-400" aria-hidden />
      </button>
      <div className="space-y-1">
        {legs.map((leg, index) => (
          <KnockoutMatchCard
            key={leg.id}
            match={leg}
            align={align}
            shortTeamNames={shortTeamNames}
            stage={stage}
            wide={wide}
            compact={compact || index > 0}
            aggregateWinnerTeam={aggregate?.winnerTeam ?? null}
            aggregateWinKind={aggregate?.winKind ?? null}
            roundAggregate={roundAggregateByMatchId?.get(leg.id) ?? null}
            legLabel={`Leg ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function KnockoutTieSummaryCard({
  summary,
  align,
  shortTeamNames,
  stage = "default",
  wide,
  expanded,
}: {
  summary: NonNullable<ReturnType<typeof getKnockoutTieSummary>>;
  align: "left" | "right" | "center";
  shortTeamNames: boolean;
  stage?: KnockoutStage;
  wide?: boolean;
  expanded: boolean;
}) {
  const showScore = summary.legsFinished > 0;
  const finished = summary.legsFinished >= summary.legsTotal && !summary.hasLiveLeg;

  return (
    <div
      className={cn(
        leaguesGlassInset,
        knockoutMatchCardClass(stage, wide ? "w-full" : undefined),
        "p-1.5",
        stage === "default" && "border border-black/[0.06]",
      )}
    >
      <div className="mb-0.5 flex items-center justify-between gap-1 px-0.5">
        <p className="text-[0.5rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          {summary.legsFinished === 0
            ? "2 legs"
            : summary.legsFinished < summary.legsTotal
              ? `Agg · ${summary.legsFinished}/${summary.legsTotal} played`
              : "Agg · 2 legs"}
        </p>
        <ChevronDown
          className={cn(
            "h-3 w-3 shrink-0 text-neutral-400 transition-transform",
            expanded && "rotate-180",
          )}
          aria-hidden
        />
      </div>
      <KnockoutTeamLine
        name={summary.teamA}
        logo={summary.logoA}
        goals={showScore ? summary.goalsA : null}
        finished={showScore}
        align={align}
        shortTeamNames={shortTeamNames}
        isWinner={finished && summary.winnerTeam === summary.teamA}
        isLoser={finished && summary.winnerTeam !== null && summary.winnerTeam !== summary.teamA}
        winKind={finished && summary.winnerTeam === summary.teamA ? summary.winKind : null}
        undecided={showScore && !summary.winnerTeam}
      />
      <KnockoutTeamLine
        name={summary.teamB}
        logo={summary.logoB}
        goals={showScore ? summary.goalsB : null}
        finished={showScore}
        align={align}
        shortTeamNames={shortTeamNames}
        isWinner={finished && summary.winnerTeam === summary.teamB}
        isLoser={finished && summary.winnerTeam !== null && summary.winnerTeam !== summary.teamB}
        winKind={finished && summary.winnerTeam === summary.teamB ? summary.winKind : null}
        undecided={showScore && !summary.winnerTeam}
      />
      {summary.hasLiveLeg ? (
        <p className="mt-1.5 text-center text-[0.625rem] font-medium text-emerald-700">Live</p>
      ) : null}
    </div>
  );
}

export function KnockoutMatchCard({
  match,
  align,
  stage = "default",
  wide = false,
  compact = false,
  shortTeamNames = false,
  aggregateWinnerTeam = null,
  aggregateWinKind = null,
  roundAggregate = null,
  legLabel,
}: KnockoutMatchCardProps & {
  legLabel?: string;
  roundAggregate?: KnockoutMatchAggregateHint | null;
}) {
  const finished = isKnockoutMatchFinished(match.status);
  const live = match.status === "1H" || match.status === "2H" || match.status === "HT";
  const kickoff = match.kickoffAt ? new Date(match.kickoffAt) : null;
  const legWinnerSide = knockoutLegWinner(match);
  const legWinKind = knockoutLegWinKind(match);
  const tieAggregateWinner = aggregateWinnerTeam ?? roundAggregate?.winnerTeam ?? null;
  const tieAggregateWinKind = aggregateWinKind ?? roundAggregate?.winKind ?? null;
  const cardWinKind = tieAggregateWinner ? tieAggregateWinKind : legWinKind;
  const { formatDateShort } = useFormatDateTime();

  return (
    <KnockoutMatchDetailLink
      match={match}
      className={cn(
        leaguesGlassInset,
        knockoutMatchCardClass(stage, wide ? "w-full" : undefined),
        "p-1.5",
        stage === "default" && !compact && "border border-black/[0.06]",
        compact && stage === "default" && "border-0 bg-transparent shadow-none ring-0",
      )}
    >
      {legLabel ? (
        <p className="mb-0.5 text-center text-[0.5rem] font-semibold uppercase tracking-[0.08em] text-neutral-400">
          {legLabel}
        </p>
      ) : null}
      <KnockoutTeamLine
        name={match.homeTeam}
        logo={match.homeLogo}
        goals={match.homeGoals}
        finished={finished}
        align={align}
        shortTeamNames={shortTeamNames}
        isWinner={
          tieAggregateWinner
            ? match.homeTeam === tieAggregateWinner
            : legWinnerSide === "home"
        }
        isLoser={
          tieAggregateWinner
            ? match.homeTeam !== tieAggregateWinner && finished
            : legWinnerSide === "away"
        }
        winKind={resolveKnockoutLineWinKind({
          match,
          teamName: match.homeTeam,
          tieAggregateWinner,
          tieAggregateWinKind,
          legWinnerSide,
          legWinKind,
        })}
        undecided={finished && !legWinnerSide && !tieAggregateWinner}
      />
      <KnockoutTeamLine
        name={match.awayTeam}
        logo={match.awayLogo}
        goals={match.awayGoals}
        finished={finished}
        align={align}
        shortTeamNames={shortTeamNames}
        isWinner={
          tieAggregateWinner
            ? match.awayTeam === tieAggregateWinner
            : legWinnerSide === "away"
        }
        isLoser={
          tieAggregateWinner
            ? match.awayTeam !== tieAggregateWinner && finished
            : legWinnerSide === "home"
        }
        winKind={resolveKnockoutLineWinKind({
          match,
          teamName: match.awayTeam,
          tieAggregateWinner,
          tieAggregateWinKind,
          legWinnerSide,
          legWinKind,
        })}
        undecided={finished && !legWinnerSide && !tieAggregateWinner}
      />
      <p
        className={cn(
          "mt-1.5 text-center text-[0.625rem] font-medium tabular-nums",
          live ? "text-emerald-700" : "text-neutral-500",
        )}
      >
        {live
          ? "Live"
          : kickoff
            ? formatDateShort(kickoff.toISOString())
            : "TBD"}
      </p>
    </KnockoutMatchDetailLink>
  );
}

function resolveKnockoutLineWinKind({
  match,
  teamName,
  tieAggregateWinner,
  tieAggregateWinKind,
  legWinnerSide,
  legWinKind,
}: {
  match: LeagueKnockoutMatch;
  teamName: string;
  tieAggregateWinner: string | null;
  tieAggregateWinKind: KnockoutWinKind | null;
  legWinnerSide: "home" | "away" | null;
  legWinKind: KnockoutWinKind | null;
}) {
  if (tieAggregateWinner && teamName === tieAggregateWinner) {
    return tieAggregateWinKind;
  }

  const side = teamName === match.homeTeam ? "home" : "away";
  if (legWinnerSide === side) {
    return legWinKind;
  }

  return null;
}

function KnockoutTeamLine({
  name,
  logo,
  goals,
  finished,
  align,
  shortTeamNames,
  isWinner,
  isLoser,
  winKind,
  undecided,
}: {
  name: string;
  logo: string | null;
  goals: number | null;
  finished: boolean;
  align: "left" | "right" | "center";
  shortTeamNames: boolean;
  isWinner: boolean;
  isLoser: boolean;
  winKind: KnockoutWinKind | null;
  undecided: boolean;
}) {
  const displayName = shortTeamNames ? knockoutTeamShortName(name) : name;
  const winnerKind = isWinner && winKind ? winKind : null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md px-0.5 py-0.5",
        align === "right" && "flex-row-reverse",
        align === "center" && "justify-between",
        isLoser && "opacity-45",
        undecided && "opacity-80",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-1",
          align === "right" && "flex-row-reverse",
        )}
      >
        <FootballLogo src={logo} label={name} size="xs" />
        <span
          title={displayName !== name ? name : undefined}
          className={cn(
            "truncate text-[0.6875rem] font-medium leading-tight",
            winnerKind ? WINNER_NAME_CLASS[winnerKind] : "text-neutral-700",
          )}
        >
          {displayName}
        </span>
      </div>
      <span
        className={cn(
          "shrink-0 text-[0.6875rem] font-bold tabular-nums",
          finished
            ? winnerKind
              ? WINNER_SCORE_CLASS[winnerKind]
              : "text-neutral-600"
            : "text-neutral-400",
        )}
      >
        {finished && goals !== null ? goals : "–"}
      </span>
    </div>
  );
}
