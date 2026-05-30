"use client";

import { FootballLogo } from "@/components/overview/football-logo";
import {
  leaguesGlass,
  leaguesGlassInset,
  leaguesGlassInsetBar,
  leaguesGlassStrong,
} from "@/components/leagues/leagues-glass";
import type { LeagueProfile, LeagueSeasonRecord } from "@/lib/data/league-profile";
import { cn } from "@/lib/utils";

type LeagueSeasonsPanelProps = {
  league: LeagueProfile;
  seasons: LeagueSeasonRecord[];
};

export function LeagueSeasonsPanel({ league, seasons }: LeagueSeasonsPanelProps) {
  const current = seasons.find((season) => season.isCurrent) ?? seasons[0];
  const history = seasons.filter((season) => !season.isCurrent);

  if (!current) {
    return null;
  }

  return (
    <div className="space-y-4">
      <section className={cn(leaguesGlassStrong, "overflow-hidden")}>
        <header
          className={cn(
            leaguesGlassInsetBar,
            "border-b border-black/[0.06] px-4 py-3 sm:px-5",
          )}
        >
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            Current season
          </p>
          <h2 className="mt-0.5 text-[clamp(1.25rem,2.5vw,1.625rem)] font-semibold tracking-[-0.03em] text-neutral-950">
            {current.label}
          </h2>
        </header>

        <div className="grid gap-px bg-black/[0.06] sm:grid-cols-2">
          <SeasonHighlight
            label="Title pace"
            value={current.champion}
            logo={current.championLogo}
            hint={`Leading ${league.shortName} after MD ${league.matchday}`}
          />
          <SeasonHighlight
            label="Golden boot"
            value={current.topScorer}
            hint={`${current.topScorerGoals} goals`}
          />
        </div>
      </section>

      <section className={cn(leaguesGlass, "overflow-hidden")}>
        <header
          className={cn(
            leaguesGlassInsetBar,
            "flex items-center justify-between border-b border-black/[0.06] px-4 py-3 sm:px-5",
          )}
        >
          <h2 className="text-[clamp(1.125rem,2.2vw,1.375rem)] font-semibold tracking-[-0.03em] text-neutral-950">
            History
          </h2>
          <span className="text-[0.8125rem] text-neutral-500">{history.length} seasons</span>
        </header>

        <ul className="divide-y divide-black/[0.06]">
          {history.map((season) => (
            <li
              key={season.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5"
            >
              <div>
                <p className="text-[0.9375rem] font-semibold text-neutral-950">{season.label}</p>
                <div className="mt-1 flex items-center gap-2">
                  <FootballLogo src={season.championLogo} label={season.champion} size="xs" />
                  <span className="text-[0.8125rem] text-neutral-600">{season.champion}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                  Top scorer
                </p>
                <p className="mt-0.5 text-[0.8125rem] font-medium text-neutral-800">
                  {season.topScorer}
                </p>
                <p className="text-[0.75rem] tabular-nums text-neutral-500">
                  {season.topScorerGoals} goals
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SeasonHighlight({
  label,
  value,
  logo,
  hint,
}: {
  label: string;
  value: string;
  logo?: string | null;
  hint: string;
}) {
  return (
    <div className="bg-white/20 px-4 py-4 sm:px-5">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {logo ? <FootballLogo src={logo} label={value} size="sm" /> : null}
        <p className="text-[1rem] font-semibold tracking-[-0.02em] text-neutral-950">{value}</p>
      </div>
      <p
        className={cn(
          leaguesGlassInset,
          "mt-2 inline-block rounded-full px-2 py-0.5 text-[0.75rem] text-neutral-600",
        )}
      >
        {hint}
      </p>
    </div>
  );
}
