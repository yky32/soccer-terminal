"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStickyChromeHide } from "@/components/use-sticky-chrome";
import { NewsFeaturedGrid } from "@/components/news/news-featured-grid";
import { NewsFilterBar, type NewsCategoryFilter } from "@/components/news/news-filter-bar";
import { NewsLeagueRail } from "@/components/news/news-league-rail";
import { NewsSectionRenderer } from "@/components/news/news-sections";
import { NewsWireBootstrap } from "@/components/news/news-wire-bootstrap";
import { newsGlass, newsGlassSticky } from "@/components/news/news-glass";
import type { NewsArticle } from "@/lib/data/news-article";
import {
  buildNewsInsights,
  buildScopedCategoryCounts,
} from "@/lib/data/news-insights";
import {
  buildNewsPageSections,
  getNewsLayoutSeed,
} from "@/lib/data/news-page-layout";
import { newsArticleHref } from "@/lib/news-paths";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

type CategoryFilter = NewsCategoryFilter;

type NewsFeedProps = {
  articles: NewsArticle[];
  leagues: { name: string; count: number; logo: string | null }[];
};

const CATEGORY_FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "transfer", label: "Transfers" },
  { id: "match-report", label: "Reports" },
  { id: "preview", label: "Previews" },
  { id: "injury", label: "Injuries" },
  { id: "analysis", label: "Analysis" },
];

export function NewsFeed({ articles, leagues }: NewsFeedProps) {
  const router = useRouter();
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { isStuck: isFilterStuck, sentinelRef } = useStickyChromeHide();
  const filterRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (article: NewsArticle) => {
      router.push(newsArticleHref(article.id));
    },
    [router],
  );

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return articles.filter((article) => {
      const leagueMatch = selectedLeague === "all" || article.league === selectedLeague;
      const categoryMatch =
        selectedCategory === "all" || article.category === selectedCategory;
      const searchMatch =
        query.length === 0 ||
        article.headline.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.league.toLowerCase().includes(query);

      return leagueMatch && categoryMatch && searchMatch;
    });
  }, [articles, selectedCategory, selectedLeague, searchQuery]);

  const insights = useMemo(() => buildNewsInsights(articles), [articles]);

  const categoryCounts = useMemo(
    () => buildScopedCategoryCounts(articles, selectedLeague),
    [articles, selectedLeague],
  );

  const featuredLead =
    filtered.find((article) => article.featured) ?? filtered[0] ?? null;
  const featuredSecondary = featuredLead
    ? filtered.filter((article) => article.id !== featuredLead.id).slice(0, 4)
    : [];
  const featuredIds = useMemo(
    () =>
      new Set(
        [featuredLead?.id, ...featuredSecondary.map((article) => article.id)].filter(
          (id): id is string => Boolean(id),
        ),
      ),
    [featuredLead, featuredSecondary],
  );

  const timelineSource = useMemo(
    () => filtered.filter((article) => !featuredIds.has(article.id)),
    [filtered, featuredIds],
  );

  const layoutSeed = useMemo(() => getNewsLayoutSeed(filtered), [filtered]);
  const sections = useMemo(
    () => buildNewsPageSections(filtered, featuredIds, layoutSeed),
    [filtered, featuredIds, layoutSeed],
  );

  const tickerHeadlines = useMemo(() => articles.slice(0, 6), [articles]);

  const resetFilters = () => {
    setSelectedLeague("all");
    setSelectedCategory("all");
    setSearchQuery("");
    setVisibleCount(PAGE_SIZE);
  };

  const handleFilterChange = () => setVisibleCount(PAGE_SIZE);

  return (
    <>
      <NewsWireBootstrap headlines={tickerHeadlines} />
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />

      <div
        ref={filterRef}
        className={cn(
          "sticky z-40 transition-[top] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isFilterStuck ? "top-0" : "top-[7.75rem] md:top-[4.25rem]",
        )}
      >
        <div
          className={cn(
            "transition-[box-shadow,backdrop-filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isFilterStuck
              ? cn(newsGlassSticky, "border-x-0 border-t-0 border-b border-black/[0.08] py-0.5")
              : "border-b border-transparent",
          )}
        >
          <NewsFilterBar
            filteredCount={filtered.length}
            insights={insights}
            categoryCounts={categoryCounts}
            categories={CATEGORY_FILTERS}
            selectedCategory={selectedCategory}
            onCategoryChange={(category) => {
              setSelectedCategory(category);
              handleFilterChange();
            }}
            leagues={leagues}
            selectedLeague={selectedLeague}
            onLeagueChange={(league) => {
              setSelectedLeague(league);
              handleFilterChange();
            }}
            searchQuery={searchQuery}
            onSearchChange={(query) => {
              setSearchQuery(query);
              handleFilterChange();
            }}
            onReset={resetFilters}
            isStuck={isFilterStuck}
          />
        </div>
      </div>

      <NewsLeagueRail
        leagues={leagues}
        selectedLeague={selectedLeague}
        onLeagueSelect={(league) => {
          setSelectedLeague(league);
          setVisibleCount(PAGE_SIZE);
        }}
        className="-mt-0.5"
      />

      <section className="page-container pb-12 pt-2 sm:pb-16 sm:pt-3">
        {filtered.length === 0 ? (
          <div className={cn(newsGlass, "px-6 py-16 text-center")}>
            <p className="text-[1.125rem] font-semibold text-foreground">No headlines found</p>
            <p className="mt-2 text-[0.9375rem] text-muted">
              Try another filter or clear your search.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-[0.9375rem] font-medium text-background transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="min-w-0 space-y-6">
            {featuredLead ? (
              <NewsFeaturedGrid
                lead={featuredLead}
                secondary={featuredSecondary}
                onSelect={handleSelect}
              />
            ) : null}

            {sections.map((section) => (
              <NewsSectionRenderer
                key={section.id}
                section={section}
                onSelect={handleSelect}
                timelineSource={section.kind === "timeline" ? timelineSource : undefined}
                latestVisibleCount={section.kind === "latest" ? visibleCount : undefined}
                onLoadMore={
                  section.kind === "latest"
                    ? () => setVisibleCount((count) => count + PAGE_SIZE)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
