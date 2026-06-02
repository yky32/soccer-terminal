"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
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
import { coerceMatchDetail } from "@/lib/football/match-detail-coerce";
import { cn } from "@/lib/utils";

const TABS: { id: MatchDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "lineup", label: "Lineups" },
  { id: "h2h", label: "Head-to-head" },
];

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

      <p className="mt-6 text-center text-[0.75rem] text-neutral-400">
        <Link href="/" className="underline-offset-2 hover:text-neutral-600 hover:underline">
          Return to global monitor
        </Link>
      </p>
    </div>
  );
}
