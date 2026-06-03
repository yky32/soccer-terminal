import Link from "next/link";
import { History, Swords, TrendingUp } from "lucide-react";
import { FootballLogo } from "@/components/overview/football-logo";
import { LeagueIcon } from "@/components/leagues/league-icon";
import { MirrorMatchScoreline } from "@/components/matches/mirror-match-scoreline";
import { MatchDetailSectionTitle } from "@/components/matches/match-detail-section-title";
import { leaguesGlassInset } from "@/components/leagues/leagues-glass";
import type {
  MatchDetail,
  MatchDetailFormMatch,
  MatchDetailH2HMatch,
} from "@/lib/data/match-detail";
import type { LiveMatch } from "@/lib/data/live-match";
import { fixtureDetailHref } from "@/lib/match-paths";
import { useFormatDateTime } from "@/lib/use-format-date-time";
import { cn } from "@/lib/utils";

function h2hBarPercents(homeWins: number, draws: number, awayWins: number) {
  const total = homeWins + draws + awayWins;
  if (total === 0) return { home: 33.33, draw: 33.34, away: 33.33 };
  return {
    home: (homeWins / total) * 100,
    draw: (draws / total) * 100,
    away: (awayWins / total) * 100,
  };
}

function SummaryStat({
  value,
  label,
  align = "center",
  className,
}: {
  value: number;
  label: string;
  align?: "left" | "center" | "right";
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className,
      )}
    >
      <p className="text-[1.75rem] font-bold tabular-nums leading-none text-neutral-950 sm:text-[2rem]">
        {value}
      </p>
      <p className="mt-1 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-neutral-400">
        {label}
      </p>
    </div>
  );
}

function H2HSummaryBar({
  match,
  homeWins,
  draws,
  awayWins,
}: {
  match: LiveMatch;
  homeWins: number;
  draws: number;
  awayWins: number;
}) {
  const bars = h2hBarPercents(homeWins, draws, awayWins);
  const total = homeWins + draws + awayWins;

  return (
    <div className={cn(leaguesGlassInset, "rounded-xl px-4 py-4 sm:px-5 sm:py-5")}>
      <MatchDetailSectionTitle icon={Swords}>Head-to-head</MatchDetailSectionTitle>

      {total === 0 ? (
        <p className="mt-4 text-[0.8125rem] text-neutral-500">
          No previous meetings between these sides.
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 sm:gap-x-5">
            <div className="flex min-w-0 items-center justify-end gap-2.5 sm:gap-3">
              <div className="min-w-0 text-right">
                <p className="truncate text-[0.75rem] font-semibold leading-tight text-emerald-900 sm:text-[0.8125rem]">
                  {match.homeTeam}
                </p>
                <SummaryStat
                  value={homeWins}
                  label={homeWins === 1 ? "Win" : "Wins"}
                  align="right"
                  className="mt-1.5"
                />
              </div>
              <FootballLogo
                src={match.homeLogo}
                label={match.homeTeam}
                size="md"
                className="!h-9 !w-9 shrink-0 rounded-full ring-1 ring-emerald-300/50 sm:!h-10 sm:!w-10"
              />
            </div>

            <SummaryStat
              value={draws}
              label={draws === 1 ? "Draw" : "Draws"}
              className="px-1 sm:px-2"
            />

            <div className="flex min-w-0 items-center justify-start gap-2.5 sm:gap-3">
              <FootballLogo
                src={match.awayLogo}
                label={match.awayTeam}
                size="md"
                className="!h-9 !w-9 shrink-0 rounded-full ring-1 ring-sky-300/50 sm:!h-10 sm:!w-10"
              />
              <div className="min-w-0 text-left">
                <p className="truncate text-[0.75rem] font-semibold leading-tight text-sky-900 sm:text-[0.8125rem]">
                  {match.awayTeam}
                </p>
                <SummaryStat
                  value={awayWins}
                  label={awayWins === 1 ? "Win" : "Wins"}
                  align="left"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-neutral-200/70">
            <div
              className="bg-emerald-500/85 transition-[width]"
              style={{ width: `${bars.home}%` }}
              title={`${match.homeTeam} wins`}
            />
            <div
              className="bg-neutral-400/70 transition-[width]"
              style={{ width: `${bars.draw}%` }}
              title="Draws"
            />
            <div
              className="bg-sky-500/85 transition-[width]"
              style={{ width: `${bars.away}%` }}
              title={`${match.awayTeam} wins`}
            />
          </div>
          <p className="mt-2 text-[0.6875rem] text-neutral-500">
            Last {total} meeting{total === 1 ? "" : "s"} between these teams
          </p>
        </>
      )}
    </div>
  );
}

function FormMatchChip({ row }: { row: MatchDetailFormMatch }) {
  const { formatDateMedium } = useFormatDateTime();
  const resultClass: Record<MatchDetailFormMatch["result"], string> = {
    W: "bg-emerald-500/15 text-emerald-800 ring-emerald-500/20",
    D: "bg-neutral-500/10 text-neutral-600 ring-neutral-400/15",
    L: "bg-rose-500/12 text-rose-800 ring-rose-400/20",
  };

  return (
    <div
      title={`${row.isHome ? "vs" : "@"} ${row.opponent} · ${row.goalsFor}–${row.goalsAgainst}${row.date ? ` · ${formatDateMedium(row.date)}` : ""}`}
      className={cn(
        leaguesGlassInset,
        "flex min-w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-xl px-2 py-2 text-center",
      )}
    >
      <FootballLogo src={row.opponentLogo} label={row.opponent} size="sm" className="!h-6 !w-6" />
      <p className="w-full truncate text-[0.625rem] font-medium text-neutral-600">
        {row.isHome ? "vs" : "@"} {row.opponent}
      </p>
      <span
        className={cn(
          "inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-[0.625rem] font-bold ring-1",
          resultClass[row.result],
        )}
      >
        {row.result}
      </span>
      <p className="text-[0.6875rem] font-semibold tabular-nums text-neutral-900">
        {row.goalsFor}–{row.goalsAgainst}
      </p>
    </div>
  );
}

function FormStrip({
  team,
  logo,
  side,
  matches,
}: {
  team: string;
  side: "home" | "away";
  logo: string | null;
  matches: MatchDetailFormMatch[];
}) {
  if (matches.length === 0) return null;

  const accent = side === "home" ? "text-emerald-800" : "text-sky-800";
  const ring = side === "home" ? "ring-emerald-300/40" : "ring-sky-300/40";

  return (
    <div className={cn(leaguesGlassInset, "rounded-xl p-3 sm:p-4")}>
      <div className="mb-3 flex items-center gap-2">
        <FootballLogo src={logo} label={team} size="sm" className={cn("rounded-full ring-1", ring)} />
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-[0.8125rem] font-semibold", accent)}>{team}</p>
          <p className="text-[0.625rem] font-medium uppercase tracking-[0.08em] text-neutral-400">
            Recent form
          </p>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {matches.map((row, index) => (
          <FormMatchChip key={`${row.id}-${index}`} row={row} />
        ))}
      </div>
    </div>
  );
}

function rowWinner(row: MatchDetailH2HMatch): "home" | "away" | "draw" {
  if (row.homeGoals > row.awayGoals) return "home";
  if (row.awayGoals > row.homeGoals) return "away";
  return "draw";
}

function h2hSideState(isWinner: boolean, isLoser: boolean): "leading" | "losing" | "draw" {
  if (isWinner) return "leading";
  if (isLoser) return "losing";
  return "draw";
}

function H2HRow({ row, contextMatch }: { row: MatchDetailH2HMatch; contextMatch: LiveMatch }) {
  const { formatDateMedium } = useFormatDateTime();
  const href = fixtureDetailHref({ id: String(row.id) });
  const winner = rowWinner(row);
  const homeWinner = winner === "home";
  const awayWinner = winner === "away";
  const isCurrentTeams =
    row.homeTeam === contextMatch.homeTeam && row.awayTeam === contextMatch.awayTeam;

  const content = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-black/[0.05] pb-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <LeagueIcon league={{ logo: row.leagueLogo, name: row.league }} size="xs" />
          <p className="truncate text-[0.6875rem] font-medium text-neutral-500">{row.league}</p>
        </div>
        <p className="shrink-0 text-[0.6875rem] tabular-nums text-neutral-400">
          {row.date ? formatDateMedium(row.date) : "—"}
        </p>
      </div>

      <MirrorMatchScoreline
        className="mt-3"
        variant="default"
        homeTeam={row.homeTeam}
        awayTeam={row.awayTeam}
        homeLogo={row.homeLogo}
        awayLogo={row.awayLogo}
        homeGoals={row.homeGoals}
        awayGoals={row.awayGoals}
        homeState={h2hSideState(homeWinner, awayWinner)}
        awayState={h2hSideState(awayWinner, homeWinner)}
        centerContent={
          <span
            className={cn(
              "inline-flex items-center gap-x-2 rounded-lg px-2.5 py-1 text-[0.8125rem] font-bold tabular-nums",
              winner === "draw"
                ? "bg-neutral-100 text-neutral-700 ring-1 ring-black/[0.06]"
                : "bg-neutral-950 text-white shadow-sm",
            )}
          >
            <span className={cn(homeWinner && "text-emerald-300", awayWinner && "text-neutral-500")}>
              {row.homeGoals}
            </span>
            <span className="font-normal text-neutral-400">–</span>
            <span className={cn(awayWinner && "text-sky-300", homeWinner && "text-neutral-500")}>
              {row.awayGoals}
            </span>
          </span>
        }
      />

      {isCurrentTeams ? (
        <p className="mt-2 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-neutral-400">
          Same fixture pairing
        </p>
      ) : null}
    </>
  );

  const cardClass = cn(
    leaguesGlassInset,
    "block rounded-xl px-3 py-3 transition-[opacity,transform,box-shadow] sm:px-4",
    href && "hover:opacity-[0.98] active:scale-[0.995]",
  );

  if (!href) {
    return <li className={cardClass}>{content}</li>;
  }

  return (
    <li>
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    </li>
  );
}

export function MatchDetailH2H({ detail }: { detail: MatchDetail }) {
  const { match, h2hSummary, headToHead, homeForm, awayForm } = detail;
  const hasForm = homeForm.length > 0 || awayForm.length > 0;

  return (
    <div className="space-y-5">
      <H2HSummaryBar
        match={match}
        homeWins={h2hSummary.homeTeamWins}
        draws={h2hSummary.draws}
        awayWins={h2hSummary.awayTeamWins}
      />

      {hasForm ? (
        <section aria-label="Recent form">
          <MatchDetailSectionTitle icon={TrendingUp} className="mb-3">
            Recent form
          </MatchDetailSectionTitle>
          <div className="grid gap-3 lg:grid-cols-2">
            <FormStrip team={match.homeTeam} logo={match.homeLogo} side="home" matches={homeForm} />
            <FormStrip team={match.awayTeam} logo={match.awayLogo} side="away" matches={awayForm} />
          </div>
        </section>
      ) : null}

      <section aria-label="Recent meetings">
        <MatchDetailSectionTitle icon={History} className="mb-3">
          Recent meetings
        </MatchDetailSectionTitle>

        {headToHead.length > 0 ? (
          <ul className="space-y-2">
            {headToHead.map((row, index) => (
              <H2HRow key={`${row.id}-${index}`} row={row} contextMatch={match} />
            ))}
          </ul>
        ) : (
          <div className={cn(leaguesGlassInset, "rounded-xl px-4 py-10 text-center")}>
            <p className="text-[0.875rem] text-neutral-500">No recent meetings on record.</p>
          </div>
        )}
      </section>
    </div>
  );
}
