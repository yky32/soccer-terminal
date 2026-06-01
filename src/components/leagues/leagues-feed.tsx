"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStickyChromeHide } from "@/components/use-sticky-chrome";
import { FootballLogo } from "@/components/overview/football-logo";
import { LeagueDetailPanel } from "@/components/leagues/league-detail-panel";
import { LeagueHero } from "@/components/leagues/league-hero";
import {
  leaguesGlass,
  leaguesGlassEnter,
  leaguesGlassFocus,
  leaguesGlassInset,
  leaguesGlassSticky,
  leaguesGlassSubtle,
} from "@/components/leagues/leagues-glass";
import type { LeagueProfile, LeagueRegion, LeagueTier } from "@/lib/data/league-profile";
import {
  LEAGUE_REGION_LABELS,
  LEAGUE_TIER_LABELS,
} from "@/lib/data/league-profile";
import type { NewsArticle } from "@/lib/data/news-article";
import { ENABLE_NEWS } from "@/lib/feature-flags";
import { FEATURED_LEAGUE_ID } from "@/lib/football/league-catalog";
import {
  readCachedLeagueProfile,
  writeCachedLeagueProfile,
} from "@/lib/football/local-league-cache";
import { apiRequest } from "@/lib/http/api-client";
import { cn } from "@/lib/utils";

type LeaguesFeedProps = {
  catalog: LeagueProfile[];
  initialLeague: LeagueProfile | null;
};

type LeagueApiResponse = LeagueProfile & { error?: string };

type NewsApiResponse = {
  articles: NewsArticle[];
  error?: string;
};

function isLeagueLoaded(league: LeagueProfile | undefined) {
  return Boolean(league && league.standings.length > 0);
}

const LEAGUE_LOCAL_TTL_MS = 30 * 60_000;

const REGIONS: (LeagueRegion | "all")[] = [
  "all",
  "europe",
  "world",
  "americas",
  "asia",
  "middle-east",
  "oceania",
];

const REGION_SHORT: Record<LeagueRegion | "all", string> = {
  all: "All",
  europe: "Europe",
  world: "World",
  americas: "Americas",
  asia: "Asia",
  "middle-east": "M.East",
  oceania: "Oceania",
};

const TIERS: (LeagueTier | "all")[] = ["all", "top-flight", "continental", "regional"];

const TIER_SHORT: Record<LeagueTier | "all", string> = {
  all: "All tiers",
  "top-flight": "Top",
  continental: "Continental",
  regional: "Regional",
};

export function LeaguesFeed({ catalog, initialLeague }: LeaguesFeedProps) {
  const [region, setRegion] = useState<LeagueRegion | "all">("all");
  const [tier, setTier] = useState<LeagueTier | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(
    initialLeague?.id ?? catalog[0]?.id ?? FEATURED_LEAGUE_ID,
  );
  const [profiles, setProfiles] = useState<Record<string, LeagueProfile>>(() => {
    if (!initialLeague) return {};
    return { [initialLeague.id]: initialLeague };
  });
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const loadedRef = useRef<Set<string>>(
    new Set(initialLeague ? [initialLeague.id] : []),
  );
  const { isStuck: isRailStuck, sentinelRef } = useStickyChromeHide();

  const leagues = useMemo(
    () => catalog.map((shell) => profiles[shell.id] ?? shell),
    [catalog, profiles],
  );

  const loadLeague = useCallback(async (leagueId: string) => {
    const cached = readCachedLeagueProfile(leagueId);
    const cachedFresh = cached ? Date.now() - cached.cachedAt < LEAGUE_LOCAL_TTL_MS : false;

    if (cached && isLeagueLoaded(cached.profile)) {
      // Instant render from local cache.
      setProfiles((current) => ({ ...current, [leagueId]: cached.profile }));
      loadedRef.current.add(leagueId);

      // If fresh, skip network; if stale, refresh silently in background.
      if (cachedFresh) return;
    } else if (loadedRef.current.has(leagueId)) {
      return;
    }

    setLoadingId(leagueId);
    try {
      const { data } = await apiRequest<LeagueApiResponse>({
        scope: "client",
        provider: "internal",
        method: "GET",
        url: `/api/leagues/${leagueId}`,
      });

      if (data.error || !isLeagueLoaded(data)) return;

      loadedRef.current.add(leagueId);
      setProfiles((current) => ({ ...current, [leagueId]: data }));
      writeCachedLeagueProfile(leagueId, data);
    } finally {
      setLoadingId((current) => (current === leagueId ? null : current));
    }
  }, []);

  const handleSelectLeague = useCallback(
    (leagueId: string) => {
      setSelectedId(leagueId);
      void loadLeague(leagueId);
    },
    [loadLeague],
  );

  useEffect(() => {
    if (!selectedId) return;
    void loadLeague(selectedId);
  }, [selectedId, loadLeague]);

  useEffect(() => {
    if (initialLeague && isLeagueLoaded(initialLeague)) {
      writeCachedLeagueProfile(initialLeague.id, initialLeague);
    }
  }, [initialLeague]);

  useEffect(() => {
    if (!ENABLE_NEWS) return;
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        const { data } = await apiRequest<NewsApiResponse>({
          scope: "client",
          provider: "internal",
          method: "GET",
          url: "/api/news",
        });

        if (!cancelled && !data.error) {
          setArticles(data.articles ?? []);
        }
      } catch {
        // News is optional on leagues — fail silently
      }
    }, 2_000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return leagues.filter((league) => {
      const regionMatch = region === "all" || league.region === region;
      const tierMatch = tier === "all" || league.tier === tier;
      const searchMatch =
        query.length === 0 ||
        league.name.toLowerCase().includes(query) ||
        league.country.toLowerCase().includes(query) ||
        league.shortName.toLowerCase().includes(query);

      return regionMatch && tierMatch && searchMatch;
    });
  }, [leagues, region, tier, searchQuery]);

  const selected =
    filtered.find((league) => league.id === selectedId) ?? filtered[0] ?? null;

  const hasActiveFilters = region !== "all" || tier !== "all" || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setRegion("all");
    setTier("all");
    setSearchQuery("");
    setSearchOpen(false);
    setScopeOpen(false);
  };

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />

      <div
        className={cn(
          "sticky z-40 transition-[top] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isRailStuck ? "top-0" : "top-[7.75rem] md:top-[4.25rem]",
        )}
      >
        <div
          className={cn(
            "transition-[box-shadow,backdrop-filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isRailStuck
              ? cn(leaguesGlassSticky, "border-x-0 border-t-0 border-b border-black/[0.08] py-0.5")
              : "border-b border-transparent",
          )}
        >
          <div className="page-container py-1 sm:py-1.5">
            <LeagueRail
              filtered={filtered}
              selected={selected}
              region={region}
              tier={tier}
              searchQuery={searchQuery}
              searchOpen={searchOpen}
              scopeOpen={scopeOpen}
              hasActiveFilters={hasActiveFilters}
              isStuck={isRailStuck}
              onRegionChange={setRegion}
              onTierChange={setTier}
              onSearchQueryChange={setSearchQuery}
              onSearchOpenChange={setSearchOpen}
              onScopeOpenChange={setScopeOpen}
              onSelectLeague={handleSelectLeague}
              onResetFilters={resetFilters}
            />
          </div>
        </div>
      </div>

      <div className="page-container space-y-4 pb-14 pt-2 sm:pb-16 sm:space-y-5">
      {filtered.length === 0 ? (
        <div className={cn(leaguesGlass, "px-6 py-16 text-center")}>
          <p className="text-[1.0625rem] font-semibold text-neutral-950">No leagues found</p>
          <p className="mt-2 text-[0.9375rem] text-neutral-600">Try another scope or search term.</p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className={cn(leaguesGlassInset, leaguesGlassFocus, "mt-5 px-4 py-2 text-[0.875rem] font-medium text-neutral-800")}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <>
          {selected ? (
            <div className={cn(leaguesGlassEnter, "space-y-4")}>
              <LeagueHero league={selected} />
              <LeagueDetailPanel
                league={selected}
                articles={articles}
                loading={loadingId === selected.id && !isLeagueLoaded(selected)}
              />
            </div>
          ) : null}
        </>
      )}
      </div>
    </>
  );
}

type LeagueRailProps = {
  filtered: LeagueProfile[];
  selected: LeagueProfile | null;
  region: LeagueRegion | "all";
  tier: LeagueTier | "all";
  searchQuery: string;
  searchOpen: boolean;
  scopeOpen: boolean;
  hasActiveFilters: boolean;
  isStuck: boolean;
  onRegionChange: (region: LeagueRegion | "all") => void;
  onTierChange: (tier: LeagueTier | "all") => void;
  onSearchQueryChange: (query: string) => void;
  onSearchOpenChange: (open: boolean) => void;
  onScopeOpenChange: (open: boolean) => void;
  onSelectLeague: (id: string) => void;
  onResetFilters: () => void;
};

function LeagueRail({
  filtered,
  selected,
  region,
  tier,
  searchQuery,
  searchOpen,
  scopeOpen,
  hasActiveFilters,
  isStuck,
  onRegionChange,
  onTierChange,
  onSearchQueryChange,
  onSearchOpenChange,
  onScopeOpenChange,
  onSelectLeague,
  onResetFilters,
}: LeagueRailProps) {
  return (
    <div className={cn(leaguesGlassSubtle, "overflow-hidden", isStuck ? "rounded-lg" : "rounded-xl")}>
      <div className="flex items-center gap-1.5 px-1.5 py-1 sm:px-2">
        <button
          type="button"
          onClick={() => onScopeOpenChange(!scopeOpen)}
          aria-expanded={scopeOpen}
          className={cn(
            leaguesGlassFocus,
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[0.75rem] font-medium transition-colors sm:px-2.5 sm:text-[0.8125rem]",
            scopeOpen || hasActiveFilters
              ? "bg-foreground text-background"
              : cn(leaguesGlassInset, "text-neutral-700 hover:text-neutral-950"),
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Scope</span>
          {hasActiveFilters && !scopeOpen ? (
            <span className="rounded-full bg-background/20 px-1.5 text-[0.625rem] font-bold">·</span>
          ) : null}
        </button>

        <div className="h-5 w-px shrink-0 bg-black/[0.08]" aria-hidden />

        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filtered.map((league) => (
            <LeaguePickerChip
              key={league.id}
              league={league}
              active={selected?.id === league.id}
              onClick={() => onSelectLeague(league.id)}
            />
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onResetFilters}
              className={cn(leaguesGlassFocus, "rounded-full p-1 text-neutral-500 hover:text-neutral-900")}
              aria-label="Clear filters"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onSearchOpenChange(!searchOpen)}
            aria-expanded={searchOpen}
            aria-label="Search leagues"
            className={cn(
              leaguesGlassFocus,
              "rounded-full p-1.5 transition-colors",
              searchOpen || searchQuery
                ? "bg-foreground text-background"
                : cn(leaguesGlassInset, "text-neutral-600 hover:text-neutral-950"),
            )}
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {scopeOpen ? (
        <div className="border-t border-black/[0.06] px-2 py-2 sm:px-3">
          <p className="mb-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
            Region
          </p>
          <div className="flex flex-wrap gap-1">
            {REGIONS.map((id) => (
              <ScopeChip
                key={id}
                label={REGION_SHORT[id]}
                title={LEAGUE_REGION_LABELS[id]}
                active={region === id}
                onClick={() => onRegionChange(id)}
              />
            ))}
          </div>
          <p className="mb-1.5 mt-2.5 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
            Tier
          </p>
          <div className="flex flex-wrap gap-1">
            {TIERS.map((id) => (
              <ScopeChip
                key={id}
                label={TIER_SHORT[id]}
                title={LEAGUE_TIER_LABELS[id]}
                active={tier === id}
                onClick={() => onTierChange(id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {searchOpen ? (
        <div
          className={cn(
            leaguesGlassInset,
            "mx-1.5 mb-1.5 flex items-center gap-2 rounded-lg px-2.5 py-1.5 sm:mx-2",
          )}
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search league or country…"
            className="min-w-0 flex-1 bg-transparent text-[0.8125rem] text-neutral-900 outline-none placeholder:text-neutral-400"
          />
        </div>
      ) : null}
    </div>
  );
}

function ScopeChip({
  label,
  title,
  active,
  onClick,
}: {
  label: string;
  title: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        leaguesGlassFocus,
        "rounded-full px-2 py-0.5 text-[0.75rem] font-medium transition-all active:scale-95 sm:px-2.5",
        active
          ? "bg-foreground text-background shadow-sm"
          : "bg-white/54 text-neutral-700 hover:bg-white/80 hover:text-neutral-950",
      )}
    >
      {label}
    </button>
  );
}

function LeaguePickerChip({
  league,
  active,
  onClick,
}: {
  league: LeagueProfile;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        leaguesGlassFocus,
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.8125rem] font-medium transition-all active:scale-95 sm:px-3",
        active
          ? "bg-foreground text-background shadow-sm"
          : "bg-white/48 text-neutral-700 hover:bg-white/72 hover:text-neutral-950",
      )}
    >
      <FootballLogo src={league.logo} label={league.name} size="xs" />
      <span>{league.shortName}</span>
      {league.liveMatches > 0 ? (
        <span
          className={cn(
            "rounded-full px-1.5 text-[0.625rem] font-bold tabular-nums",
            active ? "bg-background/15 text-background" : "bg-emerald-500/15 text-emerald-800",
          )}
        >
          {league.liveMatches} live
        </span>
      ) : null}
    </button>
  );
}
