"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LeagueFixturesList } from "@/components/leagues/league-fixtures-list";
import { LeagueNewsPanel } from "@/components/leagues/league-news-panel";
import { LeagueKnockoutPanel } from "@/components/leagues/league-knockout-panel";
import { LeagueSeasonsPanel } from "@/components/leagues/league-seasons-panel";
import { LeagueStandingsTable } from "@/components/leagues/league-standings-table";
import { LeagueStatLeaderGrid } from "@/components/leagues/league-stat-leaders";
import { LeagueTeamsPanel } from "@/components/leagues/league-teams-panel";
import {
  leaguesGlass,
  leaguesGlassFocus,
  leaguesGlassHover,
  leaguesGlassInsetBar,
} from "@/components/leagues/leagues-glass";
import type { LeagueProfile } from "@/lib/data/league-profile";
import { getLeagueNewsLabel } from "@/lib/data/league-stats";
import type { NewsArticle } from "@/lib/data/news-article";
import { ENABLE_NEWS } from "@/lib/feature-flags";
import { cn } from "@/lib/utils";

type LeagueDetailTab = "overview" | "teams" | "seasons" | "knockout" | "news";

type LeagueDetailPanelProps = {
  league: LeagueProfile;
  articles: NewsArticle[];
  loading?: boolean;
};

const ALL_BASE_TABS: { id: LeagueDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "teams", label: "Teams" },
  { id: "seasons", label: "Seasons" },
  { id: "news", label: "News" },
];

const BASE_TABS = ALL_BASE_TABS.filter((tab) => ENABLE_NEWS || tab.id !== "news");

export function LeagueDetailPanel({ league, articles, loading = false }: LeagueDetailPanelProps) {
  const [tab, setTab] = useState<LeagueDetailTab>("overview");

  useEffect(() => {
    setTab("overview");
  }, [league.id]);

  const leagueBoards = league.leaderBoards ?? {
    players: { rating: [], goals: [], assists: [], fouls: [] },
    teamWinRates: [],
  };
  const seasons = league.seasonHistory ?? [];
  const hasKnockoutTab =
    league.competitionFormat === "tournament" || league.competitionFormat === "knockout-cup";
  const tabs = useMemo(() => {
    if (!hasKnockoutTab) return BASE_TABS;

    const withKnockout = [...BASE_TABS];
    withKnockout.splice(3, 0, { id: "knockout", label: "Knockout" });
    return withKnockout;
  }, [hasKnockoutTab]);
  const knockoutBracket = league.knockoutBracket ?? { published: false, rounds: [] };
  const newsLabel = getLeagueNewsLabel(league);
  const leagueNews = useMemo(() => {
    if (!ENABLE_NEWS) return [];
    return articles.filter((article) => article.league === newsLabel).slice(0, 8);
  }, [articles, newsLabel]);

  if (loading) {
    return <LeagueDetailSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          leaguesGlass,
          "flex gap-1 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
        role="tablist"
        aria-label={`${league.shortName} sections`}
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              leaguesGlassFocus,
              "shrink-0 rounded-full px-3.5 py-2 text-[0.8125rem] font-medium transition-colors sm:px-4",
              tab === item.id
                ? "bg-foreground text-background"
                : "text-neutral-700 hover:bg-white/50 hover:text-neutral-950",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="space-y-4">
          <LeagueStatLeaderGrid
            title="League leaders"
            subtitle={`${league.shortName} · ${league.season}`}
            boards={leagueBoards}
            leagueId={league.id}
          />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
            <section className={cn(leaguesGlass, "overflow-hidden")}>
              <SectionHeader
                title={
                  league.competitionFormat === "knockout-cup" ? "League phase" : "Standings"
                }
                meta={
                  league.competitionFormat === "knockout-cup"
                    ? `${league.standings.length} clubs`
                    : `Matchday ${league.matchday}`
                }
              />
              <LeagueStandingsTable standings={league.standings} leagueId={league.id} />
            </section>

            <section className={cn(leaguesGlass, "overflow-hidden")}>
              <SectionHeader title="Upcoming" meta={`${league.fixtures.length} fixtures`} />
              <LeagueFixturesList fixtures={league.fixtures} />
            </section>
          </div>

          <div className={cn("grid gap-3", ENABLE_NEWS ? "sm:grid-cols-2" : "")}>
            <QuickLink
              href="/"
              title="Open Global map"
              description={`See live fixtures for ${league.country}`}
            />
            {ENABLE_NEWS ? (
              <QuickLink
                href="/news"
                title={`View ${league.shortName} headlines`}
                description="Wire coverage from the news desk"
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "teams" ? <LeagueTeamsPanel league={league} /> : null}

      {tab === "seasons" ? <LeagueSeasonsPanel league={league} seasons={seasons} /> : null}

      {tab === "knockout" && hasKnockoutTab ? (
        <LeagueKnockoutPanel league={league} bracket={knockoutBracket} />
      ) : null}

      {ENABLE_NEWS && tab === "news" ? (
        <LeagueNewsPanel league={league} newsLabel={newsLabel} articles={leagueNews} />
      ) : null}
    </div>
  );
}

function SectionHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <header
      className={cn(
        leaguesGlassInsetBar,
        "flex items-center justify-between border-b border-black/[0.06] px-4 py-3 sm:px-5",
      )}
    >
      <h2 className="text-[clamp(1.125rem,2.2vw,1.375rem)] font-semibold tracking-[-0.03em] text-neutral-950">
        {title}
      </h2>
      <span className="text-[0.8125rem] text-neutral-500">{meta}</span>
    </header>
  );
}

function LeagueDetailSkeleton() {
  return (
    <div className={cn(leaguesGlass, "space-y-4 p-5")}>
      <div className="h-8 w-40 animate-pulse rounded-lg bg-black/[0.06]" />
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl bg-black/[0.05]" />
        <div className="h-64 animate-pulse rounded-xl bg-black/[0.05]" />
      </div>
      <p className="text-center text-[0.8125rem] text-neutral-500">Loading standings and fixtures…</p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        leaguesGlass,
        leaguesGlassHover,
        leaguesGlassFocus,
        "block rounded-[1.25rem] px-5 py-4 text-[0.9375rem] font-semibold text-neutral-950",
      )}
    >
      {title}
      <span className="mt-1 block text-[0.8125rem] font-normal text-neutral-600">{description}</span>
    </Link>
  );
}
