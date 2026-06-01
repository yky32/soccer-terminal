"use client";

import { FootballLogo } from "@/components/overview/football-logo";
import {
  knockoutMatchCardClass,
  type KnockoutStage,
} from "@/components/leagues/knockout-stage-styles";
import { leaguesGlassInset } from "@/components/leagues/leagues-glass";
import type { LeagueKnockoutMatch } from "@/lib/data/league-profile";
import {
  computeKnockoutAggregate,
  groupKnockoutIntoTies,
  isKnockoutMatchFinished,
  knockoutLegWinner,
} from "@/lib/football/knockout-match-result";
import { knockoutTeamShortName } from "@/lib/football/knockout-team-name";
import { cn } from "@/lib/utils";

type KnockoutMatchCardProps = {
  match: LeagueKnockoutMatch;
  align: "left" | "right" | "center";
  stage?: KnockoutStage;
  wide?: boolean;
  compact?: boolean;
  shortTeamNames?: boolean;
  /** Highlight winner when this team advanced on aggregate (two-legged tie). */
  aggregateWinnerTeam?: string | null;
};

export function KnockoutBracketMatchGroup({
  matches,
  align,
  shortTeamNames = false,
  stage = "default",
  wide = false,
  compact = false,
}: {
  matches: LeagueKnockoutMatch[];
  align: "left" | "right" | "center";
  shortTeamNames?: boolean;
  stage?: KnockoutStage;
  wide?: boolean;
  compact?: boolean;
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
}: {
  legs: LeagueKnockoutMatch[];
  align: "left" | "right" | "center";
  shortTeamNames?: boolean;
  stage?: KnockoutStage;
  wide?: boolean;
  compact?: boolean;
}) {
  const aggregate = computeKnockoutAggregate(legs);

  return (
    <div
      className={cn(
        "rounded-lg border border-black/[0.06] bg-white/30 p-1",
        aggregate && "ring-1 ring-emerald-500/25",
      )}
    >
      {aggregate ? (
        <KnockoutAdvanceBadge
          team={aggregate.winnerTeam}
          logo={aggregate.winnerLogo}
          shortTeamNames={shortTeamNames}
        />
      ) : null}
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
            legLabel={legs.length > 1 ? `Leg ${index + 1}` : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function KnockoutAdvanceBadge({
  team,
  logo,
  shortTeamNames,
}: {
  team: string;
  logo: string | null;
  shortTeamNames: boolean;
}) {
  const label = shortTeamNames ? knockoutTeamShortName(team) : team;

  return (
    <div
      className="mb-1 flex items-center justify-center gap-1 rounded-md bg-emerald-500/12 px-1.5 py-0.5"
      title={`${team} advance`}
    >
      <FootballLogo src={logo} label={team} size="xs" />
      <span className="truncate text-[0.5625rem] font-semibold text-emerald-900">{label}</span>
      <span className="shrink-0 text-[0.5rem] font-bold uppercase tracking-[0.06em] text-emerald-800">
        Adv
      </span>
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
  legLabel,
}: KnockoutMatchCardProps & { legLabel?: string }) {
  const finished = isKnockoutMatchFinished(match.status);
  const live = match.status === "1H" || match.status === "2H" || match.status === "HT";
  const kickoff = match.kickoffAt ? new Date(match.kickoffAt) : null;
  const legWinnerSide = knockoutLegWinner(match);

  return (
    <div
      className={cn(
        leaguesGlassInset,
        knockoutMatchCardClass(stage, wide ? "w-full" : undefined),
        "p-1.5",
        stage === "default" && !compact && "border border-black/[0.06]",
        compact && stage === "default" && "border-0 bg-transparent shadow-none ring-0",
        finished && legWinnerSide && "ring-1 ring-emerald-500/15",
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
          aggregateWinnerTeam
            ? match.homeTeam === aggregateWinnerTeam
            : legWinnerSide === "home"
        }
        isLoser={
          aggregateWinnerTeam
            ? match.homeTeam !== aggregateWinnerTeam && finished
            : legWinnerSide === "away"
        }
        undecided={finished && !legWinnerSide && !aggregateWinnerTeam}
      />
      <KnockoutTeamLine
        name={match.awayTeam}
        logo={match.awayLogo}
        goals={match.awayGoals}
        finished={finished}
        align={align}
        shortTeamNames={shortTeamNames}
        isWinner={
          aggregateWinnerTeam
            ? match.awayTeam === aggregateWinnerTeam
            : legWinnerSide === "away"
        }
        isLoser={
          aggregateWinnerTeam
            ? match.awayTeam !== aggregateWinnerTeam && finished
            : legWinnerSide === "home"
        }
        undecided={finished && !legWinnerSide && !aggregateWinnerTeam}
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
            ? kickoff.toLocaleDateString([], { month: "short", day: "numeric" })
            : "TBD"}
      </p>
    </div>
  );
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
  undecided: boolean;
}) {
  const displayName = shortTeamNames ? knockoutTeamShortName(name) : name;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md px-0.5 py-0.5",
        align === "right" && "flex-row-reverse",
        align === "center" && "justify-between",
        isWinner && "bg-emerald-500/12 ring-1 ring-emerald-500/20",
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
            isWinner ? "font-semibold text-emerald-950" : "text-neutral-700",
          )}
        >
          {displayName}
        </span>
      </div>
      <span
        className={cn(
          "shrink-0 text-[0.6875rem] font-bold tabular-nums",
          finished ? (isWinner ? "text-emerald-900" : "text-neutral-600") : "text-neutral-400",
        )}
      >
        {finished && goals !== null ? goals : "–"}
      </span>
    </div>
  );
}
