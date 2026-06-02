import type { MatchDetailStat } from "@/lib/data/match-detail";
import { leaguesGlassInset } from "@/components/leagues/leagues-glass";
import { cn } from "@/lib/utils";

function StatBar({ stat }: { stat: MatchDetailStat }) {
  const home = stat.homeNumeric;
  const away = stat.awayNumeric;
  const total = home !== null && away !== null && home + away > 0 ? home + away : null;
  const homePct = total ? (home! / total) * 100 : 50;
  const awayPct = total ? 100 - homePct : 50;

  return (
    <div className={cn(leaguesGlassInset, "rounded-xl px-3 py-3 sm:px-4")}>
      <p className="text-center text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {stat.label}
      </p>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <p className="text-right text-[0.9375rem] font-bold tabular-nums text-neutral-950">
          {stat.home}
        </p>
        <span className="text-[0.625rem] text-neutral-300" aria-hidden>
          ·
        </span>
        <p className="text-left text-[0.9375rem] font-bold tabular-nums text-neutral-950">
          {stat.away}
        </p>
      </div>
      {total ? (
        <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-neutral-200/80">
          <div
            className="bg-emerald-600/80 transition-[width]"
            style={{ width: `${homePct}%` }}
          />
          <div
            className="bg-sky-600/80 transition-[width]"
            style={{ width: `${awayPct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function MatchDetailStats({ stats }: { stats: MatchDetailStat[] }) {
  if (stats.length === 0) return null;

  return (
    <section aria-label="Match statistics">
      <h2 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
        Match stats
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatBar key={stat.key} stat={stat} />
        ))}
      </div>
    </section>
  );
}
