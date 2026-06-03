"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { FootballLogo } from "@/components/overview/football-logo";
import { CountryFlag } from "@/components/players/country-flag";
import { MapSectionSkeleton } from "@/components/loading/route-skeletons";
import { leaguesGlassInset, leaguesGlassStrong } from "@/components/leagues/leagues-glass";
import type { LeagueProfile } from "@/lib/data/league-profile";
import {
  LEAGUE_REGION_LABELS,
  LEAGUE_TIER_LABELS,
} from "@/lib/data/league-profile";
import { getLeagueMapLocation } from "@/lib/football/league-country-map";
import { useFormatDateTime } from "@/lib/use-format-date-time";
import { cn } from "@/lib/utils";

const LeagueMapPane = dynamic(
  () =>
    import("@/components/leagues/league-map-pane").then((module) => ({
      default: module.LeagueMapPane,
    })),
  {
    ssr: false,
    loading: () => <MapSectionSkeleton variant="compact" className="absolute inset-0 rounded-none" />,
  },
);

type LeagueHeroProps = {
  league: LeagueProfile;
};

export function LeagueHero({ league }: LeagueHeroProps) {
  const { formatDateShort } = useFormatDateTime();
  const location = getLeagueMapLocation(league);

  return (
    <div className={cn(leaguesGlassStrong, "relative overflow-hidden")}>
      <div className="relative grid lg:grid-cols-[minmax(0,4fr)_minmax(0,1fr)]">
        <div className="relative z-[2] min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <FootballLogo
                src={league.logo}
                label={league.name}
                size="lg"
                className="h-12 w-12 sm:h-14 sm:w-14"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CountryFlag
                    key={league.id}
                    nationality={league.country}
                    src={league.countryFlag}
                    size="xs"
                  />
                  <span className="text-[0.8125rem] font-medium text-neutral-600">
                    {league.country}
                  </span>
                  <span className="text-neutral-300" aria-hidden>
                    ·
                  </span>
                  <span className="text-[0.8125rem] text-neutral-500">{league.season}</span>
                </div>
                <h2 className="mt-1 text-[clamp(1.375rem,3vw,1.875rem)] font-semibold leading-tight tracking-[-0.03em] text-neutral-950">
                  {league.name}
                </h2>
                <p className="mt-1 text-[0.875rem] text-neutral-600">
                  {league.teams} teams · Matchday {league.matchday}
                  {league.liveMatches > 0 ? (
                    <>
                      {" "}
                      ·{" "}
                      <span className="font-semibold text-emerald-700">
                        {league.liveMatches} live now
                      </span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={cn(
                  leaguesGlassInset,
                  "rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-600",
                )}
              >
                {LEAGUE_REGION_LABELS[league.region]}
              </span>
              <span
                className={cn(
                  leaguesGlassInset,
                  "rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-600",
                )}
              >
                {LEAGUE_TIER_LABELS[league.tier]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
            <HeroStat label="Teams" value={String(league.teams)} />
            <HeroStat label="Matchday" value={String(league.matchday)} />
            <HeroStat
              label="Updated"
              value={formatDateShort(new Date().toISOString())}
            />
          </div>
        </div>

        <div className="relative min-h-[min(28vw,128px)] lg:min-h-[220px]">
          <LeagueMapPane league={league} location={location} />

          <div
            className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-white/95 via-white/55 to-transparent lg:from-white/88 lg:via-white/35 lg:to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-8 bg-gradient-to-b from-white/50 to-transparent lg:hidden"
            aria-hidden
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-[3] flex justify-end px-2 lg:bottom-3 lg:px-3">
            <Link
              href="/"
              className="pointer-events-auto rounded-full bg-white/75 px-2 py-0.5 text-[0.625rem] font-medium text-neutral-600 backdrop-blur-sm transition-colors hover:bg-white/95 hover:text-neutral-900"
            >
              Global
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 text-center sm:px-5">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {label}
      </p>
      <p className="mt-0.5 text-[1rem] font-bold tabular-nums tracking-[-0.02em] text-neutral-950 sm:text-[1.0625rem]">
        {value}
      </p>
    </div>
  );
}
