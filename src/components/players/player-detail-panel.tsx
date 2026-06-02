"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowLeft, Clock, TrendingUp, Trophy } from "lucide-react";
import { LeagueIcon } from "@/components/leagues/league-icon";
import { CountryFlag } from "@/components/players/country-flag";
import {
  MatchContributionChart,
  MinutesChart,
  PassAccuracyGauge,
  RatingBarChart,
  StatBarChart,
  StatTile,
} from "@/components/players/player-charts";
import { DisciplineCards } from "@/components/players/discipline-cards";
import { PlayerHero } from "@/components/players/player-hero";
import { MatchRow, SpecBlock, SpecRow } from "@/components/players/player-data-display";
import { metricLabel, StatValue } from "@/components/players/player-metric";
import {
  leaguesGlass,
  leaguesGlassFocus,
  leaguesGlassInset,
} from "@/components/leagues/leagues-glass";
import type { PlayerProfile } from "@/lib/data/player-profile";
import { cn } from "@/lib/utils";

type PlayerDetailTab = "overview" | "stats" | "matches" | "performance";

type PlayerDetailPanelProps = {
  player: PlayerProfile;
};

const TABS: { id: PlayerDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "stats", label: "Stats" },
  { id: "matches", label: "Matches" },
  { id: "performance", label: "Performance" },
];

export function PlayerDetailPanel({ player }: PlayerDetailPanelProps) {
  const router = useRouter();
  const [tab, setTab] = useState<PlayerDetailTab>("overview");

  const lastFiveGoals = player.matchPerformances.reduce((sum, match) => sum + match.goals, 0);
  const lastFiveAssists = player.matchPerformances.reduce((sum, match) => sum + match.assists, 0);
  const lastFiveMinutes = player.matchPerformances.reduce((sum, match) => sum + match.minutes, 0);
  const avgRating =
    player.ratingTrend.reduce((sum, value) => sum + value, 0) /
    Math.max(player.ratingTrend.length, 1);

  const outputBars = [
    { label: "Goals", value: player.leagueStats.goals, max: 25 },
    { label: "Assists", value: player.leagueStats.assists, max: 15 },
    { label: "Shots", value: player.leagueStats.shots, max: 80 },
    { label: "Key passes", value: player.leagueStats.keyPasses, max: 50 },
    {
      label: "xG",
      value: player.leagueStats.xG,
      max: 15,
      display: player.leagueStats.xG.toFixed(1),
    },
  ];

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className={cn(
          leaguesGlassInset,
          leaguesGlassFocus,
          "inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-[0.8125rem] font-medium text-neutral-700 transition-colors hover:text-neutral-950",
        )}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        Back
      </button>

      <PlayerHero player={player} />

      <div
        className="flex gap-6 overflow-x-auto border-b border-black/[0.06] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label={`${player.name} sections`}
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "-mb-px shrink-0 border-b-2 pb-3 text-[0.875rem] font-medium transition-colors",
              tab === item.id
                ? "border-neutral-950 text-neutral-950"
                : "border-transparent text-neutral-500 hover:text-neutral-800",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className={cn(leaguesGlass, "overflow-hidden")}>
        <div className="p-5 sm:p-6">
          {tab === "overview" ? (
            <div className="space-y-8">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10">
                <SpecBlock
                  title="Profile"
                  meta={
                    <span className="inline-flex items-center gap-1.5">
                      <CountryFlag nationality={player.nationality} size="xs" />
                      {player.nationality}
                    </span>
                  }
                >
                  <SpecRow label="Height" value={String(player.body.heightCm)} unit="cm" />
                  <SpecRow label="Weight" value={String(player.body.weightKg)} unit="kg" />
                  <SpecRow label="Preferred foot" value={player.body.preferredFoot} />
                </SpecBlock>

                <SpecBlock
                  title="Season snapshot"
                  icon={Trophy}
                  meta={
                    <span className="inline-flex items-center gap-1.5">
                      <LeagueIcon league={player.league} size="xs" />
                      {player.league.shortName}
                    </span>
                  }
                >
                  <div className="grid grid-cols-2 gap-3">
                    <StatTile label="Goals" value={String(player.leagueStats.goals)} />
                    <StatTile label="Assists" value={String(player.leagueStats.assists)} />
                    <StatTile label="Rating" value={player.leagueStats.rating.toFixed(1)} />
                    <StatTile label="xG" value={player.leagueStats.xG.toFixed(1)} />
                  </div>
                  <div className="mt-5 border-t border-black/[0.04] pt-5">
                    <PassAccuracyGauge value={player.leagueStats.passAccuracy} />
                  </div>
                </SpecBlock>
              </div>

              <ChartPanel title="Rating form" icon={TrendingUp} meta="Last 5 matches">
                <RatingBarChart ratings={player.ratingTrend} />
              </ChartPanel>
            </div>
          ) : null}

          {tab === "stats" ? (
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
              <ChartPanel title="Season output" meta={player.league.season}>
                <StatBarChart items={outputBars} />
              </ChartPanel>

              <div className="space-y-8">
                <SpecBlock title="Playing time" icon={Clock} meta={player.league.season}>
                  <SpecRow label="Appearances" value={String(player.leagueStats.appearances)} />
                  <SpecRow
                    label="Starts"
                    value={`${player.leagueStats.starts} / ${player.leagueStats.appearances}`}
                    bar={
                      player.leagueStats.appearances > 0
                        ? Math.round(
                            (player.leagueStats.starts / player.leagueStats.appearances) * 100,
                          )
                        : 0
                    }
                  />
                  <SpecRow label="Minutes" value={String(player.leagueStats.minutes)} unit="'" />
                </SpecBlock>

                <SpecBlock title="Discipline">
                  <SpecRow label="Fouls" value={String(player.leagueStats.fouls)} />
                  <SpecRow
                    label="Cards"
                    valueNode={
                      <DisciplineCards
                        yellowCards={player.leagueStats.yellowCards}
                        redCards={player.leagueStats.redCards}
                      />
                    }
                  />
                </SpecBlock>
              </div>
            </div>
          ) : null}

          {tab === "matches" ? (
            <div className="space-y-8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.06] text-left">
                      <th className={cn("pb-2 pr-3", metricLabel.tick, "uppercase tracking-[0.06em]")}>
                        MD
                      </th>
                      <th className={cn("pb-2 pr-3", metricLabel.tick, "uppercase tracking-[0.06em]")}>
                        Opponent
                      </th>
                      <th
                        className={cn(
                          "hidden pb-2 pr-3 sm:table-cell",
                          metricLabel.tick,
                          "uppercase tracking-[0.06em]",
                        )}
                      >
                        Date
                      </th>
                      <th
                        className={cn(
                          "pb-2 pr-3 text-center",
                          metricLabel.tick,
                          "uppercase tracking-[0.06em]",
                        )}
                      >
                        G
                      </th>
                      <th
                        className={cn(
                          "pb-2 pr-3 text-center",
                          metricLabel.tick,
                          "uppercase tracking-[0.06em]",
                        )}
                      >
                        A
                      </th>
                      <th
                        className={cn(
                          "hidden pb-2 pr-3 text-center md:table-cell",
                          metricLabel.tick,
                          "uppercase tracking-[0.06em]",
                        )}
                      >
                        Min
                      </th>
                      <th className={cn("pb-2 text-right", metricLabel.tick, "uppercase tracking-[0.06em]")}>
                        Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {player.matchPerformances.map((match) => (
                      <MatchRow
                        key={match.id}
                        matchday={match.matchday}
                        date={match.date}
                        opponent={match.opponent}
                        opponentLogo={match.opponentLogo}
                        isHome={match.isHome}
                        goals={match.goals}
                        assists={match.assists}
                        minutes={match.minutes}
                        rating={match.rating}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <ChartPanel title="Match contributions" meta="Last 5 matches">
                <MatchContributionChart matches={player.matchPerformances} />
              </ChartPanel>
            </div>
          ) : null}

          {tab === "performance" ? (
            <div className="space-y-8">
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
                <ChartPanel title="Rating trend" icon={TrendingUp} meta="Last 5 matches">
                  <RatingBarChart ratings={player.ratingTrend} />
                </ChartPanel>
                <ChartPanel title="Minutes" meta="Last 5 matches">
                  <MinutesChart matches={player.matchPerformances} />
                </ChartPanel>
              </div>

              <ChartPanel title="Goals & assists" meta="Last 5 matches">
                <MatchContributionChart matches={player.matchPerformances} />
              </ChartPanel>

              <div className={cn(leaguesGlassInset, "rounded-xl p-4 sm:p-5")}>
                <p className={metricLabel.section}>Last 5 summary</p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <SummaryStat label="Avg rating" value={avgRating.toFixed(1)} />
                  <SummaryStat label="Goals" value={String(lastFiveGoals)} />
                  <SummaryStat label="Assists" value={String(lastFiveAssists)} />
                  <SummaryStat label="Minutes" value={String(lastFiveMinutes)} unit="'" />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ChartPanel({
  title,
  meta,
  icon: Icon,
  children,
}: {
  title: string;
  meta?: string;
  icon?: typeof TrendingUp;
  children: ReactNode;
}) {
  return (
    <div className={cn(leaguesGlassInset, "rounded-xl p-4 sm:p-5")}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-neutral-950">
          {Icon ? <Icon className="h-3.5 w-3.5 stroke-[1.75] text-neutral-400" aria-hidden /> : null}
          {title}
        </h3>
        {meta ? <span className="text-[0.8125rem] text-neutral-400">{meta}</span> : null}
      </div>
      {children}
    </div>
  );
}

function SummaryStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <p className={metricLabel.section}>{label}</p>
      <div className="mt-2">
        <StatValue size="headline" unit={unit}>
          {value}
        </StatValue>
      </div>
    </div>
  );
}
