import Link from "next/link";
import { FootballLogo } from "@/components/overview/football-logo";
import { LeagueIcon } from "@/components/leagues/league-icon";
import { leaguesGlass, leaguesGlassInset } from "@/components/leagues/leagues-glass";
import type {
  MatchDetail,
  MatchDetailFormMatch,
  MatchDetailH2HMatch,
} from "@/lib/data/match-detail";
import { fixtureDetailHref } from "@/lib/match-paths";
import { cn } from "@/lib/utils";

function kickoffShort(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function FormStrip({
  team,
  logo,
  matches,
}: {
  team: string;
  logo: string | null;
  matches: MatchDetailFormMatch[];
}) {
  if (matches.length === 0) return null;

  const resultClass: Record<MatchDetailFormMatch["result"], string> = {
    W: "bg-emerald-600 text-white",
    D: "bg-neutral-400 text-white",
    L: "bg-red-500/90 text-white",
  };

  return (
    <div className={cn(leaguesGlassInset, "rounded-xl p-3")}>
      <div className="mb-2 flex items-center gap-2">
        <FootballLogo src={logo} label={team} size="xs" />
        <p className="truncate text-[0.8125rem] font-semibold text-neutral-900">{team}</p>
        <span className="text-[0.625rem] font-medium uppercase tracking-[0.08em] text-neutral-400">
          Form
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {matches.map((row, index) => (
          <span
            key={`${row.id}-${index}`}
            title={`${row.isHome ? "vs" : "@"} ${row.opponent} ${row.goalsFor}–${row.goalsAgainst}`}
            className={cn(
              "flex h-6 min-w-[1.5rem] items-center justify-center rounded px-1.5 text-[0.6875rem] font-bold",
              resultClass[row.result],
            )}
          >
            {row.result}
          </span>
        ))}
      </div>
    </div>
  );
}

function H2HRow({ row }: { row: MatchDetailH2HMatch }) {
  const href = fixtureDetailHref({ id: String(row.id) });

  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <LeagueIcon league={{ logo: row.leagueLogo, name: row.league }} size="xs" />
          <p className="truncate text-[0.75rem] font-medium text-neutral-600">{row.league}</p>
        </div>
        <p className="shrink-0 text-[0.6875rem] tabular-nums text-neutral-400">
          {kickoffShort(row.date)}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <FootballLogo src={row.homeLogo} label={row.homeTeam} size="xs" />
          <span className="truncate text-[0.8125rem] font-semibold text-neutral-900">
            {row.homeTeam}
          </span>
        </div>
        <span className="rounded-md bg-neutral-100 px-2 py-1 text-[0.8125rem] font-bold tabular-nums text-neutral-900">
          {row.homeGoals}–{row.awayGoals}
        </span>
        <div className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate text-right text-[0.8125rem] font-semibold text-neutral-900">
            {row.awayTeam}
          </span>
          <FootballLogo src={row.awayLogo} label={row.awayTeam} size="xs" />
        </div>
      </div>
    </>
  );

  if (!href) {
    return <li className={cn(leaguesGlassInset, "rounded-xl px-3 py-3 sm:px-4")}>{content}</li>;
  }

  return (
    <li>
      <Link
        href={href}
        className={cn(
          leaguesGlassInset,
          "block rounded-xl px-3 py-3 transition-opacity hover:opacity-95 sm:px-4",
        )}
      >
        {content}
      </Link>
    </li>
  );
}

export function MatchDetailH2H({ detail }: { detail: MatchDetail }) {
  const { match, h2hSummary, headToHead, homeForm, awayForm } = detail;

  return (
    <div className="space-y-5">
      <div className={cn(leaguesGlassInset, "rounded-xl px-4 py-4 text-center")}>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
          Head-to-head
        </p>
        <p className="mt-2 text-[0.9375rem] font-medium text-neutral-800">
          <span className="font-semibold text-neutral-950">{match.homeTeam}</span>{" "}
          {h2hSummary.homeTeamWins} win{h2hSummary.homeTeamWins === 1 ? "" : "s"}
          <span className="mx-2 text-neutral-300">·</span>
          {h2hSummary.draws} draw{h2hSummary.draws === 1 ? "" : "s"}
          <span className="mx-2 text-neutral-300">·</span>
          <span className="font-semibold text-neutral-950">{match.awayTeam}</span>{" "}
          {h2hSummary.awayTeamWins} win{h2hSummary.awayTeamWins === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormStrip team={match.homeTeam} logo={match.homeLogo} matches={homeForm} />
        <FormStrip team={match.awayTeam} logo={match.awayLogo} matches={awayForm} />
      </div>

      {headToHead.length > 0 ? (
        <ul className="space-y-2">
          {headToHead.map((row, index) => (
            <H2HRow key={`${row.id}-${index}`} row={row} />
          ))}
        </ul>
      ) : (
        <div className={cn(leaguesGlass, "px-4 py-10 text-center")}>
          <p className="text-[0.875rem] text-neutral-500">No recent meetings on record.</p>
        </div>
      )}
    </div>
  );
}
