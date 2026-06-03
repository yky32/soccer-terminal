"use client";

import Link from "next/link";
import { MirrorMatchScoreline } from "@/components/matches/mirror-match-scoreline";
import type { TeamMatchResult } from "@/lib/data/team-profile";
import { fixtureDetailHref } from "@/lib/match-paths";
import { useFormatDateTime } from "@/lib/use-format-date-time";
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
  const { formatDateShort, formatDateTimeTooltip } = useFormatDateTime();
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
          title={formatDateTimeTooltip(result.kickoffAt)}
        >
          {formatDateShort(result.kickoffAt)}
        </time>
      </div>

      <MirrorMatchScoreline
        className="mt-3"
        variant="default"
        homeTeam={result.homeTeam}
        awayTeam={result.awayTeam}
        homeLogo={result.homeLogo}
        awayLogo={result.awayLogo}
        homeGoals={result.homeScore}
        awayGoals={result.awayScore}
        homeState={
          result.homeScore > result.awayScore
            ? "leading"
            : result.homeScore < result.awayScore
              ? "losing"
              : "draw"
        }
        awayState={
          result.awayScore > result.homeScore
            ? "leading"
            : result.awayScore < result.homeScore
              ? "losing"
              : "draw"
        }
        homeNameClassName={cn(
          result.homeTeam === teamName ? "font-semibold text-neutral-950" : "text-neutral-700",
        )}
        awayNameClassName={cn(
          result.awayTeam === teamName ? "font-semibold text-neutral-950" : "text-neutral-700",
        )}
        centerContent={
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
