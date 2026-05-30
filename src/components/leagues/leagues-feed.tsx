"use client";

import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useStickyChromeHide } from "@/components/use-sticky-chrome";
import { FootballLogo } from "@/components/overview/football-logo";
import { LeagueFixturesList } from "@/components/leagues/league-fixtures-list";
import { LeagueStandingsTable } from "@/components/leagues/league-standings-table";
import {
  leaguesGlass,
  leaguesGlassEnter,
  leaguesGlassFocus,
  leaguesGlassHover,
  leaguesGlassInset,
  leaguesGlassInsetBar,
  leaguesGlassSticky,
  leaguesGlassStrong,
  leaguesGlassSubtle,
} from "@/components/leagues/leagues-glass";
import { formatNewsTimestamp } from "@/lib/data/format-news-date";
import type { LeagueProfile, LeagueRegion, LeagueTier } from "@/lib/data/league-profile";
import {
  LEAGUE_REGION_LABELS,
  LEAGUE_TIER_LABELS,
} from "@/lib/data/league-profile";
import { cn } from "@/lib/utils";

type LeaguesFeedProps = {
  leagues: LeagueProfile[];
};

const REGIONS: (LeagueRegion | "all")[] = [
  "all",
  "europe",
  "americas",
  "asia",
  "middle-east",
  "oceania",
];

const REGION_SHORT: Record<LeagueRegion | "all", string> = {
  all: "All",
  europe: "Europe",
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

export function LeaguesFeed({ leagues }: LeaguesFeedProps) {
  const [region, setRegion] = useState<LeagueRegion | "all">("all");
  const [tier, setTier] = useState<LeagueTier | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(leagues[0]?.id ?? "");
  const { isStuck: isRailStuck, sentinelRef } = useStickyChromeHide();

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
              onSelectLeague={setSelectedId}
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

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
                <section className={cn(leaguesGlass, "overflow-hidden")}>
                  <header className={cn(leaguesGlassInsetBar, "flex items-center justify-between border-b border-black/[0.06] px-4 py-3 sm:px-5")}>
                    <h2 className="text-[clamp(1.125rem,2.2vw,1.375rem)] font-semibold tracking-[-0.03em] text-neutral-950">
                      Standings
                    </h2>
                    <span className="text-[0.8125rem] text-neutral-500">Matchday {selected.matchday}</span>
                  </header>
                  <LeagueStandingsTable standings={selected.standings} />
                </section>

                <section className={cn(leaguesGlass, "overflow-hidden")}>
                  <header className={cn(leaguesGlassInsetBar, "flex items-center justify-between border-b border-black/[0.06] px-4 py-3 sm:px-5")}>
                    <h2 className="text-[clamp(1.125rem,2.2vw,1.375rem)] font-semibold tracking-[-0.03em] text-neutral-950">
                      Upcoming
                    </h2>
                    <span className="text-[0.8125rem] text-neutral-500">
                      {selected.fixtures.length} fixtures
                    </span>
                  </header>
                  <LeagueFixturesList fixtures={selected.fixtures} />
                </section>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/"
                  className={cn(leaguesGlass, leaguesGlassHover, leaguesGlassFocus, "block rounded-[1.25rem] px-5 py-4 text-[0.9375rem] font-semibold text-neutral-950")}
                >
                  Open Global map
                  <span className="mt-1 block text-[0.8125rem] font-normal text-neutral-600">
                    See live fixtures for {selected.country}
                  </span>
                </Link>
                <Link
                  href="/news"
                  className={cn(leaguesGlass, leaguesGlassHover, leaguesGlassFocus, "block rounded-[1.25rem] px-5 py-4 text-[0.9375rem] font-semibold text-neutral-950")}
                >
                  View {selected.shortName} headlines
                  <span className="mt-1 block text-[0.8125rem] font-normal text-neutral-600">
                    Wire coverage from the news desk
                  </span>
                </Link>
              </div>
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

function LeagueHero({ league }: { league: LeagueProfile }) {
  return (
    <div className={cn(leaguesGlassStrong, "overflow-hidden")}>
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <FootballLogo
            src={league.logo}
            label={league.name}
            size="lg"
            className="h-12 w-12 sm:h-14 sm:w-14"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <FootballLogo src={league.countryFlag} label={league.country} size="xs" />
              <span className="text-[0.8125rem] font-medium text-neutral-600">{league.country}</span>
              <span className="text-neutral-300" aria-hidden>
                ·
              </span>
              <span className="text-[0.8125rem] text-neutral-500">{league.season}</span>
            </div>
            <h2 className="mt-1 text-[clamp(1.375rem,3vw,1.875rem)] font-semibold leading-tight tracking-[-0.03em] text-neutral-950">
              {league.name}
            </h2>
            <p className="mt-1 text-[0.875rem] text-neutral-600">
              {league.teams} teams · Matchday {league.matchday}
              {league.liveMatches > 0 ? (
                <>
                  {" "}
                  ·{" "}
                  <span className="font-semibold text-emerald-700">
                    {league.liveMatches} live now
                  </span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={cn(leaguesGlassInset, "rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-600")}>
            {LEAGUE_REGION_LABELS[league.region]}
          </span>
          <span className={cn(leaguesGlassInset, "rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-600")}>
            {LEAGUE_TIER_LABELS[league.tier]}
          </span>
        </div>
      </div>

      <div className={cn(leaguesGlassInsetBar, "grid grid-cols-3 divide-x divide-black/[0.06] border-t border-black/[0.06]")}>
        <HeroStat label="Teams" value={String(league.teams)} />
        <HeroStat label="Matchday" value={String(league.matchday)} />
        <HeroStat
          label="Updated"
          value={formatNewsTimestamp(new Date().toISOString()).split(",")[0] ?? "Today"}
        />
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 text-center sm:px-5">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {label}
      </p>
      <p className="mt-0.5 text-[1rem] font-bold tabular-nums tracking-[-0.02em] text-neutral-950 sm:text-[1.0625rem]">
        {value}
      </p>
    </div>
  );
}
