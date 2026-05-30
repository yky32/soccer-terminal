"use client";

import Link from "next/link";
import { ChevronRight } from "@/components/app-shell";
import { FootballLogo } from "@/components/overview/football-logo";
import { formatNewsRelativeTime } from "@/lib/data/format-news-date";
import type { NewsArticle } from "@/lib/data/news-article";
import { NewsCategoryBadge } from "@/components/news/news-shared";
import { cn } from "@/lib/utils";

type NewsSidebarProps = {
  breaking: NewsArticle[];
  leagues: { name: string; count: number; logo: string | null }[];
  selectedLeague: string;
  onLeagueSelect: (league: string) => void;
  onArticleSelect: (article: NewsArticle) => void;
  stickyTopPx?: number;
  className?: string;
};

export function NewsSidebar({
  breaking,
  leagues,
  selectedLeague,
  onLeagueSelect,
  onArticleSelect,
  stickyTopPx,
  className,
}: NewsSidebarProps) {
  const trending = leagues.slice(0, 6);

  return (
    <aside
      className={cn(
        "space-y-4 lg:sticky lg:self-start",
        stickyTopPx === undefined && "lg:top-[5.5rem]",
        className,
      )}
      style={stickyTopPx !== undefined ? { top: stickyTopPx } : undefined}
    >
      <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white/80 shadow-sm">
        <div className="border-b border-border bg-surface/80 px-4 py-3">
          <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-muted">
            Breaking
          </p>
        </div>
        <ul className="divide-y divide-border">
          {breaking.map((article) => (
            <li key={article.id}>
              <button
                type="button"
                onClick={() => onArticleSelect(article)}
                className="flex w-full gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface/60"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-foreground">
                    {article.headline}
                  </span>
                  <span className="mt-1.5 flex items-center gap-2">
                    <NewsCategoryBadge category={article.category} compact />
                    <time
                      dateTime={article.publishedAt}
                      className="text-[0.75rem] tabular-nums text-muted-light"
                    >
                      {formatNewsRelativeTime(article.publishedAt)}
                    </time>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white/80 shadow-sm">
        <div className="border-b border-border bg-surface/80 px-4 py-3">
          <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-muted">
            Trending leagues
          </p>
        </div>
        <ul className="p-2">
          {trending.map((league) => {
            const active = selectedLeague === league.name;

            return (
              <li key={league.name}>
                <button
                  type="button"
                  onClick={() => onLeagueSelect(league.name)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    active ? "bg-foreground text-background" : "hover:bg-surface/80",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <FootballLogo src={league.logo} label={league.name} size="sm" />
                    <span className="truncate text-[0.9375rem] font-medium">{league.name}</span>
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.75rem] tabular-nums",
                      active ? "bg-background/15" : "bg-surface text-muted",
                    )}
                  >
                    {league.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {selectedLeague !== "all" ? (
          <div className="border-t border-border px-4 py-3">
            <button
              type="button"
              onClick={() => onLeagueSelect("all")}
              className="text-[0.875rem] font-medium text-muted hover:text-foreground"
            >
              Clear league filter
            </button>
          </div>
        ) : null}
      </section>

      <Link
        href="/"
        className="group flex items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-surface px-4 py-4 shadow-sm transition-colors hover:bg-surface-hover"
      >
        <div>
          <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-muted">
            Global map
          </p>
          <p className="mt-1 text-[0.9375rem] font-semibold text-foreground">
            See live matches for this coverage
          </p>
        </div>
        <ChevronRight />
      </Link>
    </aside>
  );
}
