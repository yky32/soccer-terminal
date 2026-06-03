"use client";

import Link from "next/link";
import { MirrorMatchScoreline } from "@/components/matches/mirror-match-scoreline";
import type { LeagueFixture } from "@/lib/data/league-profile";
import { fixtureDetailHref } from "@/lib/match-paths";
import { useFormatDateTime } from "@/lib/use-format-date-time";
import { cn } from "@/lib/utils";

type LeagueFixturesListProps = {
  fixtures: LeagueFixture[];
};

export function LeagueFixturesList({ fixtures }: LeagueFixturesListProps) {
  if (fixtures.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-[0.875rem] text-neutral-600 sm:px-5">
        No upcoming fixtures scheduled.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-black/[0.06]">
      {fixtures.map((fixture) => (
        <li key={fixture.id}>
          <FixtureRow fixture={fixture} />
        </li>
      ))}
    </ul>
  );
}

function FixtureRow({ fixture }: { fixture: LeagueFixture }) {
  const { formatKickoffFull, formatDateTimeTooltip } = useFormatDateTime();
  const kickoff = new Date(fixture.kickoffAt);
  const isSoon = kickoff.getTime() - Date.now() < 24 * 3_600_000;
  const detailHref = fixtureDetailHref(fixture);

  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          {fixture.matchday}
        </span>
        <time
          dateTime={fixture.kickoffAt}
          className={cn(
            "text-[0.75rem] font-medium tabular-nums",
            isSoon ? "text-sky-800" : "text-neutral-600",
          )}
          title={formatDateTimeTooltip(fixture.kickoffAt)}
        >
          {formatKickoffFull(fixture.kickoffAt)}
        </time>
      </div>

      <MirrorMatchScoreline
        className="mt-3"
        variant="default"
        homeTeam={fixture.homeTeam}
        awayTeam={fixture.awayTeam}
        homeLogo={fixture.homeLogo}
        awayLogo={fixture.awayLogo}
        upcoming
        centerContent={
          <span className="rounded-md bg-neutral-900/5 px-2 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-neutral-500">
            vs
          </span>
        }
      />
    </>
  );

  if (!detailHref) {
    return <div className="px-4 py-3.5 sm:px-5">{content}</div>;
  }

  return (
    <Link
      href={detailHref}
      className="block cursor-pointer px-4 py-3.5 transition-colors hover:bg-black/[0.03] sm:px-5"
    >
      {content}
    </Link>
  );
}
