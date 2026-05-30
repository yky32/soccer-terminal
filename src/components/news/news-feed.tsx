"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAppChrome } from "@/components/app-chrome-context";
import { NewsFeaturedCard, NewsRowCard } from "@/components/news/news-card";
import { NewsFilterBar, type NewsCategoryFilter } from "@/components/news/news-filter-bar";
import { NewsReadDrawer } from "@/components/news/news-read-drawer";
import { NewsSidebar } from "@/components/news/news-sidebar";
import { NewsTicker } from "@/components/news/news-ticker";
import type { NewsArticle } from "@/lib/data/news-article";
import {
  buildNewsInsights,
  buildScopedCategoryCounts,
} from "@/lib/data/news-insights";
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
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [isFilterStuck, setIsFilterStuck] = useState(false);
  const [stickyFilterHeight, setStickyFilterHeight] = useState(0);
  const filterRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { setHeaderHidden } = useAppChrome();

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsFilterStuck(!entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setHeaderHidden(isFilterStuck);
    return () => setHeaderHidden(false);
  }, [isFilterStuck, setHeaderHidden]);

  useLayoutEffect(() => {
    const element = filterRef.current;
    if (!element) return;

    const update = () => setStickyFilterHeight(element.offsetHeight);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, [selectedCategory, selectedLeague, searchQuery, isFilterStuck]);

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

  const featured =
    filtered.find((article) => article.featured) ?? filtered[0] ?? null;
  const stream = filtered.filter((article) => article.id !== featured?.id);
  const visibleStream = stream.slice(0, visibleCount);
  const breaking = articles.slice(0, 4);
  const tickerHeadlines = articles.slice(0, 6);

  const resetFilters = () => {
    setSelectedLeague("all");
    setSelectedCategory("all");
    setSearchQuery("");
    setVisibleCount(PAGE_SIZE);
  };

  const handleFilterChange = () => setVisibleCount(PAGE_SIZE);

  return (
    <>
      <NewsTicker headlines={tickerHeadlines} />

      <div ref={sentinelRef} className="h-px w-full" aria-hidden />

      <div
        ref={filterRef}
        className={cn(
          "sticky z-40 border-b border-border bg-background/95 backdrop-blur-sm transition-[top,box-shadow] duration-200",
          isFilterStuck
            ? "top-0 shadow-sm"
            : "top-[7.75rem] shadow-none md:top-[4.25rem]",
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

      <section className="page-container pb-16 pt-8 sm:pb-24">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
            <p className="text-[1.125rem] font-semibold text-foreground">No headlines found</p>
            <p className="mt-2 text-[0.9375rem] text-muted">
              Try another filter or clear your search.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-[0.9375rem] font-medium text-background"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {featured ? (
              <NewsFeaturedCard article={featured} onSelect={setActiveArticle} />
            ) : null}

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-[1rem] font-semibold text-foreground">Latest</h2>
                  <p className="text-[0.8125rem] tabular-nums text-muted">
                    Showing {visibleStream.length} of {stream.length}
                  </p>
                </div>

                <div className="space-y-3">
                  {visibleStream.map((article, index) => (
                    <NewsRowCard
                      key={article.id}
                      article={article}
                      onSelect={setActiveArticle}
                      style={{ animationDelay: `${index * 40}ms` }}
                      className="opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards motion-reduce:animate-none motion-reduce:opacity-100"
                    />
                  ))}
                </div>

                {visibleCount < stream.length ? (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="mt-6 w-full rounded-xl border border-border bg-surface py-3 text-[0.9375rem] font-semibold text-foreground transition-colors hover:bg-surface-hover"
                  >
                    Load more headlines
                  </button>
                ) : null}
              </div>

              <NewsSidebar
                breaking={breaking}
                leagues={leagues}
                selectedLeague={selectedLeague}
                stickyTopPx={isFilterStuck ? stickyFilterHeight + 12 : undefined}
                onLeagueSelect={(league) => {
                  setSelectedLeague(league);
                  setVisibleCount(PAGE_SIZE);
                }}
                onArticleSelect={setActiveArticle}
                className="hidden lg:block"
              />
            </div>

            <NewsSidebar
              breaking={breaking}
              leagues={leagues}
              selectedLeague={selectedLeague}
              onLeagueSelect={(league) => {
                setSelectedLeague(league);
                setVisibleCount(PAGE_SIZE);
              }}
              onArticleSelect={setActiveArticle}
              className="lg:hidden"
            />
          </div>
        )}
      </section>

      <NewsReadDrawer article={activeArticle} onClose={() => setActiveArticle(null)} />
    </>
  );
}
