"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowLeftRight, ArrowUp } from "lucide-react";
import type {
  MatchDetailTimelineItem,
  MatchDetailTimelinePerson,
  MatchDetailTimelineView,
  MatchTimelineCheckpoint,
} from "@/lib/data/match-detail";
import { FootballIcon } from "@/components/icons/football-icon";
import { FootballLogo } from "@/components/overview/football-logo";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { leaguesGlassInset } from "@/components/leagues/leagues-glass";
import { cn } from "@/lib/utils";

function legendTeamClass(side: "home" | "away") {
  return side === "home" ? "font-semibold text-emerald-800" : "font-semibold text-sky-800";
}

const SPINE = "3.25rem";

type TeamSide = "home" | "away" | "neutral";

function teamStyles(team: TeamSide) {
  if (team === "home") {
    return {
      dot: "bg-emerald-500",
      minute: "text-emerald-800",
    };
  }
  if (team === "away") {
    return {
      dot: "bg-sky-500",
      minute: "text-sky-800",
    };
  }
  return {
    dot: "bg-neutral-400",
    minute: "text-neutral-500",
  };
}

function eventGlass(className?: string) {
  return cn(leaguesGlassInset, "max-w-[min(100%,14.5rem)] rounded-xl px-3 py-2.5", className);
}

function TimelineGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("grid items-start gap-x-1.5 sm:gap-x-2", className)}
      style={{
        gridTemplateColumns: `minmax(0, 1fr) ${SPINE} minmax(0, 1fr)`,
      }}
    >
      {children}
    </div>
  );
}

function CardIcon({ kind }: { kind: "yellow" | "red" }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-2.5 shrink-0 rounded-[2px]",
        kind === "red" ? "bg-red-500" : "bg-amber-400",
      )}
      aria-hidden
    />
  );
}

function EventBadge({ item }: { item: MatchDetailTimelineItem }) {
  if (item.type === "goal") {
    return (
      <span className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-emerald-700">
        <FootballIcon className="h-4 w-4" />
        Goal
      </span>
    );
  }
  if (item.type === "card") {
    const red = (item.cardKind ?? "yellow") === "red";
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[0.6875rem] font-semibold uppercase tracking-[0.05em]",
          red ? "text-red-600" : "text-amber-700",
        )}
      >
        <CardIcon kind={item.cardKind ?? "yellow"} />
        {red ? "Red" : "Yellow"}
      </span>
    );
  }
  if (item.type === "subst") {
    return (
      <span className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-neutral-600">
        <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        Sub
      </span>
    );
  }
  return null;
}

function SpineMinute({ minute, team }: { minute: string; team: TeamSide }) {
  const styles = teamStyles(team);
  return (
    <div className="flex flex-col items-center gap-1 pt-0.5">
      <span
        className={cn(
          "text-[0.75rem] font-bold tabular-nums leading-none",
          styles.minute,
        )}
      >
        {minute}
      </span>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", styles.dot)} aria-hidden />
    </div>
  );
}

function PersonLine({
  person,
  alignRight,
}: {
  person: MatchDetailTimelinePerson;
  alignRight: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        alignRight ? "flex-row-reverse" : "flex-row",
      )}
    >
      <PlayerAvatar src={person.photo} name={person.name} size="sm" className="!h-6 !w-6 !text-[0.5rem]" />
      <span className="truncate text-[0.875rem] font-medium leading-snug text-neutral-900">
        {person.name}
      </span>
    </div>
  );
}

function SubstRow({
  variant,
  person,
  alignRight,
}: {
  variant: "out" | "in";
  person: MatchDetailTimelinePerson;
  alignRight: boolean;
}) {
  const isOut = variant === "out";
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        alignRight ? "flex-row-reverse" : "flex-row",
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
          isOut ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600",
        )}
      >
        {isOut ? (
          <ArrowDown className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
        ) : (
          <ArrowUp className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
        )}
      </span>
      <PersonLine person={person} alignRight={alignRight} />
    </div>
  );
}

function SubstContent({
  item,
  alignRight,
}: {
  item: MatchDetailTimelineItem;
  alignRight: boolean;
}) {
  const subst = item.subst;
  if (!subst) {
    return (
      <p className="text-[0.875rem] font-medium text-neutral-900">{item.primary}</p>
    );
  }

  return (
    <div className="space-y-2.5">
      <SubstRow variant="out" person={subst.out} alignRight={alignRight} />
      <div className={cn("h-px bg-black/[0.04]", alignRight ? "mr-6" : "ml-6")} />
      <SubstRow variant="in" person={subst.in} alignRight={alignRight} />
    </div>
  );
}

function GoalContent({
  item,
  alignRight,
}: {
  item: MatchDetailTimelineItem;
  alignRight: boolean;
}) {
  const player = item.player ?? { name: item.primary, photo: null };

  return (
    <div className="space-y-1.5">
      <PersonLine person={player} alignRight={alignRight} />
      {item.assist ? (
        <div
          className={cn(
            "flex items-center gap-1.5 opacity-80",
            alignRight ? "flex-row-reverse justify-start" : "flex-row",
          )}
        >
          <PlayerAvatar
            src={item.assist.photo}
            name={item.assist.name}
            size="sm"
            className="!h-5 !w-5 !text-[0.45rem]"
          />
          <span className="text-[0.75rem] text-neutral-500">
            Assist · {item.assist.name}
          </span>
        </div>
      ) : item.secondary ? (
        <p
          className={cn(
            "text-[0.75rem] text-neutral-500",
            alignRight ? "text-right" : "text-left",
          )}
        >
          {item.secondary}
        </p>
      ) : null}
    </div>
  );
}

function EventCardHeader({
  item,
  alignRight,
}: {
  item: MatchDetailTimelineItem;
  alignRight: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-2 flex items-center gap-2",
        alignRight ? "flex-row-reverse justify-end" : "justify-start",
      )}
    >
      <EventBadge item={item} />
      {item.scoreAfter ? (
        <span className="rounded-md bg-black/[0.06] px-1.5 py-0.5 text-[0.75rem] font-bold tabular-nums text-neutral-900">
          {item.scoreAfter}
        </span>
      ) : null}
    </div>
  );
}

function EventCard({
  item,
  side,
}: {
  item: MatchDetailTimelineItem;
  side: "home" | "away";
}) {
  const alignRight = side === "home";

  return (
    <div className={eventGlass(alignRight ? "ml-auto" : "mr-auto")}>
      {item.type !== "info" ? (
        <EventCardHeader item={item} alignRight={alignRight} />
      ) : null}

      {item.type === "subst" ? (
        <SubstContent item={item} alignRight={alignRight} />
      ) : item.type === "goal" ? (
        <GoalContent item={item} alignRight={alignRight} />
      ) : item.type === "card" ? (
        <PersonLine
          person={item.player ?? { name: item.primary, photo: null }}
          alignRight={alignRight}
        />
      ) : (
        <p className="text-[0.875rem] font-medium text-neutral-900">{item.primary}</p>
      )}

      {item.type === "info" && item.secondary ? (
        <p className="mt-1 text-[0.75rem] text-neutral-500">{item.secondary}</p>
      ) : null}
    </div>
  );
}

function EventRow({ item }: { item: MatchDetailTimelineItem }) {
  const isHome = item.team === "home";
  const isAway = item.team === "away";
  const side: TeamSide = isHome ? "home" : isAway ? "away" : "neutral";

  return (
    <li className="list-none py-2">
      <TimelineGrid>
        <div className={cn("min-w-0 px-0.5 sm:px-1", !isHome && "aria-hidden")}>
          {isHome ? <EventCard item={item} side="home" /> : null}
        </div>

        <div className="flex justify-center">
          <SpineMinute minute={item.minute} team={side} />
        </div>

        <div className={cn("min-w-0 px-0.5 sm:px-1", !isAway && "aria-hidden")}>
          {isAway ? <EventCard item={item} side="away" /> : null}
        </div>
      </TimelineGrid>

      {side === "neutral" ? (
        <p className="mt-2 text-center text-[0.8125rem] text-neutral-500">{item.primary}</p>
      ) : null}
    </li>
  );
}

function CheckpointRow({ checkpoint }: { checkpoint: MatchTimelineCheckpoint }) {
  return (
    <li className="list-none py-4">
      <TimelineGrid className="items-center">
        <div />
        <div className="flex flex-col items-center gap-1">
          <span
            className={cn(
              leaguesGlassInset,
              "rounded-full px-3 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-neutral-600",
            )}
          >
            {checkpoint.label}
          </span>
          {checkpoint.score ? (
            <span className="text-[0.9375rem] font-bold tabular-nums text-neutral-950">
              {checkpoint.score}
            </span>
          ) : null}
        </div>
        <div />
      </TimelineGrid>
    </li>
  );
}

function TeamLegend({
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
}: {
  homeTeam: string;
  awayTeam: string;
  homeLogo: string | null;
  awayLogo: string | null;
}) {
  return (
    <div className={cn(leaguesGlassInset, "mb-4 rounded-xl px-3 py-2.5")}>
      <TimelineGrid className="items-center">
        <div className="flex min-w-0 items-center justify-end gap-2">
          <p className={cn("truncate text-right text-[0.875rem]", legendTeamClass("home"))}>
            {homeTeam}
          </p>
          <FootballLogo src={homeLogo} label={homeTeam} size="md" />
        </div>
        <span className="text-center text-[0.5625rem] font-medium uppercase tracking-[0.12em] text-neutral-400">
          vs
        </span>
        <div className="flex min-w-0 items-center gap-2">
          <FootballLogo src={awayLogo} label={awayTeam} size="md" />
          <p className={cn("truncate text-left text-[0.875rem]", legendTeamClass("away"))}>
            {awayTeam}
          </p>
        </div>
      </TimelineGrid>
    </div>
  );
}

export function MatchDetailTimeline({
  timeline,
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
}: {
  timeline: MatchDetailTimelineView;
  homeTeam?: string;
  awayTeam?: string;
  homeLogo?: string | null;
  awayLogo?: string | null;
}) {
  const { showKickoff, segments } = timeline;
  const penSegment = segments.find((segment) => segment.id === "penalties");
  const penCheckpoint = penSegment?.checkpoint;
  const hasContent = showKickoff || segments.length > 0;

  if (!hasContent) return null;

  const showLegend = Boolean(homeTeam && awayTeam);

  return (
    <section aria-label="Match timeline">
      <h2 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
        Timeline
      </h2>

      <div className="px-0.5 sm:px-1">
        {showLegend ? (
          <TeamLegend
            homeTeam={homeTeam!}
            awayTeam={awayTeam!}
            homeLogo={homeLogo ?? null}
            awayLogo={awayLogo ?? null}
          />
        ) : null}

        <div className="relative">
          <div
            className="pointer-events-none absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-black/[0.06]"
            aria-hidden
          />

          {showKickoff ? (
            <div className="mb-3">
              <TimelineGrid className="items-center">
                <div />
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className={cn(
                      leaguesGlassInset,
                      "rounded-full px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-neutral-600",
                    )}
                  >
                    KO
                  </span>
                  <span className="text-[0.625rem] text-neutral-400">Kickoff</span>
                </div>
                <div />
              </TimelineGrid>
            </div>
          ) : null}

          <ul className="list-none">
            {segments
              .filter((segment) => segment.id !== "penalties")
              .flatMap((segment) => [
                ...segment.events.map((event) => (
                  <EventRow key={event.id} item={event} />
                )),
                ...(segment.checkpoint
                  ? [
                      <CheckpointRow
                        key={`${segment.id}-checkpoint`}
                        checkpoint={segment.checkpoint}
                      />,
                    ]
                  : []),
              ])}

            {penCheckpoint ? (
              <CheckpointRow key="penalties-checkpoint" checkpoint={penCheckpoint} />
            ) : null}
          </ul>
        </div>
      </div>
    </section>
  );
}
