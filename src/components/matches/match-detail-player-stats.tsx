import { FootballLogo } from "@/components/overview/football-logo";
import {
  LineupPositionBadge,
  LineupPositionLegend,
} from "@/components/matches/lineup-position-style";
import { leaguesGlass, leaguesGlassInset } from "@/components/leagues/leagues-glass";
import type { MatchDetailPlayerPerformance } from "@/lib/data/match-detail";
import { cn } from "@/lib/utils";

function PerformanceTable({
  team,
  logo,
  players,
}: {
  team: string;
  logo: string | null;
  players: MatchDetailPlayerPerformance[];
}) {
  if (players.length === 0) return null;

  return (
    <div className={cn(leaguesGlassInset, "overflow-hidden rounded-xl")}>
      <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 py-2.5">
        <FootballLogo src={logo} label={team} size="xs" />
        <p className="text-[0.8125rem] font-semibold text-neutral-950">{team}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-[0.75rem]">
          <thead>
            <tr className="border-b border-black/[0.06] text-[0.625rem] uppercase tracking-[0.08em] text-neutral-500">
              <th className="px-3 py-2 font-semibold">Player</th>
              <th className="px-2 py-2 font-semibold">Pos</th>
              <th className="px-2 py-2 font-semibold">Min</th>
              <th className="px-2 py-2 font-semibold">G</th>
              <th className="px-2 py-2 font-semibold">A</th>
              <th className="px-2 py-2 font-semibold">Sh</th>
              <th className="px-2 py-2 font-semibold">Ps</th>
              <th className="px-2 py-2 font-semibold">YC</th>
              <th className="px-2 py-2 font-semibold">RC</th>
              <th className="px-3 py-2 text-right font-semibold">Rating</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr
                key={`${player.id}-${index}`}
                className="border-b border-black/[0.04] last:border-0"
              >
                <td className="px-3 py-2 font-medium text-neutral-900">{player.name}</td>
                <td className="px-2 py-2">
                  <LineupPositionBadge position={player.position} />
                </td>
                <td className="px-2 py-2 tabular-nums text-neutral-600">{player.minutes ?? "—"}</td>
                <td className="px-2 py-2 tabular-nums text-neutral-600">{player.goals ?? "—"}</td>
                <td className="px-2 py-2 tabular-nums text-neutral-600">{player.assists ?? "—"}</td>
                <td className="px-2 py-2 tabular-nums text-neutral-600">
                  {player.shotsTotal ?? "—"}
                </td>
                <td className="px-2 py-2 tabular-nums text-neutral-600">
                  {player.passesTotal ?? "—"}
                </td>
                <td className="px-2 py-2 tabular-nums text-neutral-600">
                  {player.yellowCards ?? "—"}
                </td>
                <td className="px-2 py-2 tabular-nums text-neutral-600">
                  {player.redCards ?? "—"}
                </td>
                <td className="px-3 py-2 text-right font-bold tabular-nums text-neutral-900">
                  {player.rating ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MatchDetailPlayerStats({
  homeTeam,
  homeLogo,
  awayTeam,
  awayLogo,
  performances,
}: {
  homeTeam: string;
  homeLogo: string | null;
  awayTeam: string;
  awayLogo: string | null;
  performances: {
    home: MatchDetailPlayerPerformance[];
    away: MatchDetailPlayerPerformance[];
  };
}) {
  const hasHome = performances.home.length > 0;
  const hasAway = performances.away.length > 0;

  return (
    <section className={cn(leaguesGlass, "overflow-hidden")} aria-label="Player stats">
      <div className="space-y-4 p-5 sm:p-6">
        <div className="space-y-3">
          <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
            Player stats
          </h2>
          <LineupPositionLegend />
        </div>

        {!hasHome && !hasAway ? (
          <p className="py-6 text-center text-[0.875rem] text-neutral-500">
            Player statistics will appear after kickoff.
          </p>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {hasHome ? (
              <PerformanceTable team={homeTeam} logo={homeLogo} players={performances.home} />
            ) : null}
            {hasAway ? (
              <PerformanceTable team={awayTeam} logo={awayLogo} players={performances.away} />
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
