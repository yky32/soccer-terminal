"use client";

import { KnockoutBracketScaler } from "@/components/leagues/knockout-bracket-scaler";
import { LeagueKnockoutSchedule } from "@/components/leagues/league-knockout-schedule";
import {
  KNOCKOUT_STAGE_META,
  knockoutRoundHeaderClass,
  knockoutRoundShellClass,
  type KnockoutStage,
} from "@/components/leagues/knockout-stage-styles";
import {
  leaguesGlass,
  leaguesGlassStrong,
} from "@/components/leagues/leagues-glass";
import type {
  LeagueKnockoutBracket,
  LeagueKnockoutMatch,
  LeagueKnockoutRound,
  LeagueProfile,
} from "@/lib/data/league-profile";
import { KnockoutBracketMatchGroup, KnockoutMatchCard } from "@/components/leagues/knockout-match-card";
import { useKnockoutShortTeamNames } from "@/lib/football/knockout-team-name";
import { cn } from "@/lib/utils";

type LeagueKnockoutPanelProps = {
  league: LeagueProfile;
  bracket: LeagueKnockoutBracket;
};

export function LeagueKnockoutPanel({ league, bracket }: LeagueKnockoutPanelProps) {
  if (!bracket.published || bracket.rounds.length === 0) {
    return (
      <div className="space-y-4">
        <section className={leaguesGlassStrong}>
          <header className="border-b border-black/[0.06] px-4 py-4 sm:px-5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              {league.shortName} · {league.season}
            </p>
            <h2 className="mt-0.5 text-[clamp(1.25rem,2.5vw,1.625rem)] font-semibold tracking-[-0.03em] text-neutral-950">
              Knockout stage
            </h2>
            <p className="mt-2 max-w-prose text-[0.875rem] leading-relaxed text-neutral-600">
              Official knockout schedule — teams fill in as fixtures are drawn and played.
              {league.id === "world-cup"
                ? " Dates follow the confirmed FIFA calendar."
                : " Layout follows the standard UEFA knockout format."}
            </p>
          </header>
          <div className="border-t border-black/[0.06] px-2 py-4 sm:px-3">
            <LeagueKnockoutSchedule
              leagueId={league.id}
              leagueLogo={league.logo}
              shortName={league.shortName}
              seasonLabel={league.season}
            />
          </div>
        </section>
      </div>
    );
  }

  const r32 = bracket.rounds.find((round) => round.label === "Round of 32");
  const r16 = bracket.rounds.find((round) => round.label === "Round of 16");
  const qf = bracket.rounds.find((round) => round.label === "Quarter-finals");
  const sf = bracket.rounds.find((round) => round.label === "Semi-finals");
  const bronze = bracket.rounds.find((round) => round.label === "3rd Place Final");
  const final = bracket.rounds.find((round) => round.label === "Final");

  const outerRound = r32 ?? r16;
  const leftOuter = splitHalf(outerRound?.matches ?? [], "left");
  const rightOuter = splitHalf(outerRound?.matches ?? [], "right");
  const leftInner = r32 ? splitHalf(r16?.matches ?? [], "left") : [];
  const rightInner = r32 ? splitHalf(r16?.matches ?? [], "right") : [];
  const leftQf = splitHalf(qf?.matches ?? [], "left");
  const rightQf = splitHalf(qf?.matches ?? [], "right");
  const leftSf = splitHalf(sf?.matches ?? [], "left");
  const rightSf = splitHalf(sf?.matches ?? [], "right");
  const shortTeamNames = useKnockoutShortTeamNames(league.id);

  return (
    <div className="space-y-4">
      <section className={leaguesGlassStrong}>
        <header className="border-b border-black/[0.06] px-4 py-4 sm:px-5">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            {league.shortName} · {league.season}
          </p>
          <h2 className="mt-0.5 text-[clamp(1.25rem,2.5vw,1.625rem)] font-semibold tracking-[-0.03em] text-neutral-950">
            Knockout bracket
          </h2>
        </header>

        <div className="hidden p-3 sm:p-4 md:block">
          <KnockoutBracketScaler>
            <div className="flex items-stretch justify-center gap-0.5">
              {r32 ? (
                <BracketColumn
                  label="Round of 32"
                  matches={leftOuter}
                  align="left"
                  shortTeamNames={shortTeamNames}
                />
              ) : null}
              {r32 ? (
                <BracketColumn
                  label="Round of 16"
                  matches={leftInner}
                  align="left"
                  shortTeamNames={shortTeamNames}
                />
              ) : (
                <BracketColumn
                  label="Round of 16"
                  matches={leftOuter}
                  align="left"
                  shortTeamNames={shortTeamNames}
                />
              )}
              <BracketColumn
                label="Quarter-finals"
                matches={leftQf}
                align="left"
                shortTeamNames={shortTeamNames}
              />
              <BracketColumn
                label="Semi-finals"
                matches={leftSf}
                align="left"
                shortTeamNames={shortTeamNames}
              />
              <BracketCenter bronze={bronze} final={final} shortTeamNames={shortTeamNames} />
              <BracketColumn
                label="Semi-finals"
                matches={rightSf}
                align="right"
                shortTeamNames={shortTeamNames}
              />
              <BracketColumn
                label="Quarter-finals"
                matches={rightQf}
                align="right"
                shortTeamNames={shortTeamNames}
              />
              {r32 ? (
                <BracketColumn
                  label="Round of 16"
                  matches={rightInner}
                  align="right"
                  shortTeamNames={shortTeamNames}
                />
              ) : (
                <BracketColumn
                  label="Round of 16"
                  matches={rightOuter}
                  align="right"
                  shortTeamNames={shortTeamNames}
                />
              )}
              {r32 ? (
                <BracketColumn
                  label="Round of 32"
                  matches={rightOuter}
                  align="right"
                  shortTeamNames={shortTeamNames}
                />
              ) : null}
            </div>
          </KnockoutBracketScaler>
        </div>

        <div className="space-y-4 p-4 md:hidden sm:p-5">
          {bracket.rounds.map((round) => (
            <MobileRound key={round.id} round={round} shortTeamNames={shortTeamNames} />
          ))}
        </div>
      </section>
    </div>
  );
}

function splitHalf(matches: LeagueKnockoutMatch[], side: "left" | "right") {
  const midpoint = Math.ceil(matches.length / 2);
  if (side === "left") return matches.slice(0, midpoint);
  return matches.slice(midpoint);
}

function BracketColumn({
  label,
  matches,
  align,
  shortTeamNames,
}: {
  label: string;
  matches: LeagueKnockoutMatch[];
  align: "left" | "right";
  shortTeamNames: boolean;
}) {
  return (
    <div className="flex w-[7.75rem] shrink-0 flex-col">
      <p className="mb-1 truncate text-center text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
        {label}
      </p>
      <div className="flex flex-1 flex-col justify-around gap-1">
        <KnockoutBracketMatchGroup
          matches={matches}
          align={align}
          shortTeamNames={shortTeamNames}
        />
      </div>
    </div>
  );
}

function BracketCenter({
  bronze,
  final,
  shortTeamNames,
}: {
  bronze?: LeagueKnockoutRound;
  final?: LeagueKnockoutRound;
  shortTeamNames: boolean;
}) {
  return (
    <div className="flex w-[8.5rem] shrink-0 flex-col items-stretch justify-center px-0.5">
      {bronze?.matches[0] ? (
        <LiveFinaleStageBlock
          stage="bronze"
          match={bronze.matches[0]}
          shortTeamNames={shortTeamNames}
        />
      ) : null}
      {bronze?.matches[0] && final?.matches[0] ? (
        <div className="mx-2 my-1.5 h-px bg-black/[0.08]" />
      ) : null}
      {final?.matches[0] ? (
        <LiveFinaleStageBlock
          stage="final"
          match={final.matches[0]}
          shortTeamNames={shortTeamNames}
        />
      ) : null}
    </div>
  );
}

function LiveFinaleStageBlock({
  stage,
  match,
  shortTeamNames,
}: {
  stage: Exclude<KnockoutStage, "default">;
  match: LeagueKnockoutMatch;
  shortTeamNames: boolean;
}) {
  const meta = KNOCKOUT_STAGE_META[stage];
  const Icon = meta.Icon;

  return (
    <div className={knockoutRoundShellClass(stage)}>
      <div
        className={cn(
          "flex items-center justify-center px-1.5 py-1.5",
          stage === "bronze" ? "bg-orange-500/10" : "bg-amber-500/15",
        )}
      >
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[0.5625rem] font-bold uppercase tracking-[0.1em] ring-1 ring-inset",
            meta.badgeClass,
          )}
        >
          <Icon className="h-2.5 w-2.5 shrink-0" aria-hidden />
          {meta.label}
        </span>
      </div>
      <div className="p-1.5">
        <KnockoutMatchCard
          match={match}
          align="center"
          stage={stage}
          wide
          shortTeamNames={shortTeamNames}
        />
      </div>
    </div>
  );
}

function roundStage(label: string): KnockoutStage {
  if (/3rd place|bronze/i.test(label)) return "bronze";
  if (/^final$/i.test(label.trim())) return "final";
  return "default";
}

function MobileRound({
  round,
  shortTeamNames,
}: {
  round: LeagueKnockoutRound;
  shortTeamNames: boolean;
}) {
  const stage = roundStage(round.label);
  const meta = stage === "bronze" || stage === "final" ? KNOCKOUT_STAGE_META[stage] : null;
  const Icon = meta?.Icon;

  return (
    <div className={cn(leaguesGlass, knockoutRoundShellClass(stage))}>
      <p className={cn(knockoutRoundHeaderClass(stage), "px-4 py-2.5")}>
        {Icon ? (
          <span className="inline-flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {round.label}
          </span>
        ) : (
          round.label
        )}
      </p>
      <ul className="divide-y divide-black/[0.06]">
        {round.matches.map((match) => (
          <li key={match.id} className="px-3 py-2">
            <KnockoutBracketMatchGroup
              matches={[match]}
              align="left"
              stage={stage}
              wide={stage !== "default"}
              shortTeamNames={shortTeamNames}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
