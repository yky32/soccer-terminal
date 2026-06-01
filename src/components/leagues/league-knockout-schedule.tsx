"use client";

import type { ReactNode } from "react";
import { FootballLogo } from "@/components/overview/football-logo";
import { KnockoutBracketScaler } from "@/components/leagues/knockout-bracket-scaler";
import {
  KNOCKOUT_STAGE_META,
  knockoutMatchCardClass,
  knockoutRoundHeaderClass,
  knockoutRoundShellClass,
  type KnockoutStage,
} from "@/components/leagues/knockout-stage-styles";
import { leaguesGlassInset } from "@/components/leagues/leagues-glass";
import {
  formatKnockoutMatchDate,
  getKnockoutScheduleSlot,
  getWorldCup2026KnockoutLayout,
  WORLD_CUP_2026_KNOCKOUT_ROUNDS_MOBILE,
  type KnockoutScheduleSlot,
} from "@/lib/football/world-cup-2026-knockout-schedule";
import { cupLayoutForLeague, type CupKnockoutSide } from "@/lib/football/knockout-cup-layout";
import { cn } from "@/lib/utils";

type LeagueKnockoutScheduleProps = {
  leagueId: string;
  seasonLabel: string;
  shortName: string;
  leagueLogo?: string | null;
};

export function LeagueKnockoutSchedule({
  leagueId,
  seasonLabel,
  shortName,
  leagueLogo,
}: LeagueKnockoutScheduleProps) {
  if (leagueId === "world-cup") {
    const layout = getWorldCup2026KnockoutLayout();

    return (
      <KnockoutScheduleShell
        seasonLabel={seasonLabel}
        shortName={shortName}
        desktop={
          <KnockoutBracketScaler>
            <div className="flex items-stretch justify-center gap-0.5 px-1">
              <WorldCupBracketSide side={layout.left} align="left" />
              <WorldCupBracketCenter
                bronze={layout.bronze}
                final={layout.final}
                leagueLogo={leagueLogo}
              />
              <WorldCupBracketSide side={layout.right} align="right" />
            </div>
          </KnockoutBracketScaler>
        }
        mobile={
          <>
            {WORLD_CUP_2026_KNOCKOUT_ROUNDS_MOBILE.map((round) => (
              <MobileBracketRound
                key={round.title}
                title={round.title}
                slots={
                  round.ids
                    .map((id) => getKnockoutScheduleSlot(id))
                    .filter(Boolean) as KnockoutScheduleSlot[]
                }
                stage={"stage" in round ? round.stage : "default"}
              />
            ))}
          </>
        }
      />
    );
  }

  if (leagueId === "ucl" || leagueId === "uel") {
    const layout = cupLayoutForLeague(leagueId);

    const hasR32 = layout.left.roundOf32.length > 0;

    return (
      <KnockoutScheduleShell
        seasonLabel={seasonLabel}
        shortName={shortName}
        desktop={
          <KnockoutBracketScaler>
            <div className="flex items-stretch justify-center gap-0.5 px-1">
              <CupBracketSide side={layout.left} align="left" />
              <CupBracketCenter final={layout.final} leagueLogo={leagueLogo} shortName={shortName} />
              <CupBracketSide side={layout.right} align="right" />
            </div>
          </KnockoutBracketScaler>
        }
        mobile={
          <>
            {hasR32 ? (
              <MobileBracketRound
                title="Round of 32"
                slots={[...layout.left.roundOf32, ...layout.right.roundOf32]}
              />
            ) : null}
            <MobileBracketRound
              title="Round of 16"
              slots={[...layout.left.roundOf16, ...layout.right.roundOf16]}
            />
            <MobileBracketRound
              title="Quarter-finals"
              slots={[...layout.left.quarterFinals, ...layout.right.quarterFinals]}
            />
            <MobileBracketRound
              title="Semi-finals"
              slots={[layout.left.semiFinal, layout.right.semiFinal]}
            />
            <MobileBracketRound title="Final" slots={[layout.final]} stage="final" />
          </>
        }
      />
    );
  }

  return <KnockoutScheduleUnavailable seasonLabel={seasonLabel} shortName={shortName} />;
}

function KnockoutScheduleShell({
  desktop,
  mobile,
  seasonLabel,
  shortName,
}: {
  desktop: ReactNode;
  mobile: ReactNode;
  seasonLabel: string;
  shortName: string;
}) {
  return (
    <div className="space-y-3" aria-label="Knockout bracket schedule">
      <div className="hidden md:block">{desktop}</div>
      <div className="space-y-2 md:hidden">{mobile}</div>
      <p className="text-center text-[0.6875rem] text-neutral-400">
        {shortName} · {seasonLabel}
      </p>
    </div>
  );
}

function KnockoutScheduleUnavailable({
  seasonLabel,
  shortName,
}: {
  seasonLabel: string;
  shortName: string;
}) {
  return (
    <p className="py-8 text-center text-[0.875rem] text-neutral-500">
      Knockout schedule for {shortName} ({seasonLabel}) is not available yet.
    </p>
  );
}

type SideLayout = ReturnType<typeof getWorldCup2026KnockoutLayout>["left"];

function WorldCupBracketSide({ side, align }: { side: SideLayout; align: "left" | "right" }) {
  return (
    <div className={cn("flex shrink-0 items-stretch", align === "right" && "flex-row-reverse")}>
      <BracketRoundColumn
        label="Round of 32"
        slots={side.roundOf32}
        align={align}
        showConnectors
      />
      <BracketRoundColumn
        label="Round of 16"
        slots={side.roundOf16}
        align={align}
        showConnectors
        compact
      />
      <BracketRoundColumn
        label="Quarter-finals"
        slots={side.quarterFinals}
        align={align}
        showConnectors
        compact
      />
      <BracketRoundColumn label="Semi-finals" slots={[side.semiFinal]} align={align} compact />
    </div>
  );
}

function CupBracketSide({ side, align }: { side: CupKnockoutSide; align: "left" | "right" }) {
  return (
    <div className={cn("flex shrink-0 items-stretch", align === "right" && "flex-row-reverse")}>
      {side.roundOf32.length > 0 ? (
        <BracketRoundColumn
          label="Round of 32"
          slots={side.roundOf32}
          align={align}
          showConnectors
        />
      ) : null}
      <BracketRoundColumn
        label="Round of 16"
        slots={side.roundOf16}
        align={align}
        showConnectors
        compact={side.roundOf32.length === 0}
      />
      <BracketRoundColumn
        label="Quarter-finals"
        slots={side.quarterFinals}
        align={align}
        showConnectors
        compact
      />
      <BracketRoundColumn label="Semi-finals" slots={[side.semiFinal]} align={align} compact />
    </div>
  );
}

function CupBracketCenter({
  final,
  leagueLogo,
  shortName,
}: {
  final: KnockoutScheduleSlot;
  leagueLogo?: string | null;
  shortName: string;
}) {
  return (
    <div className="flex w-[8.5rem] shrink-0 flex-col items-stretch justify-center px-0.5">
      <FinaleStageBlock stage="final" slot={final} />
      <div className="mt-2 flex flex-col items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-2 ring-1 ring-amber-500/20">
        {leagueLogo ? (
          <FootballLogo src={leagueLogo} label={shortName} size="md" className="!h-7 !w-7" />
        ) : null}
        <span className="text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-amber-950">
          Champion TBD
        </span>
      </div>
    </div>
  );
}

function WorldCupBracketCenter({
  bronze,
  final,
  leagueLogo,
}: {
  bronze: KnockoutScheduleSlot;
  final: KnockoutScheduleSlot;
  leagueLogo?: string | null;
}) {
  return (
    <div className="flex w-[8.5rem] shrink-0 flex-col items-stretch justify-center px-0.5">
      <FinaleStageBlock stage="bronze" slot={bronze} />
      <div className="mx-2 my-1.5 h-px bg-black/[0.08]" />
      <FinaleStageBlock stage="final" slot={final} />
      <div className="mt-2 flex flex-col items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-2 ring-1 ring-amber-500/20">
        {leagueLogo ? (
          <FootballLogo src={leagueLogo} label="World Cup" size="md" className="!h-7 !w-7" />
        ) : null}
        <span className="text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-amber-950">
          Champion TBD
        </span>
      </div>
    </div>
  );
}

function FinaleStageBlock({
  stage,
  slot,
}: {
  stage: Exclude<KnockoutStage, "default">;
  slot: KnockoutScheduleSlot;
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
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[0.5625rem] font-bold uppercase tracking-[0.08em] ring-1 ring-inset",
            meta.badgeClass,
          )}
        >
          <Icon className="h-2.5 w-2.5 shrink-0" aria-hidden />
          {meta.label}
        </span>
      </div>
      <div className="p-1.5">
        <ScheduledMatchCard slot={slot} stage={stage} wide />
      </div>
    </div>
  );
}

function BracketRoundColumn({
  label,
  slots,
  align,
  showConnectors = false,
  compact = false,
}: {
  label: string;
  slots: KnockoutScheduleSlot[];
  align: "left" | "right";
  showConnectors?: boolean;
  compact?: boolean;
}) {
  const groups: KnockoutScheduleSlot[][] = [];
  for (let index = 0; index < slots.length; index += 2) {
    groups.push(slots.slice(index, index + 2));
  }

  return (
    <div className={cn("flex w-[7.75rem] shrink-0 flex-col", align === "right" && "items-end")}>
      <p className="mb-1 w-full truncate text-center text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {label}
      </p>
      <div
        className={cn(
          "flex flex-1 flex-col justify-around",
          compact ? "gap-1 py-2" : "gap-0.5 py-0.5",
        )}
      >
        {groups.map((group) => (
          <div
            key={`${label}-${group.map((slot) => slot.id).join("-")}`}
            className={cn(
              "relative flex items-center",
              align === "right" && "flex-row-reverse",
            )}
          >
            <div className="flex flex-col gap-1">
              {group.map((slot) => (
                <ScheduledMatchCard key={slot.id} slot={slot} />
              ))}
            </div>
            {showConnectors && group.length === 2 ? (
              <BracketConnector align={align} tall={!compact} />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketConnector({ align, tall }: { align: "left" | "right"; tall?: boolean }) {
  return (
    <div
      className={cn("relative w-3 shrink-0", tall ? "h-12" : "h-9")}
      aria-hidden
    >
      <div
        className={cn(
          "absolute top-[20%] h-[60%] w-full border-neutral-300/90",
          align === "left"
            ? "rounded-r-sm border-r-2 border-t-2 border-b-2"
            : "rounded-l-sm border-l-2 border-t-2 border-b-2",
        )}
      />
    </div>
  );
}

function ScheduledMatchCard({
  slot,
  stage = "default",
  wide = false,
}: {
  slot: KnockoutScheduleSlot;
  stage?: KnockoutStage;
  wide?: boolean;
}) {
  const dateLabel = formatKnockoutMatchDate(slot.date);

  return (
    <div
      className={cn(
        leaguesGlassInset,
        knockoutMatchCardClass(stage, wide ? "w-full" : "w-[7.25rem]"),
        "p-1.5",
      )}
    >
      <div className="flex items-center justify-between gap-0.5">
        <span className="text-[0.5rem] font-semibold uppercase tracking-[0.06em] text-neutral-400">
          #{slot.matchNumber}
        </span>
        {slot.date ? (
          <time
            dateTime={slot.date}
            className="text-[0.5625rem] font-semibold leading-none tabular-nums text-sky-800"
          >
            {dateLabel}
          </time>
        ) : (
          <span className="text-[0.5625rem] font-semibold leading-none text-neutral-500">
            {dateLabel}
          </span>
        )}
      </div>
      <TbdTeamRow />
      <TbdTeamRow />
    </div>
  );
}

function TbdTeamRow() {
  return (
    <div className="mt-0.5 flex items-center gap-1 py-px">
      <span
        className="h-3 w-3 shrink-0 rounded-full bg-neutral-200/90 ring-1 ring-black/[0.04]"
        aria-hidden
      />
      <span className="h-1.5 flex-1 rounded bg-neutral-200/80" aria-hidden />
      <span className="w-2.5 text-center text-[0.5625rem] text-neutral-300">–</span>
    </div>
  );
}

function MobileBracketRound({
  title,
  slots,
  stage = "default",
}: {
  title: string;
  slots: KnockoutScheduleSlot[];
  stage?: KnockoutStage;
}) {
  const finaleMeta =
    stage === "bronze" || stage === "final" ? KNOCKOUT_STAGE_META[stage] : null;
  const Icon = finaleMeta?.Icon;

  return (
    <div className={cn(leaguesGlassInset, knockoutRoundShellClass(stage))}>
      <p className={knockoutRoundHeaderClass(stage)}>
        {Icon ? (
          <span className="inline-flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {title}
          </span>
        ) : (
          title
        )}
      </p>
      <div
        className={cn(
          "grid gap-2 p-2",
          stage === "default" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
        )}
      >
        {slots.map((slot) => (
          <ScheduledMatchCard key={slot.id} slot={slot} stage={stage} wide />
        ))}
      </div>
    </div>
  );
}
