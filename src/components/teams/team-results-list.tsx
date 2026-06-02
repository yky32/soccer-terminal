import Link from "next/link";
import { FootballLogo } from "@/components/overview/football-logo";
import { formatNewsTimestamp } from "@/lib/data/format-news-date";
import type { TeamMatchResult } from "@/lib/data/team-profile";
import { fixtureDetailHref } from "@/lib/match-paths";
import { cn } from "@/lib/utils";

type TeamResultsListProps = {
  results: TeamMatchResult[];
  teamName: string;
};

export function TeamResultsList({ results, teamName }: TeamResultsListProps) {
  if (results.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-[0.875rem] text-neutral-600 sm:px-5">
        No recent results available.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-black/[0.06]">
      {results.map((result) => (
        <li key={result.id}>
          <ResultRow result={result} teamName={teamName} />
        </li>
      ))}
    </ul>
  );
}

function ResultRow({ result, teamName }: { result: TeamMatchResult; teamName: string }) {
  const kickoff = new Date(result.kickoffAt);
  const teamWon =
    (result.isHome && result.homeScore > result.awayScore) ||
    (!result.isHome && result.awayScore > result.homeScore);
  const teamDraw = result.homeScore === result.awayScore;

  const detailHref = fixtureDetailHref(result);

  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          {result.matchday}
        </span>
        <time
          dateTime={result.kickoffAt}
          className="text-[0.75rem] font-medium tabular-nums text-neutral-600"
          title={formatNewsTimestamp(result.kickoffAt)}
        >
          {kickoff.toLocaleDateString([], { month: "short", day: "numeric" })}
        </time>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <FootballLogo src={result.homeLogo} label={result.homeTeam} size="sm" />
          <span
            className={cn(
              "truncate text-[0.8125rem] font-semibold",
              result.homeTeam === teamName ? "text-neutral-950" : "text-neutral-700",
            )}
          >
            {result.homeTeam}
          </span>
        </div>

        <span
          className={cn(
            "rounded-md px-2 py-1 text-[0.8125rem] font-bold tabular-nums",
            teamWon && "bg-emerald-500/10 text-emerald-900",
            teamDraw && "bg-neutral-500/10 text-neutral-700",
            !teamWon && !teamDraw && "bg-rose-500/10 text-rose-800",
          )}
        >
          {result.homeScore} – {result.awayScore}
        </span>

        <div className="flex min-w-0 items-center justify-end gap-2">
          <span
            className={cn(
              "truncate text-right text-[0.8125rem] font-semibold",
              result.awayTeam === teamName ? "text-neutral-950" : "text-neutral-700",
            )}
          >
            {result.awayTeam}
          </span>
          <FootballLogo src={result.awayLogo} label={result.awayTeam} size="sm" />
        </div>
      </div>
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
