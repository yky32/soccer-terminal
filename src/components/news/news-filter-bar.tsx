"use client";

import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { FootballLogo } from "@/components/overview/football-logo";
import { NEWS_CATEGORY_META, type NewsCategory } from "@/lib/data/news-article";
import type { NewsCategoryCounts, NewsCategoryFilter, NewsInsights } from "@/lib/data/news-insights";
import {
  buildInsightStats,
  getMatchSignal,
  INSIGHT_SIGNAL_STYLES,
} from "@/lib/data/news-insight-signals";
import {
  newsGlass,
  newsGlassInset,
  newsGlassStrong,
  newsGlassSubtle,
} from "@/components/news/news-glass";
import { cn } from "@/lib/utils";

type NewsFilterBarProps = {
  filteredCount: number;
  insights: NewsInsights;
  categoryCounts: NewsCategoryCounts;
  categories: { id: NewsCategoryFilter; label: string }[];
  selectedCategory: NewsCategoryFilter;
  onCategoryChange: (category: NewsCategoryFilter) => void;
  leagues: { name: string; count: number; logo: string | null }[];
  selectedLeague: string;
  onLeagueChange: (league: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  isStuck?: boolean;
};

export type { NewsCategoryFilter };

export function NewsFilterBar({
  filteredCount,
  insights,
  categoryCounts,
  categories,
  selectedCategory,
  onCategoryChange,
  leagues,
  selectedLeague,
  onLeagueChange,
  searchQuery,
  onSearchChange,
  onReset,
  isStuck = false,
}: NewsFilterBarProps) {
  const [leaguesOpen, setLeaguesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(Boolean(searchQuery));

  const hasActiveFilters =
    selectedCategory !== "all" || selectedLeague !== "all" || searchQuery.trim().length > 0;

  const activeLeague = leagues.find((league) => league.name === selectedLeague);

  const categoryLabel = useMemo(() => {
    if (selectedCategory === "all") return null;
    return NEWS_CATEGORY_META[selectedCategory].label;
  }, [selectedCategory]);

  const matchRate =
    insights.total > 0 ? Math.round((filteredCount / insights.total) * 100) : 0;

  const matchSignal = getMatchSignal(filteredCount, matchRate, hasActiveFilters);

  return (
    <div className="page-container py-2 sm:py-2.5">
      <NewsInsightStrip
        insights={insights}
        filteredCount={filteredCount}
        matchRate={matchRate}
        isStuck={isStuck}
        hasActiveFilters={hasActiveFilters}
      />

      <div
        className={cn(
          isStuck ? newsGlassSubtle : newsGlass,
          "flex items-center gap-2 rounded-2xl px-2 py-1.5 sm:gap-2.5 sm:px-2.5",
          isStuck && "rounded-xl py-1",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((filter) => {
            const active = selectedCategory === filter.id;
            const accent =
              filter.id !== "all" ? NEWS_CATEGORY_META[filter.id].badge : null;
            const count = categoryCounts[filter.id];

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onCategoryChange(filter.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.8125rem] font-medium transition-all duration-200 active:scale-95",
                  active
                    ? filter.id === "all"
                      ? "bg-foreground text-background shadow-sm"
                      : cn("ring-1 ring-inset shadow-sm", accent)
                    : cn(newsGlassInset, "text-foreground/75 hover:text-foreground"),
                )}
              >
                <span>{filter.label}</span>
                <span
                  className={cn(
                    "min-w-[1.125rem] rounded-full px-1 text-center text-[0.6875rem] font-semibold tabular-nums",
                    active
                      ? filter.id === "all"
                        ? "bg-background/15 text-background"
                        : "bg-background/60 text-inherit"
                      : "bg-surface text-muted-light",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {searchOpen ? (
            <div className={cn(newsGlassInset, "flex items-center gap-1 rounded-full pl-2.5 pr-1")}>
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-light" aria-hidden />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search…"
                autoFocus
                className="w-24 bg-transparent py-1 text-[0.8125rem] text-foreground outline-none placeholder:text-muted-light sm:w-36"
              />
              <button
                type="button"
                onClick={() => {
                  if (searchQuery) onSearchChange("");
                  else setSearchOpen(false);
                }}
                className="rounded-full p-1 text-muted-light hover:bg-background hover:text-foreground"
                aria-label={searchQuery ? "Clear search" : "Close search"}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={cn(
                "inline-flex items-center justify-center rounded-full border p-1.5 transition-all duration-200 active:scale-95",
                searchQuery
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : cn(newsGlassInset, "text-foreground/75 hover:text-foreground"),
              )}
              aria-label="Search headlines"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setLeaguesOpen((open) => !open)}
            aria-expanded={leaguesOpen}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.8125rem] font-medium transition-all duration-200 active:scale-95",
              leaguesOpen || selectedLeague !== "all"
                ? "border-foreground bg-foreground text-background shadow-sm"
                : cn(newsGlassInset, "text-foreground/75 hover:text-foreground"),
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">
              {selectedLeague === "all" ? "League" : activeLeague?.name ?? "League"}
            </span>
            <span
              className={cn(
                "rounded-full px-1.5 text-[0.6875rem] font-semibold tabular-nums",
                leaguesOpen || selectedLeague !== "all"
                  ? "bg-background/15"
                  : "bg-background text-muted-light",
              )}
            >
              {insights.leagueCount}
            </span>
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", leaguesOpen && "rotate-180")}
              aria-hidden
            />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin] duration-200 ease-out",
          leaguesOpen ? "mt-2 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className={cn(newsGlass, "flex flex-wrap gap-1.5 p-2")}>
            <LeagueOption
              label="All leagues"
              count={insights.total}
              active={selectedLeague === "all"}
              onClick={() => {
                onLeagueChange("all");
                setLeaguesOpen(false);
              }}
            />
            {leagues.map((league) => (
              <LeagueOption
                key={league.name}
                label={league.name}
                count={league.count}
                logo={league.logo}
                active={selectedLeague === league.name}
                onClick={() => {
                  onLeagueChange(league.name);
                  setLeaguesOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-3 transition-all duration-200",
          hasActiveFilters ? "mt-2 opacity-100" : "mt-0 h-0 overflow-hidden opacity-0",
          isStuck && hasActiveFilters && "mt-1.5",
        )}
      >
        <p className="min-w-0 truncate text-[0.75rem] text-muted">
          <span
            className={cn(
              "font-semibold tabular-nums",
              INSIGHT_SIGNAL_STYLES[matchSignal].text,
            )}
          >
            {filteredCount}
          </span>
          {" "}
          matched ·{" "}
          <span className={cn("font-medium tabular-nums", INSIGHT_SIGNAL_STYLES[matchSignal].text)}>
            {matchRate}%
          </span>{" "}
          of wire
          {categoryLabel ? (
            <>
              {" "}
              · <span className="text-foreground">{categoryLabel}</span>
            </>
          ) : null}
          {selectedLeague !== "all" ? (
            <>
              {" "}
              · <span className="text-foreground">{selectedLeague}</span>
            </>
          ) : null}
          {searchQuery.trim() ? (
            <>
              {" "}
              · &ldquo;{searchQuery.trim()}&rdquo;
            </>
          ) : null}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 text-[0.75rem] font-semibold text-muted underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

function NewsInsightStrip({
  insights,
  filteredCount,
  matchRate,
  isStuck,
  hasActiveFilters,
}: {
  insights: NewsInsights;
  filteredCount: number;
  matchRate: number;
  isStuck: boolean;
  hasActiveFilters: boolean;
}) {
  const stats = buildInsightStats(insights, filteredCount, matchRate, hasActiveFilters);

  return (
    <div
      className={cn(
        "mb-2 flex items-center gap-1 overflow-x-auto rounded-xl px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        newsGlassSubtle,
        isStuck && "mb-1.5 rounded-lg py-0.5",
      )}
    >
      {stats.map((stat) => {
        const styles = INSIGHT_SIGNAL_STYLES[stat.signal];

        return (
          <div
            key={stat.key}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1",
              styles.bg,
              styles.border,
            )}
            title={`${stat.hint} · ${styles.label}`}
          >
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className={cn("absolute inset-0 rounded-full", styles.dot)} aria-hidden />
              {stat.pulse ? (
                <span
                  className={cn("absolute inset-0 animate-ping rounded-full opacity-60", styles.dot)}
                  aria-hidden
                />
              ) : null}
            </span>
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-neutral-600">
              {stat.label}
            </span>
            <span className={cn("text-[0.9375rem] font-bold tabular-nums leading-none", styles.text)}>
              {stat.value}
            </span>
            {!isStuck ? (
              <span className={cn("hidden text-[0.6875rem] sm:inline", styles.text, "opacity-70")}>
                {stat.hint}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function LeagueOption({
  label,
  count,
  logo = null,
  active,
  onClick,
}: {
  label: string;
  count: number;
  logo?: string | null;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.8125rem] font-medium transition-all active:scale-95",
        active
          ? "bg-foreground text-background shadow-sm"
          : cn(newsGlassInset, "text-foreground/75 hover:text-foreground"),
      )}
    >
      {logo ? <FootballLogo src={logo} label={label} size="xs" /> : null}
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 text-[0.6875rem] tabular-nums",
          active ? "bg-background/15" : "bg-surface text-muted-light",
        )}
      >
        {count}
      </span>
    </button>
  );
}
