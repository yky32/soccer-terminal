"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, LayoutGrid } from "lucide-react";
import { useState, type ReactNode } from "react";
import { LeagueIcon } from "@/components/leagues/league-icon";
import { MatchDetailH2H } from "@/components/matches/match-detail-h2h";
import { MatchDetailHero } from "@/components/matches/match-detail-hero";
import { MatchDetailInjuries } from "@/components/matches/match-detail-injuries";
import { MatchDetailLineups } from "@/components/matches/match-detail-lineups";
import { MatchDetailPlayerStats } from "@/components/matches/match-detail-player-stats";
import { MatchDetailStats } from "@/components/matches/match-detail-stats";
import { MatchDetailTimeline } from "@/components/matches/match-detail-timeline";
import {
  leaguesGlass,
  leaguesGlassFocus,
  leaguesGlassInset,
} from "@/components/leagues/leagues-glass";
import type { MatchDetail, MatchDetailTab } from "@/lib/data/match-detail";
import type { LiveMatch } from "@/lib/data/live-match";
import { coerceMatchDetail } from "@/lib/football/match-detail-coerce";
import { getCatalogEntryForApiLeague } from "@/lib/football/league-catalog";
import { cn } from "@/lib/utils";

const TABS: { id: MatchDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "lineup", label: "Lineups" },
  { id: "h2h", label: "Head-to-head" },
];

function ExploreLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        leaguesGlassFocus,
        "inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/55 px-3.5 py-2 text-[0.8125rem] font-medium text-neutral-700 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] transition-[background-color,border-color,color,transform] hover:border-black/[0.1] hover:bg-white/85 hover:text-neutral-950 active:scale-[0.98]",
      )}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-neutral-500 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      {label}
    </Link>
  );
}

function MatchDetailExploreNav({ match }: { match: LiveMatch }) {
  const league = getCatalogEntryForApiLeague(match.leagueId, match.league);

  return (
    <section
      className={cn(leaguesGlassInset, "mt-8 rounded-2xl px-4 py-4 sm:px-5 sm:py-5")}
      aria-label="Explore more"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
          Explore
        </p>
        <div className="flex flex-wrap gap-2">
          <ExploreLink href="/" label="Global map" icon={<Globe aria-hidden />} />
          {league ? (
            <ExploreLink
              href={`/leagues/${league.id}`}
              label={league.shortName}
              icon={
                <LeagueIcon
                  league={{ name: league.name, logo: league.logo ?? match.leagueLogo }}
                  size="xs"
                />
              }
            />
          ) : null}
          <ExploreLink href="/leagues" label="All leagues" icon={<LayoutGrid aria-hidden />} />
        </div>
      </div>
    </section>
  );
}

export function MatchDetailPanel({ detail: rawDetail }: { detail: MatchDetail }) {
  const router = useRouter();
  const [tab, setTab] = useState<MatchDetailTab>("overview");
  const detail = coerceMatchDetail(rawDetail);
  if (!detail) return null;

  const { match } = detail;

  return (
    <div className="page-container pb-14 pt-6 sm:pb-16 sm:pt-8">
      <button
        type="button"
        onClick={() => router.back()}
        className={cn(
          leaguesGlassInset,
          leaguesGlassFocus,
          "mb-6 inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-[0.8125rem] font-medium text-neutral-700 transition-colors hover:text-neutral-950",
        )}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        Back
      </button>

      <div className="space-y-6">
        <MatchDetailHero match={match} detail={detail} />

        <div
          className="flex gap-6 overflow-x-auto border-b border-black/[0.06] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Match detail sections"
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

        {tab === "lineup" ? (
          <div className="space-y-6">
            <MatchDetailLineups lineups={detail.lineups} timeline={detail.timeline} />
            <MatchDetailPlayerStats
              homeTeam={match.homeTeam}
              homeLogo={match.homeLogo}
              awayTeam={match.awayTeam}
              awayLogo={match.awayLogo}
              performances={detail.playerPerformances}
            />
          </div>
        ) : (
          <section className={cn(leaguesGlass, "overflow-hidden")}>
            <div className="space-y-6 p-5 sm:p-6">
              {tab === "overview" ? (
                <>
                  <MatchDetailTimeline
                    timeline={detail.timeline}
                    homeTeam={match.homeTeam}
                    awayTeam={match.awayTeam}
                    homeLogo={match.homeLogo}
                    awayLogo={match.awayLogo}
                  />
                  <MatchDetailStats stats={detail.statistics} />
                  <MatchDetailInjuries injuries={detail.injuries} />
                  {detail.statistics.length === 0 &&
                  detail.injuries.length === 0 &&
                  detail.timeline.segments.length === 0 &&
                  !detail.timeline.showKickoff ? (
                    <div className={cn(leaguesGlassInset, "rounded-xl px-4 py-10 text-center")}>
                      <p className="text-[0.875rem] text-neutral-500">
                        Match overview will populate when the fixture kicks off.
                      </p>
                    </div>
                  ) : null}
                </>
              ) : null}

              {tab === "h2h" ? <MatchDetailH2H detail={detail} /> : null}
            </div>
          </section>
        )}
      </div>

      <MatchDetailExploreNav match={match} />
    </div>
  );
}
