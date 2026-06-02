import { FootballLogo } from "@/components/overview/football-logo";
import { leaguesGlassInset } from "@/components/leagues/leagues-glass";
import type { MatchDetailInjury } from "@/lib/data/match-detail";
import { cn } from "@/lib/utils";

export function MatchDetailInjuries({ injuries }: { injuries: MatchDetailInjury[] }) {
  if (injuries.length === 0) return null;

  return (
    <section aria-label="Injuries and suspensions">
      <h2 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
        Unavailable
      </h2>
      <ul className={cn(leaguesGlassInset, "divide-y divide-black/[0.04] rounded-xl")}>
        {injuries.map((row) => (
          <li key={row.id} className="flex items-center gap-3 px-3 py-2.5">
            <FootballLogo src={row.playerPhoto} label={row.player} size="xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.8125rem] font-semibold text-neutral-950">
                {row.player}
              </p>
              <p className="truncate text-[0.75rem] text-neutral-500">
                {[row.type, row.reason].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <FootballLogo src={row.teamLogo} label={row.team} size="xs" />
              <span className="max-w-[5rem] truncate text-[0.6875rem] text-neutral-400">
                {row.team}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
