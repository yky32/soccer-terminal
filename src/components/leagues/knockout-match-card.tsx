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
  displayKnockoutWinKind,
  groupKnockoutIntoTies,
  isKnockoutMatchFinished,
  knockoutLegWinKind,
  knockoutLegWinner,
  type KnockoutMatchAggregateHint,
  type KnockoutWinKind,
} from "@/lib/football/knockout-match-result";
import { knockoutTeamShortName } from "@/lib/football/knockout-team-name";
import { cn } from "@/lib/utils";

const WINNER_ROW_CLASS: Record<KnockoutWinKind, string> = {
  regulation: "bg-emerald-500/12 ring-1 ring-emerald-500/20",
  "draw-decided": "bg-orange-500/12 ring-1 ring-orange-500/20",
};

const WINNER_NAME_CLASS: Record<KnockoutWinKind, string> = {
  regulation: "font-semibold text-emerald-950",
  "draw-decided": "font-semibold text-orange-950",
};

const WINNER_SCORE_CLASS: Record<KnockoutWinKind, string> = {
  regulation: "text-emerald-900",
  "draw-decided": "text-orange-900",
};

const ADVANCE_BADGE_CLASS: Record<KnockoutWinKind, string> = {
  regulation: "bg-emerald-500/12 text-emerald-900 ring-emerald-500/20",
  "draw-decided": "bg-orange-500/12 text-orange-950 ring-orange-500/20",
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

  return (
    <div
      className={cn(
        "rounded-lg border border-black/[0.06] bg-white/30 p-1",
        aggregate && aggregate.winKind === "regulation" && "ring-1 ring-emerald-500/25",
        aggregate && aggregate.winKind === "draw-decided" && "ring-1 ring-orange-500/25",
      )}
    >
      {aggregate ? (
        <KnockoutAdvanceBadge
          team={aggregate.winnerTeam}
          logo={aggregate.winnerLogo}
          shortTeamNames={shortTeamNames}
          winKind={aggregate.winKind}
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
            aggregateWinKind={aggregate?.winKind ?? null}
            roundAggregate={roundAggregateByMatchId?.get(leg.id) ?? null}
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
  winKind,
}: {
  team: string;
  logo: string | null;
  shortTeamNames: boolean;
  winKind: KnockoutWinKind;
}) {
  const label = shortTeamNames ? knockoutTeamShortName(team) : team;
  const advLabel = winKind === "draw-decided" ? "Adv (p)" : "Adv";

  return (
    <div
      className={cn(
        "mb-1 flex items-center justify-center gap-1 rounded-md px-1.5 py-0.5 ring-1 ring-inset",
        ADVANCE_BADGE_CLASS[winKind],
      )}
      title={winKind === "draw-decided" ? `${team} advance on penalties` : `${team} advance`}
    >
      <FootballLogo src={logo} label={team} size="xs" />
      <span className="truncate text-[0.5625rem] font-semibold">{label}</span>
      <span className="shrink-0 text-[0.5rem] font-bold uppercase tracking-[0.06em] opacity-90">
        {advLabel}
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
  const displayCardWinKind = displayKnockoutWinKind(match, cardWinKind);

  return (
    <div
      className={cn(
        leaguesGlassInset,
        knockoutMatchCardClass(stage, wide ? "w-full" : undefined),
        "p-1.5",
        stage === "default" && !compact && "border border-black/[0.06]",
        compact && stage === "default" && "border-0 bg-transparent shadow-none ring-0",
        finished && displayCardWinKind === "regulation" && "ring-1 ring-emerald-500/15",
        finished && displayCardWinKind === "draw-decided" && "ring-1 ring-orange-500/15",
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
            ? kickoff.toLocaleDateString([], { month: "short", day: "numeric" })
            : "TBD"}
      </p>
    </div>
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
    return displayKnockoutWinKind(match, tieAggregateWinKind);
  }

  const side = teamName === match.homeTeam ? "home" : "away";
  if (legWinnerSide === side) {
    return displayKnockoutWinKind(match, legWinKind);
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
        winnerKind && WINNER_ROW_CLASS[winnerKind],
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
