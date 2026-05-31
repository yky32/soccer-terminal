"use client";

import Link from "next/link";
import { FootballLogo } from "@/components/overview/football-logo";
import { LeagueIcon } from "@/components/leagues/league-icon";
import { CountryFlag } from "@/components/players/country-flag";
import { CurrencyFlag } from "@/components/players/currency-flag";
import { formatMarketValueEur } from "@/lib/data/currency-flag";
import { metricLabel, metricSize } from "@/components/players/player-metric";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { PlayerPitchPin } from "@/components/players/player-pitch-pin";
import {
  PositionIcon,
  resolvePositionKind,
} from "@/components/players/position-icon";
import { leaguesGlassStrong } from "@/components/leagues/leagues-glass";
import type { PlayerProfile } from "@/lib/data/player-profile";
import { teamHref } from "@/lib/team-paths";
import { cn } from "@/lib/utils";

type PlayerHeroProps = {
  player: PlayerProfile;
};

const HERO_STATS = [
  { key: "rating", label: "Rating", format: (p: PlayerProfile) => p.leagueStats.rating.toFixed(1) },
  { key: "goals", label: "Goals", format: (p: PlayerProfile) => String(p.leagueStats.goals) },
  { key: "assists", label: "Assists", format: (p: PlayerProfile) => String(p.leagueStats.assists) },
  { key: "apps", label: "Apps", format: (p: PlayerProfile) => String(p.leagueStats.appearances) },
] as const;

export function PlayerHero({ player }: PlayerHeroProps) {
  const positionKind = resolvePositionKind(player.position.primary, player.position.role);

  return (
    <div className={cn(leaguesGlassStrong, "relative overflow-hidden")}>
      <div className="relative grid lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:items-stretch">
        <div className="relative z-[2] flex min-w-0 flex-col">
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex min-w-0 items-start gap-4">
                <PlayerAvatar src={player.avatar} name={player.name} size="lg" />
                <div className="min-w-0 pt-0.5">
                  <Link
                    href="/leagues"
                    className="inline-flex items-center gap-1.5 text-[0.8125rem] text-neutral-500 transition-colors hover:text-neutral-800"
                  >
                    <LeagueIcon league={player.league} size="xs" />
                    {player.league.name}
                  </Link>
                  <h1 className="mt-1 text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-tight tracking-[-0.03em] text-neutral-950">
                    {player.name}
                  </h1>
                  <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875rem] text-neutral-600">
                    <Link
                      href={teamHref(player.league.id, player.teamSlug)}
                      className="inline-flex items-center gap-1.5 font-medium text-neutral-800 hover:text-neutral-950"
                    >
                      <FootballLogo src={player.teamLogo} label={player.team} size="xs" />
                      {player.team}
                    </Link>
                    <span className="text-neutral-300">·</span>
                    <span className="tabular-nums">#{player.number}</span>
                    <span className="text-neutral-300">·</span>
                    <span className="tabular-nums">{player.position.primary}</span>
                  </p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875rem] text-neutral-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CountryFlag nationality={player.nationality} size="sm" />
                      {player.nationality}
                    </span>
                    <span className="text-neutral-300">·</span>
                    <span>{player.age} yrs</span>
                    <span className="text-neutral-300">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      {positionKind ? (
                        <PositionIcon
                          primary={player.position.primary}
                          role={player.position.role}
                        />
                      ) : null}
                      {player.position.role}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={cn("inline-flex items-center justify-end gap-1.5", metricLabel.section)}>
                  <CurrencyFlag size="xs" />
                  Market value
                </p>
                <p className={cn("mt-1.5", metricSize.display)}>
                  {formatMarketValueEur(player.marketValueEur)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-4 border-t border-black/[0.06]">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.key}
                className="border-r border-black/[0.06] px-3 py-5 text-center last:border-r-0 sm:px-4"
              >
                <p className={metricSize.hero}>{stat.format(player)}</p>
                <p className={cn("mt-2", metricLabel.hero)}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[160px] overflow-hidden bg-gradient-to-br from-emerald-200/35 via-lime-50/20 to-transparent lg:min-h-0">
          <div
            className="pointer-events-none absolute -right-4 top-6 h-28 w-28 rounded-full bg-emerald-300/25 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-4 left-0 h-20 w-20 rounded-full bg-lime-300/30 blur-xl"
            aria-hidden
          />
          <PlayerPitchPin player={player} className="absolute inset-0" />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-12 bg-gradient-to-r from-white/85 to-transparent sm:w-16 lg:w-20"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-6 bg-gradient-to-b from-white/60 to-transparent lg:hidden"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
