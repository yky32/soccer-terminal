import { FootballLogo } from "@/components/overview/football-logo";
import { formatNewsTimestamp } from "@/lib/data/format-news-date";
import type { LeagueFixture } from "@/lib/data/league-profile";
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
  const kickoff = new Date(fixture.kickoffAt);
  const isSoon = kickoff.getTime() - Date.now() < 24 * 3_600_000;

  return (
    <div className="px-4 py-3.5 sm:px-5">
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
          title={formatNewsTimestamp(fixture.kickoffAt)}
        >
          {kickoff.toLocaleString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <FootballLogo src={fixture.homeLogo} label={fixture.homeTeam} size="sm" />
          <span className="truncate text-[0.8125rem] font-semibold text-neutral-950">
            {fixture.homeTeam}
          </span>
        </div>
        <span className="rounded-md bg-neutral-900/5 px-2 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-neutral-500">
          vs
        </span>
        <div className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate text-right text-[0.8125rem] font-semibold text-neutral-950">
            {fixture.awayTeam}
          </span>
          <FootballLogo src={fixture.awayLogo} label={fixture.awayTeam} size="sm" />
        </div>
      </div>
    </div>
  );
}
